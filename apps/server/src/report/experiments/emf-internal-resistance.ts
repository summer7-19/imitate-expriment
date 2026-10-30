import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { terminalVoltage } from "@physchem/experiment-data";
import { leastSquares, num, relErr, type Calculator } from "../types";

export const emfInternalResistanceCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const emf = num(params, "emf", 3);
  const internalR = num(params, "internalR", 1.5);
  const externalR = num(params, "externalR", 10);
  const ammeterInternal = params.ammeterInternal === true;

  /** 电流表内接时，其内阻（约 0.1 Ω）等效串联进电源内阻 */
  const measuredR = internalR + (ammeterInternal ? 0.1 : 0);

  const trialExternalR = Array.from(
    new Set(
      [0.45, 0.7, 1, 1.45, 1.9].map((f) =>
        Math.round(Math.min(50, Math.max(1, externalR * f))),
      ),
    ),
  ).sort((a, b) => a - b);

  const measurements: MeasurementRow[] = trialExternalR.map((rExt, i) => {
    const iTrue = terminalVoltage(emf, internalR, rExt, ammeterInternal).current;
    const iMeas = iTrue + (rng() - 0.5) * 0.008;
    const uMeas = emf - iMeas * measuredR + (rng() - 0.5) * 0.02;
    return {
      index: i + 1,
      values: {
        I: Number(iMeas.toFixed(3)),
        U: Number(uMeas.toFixed(3)),
        R: rExt,
      },
      unit: { I: "A", U: "V", R: "Ω" },
    };
  });

  const fit = leastSquares(
    measurements.map((m) => m.values.I),
    measurements.map((m) => m.values.U),
  );
  const emfFit = fit.intercept;
  const rFit = -fit.slope;
  const errEmf = relErr(emfFit, emf);
  const errR = relErr(rFit, internalR);
  const operating = terminalVoltage(emf, internalR, externalR, ammeterInternal);

  const calculations: CalculationStep[] = [
    {
      label: zh ? "U–I 拟合斜率" : "Slope of the U–I fit",
      formula: "k = \\frac{\\Delta U}{\\Delta I}",
      result: Number(fit.slope.toFixed(3)),
      unit: "V/A",
    },
    {
      label: zh ? "内阻（斜率绝对值）" : "Internal resistance (slope magnitude)",
      formula: "r' = |k|",
      result: Number(rFit.toFixed(2)),
      unit: "Ω",
    },
    {
      label: zh ? "电动势（纵截距）" : "EMF (vertical intercept)",
      formula: "E' = U_{I=0}",
      result: Number(emfFit.toFixed(2)),
      unit: "V",
    },
    {
      label: zh ? "内阻相对误差" : "Relative error of r",
      formula: "\\frac{|r' - r|}{r} \\times 100\\%",
      result: Number(errR.toFixed(2)),
      unit: "%",
    },
    {
      label: zh ? "电动势相对误差" : "Relative error of E",
      formula: "\\frac{|E' - E|}{E} \\times 100\\%",
      result: Number(errEmf.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (ammeterInternal) {
    warnings.push(
      zh
        ? "电流表内接：其内阻被计入电源内阻，拟合直线变陡，r′ 系统性偏大。"
        : "The ammeter is inside the voltmeter loop: its resistance adds to the internal resistance, so the line steepens and r′ is biased high.",
    );
  }
  if (externalR < 5) {
    warnings.push(
      zh
        ? "外电阻小于 5 Ω，电流较大，电池发热会使 E 与 r 在测量过程中变化。"
        : "External resistance below 5 Ω draws a large current; heating changes E and r during the run.",
    );
  } else if (externalR > 40) {
    warnings.push(
      zh
        ? "外电阻大于 40 Ω，路端电压随 R 的变化很小，U、I 读数相对误差被放大。"
        : "Above 40 Ω the terminal voltage barely changes with R, so the relative errors of U and I grow.",
    );
  }

  const errorAnalysis = zh
    ? `由 ${measurements.length} 组 U、I 数据最小二乘拟合得到 U = ${emfFit.toFixed(2)} − ${rFit.toFixed(2)} I，直线斜率绝对值即内阻、纵截距即电动势。误差主要来自电压表分流与电流表分压、表盘读数（模拟噪声约 ±0.01 V、±0.004 A）、电池发热引起 E 与 r 的漂移，以及描点画线的人为偏差。${ammeterInternal ? "本次电流表内接，约 0.1 Ω 的电流表内阻被计入 r′，这是内阻偏大的主要原因。" : ""}`
    : `A least-squares fit of ${measurements.length} (I, U) pairs gives U = ${emfFit.toFixed(2)} − ${rFit.toFixed(2)} I, whose slope magnitude is the internal resistance and whose intercept is the EMF. Errors come from voltmeter shunting and ammeter voltage drop, meter reading (simulated noise about ±0.01 V and ±0.004 A), heating that drifts E and r, and the manual line fit.${ammeterInternal ? " Here the ammeter is inside the loop, so about 0.1 Ω of ammeter resistance is counted in r′ — the main reason r′ reads high." : ""}`;

  const conclusion = zh
    ? `测得电源电动势 E′ = ${emfFit.toFixed(2)} V、内阻 r′ = ${rFit.toFixed(2)} Ω；与设定值 E = ${emf.toFixed(1)} V、r = ${internalR.toFixed(1)} Ω 相比，相对误差分别为 ${errEmf.toFixed(1)}% 和 ${errR.toFixed(1)}%。当 R = ${externalR.toFixed(0)} Ω 时，工作电流 I = ${operating.current.toFixed(2)} A，路端电压 U = ${operating.voltage.toFixed(2)} V。`
    : `The fitted cell has E′ = ${emfFit.toFixed(2)} V and r′ = ${rFit.toFixed(2)} Ω, giving relative errors of ${errEmf.toFixed(1)}% and ${errR.toFixed(1)}% against E = ${emf.toFixed(1)} V and r = ${internalR.toFixed(1)} Ω. At R = ${externalR.toFixed(0)} Ω the cell delivers I = ${operating.current.toFixed(2)} A at U = ${operating.voltage.toFixed(2)} V.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
