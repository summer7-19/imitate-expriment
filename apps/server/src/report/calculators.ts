import type {
  CalculationStep,
  ExperimentContent,
  Locale,
  MeasurementRow,
  ParamValues,
} from "@physchem/experiment-schema";
import {
  ELEMENTARY_CHARGE,
  KF_BENZENE,
  PLANCK_CONSTANT,
  SOLUTE_BIPHENYL_M,
  SPEED_OF_LIGHT,
  conductivity,
  freezingPointDepression,
  fringeSpacingMm,
  stoppingVoltage,
} from "@physchem/experiment-data";
import { defaultParams } from "@physchem/experiment-schema";
import { leastSquares, num, relErr, type CalcResult } from "./types";
import { lensImagingCalculator } from "./experiments/lens-imaging";
import { voltmeterAmmeterResistanceCalculator } from "./experiments/voltmeter-ammeter-resistance";
import { leverBalanceCalculator } from "./experiments/lever-balance";
import { oxygenPreparationCalculator } from "./experiments/oxygen-preparation";
import { carbonDioxidePreparationCalculator } from "./experiments/carbon-dioxide-preparation";
import { crudeSaltPurificationCalculator } from "./experiments/crude-salt-purification";
import { solutionPreparationCalculator } from "./experiments/solution-preparation";
import { newtonsSecondLawCalculator } from "./experiments/newtons-second-law";
import { mechanicalEnergyConservationCalculator } from "./experiments/mechanical-energy-conservation";
import { emfInternalResistanceCalculator } from "./experiments/emf-internal-resistance";
import { reactionRateFactorsCalculator } from "./experiments/reaction-rate-factors";
import { galvanicCellCalculator } from "./experiments/galvanic-cell";

