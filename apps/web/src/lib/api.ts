import type {
  ExperimentContent,
  ExperimentMeta,
  ExperimentReport,
  Locale,
  ParamValues,
  RenderJobRecord,
  VirtualOperationPublic,
  VirtualOpsCheckInput,
  VirtualOpsCheckResult,
} from "@physchem/experiment-schema";

/** 开发环境经 Vite 代理转发到 127.0.0.1:3002，无需跨域配置 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`请求失败（${res.status}）${text ? `：${text}` : ""}`);
  }
  return (await res.json()) as T;
}

/* ---------- 实验元数据（服务端 SQLite 下发，前端不含虚拟操作答案） ---------- */

export interface ExperimentBundle {
  meta: ExperimentMeta;
  content: ExperimentContent;
}

export function fetchExperiments(locale: Locale): Promise<ExperimentBundle[]> {
  return request<ExperimentBundle[]>(`/api/experiments?locale=${locale}`);
}

export function fetchExperiment(id: string, locale: Locale): Promise<ExperimentBundle> {
  return request<ExperimentBundle>(`/api/experiments/${id}?locale=${locale}`);
}

/* ---------- 虚拟操作 ---------- */

export function fetchVirtualOps(experimentId: string): Promise<VirtualOperationPublic> {
  return request<VirtualOperationPublic>(`/api/virtual-ops/${experimentId}`);
}

export function checkVirtualOps(
  experimentId: string,
  input: VirtualOpsCheckInput,
): Promise<VirtualOpsCheckResult> {
  return request<VirtualOpsCheckResult>(`/api/virtual-ops/${experimentId}/check`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/* ---------- 实验报告（计算全部在服务端） ---------- */

export interface CreateReportInput {
  experimentId: string;
  locale: Locale;
  parameters: ParamValues;
}

export function createReport(input: CreateReportInput): Promise<ExperimentReport> {
  return request<ExperimentReport>("/api/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchReport(id: string): Promise<ExperimentReport> {
  return request<ExperimentReport>(`/api/reports/${id}`);
}

export function reportExportUrl(id: string): string {
  return `/api/reports/${id}/export?format=md`;
}

/* ---------- 渲染任务 ---------- */

export function listRenderJobs(): Promise<RenderJobRecord[]> {
  return request<RenderJobRecord[]>("/api/jobs");
}

export function createRenderJob(
  experimentId: string,
  locale: Locale,
  params: ParamValues,
): Promise<RenderJobRecord> {
  const body = {
    experimentId,
    inputProps: { locale, params },
  };
  return request<RenderJobRecord>("/api/render", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteRenderJob(id: string): Promise<void> {
  return request<void>(`/api/jobs/${id}`, { method: "DELETE" });
}

/* ---------- 工具 ---------- */

export function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}
