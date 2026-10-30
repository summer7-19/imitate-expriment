import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const oxygenPreparationMeta: ExperimentMeta = {
  id: "oxygen-preparation",
  category: "junior-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "oxygen-preparation",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const oxygenPreparationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "oxygen-preparation",
    locale: "zh-CN",
    title: "氧气的实验室制取与性质",
    subtitle: "高锰酸钾法 / 过氧化氢法",
    principle:
      "加热高锰酸钾，或在二氧化锰催化下分解过氧化氢，都能制得氧气。氧气不易溶于水，可以用排水法收集；它密度略大于空气，也能用向上排空气法收集。氧气能支持燃烧，把带火星的木条伸入瓶内，木条复燃即说明收集到的是氧气。",
    equipment: [
      "大试管与单孔橡皮塞",
      "铁架台（带铁夹）",
      "酒精灯",
      "导气管与橡胶管",
      "水槽",
      "集气瓶与毛玻璃片",
    ],
    steps: [
      {
        index: 0,
        title: "检查装置气密性",
        description:
          "把导管口浸入水中，双手紧握试管（或锥形瓶）外壁，若导管口有气泡冒出、松手后水柱回升，说明装置不漏气。",
        keyPoint: "气泡法查气密性",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "装药品并固定试管",
        description:
          "用高锰酸钾时，把药品平铺在试管底部，管口塞一团棉花，再塞紧单孔橡皮塞；试管口要略向下倾斜，防止冷凝水倒流。用过氧化氢时，先加二氧化锰，再从分液漏斗滴加过氧化氢溶液。",
        keyPoint: "药品与棉花",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "排水法收集氧气",
        description:
          "集气瓶装满水倒扣在水槽中，待气泡连续均匀冒出后再把导管伸入瓶口。瓶内水面逐渐下降，降到瓶口以下时用毛玻璃片盖住，正放在桌面上。",
        keyPoint: "排水法",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "验满与性质检验",
        description:
          "把带火星的木条伸入集气瓶，木条复燃说明瓶内氧气已收集满；氧气支持燃烧，这一性质可用于区分氧气和二氧化碳。",
        keyPoint: "带火星木条复燃",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      {
        kind: "select",
        id: "method",
        label: "制取方法",
        options: [
          { value: "h2o2", label: "过氧化氢分解法（MnO₂ 催化）" },
          { value: "kmno4", label: "高锰酸钾加热法" },
        ],
        defaultValue: "h2o2",
      },
      { kind: "slider", id: "catalystAmount", label: "二氧化锰用量", min: 0, max: 2, step: 0.1, unit: "g", defaultValue: 1 },
      { kind: "toggle", id: "heated", label: "加热", defaultValue: true },
      { kind: "slider", id: "collectVolume", label: "目标收集体积", min: 50, max: 300, step: 10, unit: "mL", defaultValue: 150 },
      {
        kind: "select",
        id: "tubeTilt",
        label: "试管口方向",
        options: [
          { value: "down", label: "试管口略向下倾斜" },
          { value: "up", label: "试管口向上倾斜" },
        ],
        defaultValue: "down",
      },
    ],
    safetyNotes: [
      "高锰酸钾制氧时试管口要塞棉花，防止粉末进入导管",
      "试管口必须略向下倾斜，避免冷凝水倒流使热试管炸裂",
      "实验结束先撤导管再熄灭酒精灯，防止水倒吸",
    ],
    normalRanges: [
      {
        parameterId: "collectVolume",
        min: 100,
        max: 250,
        label: "收集体积",
        note: "过少不便验满，过多浪费药品",
      },
    ],
    errorScenarios: [
      {
        id: "tube-mouth-up",
        label: "试管口向上倾斜",
        triggerParam: "tubeTilt",
        triggerValue: "up",
        consequence: "冷凝水倒流到试管底部，热试管遇冷炸裂",
        visualCue: "试管口出现水珠并回流，试管出现裂纹",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "用排水法收集氧气，开始收集的最佳时机是——",
        options: [
          { id: "a", text: "导管口刚有气泡冒出时" },
          { id: "b", text: "气泡连续均匀冒出时" },
          { id: "c", text: "集气瓶装满水时" },
          { id: "d", text: "反应结束后" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "刚开始的气泡里混有装置内的空气，应等气泡连续均匀冒出、空气排尽后再收集，这样得到的氧气更纯净。",
      },
      {
        id: "q2",
        type: "single",
        stem: "用带火星的木条验满，木条复燃说明——",
        options: [
          { id: "a", text: "瓶内氧气已收集满" },
          { id: "b", text: "瓶内是二氧化碳" },
          { id: "c", text: "装置漏气" },
          { id: "d", text: "氧气已经耗尽" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "氧气支持燃烧，瓶口附近氧气浓度足够高时带火星木条会复燃，因此木条复燃就是已收集满的标志。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "用高锰酸钾制取氧气时，下列操作正确的有——（多选）",
        options: [
          { id: "a", text: "试管口略向下倾斜" },
          { id: "b", text: "管口塞一团棉花" },
          { id: "c", text: "先预热再集中加热药品处" },
          { id: "d", text: "实验结束先熄灭酒精灯再移导管" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "试管口向下可防冷凝水倒流，棉花可阻挡粉末，先预热后集中加热可防止试管受热不均。d 错误：先熄灯会使试管内压强减小，水槽中的水倒吸进热试管，可能使试管炸裂。",
      },
    ],
  },
  "en-US": {
    experimentId: "oxygen-preparation",
    locale: "en-US",
    title: "Preparing Oxygen in the Lab",
    subtitle: "Permanganate or hydrogen-peroxide route",
    principle:
      "Oxygen can be made by heating potassium permanganate, or by decomposing hydrogen peroxide with a manganese dioxide catalyst. Oxygen is only slightly soluble in water, so it can be collected over water; it is slightly denser than air, so upward displacement of air also works. Oxygen supports combustion: a glowing splint thrust into the jar bursts into flame when oxygen is present.",
    equipment: [
      "Large test tube with one-hole stopper",
      "Retort stand with clamp",
      "Alcohol lamp",
      "Delivery tube and rubber tubing",
      "Water trough",
      "Gas jar and ground-glass plate",
    ],
    steps: [
      {
        index: 0,
        title: "Check airtightness",
        description:
          "Put the tube outlet under water and grip the generator with both hands. Bubbles at the outlet, and a water column that rises when you let go, mean the apparatus is airtight.",
        keyPoint: "Bubble test for airtightness",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Load reagents and clamp the tube",
        description:
          "For permanganate, spread the solid along the tube bottom, place a loose cotton plug at the mouth and fit the stopper; tilt the mouth slightly down so condensed water cannot run back. For hydrogen peroxide, add manganese dioxide first and drip the solution in from the funnel.",
        keyPoint: "Reagents and the cotton plug",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Collect over water",
        description:
          "Fill the gas jar with water, invert it in the trough and wait until the bubbles come out steadily and evenly before leading the tube under the mouth. As the water level falls, cover the jar with the glass plate and stand it upright on the bench.",
        keyPoint: "Collection over water",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Test with a glowing splint",
        description:
          "Lower a glowing splint into the jar. If it relights, the jar is full of oxygen; this property distinguishes oxygen from carbon dioxide.",
        keyPoint: "The glowing splint relights",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      {
        kind: "select",
        id: "method",
        label: "Preparation method",
        options: [
          { value: "h2o2", label: "Hydrogen peroxide with MnO₂ catalyst" },
          { value: "kmno4", label: "Heating potassium permanganate" },
        ],
        defaultValue: "h2o2",
      },
      { kind: "slider", id: "catalystAmount", label: "MnO₂ amount", min: 0, max: 2, step: 0.1, unit: "g", defaultValue: 1 },
      { kind: "toggle", id: "heated", label: "Heat applied", defaultValue: true },
      { kind: "slider", id: "collectVolume", label: "Target collected volume", min: 50, max: 300, step: 10, unit: "mL", defaultValue: 150 },
      {
        kind: "select",
        id: "tubeTilt",
        label: "Tube mouth direction",
        options: [
          { value: "down", label: "Mouth tilted slightly down" },
          { value: "up", label: "Mouth tilted up" },
        ],
        defaultValue: "down",
      },
    ],
    safetyNotes: [
      "Put a cotton plug at the tube mouth so permanganate powder cannot enter the delivery tube",
      "Keep the tube mouth tilted slightly down so condensed water cannot run back and crack the hot tube",
      "Withdraw the delivery tube before extinguishing the lamp to prevent water being sucked back",
    ],
    normalRanges: [
      {
        parameterId: "collectVolume",
        min: 100,
        max: 250,
        label: "Collected volume",
        note: "Too little prevents the glow test; too much wastes reagents",
      },
    ],
    errorScenarios: [
      {
        id: "tube-mouth-up",
        label: "Tube mouth tilted up",
        triggerParam: "tubeTilt",
        triggerValue: "up",
        consequence: "Condensed water runs back to the hot tube bottom and cracks it",
        visualCue: "Droplets slide back and a crack spreads across the tube",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "When collecting oxygen over water, the best moment to start is —",
        options: [
          { id: "a", text: "as soon as the first bubble appears" },
          { id: "b", text: "when the bubbles come out steadily and evenly" },
          { id: "c", text: "when the jar is full of water" },
          { id: "d", text: "after the reaction has finished" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "The first bubbles carry air from the apparatus. Waiting for a steady, even stream means the air has been flushed out and the collected oxygen is purer.",
      },
      {
        id: "q2",
        type: "single",
        stem: "A glowing splint relights at the jar mouth. This shows that —",
        options: [
          { id: "a", text: "the jar is full of oxygen" },
          { id: "b", text: "the jar contains carbon dioxide" },
          { id: "c", text: "the apparatus leaks" },
          { id: "d", text: "the oxygen is used up" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Oxygen supports combustion. When its concentration near the mouth is high enough the glowing splint relights, which is the standard full-jar test.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which practices are correct when making oxygen from potassium permanganate? (multiple answers)",
        options: [
          { id: "a", text: "Tilt the tube mouth slightly down" },
          { id: "b", text: "Put a cotton plug at the tube mouth" },
          { id: "c", text: "Preheat first, then heat the reagent directly" },
          { id: "d", text: "Extinguish the lamp before withdrawing the tube" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "A downward mouth stops condensed water running back, cotton keeps powder out of the tube, and preheating avoids uneven stress. d is dangerous: extinguishing first drops the pressure inside and water is sucked back into the hot tube, which may crack it.",
      },
    ],
  },
};
