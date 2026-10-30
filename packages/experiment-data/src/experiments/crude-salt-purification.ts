import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const crudeSaltPurificationMeta: ExperimentMeta = {
  id: "crude-salt-purification",
  category: "junior-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "crude-salt-purification",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const crudeSaltPurificationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "crude-salt-purification",
    locale: "zh-CN",
    title: "粗盐提纯",
    subtitle: "溶解—过滤—蒸发",
    principle:
      "粗盐中混有不溶性泥沙和可溶性杂质。先加水溶解，用过滤除去不溶性杂质；再把滤液蒸发结晶得到精盐。洗涤晶体可除去附着在表面的可溶性杂质，溶解水量、洗涤次数和操作是否规范都会影响产率与纯度。",
    equipment: [
      "烧杯（250 mL）",
      "玻璃棒",
      "漏斗与滤纸",
      "蒸发皿",
      "酒精灯与三脚架",
      "托盘天平（含砝码）",
    ],
    steps: [
      {
        index: 0,
        title: "溶解（玻璃棒搅拌）",
        description:
          "称取一定质量的粗盐放入烧杯，加入适量蒸馏水，用玻璃棒轻轻搅拌，直到可溶性固体全部溶解。",
        keyPoint: "固体完全溶解、溶液澄清",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "过滤（一贴二低三靠）",
        description:
          "把滤纸紧贴漏斗内壁，液面低于滤纸边缘，漏斗下端管口紧靠烧杯内壁，沿玻璃棒缓慢倾倒滤液。",
        keyPoint: "滤纸紧贴、液面低于滤纸边缘",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "蒸发结晶（玻璃棒不停搅拌）",
        description:
          "把滤液倒入蒸发皿，用酒精灯加热并不断用玻璃棒搅拌，出现较多固体时停止加热，利用余热蒸干。",
        keyPoint: "出现较多固体时停止加热",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "称量并计算产率",
        description:
          "冷却后用托盘天平称量所得精盐的质量，按产率 = 精盐质量 / 粗盐质量 × 100% 计算并分析误差。",
        keyPoint: "天平读数与产率计算",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "waterVolume", label: "溶解用水量", min: 20, max: 80, step: 5, unit: "mL", defaultValue: 40 },
      { kind: "slider", id: "rinseCount", label: "过滤后洗涤次数", min: 0, max: 3, step: 1, unit: "次", defaultValue: 2 },
      { kind: "toggle", id: "liquidAbovePaper", label: "过滤时液面高于滤纸边缘", defaultValue: false },
      { kind: "toggle", id: "stirDuringEvaporation", label: "蒸发时用玻璃棒搅拌", defaultValue: true },
    ],
    safetyNotes: [
      "酒精灯用灯帽盖灭，熄灭后不要立即重新点燃",
      "蒸发皿加热后温度很高，必须用坩埚钳夹取，玻璃棒搅拌时不要碰击皿壁",
      "过滤时漏斗下端管口紧靠烧杯内壁，防止滤液飞溅",
    ],
    normalRanges: [
      {
        parameterId: "rinseCount",
        min: 2,
        max: 3,
        label: "洗涤次数",
        note: "洗涤 2–3 次可充分除去可溶性杂质",
      },
    ],
    errorScenarios: [
      {
        id: "liquid-above-paper",
        label: "液面高于滤纸边缘",
        triggerParam: "liquidAbovePaper",
        triggerValue: true,
        consequence: "滤液沿滤纸与漏斗间隙流下，杂质进入滤液，产率与纯度偏低",
        visualCue: "滤液浑浊，滤纸边缘有液体溢出",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "过滤时玻璃棒的作用是——",
        options: [
          { id: "a", text: "引流，使液体沿玻璃棒流入漏斗" },
          { id: "b", text: "加快过滤速度" },
          { id: "c", text: "搅拌滤纸上的固体" },
          { id: "d", text: "防止滤纸被润湿" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "玻璃棒只起引流作用，让滤液沿棒缓缓流入漏斗，避免直接冲击滤纸。用它搅拌滤纸上的固体会捅破滤纸，使过滤失败。",
      },
      {
        id: "q2",
        type: "single",
        stem: "蒸发时用玻璃棒不停搅拌，主要目的是——",
        options: [
          { id: "a", text: "加快水分蒸发" },
          { id: "b", text: "防止局部过热造成液滴飞溅" },
          { id: "c", text: "使晶体颗粒更细小" },
          { id: "d", text: "检验溶液是否已经饱和" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "蒸发皿底部受热不均，局部过热会使液体剧烈沸腾而飞溅。搅拌使热量和浓度分布均匀，避免液滴溅出损失溶质。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列属于过滤操作要点的是（多选）——",
        options: [
          { id: "a", text: "滤纸紧贴漏斗内壁" },
          { id: "b", text: "液面低于滤纸边缘" },
          { id: "c", text: "漏斗下端管口紧靠烧杯内壁" },
          { id: "d", text: "用玻璃棒在滤纸上用力搅动" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "“一贴二低三靠”分别指滤纸紧贴内壁、液面低于滤纸边缘且漏斗下端管口紧靠烧杯内壁。在滤纸上用力搅动会弄破滤纸，属于错误操作。",
      },
    ],
  },
  "en-US": {
    experimentId: "crude-salt-purification",
    locale: "en-US",
    title: "Purifying Crude Salt",
    subtitle: "Dissolve, filter, evaporate",
    principle:
      "Crude salt contains insoluble sand and soluble impurities. Dissolving it in water and filtering removes the insoluble matter; evaporating the filtrate then crystallises purified salt. Rinsing the crystals removes soluble impurities on their surface, and the water volume, rinse count and technique all affect yield and purity.",
    equipment: [
      "Beaker (250 mL)",
      "Glass rod",
      "Funnel and filter paper",
      "Evaporating dish",
      "Alcohol lamp and tripod",
      "Balance with weights",
    ],
    steps: [
      {
        index: 0,
        title: "Dissolve with stirring",
        description:
          "Weigh a sample of crude salt into a beaker, add a suitable volume of distilled water and stir gently with a glass rod until all soluble solid has dissolved.",
        keyPoint: "Solid fully dissolved, solution clear",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Filter (paper seated, low level, low pour, touching)",
        description:
          "Seat the filter paper against the funnel wall, keep the liquid below the paper edge, rest the funnel stem against the beaker wall and pour the filtrate slowly down a glass rod.",
        keyPoint: "Paper seated, liquid below the paper edge",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Evaporate to crystallise while stirring",
        description:
          "Pour the filtrate into an evaporating dish, heat it with an alcohol lamp and stir continuously. Stop heating when plenty of solid appears and let the residual heat dry it.",
        keyPoint: "Stop heating once plenty of solid appears",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Weigh and compute the yield",
        description:
          "Cool and weigh the purified salt on the balance, then compute yield = mass of purified salt / mass of crude salt × 100% and analyse the error.",
        keyPoint: "Balance reading and yield calculation",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "waterVolume", label: "Water for dissolving", min: 20, max: 80, step: 5, unit: "mL", defaultValue: 40 },
      { kind: "slider", id: "rinseCount", label: "Rinses after filtration", min: 0, max: 3, step: 1, unit: "times", defaultValue: 2 },
      { kind: "toggle", id: "liquidAbovePaper", label: "Liquid level above the filter-paper edge", defaultValue: false },
      { kind: "toggle", id: "stirDuringEvaporation", label: "Stir during evaporation", defaultValue: true },
    ],
    safetyNotes: [
      "Extinguish the alcohol lamp with its cap; never relight a warm lamp immediately",
      "The evaporating dish stays hot after heating — handle it with crucible tongs and do not strike the dish wall with the rod",
      "Rest the funnel stem against the beaker wall to prevent filtrate from splashing",
    ],
    normalRanges: [
      {
        parameterId: "rinseCount",
        min: 2,
        max: 3,
        label: "Rinse count",
        note: "Two or three rinses remove the soluble impurities.",
      },
    ],
    errorScenarios: [
      {
        id: "liquid-above-paper",
        label: "Liquid above the paper edge",
        triggerParam: "liquidAbovePaper",
        triggerValue: true,
        consequence: "Filtrate bypasses the paper, impurities enter the filtrate and yield/purity drop",
        visualCue: "The filtrate turns cloudy and liquid spills over the paper edge",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "During filtration, the glass rod is used to —",
        options: [
          { id: "a", text: "guide the liquid gently into the funnel" },
          { id: "b", text: "speed up filtration" },
          { id: "c", text: "stir the solid on the filter paper" },
          { id: "d", text: "keep the filter paper from getting wet" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "The rod only guides the filtrate so it runs down smoothly instead of striking the paper. Stirring the solid on the paper would tear it and ruin the filtration.",
      },
      {
        id: "q2",
        type: "single",
        stem: "Why must the liquid be stirred continuously during evaporation?",
        options: [
          { id: "a", text: "To make the water evaporate faster" },
          { id: "b", text: "To prevent local overheating that spatters droplets" },
          { id: "c", text: "To make the crystals finer" },
          { id: "d", text: "To test whether the solution is saturated" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "The dish bottom is heated unevenly and local overheating makes the liquid boil violently and spatter. Stirring spreads heat and concentration evenly, preventing loss of solute.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these are correct filtration practices? (multiple answers)",
        options: [
          { id: "a", text: "Seat the filter paper tightly against the funnel wall" },
          { id: "b", text: "Keep the liquid level below the paper edge" },
          { id: "c", text: "Rest the funnel stem against the beaker wall" },
          { id: "d", text: "Stir the paper vigorously with the glass rod" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "The three key points are a seated paper, a liquid level below the paper edge, and the funnel stem touching the beaker wall. Vigorous stirring tears the paper and is incorrect.",
      },
    ],
  },
};
