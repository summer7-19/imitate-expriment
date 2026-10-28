import type { ExperimentContent } from "./meta";
import type { NormalRange, ParamValue, ParamValues, ParameterDef } from "./params";

/** 从参数定义取默认值表 */
export function defaultParams(content: ExperimentContent): ParamValues {
  const values: ParamValues = {};
  for (const def of content.parameters) {
    values[def.id] = def.defaultValue;
  }
  return values;
}

/** 默认值 + 用户覆盖（浅合并） */
export function resolveParams(content: ExperimentContent, overrides?: ParamValues): ParamValues {
  return { ...defaultParams(content), ...(overrides ?? {}) };
}

export function paramDef(content: ExperimentContent, id: string): ParameterDef | undefined {
  return content.parameters.find((d) => d.id === id);
}

/** 数值参数按 step 的小数位数格式化，避免读数跳动 */
export function formatParamValue(def: ParameterDef, value: ParamValue): string {
  if (def.kind !== "slider" || typeof value !== "number") return String(value);
  const decimals = (String(def.step).split(".")[1] ?? "").length;
  return value.toFixed(decimals);
}

export interface NormalRangeCheck {
  range: NormalRange;
  value: ParamValue;
  ok: boolean;
}

/** 计算所有"正常范围"判定结果 */
export function evaluateNormalRanges(
  content: ExperimentContent,
  values: ParamValues,
): NormalRangeCheck[] {
  return content.normalRanges.map((range) => {
    const value = values[range.parameterId];
    const ok = typeof value === "number" && value >= range.min && value <= range.max;
    return { range, value, ok };
  });
}

/** 实验步骤的起始帧累计表（分镜脚本） */
export interface SceneStart {
  index: number;
  title: string;
  keyPoint: string;
  description: string;
  startFrame: number;
  durationFrames: number;
}

export function sceneStarts(content: ExperimentContent): SceneStart[] {
  let acc = 0;
  return content.steps.map((step) => {
    const scene = {
      index: step.index,
      title: step.title,
      keyPoint: step.keyPoint,
      description: step.description,
      startFrame: acc,
      durationFrames: step.durationFrames,
    };
    acc += step.durationFrames;
    return scene;
  });
}

/** 片尾声明占用帧数（3 秒 @30fps），Composition 总时长 = Σ步骤帧数 + DISCLAIMER_FRAMES */
export const DISCLAIMER_FRAMES = 90;
