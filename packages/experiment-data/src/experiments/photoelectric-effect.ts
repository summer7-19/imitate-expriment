import { DISCLAIMER_FRAMES } from "@physchem/experiment-schema";
import type { ExperimentContent, ExperimentMeta } from "@physchem/experiment-schema";

const stepFrames = [360, 420, 330, 360];

export const photoelectricEffectMeta: ExperimentMeta = {
  id: "photoelectric-effect",
  category: "physics",
  difficulty: 2,
  modes: ["animation"],
  compositionId: "photoelectric-effect",
  durationInSeconds: (stepFrames.reduce((a, b) => a + b, 0) + DISCLAIMER_FRAMES) / 30,
  locales: ["zh-CN", "en-US"],
};

export const photoelectricEffectContent: Record<"zh-CN" | "en-US", ExperimentContent> = {
  "zh-CN": {
    experimentId: "photoelectric-effect",
    locale: "zh-CN",
    title: "光电效应测普朗克常量",
    subtitle: "截止电压与频率的线性关系",
    principle:
      "光子能量 E = hν。只有当光子能量大于阴极逸出功 W 时才有光电子逸出，且截止电压 U₀ = hν/e − W/e 随频率线性增大。测出不同波长下的截止电压并作 U₀–ν 图，由斜率 h/e 即可求得普朗克常量；光强只改变饱和电流，不影响截止电压。",
    equipment: [
      "卤钨（或汞）光源与聚光透镜",
      "滤光片组（405/436/546/577 nm）",
      "光电管与暗盒",
      "微电流放大器与直流电压源",
    ],
    steps: [
      {
        index: 0,
        title: "装置与光路",
        description: "光源经滤光片射入光电管暗盒，调节同轴，预热微电流放大器并调零。",
        keyPoint: "滤光片正对光电管窗口",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "光子与电子",
        description: "光子撞击阴极：hν ≥ W 时电子逸出，hν < W 时无论光强多大都无电流。",
        keyPoint: "逸出与否只取决于频率",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "测截止电压",
        description: "加反向电压并逐渐增大，光电流减小到零时的电压即截止电压 U₀。",
        keyPoint: "I–V 曲线与电流归零点",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "拟合与结论",
        description: "换用不同滤光片重复测量，作 U₀–ν 直线，由斜率 h/e 计算 h。",
        keyPoint: "U₀–ν 直线与斜率标注",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "wavelength", label: "滤光波长", min: 390, max: 620, step: 1, unit: "nm", defaultValue: 436 },
      { kind: "slider", id: "lightIntensity", label: "光强", min: 10, max: 100, step: 5, unit: "%", defaultValue: 50 },
      { kind: "slider", id: "workFunction", label: "阴极逸出功", min: 1.6, max: 2.5, step: 0.05, unit: "eV", defaultValue: 2 },
      { kind: "toggle", id: "showIVCurve", label: "显示 I–V 曲线", defaultValue: true },
    ],
    safetyNotes: ["切勿直视光源出射窗口", "光电管暗盒避光保存，勿在强光下开盖"],
    normalRanges: [
      { parameterId: "wavelength", min: 390, max: 620, label: "可见光波段", note: "教学演示范围" },
    ],
    errorScenarios: [
      {
        id: "low-frequency-bright",
        label: "用强光弥补频率不足",
        triggerParam: "lightIntensity",
        triggerValue: 100,
        consequence: "波长选在红端（hν < W）时，光强再大也没有光电流，截止电压无从测起",
        visualCue: "光强增大到 100%，但电流表始终为零，无电子逸出",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "保持波长不变、增大光强，饱和光电流与截止电压将——",
        options: [
          { id: "a", text: "电流增大，截止电压不变" },
          { id: "b", text: "电流不变，截止电压增大" },
          { id: "c", text: "两者都增大" },
          { id: "d", text: "两者都不变" },
        ],
        correctOptionIds: ["a"],
        explanation: "光强增大意味着单位时间光子数增多，逸出电子更多、饱和电流更大；但每个光子能量 hν 不变，截止电压只由频率决定。",
      },
      {
        id: "q2",
        type: "single",
        stem: "阴极逸出功 W = 2.0 eV，用 620 nm 红光照射，结果是——",
        options: [
          { id: "a", text: "有光电流，截止电压约 0 V" },
          { id: "b", text: "无光电流，因为 hν < W" },
          { id: "c", text: "有光电流，但截止电压为负" },
          { id: "d", text: "光强足够大就能产生光电流" },
        ],
        correctOptionIds: ["b"],
        explanation: "620 nm 光子能量约 2.0 eV，与逸出功相当（E = 1240/λ）；光子能量不超过 W 就没有电子逸出，与光强无关。",
      },
      {
        id: "q3",
        type: "multi",
        stem: "关于 U₀–ν 图像，下列说法正确的是？（多选）",
        options: [
          { id: "a", text: "是一条直线，斜率为 h/e" },
          { id: "b", text: "横轴截距对应截止频率 ν₀ = W/h" },
          { id: "c", text: "改变光强会使直线斜率变化" },
          { id: "d", text: "换逸出功更大的阴极，直线整体下移" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "U₀ = (h/e)ν − W/e：斜率只含普朗克常量，截距由逸出功决定。光强不进入该方程，只影响电流读数的稳定性。",
      },
    ],
  },
  "en-US": {
    experimentId: "photoelectric-effect",
    locale: "en-US",
    title: "Photoelectric Effect: Measuring Planck's Constant",
    subtitle: "Stopping voltage versus frequency",
    principle:
      "A photon carries energy E = hν. Photoelectrons are only emitted when the photon energy exceeds the cathode work function W, and the stopping voltage follows U₀ = hν/e − W/e, a straight line in frequency. Fitting U₀ against ν for several wavelengths gives h from the slope h/e; intensity only changes the saturation current, never the stopping voltage.",
    equipment: [
      "Tungsten-halogen (or mercury) source with condenser lens",
      "Filter set (405/436/546/577 nm)",
      "Phototube in a dark box",
      "Micro-current amplifier and DC supply",
    ],
    steps: [
      {
        index: 0,
        title: "Set up the optics",
        description: "Send the source light through a filter into the phototube box, align the axis, warm up the amplifier and zero it.",
        keyPoint: "Filter facing the phototube window",
        durationFrames: stepFrames[0],
      },
      {
        index: 1,
        title: "Photons and electrons",
        description: "Photons strike the cathode: electrons escape when hν ≥ W, no matter how bright the light is when hν < W.",
        keyPoint: "Emission depends on frequency alone",
        durationFrames: stepFrames[1],
      },
      {
        index: 2,
        title: "Measure the stopping voltage",
        description: "Increase the retarding voltage; the voltage where the photocurrent reaches zero is U₀.",
        keyPoint: "The I–V curve and the zero-current point",
        durationFrames: stepFrames[2],
      },
      {
        index: 3,
        title: "Fit and conclude",
        description: "Repeat with other filters, plot U₀ against ν and compute h from the slope h/e.",
        keyPoint: "The U₀–ν line and its slope",
        durationFrames: stepFrames[3],
      },
    ],
    parameters: [
      { kind: "slider", id: "wavelength", label: "Filter wavelength", min: 390, max: 620, step: 1, unit: "nm", defaultValue: 436 },
      { kind: "slider", id: "lightIntensity", label: "Light intensity", min: 10, max: 100, step: 5, unit: "%", defaultValue: 50 },
      { kind: "slider", id: "workFunction", label: "Cathode work function", min: 1.6, max: 2.5, step: 0.05, unit: "eV", defaultValue: 2 },
      { kind: "toggle", id: "showIVCurve", label: "Show I–V curve", defaultValue: true },
    ],
    safetyNotes: ["Never look into the output window of the source", "Keep the phototube box closed and shielded from strong light"],
    normalRanges: [
      { parameterId: "wavelength", min: 390, max: 620, label: "Visible range", note: "Teaching demonstration range" },
    ],
    errorScenarios: [
      {
        id: "low-frequency-bright",
        label: "Trying to compensate frequency with brightness",
        triggerParam: "lightIntensity",
        triggerValue: 100,
        consequence: "With the wavelength in the red tail (hν < W) no photocurrent appears at any intensity, so U₀ cannot be measured",
        visualCue: "Intensity at 100% yet the ammeter stays at zero — no electrons escape",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "single",
        stem: "Keeping the wavelength fixed and increasing the intensity, the saturation current and the stopping voltage will —",
        options: [
          { id: "a", text: "current up, stopping voltage unchanged" },
          { id: "b", text: "current unchanged, stopping voltage up" },
          { id: "c", text: "both up" },
          { id: "d", text: "both unchanged" },
        ],
        correctOptionIds: ["a"],
        explanation: "Higher intensity means more photons per second, hence more photoelectrons and a larger saturation current. Each photon's energy hν is unchanged, and the stopping voltage depends on frequency only.",
      },
      {
        id: "q2",
        type: "single",
        stem: "With a cathode work function W = 2.0 eV illuminated by 620 nm red light, the result is —",
        options: [
          { id: "a", text: "a photocurrent with U₀ ≈ 0 V" },
          { id: "b", text: "no photocurrent, because hν < W" },
          { id: "c", text: "a photocurrent with a negative stopping voltage" },
          { id: "d", text: "a photocurrent if the light is bright enough" },
        ],
        correctOptionIds: ["b"],
        explanation: "A 620 nm photon carries about 2.0 eV (E = 1240/λ), right at the work function. If the photon energy does not exceed W, no electron escapes — regardless of intensity.",
      },
      {
        id: "q3",
        type: "multi",
        stem: "About the U₀–ν plot, which statements are correct? (multiple answers)",
        options: [
          { id: "a", text: "It is a straight line with slope h/e" },
          { id: "b", text: "The intercept on the ν axis is the threshold frequency ν₀ = W/h" },
          { id: "c", text: "Changing the intensity changes the slope" },
          { id: "d", text: "A cathode with larger W shifts the whole line downward" },
        ],
        correctOptionIds: ["a", "b", "d"],
        explanation: "U₀ = (h/e)ν − W/e: the slope contains only Planck's constant while the intercept is set by W. Intensity never enters the equation — it only affects how stable the current reading is.",
      },
    ],
  },
};
