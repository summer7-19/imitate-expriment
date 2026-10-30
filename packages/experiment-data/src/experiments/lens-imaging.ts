import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [300, 360, 390, 300];

export const lensImagingMeta: ExperimentMeta = {
  id: "lens-imaging",
  category: "junior-physics",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "lens-imaging",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const lensImagingContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "lens-imaging",
    locale: "zh-CN",
    title: "凸透镜成像规律",
    subtitle: "用光具座探究物距、像距与焦距的关系",
    principle:
      "凸透镜对光线有会聚作用。物距 u 与焦距 f 满足不同关系时，像的虚实、正倒和大小随之改变；定量关系由薄透镜公式 1/f = 1/u + 1/v 描述，像距 v 为负表示虚像。",
    equipment: [
      "光具座（带刻度）",
      "凸透镜（f = 10 cm）",
      "蜡烛或 LED 光源",
      "光屏",
      "刻度尺",
      "火柴",
    ],
    steps: [
      {
        index: 0,
        title: "共轴调节",
        description:
          "把蜡烛、凸透镜、光屏依次装在光具座上，调节三者中心在同一高度，并使透镜与光具座垂直，像才会落在光屏中央。",
        keyPoint: "三者中心等高、透镜与光具座垂直",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "确定物距与焦距",
        description:
          "固定透镜位置，记录焦距 f；把蜡烛移到设定的物距 u 处并点燃，观察从烛焰发出的光经透镜折射后的走向。",
        keyPoint: "物距 u 与焦距 f 的读数",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "移动光屏找像",
        description:
          "沿光具座缓慢移动光屏，直到屏上出现最清晰的像，记录像距 v；若无论怎样移动光屏都得不到像，说明成的是虚像。",
        keyPoint: "像由模糊变清晰的瞬间",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "记录与分析",
        description:
          "由 v 的正负判断实像或虚像，由放大率判断像的大小，再用 1/f = 1/u + 1/v 核对测量结果并分析误差。",
        keyPoint: "u、v、f 的定量关系",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "focalLength", label: "凸透镜焦距 f", min: 5, max: 20, step: 0.5, unit: "cm", defaultValue: 10 },
      { kind: "slider", id: "objectDistance", label: "物距 u", min: 5, max: 60, step: 0.5, unit: "cm", defaultValue: 30 },
      { kind: "slider", id: "objectHeight", label: "烛焰高度", min: 2, max: 6, step: 0.5, unit: "cm", defaultValue: 4 },
      { kind: "slider", id: "screenOffset", label: "光屏位置偏差", min: -8, max: 8, step: 0.5, unit: "cm", defaultValue: 0 },
      { kind: "toggle", id: "showRays", label: "显示光路", defaultValue: true },
    ],
    safetyNotes: [
      "使用蜡烛时远离可燃物，实验结束及时熄灭",
      "取放透镜时捏镜片边缘，不要用手直接接触镜面",
      "移动光具座上的元件要轻拿轻放，防止透镜跌落",
    ],
    normalRanges: [
      { parameterId: "screenOffset", min: -1.5, max: 1.5, label: "光屏位置偏差", note: "偏离超过 1.5 cm 时像明显模糊" },
    ],
    errorScenarios: [
      {
        id: "object-inside-focus",
        label: "物距小于焦距",
        triggerParam: "objectDistance",
        triggerValue: 4,
        consequence: "不能在光屏上得到实像，只能透过透镜看到正立、放大的虚像",
        visualCue: "光屏上只有一片模糊光斑，折射光线发散，虚像用虚线画在物体同侧",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "当物距大于 2 倍焦距时，凸透镜成的像是——",
        options: [
          { id: "a", text: "倒立、放大的实像" },
          { id: "b", text: "倒立、缩小的实像" },
          { id: "c", text: "正立、放大的虚像" },
          { id: "d", text: "正立、缩小的虚像" },
        ],
        correctOptionIds: ["b"],
        explanation: "u > 2f 时，像距满足 f < v < 2f，放大率绝对值小于 1，因此是倒立、缩小的实像，这也是照相机的成像原理。",
      },
      {
        id: "q2",
        type: "single",
        stem: "物距小于焦距时，光屏上始终找不到像，原因是——",
        options: [
          { id: "a", text: "蜡烛太暗，像看不见" },
          { id: "b", text: "光屏位置没有调好" },
          { id: "c", text: "成的是正立、放大的虚像，不能用光屏承接" },
          { id: "d", text: "透镜已经损坏" },
        ],
        correctOptionIds: ["c"],
        explanation: "u < f 时折射光线发散，反向延长线相交成虚像；虚像不能用光屏承接，只能透过透镜观察，放大镜即为此情形。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "下列哪些情况会导致光屏上无法得到清晰的实像？（多选）",
        options: [
          { id: "a", text: "三者中心没有调到同一高度" },
          { id: "b", text: "光屏没有移到像的位置" },
          { id: "c", text: "物距恰好等于焦距" },
          { id: "d", text: "实验在较暗的环境中进行" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation: "中心不等高时像偏离光屏；光屏不在像距处时只有模糊光斑；u = f 时折射光线平行射出，不成像。较暗环境反而有利于观察光屏上的像。",
      },
    ],
  },
  "en-US": {
    experimentId: "lens-imaging",
    locale: "en-US",
    title: "Convex Lens Imaging",
    subtitle: "Relating object distance, image distance and focal length",
    principle:
      "A convex lens converges light. Depending on how the object distance u compares with the focal length f, the image changes in nature, orientation and size. The quantitative relation is the thin-lens equation 1/f = 1/u + 1/v, where a negative v denotes a virtual image.",
    equipment: [
      "Optical bench with scale",
      "Convex lens (f = 10 cm)",
      "Candle or LED source",
      "Screen",
      "Ruler",
      "Matches",
    ],
    steps: [
      {
        index: 0,
        title: "Align the axis",
        description:
          "Place the candle, lens and screen on the bench, adjust their centres to the same height and keep the lens perpendicular to the bench so the image lands in the middle of the screen.",
        keyPoint: "Centres level, lens perpendicular to the bench",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Set focal length and object distance",
        description:
          "Fix the lens, record its focal length f, then move the candle to the chosen object distance u and light it. Watch how the rays from the flame bend through the lens.",
        keyPoint: "Readings of u and f",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Move the screen to find the image",
        description:
          "Slide the screen along the bench until the sharpest image appears and record the image distance v. If no image can be found anywhere, the lens forms a virtual image.",
        keyPoint: "The moment the image snaps into focus",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Record and analyse",
        description:
          "Use the sign of v to tell real from virtual, the magnification to tell enlarged from reduced, then check the data with 1/f = 1/u + 1/v and discuss errors.",
        keyPoint: "Quantitative relation among u, v and f",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "focalLength", label: "Focal length f", min: 5, max: 20, step: 0.5, unit: "cm", defaultValue: 10 },
      { kind: "slider", id: "objectDistance", label: "Object distance u", min: 5, max: 60, step: 0.5, unit: "cm", defaultValue: 30 },
      { kind: "slider", id: "objectHeight", label: "Flame height", min: 2, max: 6, step: 0.5, unit: "cm", defaultValue: 4 },
      { kind: "slider", id: "screenOffset", label: "Screen position offset", min: -8, max: 8, step: 0.5, unit: "cm", defaultValue: 0 },
      { kind: "toggle", id: "showRays", label: "Show ray diagram", defaultValue: true },
    ],
    safetyNotes: [
      "Keep the candle away from flammable materials and extinguish it after the experiment",
      "Hold the lens by its rim; avoid touching the optical surface",
      "Handle the bench components gently to prevent the lens from dropping",
    ],
    normalRanges: [
      { parameterId: "screenOffset", min: -1.5, max: 1.5, label: "Screen position offset", note: "Beyond 1.5 cm the image becomes visibly blurred" },
    ],
    errorScenarios: [
      {
        id: "object-inside-focus",
        label: "Object inside the focal point",
        triggerParam: "objectDistance",
        triggerValue: 4,
        consequence: "No real image can be formed on the screen; only an upright, magnified virtual image is seen through the lens",
        visualCue: "The screen shows a diffuse patch, the refracted rays diverge and the virtual image is drawn dashed on the object side",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "When the object distance is greater than twice the focal length, the image is —",
        options: [
          { id: "a", text: "inverted and magnified real" },
          { id: "b", text: "inverted and reduced real" },
          { id: "c", text: "upright and magnified virtual" },
          { id: "d", text: "upright and reduced virtual" },
        ],
        correctOptionIds: ["b"],
        explanation: "For u > 2f, the image distance satisfies f < v < 2f and the magnification is less than one, giving an inverted, reduced real image — the principle of a camera.",
      },
      {
        id: "q2",
        type: "single",
        stem: "When the object is closer than the focal point, no image appears on the screen because —",
        options: [
          { id: "a", text: "the candle is too dim" },
          { id: "b", text: "the screen is in the wrong place" },
          { id: "c", text: "the image is upright, magnified and virtual, so a screen cannot catch it" },
          { id: "d", text: "the lens is damaged" },
        ],
        correctOptionIds: ["c"],
        explanation: "For u < f the emerging rays diverge and their backward extensions meet on the object side, forming a virtual image that only the eye can see through the lens — as with a magnifying glass.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "Which of these prevent a sharp real image on the screen? (multiple answers)",
        options: [
          { id: "a", text: "The three centres are not at the same height" },
          { id: "b", text: "The screen is not at the image position" },
          { id: "c", text: "The object distance equals the focal length" },
          { id: "d", text: "The room is dimmed during the experiment" },
        ],
        correctOptionIds: ["a", "b", "c"],
        explanation: "Misaligned centres push the image off the screen; a screen away from the image distance shows only a blur; at u = f the emerging rays are parallel and no image forms. A dim room actually makes the screen image easier to see.",
      },
    ],
  },
};
