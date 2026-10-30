import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { leverBalance } from "@physchem/experiment-data";
import { num, relErr, type Calculator } from "../types";

export const leverBalanceCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const f1 = num(params, "leftForce", 2);
  const l1 = num(params, "leftArm", 20);
  const f2 = num(params, "rightForce", 2);
  const l2Nominal = num(params, "rightArm", 20);
  const offset = num(params, "hookOffset", 0);
  const l2 = l2Nominal + offset;

  const truth = leverBalance(f1, l1, f2, l2);

  const measurements: MeasurementRow[] = [0, 1, 2].map((i) => {
    const l1Meas = l1 + (rng() - 0.5) * 0.2;
    const l2Meas = l2 + (rng() - 0.5) * 0.2;
    return {
      index: i + 1,
      values: {
        "F₁": f1,
        "L₁": Number(l1Meas.toFixed(1)),
        "F₂": f2,
        "L₂": Number(l2Meas.toFixed(1)),
        "F₁L₁": Number((f1 * l1Meas).toFixed(1)),
        "F₂L₂": Number((f2 * l2Meas).toFixed(1)),
      },
      unit: { "F₁": "N", "L₁": "cm", "F₂": "N", "L₂": "cm", "F₁L₁": "N·cm", "F₂L₂": "N·cm" },
    };
  });

  const meanLeft =
    measurements.reduce((acc, m) => acc + m.values["F₁L₁"], 0) / measurements.length;
  const meanRight =
    measurements.reduce((acc, m) => acc + m.values["F₂L₂"], 0) / measurements.length;
  const meanDiff = meanLeft - meanRight;
  const total = Math.max(1e-6, meanLeft + meanRight);
  const deviation = (Math.abs(meanDiff) / total) * 100;

  const calculations: CalculationStep[] = [
    {
      label: zh ? "左侧力矩（均值）" : "Left torque (mean)",
      formula: "F_1 L_1",
      result: Number(meanLeft.toFixed(1)),
      unit: "N·cm",
    },
    {
      label: zh ? "右侧力矩（均值）" : "Right torque (mean)",
      formula: "F_2 L_2",
      result: Number(meanRight.toFixed(1)),
      unit: "N·cm",
    },
    {
      label: zh ? "两侧力矩之差" : "Difference of torques",
      formula: "\\Delta M = F_1 L_1 - F_2 L_2",
      result: Number(meanDiff.toFixed(1)),
      unit: "N·cm",
    },
    {
      label: zh ? "相对偏差" : "Relative deviation",
      formula: "\\frac{|\\Delta M|}{F_1 L_1 + F_2 L_2} \\times 100\\%",
      result: Number(deviation.toFixed(2)),
      unit: "%",
    },
  ];

  const balanced = Math.abs(meanDiff) < 0.05 * total;
  const warnings: string[] = [];
  if (!balanced) {
    warnings.push(
      zh
        ? `两侧力矩相差 ${Math.abs(meanDiff).toFixed(1)} N·cm，杠杆不能水平平衡；钩码位置偏差为 ${offset.toFixed(1)} cm。`
        : `The torques differ by ${Math.abs(meanDiff).toFixed(1)} N·cm, so the lever cannot be horizontal; the hook offset is ${offset.toFixed(1)} cm.`,
    );
  }
  if (Math.abs(offset) > 1) {
    warnings.push(
      zh
        ? "右侧挂钩位置偏差超出正常范围（±1 cm），应移动挂钩使杠杆重新水平。"
        : "The right hook is outside the normal range (±1 cm); slide it until the beam is horizontal again.",
    );
  }
  if (f1 > 4 || f2 > 4) {
    warnings.push(
      zh
        ? "钩码总重较大，杠杆与支架受力明显，注意检查支架是否稳固。"
        : "The weights are heavy; check that the lever and stand are firmly clamped.",
    );
  }

  const errTorque = relErr(meanRight, meanLeft);

  const errorAnalysis = zh
    ? `三组读数由同一组力臂位置重复得到，力矩差主要来自：支点到挂钩的距离读数（模拟 ±0.1 cm）、挂钩没有严格对准刻度线、杠杆自重未完全平衡，以及水平泡居中判断的人为偏差。右侧力矩相对左侧的偏差为 ${errTorque.toFixed(2)}%。`
    : `The three trials repeat the same arm positions. The torque mismatch comes from reading the fulcrum-to-hook distances (simulated ±0.1 cm), hooks not sitting exactly on a scale mark, residual imbalance of the beam's own weight, and the manual judgement of centring the bubble. The right torque deviates from the left by ${errTorque.toFixed(2)}%.`;

  const conclusion = zh
    ? `在 F₁ = ${f1.toFixed(1)} N、L₁ = ${l1.toFixed(0)} cm 的条件下，杠杆平衡时所需右侧力矩为 ${truth.torqueLeft.toFixed(1)} N·cm；实测 F₂L₂ = ${meanRight.toFixed(1)} N·cm，与 F₁L₁ = ${meanLeft.toFixed(1)} N·cm ${balanced ? "基本相等，验证了 F₁L₁ = F₂L₂" : "不相等，杠杆没有平衡"}。`
    : `With F₁ = ${f1.toFixed(1)} N at L₁ = ${l1.toFixed(0)} cm, the required right torque is ${truth.torqueLeft.toFixed(1)} N·cm. The measured F₂L₂ = ${meanRight.toFixed(1)} N·cm is ${balanced ? "essentially equal to" : "not equal to"} F₁L₁ = ${meanLeft.toFixed(1)} N·cm, so the experiment ${balanced ? "confirms F₁L₁ = F₂L₂" : "does not reach balance"}.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
