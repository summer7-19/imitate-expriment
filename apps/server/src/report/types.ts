import type {
  CalculationStep,
  Locale,
  MeasurementRow,
  ParamValues,
} from "@physchem/experiment-schema";

/** 所有报告计算器的统一输出 */
export interface CalcResult {
  measurements: MeasurementRow[];
  calculations: CalculationStep[];
  errorAnalysis: string;
  conclusion: string;
  warnings: string[];
}

export interface CalculatorContext {
  locale: Locale;
  params: ParamValues;
  /** 确定性伪随机源（同参数同结果，报告可复现） */
  rng: () => number;
}

export type Calculator = (ctx: CalculatorContext) => CalcResult;

export const num = (p: ParamValues, key: string, fallback: number): number => {
  const v = Number(p[key]);
  return Number.isFinite(v) ? v : fallback;
};

export const relErr = (measured: number, truth: number) =>
  truth === 0 ? 0 : (Math.abs(measured - truth) / truth) * 100;

/** 最小二乘拟合 y = kx + b */
export function leastSquares(
  xs: number[],
  ys: number[],
): { slope: number; intercept: number } {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sum = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    sum += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : sum / den;
  return { slope, intercept: my - slope * mx };
}

/** 常用结论段落，避免各计算器重复拼中英文 */
export const conclusionText = (
  locale: Locale,
  zh: string,
  en: string,
): string => (locale === "en-US" ? en : zh);
