import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [360, 420, 330, 360];

export const freezingPointDepressionMeta: ExperimentMeta = {
  id: "freezing-point-depression",
  category: "physical-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "freezing-point-depression",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const freezingPointDepressionContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "freezing-point-depression",
    locale: "zh-CN",
    title: "凝固点降低测摩尔质量",
    subtitle: "稀溶液的依数性",
    principle:
      "稀溶液的凝固点比纯溶剂低：ΔTf = Kf·b，其中 b 为质量摩尔浓度。分别测出纯溶剂与溶液的冷却曲线，得到凝固点差 ΔTf，即可由 M = Kf·m(溶质) / (ΔTf·m(溶剂)) 求出溶质摩尔质量。本实验用苯作溶剂（Kf = 5.12 K·kg/mol）、联苯作溶质。",
    equipment: [
      "凝固点测定管与空气套管",
      "贝克曼温度计（或精密温差仪）",
      "磁力搅拌器",
      "低温恒温槽（约 2 ℃）",
      "移液管与分析天平",
    ],
    steps: [
      {
        index: 0,
        title: "装置与纯溶剂",
        description: "量取纯苯放入凝固点管，插入温度计并搅动，观察纯溶剂冷却曲线。",
        keyPoint: "纯溶剂过冷回升后的平台",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "纯溶剂冷却曲线",
        description: "温度随时间下降，过冷后因结晶放热回升并出现短暂平台，平台温度即纯溶剂凝固点。",
        keyPoint: "过冷回升与水平段",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "溶液冷却曲线",
        description: "加入准确称量的联苯，重复冷却实验；溶液冷却曲线不再有平台，只有析出溶剂后的拐点。",
        keyPoint: "更低的凝固点与拐点",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "ΔTf 与摩尔质量",
        description: "由两条曲线外推得到 ΔTf，代入 M = Kf·m/(ΔTf·m₀) 计算联苯摩尔质量。",
        keyPoint: "两条曲线叠加对比与 ΔTf 标注",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "soluteMass", label: "溶质（联苯）质量", min: 0.5, max: 3, step: 0.01, unit: "g", defaultValue: 1.53 },
      { kind: "slider", id: "solventMass", label: "溶剂（苯）质量", min: 20, max: 40, step: 0.1, unit: "g", defaultValue: 25 },
      { kind: "slider", id: "supercoolDepth", label: "过冷深度", min: 0, max: 2, step: 0.1, unit: "℃", defaultValue: 0.5 },
      { kind: "toggle", id: "showBothCurves", label: "叠加显示两条冷却曲线", defaultValue: true },
    ],
    safetyNotes: ["苯有毒且易燃，操作在通风橱内进行，远离火源", "苯废液倒入指定回收桶，严禁倒入水槽"],
    normalRanges: [
      { parameterId: "supercoolDepth", min: 0, max: 0.8, label: "过冷深度", note: "轻微过冷有助于读出平台，教学简化范围" },
    ],
    errorScenarios: [
      {
        id: "deep-supercool",
        label: "过冷过深",
        triggerParam: "supercoolDepth",
        triggerValue: 1.5,
        consequence: "大量过冷使晶体骤然析出，溶液曲线拐点难以判断，ΔTf 偏差增大",
        visualCue: "冷却曲线深跌后骤然回升，回升峰尖突出",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "纯溶剂的冷却曲线出现平台，而溶液的冷却曲线只出现拐点，原因是——",
        options: [
          { id: "a", text: "溶液凝固时溶剂不断析出，浓度增大，凝固点持续下降" },
          { id: "b", text: "溶液的过冷比纯溶剂严重" },
          { id: "c", text: "温度计在溶液中响应更慢" },
          { id: "d", text: "溶液不结晶" },
        ],
        correctOptionIds: ["a"],
        explanation: "纯溶剂结晶时固液两相平衡，温度不变形成平台；溶液中随着溶剂析出浓度增大，凝固点继续下降，只能看到曲线斜率改变的拐点。",
      },
      {
        id: "q2",
        type: "single",
        stem: "其他条件不变，溶质质量加倍，凝固点降低值 ΔTf 将——",
        options: [
          { id: "a", text: "不变" },
          { id: "b", text: "约增大到两倍" },
          { id: "c", text: "约减小到一半" },
          { id: "d", text: "先增后减" },
        ],
        correctOptionIds: ["b"],
        explanation: "ΔTf = Kf·b 与质量摩尔浓度成正比；溶剂质量不变时 b ∝ m(溶质)，故约增大到两倍（前提仍是稀溶液）。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些做法有利于准确测定 ΔTf？（多选）",
        options: [
          { id: "a", text: "控制轻微过冷（约 0.3 ℃）" },
          { id: "b", text: "匀速搅拌" },
          { id: "c", text: "加入尽可能多的溶质增大 ΔTf" },
          { id: "d", text: "外推曲线而非读单点" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "轻微过冷与匀速搅拌让结晶平稳、平台清晰；外推可减小读数误差。溶质过多会超出稀溶液适用范围，反而偏离 ΔTf ∝ b 的线性关系。",
      },
    ],
  },
  "en-US": {
    experimentId: "freezing-point-depression",
    locale: "en-US",
    title: "Freezing-Point Depression: Molar Mass",
    subtitle: "A colligative property of dilute solutions",
    principle:
      "A dilute solution freezes below the pure solvent by ΔTf = Kf·b, where b is the molality. Measuring cooling curves for the pure solvent and the solution gives ΔTf, and the molar mass follows from M = Kf·m(solute) / (ΔTf·m(solvent)). Benzene is the solvent (Kf = 5.12 K·kg/mol) and biphenyl the solute.",
    equipment: [
      "Freezing-point tube with air jacket",
      "Beckmann thermometer (or precision differential thermometer)",
      "Magnetic stirrer",
      "Cryostat bath (about 2 °C)",
      "Pipette and analytical balance",
    ],
    steps: [
      {
        index: 0,
        title: "Setup and pure solvent",
        description: "Pipette pure benzene into the tube, insert the thermometer and stir to record the cooling curve of the pure solvent.",
        keyPoint: "The plateau after supercooling and recovery",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Pure-solvent cooling curve",
        description: "Temperature falls, supercools, then recovers on crystallization into a short plateau — the freezing point.",
        keyPoint: "Supercooling, recovery and the flat section",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Solution cooling curve",
        description: "Add the weighed biphenyl and repeat; the solution curve shows no plateau, only a kink as solvent freezes out.",
        keyPoint: "The lower freezing point and the kink",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "ΔTf and molar mass",
        description: "Extrapolate both curves to get ΔTf, then compute the molar mass from M = Kf·m / (ΔTf·m₀).",
        keyPoint: "Both curves overlaid with the ΔTf marker",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "soluteMass", label: "Solute (biphenyl) mass", min: 0.5, max: 3, step: 0.01, unit: "g", defaultValue: 1.53 },
      { kind: "slider", id: "solventMass", label: "Solvent (benzene) mass", min: 20, max: 40, step: 0.1, unit: "g", defaultValue: 25 },
      { kind: "slider", id: "supercoolDepth", label: "Supercooling depth", min: 0, max: 2, step: 0.1, unit: "°C", defaultValue: 0.5 },
      { kind: "toggle", id: "showBothCurves", label: "Overlay both cooling curves", defaultValue: true },
    ],
    safetyNotes: ["Benzene is toxic and flammable — work in a fume hood away from flames", "Collect benzene waste in the designated container, never down the sink"],
    normalRanges: [
      { parameterId: "supercoolDepth", min: 0, max: 0.8, label: "Supercooling depth", note: "Mild supercooling makes the plateau readable; simplified teaching range" },
    ],
    errorScenarios: [
      {
        id: "deep-supercool",
        label: "Supercooling too deeply",
        triggerParam: "supercoolDepth",
        triggerValue: 1.5,
        consequence: "A large supercooling burst crystallizes the solvent suddenly, blurring the solution-curve kink and widening the ΔTf error",
        visualCue: "The curve plunges deeply then snaps back with a sharp spike",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "The pure solvent shows a plateau while the solution shows only a kink because —",
        options: [
          { id: "a", text: "as solvent freezes out the solution concentrates and its freezing point keeps falling" },
          { id: "b", text: "the solution supercools more than the pure solvent" },
          { id: "c", text: "the thermometer responds slower in solution" },
          { id: "d", text: "the solution does not crystallize" },
        ],
        correctOptionIds: ["a"],
        explanation: "For the pure solvent the solid–liquid equilibrium holds the temperature constant (plateau). In a solution, freezing out solvent concentrates the remainder, so the temperature keeps sliding — only the slope change (kink) remains.",
      },
      {
        id: "q2",
        type: "single",
        stem: "Doubling the solute mass with everything else fixed makes ΔTf —",
        options: [
          { id: "a", text: "unchanged" },
          { id: "b", text: "about twice as large" },
          { id: "c", text: "about half" },
          { id: "d", text: "rise then fall" },
        ],
        correctOptionIds: ["b"],
        explanation: "ΔTf = Kf·b scales with molality; with the solvent mass fixed, b ∝ m(solute), so ΔTf roughly doubles — as long as the solution stays dilute.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which practices improve the accuracy of ΔTf? (multiple answers)",
        options: [
          { id: "a", text: "Keeping a mild supercooling (about 0.3 °C)" },
          { id: "b", text: "Stirring at a steady rate" },
          { id: "c", text: "Adding as much solute as possible to enlarge ΔTf" },
          { id: "d", text: "Extrapolating the curves instead of reading a single point" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "Mild supercooling and steady stirring give clean crystallization and readable plateaus; extrapolation reduces reading error. Too much solute breaks the dilute-solution limit and the linear ΔTf ∝ b relation.",
      },
    ],
  },
};
