import type { ParamValue } from "./params";

export type RenderJobStatus = "queued" | "rendering" | "completed" | "failed";

/** 渲染任务记录：服务端返回 / 前端消费 */
export interface RenderJobRecord {
  id: string;
  experimentId: string;
  compositionId: string;
  status: RenderJobStatus;
  /** 0-1 */
  progress: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  /** 完成后可下载的相对地址，如 /api/render/:jobId/download */
  videoUrl?: string;
  error?: string;
}

/** POST /api/render 请求体 */
export interface CreateRenderJobInput {
  experimentId: string;
  inputProps: {
    locale?: "zh-CN" | "en-US";
    params: Record<string, ParamValue>;
  };
  /** 调试用：仅渲染前 N 帧 */
  frames?: number;
}

/** POST /api/render/batch 请求体 */
export interface BatchRenderInput {
  jobs: CreateRenderJobInput[];
}
