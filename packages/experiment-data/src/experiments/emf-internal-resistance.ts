import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const emfInternalResistanceMeta: ExperimentMeta = {
  id: "emf-internal-resistance",
  category: "senior-physics",
  difficulty: 3,
  modes: ["animation"],
  compositionId: "emf-internal-resistance",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const emfInternalResistanceContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "emf-internal-resistance",
    locale: "zh-CN",
    title: "测量电源的电动势和内阻",
    subtitle: "U–I 图像法",
    principle:
      "闭合电路欧姆定律给出 I = E/(R+r) 与 U = E − Ir。改变外电阻 R 得到多组 U、I，以 I 为横轴、U 为纵轴作图，直线的纵截距等于电源电动势 E，斜率的绝对值等于内阻 r。",
    equipment: [
      "干电池（E ≈ 3 V，r ≈ 1.5 Ω）",
      "电压表（0–3 V / 0–15 V）",
      "电流表（0–0.6 A / 0–3 A）",
      "电阻箱（0–99.9 Ω）",
      "单刀开关",
      "导线若干",
    ],
    steps: [
      {
        index: 0,
        title: "连接电路",
        description:
          "按电路图依次连接电源、开关、电流表和电阻箱，再把电压表并联在电源两端。注意电表量程与正负接线柱，连线时开关保持断开。",
        keyPoint: "电压表并联在电源两端，开关断开时连线",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "改变电阻箱记录多组 U、I",
        description:
          "闭合开关，逐次改变电阻箱的阻值，每次待指针稳定后同时读取电流 I 和路端电压 U，共记录 5 组以上数据。",
        keyPoint: "每次改变 R 后同时读取 U 与 I",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "作 U–I 图像",
        description:
          "以电流 I 为横轴、电压 U 为纵轴描点，用直尺画出使尽可能多的点落在其上的直线，并延长到与纵轴相交。",
        keyPoint: "U–I 直线及其纵截距、斜率",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "由截距和斜率求 E、r",
        description:
          "直线与纵轴的交点给出电动势 E′，斜率的绝对值给出内阻 r′。若电流表接在电压表测量回路内，r′ 中还额外包含电流表内阻。",
        keyPoint: "E′ = 纵截距，r′ = |斜率|",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "emf", label: "电动势 E", min: 1.0, max: 6.0, step: 0.1, unit: "V", defaultValue: 3 },
      { kind: "slider", id: "internalR", label: "内阻 r", min: 0.5, max: 10, step: 0.1, unit: "Ω", defaultValue: 1.5 },
      { kind: "slider", id: "externalR", label: "外电阻 R", min: 1, max: 50, step: 1, unit: "Ω", defaultValue: 10 },
      {
        kind: "toggle",
        id: "ammeterInternal",
        label: "电流表内接（引入附加内阻）",
        defaultValue: false,
      },
    ],
    safetyNotes: [
      "连线时开关必须断开，经检查无误后再闭合",
      "电流不宜过大、通电时间不宜过长，防止电池发热导致电动势和内阻变化",
      "注意电压表、电流表的量程与正负接线柱，避免反接损坏电表",
    ],
    normalRanges: [
      {
        parameterId: "externalR",
        min: 5,
        max: 40,
        label: "外电阻",
        note: "过小电流过大，过大电压变化不明显",
      },
    ],
    errorScenarios: [
      {
        id: "ammeter-inside-loop",
        label: "电流表内接",
        triggerParam: "ammeterInternal",
        triggerValue: true,
        consequence:
          "电流表内阻被计入电源内阻，测得的内阻偏大，U–I 直线斜率偏大",
        visualCue: "电路图上电流表被圈进电压表测量回路，拟合直线变陡",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "U–I 图像的纵截距表示——",
        options: [
          { id: "a", text: "电源电动势" },
          { id: "b", text: "电源内阻" },
          { id: "c", text: "路端电压" },
          { id: "d", text: "短路电流" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "由 U = E − Ir，当 I = 0 时 U = E，因此直线与纵轴的交点就是电源电动势。",
      },
      {
        id: "q2",
        type: "single",
        stem: "U–I 图像斜率的绝对值表示——",
        options: [
          { id: "a", text: "电源电动势" },
          { id: "b", text: "电源内阻" },
          { id: "c", text: "外电阻" },
          { id: "d", text: "电流表内阻" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "U = E − Ir 中斜率 k = −r，其绝对值等于电源内阻；外电阻 R 随电流改变，并不是直线的斜率。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "减小本实验误差的方法有——（多选）",
        options: [
          { id: "a", text: "多测几组 U、I 数据" },
          { id: "b", text: "电流不宜过大且通电时间不宜过长" },
          { id: "c", text: "用图像法处理数据" },
          { id: "d", text: "电压表应串联在电路中" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "多组数据与图像法可减小偶然误差；电流过大或通电过久会使电池发热、E 与 r 变化。电压表应并联在电源两端，串联会几乎切断电流。",
      },
    ],
  },
  "en-US": {
    experimentId: "emf-internal-resistance",
    locale: "en-US",
    title: "Measuring EMF and Internal Resistance",
    subtitle: "The U–I graph method",
    principle:
      "The closed-circuit form of Ohm's law gives I = E/(R+r) and U = E − Ir. Varying the external resistance R yields several (I, U) pairs; plotting U against I gives a straight line whose intercept is the EMF E and whose slope magnitude is the internal resistance r.",
    equipment: [
      "Dry cell (E ≈ 3 V, r ≈ 1.5 Ω)",
      "Voltmeter (0–3 V / 0–15 V)",
      "Ammeter (0–0.6 A / 0–3 A)",
      "Resistance box (0–99.9 Ω)",
      "Single-pole switch",
      "Connecting wires",
    ],
    steps: [
      {
        index: 0,
        title: "Connect the circuit",
        description:
          "Wire the cell, switch, ammeter and resistance box in series, then connect the voltmeter across the cell. Check meter ranges and polarity, and keep the switch open while wiring.",
        keyPoint: "Voltmeter across the cell, switch open while wiring",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Vary the resistance box and record U and I",
        description:
          "Close the switch, change the resistance box step by step and, after each change, read the current I and terminal voltage U together. Record at least five pairs.",
        keyPoint: "Read U and I together after every change of R",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Plot U against I",
        description:
          "Plot U on the vertical axis against I on the horizontal axis, then draw the straight line that best passes through the points and extend it to the vertical axis.",
        keyPoint: "The U–I line, its intercept and its slope",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Read E from the intercept and r from the slope",
        description:
          "The intersection with the vertical axis gives the EMF E′ and the slope magnitude gives the internal resistance r′. If the ammeter sits inside the voltmeter loop, r′ also includes the ammeter resistance.",
        keyPoint: "E′ = intercept, r′ = |slope|",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "emf", label: "EMF E", min: 1.0, max: 6.0, step: 0.1, unit: "V", defaultValue: 3 },
      { kind: "slider", id: "internalR", label: "Internal resistance r", min: 0.5, max: 10, step: 0.1, unit: "Ω", defaultValue: 1.5 },
      { kind: "slider", id: "externalR", label: "External resistance R", min: 1, max: 50, step: 1, unit: "Ω", defaultValue: 10 },
      {
        kind: "toggle",
        id: "ammeterInternal",
        label: "Ammeter inside the voltmeter loop (extra resistance)",
        defaultValue: false,
      },
    ],
    safetyNotes: [
      "Keep the switch open while wiring and close it only after checking the circuit",
      "Do not draw too much current or leave the circuit on too long; heating changes both the EMF and the internal resistance",
      "Check the ranges and polarity of both meters to avoid reversing them",
    ],
    normalRanges: [
      {
        parameterId: "externalR",
        min: 5,
        max: 40,
        label: "External resistance",
        note: "Too small draws too much current; too large barely changes the voltage.",
      },
    ],
    errorScenarios: [
      {
        id: "ammeter-inside-loop",
        label: "Ammeter inside the loop",
        triggerParam: "ammeterInternal",
        triggerValue: true,
        consequence:
          "The ammeter resistance adds to the internal resistance, so r reads high and the U–I line is steeper",
        visualCue: "The ammeter sits inside the voltmeter loop and the fitted line steepens",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "The vertical intercept of the U–I graph represents —",
        options: [
          { id: "a", text: "the EMF of the cell" },
          { id: "b", text: "the internal resistance of the cell" },
          { id: "c", text: "the terminal voltage" },
          { id: "d", text: "the short-circuit current" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "From U = E − Ir, at I = 0 we have U = E, so the intercept on the vertical axis is the EMF.",
      },
      {
        id: "q2",
        type: "single",
        stem: "The magnitude of the slope of the U–I graph represents —",
        options: [
          { id: "a", text: "the EMF of the cell" },
          { id: "b", text: "the internal resistance of the cell" },
          { id: "c", text: "the external resistance" },
          { id: "d", text: "the ammeter resistance" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "In U = E − Ir the slope is k = −r, whose magnitude is the internal resistance. The external resistance changes with current and is not the slope.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which measures reduce the error of this experiment? (multiple answers)",
        options: [
          { id: "a", text: "Take several pairs of U and I readings" },
          { id: "b", text: "Keep the current small and the circuit on only briefly" },
          { id: "c", text: "Process the data with a graph" },
          { id: "d", text: "Connect the voltmeter in series with the circuit" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "More data and a graphical fit reduce random error; large current or long heating changes the EMF and internal resistance. The voltmeter must be in parallel, since in series it nearly blocks the current.",
      },
    ],
  },
};
