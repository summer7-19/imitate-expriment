import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const newtonsSecondLawMeta: ExperimentMeta = {
  id: "newtons-second-law",
  category: "senior-physics",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "newtons-second-law",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const newtonsSecondLawContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "newtons-second-law",
    locale: "zh-CN",
    title: "验证牛顿第二定律",
    subtitle: "小车—砝码系统的 a–F 关系",
    principle:
      "牛顿第二定律指出，物体的加速度与所受合外力成正比、与质量成反比，即 a = F/M。本实验用悬挂砝码的重力近似作为小车受到的合外力，用打点计时器记录小车的运动，由纸带上等时间间隔的点求出加速度，再作 a–F 图。若图线是一条过原点的直线，即验证了加速度与合外力成正比；直线的斜率等于 1/M。",
    equipment: [
      "长木板（一端带定滑轮）",
      "实验小车",
      "电磁打点计时器与纸带",
      "钩码（砝码）若干",
      "毫米刻度尺",
      "学生电源与导线",
    ],
    steps: [
      {
        index: 0,
        title: "垫高木板平衡摩擦力",
        description:
          "把长木板不带滑轮的一端垫高，使小车不受绳的拉力时恰好能沿木板匀速下滑。这样重力沿斜面的分力正好抵消摩擦力，小车受到的合外力就等于绳的拉力。",
        keyPoint: "不挂钩码时小车匀速下滑",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "挂砝码释放小车",
        description:
          "把纸带穿过打点计时器的限位孔并固定在小车后端，跨过定滑轮挂上砝码。先接通电源，待打点稳定后再释放小车，纸带上便留下一系列等时间间隔的点。",
        keyPoint: "先通电、后释放，纸带点迹清晰",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "处理纸带求加速度",
        description:
          "在纸带上选取点迹清晰的段，用刻度尺量出相邻相等时间间隔 T 内的位移。由匀变速直线运动的推论 Δs = aT²，用逐差法求出小车的加速度。",
        keyPoint: "等时间间隔，a = Δs / T²",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "作 a–F 图并验证",
        description:
          "改变悬挂砝码的质量，得到多组合外力 F 与加速度 a，在坐标纸上描点连线。若图线过原点且为直线，说明 a ∝ F；由斜率可求出小车质量的倒数。",
        keyPoint: "a–F 图线过原点的直线",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "cartMass", label: "小车质量 M", min: 0.2, max: 1.0, step: 0.05, unit: "kg", defaultValue: 0.5 },
      { kind: "slider", id: "hangingMass", label: "悬挂砝码质量 m", min: 0.01, max: 0.2, step: 0.01, unit: "kg", defaultValue: 0.05 },
      { kind: "toggle", id: "frictionCompensated", label: "已平衡摩擦力", defaultValue: true },
      { kind: "toggle", id: "showGraph", label: "显示 a–F 图", defaultValue: true },
    ],
    safetyNotes: [
      "打点计时器使用低压交流电源，接线和调整前先断开电源",
      "释放小车前确认滑轮转动灵活，砝码不会卡在桌边",
      "纸带穿过限位孔时不要用力拉扯，防止纸带撕裂或计时器损坏",
    ],
    normalRanges: [
      {
        parameterId: "hangingMass",
        min: 0.02,
        max: 0.1,
        label: "悬挂砝码质量",
        note: "需远小于小车质量才近似满足 F≈mg",
      },
    ],
    errorScenarios: [
      {
        id: "friction-uncompensated",
        label: "未平衡摩擦力",
        triggerParam: "frictionCompensated",
        triggerValue: false,
        consequence: "未平衡摩擦力时，a–F 图线不过原点，测得的加速度系统偏小",
        visualCue: "木板水平放置，小车起步迟滞，图线与 F 轴交于正值",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "平衡摩擦力的正确方法是——",
        options: [
          { id: "a", text: "挂上钩码后把木板垫高，使小车加速下滑" },
          { id: "b", text: "不挂钩码时垫高木板，轻推小车使其匀速下滑" },
          { id: "c", text: "把木板垫得很高，让小车自行加速下滑" },
          { id: "d", text: "在木板上铺毛巾，增大摩擦力" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "平衡摩擦力时不挂绳和钩码，只让小车受重力、支持力和摩擦力。反复调整木板倾角，直到轻推小车后它能匀速下滑，此时重力沿斜面的分力恰好抵消摩擦力。挂上钩码后再调倾角会把绳的拉力也算进去。",
      },
      {
        id: "q2",
        type: "single",
        stem: "实验要求悬挂砝码质量远小于小车质量，原因是——",
        options: [
          { id: "a", text: "减小小车的加速度，便于测量" },
          { id: "b", text: "使绳的拉力近似等于砝码重力" },
          { id: "c", text: "防止小车从木板末端滑出" },
          { id: "d", text: "使纸带上的点距更均匀" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "对砝码有 mg − T = ma。只有当 m ≪ M 时 a 很小，绳的拉力 T ≈ mg，才能把砝码重力当作小车受到的合外力。若 m 不满足远小于 M，用 mg 代替拉力会带来明显系统误差。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些原因会造成 a–F 图线不过原点？（多选）",
        options: [
          { id: "a", text: "未平衡摩擦力" },
          { id: "b", text: "平衡摩擦力时木板垫得过高" },
          { id: "c", text: "纸带与限位孔摩擦过大" },
          { id: "d", text: "先接通电源后释放小车" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "未平衡摩擦力时图线在 F 轴上有正截距；木板垫得过高时重力分力大于摩擦力，图线在 a 轴上有正截距；纸带与限位孔摩擦过大相当于额外阻力，同样使图线不过原点。先接通电源后释放小车是正确操作，不会造成截距偏移。",
      },
    ],
  },
  "en-US": {
    experimentId: "newtons-second-law",
    locale: "en-US",
    title: "Verifying Newton's Second Law",
    subtitle: "The a–F relation for a cart-and-weights system",
    principle:
      "Newton's second law states that acceleration is proportional to the net force and inversely proportional to the mass, a = F/M. In this experiment the weight of the hanging masses approximates the net force on the cart, a ticker timer records the motion, and the acceleration is found from equally spaced dots on the tape. An a–F plot through the origin confirms a ∝ F, and its slope equals 1/M.",
    equipment: [
      "Long wooden track with a pulley at one end",
      "Laboratory cart",
      "Spark ticker timer and paper tape",
      "Set of hanging weights",
      "Millimetre ruler",
      "Low-voltage power supply and leads",
    ],
    steps: [
      {
        index: 0,
        title: "Tilt the track to compensate friction",
        description:
          "Raise the end of the track without the pulley until the cart, with no string attached, slides down at constant speed. The component of gravity along the track then cancels friction, so the net force on the cart equals the string tension.",
        keyPoint: "No weights: the cart slides at constant speed",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Release the cart with hanging weights",
        description:
          "Thread the tape through the timer and attach it to the cart, then hang the weights over the pulley. Switch on the timer first, wait for steady dots, then release the cart so the tape carries a series of equally timed dots.",
        keyPoint: "Power on first, then release; clear dots",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Reduce the tape to find acceleration",
        description:
          "Choose a clean section of the tape and measure the displacements in successive equal intervals T. For uniformly accelerated motion Δs = aT², so the acceleration follows from the successive differences of the displacements.",
        keyPoint: "Equal time intervals, a = Δs / T²",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Plot a–F and verify linearity",
        description:
          "Repeat with different hanging weights to obtain several force–acceleration pairs, then plot them. A straight line through the origin shows a ∝ F, and its slope gives the reciprocal of the cart mass.",
        keyPoint: "A straight a–F line through the origin",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "cartMass", label: "Cart mass M", min: 0.2, max: 1.0, step: 0.05, unit: "kg", defaultValue: 0.5 },
      { kind: "slider", id: "hangingMass", label: "Hanging mass m", min: 0.01, max: 0.2, step: 0.01, unit: "kg", defaultValue: 0.05 },
      { kind: "toggle", id: "frictionCompensated", label: "Friction compensated", defaultValue: true },
      { kind: "toggle", id: "showGraph", label: "Show a–F graph", defaultValue: true },
    ],
    safetyNotes: [
      "Use a low-voltage AC supply for the timer and disconnect it before wiring or adjustment",
      "Check that the pulley turns freely and the weights cannot catch on the table edge before release",
      "Do not tug the tape through the guide slot; a torn tape can damage the timer",
    ],
    normalRanges: [
      {
        parameterId: "hangingMass",
        min: 0.02,
        max: 0.1,
        label: "Hanging mass",
        note: "Must stay well below the cart mass so F≈mg.",
      },
    ],
    errorScenarios: [
      {
        id: "friction-uncompensated",
        label: "Friction not compensated",
        triggerParam: "frictionCompensated",
        triggerValue: false,
        consequence: "Without compensation the a–F line misses the origin and accelerations read systematically low",
        visualCue: "The level track makes the cart hesitate and the line intercepts the F axis above zero",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "The correct way to compensate friction is to —",
        options: [
          { id: "a", text: "tilt the track with the weights attached so the cart accelerates" },
          { id: "b", text: "tilt the track with no weights attached and give the cart a gentle push so it moves at constant speed" },
          { id: "c", text: "raise the track steeply and let the cart accelerate freely" },
          { id: "d", text: "lay a towel on the track to increase friction" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "With no string or weights attached, the cart feels only gravity, the normal force and friction. Adjust the tilt until a gently pushed cart slides at constant speed; the downhill component of gravity then exactly cancels friction. Adjusting the tilt with weights attached would wrongly include the tension.",
      },
      {
        id: "q2",
        type: "single",
        stem: "Why must the hanging mass be much smaller than the cart mass?",
        options: [
          { id: "a", text: "To reduce the acceleration so it is easier to measure" },
          { id: "b", text: "So that the string tension is approximately equal to the weight of the hanging masses" },
          { id: "c", text: "To stop the cart running off the end of the track" },
          { id: "d", text: "To make the dot spacing on the tape more uniform" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "For the hanging masses mg − T = ma. Only when m ≪ M is a small enough that T ≈ mg, allowing the weight to stand in for the net force on the cart. Otherwise using mg as the force introduces a clear systematic error.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these make the a–F line miss the origin? (multiple answers)",
        options: [
          { id: "a", text: "Friction was not compensated" },
          { id: "b", text: "The track was tilted too steeply during compensation" },
          { id: "c", text: "The tape rubs heavily against the guide slot" },
          { id: "d", text: "The timer is switched on before the cart is released" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "Uncompensated friction leaves a positive intercept on the F axis; over-tilting leaves a positive intercept on the a axis; heavy tape friction acts as extra drag and shifts the line as well. Switching on the timer before release is the correct procedure and does not shift the intercept.",
      },
    ],
  },
};
