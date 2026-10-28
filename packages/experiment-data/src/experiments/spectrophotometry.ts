import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [360, 420, 330, 360];

export const spectrophotometryMeta: ExperimentMeta = {
  id: "spectrophotometry",
  category: "chemistry",
  difficulty: 1,
  modes: ["animation"],
  compositionId: "spectrophotometry",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const spectrophotometryContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "spectrophotometry",
    locale: "zh-CN",
    title: "分光光度法测浓度",
    subtitle: "朗伯-比尔定律与标准曲线",
    principle:
      "单色光穿过均匀溶液时，吸光度 A = εbc，与浓度 c 成正比（朗伯-比尔定律）。先用一系列标准溶液在最大吸收波长处绘制 A–c 标准曲线，再测未知样的吸光度，从曲线上反推浓度。本实验以高锰酸钾水溶液（λmax = 525 nm）为例。",
    equipment: [
      "可见分光光度计",
      "1 cm 比色皿（配对）",
      "容量瓶（50 mL）与移液管",
      "高锰酸钾标准溶液",
    ],
    steps: [
      {
        index: 0,
        title: "仪器与光路",
        description: "开机预热，调零并校正 100% 透射；确认波长调至 525 nm。",
        keyPoint: "光路：光源→单色器→比色皿→检测器",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "标准系列显色",
        description: "配制浓度递增的标准溶液，依次装入比色皿，记录各自的吸光度。",
        keyPoint: "颜色随浓度加深",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "绘制标准曲线",
        description: "以 A 对 c 作图，线性范围内各点应落在过原点的直线上。",
        keyPoint: "标准曲线与线性范围",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "测未知样",
        description: "测未知样吸光度，在标准曲线上查得（或由斜率算出）对应浓度。",
        keyPoint: "由 A 反推 c 的过程",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "sampleConcentration", label: "未知样真实浓度", min: 2, max: 45, step: 1, unit: "μmol/L", defaultValue: 25 },
      { kind: "slider", id: "wavelength", label: "测量波长", min: 400, max: 700, step: 5, unit: "nm", defaultValue: 525 },
      { kind: "toggle", id: "showStandardCurve", label: "显示标准曲线", defaultValue: true },
    ],
    safetyNotes: ["高锰酸钾具氧化性，避免接触皮肤与衣物", "比色皿为光学玻璃，只能持握毛面并用镜头纸擦拭"],
    normalRanges: [
      { parameterId: "sampleConcentration", min: 2, max: 40, label: "线性范围内浓度", note: "A 过大即偏离比尔定律，教学简化范围" },
    ],
    errorScenarios: [
      {
        id: "over-range",
        label: "浓度超出线性范围",
        triggerParam: "sampleConcentration",
        triggerValue: 45,
        consequence: "吸光度接近 1.0 后偏离朗伯-比尔定律，标准曲线下弯，反推浓度偏低",
        visualCue: "标准曲线高浓度端向下弯曲，未知样点落在弯折区",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "朗伯-比尔定律 A = εbc 中，保持 b 与波长不变，浓度增大到 2 倍，吸光度 A 将——",
        options: [
          { id: "a", text: "增大到 2 倍" },
          { id: "b", text: "增大到 4 倍" },
          { id: "c", text: "不变" },
          { id: "d", text: "减小一半" },
        ],
        correctOptionIds: ["a"],
        explanation: "A 与 c 成正比（在线性范围内），浓度加倍则吸光度加倍；注意是吸光度而非透射率翻倍。",
      },
      {
        id: "q2",
        type: "single",
        stem: "为什么标准曲线要在最大吸收波长 λmax 处绘制？",
        options: [
          { id: "a", text: "灵敏度最高，且波长微小漂移对 A 影响最小" },
          { id: "b", text: "λmax 处仪器最容易调零" },
          { id: "c", text: "其他波长下比尔定律不成立" },
          { id: "d", text: "为了节省测量时间" },
        ],
        correctOptionIds: ["a"],
        explanation: "λmax 处吸收峰平缓，ε 最大使灵敏度最高，波长稍有漂移吸光度变化也小，测量重复性最好。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些操作会引起吸光度测量误差？（多选）",
        options: [
          { id: "a", text: "比色皿透光面留有指纹或水渍" },
          { id: "b", text: "比色皿放入时方向不一致" },
          { id: "c", text: "用待测液润洗比色皿" },
          { id: "d", text: "参比液与待测液温差较大" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "指纹/水渍与皿的方向会改变有效光程与散射；温差影响折光与密度。用待测液润洗比色皿是规范操作，反而避免稀释误差。",
      },
    ],
  },
  "en-US": {
    experimentId: "spectrophotometry",
    locale: "en-US",
    title: "Spectrophotometric Determination of Concentration",
    subtitle: "Beer-Lambert law and the calibration curve",
    principle:
      "When monochromatic light passes through a homogeneous solution, the absorbance A = εbc is proportional to concentration (Beer-Lambert law). A calibration curve is first built from standard solutions at the absorption maximum; the unknown's absorbance then yields its concentration. Potassium permanganate solution (λmax = 525 nm) is used here.",
    equipment: [
      "Visible spectrophotometer",
      "Matched 1 cm cuvettes",
      "Volumetric flasks (50 mL) and pipettes",
      "Standard KMnO₄ solution",
    ],
    steps: [
      {
        index: 0,
        title: "Instrument and beam",
        description: "Warm up, zero the instrument and set 100% transmittance; set the wavelength to 525 nm.",
        keyPoint: "Beam path: source → monochromator → cuvette → detector",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Read the standards",
        description: "Prepare standards of increasing concentration, fill the cuvette in turn and record each absorbance.",
        keyPoint: "Color deepening with concentration",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Plot the calibration curve",
        description: "Plot A against c; within the linear range the points fall on a line through the origin.",
        keyPoint: "Calibration curve and its linear range",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Measure the unknown",
        description: "Read the unknown's absorbance and convert it to concentration via the curve (or the slope).",
        keyPoint: "From A back to c",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "sampleConcentration", label: "True unknown concentration", min: 2, max: 45, step: 1, unit: "μmol/L", defaultValue: 25 },
      { kind: "slider", id: "wavelength", label: "Measurement wavelength", min: 400, max: 700, step: 5, unit: "nm", defaultValue: 525 },
      { kind: "toggle", id: "showStandardCurve", label: "Show calibration curve", defaultValue: true },
    ],
    safetyNotes: ["KMnO₄ is an oxidizer; avoid contact with skin and clothing", "Cuvettes are optical glass — hold the frosted faces only and wipe with lens paper"],
    normalRanges: [
      { parameterId: "sampleConcentration", min: 2, max: 40, label: "Within linear range", note: "A too large departs from Beer's law; simplified teaching range" },
    ],
    errorScenarios: [
      {
        id: "over-range",
        label: "Concentration beyond the linear range",
        triggerParam: "sampleConcentration",
        triggerValue: 45,
        consequence: "As A approaches 1.0 the response bends away from Beer's law; the curve sags and the back-calculated concentration reads low",
        visualCue: "The calibration curve bends downward at the high end and the unknown lands in the bent region",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "In A = εbc, keeping b and the wavelength fixed, doubling the concentration makes A —",
        options: [
          { id: "a", text: "twice as large" },
          { id: "b", text: "four times as large" },
          { id: "c", text: "unchanged" },
          { id: "d", text: "half" },
        ],
        correctOptionIds: ["a"],
        explanation: "A is proportional to c within the linear range. Note it is the absorbance — not the transmittance — that doubles.",
      },
      {
        id: "q2",
        type: "single",
        stem: "Why is the calibration curve measured at the absorption maximum λmax?",
        options: [
          { id: "a", text: "Highest sensitivity, and small wavelength drift barely changes A" },
          { id: "b", text: "The instrument zeroes most easily at λmax" },
          { id: "c", text: "Beer's law fails at other wavelengths" },
          { id: "d", text: "To save measurement time" },
        ],
        correctOptionIds: ["a"],
        explanation: "At λmax the peak is flat: ε is largest (best sensitivity) and a slight wavelength drift hardly moves A, giving the best repeatability.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these introduce absorbance errors? (multiple answers)",
        options: [
          { id: "a", text: "Fingerprints or droplets on the optical faces" },
          { id: "b", text: "Inconsistent orientation of the cuvette" },
          { id: "c", text: "Rinsing the cuvette with the sample solution" },
          { id: "d", text: "Large temperature difference between reference and sample" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "Fingerprints and orientation change the effective path and scattering; temperature shifts refractive index and density. Rinsing with the sample is correct practice — it prevents dilution errors.",
      },
    ],
  },
};
