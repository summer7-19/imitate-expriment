import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const reactionRateFactorsMeta: ExperimentMeta = {
  id: "reaction-rate-factors",
  category: "senior-chemistry",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "reaction-rate-factors",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const reactionRateFactorsContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "reaction-rate-factors",
    locale: "zh-CN",
    title: "探究影响化学反应速率的因素",
    subtitle: "温度、浓度、催化剂与接触面积",
    principle:
      "化学反应速率由单位时间内反应物浓度的减少或生成物浓度的增加来衡量。温度升高使活化分子比例增大，反应速率通常加快；增大反应物浓度、加入催化剂或把块状固体磨成粉末，都能增加单位时间内有效碰撞的次数。本实验用气体注射器收集石灰石与稀盐酸反应生成的 CO₂，以气体体积—时间曲线的斜率比较相对速率，并用控制变量法逐一研究各因素的影响。",
    equipment: [
      "锥形瓶（带导管）",
      "石灰石（块状与粉末）",
      "稀盐酸（0.1–1.0 mol/L）",
      "水浴与温度计",
      "气体注射器（带刻度）",
      "催化剂 MnO₂",
    ],
    steps: [
      {
        index: 0,
        title: "明确变量并控制其他条件相同",
        description:
          "用控制变量法设计实验：每一组只改变一个因素，其余条件保持一致，使用相同质量的石灰石、相同体积的酸和同一套收集装置，并记录注射器读数与对应时间。",
        keyPoint: "每次只改变一个因素",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "探究温度的影响",
        description:
          "把锥形瓶放入水浴，分别设定 30 ℃、45 ℃、60 ℃，加入等浓度等体积的稀盐酸，比较相同时间内收集到的气体体积。温度越高，气泡产生越剧烈，曲线越陡。",
        keyPoint: "温度升高，气体体积增长更快",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "探究浓度、催化剂与接触面积的影响",
        description:
          "保持水浴温度 25 ℃，依次改变稀盐酸浓度、加入少量 MnO₂、把石灰石由块状换成粉末，重复实验并记录注射器读数，分别与基准实验比较。",
        keyPoint: "浓度、催化剂与接触面积各自改变速率",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "绘制气体体积—时间曲线",
        description:
          "以反应时间为横轴、收集到的 CO₂ 体积为纵轴作图，用曲线的斜率比较平均速率：斜率越大，单位时间内生成的气体越多，反应速率越大。",
        keyPoint: "斜率越大，反应速率越大",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "temperature", label: "水浴温度", min: 20, max: 80, step: 5, unit: "°C", defaultValue: 25 },
      { kind: "slider", id: "concentration", label: "稀盐酸浓度", min: 0.1, max: 1.0, step: 0.1, unit: "mol/L", defaultValue: 0.5 },
      { kind: "toggle", id: "catalyst", label: "加入催化剂（MnO₂）", defaultValue: false },
      { kind: "toggle", id: "powder", label: "石灰石为粉末", defaultValue: false },
      { kind: "toggle", id: "controlled", label: "其他条件保持不变", defaultValue: true },
    ],
    safetyNotes: [
      "稀盐酸具有腐蚀性，避免接触皮肤和眼睛；若不慎沾到，立即用大量清水冲洗",
      "水浴温度较高，取放锥形瓶时应戴隔热手套，防止烫伤",
      "收集到的气体缓慢排出，不要对着火源；实验结束先撤导管，再停止加热",
    ],
    normalRanges: [
      {
        parameterId: "temperature",
        min: 25,
        max: 60,
        label: "水浴温度",
        note: "温度过高水分蒸发快，读数不稳",
      },
    ],
    errorScenarios: [
      {
        id: "confounded-variables",
        label: "同时改变温度与浓度",
        triggerParam: "controlled",
        triggerValue: false,
        consequence:
          "同时改变温度与浓度，无法判断是哪一因素导致速率变化，实验失去控制变量意义",
        visualCue: "两支锥形瓶同时升温并加酸，气泡速率对比无法归因",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "本实验探究温度的影响时，应保持不变的是——",
        options: [
          { id: "a", text: "酸的浓度与石灰石的表面积" },
          { id: "b", text: "水浴温度" },
          { id: "c", text: "收集到的气体体积" },
          { id: "d", text: "反应时间" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "探究温度的影响时，温度是自变量，酸的浓度、石灰石的表面积、质量等其他条件都必须相同，这样速率差异才能归因于温度。",
      },
      {
        id: "q2",
        type: "single",
        stem: "把石灰石磨成粉末会加快反应速率，原因是——",
        options: [
          { id: "a", text: "增大了固体与酸的接触面积" },
          { id: "b", text: "增大了盐酸的浓度" },
          { id: "c", text: "降低了体系的温度" },
          { id: "d", text: "改变了反应的活化能" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "粉末状固体的表面积更大，与酸接触的界面更广，单位时间内有效碰撞次数增多，速率加快；活化能由反应本性决定，只有催化剂能明显改变它。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些因素会影响化学反应速率？（多选）",
        options: [
          { id: "a", text: "温度" },
          { id: "b", text: "反应物浓度" },
          { id: "c", text: "催化剂" },
          { id: "d", text: "容器的形状" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "温度、反应物浓度、催化剂以及固体的接触面积都会改变有效碰撞的频率，从而影响速率；容器形状不改变浓度、温度或接触面积，不影响速率。",
      },
    ],
  },
  "en-US": {
    experimentId: "reaction-rate-factors",
    locale: "en-US",
    title: "Factors Affecting Reaction Rate",
    subtitle: "Temperature, concentration, catalyst and surface area",
    principle:
      "Reaction rate is measured as the change in reactant or product concentration per unit time. A higher temperature raises the fraction of activated molecules, so the rate usually increases. Raising reactant concentration, adding a catalyst, or grinding a solid into powder increases the number of effective collisions per unit time. Here CO₂ from marble and dilute hydrochloric acid is collected in a gas syringe, and the slope of the gas-volume–time curve is used to compare relative rates while one variable at a time is changed.",
    equipment: [
      "Conical flask with delivery tube",
      "Marble, both block and powder",
      "Dilute hydrochloric acid (0.1–1.0 mol/L)",
      "Water bath and thermometer",
      "Graduated gas syringe",
      "MnO₂ catalyst",
    ],
    steps: [
      {
        index: 0,
        title: "Define variables and hold the rest constant",
        description:
          "Plan a controlled-variable experiment: change only one factor in each trial and keep everything else identical — the same mass of marble, the same acid volume and the same collecting apparatus. Record the syringe reading against time.",
        keyPoint: "Change one factor at a time",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Test temperature",
        description:
          "Place the flask in the water bath at 30 °C, 45 °C and 60 °C, add equal volumes of acid of the same concentration, and compare the gas volumes collected in equal times. Hotter runs bubble faster and give steeper curves.",
        keyPoint: "Hotter bath, faster gas evolution",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Test concentration, catalyst and surface area",
        description:
          "Keep the bath at 25 °C and, in turn, change the acid concentration, add a little MnO₂, and replace block marble with powder. Repeat each trial and compare its syringe readings with the baseline run.",
        keyPoint: "Concentration, catalyst and contact area each change the rate",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Plot gas volume against time",
        description:
          "Plot collected CO₂ volume against reaction time and use the slope to compare average rates: a steeper slope means more gas per second and therefore a faster reaction.",
        keyPoint: "Steeper slope means a faster rate",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "temperature", label: "Water-bath temperature", min: 20, max: 80, step: 5, unit: "°C", defaultValue: 25 },
      { kind: "slider", id: "concentration", label: "Acid concentration", min: 0.1, max: 1.0, step: 0.1, unit: "mol/L", defaultValue: 0.5 },
      { kind: "toggle", id: "catalyst", label: "Add catalyst (MnO₂)", defaultValue: false },
      { kind: "toggle", id: "powder", label: "Marble as powder", defaultValue: false },
      { kind: "toggle", id: "controlled", label: "Keep other variables constant", defaultValue: true },
    ],
    safetyNotes: [
      "Dilute hydrochloric acid is corrosive; avoid skin and eye contact and rinse copiously with water if exposed",
      "The water bath is hot; use heat-resistant gloves when handling the flask",
      "Vent the collected gas away from flames and remove the delivery tube before stopping the heating",
    ],
    normalRanges: [
      {
        parameterId: "temperature",
        min: 25,
        max: 60,
        label: "Water-bath temperature",
        note: "Too hot evaporates water and destabilises readings",
      },
    ],
    errorScenarios: [
      {
        id: "confounded-variables",
        label: "Temperature and concentration changed together",
        triggerParam: "controlled",
        triggerValue: false,
        consequence:
          "Changing temperature and concentration together makes the cause of the rate change ambiguous",
        visualCue:
          "Two flasks heat up and receive acid at once, so the bubble rates cannot be attributed",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "When testing the effect of temperature, which must be kept constant?",
        options: [
          { id: "a", text: "Acid concentration and marble surface area" },
          { id: "b", text: "Water-bath temperature" },
          { id: "c", text: "Collected gas volume" },
          { id: "d", text: "Reaction time" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Temperature is the independent variable here. Acid concentration, marble surface area and mass must stay the same so that any change in rate can be attributed to temperature alone.",
      },
      {
        id: "q2",
        type: "single",
        stem: "Grinding marble into powder speeds up the reaction because it —",
        options: [
          { id: "a", text: "increases the contact area between solid and acid" },
          { id: "b", text: "increases the acid concentration" },
          { id: "c", text: "lowers the temperature of the mixture" },
          { id: "d", text: "changes the activation energy of the reaction" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "Powder exposes far more surface to the acid, so effective collisions per second increase and the rate rises. Activation energy is a property of the reaction itself; only a catalyst changes it appreciably.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which factors affect the rate of a chemical reaction? (multiple answers)",
        options: [
          { id: "a", text: "Temperature" },
          { id: "b", text: "Reactant concentration" },
          { id: "c", text: "Catalyst" },
          { id: "d", text: "Shape of the container" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "Temperature, reactant concentration, catalysts and the contact area of solids all change the frequency of effective collisions and hence the rate. The container shape does not alter concentration, temperature or contact area.",
      },
    ],
  },
};
