import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { cartAcceleration } from "@physchem/experiment-data";
import { leastSquares, num, relErr, type Calculator } from "../types";

const G = 9.8;

export const newtonsSecondLawCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const cartMass = num(params, "cartMass", 0.5);
  const hangingMass = num(params, "hangingMass", 0.05);
  const compensated = params.frictionCompensated !== false;

  const trialMasses = [0.7, 0.85, 1, 1.15, 1.3].map((factor) =>
    Number((hangingMass * factor).toFixed(3)),
  );

  const measurements: MeasurementRow[] = trialMasses.map((mi, i) => {
    const force = mi * G;
    const truth = cartAcceleration(cartMass, mi, compensated).acceleration;
    const measured = Math.max(
      0,
      truth + (rng() - 0.5) * (0.006 + 0.03 * Math.abs(truth)),
    );
    return {
      index: i + 1,
      values: {
        "m_h": Number(mi.toFixed(3)),
        F: Number(force.toFixed(3)),
        a: Number(measured.toFixed(3)),
      },
      unit: { "m_h": "kg", F: "N", a: "m/s²" },
    };
  });

  const fit = leastSquares(
    measurements.map((row) => row.values.F),
    measurements.map((row) => row.values.a),
  );
  const usable = measurements.filter((row) => row.values.a > 0.01);
  const massEstimates = usable.map(
    (row) => row.values["m_h"] * (G / row.values.a - 1),
  );
  const massFromFit =
    massEstimates.length > 0
      ? massEstimates.reduce((a, b) => a + b, 0) / massEstimates.length
      : 0;
  const err = relErr(massFromFit, cartMass);
  const verified =
    compensated && fit.slope > 1e-4 && fit.intercept < 0.1 && err < 15;

  const current = cartAcceleration(cartMass, hangingMass, compensated);
  const forceNow = hangingMass * G;

  const calculations: CalculationStep[] = [
    {
      label: zh ? "绳的拉力（合外力）" : "String tension (net force)",
      formula: "F = mg",
      result: Number(forceNow.toFixed(3)),
      unit: "N",
    },
    {
      label: zh ? "理论加速度" : "Theoretical acceleration",
      formula: "a = \\frac{mg - f}{M + m}",
      result: Number(current.acceleration.toFixed(3)),
      unit: "m/s²",
    },
    {
      label: zh ? "a–F 图线斜率（最小二乘）" : "Slope of the a–F line (least squares)",
      formula: "k = \\frac{\\sum (F_i - \\bar{F})(a_i - \\bar{a})}{\\sum (F_i - \\bar{F})^2}",
      result: Number(fit.slope.toFixed(3)),
      unit: "1/kg",
    },
    {
      label: zh ? "由各组加速度反推小车质量（均值）" : "Cart mass from the accelerations (mean)",
      formula: "M = \\frac{1}{n}\\sum_i m_i\\left(\\frac{g}{a_i} - 1\\right)",
      result: Number(massFromFit.toFixed(3)),
      unit: "kg",
    },
    {
      label: zh ? "小车质量相对误差" : "Relative error of the cart mass",
      formula: "E_r = \\frac{|M_{\\text{fit}} - M|}{M} \\times 100\\%",
      result: Number(err.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (!compensated) {
    warnings.push(
      zh
        ? "未平衡摩擦力：a–F 图线在 F 轴上存在正截距，加速度整体偏小，M 的反演结果偏大。"
        : "Friction is not compensated: the a–F line has a positive F intercept, accelerations read low and the fitted mass is biased high.",
    );
  }
  if (hangingMass < 0.02 || hangingMass > 0.1) {
    warnings.push(
      zh
        ? `悬挂砝码质量 ${hangingMass.toFixed(2)} kg 超出 0.02–0.10 kg 的建议范围，F≈mg 的近似不再可靠。`
        : `The hanging mass ${hangingMass.toFixed(2)} kg lies outside the recommended 0.02–0.10 kg range, so F≈mg is no longer reliable.`,
    );
  }
  if (fit.slope <= 1e-4) {
    warnings.push(
      zh
        ? "各测量点的加速度几乎为零，图线斜率无法确定；请减小小车质量或增大砝码质量。"
        : "The accelerations are essentially zero, so the slope cannot be determined; reduce the cart mass or increase the hanging mass.",
    );
  } else if (fit.intercept > 0.15) {
    warnings.push(
      zh
        ? `图线在 a 轴上截距约 ${fit.intercept.toFixed(2)} m/s²，说明阻力未被完全抵消。`
        : `The fitted a intercept is about ${fit.intercept.toFixed(2)} m/s², indicating residual drag.`,
    );
  }

  const errorAnalysis = zh
    ? `图线由 ${measurements.length} 组 (F, a) 数据最小二乘拟合，斜率 k = ${fit.slope.toFixed(3)} kg⁻¹，截距 ${fit.intercept.toFixed(3)} m/s²。误差主要来自：${compensated ? "摩擦力平衡得不够彻底" : "摩擦力完全没有平衡"}，纸带与限位孔之间的摩擦，以及砝码质量并非严格远小于小车质量（m/M = ${(hangingMass / cartMass).toFixed(2)}）导致 T < mg。打点计时器 0.02 s 的计时与点距读数量级为毫米，也会带来随机误差。`
    : `The line is a least-squares fit of ${measurements.length} (F, a) pairs with slope k = ${fit.slope.toFixed(3)} kg⁻¹ and intercept ${fit.intercept.toFixed(3)} m/s². The main error sources are ${compensated ? "imperfect friction compensation" : "the complete absence of friction compensation"}, friction between the tape and the guide slot, and the fact that the hanging mass is not strictly negligible (m/M = ${(hangingMass / cartMass).toFixed(2)}), so T < mg. The 0.02 s tick period and millimetre-level dot readings add random scatter.`;

  const conclusion = zh
    ? `在 M = ${cartMass.toFixed(2)} kg、m = ${hangingMass.toFixed(2)} kg 时，模型给出 a = ${current.acceleration.toFixed(2)} m/s²、T = ${current.tension.toFixed(3)} N。a–F 拟合直线的斜率为 ${fit.slope.toFixed(3)} kg⁻¹，截距 ${fit.intercept.toFixed(3)} m/s²，反推小车质量 ${massFromFit.toFixed(3)} kg，相对误差 ${err.toFixed(1)}%。${verified ? "图线近似过原点，说明加速度与合外力成正比，牛顿第二定律得到验证。" : compensated ? "图线明显不过原点，应先检查摩擦力平衡与纸带阻力。" : "未平衡摩擦力，图线与 F 轴交于正值，加速度系统性偏小，牛顿第二定律未能得到严格验证。"}`
    : `With M = ${cartMass.toFixed(2)} kg and m = ${hangingMass.toFixed(2)} kg the model gives a = ${current.acceleration.toFixed(2)} m/s² and T = ${current.tension.toFixed(3)} N. The fitted a–F line has slope ${fit.slope.toFixed(3)} kg⁻¹ and intercept ${fit.intercept.toFixed(3)} m/s², giving a cart mass of ${massFromFit.toFixed(3)} kg with a relative error of ${err.toFixed(1)}%. ${verified ? "The line passes close to the origin, so acceleration is proportional to net force and Newton's second law is verified." : compensated ? "The line clearly misses the origin; check friction compensation and tape drag first." : "With friction uncompensated the line intercepts the F axis above zero, accelerations read low and Newton's second law is not strictly verified."}`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
