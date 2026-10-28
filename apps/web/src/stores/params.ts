import { create } from "zustand";
import type { ParamValue, ParamValues } from "@physchem/experiment-schema";
import type { ExperimentContent } from "@physchem/experiment-schema";
import { defaultParams } from "@physchem/experiment-schema";

interface ParamState {
  /** experimentId -> 参数值表 */
  values: Record<string, ParamValues>;
  /** 错误场景演示时暂存的被改参数原值，用于撤销 */
  scenarioBackup: Record<
    string,
    { experimentId: string; paramId: string; previous: ParamValue } | undefined
  >;
  setValue: (experimentId: string, paramId: string, value: ParamValue) => void;
  reset: (experimentId: string) => void;
  applyScenario: (
    experimentId: string,
    scenarioId: string,
    triggerParam: string,
    triggerValue: ParamValue,
    previousValue: ParamValue,
  ) => void;
  undoScenario: (scenarioId: string) => void;
}

export const useParamsStore = create<ParamState>((set, get) => ({
  values: {},
  scenarioBackup: {},
  setValue: (experimentId, paramId, value) =>
    set((state) => ({
      values: {
        ...state.values,
        [experimentId]: {
          ...(state.values[experimentId] ?? {}),
          [paramId]: value,
        },
      },
    })),
  reset: (experimentId) =>
    set((state) => ({
      values: { ...state.values, [experimentId]: {} }, // 空表 = 全部回落到内容默认值
    })),
  applyScenario: (experimentId, scenarioId, triggerParam, triggerValue, previousValue) => {
    const current = get().values[experimentId] ?? {};
    set((state) => ({
      values: {
        ...state.values,
        [experimentId]: { ...current, [triggerParam]: triggerValue },
      },
      scenarioBackup: {
        ...state.scenarioBackup,
        [scenarioId]: { experimentId, paramId: triggerParam, previous: previousValue },
      },
    }));
  },
  undoScenario: (scenarioId) =>
    set((state) => {
      const backup = state.scenarioBackup[scenarioId];
      if (!backup) return state;
      const current = state.values[backup.experimentId] ?? {};
      return {
        values: {
          ...state.values,
          [backup.experimentId]: { ...current, [backup.paramId]: backup.previous },
        },
        scenarioBackup: { ...state.scenarioBackup, [scenarioId]: undefined },
      };
    }),
}));

/** 取某实验的当前参数（未改动过的项回落到内容默认值） */
export function useParamValues(content: ExperimentContent): ParamValues {
  const stored = useParamsStore((s) => s.values[content.experimentId]);
  return { ...defaultParams(content), ...(stored ?? {}) };
}
