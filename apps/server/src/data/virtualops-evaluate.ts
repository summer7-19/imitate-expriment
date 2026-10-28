import type { Locale, VirtualOperation } from "@physchem/experiment-schema";

export interface CheckpointEvaluation {
  passed: boolean;
  feedbackKey: string;
}

type ConditionFn = (
  state: Record<string, number | string | boolean>,
) => { passed: boolean };

/** 检查点判定条件（服务端实现，前端不可见） */
const CONDITIONS: Record<string, ConditionFn> = {
  // 酸碱滴定：终点过冲 ≤ 0.2 mL（浅粉色停止）
  "endpoint-tolerance": (state) => {
    const delivered = Number(state.deliveredMl ?? NaN);
    const endpoint = Number(state.endpointMl ?? NaN);
    return { passed: Math.abs(delivered - endpoint) <= 0.2 };
  },
  // 双缝：记录的条纹间距与公式值相对偏差 ≤ 5%
  "fringe-tolerance": (state) => {
    const measured = Number(state.dyMeasured ?? NaN);
    const expected = Number(state.dyExpected ?? NaN);
    if (!Number.isFinite(measured) || !Number.isFinite(expected) || expected <= 0) {
      return { passed: false };
    }
    return { passed: Math.abs(measured - expected) / expected <= 0.05 };
  },
  // 电导滴定：谷底体积相对偏差 ≤ 2%
  "ve-tolerance": (state) => {
    const measured = Number(state.veRecorded ?? NaN);
    const expected = Number(state.veExpected ?? NaN);
    if (!Number.isFinite(measured) || !Number.isFinite(expected) || expected <= 0) {
      return { passed: false };
    }
    return { passed: Math.abs(measured - expected) / expected <= 0.02 };
  },
};

/** feedbackKey 前缀：与前端字典 vops.<prefix>.cp<i>.<pass|fail> 对应 */
const FEEDBACK_PREFIX: Record<string, string> = {
  "acid-base-titration": "vops.acid",
  "youngs-double-slit": "vops.slit",
  "conductometric-titration": "vops.cond",
};

/**
 * 操作序列判定（服务端，无状态）：
 * - 只统计与 requiredSequence 前缀一致的部分，顺序错误不惩罚、不泄露下一步。
 * - 返回 accepted（最近一次操作是否符合预期顺序）与 checkpoint 判定。
 */
export function evaluateVirtualOps(
  def: VirtualOperation,
  actions: string[],
  state: Record<string, number | string | boolean> | undefined,
): {
  accepted: boolean;
  completedSteps: number;
  totalSteps: number;
  done: boolean;
  checkpoint?: CheckpointEvaluation;
} {
  const seq = def.requiredSequence;
  let completed = 0;
  for (let i = 0; i < seq.length && i < actions.length; i++) {
    if (actions[i] === seq[i].actionId) completed++;
    else break;
  }
  // 最近一次操作是否就是序列中刚被匹配上的那一步（顺序错误 = 不接受，但不惩罚也不提示下一步）
  const last = actions[actions.length - 1];
  const accepted = last !== undefined && last === seq[completed - 1]?.actionId;

  const done = completed >= seq.length;

  let checkpoint: CheckpointEvaluation | undefined;
  def.checkpoints.forEach((cp, cpIndex) => {
    if (cp.afterStepIndex === completed - 1 && !checkpoint) {
      const fn = CONDITIONS[cp.conditionId];
      const passed = fn ? fn(state ?? {}).passed : false;
      checkpoint = {
        passed,
        feedbackKey: `${FEEDBACK_PREFIX[def.experimentId] ?? "vops"}.cp${cpIndex}.${passed ? "pass" : "fail"}`,
      };
    }
  });

  return { accepted, completedSteps: completed, totalSteps: seq.length, done, checkpoint };
}

export type { Locale };
