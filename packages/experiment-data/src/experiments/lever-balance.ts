import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 330];

export const leverBalanceMeta: ExperimentMeta = {
  id: "lever-balance",
  category: "junior-physics",
  difficulty: 1,
  modes: ["animation"],
  compositionId: "lever-balance",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const leverBalanceContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "lever-balance",
    locale: "zh-CN",
    title: "探究杠杆平衡条件",
    subtitle: "力臂与力矩的关系",
    principle:
      "杠杆平衡时，动力与动力臂的乘积等于阻力与阻力臂的乘积，即 F₁L₁ = F₂L₂。力臂是支点到力的作用线的距离；把杠杆调到水平平衡后，力臂可以直接由支点到悬挂点的距离读出。",
    equipment: [
      "带刻度的杠杆",
      "支架与支点",
      "钩码（每个 0.5 N）",
      "平衡螺母",
      "水平泡",
      "刻度尺",
    ],
    steps: [
      {
        index: 0,
        title: "调节杠杆水平平衡",
        description:
          "把杠杆安装在支架上，先不挂钩码，调节两端的平衡螺母，使杠杆在水平位置平衡、水平泡居中。",
        keyPoint: "不挂钩码时杠杆水平",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "左侧挂钩码并读数",
        description:
          "在支点左侧的某一位置挂上钩码，读出左侧拉力 F₁ 和支点到悬挂点的距离 L₁。",
        keyPoint: "F₁ 与 L₁ 的读数",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "右侧挂钩码调至平衡",
        description:
          "在右侧挂上不同数量的钩码，并移动悬挂位置，直到杠杆重新在水平位置平衡，记录 F₂ 与 L₂。",
        keyPoint: "杠杆重新水平平衡",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "验证 F₁L₁ = F₂L₂",
        description:
          "分别计算两侧的力矩 F₁L₁ 与 F₂L₂，比较二者是否相等；若相差较大，检查力臂读数与挂钩位置。",
        keyPoint: "两侧力矩相等",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "leftForce", label: "左侧钩码重力", min: 0.5, max: 5, step: 0.5, unit: "N", defaultValue: 2 },
      { kind: "slider", id: "leftArm", label: "左侧力臂", min: 5, max: 30, step: 1, unit: "cm", defaultValue: 20 },
      { kind: "slider", id: "rightForce", label: "右侧钩码重力", min: 0.5, max: 5, step: 0.5, unit: "N", defaultValue: 2 },
      { kind: "slider", id: "rightArm", label: "右侧力臂", min: 5, max: 30, step: 1, unit: "cm", defaultValue: 20 },
      { kind: "slider", id: "hookOffset", label: "右侧挂钩位置偏差", min: -6, max: 6, step: 0.5, unit: "cm", defaultValue: 0 },
    ],
    safetyNotes: [
      "钩码要轻拿轻放，防止掉落砸伤脚",
      "杠杆与支架安装牢固，避免支架倾倒",
      "不要用力按压杠杆一端，防止钩码滑落",
    ],
    normalRanges: [
      {
        parameterId: "hookOffset",
        min: -1,
        max: 1,
        label: "右侧挂钩位置偏差",
        note: "偏差过大时杠杆明显倾斜",
      },
    ],
    errorScenarios: [
      {
        id: "hook-offset",
        label: "右侧挂钩位置偏差过大",
        triggerParam: "hookOffset",
        triggerValue: 5,
        consequence: "杠杆失去水平平衡，F₁L₁ ≠ F₂L₂",
        visualCue: "杠杆向左侧倾斜，水平泡偏离中央",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "杠杆平衡的条件是——",
        options: [
          { id: "a", text: "F₁L₁ = F₂L₂" },
          { id: "b", text: "F₁L₂ = F₂L₁" },
          { id: "c", text: "F₁ / L₁ = F₂ / L₂" },
          { id: "d", text: "F₁ + L₁ = F₂ + L₂" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "杠杆平衡时两侧力矩大小相等：动力×动力臂 = 阻力×阻力臂，即 F₁L₁ = F₂L₂。",
      },
      {
        id: "q2",
        type: "single",
        stem: "保持左侧钩码和力臂不变，只增大右侧力臂，为了使杠杆重新平衡，应——",
        options: [
          { id: "a", text: "增大右侧钩码" },
          { id: "b", text: "减小右侧钩码" },
          { id: "c", text: "增大左侧力臂" },
          { id: "d", text: "把支点向右移动" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "左侧力矩不变，右侧力臂增大后右侧力矩变大，只有减小右侧钩码（减小 F₂）才能使 F₂L₂ 回到原来的大小。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "实验中调节杠杆在水平位置平衡，下列说法正确的是（多选）",
        options: [
          { id: "a", text: "便于直接读出力臂" },
          { id: "b", text: "消除杠杆自重对平衡的影响" },
          { id: "c", text: "应在挂钩码前调节平衡螺母" },
          { id: "d", text: "应在挂上钩码后调节平衡螺母" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "杠杆水平时，支点到悬挂点的距离就是力臂，便于读数；不挂钩码时调平衡螺母，可使杠杆自重的作用线通过支点，从而不影响实验。挂上钩码后不能再调平衡螺母，否则会改变实验条件。",
      },
    ],
  },
  "en-US": {
    experimentId: "lever-balance",
    locale: "en-US",
    title: "Lever Balance",
    subtitle: "The relation between forces and arms",
    principle:
      "A lever balances when the effort times its arm equals the load times its arm: F₁L₁ = F₂L₂. An arm is the distance from the fulcrum to the line of action of the force; with the lever horizontal, it can be read directly as the distance from the fulcrum to the hook.",
    equipment: [
      "Lever with a scale",
      "Stand and fulcrum",
      "Hooked weights (0.5 N each)",
      "Balance nuts",
      "Spirit level",
      "Ruler",
    ],
    steps: [
      {
        index: 0,
        title: "Level the lever",
        description:
          "Mount the lever on the stand without weights, then turn the balance nuts at both ends until the beam is horizontal and the level bubble sits in the centre.",
        keyPoint: "Horizontal with no weights",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Hang the left weights",
        description:
          "Hang hooked weights at a chosen position left of the fulcrum and read the left force F₁ and the arm L₁ (distance from the fulcrum to the hook).",
        keyPoint: "Readings of F₁ and L₁",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Balance with the right weights",
        description:
          "Hang a different number of weights on the right and slide the hook until the lever is horizontal again; record F₂ and L₂.",
        keyPoint: "The lever returns to horizontal",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Verify F₁L₁ = F₂L₂",
        description:
          "Compute both torques F₁L₁ and F₂L₂ and compare them; a large mismatch means a misread arm or a shifted hook.",
        keyPoint: "Equal torques on both sides",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "leftForce", label: "Left weight", min: 0.5, max: 5, step: 0.5, unit: "N", defaultValue: 2 },
      { kind: "slider", id: "leftArm", label: "Left arm", min: 5, max: 30, step: 1, unit: "cm", defaultValue: 20 },
      { kind: "slider", id: "rightForce", label: "Right weight", min: 0.5, max: 5, step: 0.5, unit: "N", defaultValue: 2 },
      { kind: "slider", id: "rightArm", label: "Right arm", min: 5, max: 30, step: 1, unit: "cm", defaultValue: 20 },
      { kind: "slider", id: "hookOffset", label: "Right hook offset", min: -6, max: 6, step: 0.5, unit: "cm", defaultValue: 0 },
    ],
    safetyNotes: [
      "Handle the hooked weights gently so they do not fall on your feet",
      "Clamp the lever and stand firmly to prevent the apparatus from tipping",
      "Do not press down on one end of the beam; the weights may slide off",
    ],
    normalRanges: [
      {
        parameterId: "hookOffset",
        min: -1,
        max: 1,
        label: "Right hook offset",
        note: "A large offset tilts the lever visibly",
      },
    ],
    errorScenarios: [
      {
        id: "hook-offset",
        label: "Large right hook offset",
        triggerParam: "hookOffset",
        triggerValue: 5,
        consequence: "The lever tips: F₁L₁ ≠ F₂L₂",
        visualCue: "The beam tilts left and the level bubble leaves centre",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "The condition for a lever to balance is —",
        options: [
          { id: "a", text: "F₁L₁ = F₂L₂" },
          { id: "b", text: "F₁L₂ = F₂L₁" },
          { id: "c", text: "F₁ / L₁ = F₂ / L₂" },
          { id: "d", text: "F₁ + L₁ = F₂ + L₂" },
        ],
        correctOptionIds: ["a"],
        explanation:
          "When a lever balances, the torques are equal: effort × effort arm = load × load arm, so F₁L₁ = F₂L₂.",
      },
      {
        id: "q2",
        type: "single",
        stem: "With the left weight and arm unchanged, only the right arm is increased. To restore balance you should —",
        options: [
          { id: "a", text: "increase the right weights" },
          { id: "b", text: "decrease the right weights" },
          { id: "c", text: "increase the left arm" },
          { id: "d", text: "move the fulcrum to the right" },
        ],
        correctOptionIds: ["b"],
        explanation:
          "The left torque is unchanged, so a longer right arm gives a larger right torque. Reducing the right force brings F₂L₂ back to the left torque.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Adjusting the lever to horizontal in this experiment — (multiple answers)",
        options: [
          { id: "a", text: "lets the arms be read directly" },
          { id: "b", text: "removes the effect of the lever's own weight" },
          { id: "c", text: "should be done with the balance nuts before hanging weights" },
          { id: "d", text: "should be done with the balance nuts after hanging weights" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation:
          "With the beam horizontal, the arm equals the distance from the fulcrum to the hook. Levelling the empty lever puts its own weight through the fulcrum, so it does not affect the result. The nuts must be adjusted before hanging weights; changing them afterwards alters the experiment.",
      },
    ],
  },
};
