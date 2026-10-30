import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const carbonDioxidePreparationMeta: ExperimentMeta = {
  id: "carbon-dioxide-preparation",
  category: "junior-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "carbon-dioxide-preparation",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const carbonDioxidePreparationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "carbon-dioxide-preparation",
    locale: "zh-CN",
    title: "二氧化碳的实验室制取与检验",
    subtitle: "石灰石与稀盐酸反应",
    principle:
      "石灰石（主要成分碳酸钙）与稀盐酸反应生成氯化钙、水和二氧化碳：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。二氧化碳密度比空气大，用向上排空气法收集；它能使澄清石灰水变浑浊，这一现象可用于检验二氧化碳。",
    equipment: [
      "锥形瓶（250 mL）",
      "长颈漏斗",
      "双孔橡皮塞与导气管",
      "集气瓶与毛玻璃片",
      "试管（盛澄清石灰水）",
      "石灰石与稀盐酸",
    ],
    steps: [
      {
        index: 0,
        title: "组装装置并检查气密性",
        description:
          "把长颈漏斗和导气管插入双孔橡皮塞，长颈漏斗下端要伸入液面以下形成液封。检查气密性时，向漏斗中加水，若液面保持稳定不下降，说明装置不漏气。",
        keyPoint: "长颈漏斗液封",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "加入石灰石与稀盐酸",
        description:
          "先把石灰石放入锥形瓶，再从长颈漏斗中加入稀盐酸。顺序必须是先固体后液体，防止液体飞溅。加入酸后，石灰石表面立即产生大量气泡。",
        keyPoint: "先固后液",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "向上排空气法收集",
        description:
          "集气瓶口向上，导管伸到瓶底，让二氧化碳从瓶底向上把空气排出。收集一段时间后，把燃着的木条放在瓶口，木条熄灭说明已收集满。",
        keyPoint: "瓶口向上",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "通入澄清石灰水检验",
        description:
          "把生成的气体通入澄清石灰水，石灰水变浑浊：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O。若用稀硫酸代替稀盐酸，生成的硫酸钙会覆盖在石灰石表面，气泡很快停止。",
        keyPoint: "石灰水变浑浊",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      {
        kind: "select",
        id: "acid",
        label: "所用酸",
        options: [
          { value: "diluteHCl", label: "稀盐酸" },
          { value: "diluteH2SO4", label: "稀硫酸" },
        ],
        defaultValue: "diluteHCl",
      },
      { kind: "slider", id: "acidVolume", label: "稀酸体积", min: 20, max: 80, step: 5, unit: "mL", defaultValue: 50 },
      { kind: "slider", id: "marbleMass", label: "石灰石质量", min: 5, max: 30, step: 1, unit: "g", defaultValue: 15 },
      { kind: "slider", id: "collectionTime", label: "收集时间", min: 5, max: 30, step: 1, unit: "s", defaultValue: 15 },
    ],
    safetyNotes: [
      "稀盐酸具有腐蚀性，不要接触皮肤和眼睛，若不慎沾到立即用大量清水冲洗",
      "先加石灰石再缓慢加入稀盐酸，防止液体飞溅伤人",
      "集气瓶中的二氧化碳不能直接对着人呼出，实验后及时开窗通风",
    ],
    normalRanges: [
      {
        parameterId: "acidVolume",
        min: 30,
        max: 60,
        label: "稀酸用量",
        note: "酸量过少气体不足，过多造成浪费",
      },
    ],
    errorScenarios: [
      {
        id: "sulfate-coating",
        label: "用稀硫酸代替稀盐酸",
        triggerParam: "acid",
        triggerValue: "diluteH2SO4",
        consequence: "生成的硫酸钙微溶，覆盖在石灰石表面阻止反应，气泡很快停止",
        visualCue: "气泡迅速减少，石灰石表面出现白色覆盖层",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "实验室中检验二氧化碳气体，应选用的试剂是——",
        options: [
          { id: "a", text: "澄清石灰水" },
          { id: "b", text: "稀盐酸" },
          { id: "c", text: "紫色石蕊试液" },
          { id: "d", text: "带火星的木条" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "二氧化碳能使澄清石灰水变浑浊，生成碳酸钙沉淀，这是二氧化碳的特征检验方法；带火星木条主要用于检验氧气。",
      },
      {
        id: "q2",
        type: "single",
        stem: "制取二氧化碳时不能用稀硫酸代替稀盐酸，原因是——",
        options: [
          { id: "a", text: "稀硫酸与石灰石不反应" },
          { id: "b", text: "生成微溶的硫酸钙覆盖在石灰石表面，反应很快停止" },
          { id: "c", text: "稀硫酸会腐蚀锥形瓶" },
          { id: "d", text: "生成的二氧化碳不纯" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "碳酸钙与硫酸反应生成硫酸钙，硫酸钙微溶于水，会覆盖在石灰石表面，把石灰石与酸隔开，反应很快停止，所以实验室选用稀盐酸。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "收集二氧化碳时，下列操作正确的有——（多选）",
        options: [
          { id: "a", text: "用向上排空气法收集" },
          { id: "b", text: "导管伸到集气瓶底部" },
          { id: "c", text: "验满时把燃着的木条放在瓶口" },
          { id: "d", text: "用排水法收集" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "二氧化碳密度比空气大且能溶于水，应用向上排空气法，导管伸到底部才能把空气排尽；验满时燃着的木条放在瓶口，熄灭即满。排水法会因二氧化碳溶于水而收集不到气体。",
      },
    ],
  },
  "en-US": {
    experimentId: "carbon-dioxide-preparation",
    locale: "en-US",
    title: "Preparing and Testing Carbon Dioxide",
    subtitle: "Marble with dilute hydrochloric acid",
    principle:
      "Marble, mainly calcium carbonate, reacts with dilute hydrochloric acid to give calcium chloride, water and carbon dioxide: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑. Carbon dioxide is denser than air, so it is collected by upward displacement of air; it turns limewater milky, which is the standard test for the gas.",
    equipment: [
      "Conical flask (250 mL)",
      "Long-neck funnel",
      "Two-hole stopper with delivery tube",
      "Gas jar and ground-glass plate",
      "Test tube of clear limewater",
      "Marble and dilute hydrochloric acid",
    ],
    steps: [
      {
        index: 0,
        title: "Assemble and check",
        description:
          "Fit the long-neck funnel and delivery tube into the two-hole stopper, with the funnel stem below the liquid level to form a seal. Add water to the funnel: a steady level that does not fall means the apparatus is airtight.",
        keyPoint: "Liquid seal in the long-neck funnel",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Add marble and acid",
        description:
          "Put the marble into the flask first, then pour dilute hydrochloric acid through the funnel. Solids go in before liquids to avoid spattering; bubbles appear on the marble at once.",
        keyPoint: "Solid first, then liquid",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Collect by upward displacement of air",
        description:
          "Keep the jar mouth upward and lead the tube to the bottom so carbon dioxide pushes the air out from below. After a while, hold a burning splint at the jar mouth; if it goes out, the jar is full.",
        keyPoint: "Jar mouth upward",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Bubble through limewater",
        description:
          "Pass the gas through clear limewater; it turns milky: CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O. With dilute sulfuric acid instead of hydrochloric acid, calcium sulfate coats the marble and the bubbles soon stop.",
        keyPoint: "Limewater turns milky",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      {
        kind: "select",
        id: "acid",
        label: "Acid used",
        options: [
          { value: "diluteHCl", label: "Dilute hydrochloric acid" },
          { value: "diluteH2SO4", label: "Dilute sulfuric acid" },
        ],
        defaultValue: "diluteHCl",
      },
      { kind: "slider", id: "acidVolume", label: "Acid volume", min: 20, max: 80, step: 5, unit: "mL", defaultValue: 50 },
      { kind: "slider", id: "marbleMass", label: "Marble mass", min: 5, max: 30, step: 1, unit: "g", defaultValue: 15 },
      { kind: "slider", id: "collectionTime", label: "Collection time", min: 5, max: 30, step: 1, unit: "s", defaultValue: 15 },
    ],
    safetyNotes: [
      "Dilute hydrochloric acid is corrosive; keep it off skin and eyes and flush with plenty of water if splashed",
      "Add the marble first and the acid slowly to avoid spattering",
      "Do not breathe the collected carbon dioxide directly; ventilate the room after the experiment",
    ],
    normalRanges: [
      {
        parameterId: "acidVolume",
        min: 30,
        max: 60,
        label: "Acid volume",
        note: "Too little gives too little gas; too much is wasteful",
      },
    ],
    errorScenarios: [
      {
        id: "sulfate-coating",
        label: "Sulfuric acid instead of hydrochloric acid",
        triggerParam: "acid",
        triggerValue: "diluteH2SO4",
        consequence: "Slightly soluble calcium sulfate coats the marble and the reaction stops",
        visualCue: "Bubbles fade quickly and a white crust forms on the marble",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "The reagent used to test for carbon dioxide in the lab is —",
        options: [
          { id: "a", text: "clear limewater" },
          { id: "b", text: "dilute hydrochloric acid" },
          { id: "c", text: "purple litmus solution" },
          { id: "d", text: "a glowing splint" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Carbon dioxide turns clear limewater milky by forming calcium carbonate; a glowing splint is the test for oxygen.",
      },
      {
        id: "q2",
        type: "single",
        stem: "Dilute sulfuric acid cannot replace dilute hydrochloric acid because —",
        options: [
          { id: "a", text: "it does not react with marble" },
          { id: "b", text: "slightly soluble calcium sulfate coats the marble and the reaction soon stops" },
          { id: "c", text: "it attacks the conical flask" },
          { id: "d", text: "the carbon dioxide produced is impure" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Calcium sulfate is only slightly soluble. It covers the marble and keeps acid away, so bubbles stop quickly — hence hydrochloric acid is used in the lab.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which practices are correct when collecting carbon dioxide? (multiple answers)",
        options: [
          { id: "a", text: "Collect by upward displacement of air" },
          { id: "b", text: "Lead the tube to the bottom of the jar" },
          { id: "c", text: "Test fullness with a burning splint at the mouth" },
          { id: "d", text: "Collect over water" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "Carbon dioxide is denser than air and dissolves in water, so upward displacement is used and the tube must reach the bottom to push all the air out. A burning splint at the mouth goes out when the jar is full; collecting over water would lose the gas.",
      },
    ],
  },
};
