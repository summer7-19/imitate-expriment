export interface MeasurementRow {
  index: number;
  /** 各列测量值 */
  values: Record<string, number>;
  /** 各列单位 */
  unit: Record<string, string>;
}

export interface CalculationStep {
  label: string;
  /** LaTeX 公式（KaTeX 渲染） */
  formula: string;
  result: number;
  unit: string;
}

export interface ExperimentReport {
  id: string;
  experimentId: string;
  sessionId: string;
  locale: "zh-CN" | "en-US";
  createdAt: string;
  /** 用户设定参数 */
  parameters: Record<string, number | string | boolean>;
  /** 模拟测量数据表 */
  measurements: MeasurementRow[];
  /** 计算过程 */
  calculations: CalculationStep[];
  /** 误差分析文本（模板生成，服务端填充） */
  errorAnalysis: string;
  conclusion: string;
  /** 例如"偏离正常范围" */
  warnings: string[];
}

/** POST /api/reports 请求体 */
export interface CreateReportInput {
  experimentId: string;
  locale?: "zh-CN" | "en-US";
  parameters: Record<string, number | string | boolean>;
}
