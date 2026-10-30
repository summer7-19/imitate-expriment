import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const galvanicCellMeta: ExperimentMeta = {
  id: "galvanic-cell",
  category: "senior-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "galvanic-cell",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const galvanicCellContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "galvanic-cell",
    locale: "zh-CN",
    title: "原电池",
    subtitle: "铜锌双液电池与电子流向",
    principle:
      "原电池把化学能转化为电能。较活泼的锌失去电子成为负极，电子经外电路流向铜正极；盐桥中的 K⁺、Cl⁻ 定向迁移，使两个半电池保持电荷平衡，内电路由此闭合。",
    equipment: [
      "锌片（负极）",
      "铜片（正极）",
      "稀硫酸或硫酸铜溶液",
      "盐桥（KCl 琼脂）",
      "电流表（0–0.6 A）",
      "烧杯两只与导线",
    ],
    steps: [
      {
        index: 0,
        title: "组装锌、铜电极与电解质",
        description:
          "在两只烧杯中分别加入 ZnSO₄ 溶液和所选电解质，把锌片浸入左侧、铜片浸入右侧，再用盐桥连接两杯溶液。",
        keyPoint: "Zn 在左、Cu 在右，盐桥两端浸入液面以下",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "连接导线观察电流表",
        description:
          "用导线把锌片、电流表、铜片依次连接成闭合回路，观察电流表指针是否偏转，判断电池是否工作。",
        keyPoint: "电流表指针偏转说明外电路有电流",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "分析电子与离子迁移方向",
        description:
          "电子由锌片经导线流向铜片；盐桥中 K⁺ 向铜侧迁移、Cl⁻ 向锌侧迁移，使两个半电池的电荷保持平衡，内电路闭合。",
        keyPoint: "电子走外电路，离子走盐桥",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "写出电极反应式",
        description:
          "负极 Zn − 2e⁻ = Zn²⁺；正极按电解质写 2H⁺ + 2e⁻ = H₂↑ 或 Cu²⁺ + 2e⁻ = Cu，两式相加得到总反应。",
        keyPoint: "负极失电子，正极得电子",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      {
        kind: "select",
        id: "electrolyte",
        label: "正极电解质",
        options: [
          { value: "h2so4", label: "稀硫酸" },
          { value: "cuso4", label: "硫酸铜溶液" },
        ],
        defaultValue: "h2so4",
      },
      { kind: "slider", id: "externalR", label: "外电路电阻", min: 1, max: 100, step: 1, unit: "Ω", defaultValue: 20 },
      { kind: "toggle", id: "saltBridge", label: "盐桥已连接", defaultValue: true },
    ],
    safetyNotes: [
      "稀硫酸与硫酸铜溶液均有腐蚀性，避免接触皮肤和衣物",
      "锌片、铜片边缘可能锋利，取用和擦拭时小心划伤",
      "实验后把废液倒入指定容器，洗净电极与烧杯",
    ],
    normalRanges: [
      {
        parameterId: "externalR",
        min: 5,
        max: 80,
        label: "外电路电阻",
        note: "过小电流大发热，过大电流过小不易观察",
      },
    ],
    errorScenarios: [
      {
        id: "salt-bridge-missing",
        label: "盐桥缺失",
        triggerParam: "saltBridge",
        triggerValue: false,
        consequence:
          "盐桥缺失时内电路不闭合，电流表不偏转，电池不能持续工作",
        visualCue: "电流表指针停在零位，溶液中没有离子迁移箭头",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "原电池中电子流动的方向是——",
        options: [
          { id: "a", text: "由负极经外电路流向正极" },
          { id: "b", text: "由正极经外电路流向负极" },
          { id: "c", text: "由盐桥流向正极" },
          { id: "d", text: "在电解质溶液中由负极流向正极" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "负极失去电子，电子经导线（外电路）流向正极被还原剂接受；溶液中的离子迁移构成内电路，电子并不进入溶液。",
      },
      {
        id: "q2",
        type: "single",
        stem: "铜锌原电池中，负极发生的反应是——",
        options: [
          { id: "a", text: "Zn − 2e⁻ = Zn²⁺" },
          { id: "b", text: "Cu²⁺ + 2e⁻ = Cu" },
          { id: "c", text: "2H⁺ + 2e⁻ = H₂↑" },
          { id: "d", text: "Zn²⁺ + 2e⁻ = Zn" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "锌比铜活泼，锌失去电子被氧化，负极反应为 Zn − 2e⁻ = Zn²⁺；铜电极上发生还原反应。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "构成原电池的条件包括——（多选）",
        options: [
          { id: "a", text: "两个活泼性不同的电极" },
          { id: "b", text: "电解质溶液" },
          { id: "c", text: "形成闭合回路" },
          { id: "d", text: "两电极必须都是金属" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "电极只需导电且活泼性不同，石墨等非金属导体也可作电极，因此 d 不成立。",
      },
    ],
  },
  "en-US": {
    experimentId: "galvanic-cell",
    locale: "en-US",
    title: "Galvanic Cells",
    subtitle: "The copper–zinc two-beaker cell",
    principle:
      "A galvanic cell converts chemical energy into electrical energy. The more active zinc gives up electrons and becomes the negative electrode; electrons flow through the external circuit to the copper cathode. K⁺ and Cl⁻ migrate through the salt bridge to keep both half-cells electrically neutral, closing the internal circuit.",
    equipment: [
      "Zinc strip (negative electrode)",
      "Copper strip (positive electrode)",
      "Dilute sulfuric acid or copper(II) sulfate solution",
      "Salt bridge (KCl in agar)",
      "Ammeter (0–0.6 A)",
      "Two beakers and connecting wires",
    ],
    steps: [
      {
        index: 0,
        title: "Set up the zinc and copper electrodes",
        description:
          "Fill one beaker with ZnSO₄ solution and the other with the chosen electrolyte. Dip the zinc strip into the left beaker and the copper strip into the right, then join the solutions with the salt bridge.",
        keyPoint: "Zn on the left, Cu on the right, both bridge ends below the liquid surface",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Connect the wires and watch the ammeter",
        description:
          "Connect the zinc strip, ammeter and copper strip in series to close the external circuit, and watch whether the ammeter needle deflects.",
        keyPoint: "A deflecting needle shows current in the external circuit",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Trace electron and ion migration",
        description:
          "Electrons travel from the zinc strip through the wire to the copper strip. In the salt bridge K⁺ moves toward the copper side and Cl⁻ toward the zinc side, keeping both half-cells neutral.",
        keyPoint: "Electrons use the external circuit, ions use the salt bridge",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Write the electrode reactions",
        description:
          "At the negative electrode Zn − 2e⁻ = Zn²⁺. At the positive electrode write 2H⁺ + 2e⁻ = H₂↑ or Cu²⁺ + 2e⁻ = Cu depending on the electrolyte; adding the two half-reactions gives the overall reaction.",
        keyPoint: "The anode loses electrons and the cathode gains them",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      {
        kind: "select",
        id: "electrolyte",
        label: "Cathode electrolyte",
        options: [
          { value: "h2so4", label: "Dilute sulfuric acid" },
          { value: "cuso4", label: "Copper(II) sulfate solution" },
        ],
        defaultValue: "h2so4",
      },
      { kind: "slider", id: "externalR", label: "External resistance", min: 1, max: 100, step: 1, unit: "Ω", defaultValue: 20 },
      { kind: "toggle", id: "saltBridge", label: "Salt bridge connected", defaultValue: true },
    ],
    safetyNotes: [
      "Dilute sulfuric acid and copper(II) sulfate solution are corrosive; keep them off skin and clothing",
      "The edges of the zinc and copper strips can be sharp; handle them carefully",
      "Pour waste solutions into the designated container and rinse the electrodes and beakers",
    ],
    normalRanges: [
      {
        parameterId: "externalR",
        min: 5,
        max: 80,
        label: "External resistance",
        note: "Too small heats the cell; too large gives too little current.",
      },
    ],
    errorScenarios: [
      {
        id: "salt-bridge-missing",
        label: "Salt bridge missing",
        triggerParam: "saltBridge",
        triggerValue: false,
        consequence:
          "Without the salt bridge the internal circuit is open, the ammeter stays at zero and the cell cannot deliver current",
        visualCue: "The needle rests at zero and no ion arrows appear",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "During operation of a galvanic cell, electrons flow —",
        options: [
          { id: "a", text: "from the negative electrode through the external circuit to the positive electrode" },
          { id: "b", text: "from the positive electrode through the external circuit to the negative electrode" },
          { id: "c", text: "from the salt bridge to the positive electrode" },
          { id: "d", text: "through the electrolyte from the negative to the positive electrode" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "The negative electrode releases electrons, which travel through the wire to the positive electrode. Ion migration in the solution completes the internal circuit; electrons do not travel through the electrolyte.",
      },
      {
        id: "q2",
        type: "single",
        stem: "In a copper–zinc galvanic cell the reaction at the negative electrode is —",
        options: [
          { id: "a", text: "Zn − 2e⁻ = Zn²⁺" },
          { id: "b", text: "Cu²⁺ + 2e⁻ = Cu" },
          { id: "c", text: "2H⁺ + 2e⁻ = H₂↑" },
          { id: "d", text: "Zn²⁺ + 2e⁻ = Zn" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Zinc is more active than copper, so it is oxidised at the anode: Zn − 2e⁻ = Zn²⁺. Reduction occurs at the copper cathode.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "The requirements for forming a galvanic cell include — (multiple answers)",
        options: [
          { id: "a", text: "two electrodes of different activity" },
          { id: "b", text: "an electrolyte solution" },
          { id: "c", text: "a closed circuit" },
          { id: "d", text: "both electrodes must be metals" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "The electrodes only need to conduct and differ in activity; graphite and other non-metals can serve as electrodes, so d is false.",
      },
    ],
  },
};
