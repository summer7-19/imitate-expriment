import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const solutionPreparationMeta: ExperimentMeta = {
  id: "solution-preparation",
  category: "senior-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "solution-preparation",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const solutionPreparationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "solution-preparation",
    locale: "zh-CN",
    title: "配制一定物质的量浓度的溶液",
    subtitle: "容量瓶定容操作",
    principle:
      "配制一定物质的量浓度的溶液，先由 c、V 和溶质摩尔质量算出所需质量 m = cVM，称量后在小烧杯中溶解。冷却至室温后把溶液全部转入容量瓶，洗涤烧杯和玻璃棒 2–3 次并把洗涤液并入瓶中，最后加水定容、摇匀。定容时视线必须与刻度线相平，仰视或俯视都会使实际体积偏离刻度。",
    equipment: [
      "托盘天平（含砝码）",
      "烧杯（100 mL）",
      "玻璃棒",
      "容量瓶（100 / 250 / 500 mL）",
      "胶头滴管",
      "洗瓶（蒸馏水）",
    ],
    steps: [
      {
        index: 0,
        title: "计算并称量溶质",
        description:
          "根据目标浓度和容量瓶规格计算所需溶质质量 m = cVM，用托盘天平准确称量后放入洁净的小烧杯。",
        keyPoint: "称量质量与目标浓度对应",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "溶解并冷却至室温",
        description:
          "向小烧杯中加入少量蒸馏水，用玻璃棒搅拌使固体完全溶解，静置冷却到室温后再转移。",
        keyPoint: "溶液澄清并恢复到室温",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "转移、洗涤、定容",
        description:
          "用玻璃棒引流把溶液转入容量瓶，洗涤烧杯和玻璃棒 2–3 次并全部转入；加水至接近刻度线，改用胶头滴管逐滴加至凹液面与刻度线相平。",
        keyPoint: "洗涤液全部转入，凹液面与刻度线相平",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "摇匀并分析浓度",
        description:
          "塞紧瓶塞，倒转并摇匀溶液，再由实际体积和溶质损失计算实际浓度，分析误差方向。",
        keyPoint: "浓度计算与误差方向判断",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "targetConcentration", label: "目标浓度", min: 0.1, max: 2.0, step: 0.1, unit: "mol/L", defaultValue: 0.5 },
      {
        kind: "select",
        id: "flaskVolume",
        label: "容量瓶规格",
        options: [
          { value: "100", label: "100 mL 容量瓶" },
          { value: "250", label: "250 mL 容量瓶" },
          { value: "500", label: "500 mL 容量瓶" },
        ],
        defaultValue: "250",
      },
      {
        kind: "select",
        id: "solute",
        label: "溶质",
        options: [
          { value: "nacl", label: "氯化钠 NaCl（M=58.5）" },
          { value: "na2co3", label: "碳酸钠 Na₂CO₃（M=106）" },
        ],
        defaultValue: "nacl",
      },
      { kind: "slider", id: "rinseCount", label: "烧杯与玻璃棒洗涤次数", min: 0, max: 3, step: 1, unit: "次", defaultValue: 2 },
      {
        kind: "select",
        id: "eyeLevel",
        label: "视线位置",
        options: [
          { value: "level", label: "平视刻度线" },
          { value: "up", label: "仰视刻度线" },
          { value: "down", label: "俯视刻度线" },
        ],
        defaultValue: "level",
      },
    ],
    safetyNotes: [
      "容量瓶不能加热，也不能用于配制热的溶液，以免体积不准或炸裂",
      "托盘天平称量时左物右码，砝码必须用镊子夹取",
      "定容时胶头滴管不要伸入瓶口内，防止污染溶液",
    ],
    normalRanges: [
      {
        parameterId: "rinseCount",
        min: 2,
        max: 3,
        label: "洗涤次数",
        note: "洗涤 2–3 次把溶质全部转移",
      },
    ],
    errorScenarios: [
      {
        id: "look-up-overfill",
        label: "仰视刻度线",
        triggerParam: "eyeLevel",
        triggerValue: "up",
        consequence: "仰视刻度线导致加水超过刻度，实际体积偏大，浓度偏低",
        visualCue: "液面高于刻度线，视线与刻度线的交点偏向下方",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "定容时最后加入少量水，应使用——",
        options: [
          { id: "a", text: "玻璃棒" },
          { id: "b", text: "胶头滴管" },
          { id: "c", text: "量筒" },
          { id: "d", text: "洗瓶直接倾倒" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "接近刻度线时必须改用胶头滴管逐滴加入，才能精确控制液面与刻度线相平。直接倾倒很容易超过刻度，使浓度偏低。",
      },
      {
        id: "q2",
        type: "single",
        stem: "未洗涤烧杯和玻璃棒，会使所配溶液的浓度——",
        options: [
          { id: "a", text: "偏高" },
          { id: "b", text: "偏低" },
          { id: "c", text: "无影响" },
          { id: "d", text: "无法判断" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "烧杯和玻璃棒上残留的溶质没有转入容量瓶，溶质的物质的量 n 偏小，而溶液体积 V 不变，由 c = n/V 可知浓度偏低。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列配制步骤中，操作正确的是（多选）——",
        options: [
          { id: "a", text: "溶解后冷却至室温再转移" },
          { id: "b", text: "用蒸馏水洗涤烧杯内壁 2–3 次并转入容量瓶" },
          { id: "c", text: "定容时平视刻度线" },
          { id: "d", text: "容量瓶使用前必须干燥无水" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "热溶液冷却后体积会收缩，必须先冷却再转移；洗涤液必须全部转入以减少溶质损失；平视刻度线才能保证体积准确。容量瓶洗净后残留少量蒸馏水不影响所配浓度，不必干燥。",
      },
    ],
  },
  "en-US": {
    experimentId: "solution-preparation",
    locale: "en-US",
    title: "Preparing a Solution of Known Concentration",
    subtitle: "Volumetric-flask procedure",
    principle:
      "To prepare a solution of known concentration, first compute the required mass m = cVM from the target concentration, flask volume and molar mass, then weigh it and dissolve it in a small beaker. After cooling to room temperature, transfer all of the solution to a volumetric flask, rinse the beaker and rod two or three times into the flask, then make up to the mark and mix. The eye must be level with the mark; looking up or down makes the actual volume differ from the calibration.",
    equipment: [
      "Balance with weights",
      "Beaker (100 mL)",
      "Glass rod",
      "Volumetric flask (100 / 250 / 500 mL)",
      "Dropper",
      "Wash bottle (distilled water)",
    ],
    steps: [
      {
        index: 0,
        title: "Calculate and weigh the solute",
        description:
          "Compute the required mass m = cVM for the chosen concentration and flask, then weigh it accurately on the balance into a clean small beaker.",
        keyPoint: "Weighed mass matches the target concentration",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Dissolve and cool to room temperature",
        description:
          "Add a little distilled water to the beaker, stir with a glass rod until the solid has fully dissolved, then let the solution cool to room temperature before transfer.",
        keyPoint: "Clear solution at room temperature",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Transfer, rinse and make up to the mark",
        description:
          "Guide the solution into the flask with the rod, rinse the beaker and rod two or three times into the flask, add water to just below the mark, then use a dropper until the meniscus sits level with the mark.",
        keyPoint: "All rinsings transferred, meniscus level with the mark",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Mix and analyse the concentration",
        description:
          "Stopper the flask, invert it to mix, then compute the actual concentration from the actual volume and solute loss and identify the direction of the error.",
        keyPoint: "Concentration calculation and error direction",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "targetConcentration", label: "Target concentration", min: 0.1, max: 2.0, step: 0.1, unit: "mol/L", defaultValue: 0.5 },
      {
        kind: "select",
        id: "flaskVolume",
        label: "Flask size",
        options: [
          { value: "100", label: "100 mL flask" },
          { value: "250", label: "250 mL flask" },
          { value: "500", label: "500 mL flask" },
        ],
        defaultValue: "250",
      },
      {
        kind: "select",
        id: "solute",
        label: "Solute",
        options: [
          { value: "nacl", label: "Sodium chloride NaCl (M=58.5)" },
          { value: "na2co3", label: "Sodium carbonate Na₂CO₃ (M=106)" },
        ],
        defaultValue: "nacl",
      },
      { kind: "slider", id: "rinseCount", label: "Rinses of beaker and rod", min: 0, max: 3, step: 1, unit: "times", defaultValue: 2 },
      {
        kind: "select",
        id: "eyeLevel",
        label: "Eye position",
        options: [
          { value: "level", label: "Level with the mark" },
          { value: "up", label: "Looking up at the mark" },
          { value: "down", label: "Looking down at the mark" },
        ],
        defaultValue: "level",
      },
    ],
    safetyNotes: [
      "Never heat a volumetric flask or prepare hot solutions in it; the volume would be wrong and the flask may crack",
      "Weigh with the solid on the left pan and weights on the right, handled only with tweezers",
      "Do not put the dropper inside the flask neck while making up to the mark; it can contaminate the solution",
    ],
    normalRanges: [
      {
        parameterId: "rinseCount",
        min: 2,
        max: 3,
        label: "Rinse count",
        note: "Two or three rinses transfer all the solute.",
      },
    ],
    errorScenarios: [
      {
        id: "look-up-overfill",
        label: "Looking up at the mark",
        triggerParam: "eyeLevel",
        triggerValue: "up",
        consequence: "Looking up adds water past the mark, so the volume is too large and the concentration too low",
        visualCue: "The meniscus sits above the mark and the sight line crosses below it",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "For the final addition of water during make-up, use a —",
        options: [
          { id: "a", text: "glass rod" },
          { id: "b", text: "dropper" },
          { id: "c", text: "measuring cylinder" },
          { id: "d", text: "wash bottle poured directly" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Near the mark you must switch to a dropper and add water dropwise so the meniscus stops exactly at the mark. Pouring directly easily overshoots and lowers the concentration.",
      },
      {
        id: "q2",
        type: "single",
        stem: "If the beaker and rod are not rinsed, the prepared concentration will be —",
        options: [
          { id: "a", text: "too high" },
          { id: "b", text: "too low" },
          { id: "c", text: "unaffected" },
          { id: "d", text: "impossible to tell" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "Solute left on the beaker and rod never reaches the flask, so n is too small while V stays fixed; c = n/V is therefore too low.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which statements about the procedure are correct? (multiple answers)",
        options: [
          { id: "a", text: "Cool the solution to room temperature before transfer" },
          { id: "b", text: "Rinse the beaker wall with distilled water 2–3 times into the flask" },
          { id: "c", text: "Keep the eye level with the mark during make-up" },
          { id: "d", text: "The flask must be completely dry before use" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "A warm solution contracts on cooling, so it must be cooled first; all rinsings must be transferred to avoid solute loss; a level sight line gives the correct volume. A clean flask may still be wet with distilled water — this does not change the prepared concentration, so drying is unnecessary.",
      },
    ],
  },
};
