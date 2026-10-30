import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const mechanicalEnergyConservationMeta: ExperimentMeta = {
  id: "mechanical-energy-conservation",
  category: "senior-physics",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "mechanical-energy-conservation",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const mechanicalEnergyConservationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "mechanical-energy-conservation",
    locale: "zh-CN",
    title: "验证机械能守恒定律",
    subtitle: "自由落体与打点计时器",
    principle:
      "在只有重力做功的自由落体运动中，物体的重力势能减少量等于动能的增加量，即 mgh = ½mv²，机械能守恒。实验用打点计时器记录重物下落的位置，由纸带上相邻两点的距离求出某点的瞬时速度，再比较该点前后减少的重力势能与增加的动能。若两者在误差范围内相等，就验证了机械能守恒定律。",
    equipment: [
      "铁架台（带铁夹）",
      "电磁打点计时器",
      "纸带（约 1 m）",
      "带纸带夹的重物",
      "毫米刻度尺",
      "学生电源与导线",
    ],
    steps: [
      {
        index: 0,
        title: "固定打点计时器并穿好纸带",
        description:
          "把打点计时器竖直固定在铁架台上，使限位孔在正下方。将纸带一端穿过限位孔并夹在重物上，提起重物让纸带保持竖直，重物靠近计时器但不要碰到它。",
        keyPoint: "计时器竖直，纸带与限位孔对齐",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "释放重物打出纸带",
        description:
          "先接通电源，待打点稳定后再释放重物。重物自由下落，纸带随之下移，计时器在纸带上打出一系列等时间间隔的点；重物落地前用手在下方接住，避免纸带被拉断。",
        keyPoint: "先通电、后释放，点迹清晰",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "选取点迹测量速度",
        description:
          "在纸带上选取第一个清晰点和一段连续的点，用刻度尺量出相邻点间的距离 s₁、s₂。某点的瞬时速度等于它前后两点间的平均速度，即 v = (s₁ + s₂) / (2T)，T 为打点周期。",
        keyPoint: "v = (s₁ + s₂) / (2T)",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "比较 ΔEp 与 ΔEk",
        description:
          "量出该点到起始点的高度差 h，计算重力势能的减少量 ΔEp = mgh 和动能的增加量 ΔEk = ½mv²。比较两者的大小，若在实验误差范围内相等，即验证机械能守恒。",
        keyPoint: "mgh 与 ½mv² 在误差范围内相等",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "dropHeight", label: "下落高度 h", min: 0.2, max: 1.5, step: 0.05, unit: "m", defaultValue: 0.8 },
      { kind: "slider", id: "mass", label: "重物质量 m", min: 50, max: 500, step: 10, unit: "g", defaultValue: 200 },
      { kind: "toggle", id: "airResistance", label: "考虑空气阻力", defaultValue: false },
      { kind: "toggle", id: "showBars", label: "显示能量柱", defaultValue: true },
    ],
    safetyNotes: [
      "重物下落区域下方放置软垫，防止砸伤或损坏地面",
      "打点计时器接低压交流电源，通电前检查导线绝缘是否完好",
      "释放重物时手不要放在重物下落路径上，落地前从侧面接住",
    ],
    normalRanges: [
      {
        parameterId: "dropHeight",
        min: 0.4,
        max: 1.2,
        label: "下落高度",
        note: "过低点距太密，过高阻力影响变大",
      },
    ],
    errorScenarios: [
      {
        id: "air-drag",
        label: "空气阻力不可忽略",
        triggerParam: "airResistance",
        triggerValue: true,
        consequence: "空气阻力做负功，动能的增加量小于重力势能的减少量",
        visualCue: "纸带上相邻点距略小，能量柱中 ΔEk 明显低于 ΔEp",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "验证机械能守恒定律是否必须测出重物的质量？",
        options: [
          { id: "a", text: "必须，用天平测出重物质量" },
          { id: "b", text: "不需要，mgh 与 ½mv² 中 m 可约去" },
          { id: "c", text: "只需测出质量即可，不必测高度" },
          { id: "d", text: "必须把质量取为 1 kg 才能比较" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "要验证的是 mgh = ½mv²，等式两边都含有质量 m，可以约去，得到 gh = ½v²。因此实验只需测量下落高度和速度，不必测量重物质量，这也是该实验的一大优点。",
      },
      {
        id: "q2",
        type: "single",
        stem: "纸带上某一点的瞬时速度应如何求出？",
        options: [
          { id: "a", text: "用第一个点到该点的距离除以总时间" },
          { id: "b", text: "用相邻两点间的平均速度 v = (s₁ + s₂) / (2T)" },
          { id: "c", text: "用该点前后两点的速度相加" },
          { id: "d", text: "由 v = gt 直接计算" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "匀变速直线运动中，某段时间内的平均速度等于中间时刻的瞬时速度，所以某点的速度等于它前后相邻两点间的平均速度 (s₁ + s₂) / (2T)。用 v = gt 计算相当于默认机械能守恒，会失去验证的意义。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些是本实验误差的来源？（多选）",
        options: [
          { id: "a", text: "空气阻力" },
          { id: "b", text: "纸带与限位孔之间的摩擦" },
          { id: "c", text: "先释放纸带后接通电源" },
          { id: "d", text: "重物质量测量不准" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "空气阻力和纸带与限位孔的摩擦都做负功，使动能的增加量小于重力势能的减少量；先释放后通电会漏掉起始点，纸带上的第一段点迹不完整。质量在 mgh = ½mv² 两边可约去，质量测量误差不影响验证结果。",
      },
    ],
  },
  "en-US": {
    experimentId: "mechanical-energy-conservation",
    locale: "en-US",
    title: "Verifying Conservation of Mechanical Energy",
    subtitle: "Free fall timed by a spark ticker",
    principle:
      "In free fall, where only gravity does work, the loss in gravitational potential energy equals the gain in kinetic energy: mgh = ½mv². A ticker timer records the falling positions, the instantaneous speed at a point is obtained from the spacing of neighbouring dots, and the potential-energy loss is compared with the kinetic-energy gain. Agreement within experimental error verifies conservation of mechanical energy.",
    equipment: [
      "Retort stand with clamps",
      "Spark ticker timer",
      "Paper tape (about 1 m)",
      "Falling weight with a tape clip",
      "Millimetre ruler",
      "Low-voltage power supply and leads",
    ],
    steps: [
      {
        index: 0,
        title: "Mount the ticker and thread the tape",
        description:
          "Clamp the timer vertically so its guide slot points straight down. Thread one end of the tape through the slot and clip it to the weight. Lift the weight so the tape is vertical and the weight sits just below the timer without touching it.",
        keyPoint: "Timer vertical, tape aligned with the slot",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Release the mass and record the tape",
        description:
          "Switch on the timer first, wait for steady dots, then release the weight. As it falls freely the tape slides through and receives a series of equally timed dots. Catch the weight by hand before it lands so the tape is not torn.",
        keyPoint: "Power on first, then release; clear dots",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Measure velocities from the dots",
        description:
          "Pick the first clear dot and a run of consecutive dots, then measure the neighbouring gaps s₁ and s₂ with the ruler. The instantaneous speed at a dot equals the average speed over the two neighbouring intervals, v = (s₁ + s₂) / (2T), where T is the tick period.",
        keyPoint: "v = (s₁ + s₂) / (2T)",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Compare ΔEp with ΔEk",
        description:
          "Measure the height h fallen from the start to the chosen dot. Compute the potential-energy loss ΔEp = mgh and the kinetic-energy gain ΔEk = ½mv². If they agree within experimental error, mechanical energy is conserved.",
        keyPoint: "mgh and ½mv² agree within error",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "dropHeight", label: "Drop height h", min: 0.2, max: 1.5, step: 0.05, unit: "m", defaultValue: 0.8 },
      { kind: "slider", id: "mass", label: "Falling mass m", min: 50, max: 500, step: 10, unit: "g", defaultValue: 200 },
      { kind: "toggle", id: "airResistance", label: "Include air resistance", defaultValue: false },
      { kind: "toggle", id: "showBars", label: "Show energy bars", defaultValue: true },
    ],
    safetyNotes: [
      "Place a soft mat under the fall path to protect people and the floor",
      "Power the timer from a low-voltage AC supply and check the insulation before use",
      "Keep hands out of the fall path and catch the weight from the side before it lands",
    ],
    normalRanges: [
      {
        parameterId: "dropHeight",
        min: 0.4,
        max: 1.2,
        label: "Drop height",
        note: "Too low crowds the dots; too high increases drag.",
      },
    ],
    errorScenarios: [
      {
        id: "air-drag",
        label: "Air drag is significant",
        triggerParam: "airResistance",
        triggerValue: true,
        consequence: "Drag does negative work, so ΔEk falls short of ΔEp",
        visualCue: "The dot spacing shrinks slightly and the ΔEk bar is visibly shorter than ΔEp",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "Must the mass of the falling weight be measured to verify conservation of mechanical energy?",
        options: [
          { id: "a", text: "Yes, weigh the mass on a balance" },
          { id: "b", text: "No, the mass cancels from mgh = ½mv²" },
          { id: "c", text: "Only the mass is needed; the height can be omitted" },
          { id: "d", text: "The mass must be set to 1 kg for comparison" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "The relation to test is mgh = ½mv², in which m appears on both sides and cancels to gh = ½v². Only the height and speed need measuring, which is a major convenience of this experiment.",
      },
      {
        id: "q2",
        type: "single",
        stem: "How is the instantaneous speed at a dot on the tape found?",
        options: [
          { id: "a", text: "Divide the distance from the first dot by the total time" },
          { id: "b", text: "Use the average speed over the neighbouring gaps, v = (s₁ + s₂) / (2T)" },
          { id: "c", text: "Add the speeds at the two neighbouring dots" },
          { id: "d", text: "Compute v = gt directly" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "For uniformly accelerated motion the average speed over an interval equals the instantaneous speed at its midpoint, so the speed at a dot is the average over the two adjacent gaps, (s₁ + s₂) / (2T). Using v = gt assumes energy conservation and would defeat the purpose of the check.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these are error sources in this experiment? (multiple answers)",
        options: [
          { id: "a", text: "Air resistance" },
          { id: "b", text: "Friction between the tape and the guide slot" },
          { id: "c", text: "Releasing the tape before switching on the timer" },
          { id: "d", text: "An inaccurate measurement of the mass" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "Air drag and slot friction both do negative work, so ΔEk ends up smaller than ΔEp. Releasing before switching on the timer loses the first dots, leaving an incomplete tape. The mass cancels from mgh = ½mv², so its measurement error does not affect the verification.",
      },
    ],
  },
};
