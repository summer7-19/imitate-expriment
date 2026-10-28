/**
 * 虚拟操作模式类型。
 * 安全约束：requiredSequence（正确答案）只保存在服务端，永不下发前端；
 * 前端只拿得到 availableActions（按钮/拖拽目标清单）。
 */

export interface OperationStep {
  actionId: string;
  /** 参数容差（用于 input 类操作的判定） */
  tolerance?: number;
}

export interface ActionDef {
  id: string;
  label: string;
  type: "click" | "drag" | "input";
  /** 场景中的可交互元素 id */
  targetElement?: string;
  /** 关联到哪个参数（input 类操作） */
  paramMapping?: string;
}

export interface Checkpoint {
  id: string;
  /** 在完成第几个操作步骤后触发判定（0-based） */
  afterStepIndex: number;
  /** 判定条件函数 id，由服务端实现（前端不可见逻辑） */
  conditionId: string;
  /** 判定所需的客户端状态键 */
  stateKeys: string[];
}

/** 服务端完整定义（含答案，不下发） */
export interface VirtualOperation {
  id: string;
  experimentId: string;
  requiredSequence: OperationStep[];
  availableActions: ActionDef[];
  checkpoints: Checkpoint[];
}

/** 前端可见的投影（不含 requiredSequence / checkpoints） */
export interface VirtualOperationPublic {
  id: string;
  experimentId: string;
  availableActions: ActionDef[];
}

/** POST /api/virtual-ops/:id/check 请求体 */
export interface VirtualOpsCheckInput {
  /** 用户已执行的操作 id 序列 */
  actions: string[];
  /** 判定检查点所需的当前状态快照 */
  state?: Record<string, number | string | boolean>;
  locale?: "zh-CN" | "en-US";
}

/** check 响应：文字反馈由前端按 key 渲染，服务端不泄露下一步是什么 */
export interface VirtualOpsCheckResult {
  /** 操作序列是否全部完成 */
  done: boolean;
  /** 最近一次操作是否匹配预期顺序 */
  accepted: boolean;
  /** 已完成的步骤数 */
  completedSteps: number;
  totalSteps: number;
  /** 新触发的检查点判定结果 */
  checkpoint?: {
    id: string;
    passed: boolean;
    /** 反馈文案 key，如 "virtualOps.cp.tooDeep" */
    feedbackKey: string;
  };
}
