import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { measuredResistance } from "@physchem/experiment-data";
import { num, relErr, type Calculator } from "../types";

export const voltmeterAmmeterResistanceCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const supply = num(params, "supplyVoltage", 4);
  const resistance = num(params, "fixedResistance", 10);
  const fraction = num(params, "rheostatFraction", 0.4);
  const connection = String(params.connection ?? "correct");
  const switchClosed = params.switchClosed !== false;

  const shorted = connection === "ammeterParallel";
  const voltmeterSeries = connection === "voltmeterSeries";

  const uTrials = [0.4, 0.7, 1].map((f) => Number((supply * f).toFixed(2)));

  const measurements: MeasurementRow[] = uTrials.map((u, i) => {
    const ideal = measuredResistance(u, resistance, connection, fraction);
    const current = switchClosed ? ideal.current + (rng() - 0.5) * 0.004 : 0;
    const voltage = switchClosed ? Math.max(0, ideal.voltage + (rng() - 0.5) * 0.02) : 0;
    const r = current > 1e-6 ? voltage / current : 0;
    return {
      index: i + 1,
      values: {
        U: Number(voltage.toFixed(2)),
        I: Number(current.toFixed(4)),
        R: Number(r.toFixed(1)),
      },
      unit: { U: "V", I: "A", R: "Ω" },
    };
  });

  const validTrials = measurements.filter((m) => m.values.I > 1e-3 && m.values.U > 1e-3);
  const rValues = validTrials.map((m) => m.values.R);
  const rMean = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : NaN;
  const err = Number.isFinite(rMean) ? relErr(rMean, resistance) : NaN;

  const calculations: CalculationStep[] = [
    {
      label: zh ? "逐组电阻 R = U/I" : "Resistance from each pair (R = U/I)",
      formula: "R_i = \\frac{U_i}{I_i}",
      result: Number.isFinite(rMean) ? Number(rMean.toFixed(1)) : 0,
      unit: "Ω",
    },
    {
      label: zh ? "平均电阻" : "Mean resistance",
      formula: "\\bar{R} = \\frac{1}{n}\\sum_{i=1}^{n} R_i",
      result: Number.isFinite(rMean) ? Number(rMean.toFixed(1)) : 0,
      unit: "Ω",
    },
    {
      label: zh ? "相对误差" : "Relative error",
      formula: "E_r = \\frac{|\\bar{R} - R_{\\text{true}}|}{R_{\\text{true}}} \\times 100\\%",
      result: Number.isFinite(err) ? Number(err.toFixed(2)) : 0,
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (!switchClosed) {
    warnings.push(
      zh
        ? "开关断开，电路中没有电流，两表均无示数，无法测出电阻。"
        : "The switch is open: no current flows, both meters read zero and R cannot be determined.",
    );
  }
  if (shorted) {
    warnings.push(
      zh
        ? "电流表并联在待测电阻两端，电阻被短路：电压表读数约为零，电流过大，R = U/I 不成立。"
        : "The ammeter is in parallel with the resistor and shorts it: the voltmeter reads almost zero while the current surges, so R = U/I is invalid.",
    );
  }
  if (voltmeterSeries) {
    warnings.push(
      zh
        ? "电压表串联在干路，电路电流几乎为零；此时测得的 R 实际上是电压表内阻（约 3 kΩ）。"
        : "The voltmeter is in series, so the current is almost zero; the computed R is really the voltmeter's own resistance (about 3 kΩ).",
    );
  }
  if (fraction < 0.15 || fraction > 0.85) {
    warnings.push(
      zh
        ? "滑动变阻器接入比例过小或过大，可调范围不足，多组数据变化不明显。"
        : "The rheostat fraction is near an end stop, leaving little adjustment range and little variation between readings.",
    );
  }
  if (supply > 5.5) {
    warnings.push(
      zh
        ? "电源电压接近电表量程上限，读数前应确认所选量程足够，避免超量程。"
        : "The supply is close to the meter range limit; confirm the selected range before reading to avoid over-ranging.",
    );
  }

  const errorAnalysis = zh
    ? `误差主要来自：电压表分流与电流表分压（电表内阻并非理想）、表盘读数（模拟噪声约 ±0.02 V、±0.002 A）、电阻通电发热导致阻值漂移，以及多组数据取平均时各组条件不完全一致。本次平均电阻为 ${Number.isFinite(rMean) ? rMean.toFixed(1) : "—"} Ω，相对误差 ${Number.isFinite(err) ? err.toFixed(2) : "—"}%。`
    : `Errors come from voltmeter shunting and ammeter voltage drop (the meters are not ideal), pointer reading (simulated noise about ±0.02 V and ±0.002 A), resistance drift from heating, and slightly different conditions across trials. The mean resistance is ${Number.isFinite(rMean) ? rMean.toFixed(1) : "—"} Ω with a relative error of ${Number.isFinite(err) ? err.toFixed(2) : "—"}%.`;

  const conclusion = zh
    ? shorted || voltmeterSeries || !switchClosed
      ? `本次接法不正确（${shorted ? "电流表并联" : voltmeterSeries ? "电压表串联" : "开关断开"}），测得的 R = U/I 不能反映待测电阻的真实阻值。`
      : `用伏安法测得待测电阻 R = ${rMean.toFixed(1)} Ω，与标称值 ${resistance.toFixed(0)} Ω 相比相对误差 ${err.toFixed(2)}%，说明 R = U/I 的测量结果可靠。`
    : shorted || voltmeterSeries || !switchClosed
      ? `The circuit is wired incorrectly (${shorted ? "ammeter in parallel" : voltmeterSeries ? "voltmeter in series" : "switch open"}), so R = U/I does not represent the unknown resistor.`
      : `The volt–ammeter method gives R = ${rMean.toFixed(1)} Ω, a relative error of ${err.toFixed(2)}% against the nominal ${resistance.toFixed(0)} Ω, so the measurement is reliable.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