/** 确定性伪随机（报告可复现） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CALCULATORS: Record<string, (ctx: {
  locale: Locale;
  params: ParamValues;
  rng: () => number;
}) => CalcResult> = {
  /* ---------- 凸透镜成像 ---------- */
  "lens-imaging": lensImagingCalculator,

  /* ---------- 伏安法测电阻 ---------- */
  "voltmeter-ammeter-resistance": voltmeterAmmeterResistanceCalculator,

  /* ---------- 杠杆平衡 ---------- */
  "lever-balance": leverBalanceCalculator,

  /* ---------- 氧气制取 ---------- */
  "oxygen-preparation": oxygenPreparationCalculator,

  /* ---------- 二氧化碳制取 ---------- */
  "carbon-dioxide-preparation": carbonDioxidePreparationCalculator,

  /* ---------- 粗盐提纯 ---------- */
  "crude-salt-purification": crudeSaltPurificationCalculator,

  /* ---------- 一定浓度溶液的配制 ---------- */
  "solution-preparation": solutionPreparationCalculator,

  /* ---------- 牛顿第二定律 ---------- */
  "newtons-second-law": newtonsSecondLawCalculator,

  /* ---------- 机械能守恒 ---------- */
  "mechanical-energy-conservation": mechanicalEnergyConservationCalculator,

  /* ---------- 电动势与内阻 ---------- */
  "emf-internal-resistance": emfInternalResistanceCalculator,

  /* ---------- 影响反应速率的因素 ---------- */
  "reaction-rate-factors": reactionRateFactorsCalculator,

  /* ---------- 原电池 ---------- */
  "galvanic-cell": galvanicCellCalculator,

  /* ---------- 酸碱滴定 ---------- */
  "acid-base-titration": ({ locale, params, rng }) => {
    const ca = num(params, "acidConcentration", 0.1);
    const cb = num(params, "baseConcentration", 0.1);
    const va = num(params, "acidVolume", 25);
    const overshoot = num(params, "overshoot", 0);
    const veTrue = (ca * va) / cb;

    const measurements: MeasurementRow[] = [1, 2, 3].map((i) => {
      const vNaoh = veTrue + overshoot + (rng() - 0.5) * 0.06;
      return {
        index: i,
        values: { "V(NaOH)": Number(vNaoh.toFixed(3)), pH: 8.3 },
        unit: { "V(NaOH)": "mL", pH: "" },
      };
    });

    const concs = measurements.map((m) => (cb * m.values["V(NaOH)"]) / va);
    const mean = concs.reduce((a, b) => a + b, 0) / concs.length;
    const err = relErr(mean, ca);

    const calculations: CalculationStep[] = [
      {
        label: locale === "en-US" ? "Endpoint volume (mean)" : "终点体积（均值）",
        formula: "\\bar{V} = \\frac{V_1+V_2+V_3}{3}",
        result: Number((veTrue + overshoot).toFixed(2)),
        unit: "mL",
      },
      {
        label: locale === "en-US" ? "Acid concentration" : "盐酸浓度",
        formula: "c(\\mathrm{HCl}) = \\frac{c(\\mathrm{NaOH})\\cdot V(\\mathrm{NaOH})}{V(\\mathrm{HCl})}",
        result: Number(mean.toFixed(4)),
        unit: "mol/L",
      },
      {
        label: locale === "en-US" ? "Relative error" : "相对误差",
        formula: "E_r = \\frac{|\\bar{c} - c_{\\text{true}}|}{c_{\\text{true}}} \\times 100\\%",
        result: Number(err.toFixed(2)),
        unit: "%",
      },
    ];

    const warnings: string[] = [];
    if (overshoot > 0.2) {
      warnings.push(
        locale === "en-US"
          ? "Endpoint overshoot exceeds the teaching range (0.2 mL); the reading is biased high."
          : "终点过冲超出教学范围（0.2 mL），读数偏高。",
      );
    }
    const errorAnalysis =
      locale === "en-US"
        ? `Main sources: visual endpoint judgment (±0.5 drop ≈ ±0.05 mL), reading error of the burette (±0.02 mL), and indicator transition range. Simulated readings add ±0.03 mL noise. Overshoot was set to ${overshoot.toFixed(1)} mL.`
        : `主要误差来源：终点判断的视觉误差（±0.5 滴 ≈ ±0.05 mL）、滴定管读数误差（±0.02 mL）与指示剂变色区间。模拟读数叠加了 ±0.03 mL 随机噪声；设定过冲 ${overshoot.toFixed(1)} mL。`;
    const conclusion =
      locale === "en-US"
        ? `c(HCl) = ${mean.toFixed(4)} mol/L, relative error ${err.toFixed(2)}% versus the model truth ${ca.toFixed(3)} mol/L.`
        : `c(HCl) = ${mean.toFixed(4)} mol/L，相对模型真值 ${ca.toFixed(3)} mol/L 的相对误差为 ${err.toFixed(2)}%。`;

    return { measurements, calculations, errorAnalysis, conclusion, warnings };
  },

  /* ---------- 杨氏双缝 ---------- */
  "youngs-double-slit": ({ locale, params, rng }) => {
    const lambda = num(params, "wavelength", 532);
    const d = num(params, "slitSeparation", 0.2);
    const dist = num(params, "screenDistance", 1);
    const dyTrue = fringeSpacingMm(lambda, d, dist);

    const measurements: MeasurementRow[] = [1, 2, 3, 4, 5].map((k) => {
      const yk = k * dyTrue + (rng() - 0.5) * 0.08;
      return {
        index: k,
        values: { yk: Number(yk.toFixed(3)), dy: Number((yk / k).toFixed(3)) },
        unit: { yk: "mm", dy: "mm" },
      };
    });

    const dys = measurements.map((m) => m.values.dy);
    const mean = dys.reduce((a, b) => a + b, 0) / dys.length;
    const err = relErr(mean, dyTrue);

    const calculations: CalculationStep[] = [
      {
        label: locale === "en-US" ? "Fringe spacing (formula)" : "条纹间距（公式值）",
        formula: "\\Delta y = \\frac{\\lambda L}{d}",
        result: Number(dyTrue.toFixed(3)),
        unit: "mm",
      },
      {
        label: locale === "en-US" ? "Fringe spacing (measured mean)" : "条纹间距（测量均值）",
        formula: "\\overline{\\Delta y} = \\frac{1}{n}\\sum_{k=1}^{n} \\frac{y_k}{k}",
        result: Number(mean.toFixed(3)),
        unit: "mm",
      },
      {
        label: locale === "en-US" ? "Relative error" : "相对误差",
        formula: "E_r = \\frac{|\\overline{\\Delta y} - \\Delta y_{\\text{th}}|}{\\Delta y_{\\text{th}}} \\times 100\\%",
        result: Number(err.toFixed(2)),
        unit: "%",
      },
    ];

    return {
      measurements,
      calculations,
      errorAnalysis:
        locale === "en-US"
          ? "Sources: locating fringe centers on the screen (±0.05 mm simulated), reading the meter stick, and the finite slit width. Fringe centers were sampled with ±0.04 mm noise."
          : "误差来源：屏上条纹中心定位（模拟 ±0.05 mm）、米尺读数与缝宽的影响。条纹中心采样叠加了 ±0.04 mm 噪声。",
      conclusion:
        locale === "en-US"
          ? `Δy = ${mean.toFixed(3)} mm, relative error ${err.toFixed(2)}% versus Δy = λL/d = ${dyTrue.toFixed(3)} mm.`
          : `Δy = ${mean.toFixed(3)} mm，与公式值 λL/d = ${dyTrue.toFixed(3)} mm 的相对误差为 ${err.toFixed(2)}%。`,
      warnings: [],
    };
  },

  /* ---------- 电导滴定 ---------- */
  "conductometric-titration": ({ locale, params, rng }) => {
    const ca = num(params, "acidConcentration", 0.1);
    const cb = num(params, "baseConcentration", 0.1);
    const va = num(params, "acidVolume", 25);
    const overshoot = num(params, "overshoot", 0);
    const veTrue = (ca * va) / cb;
    const veMeas = veTrue + overshoot * 0.4 + (rng() - 0.5) * 0.08;

    const measurements: MeasurementRow[] = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2].map((f, i) => {
      const v = Number((veTrue * f).toFixed(2));
      return {
        index: i + 1,
        values: { "V(NaOH)": v, κ: Number(conductivity(ca, va, cb, v).toFixed(2)) },
        unit: { "V(NaOH)": "mL", κ: "mS/cm" },
      };
    });

    const cMeas = (cb * veMeas) / va;
    const err = relErr(cMeas, ca);

    const calculations: CalculationStep[] = [
      {
        label: locale === "en-US" ? "Endpoint (V-intersection)" : "终点体积（两线交点）",
        formula: "V_e = V(\\kappa_{\\min})",
        result: Number(veMeas.toFixed(2)),
        unit: "mL",
      },
      {
        label: locale === "en-US" ? "Acid concentration" : "盐酸浓度",
        formula: "c(\\mathrm{HCl}) = \\frac{c(\\mathrm{NaOH})\\cdot V_e}{V(\\mathrm{HCl})}",
        result: Number(cMeas.toFixed(4)),
        unit: "mol/L",
      },
      {
        label: locale === "en-US" ? "Relative error" : "相对误差",
        formula: "E_r = \\frac{|\\bar{c} - c_{\\text{true}}|}{c_{\\text{true}}} \\times 100\\%",
        result: Number(err.toFixed(2)),
        unit: "%",
      },
    ];

    const warnings: string[] = [];
    if (overshoot > 0.2) {
      warnings.push(
        locale === "en-US"
          ? "Large overshoot shifts the judged minimum right; read the intersection, not the last point."
          : "过冲较大使谷底判定右移；应取两线交点而非最后读数。",
      );
    }
    return {
      measurements,
      calculations,
      errorAnalysis:
        locale === "en-US"
          ? "Sources: locating the two-line intersection (±0.04 mL simulated), electrode cell constant drift, and temperature. The κ table was computed from the ionic model with quantized readings."
          : "误差来源：两线交点定位（模拟 ±0.04 mL）、电极池常数漂移与温度。κ 表由离子模型计算并叠加量化读数。",
      conclusion:
        locale === "en-US"
          ? `c(HCl) = ${cMeas.toFixed(4)} mol/L, relative error ${err.toFixed(2)}%.`
          : `c(HCl) = ${cMeas.toFixed(4)} mol/L，相对误差 ${err.toFixed(2)}%。`,
      warnings,
    };
  },

  /* ---------- 光电效应 ---------- */
  "photoelectric-effect": ({ locale, params, rng }) => {
    const workEv = num(params, "workFunction", 2);
    const filters = [405, 436, 546, 577];
    const rows = filters.map((wl, i) => {
      const { canEmit, stoppingVoltage: u0 } = stoppingVoltage(wl, workEv);
      const uMeas = canEmit ? u0 + (rng() - 0.5) * 0.02 : 0;
      const nuPhz = SPEED_OF_LIGHT / (wl * 1e-9) / 1e15;
      return { i: i + 1, wl, nuPhz: Number(nuPhz.toFixed(3)), uMeas: canEmit ? Number(uMeas.toFixed(3)) : 0, canEmit };
    });

    const emitting = rows.filter((r) => r.canEmit);
    const fit = leastSquares(
      emitting.map((r) => r.nuPhz),
      emitting.map((r) => r.uMeas),
    );
    const hMeas = fit.slope * ELEMENTARY_CHARGE;
    const err = relErr(hMeas, PLANCK_CONSTANT);

    const measurements: MeasurementRow[] = rows.map((r) => ({
      index: r.i,
      values: { λ: r.wl, ν: r.nuPhz, "U₀": r.uMeas },
      unit: { λ: "nm", ν: "PHz", "U₀": "V" },
    }));

    const calculations: CalculationStep[] = [
      {
        label: locale === "en-US" ? "Slope of U₀–ν line" : "U₀–ν 斜率",
        formula: "k = \\frac{\\Delta U_0}{\\Delta \\nu}",
        result: Number(fit.slope.toFixed(4)),
        unit: "V/PHz",
      },
      {
        label: locale === "en-US" ? "Planck constant" : "普朗克常量",
        formula: "h = k \\cdot e",
        result: hMeas,
        unit: "J·s",
      },
      {
        label: locale === "en-US" ? "Relative error" : "相对误差",
        formula: "E_r = \\frac{|h - h_0|}{h_0} \\times 100\\%",
        result: Number(err.toFixed(2)),
        unit: "%",
      },
    ];

    const warnings: string[] = [];
    if (rows.some((r) => !r.canEmit)) {
      warnings.push(
        locale === "en-US"
          ? "Wavelengths with hν < W emit nothing and were excluded from the fit."
          : "hν < W 的波长无光电发射，已从拟合中剔除。",
      );
    }

    return {
      measurements,
      calculations,
      errorAnalysis:
        locale === "en-US"
          ? "Sources: reading the zero-current point on the I–V curve (±0.01 V simulated), contact potential difference, and the reverse-current correction."
          : "误差来源：I–V 曲线零电流点读取（模拟 ±0.01 V）、接触电位差与反向电流的修正。",
      conclusion:
        locale === "en-US"
          ? `h = ${hMeas.toExponential(3)} J·s, relative error ${err.toFixed(2)}% versus CODATA ${PLANCK_CONSTANT.toExponential(3)} J·s.`
          : `h = ${hMeas.toExponential(3)} J·s，相对国际推荐值 ${PLANCK_CONSTANT.toExponential(3)} J·s 的相对误差为 ${err.toFixed(2)}%。`,
      warnings,
    };
  },

  /* ---------- 凝固点降低 ---------- */
  "freezing-point-depression": ({ locale, params, rng }) => {
    const soluteMass = num(params, "soluteMass", 1.53);
    const solventMass = num(params, "solventMass", 25);
    const supercool = num(params, "supercoolDepth", 0.5);
    const { deltaTf } = freezingPointDepression(soluteMass, solventMass);

    const trials = [1, 2, 3].map(() => {
      const noise = (rng() - 0.5) * 0.04;
      return { tfPure: 5.5 + noise / 2, tfSol: 5.5 - deltaTf + noise / 2 };
    });
    const dTfMeas = trials.reduce((acc, t) => acc + (t.tfPure - t.tfSol), 0) / trials.length;
    const mMeas = (KF_BENZENE * soluteMass) / (dTfMeas * (solventMass / 1000));
    const err = relErr(mMeas, SOLUTE_BIPHENYL_M);

    const measurements: MeasurementRow[] = trials.map((t, i) => ({
      index: i + 1,
      values: {
        "Tf(pure)": Number(t.tfPure.toFixed(3)),
        "Tf(sol)": Number(t.tfSol.toFixed(3)),
        ΔTf: Number((t.tfPure - t.tfSol).toFixed(3)),
      },
      unit: { "Tf(pure)": "℃", "Tf(sol)": "℃", ΔTf: "℃" },
    }));

    const calculations: CalculationStep[] = [
      {
        label: locale === "en-US" ? "Mean depression" : "平均凝固点降低",
        formula: "\\Delta T_f = T_f^{\\text{pure}} - T_f^{\\text{solution}}",
        result: Number(dTfMeas.toFixed(3)),
        unit: "℃",
      },
      {
        label: locale === "en-US" ? "Molar mass" : "摩尔质量",
        formula: "M = \\frac{K_f \\cdot m}{\\Delta T_f \\cdot m_0}",
        result: Number(mMeas.toFixed(1)),
        unit: "g/mol",
      },
      {
        label: locale === "en-US" ? "Relative error" : "相对误差",
        formula: "E_r = \\frac{|M - M_{\\text{true}}|}{M_{\\text{true}}} \\times 100\\%",
        result: Number(err.toFixed(2)),
        unit: "%",
      },
    ];

    const warnings: string[] = [];
    if (supercool > 0.8) {
      warnings.push(
        locale === "en-US"
          ? "Deep supercooling blurs the kink; keep it below 0.8 °C."
          : "过冷过深使拐点难以判断，建议控制在 0.8 ℃ 以内。",
      );
    }

    return {
      measurements,
      calculations,
      errorAnalysis:
        locale === "en-US"
          ? "Sources: extrapolating the cooling curves (±0.02 °C simulated), thermometer calibration, and the benzene evaporation during transfer."
          : "误差来源：冷却曲线外推（模拟 ±0.02 ℃）、温度计刻度校正与转移过程中苯的挥发。",
      conclusion:
        locale === "en-US"
          ? `M(biphenyl) = ${mMeas.toFixed(1)} g/mol, relative error ${err.toFixed(2)}% versus ${SOLUTE_BIPHENYL_M} g/mol.`
          : `联苯摩尔质量 M = ${mMeas.toFixed(1)} g/mol，相对真值 ${SOLUTE_BIPHENYL_M} g/mol 的相对误差为 ${err.toFixed(2)}%。`,
      warnings,
    };
  },

  /* ---------- 分光光度法 ---------- */
  spectrophotometry: ({ locale, params, rng }) => {
    const sampleConc = num(params, "sampleConcentration", 25); // μmol/L
    const wavelengthNm = num(params, "wavelength", 525);
    const standards = [5, 10, 15, 20, 25];

    const measurements: MeasurementRow[] = standards.map((c, i) => ({
      index: i + 1,
      values: {
        c,
        A: Number((measuredA(c, wavelengthNm) + (rng() - 0.5) * 0.006).toFixed(4)),
      },
      unit: { c: "μmol/L", A: "" },
    }));
    measurements.push({
      index: measurements.length + 1,
      values: { c: sampleConc, A: Number((measuredA(sampleConc, wavelengthNm) + (rng() - 0.5) * 0.006).toFixed(4)) },
      unit: { c: "μmol/L", A: "" },
    });

    const fit = leastSquares(
      measurements.slice(0, standards.length).map((m) => m.values.c),
      measurements.slice(0, standards.length).map((m) => m.values.A),
    );
    const unknownA = measurements[measurements.length - 1].values.A;
    const cMeas = fit.slope > 0 ? (unknownA - fit.intercept) / fit.slope : 0;
    const err = relErr(cMeas, sampleConc);

    const calculations: CalculationStep[] = [
      {
        label: locale === "en-US" ? "Calibration slope (εb)" : "标准曲线斜率（εb）",
        formula: "A = \\varepsilon b c",
        result: Number(fit.slope.toFixed(5)),
        unit: "L/μmol",
      },
      {
        label: locale === "en-US" ? "Unknown concentration" : "未知样浓度",
        formula: "c = \\frac{A_x - a}{k}",
        result: Number(cMeas.toFixed(2)),
        unit: "μmol/L",
      },
      {
        label: locale === "en-US" ? "Relative error" : "相对误差",
        formula: "E_r = \\frac{|c - c_{\\text{true}}|}{c_{\\text{true}}} \\times 100\\%",
        result: Number(err.toFixed(2)),
        unit: "%",
      },
    ];

    const warnings: string[] = [];
    if (sampleConc > 40) {
      warnings.push(
        locale === "en-US"
          ? "The unknown sits near/above the linear range; the back-calculated concentration reads low."
          : "未知样处于线性范围边缘或之外，反推浓度偏低。",
      );
    }
    if (Math.abs(wavelengthNm - 525) > 30) {
      warnings.push(
        locale === "en-US"
          ? "The wavelength is far from λmax (525 nm); sensitivity drops and drift matters more."
          : "测量波长远离最大吸收波长 525 nm，灵敏度下降且波长漂移影响增大。",
      );
    }

    return {
      measurements,
      calculations,
      errorAnalysis:
        locale === "en-US"
          ? "Sources: cuvette handling (±0.003 A simulated), stray light at high absorbance, and volume errors in standard preparation."
          : "误差来源：比色皿操作（模拟 ±0.003 A）、高吸光度端的杂散光影响以及标准系列配制时的体积误差。",
      conclusion:
        locale === "en-US"
          ? `c(unknown) = ${cMeas.toFixed(2)} μmol/L, relative error ${err.toFixed(2)}% versus the model truth ${sampleConc} μmol/L.`
          : `未知样浓度 c = ${cMeas.toFixed(2)} μmol/L，相对模型真值 ${sampleConc} μmol/L 的相对误差为 ${err.toFixed(2)}%。`,
      warnings,
    };
  },
};

