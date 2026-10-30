import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { fallingSpeed } from "@physchem/experiment-data";
import { leastSquares, num, relErr, type Calculator } from "../types";

const G = 9.8;

export const mechanicalEnergyConservationCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const height = num(params, "dropHeight", 0.8);
  const massKg = num(params, "mass", 200) / 1000;
  const airResistance = params.airResistance === true;

  const heights = Array.from(new Set([0.4, 0.6, 0.8, height]))
    .sort((a, b) => a - b)
    .slice(0, 4);

  const measurements: MeasurementRow[] = heights.map((hi, i) => {
    const vTrue = fallingSpeed(hi, airResistance);
    const vMeasured = vTrue * (1 + (rng() - 0.5) * 0.01);
    return {
      index: i + 1,
      values: {
        h: Number(hi.toFixed(2)),
        v: Number(vMeasured.toFixed(3)),
        "ΔE_p": Number((massKg * G * hi).toFixed(3)),
        "ΔE_k": Number((0.5 * massKg * vMeasured ** 2).toFixed(3)),
      },
      unit: { h: "m", v: "m/s", "ΔE_p": "J", "ΔE_k": "J" },
    };
  });

  const fit = leastSquares(
    measurements.map((row) => row.values.h),
    measurements.map((row) => row.values.v ** 2),
  );
  const gFromFit = fit.slope / 2;
  const gErr = relErr(gFromFit, G);

  const v = fallingSpeed(height, airResistance);
  const potential = massKg * G * height;
  const kinetic = 0.5 * massKg * v ** 2;
  const difference = potential > 0 ? ((potential - kinetic) / potential) * 100 : 0;

  const calculations: CalculationStep[] = [
    {
      label: zh ? "落至该点的速度" : "Speed at the chosen point",
      formula: "v = \\sqrt{2gh}",
      result: Number(v.toFixed(3)),
      unit: "m/s",
    },
    {
      label: zh ? "重力势能的减少量" : "Loss of gravitational potential energy",
      formula: "\\Delta E_p = mgh",
      result: Number(potential.toFixed(3)),
      unit: "J",
    },
    {
      label: zh ? "动能的增加量" : "Gain in kinetic energy",
      formula: "\\Delta E_k = \\frac{1}{2}mv^2",
      result: Number(kinetic.toFixed(3)),
      unit: "J",
    },
    {
      label: zh ? "由 v²–h 斜率求重力加速度" : "g from the slope of v²–h",
      formula: "g = \\frac{1}{2}\\,\\frac{\\sum (h_i - \\bar{h})(v_i^2 - \\bar{v^2})}{\\sum (h_i - \\bar{h})^2}",
      result: Number(gFromFit.toFixed(3)),
      unit: "m/s²",
    },
    {
      label: zh ? "动能与势能减少量的相对差值" : "Relative shortfall of ΔEk against ΔEp",
      formula: "\\eta = \\frac{\\Delta E_p - \\Delta E_k}{\\Delta E_p} \\times 100\\%",
      result: Number(difference.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (airResistance) {
    warnings.push(
      zh
        ? `空气阻力做负功：ΔEk = ${kinetic.toFixed(3)} J 比 ΔEp = ${potential.toFixed(3)} J 小 ${difference.toFixed(1)}%，机械能不守恒。`
        : `Air drag does negative work: ΔEk = ${kinetic.toFixed(3)} J falls ${difference.toFixed(1)}% short of ΔEp = ${potential.toFixed(3)} J, so mechanical energy is not conserved.`,
    );
  }
  if (height < 0.4 || height > 1.2) {
    warnings.push(
      zh
        ? `下落高度 ${height.toFixed(2)} m 超出 0.4–1.2 m 的建议范围：${height < 0.4 ? "点距过密，速度测量误差大" : "下落时间较长，空气阻力影响明显"}。`
        : `The drop height ${height.toFixed(2)} m is outside the suggested 0.4–1.2 m range: ${height < 0.4 ? "the dots are too crowded for a reliable speed" : "the longer fall makes drag significant"}.`,
    );
  }
  if (gFromFit < 0) {
    warnings.push(
      zh ? "拟合斜率异常，请检查 v² 与 h 的数据对应关系。" : "The fitted slope is negative; check the pairing of v² and h."
    );
  }

  const errorAnalysis = zh
    ? `由 ${measurements.length} 组 (h, v²) 数据拟合得到 v²–h 斜率 ${fit.slope.toFixed(3)} m/s²，对应 g = ${gFromFit.toFixed(2)} m/s²，与 9.80 m/s² 的相对误差为 ${gErr.toFixed(1)}%。误差来源包括：空气阻力与纸带和限位孔之间的摩擦做负功${airResistance ? "（本次已计入空气阻力，因此差值明显偏大）" : ""}；用相邻点平均速度代替瞬时速度带来的方法误差；毫米刻度尺读数与点迹中心判定的偶然误差。重物质量在 mgh = ½mv² 两边可约去，不影响验证结果。`
    : `The ${measurements.length} (h, v²) pairs give a slope of ${fit.slope.toFixed(3)} m/s², hence g = ${gFromFit.toFixed(2)} m/s², a relative error of ${gErr.toFixed(1)}% against 9.80 m/s². Sources include work done against air drag and against friction in the tape slot${airResistance ? " (drag is included here, which is why the shortfall is large)" : ""}, the method error of using a two-interval average as the instantaneous speed, and random errors in reading the ruler and locating dot centres. The mass cancels from mgh = ½mv² and does not affect the verification.`;

  const conclusion = zh
    ? `重物质量 ${(massKg * 1000).toFixed(0)} g、下落高度 ${height.toFixed(2)} m 时，模型给出 v = ${v.toFixed(2)} m/s，ΔEp = ${potential.toFixed(3)} J，ΔEk = ${kinetic.toFixed(3)} J，两者相差 ${difference.toFixed(2)}%。${airResistance ? "由于空气阻力做负功，ΔEk 系统性地小于 ΔEp，机械能不守恒。" : "两者在很小范围内一致，验证了自由落体过程中机械能守恒。"} v²–h 图线斜率给出 g = ${gFromFit.toFixed(2)} m/s²，${airResistance ? "明显小于 9.80 m/s²，说明阻力已使表观重力加速度偏小" : "与当地重力加速度相符"}。`
    : `For a ${(massKg * 1000).toFixed(0)} g mass falling ${height.toFixed(2)} m the model gives v = ${v.toFixed(2)} m/s, ΔEp = ${potential.toFixed(3)} J and ΔEk = ${kinetic.toFixed(3)} J, a difference of ${difference.toFixed(2)}%. ${airResistance ? "Because drag does negative work, ΔEk is systematically smaller than ΔEp and mechanical energy is not conserved." : "The two agree within a very small margin, verifying conservation of mechanical energy in free fall."} The slope of the v²–h line gives g = ${gFromFit.toFixed(2)} m/s², ${airResistance ? "well below 9.80 m/s² because drag lowers the apparent gravitational acceleration" : "consistent with the local gravitational acceleration"}.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
