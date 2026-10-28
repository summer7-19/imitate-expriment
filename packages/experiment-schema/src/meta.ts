import type { ErrorScenario, QuizQuestion } from "./storyboard";
import type { NormalRange, ParameterDef } from "./params";

export type Locale = "zh-CN" | "en-US" | "ja-JP";
export type ExperimentCategory = "physics" | "chemistry" | "physical-chemistry";
export type ExperimentMode = "animation" | "virtual-ops";

/**
 * 实验元数据（与语言无关）。
 * 语言相关的内容全部在 ExperimentContent 中，按 locale 拆分。
 */
export interface ExperimentMeta {
  id: string;
  category: ExperimentCategory;
  /** 1=入门, 2=进阶, 3=硬核 */
  difficulty: 1 | 2 | 3;
  /** 支持哪些模式 */
  modes: ExperimentMode[];
  /** 对应的 Remotion Composition ID */
  compositionId: string;
  /** 视频时长（秒），= (Σ steps.durationFrames + 片尾声明 90 帧) / 30 */
  durationInSeconds: number;
  /** 已本地化语言 */
  locales: Locale[];
}

export interface ExperimentStep {
  index: number;
  /** 步骤标题，如"装液与读数" */
  title: string;
  /** 步骤说明 */
  description: string;
  /** 该步骤的视觉焦点 */
  keyPoint: string;
  /** 在 Composition 中占用的帧数（30fps） */
  durationFrames: number;
}

/** 某一语言下的实验内容 */
export interface ExperimentContent {
  experimentId: string;
  /** "*" 表示语言无关的回退内容 */
  locale: Locale | "*";
  title: string;
  subtitle: string;
  /** 原理简述（2-3 句） */
  principle: string;
  /** 器材列表 */
  equipment: string[];
  steps: ExperimentStep[];
  parameters: ParameterDef[];
  /** 安全提示（人工审核后写入） */
  safetyNotes: string[];
  /** "正常状态"判定范围（教学简化，非标准规范） */
  normalRanges: NormalRange[];
  /** 错误操作场景 */
  errorScenarios: ErrorScenario[];
  quiz: QuizQuestion[];
}
