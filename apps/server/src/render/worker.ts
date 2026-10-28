import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Locale, ParamValue } from "@physchem/experiment-schema";
import { BUNDLE_DIR, REMOTION_ENTRY, RENDER_DIR } from "../paths";

export interface RenderPayload {
  id: string;
  compositionId: string;
  inputProps: { locale: Locale; params: Record<string, ParamValue> };
  /** 仅渲染前 N 帧（冒烟测试用） */
  frames?: number;
}

type SendFn = (msg: unknown) => void;

/**
 * 渲染 worker：bundle() → selectComposition() → renderMedia()。
 * 默认以独立子进程运行（由 queue.ts fork）；并发压低防止无头 Chrome OOM。
 */
export async function runRender(payload: RenderPayload, send: SendFn): Promise<void> {
  const serveUrl = await ensureBundle();
  const base = await selectComposition({
    serveUrl,
    id: payload.compositionId,
    inputProps: payload.inputProps,
  });
  // 冒烟测试用：只渲染前 N 帧（直接裁短 composition，版本无关）
  const composition = payload.frames
    ? { ...base, durationInFrames: Math.min(payload.frames, base.durationInFrames) }
    : base;
  if (!existsSync(RENDER_DIR)) {
    mkdirSync(RENDER_DIR, { recursive: true });
  }
  const outputLocation = path.join(RENDER_DIR, `${payload.id}.mp4`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps: payload.inputProps,
    concurrency: Number(process.env.RENDER_CONCURRENCY ?? 2),
    onProgress: ({ progress }) => send({ type: "progress", progress }),
  });
  send({ type: "done" });
}

/**
 * bundle 缓存：按 Web 端源码（apps/web/src + packages）的 mtime 指纹判断是否需要重新打包。
 * webpack 打包耗时数十秒，不能每次任务都全量执行。
 */
async function ensureBundle(): Promise<string> {
  const marker = path.join(BUNDLE_DIR, ".ready");
  const stamp = sourceStamp();
  if (existsSync(marker) && readFileSync(marker, "utf8") === stamp) {
    return BUNDLE_DIR;
  }
  await bundle({
    entryPoint: REMOTION_ENTRY,
    outDir: BUNDLE_DIR,
    onProgress: () => undefined,
  });
  writeFileSync(marker, stamp);
  return BUNDLE_DIR;
}

function sourceStamp(): string {
  const webSrc = path.resolve(REMOTION_ENTRY, "../../.."); // apps/web/src
  const packages = path.resolve(webSrc, "../../packages");
  let acc = "";
  for (const dir of [webSrc, packages]) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir, { recursive: true });
    for (const f of files) {
      const full = path.join(dir, f.toString());
      try {
        const st = statSync(full);
        if (st.isFile()) acc += `${full}:${st.mtimeMs};`;
      } catch {
        // 跳过无法访问的文件
      }
    }
  }
  return acc;
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const payload = JSON.parse(process.env.RENDER_JOB ?? "{}") as RenderPayload;
  const send = (msg: unknown) => {
    try {
      process.send?.(msg);
    } catch {
      // IPC 通道关闭时忽略
    }
  };
  runRender(payload, send).catch((err) => {
    send({
      type: "error",
      message: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    });
    process.exitCode = 1;
  });
}
