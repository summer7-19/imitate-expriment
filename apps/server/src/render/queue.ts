import { fork, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { RenderJobRecord, RenderJobStatus } from "@physchem/experiment-schema";
import type { ParamValue } from "@physchem/experiment-schema";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { renderJobs } from "../db/schema";
import { SERVER_ROOT, WORKER_PATH } from "../paths";

type JobRow = typeof renderJobs.$inferSelect;

let running = false;

/** 启动时清理：上次进程遗留的 rendering 任务标记失败 */
function recoverStale(): void {
  const rows = db.select().from(renderJobs).all();
  for (const row of rows) {
    if (row.status === "rendering") {
      db.update(renderJobs)
        .set({ status: "failed", error: "服务重启，任务中断", finishedAt: new Date().toISOString() })
        .where(eq(renderJobs.id, row.id)).run();
    }
  }
}
recoverStale();

function toDto(row: JobRow): RenderJobRecord {
  return {
    id: row.id,
    experimentId: row.experimentId,
    compositionId: row.compositionId,
    status: row.status as RenderJobStatus,
    progress: row.progress,
    createdAt: row.createdAt,
    startedAt: row.startedAt ?? undefined,
    finishedAt: row.finishedAt ?? undefined,
    videoUrl: row.status === "completed" ? `/api/render/${row.id}/download` : undefined,
    error: row.error ?? undefined,
  };
}

export function listJobs(): RenderJobRecord[] {
  return db
    .select()
    .from(renderJobs)
    .all()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toDto);
}

export function getJob(id: string): RenderJobRecord | undefined {
  const rows = db.select().from(renderJobs).where(eq(renderJobs.id, id)).all();
  return rows[0] ? toDto(rows[0]) : undefined;
}

export interface CreateJobInput {
  experimentId: string;
  compositionId: string;
  locale: "zh-CN" | "en-US";
  params: Record<string, ParamValue>;
  frames?: number;
}

export function createJob(input: CreateJobInput): RenderJobRecord {
  const now = new Date().toISOString();
  const job: JobRow = {
    id: randomUUID(),
    experimentId: input.experimentId,
    compositionId: input.compositionId,
    status: "queued",
    progress: 0,
    inputProps: JSON.stringify({ locale: input.locale, params: input.params }),
    frames: input.frames ?? null,
    createdAt: now,
    startedAt: null,
    finishedAt: null,
    error: null,
  };
  db.insert(renderJobs).values(job).run();
  void pump();
  return toDto(job);
}

export function deleteJob(id: string): boolean {
  const rows = db.select().from(renderJobs).where(eq(renderJobs.id, id)).all();
  const row = rows[0];
  if (!row) return false;
  if (row.status === "rendering") {
    throw new Error("任务正在渲染，无法删除");
  }
  db.delete(renderJobs).where(eq(renderJobs.id, id)).run();
  return true;
}

/**
 * 顺序执行队列：renderMedia 长时间占用 CPU，放进独立子进程（Node ≥ 20 走 --import tsx）。
 * 状态与进度全部落 SQLite，服务重启后任务历史仍在。
 */
async function pump(): Promise<void> {
  if (running) return;
  const queued = db
    .select()
    .from(renderJobs)
    .all()
    .filter((r) => r.status === "queued")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const next = queued[0];
  if (!next) return;

  running = true;
  db.update(renderJobs)
    .set({ status: "rendering", startedAt: new Date().toISOString() })
    .where(eq(renderJobs.id, next.id)).run();

  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const execArgv = nodeMajor >= 20 ? ["--import", "tsx"] : ["--loader", "tsx"];

  let child: ChildProcess;
  try {
    child = fork(WORKER_PATH, [], {
      execArgv,
      cwd: SERVER_ROOT,
      env: {
        ...process.env,
        RENDER_JOB: JSON.stringify({
          id: next.id,
          compositionId: next.compositionId,
          inputProps: JSON.parse(next.inputProps),
          frames: next.frames ?? undefined,
        }),
      },
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    });
  } catch (err) {
    db.update(renderJobs)
      .set({
        status: "failed",
        error: `无法启动渲染子进程：${err instanceof Error ? err.message : String(err)}`,
        finishedAt: new Date().toISOString(),
      })
      .where(eq(renderJobs.id, next.id)).run();
    running = false;
    void pump();
    return;
  }

  const timeout = setTimeout(() => {
    child.kill("SIGKILL");
  }, 60 * 60 * 1000);

  child.on("message", (msg) => {
    const m = msg as { type?: string; progress?: number; message?: string };
    if (m?.type === "progress" && typeof m.progress === "number") {
      db.update(renderJobs)
        .set({ progress: Math.min(1, Math.max(0, m.progress)) })
        .where(eq(renderJobs.id, next.id)).run();
    } else if (m?.type === "done") {
      db.update(renderJobs)
        .set({ status: "completed", progress: 1, finishedAt: new Date().toISOString() })
        .where(eq(renderJobs.id, next.id)).run();
    } else if (m?.type === "error") {
      db.update(renderJobs)
        .set({
          status: "failed",
          error: (m.message ?? "渲染失败").slice(0, 500),
          finishedAt: new Date().toISOString(),
        })
        .where(eq(renderJobs.id, next.id)).run();
    }
  });

  child.on("close", (code) => {
    clearTimeout(timeout);
    const rows = db.select().from(renderJobs).where(eq(renderJobs.id, next.id)).all();
    if (rows[0]?.status === "rendering") {
      db.update(renderJobs)
        .set({
          status: "failed",
          error: `渲染子进程异常退出（code ${code}）`,
          finishedAt: new Date().toISOString(),
        })
        .where(eq(renderJobs.id, next.id)).run();
    }
    running = false;
    void pump();
  });
}
