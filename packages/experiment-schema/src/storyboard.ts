export interface ErrorScenario {
  id: string;
  /** 如"滴定过量" */
  label: string;
  /** 触发的参数 id */
  triggerParam: string;
  /** 触发值 */
  triggerValue: number | string | boolean;
  /** 如"颜色过深，误差增大" */
  consequence: string;
  /** 画面反馈描述 */
  visualCue: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  /** single = 单选；multi = 多选 */
  type: "single" | "multi";
  stem: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanation: string;
}
