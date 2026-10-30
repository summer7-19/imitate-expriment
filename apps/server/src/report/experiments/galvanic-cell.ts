import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { galvanicCurrent } from "@physchem/experiment-data";
import { leastSquares, num, relErr, type Calculator } from "../types";

export const galvanicCellCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const externalR = num(params, "externalR", 20);
  const saltBridge = params.saltBridge !== false;
  const isCuso4 = String(params.electrolyte ?? "h2so4") === "cuso4";

  const { emf, current } = galvanicCurrent(externalR, saltBridge);

  const trialExternalR = Array.from(
    new Set(
      [0.45, 0.7, 1, 1.45, 1.9].map((f) =>
        Math.round(Math.min(100, Math.max(1, externalR * f))),
      ),
    ),
  ).sort((a, b) => a - b);

  const measurements: MeasurementRow[] = trialExternalR.map((rExt, i) => {
    const model = galvanicCurrent(rExt, saltBridge).current;
    const iMeasMa = saltBridge ? model * 1000 + (rng() - 0.5) * 0.4 : 0;
    const uMeas = saltBridge ? model * rExt + (rng() - 0.5) * 0.002 : 0;
    return {
      index: i + 1,
      values: {
        R: rExt,
        I: Number(iMeasMa.toFixed(2)),
        U: Number(uMeas.toFixed(3)),
      },
      unit: { R: "Ω", I: "mA", U: "V" },
    };
  });

  const meanIMa =
    measurements.reduce((sum, m) => sum + m.values.I, 0) / measurements.length;
  const errI = relErr(meanIMa, current * 1000);

  const fit = leastSquares(
    measurements.map((m) => m.values.I / 1000),
    measurements.map((m) => m.values.U),
  );
  const emfFit = fit.intercept;
  const rFit = -fit.slope;

  const calculations: CalculationStep[] = saltBridge
    ? [
        {
          label: zh ? "U–I 拟合斜率" : "Slope of the U–I fit",
          formula: "k = \\frac{\\Delta U}{\\Delta I}",
          result: Number(fit.slope.toFixed(3)),
          unit: "Ω",
        },
        {
          label: zh ? "电池内阻（斜率绝对值）" : "Internal resistance (slope magnitude)",
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
          label: zh ? "平均电流相对偏差" : "Relative deviation of mean current",
          formula: "\\frac{|\\bar{I} - I|}{I} \\times 100\\%",
          result: Number(errI.toFixed(2)),
          unit: "%",
        },
      ]
    : [
        {
          label: zh ? "电池电动势（模型值）" : "Cell EMF (model value)",
          formula: "E_{\\text{cell}}",
          result: Number(emf.toFixed(2)),
          unit: "V",
        },
        {
          label: zh ? "回路电流（内电路断开）" : "Circuit current (internal circuit open)",
          formula: "I = \\frac{E}{R + r}",
          result: 0,
          unit: "mA",
        },
        {
          label: zh ? "路端电压" : "Terminal voltage",
          formula: "U = IR",
          result: 0,
          unit: "V",
        },
      ];

  const warnings: string[] = [];
  if (!saltBridge) {
    warnings.push(
      zh
        ? "盐桥缺失：内电路不闭合，电流表指针停在零位，电池不能持续供电。"
        : "Salt bridge missing: the internal circuit is open, the needle stays at zero and the cell cannot deliver current.",
    );
  }
  if (externalR < 5) {
    warnings.push(
      zh
        ? "外电路电阻小于 5 Ω，电流较大，电池发热与极化会明显降低输出。"
        : "External resistance below 5 Ω draws a large current; heating and polarisation reduce the output.",
    );
  } else if (externalR > 80) {
    warnings.push(
      zh
        ? "外电路电阻大于 80 Ω，电流过小，电流表指针偏转不明显。"
        : "Above 80 Ω the current is so small that the needle barely deflects.",
    );
  }

  const cathodeText = isCuso4
    ? zh
      ? "Cu²⁺ + 2e⁻ = Cu"
      : "Cu²⁺ + 2e⁻ = Cu"
    : zh
      ? "2H⁺ + 2e⁻ = H₂↑"
      : "2H⁺ + 2e⁻ = H₂↑";
  const overallText = isCuso4 ? "Zn + Cu²⁺ = Zn²⁺ + Cu" : "Zn + 2H⁺ = Zn²⁺ + H₂↑";

  const errorAnalysis = zh
    ? saltBridge
      ? `由 ${measurements.length} 组 U、I 数据拟合得 U = ${emfFit.toFixed(2)} − ${rFit.toFixed(2)} I，纵截距接近标准电动势 1.10 V，斜率绝对值对应电池内阻（模型值约 0.6 Ω）。误差主要来自盐桥接触电阻与离子迁移的极化、电极表面氧化层、溶液浓度变化，以及电流表内阻与读数噪声（模拟约 ±0.2 mA）。`
      : "盐桥缺失时两杯溶液彼此绝缘，内电路断开，外电路中只能出现极短暂的瞬时电流，随后电流表归零。此时由 U–I 数据无法得到有效的电动势与内阻，测量结果只反映断路状态。"
    : saltBridge
      ? `A fit of ${measurements.length} (I, U) pairs gives U = ${emfFit.toFixed(2)} − ${rFit.toFixed(2)} I. The intercept is close to the standard 1.10 V EMF and the slope magnitude is the cell internal resistance (about 0.6 Ω in the model). Errors come from salt-bridge contact resistance and polarisation, oxide films on the electrodes, concentration changes, ammeter resistance and reading noise (±0.2 mA simulated).`
      : "Without the salt bridge the two solutions are electrically isolated, so the internal circuit is open. Only a brief transient current can flow before the needle returns to zero, and no meaningful EMF or internal resistance can be extracted from the U–I data.";

  const conclusion = zh
    ? saltBridge
      ? `在 R = ${externalR.toFixed(0)} Ω 时，铜锌原电池输出电流 I = ${(current * 1000).toFixed(1)} mA、路端电压 U = ${(current * externalR).toFixed(2)} V；负极反应 Zn − 2e⁻ = Zn²⁺，正极反应 ${cathodeText}，总反应 ${overallText}。电子经外电路由 Zn 流向 Cu，盐桥中的 K⁺、Cl⁻ 定向迁移维持电荷平衡。`
      : `盐桥断开时电流为 0 mA，电池不能持续工作。重新连接盐桥后，负极 Zn − 2e⁻ = Zn²⁺、正极 ${cathodeText}，电子才能经外电路由 Zn 流向 Cu。`
    : saltBridge
      ? `At R = ${externalR.toFixed(0)} Ω the Cu–Zn cell delivers I = ${(current * 1000).toFixed(1)} mA at U = ${(current * externalR).toFixed(2)} V. The anode reaction is Zn − 2e⁻ = Zn²⁺, the cathode reaction is ${cathodeText}, and the overall reaction is ${overallText}. Electrons flow from Zn to Cu through the external circuit while K⁺ and Cl⁻ migrate through the salt bridge.`
      : `With the salt bridge removed the current is 0 mA and the cell cannot operate continuously. Reconnecting the bridge allows Zn − 2e⁻ = Zn²⁺ at the anode and ${cathodeText} at the cathode, so electrons can flow from Zn to Cu through the external circuit.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
