import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [360, 420, 300, 330];

export const youngsDoubleSlitMeta: ExperimentMeta = {
  id: "youngs-double-slit",
  category: "senior-physics",
  difficulty: 1,
  modes: ["animation", "virtual-ops"],
  compositionId: "youngs-double-slit",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const youngsDoubleSlitContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "youngs-double-slit",
    locale: "zh-CN",
    title: "杨氏双缝干涉",
    subtitle: "波长与条纹间距的定量关系",
    principle:
      "同一束光经双缝分成两束相干波，在屏上叠加：波程差为波长整数倍处相长为亮纹，半波长奇数倍处相消为暗纹。条纹间距满足 Δy = λL / d，因此改变波长或缝间距会等比例改变条纹疏密。",
    equipment: ["半导体激光器（或钠灯加单缝）", "双缝片（缝间距可调）", "光屏与米尺", "光学导轨与支座"],
    steps: [
      {
        index: 0,
        title: "装置与光路",
        description: "沿导轨依次放置激光器、双缝片与光屏，调节各元件共轴等高。",
        keyPoint: "激光束正对双缝中心",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "波前与叠加",
        description: "两条狭缝成为同频同相的相干波源，柱面波前在两缝之间交叠。",
        keyPoint: "两组同心圆波前的交叠区域",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "屏上条纹",
        description: "屏上出现等间距明暗条纹，中央为零级亮纹，两侧对称分布。",
        keyPoint: "条纹间距与中央亮纹",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "条纹间距",
        description: "改变波长 λ、缝间距 d 或屏距 L，验证 Δy = λL / d 的定量关系。",
        keyPoint: "公式与读数联动",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "wavelength", label: "波长", min: 380, max: 780, step: 1, unit: "nm", defaultValue: 532 },
      { kind: "slider", id: "slitSeparation", label: "缝间距 d", min: 0.08, max: 0.4, step: 0.01, unit: "mm", defaultValue: 0.2 },
      { kind: "slider", id: "screenDistance", label: "屏距 L", min: 0.5, max: 2, step: 0.05, unit: "m", defaultValue: 1 },
      { kind: "toggle", id: "whiteLight", label: "改用白光光源", defaultValue: false },
      { kind: "toggle", id: "showIntensity", label: "显示光强分布", defaultValue: true },
    ],
    safetyNotes: ["切勿用眼睛直视激光束或其镜面反射光"],
    normalRanges: [
      { parameterId: "wavelength", min: 380, max: 780, label: "可见光波长", note: "教学演示范围" },
    ],
    errorScenarios: [
      {
        id: "white-light",
        label: "改用白光光源",
        triggerParam: "whiteLight",
        triggerValue: true,
        consequence: "各级亮纹变为彩色宽带，仅中央零级仍为白色；不同波长的条纹间距不同，条纹不再等间距单一",
        visualCue: "屏上出现由紫到红按波长展开的离散彩色条纹",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "其他条件不变，双缝间距 d 增大，屏上条纹间距将——",
        options: [
          { id: "a", text: "增大" },
          { id: "b", text: "减小" },
          { id: "c", text: "不变" },
          { id: "d", text: "条纹变为彩色" },
        ],
        correctOptionIds: ["b"],
        explanation: "由 Δy = λL / d，d 增大则 Δy 减小，条纹变密。",
      },
      {
        id: "q2",
        type: "single",
        stem: "屏上与中央亮纹相邻的亮纹中心，到两缝的波程差为——",
        options: [
          { id: "a", text: "λ/4" },
          { id: "b", text: "λ/2" },
          { id: "c", text: "λ" },
          { id: "d", text: "2λ" },
        ],
        correctOptionIds: ["c"],
        explanation: "相长干涉条件是波程差为波长整数倍；相邻亮纹依次对应 λ 的 0, 1, 2… 倍。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "关于白光双缝干涉，下列说法正确的是？（多选）",
        options: [
          { id: "a", text: "中央亮纹仍是白色" },
          { id: "b", text: "紫光条纹间距比红光大" },
          { id: "c", text: "同一级次形成彩色条纹带" },
          { id: "d", text: "白光不能发生干涉" },
        ],
        correctOptionIds: ["a", "c"],
        explanation: "中央处各波长波程差都为零，叠加后仍为白色；同一级次上不同波长错开形成彩色带。Δy ∝ λ，紫光波长短、条纹更密。",
      },
    ],
  },
  "en-US": {
    experimentId: "youngs-double-slit",
    locale: "en-US",
    title: "Young's Double-Slit Interference",
    subtitle: "Wavelength versus fringe spacing",
    principle:
      "A single beam split by two slits becomes two coherent waves that overlap on a screen: constructive where the path difference is a whole wavelength, destructive at odd half wavelengths. The fringe spacing follows Δy = λL / d, so spacing scales with wavelength and screen distance and inversely with slit separation.",
    equipment: [
      "Semiconductor laser (or sodium lamp plus single slit)",
      "Double-slit plate (adjustable separation)",
      "Screen and meter stick",
      "Optical rail and mounts",
    ],
    steps: [
      {
        index: 0,
        title: "Set up the optics",
        description: "Place the laser, double-slit plate and screen along the rail and align them coaxially at equal height.",
        keyPoint: "The beam strikes the center between the two slits",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Wavefronts overlap",
        description: "The two slits act as coherent in-phase sources; cylindrical wavefronts overlap between slits and screen.",
        keyPoint: "The overlap region of two circular wavefront families",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Fringes on the screen",
        description: "Equally spaced bright and dark fringes appear; the center is the zeroth-order maximum.",
        keyPoint: "Fringe spacing and the central maximum",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Quantify the spacing",
        description: "Vary wavelength λ, slit separation d or screen distance L to verify Δy = λL / d.",
        keyPoint: "Formula linked to the readouts",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "wavelength", label: "Wavelength", min: 380, max: 780, step: 1, unit: "nm", defaultValue: 532 },
      { kind: "slider", id: "slitSeparation", label: "Slit separation d", min: 0.08, max: 0.4, step: 0.01, unit: "mm", defaultValue: 0.2 },
      { kind: "slider", id: "screenDistance", label: "Screen distance L", min: 0.5, max: 2, step: 0.05, unit: "m", defaultValue: 1 },
      { kind: "toggle", id: "whiteLight", label: "Use white-light source", defaultValue: false },
      { kind: "toggle", id: "showIntensity", label: "Show intensity profile", defaultValue: true },
    ],
    safetyNotes: ["Never look directly into the laser beam or its specular reflections"],
    normalRanges: [
      { parameterId: "wavelength", min: 380, max: 780, label: "Visible wavelengths", note: "Teaching demonstration range" },
    ],
    errorScenarios: [
      {
        id: "white-light",
        label: "Switching to white light",
        triggerParam: "whiteLight",
        triggerValue: true,
        consequence: "Each order becomes a colored band; only the zeroth order stays white and the spacing is no longer a single value",
        visualCue: "Discrete color fringes spread from violet to red on the screen",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "Keeping everything else fixed, increasing the slit separation d makes the fringe spacing —",
        options: [
          { id: "a", text: "larger" },
          { id: "b", text: "smaller" },
          { id: "c", text: "unchanged" },
          { id: "d", text: "colored" },
        ],
        correctOptionIds: ["b"],
        explanation: "From Δy = λL / d, a larger d gives a smaller Δy — the fringes crowd together.",
      },
      {
        id: "q2",
        type: "single",
        stem: "The path difference from the two slits to the center of the first bright fringe beside the central one is —",
        options: [
          { id: "a", text: "λ/4" },
          { id: "b", text: "λ/2" },
          { id: "c", text: "λ" },
          { id: "d", text: "2λ" },
        ],
        correctOptionIds: ["c"],
        explanation: "Constructive interference requires a whole-number multiple of the wavelength; neighboring bright fringes correspond to 0, 1, 2… times λ.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "About double-slit interference with white light, which statements are correct? (multiple answers)",
        options: [
          { id: "a", text: "The central fringe is still white" },
          { id: "b", text: "Violet fringes are spaced wider than red ones" },
          { id: "c", text: "Each order spreads into a colored band" },
          { id: "d", text: "White light cannot interfere" },
        ],
        correctOptionIds: ["a", "c"],
        explanation: "At the center every wavelength has zero path difference, so the overlap stays white; within one order the colors separate. Since Δy ∝ λ, violet (short λ) fringes are the densest.",
      },
    ],
  },
};
