import type { VirtualOperation } from "@physchem/experiment-schema";

/**
 * 虚拟操作定义（服务端专属数据，含正确答案，绝不下发前端）。
 * feedbackKey 由前端字典渲染；服务端只返回 key，不返回下一步是什么。
 */
export const VIRTUAL_OPS: VirtualOperation[] = [
  {
    id: "acid-base-titration-ops",
    experimentId: "acid-base-titration",
    requiredSequence: [
      { actionId: "add-indicator" },
      { actionId: "open-stopcock" },
      { actionId: "swirl" },
      { actionId: "observe-color" },
      { actionId: "close-stopcock" },
      { actionId: "record-reading" },
    ],
    availableActions: [
      { id: "add-indicator", label: "加入指示剂 / Add indicator", type: "click", targetElement: "indicator-bottle" },
      { id: "open-stopcock", label: "打开活塞 / Open stopcock", type: "click", targetElement: "stopcock" },
      { id: "swirl", label: "摇动锥形瓶 / Swirl the flask", type: "click", targetElement: "flask" },
      { id: "observe-color", label: "观察颜色 / Observe the color", type: "click", targetElement: "flask" },
      { id: "close-stopcock", label: "关闭活塞 / Close stopcock", type: "click", targetElement: "stopcock" },
      { id: "record-reading", label: "记录读数 / Record the reading", type: "click" },
    ],
    checkpoints: [
      {
        id: "acid-cp0",
        afterStepIndex: 5,
        conditionId: "endpoint-tolerance",
        stateKeys: ["deliveredMl", "endpointMl"],
      },
    ],
  },
  {
    id: "youngs-double-slit-ops",
    experimentId: "youngs-double-slit",
    requiredSequence: [
      { actionId: "set-wavelength" },
      { actionId: "set-separation" },
      { actionId: "set-distance" },
      { actionId: "observe-fringes" },
      { actionId: "record-deltay" },
    ],
    availableActions: [
      { id: "set-wavelength", label: "波长 λ|380|780|1|nm", type: "input", paramMapping: "wavelength" },
      { id: "set-separation", label: "缝间距 d|0.08|0.4|0.01|mm", type: "input", paramMapping: "slitSeparation" },
      { id: "set-distance", label: "屏距 L|0.5|2|0.05|m", type: "input", paramMapping: "screenDistance" },
      { id: "observe-fringes", label: "观察条纹 / Observe fringes", type: "click" },
      { id: "record-deltay", label: "记录 Δy / Record Δy", type: "click" },
    ],
    checkpoints: [
      {
        id: "slit-cp0",
        afterStepIndex: 4,
        conditionId: "fringe-tolerance",
        stateKeys: ["dyMeasured", "dyExpected"],
      },
    ],
  },
  {
    id: "conductometric-titration-ops",
    experimentId: "conductometric-titration",
    requiredSequence: [
      { actionId: "fill-solution" },
      { actionId: "immerse-electrode" },
      { actionId: "start-stir" },
      { actionId: "add-dropwise" },
      { actionId: "record-ve" },
    ],
    availableActions: [
      { id: "fill-solution", label: "装液 / Fill the cell", type: "click" },
      { id: "immerse-electrode", label: "浸入电极 / Immerse electrode", type: "click" },
      { id: "start-stir", label: "开启搅拌 / Start stirring", type: "click" },
      { id: "add-dropwise", label: "逐滴加入 / Add dropwise", type: "click" },
      { id: "record-ve", label: "记录谷底体积 / Record the minimum", type: "click" },
    ],
    checkpoints: [
      {
        id: "cond-cp0",
        afterStepIndex: 4,
        conditionId: "ve-tolerance",
        stateKeys: ["veRecorded", "veExpected"],
      },
    ],
  },
];
