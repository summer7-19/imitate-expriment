import type { FastifyInstance } from "fastify";
import type { Locale } from "@physchem/experiment-schema";
import { EXPERIMENT_METAS, getExperimentContent } from "@physchem/experiment-data";
import { db } from "../db/client";
import { quizAttempts } from "../db/schema";
import { randomUUID } from "node:crypto";

function parseLocale(raw: unknown): Locale {
  return raw === "en-US" ? "en-US" : "zh-CN";
}

export function registerExperimentRoutes(app: FastifyInstance): void {
  app.get<{ Querystring: { locale?: string } }>("/api/experiments", async (req) => {
    const locale = parseLocale(req.query.locale);
    return EXPERIMENT_METAS.map((meta) => ({
      meta,
      content: getExperimentContent(meta.id, locale),
    })).filter((b) => b.content !== undefined);
  });

  app.get<{ Params: { id: string }; Querystring: { locale?: string } }>(
    "/api/experiments/:id",
    async (req, reply) => {
      const locale = parseLocale(req.query.locale);
      const meta = EXPERIMENT_METAS.find((m) => m.id === req.params.id);
      const content = meta ? getExperimentContent(meta.id, locale) : undefined;
      if (!meta || !content) {
        return reply.code(404).send({ error: "实验不存在" });
      }
      return { meta, content };
    },
  );

  /** 测验记录（计分在客户端本地完成，这里只存档） */
  app.post<{
    Params: { id: string };
    Body: { score?: number; total?: number; locale?: string };
  }>("/api/quiz/:id/attempts", async (req, reply) => {
    const { score = 0, total = 0, locale = "zh-CN" } = req.body ?? {};
    const id = randomUUID();
    db.insert(quizAttempts)
      .values({
        id,
        experimentId: req.params.id,
        locale: locale === "en-US" ? "en-US" : "zh-CN",
        score: Math.max(0, Math.floor(score)),
        total: Math.max(0, Math.floor(total)),
        createdAt: new Date().toISOString(),
      })
      .run();
    return reply.code(201).send({ id });
  });
}
