import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [360, 420, 330, 360];

export const conductometricTitrationMeta: ExperimentMeta = {
  id: "conductometric-titration",
  category: "physical-chemistry",
  difficulty: 2,
  modes: ["animation", "virtual-ops"],
  compositionId: "conductometric-titration",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const conductometricTitrationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "conductometric-titration",
    locale: "zh-CN",
    title: "电导滴定",
    subtitle: "电导率法判定强酸强碱中和终点",
    principle:
      "滴定过程中离子种类与浓度不断变化，溶液电导率 κ 随之改变。H⁺ 与 OH⁻ 的摩尔电导率远高于 Na⁺、Cl⁻，强碱滴定强酸时 κ 先降后升，曲线呈 V 形，谷底即为等当点。",
    equipment: ["电导率仪与电导电极（DJS-1）", "磁力搅拌器与搅拌子", "碱式滴定管（50 mL）", "烧杯（150 mL）", "NaOH 标准溶液"],
    steps: [
      {
        index: 0,
        title: "装置与初值",
        description: "移取盐酸于烧杯，放入搅拌子并浸入电极，开启搅拌，待读数稳定记录初始电导率。",
        keyPoint: "电导率仪初始读数",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "滴定过程",
        description: "逐滴加入 NaOH，高电导的 H⁺ 被中和为水，κ 持续下降。",
        keyPoint: "电导率读数下降与曲线下斜段",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "等当点",
        description: "H⁺ 恰好被完全中和，溶液电导率达到最低点。",
        keyPoint: "V 形曲线谷底",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "过量与结论",
        description: "继续滴加，OH⁻ 开始过剩，κ 快速回升；由谷底对应体积计算待测酸浓度。",
        keyPoint: "V 形曲线与谷底横坐标",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "acidConcentration", label: "盐酸浓度", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "baseConcentration", label: "NaOH 浓度", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "acidVolume", label: "移取盐酸体积", min: 10, max: 40, step: 1, unit: "mL", defaultValue: 25 },
      { kind: "slider", id: "overshoot", label: "滴定过量体积", min: 0, max: 2, step: 0.1, unit: "mL", defaultValue: 0 },
      { kind: "toggle", id: "showCurve", label: "显示电导率曲线", defaultValue: true },
    ],
    safetyNotes: ["NaOH 具强腐蚀性，操作时佩戴护目镜", "电极铂片勿触碰杯壁与搅拌子"],
    normalRanges: [
      { parameterId: "overshoot", min: 0, max: 0.2, label: "终点过冲体积", note: "教学简化范围，非标准规范" },
    ],
    errorScenarios: [
      {
        id: "overshoot",
        label: "过量滴加",
        triggerParam: "overshoot",
        triggerValue: 1.5,
        consequence: "若仍按读数最低点之后继续作图判断，谷底判定右移，结果偏高",
        visualCue: "电导率读数明显回升，V 形曲线右支快速上升",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "强碱滴定强酸过程中，电导率持续下降的主要原因是——",
        options: [
          { id: "a", text: "溶液体积增大导致稀释" },
          { id: "b", text: "高摩尔电导率的 H⁺ 被替换为低摩尔电导率的 Na⁺" },
          { id: "c", text: "温度降低" },
          { id: "d", text: "电极被污染" },
        ],
        correctOptionIds: ["b"],
        explanation: "λ(H⁺) ≈ 350、λ(Na⁺) ≈ 50 S·cm²/mol，中和使高速迁移的 H⁺ 被 Na⁺ 取代，κ 下降远快于稀释效应。",
      },
      {
        id: "q2",
        type: "single",
        stem: "电导滴定曲线（V 形）的最低点对应——",
        options: [
          { id: "a", text: "滴定起点" },
          { id: "b", text: "等当点" },
          { id: "c", text: "碱过量一倍处" },
          { id: "d", text: "仪器零点漂移" },
        ],
        correctOptionIds: ["b"],
        explanation: "等当点时 H⁺ 与 OH⁻ 均无过剩，溶液只剩 NaCl，电导率最低，故谷底横坐标即终点体积。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些说法符合电导滴定的特点？（多选）",
        options: [
          { id: "a", text: "滴定过程中不需要加指示剂" },
          { id: "b", text: "极稀溶液中终点判断比指示剂法更可靠" },
          { id: "c", text: "谷底体积与温度无关" },
          { id: "d", text: "电极必须完全浸入液面以下" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "电导滴定靠曲线拐点判终点，无需指示剂，在有色或极稀体系尤具优势；铂片必须全浸入以保证测值稳定。温度影响离子摩尔电导率，谷底位置会随温度略有移动。",
      },
    ],
  },
  "en-US": {
    experimentId: "conductometric-titration",
    locale: "en-US",
    title: "Conductometric Titration",
    subtitle: "Locating the neutralization endpoint by conductivity",
    principle:
      "As the titration proceeds the ions in solution change, so the conductivity κ changes too. H⁺ and OH⁻ have far higher molar conductivities than Na⁺ and Cl⁻; titrating a strong acid with a strong base, κ first falls then rises, giving a V-shaped curve whose minimum marks the equivalence point.",
    equipment: [
      "Conductivity meter with DJS-1 cell",
      "Magnetic stirrer and stir bar",
      "Burette, base type (50 mL)",
      "Beaker (150 mL)",
      "Standard NaOH solution",
    ],
    steps: [
      {
        index: 0,
        title: "Setup and initial value",
        description: "Pipette HCl into the beaker, add the stir bar, immerse the electrode, start stirring and record the stable initial conductivity.",
        keyPoint: "Initial conductivity reading",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Titration",
        description: "Add NaOH dropwise: the highly conducting H⁺ is neutralized into water and κ keeps falling.",
        keyPoint: "Falling readout and the descending branch",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Equivalence point",
        description: "All H⁺ is exactly neutralized and the conductivity reaches its minimum.",
        keyPoint: "The bottom of the V",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Excess and conclusion",
        description: "Beyond the endpoint OH⁻ accumulates and κ rises sharply; the volume at the minimum gives the acid concentration.",
        keyPoint: "The V-shaped curve and the abscissa of its minimum",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "acidConcentration", label: "HCl concentration", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "baseConcentration", label: "NaOH concentration", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "acidVolume", label: "Pipetted HCl volume", min: 10, max: 40, step: 1, unit: "mL", defaultValue: 25 },
      { kind: "slider", id: "overshoot", label: "Overshot volume", min: 0, max: 2, step: 0.1, unit: "mL", defaultValue: 0 },
      { kind: "toggle", id: "showCurve", label: "Show conductivity curve", defaultValue: true },
    ],
    safetyNotes: ["NaOH is highly corrosive; wear goggles", "Keep the platinum electrodes away from the wall and the stir bar"],
    normalRanges: [
      { parameterId: "overshoot", min: 0, max: 0.2, label: "Endpoint overshoot", note: "Simplified teaching range, not a standard" },
    ],
    errorScenarios: [
      {
        id: "overshoot",
        label: "Titrating far past the endpoint",
        triggerParam: "overshoot",
        triggerValue: 1.5,
        consequence: "Reading the minimum too late shifts the judged endpoint right and the result reads high",
        visualCue: "The conductivity climbs back noticeably and the right branch of the V rises steeply",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "During the titration of a strong acid by a strong base, the conductivity keeps falling mainly because —",
        options: [
          { id: "a", text: "the growing volume dilutes the solution" },
          { id: "b", text: "H⁺ with its huge molar conductivity is replaced by Na⁺" },
          { id: "c", text: "the temperature drops" },
          { id: "d", text: "the electrode gets fouled" },
        ],
        correctOptionIds: ["b"],
        explanation: "λ(H⁺) ≈ 350 versus λ(Na⁺) ≈ 50 S·cm²/mol: neutralization swaps the fast H⁺ for slow Na⁺, which dominates over the dilution effect.",
      },
      {
        id: "q2",
        type: "single",
        stem: "The minimum of the V-shaped conductometric curve corresponds to —",
        options: [
          { id: "a", text: "the start of the titration" },
          { id: "b", text: "the equivalence point" },
          { id: "c", text: "one equivalent of excess base" },
          { id: "d", text: "an instrument zero drift" },
        ],
        correctOptionIds: ["b"],
        explanation: "At equivalence neither H⁺ nor OH⁻ is in excess — only NaCl remains, the least conducting mixture, so the abscissa of the minimum is the endpoint volume.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which statements match conductometric titration? (multiple answers)",
        options: [
          { id: "a", text: "No indicator is needed" },
          { id: "b", text: "It is more reliable than indicators for very dilute solutions" },
          { id: "c", text: "The endpoint volume is independent of temperature" },
          { id: "d", text: "The electrodes must be fully immersed" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "The endpoint is read from the curve intersection, so no indicator is needed — ideal for colored or very dilute systems; the platinum sheets must be fully immersed for stable readings. Temperature shifts molar conductivities, so the minimum moves slightly.",
      },
    ],
  },
};