/** 高浓度端对朗伯-比尔定律的偏离（与 Composition 同一模型） */
function measuredA(cMicromol: number, wavelengthNm: number): number {
  const eps = 2.0e4 * Math.exp(-Math.pow((wavelengthNm - 525) / 60, 2));
  const linear = eps * 1 * (cMicromol * 1e-6);
  if (linear <= 0.8) return linear;
  return 0.8 + (linear - 0.8) * 0.55;
}

/** 生成报告数据（服务端计算；文本按 locale 模板填充） */
export function generateReportData(
  experimentId: string,
  content: ExperimentContent,
  params: ParamValues,
  locale: Locale,
): CalcResult {
  const seedStr = `${experimentId}:${JSON.stringify(params)}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const calc = CALCULATORS[experimentId];
  if (!calc) {
    return { measurements: [], calculations: [], errorAnalysis: "", conclusion: "", warnings: [] };
  }
  return calc({ locale, params: { ...defaultParams(content), ...params }, rng: mulberry32(seed) });
}

/** 报告导出 Markdown（服务端生成） */
export function reportToMarkdown(input: {
  title: string;
  parameters: Record<string, number | string | boolean>;
  measurements: MeasurementRow[];
  calculations: CalculationStep[];
  errorAnalysis: string;
  conclusion: string;
  warnings: string[];
  locale: Locale;
}): string {
  const zh = input.locale !== "en-US";
  const lines: string[] = [];
  lines.push(`# ${zh ? "实验报告" : "Experiment Report"} · ${input.title}`);
  lines.push("");
  lines.push(`> ${zh ? "基于程序化模拟数据，非真实实验测量结果。" : "Generated from simulated data — not real measurements."}`);
  lines.push("");
  lines.push(`## ${zh ? "实验参数" : "Parameters"}`);
  lines.push("");
  for (const [k, v] of Object.entries(input.parameters)) {
    lines.push(`- ${k}: ${String(v)}`);
  }
  lines.push("");
  if (input.measurements.length > 0) {
    lines.push(`## ${zh ? "测量数据" : "Measurements"}`);
    lines.push("");
    const keys = Object.keys(input.measurements[0].values);
    lines.push(`| # | ${keys.join(" | ")} |`);
    lines.push(`| --- | ${keys.map(() => "---").join(" | ")} |`);
    for (const row of input.measurements) {
      lines.push(`| ${row.index} | ${keys.map((k) => row.values[k]).join(" | ")} |`);
    }
    lines.push("");
  }
  lines.push(`## ${zh ? "计算过程" : "Calculations"}`);
  lines.push("");
  for (const step of input.calculations) {
    lines.push(`- ${step.label}: $${step.formula}$ = ${step.result} ${step.unit}`);
  }
  lines.push("");
  lines.push(`## ${zh ? "误差分析" : "Error analysis"}`);
  lines.push("");
  lines.push(input.errorAnalysis);
  lines.push("");
  if (input.warnings.length > 0) {
    lines.push(`## ${zh ? "提示" : "Notes"}`);
    lines.push("");
    for (const w of input.warnings) lines.push(`- ${w}`);
    lines.push("");
  }
  lines.push(`## ${zh ? "结论" : "Conclusion"}`);
  lines.push("");
  lines.push(input.conclusion);
  lines.push("");
  return lines.join("\n");
}

