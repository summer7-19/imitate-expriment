import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [360, 420, 300, 330];

export const acidBaseTitrationMeta: ExperimentMeta = {
  id: "acid-base-titration",
  category: "chemistry",
  difficulty: 1,
  modes: ["animation", "virtual-ops"],
  compositionId: "acid-base-titration",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const acidBaseTitrationContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "acid-base-titration",
    locale: "zh-CN",
    title: "酸碱滴定",
    subtitle: "指示剂法测定终点",
    principle:
      "用已知浓度的 NaOH 标准溶液滴定一定体积的盐酸，中和反应进行时溶液 pH 在等当点附近发生突跃。选择变色范围落在突跃区内的指示剂，变色即为终点判据，由消耗的碱液体积即可计算待测酸浓度。",
    equipment: [
      "碱式滴定管（50 mL）",
      "锥形瓶（250 mL）",
      "移液管（25 mL）与洗耳球",
      "铁架台与滴定管夹",
      "洗瓶",
    ],
    steps: [
      {
        index: 0,
        title: "装液与读数",
        description: "洗净滴定管并装入 NaOH 标准液，排出尖嘴气泡，调节液面至刻度，记录初读数。",
        keyPoint: "滴定管液面与初读数 0.00 mL",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "缓慢滴加",
        description: "左手控制活塞（或玻璃珠），右手持锥形瓶旋转摇动，全程注视瓶内颜色变化。",
        keyPoint: "液滴落下节奏与瓶内局部变色",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "终点判定",
        description: "接近终点时逐滴（甚至半滴）加入，指示剂变色且半分钟内不褪色即达终点，记录终读数。",
        keyPoint: "颜色突变的瞬间与终读数",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "数据与结论",
        description: "由 c(HCl) = c(NaOH)·V(NaOH) / V(HCl) 计算待测酸浓度，分析误差来源。",
        keyPoint: "滴定曲线与等当点标注",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "acidConcentration", label: "盐酸浓度", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "baseConcentration", label: "NaOH 浓度", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "acidVolume", label: "移取盐酸体积", min: 10, max: 40, step: 1, unit: "mL", defaultValue: 25 },
      {
        kind: "select",
        id: "indicator",
        label: "指示剂",
        options: [
          { value: "phenolphthalein", label: "酚酞" },
          { value: "methylOrange", label: "甲基橙" },
        ],
        defaultValue: "phenolphthalein",
      },
      { kind: "slider", id: "overshoot", label: "滴定过量体积", min: 0, max: 2, step: 0.1, unit: "mL", defaultValue: 0 },
      { kind: "toggle", id: "showCurve", label: "显示滴定曲线", defaultValue: true },
    ],
    safetyNotes: [
      "NaOH 具强腐蚀性，接触皮肤立即用大量清水冲洗",
      "移液管必须配合洗耳球使用，严禁口吸",
      "滴定管使用后洗净倒置夹放",
    ],
    normalRanges: [
      { parameterId: "overshoot", min: 0, max: 0.2, label: "终点过冲体积", note: "教学简化范围，非标准规范" },
    ],
    errorScenarios: [
      {
        id: "titration-overshoot",
        label: "滴定过量",
        triggerParam: "overshoot",
        triggerValue: 1.5,
        consequence: "瓶内颜色过深，终读数偏大，计算出的酸浓度偏高",
        visualCue: "溶液变为深品红色，滴定曲线越过等当点后继续上升",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "本实验中，酚酞由无色变为粉红且半分钟内不褪色，说明——",
        options: [
          { id: "a", text: "碱液已过量较多，实验失败" },
          { id: "b", text: "达到滴定终点，可以读数" },
          { id: "c", text: "指示剂已失效" },
          { id: "d", text: "溶液温度过高" },
        ],
        correctOptionIds: ["b"],
        explanation: "酚酞变色范围为 pH 8.2–10.0，恰落在强碱滴定强酸的突跃区间内；“变色且半分钟不褪色”是终点判据，不是过量标志。",
      },
      {
        id: "q2",
        type: "single",
        stem: "若滴定前滴定管尖嘴处有气泡、滴定后气泡消失，对测定结果的影响是——",
        options: [
          { id: "a", text: "结果偏小" },
          { id: "b", text: "结果偏大" },
          { id: "c", text: "无影响" },
          { id: "d", text: "无法判断" },
        ],
        correctOptionIds: ["b"],
        explanation: "气泡占据的体积被计入消耗的碱液读数，V(NaOH) 偏大，由 c(HCl) = c(NaOH)·V / V₀ 算得的酸浓度偏高。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些操作会滴定管读数产生误差？（多选）",
        options: [
          { id: "a", text: "读数时视线与凹液面最低点不水平" },
          { id: "b", text: "滴定前用待装液润洗滴定管" },
          { id: "c", text: "终点前用蒸馏水冲洗瓶内壁" },
          { id: "d", text: "滴定管尖嘴悬挂一滴液体未落入瓶内即读数" },
        ],
        correctOptionIds: ["a", "d"],
        explanation: "视线不平会直接读错刻度；尖嘴悬滴使读数大于实际进入瓶内的体积。润洗滴定管与终点前冲壁都是规范操作，不引入误差（冲壁的水会被后续滴定消耗）。"
      },
    ],
  },
  "en-US": {
    experimentId: "acid-base-titration",
    locale: "en-US",
    title: "Acid-Base Titration",
    subtitle: "Finding the endpoint with an indicator",
    principle:
      "A hydrochloric acid sample of known volume is titrated with a standardized NaOH solution. The solution pH jumps sharply near the equivalence point; an indicator whose transition range falls inside the jump signals the endpoint, and the consumed base volume gives the acid concentration.",
    equipment: [
      "Burette, base type (50 mL)",
      "Erlenmeyer flask (250 mL)",
      "Pipette (25 mL) with rubber bulb",
      "Stand and burette clamp",
      "Wash bottle",
    ],
    steps: [
      {
        index: 0,
        title: "Fill and read",
        description: "Rinse and fill the burette with standard NaOH, expel the air bubble, set the meniscus to the mark and record the initial reading.",
        keyPoint: "Burette level and initial reading 0.00 mL",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Titrate slowly",
        description: "Control the valve with the left hand and swirl the flask with the right, watching the color throughout.",
        keyPoint: "Drop rhythm and local color flashes in the flask",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Judge the endpoint",
        description: "Near the endpoint add drop by drop; the endpoint is reached when the color persists for 30 s. Record the final reading.",
        keyPoint: "The instant of the color jump and the final reading",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Data and conclusion",
        description: "Compute c(HCl) = c(NaOH)·V(NaOH) / V(HCl) and analyze error sources.",
        keyPoint: "Titration curve and equivalence-point marker",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "acidConcentration", label: "HCl concentration", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "baseConcentration", label: "NaOH concentration", min: 0.05, max: 0.5, step: 0.01, unit: "mol/L", defaultValue: 0.1 },
      { kind: "slider", id: "acidVolume", label: "Pipetted HCl volume", min: 10, max: 40, step: 1, unit: "mL", defaultValue: 25 },
      {
        kind: "select",
        id: "indicator",
        label: "Indicator",
        options: [
          { value: "phenolphthalein", label: "Phenolphthalein" },
          { value: "methylOrange", label: "Methyl orange" },
        ],
        defaultValue: "phenolphthalein",
      },
      { kind: "slider", id: "overshoot", label: "Overshot volume", min: 0, max: 2, step: 0.1, unit: "mL", defaultValue: 0 },
      { kind: "toggle", id: "showCurve", label: "Show titration curve", defaultValue: true },
    ],
    safetyNotes: [
      "NaOH is highly corrosive; flush with plenty of water immediately if it touches skin",
      "Always use a rubber bulb with the pipette — never mouth-pipette",
      "Clean the burette and clamp it upside-down after use",
    ],
    normalRanges: [
      { parameterId: "overshoot", min: 0, max: 0.2, label: "Endpoint overshoot", note: "Simplified teaching range, not a standard" },
    ],
    errorScenarios: [
      {
        id: "titration-overshoot",
        label: "Overshooting the endpoint",
        triggerParam: "overshoot",
        triggerValue: 1.5,
        consequence: "The color becomes too dark, the final reading is too large and the computed acid concentration reads high",
        visualCue: "The solution turns deep magenta and the curve keeps rising past the equivalence point",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "Phenolphthalein turns pink and the color persists for 30 s. This means —",
        options: [
          { id: "a", text: "far too much base was added; the run failed" },
          { id: "b", text: "the endpoint is reached and can be read" },
          { id: "c", text: "the indicator has gone bad" },
          { id: "d", text: "the solution is too hot" },
        ],
        correctOptionIds: ["b"],
        explanation: "Phenolphthalein changes between pH 8.2 and 10.0, inside the jump of a strong-base/strong-acid titration. A persistent pink is the endpoint criterion, not an overshoot.",
      },
      {
        id: "q2",
        type: "single",
        stem: "An air bubble below the stopcock disappears during the titration. The result will be —",
        options: [
          { id: "a", text: "too low" },
          { id: "b", text: "too high" },
          { id: "c", text: "unaffected" },
          { id: "d", text: "impossible to tell" },
        ],
        correctOptionIds: ["b"],
        explanation: "The bubble volume is counted as delivered base, so V(NaOH) reads large and c(HCl) = c(NaOH)·V / V₀ comes out high.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these introduce a burette reading error? (multiple answers)",
        options: [
          { id: "a", text: "Eye level not horizontal with the meniscus bottom" },
          { id: "b", text: "Rinsing the burette with the solution before filling" },
          { id: "c", text: "Rinsing the flask wall with distilled water near the endpoint" },
          { id: "d", text: "Reading while a drop still hangs at the tip" },
        ],
        correctOptionIds: ["a", "d"],
        explanation: "A non-horizontal sight line misreads the scale; a hanging drop makes the reading larger than what actually entered the flask. Rinsing the burette with titrant and rinsing the flask wall are both correct practice.",
      },
    ],
  },
};
