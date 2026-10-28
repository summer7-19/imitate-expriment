import type { FastifyInstance } from "fastify";
import type { CreateRenderJobInput, ParamValue } from "@physchem/experiment-schema";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { EXPERIMENT_METAS } from "@physchem/experiment-data";
import { RENDER_DIR } from "../paths";
import { createJob, deleteJob, getJob, listJobs } from "../render/queue";

/** 创建渲染任务：{ experimentId, inputProps: { locale, params } } */
function parseCreateBody(body: CreateRenderJobInput | undefined): {
  ok: true;
  experimentId: string;
  compositionId: string;
  locale: "zh-CN" | "en-US";
  params: Record<string, ParamValue>;
  frames?: number;
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "请求体无效" };
  const meta = EXPERIMENT_METAS.find((m) => m.id === body.experimentId);
  if (!meta) return { ok: false, error: `未知的 experimentId：${body.experimentId}` };
  const params = body.inputProps?.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return { ok: false, error: "inputProps.params 必须是对象" };
  }
  for (const value of Object.values(params)) {
    const t = typeof value;
    if (t !== "number" && t !== "string" && t !== "boolean") {
      return { ok: false, error: "params 的值只能是 number / string / boolean" };
    }
  }
  const locale = body.inputProps?.locale === "en-US" ? "en-US" : "zh-CN";
  const frames =
    typeof body.frames === "number" && body.frames > 0 ? Math.floor(body.frames) : undefined;
  return {
    ok: true,
    experimentId: meta.id,
    compositionId: meta.compositionId,
    locale,
    params: params as Record<string, ParamValue>,
    frames,
  };
}

export function registerRenderRoutes(app: FastifyInstance): void {
  app.post("/api/render", async (req, reply) => {
    const parsed = parseCreateBody(req.body as CreateRenderJobInput);
    if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
    const job = createJob(parsed);
    return reply.code(201).send(job);
  });

  app.post<{ Body: { jobs?: CreateRenderJobInput[] } }>("/api/render/batch", async (req, reply) => {
    const jobs = Array.isArray(req.body?.jobs) ? req.body.jobs.slice(0, 20) : [];
    if (jobs.length === 0) return reply.code(400).send({ error: "jobs 不能为空" });
    const created = [];
    for (const body of jobs) {
      const parsed = parseCreateBody(body);
      if (!parsed.ok) return reply.code(400).send({ error: parsed.error });
      created.push(createJob(parsed));
    }
    return reply.code(201).send(created);
  });

  /** 兼容 v1 的列表端点 + v2 规范的 GET /api/render/:jobId */
  app.get("/api/jobs", async () => listJobs());

  app.get<{ Params: { id: string } }>("/api/render/:id", async (req, reply) => {
    const job = getJob(req.params.id);
    if (!job) return reply.code(404).send({ error: "任务不存在" });
    return job;
  });

  app.get<{ Params: { id: string } }>("/api/render/:id/download", async (req, reply) => {
    const job = getJob(req.params.id);
    if (!job) return reply.code(404).send({ error: "任务不存在" });
    if (job.status !== "completed") return reply.code(409).send({ error: "任务尚未完成" });
    const file = path.join(RENDER_DIR, `${job.id}.mp4`);
    if (!existsSync(file)) return reply.code(404).send({ error: "成片文件不存在" });
    const size = statSync(file).size;
    reply.header("Content-Type", "video/mp4");
    reply.header("Content-Length", size);
    reply.header("Content-Disposition", `attachment; filename="${job.experimentId}-${job.id.slice(0, 8)}.mp4"`);
    return createReadStream(file);
  });

  app.delete<{ Params: { id: string } }>("/api/jobs/:id", async (req, reply) => {
    try {
      const ok = deleteJob(req.params.id);
      if (!ok) return reply.code(404).send({ error: "任务不存在" });
      return { ok: true };
    } catch (err) {
      return reply.code(409).send({ error: err instanceof Error ? err.message : "无法删除任务" });
    }
  });
}
