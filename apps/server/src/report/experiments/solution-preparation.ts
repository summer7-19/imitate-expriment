import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { actualConcentration, soluteMassG } from "@physchem/experiment-data";
import { num, relErr, type Calculator } from "../types";

export const solutionPreparationCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const targetConcentration = num(params, "targetConcentration", 0.5);
  const flaskVolume = num(params, "flaskVolume", 250);
  const solute = params.solute === "na2co3" ? "na2co3" : "nacl";
  const molarMass = solute === "na2co3" ? 106 : 58.5;
  const rinseCount = num(params, "rinseCount", 2);
  const eyeLevel = typeof params.eyeLevel === "string" ? params.eyeLevel : "level";

  const mass = soluteMassG(targetConcentration, flaskVolume, molarMass);
  const actual = actualConcentration(targetConcentration, rinseCount, eyeLevel);
  const volumeFactor = eyeLevel === "up" ? 1.04 : eyeLevel === "down" ? 0.97 : 1;
  const err = relErr(actual, targetConcentration);

  const bottleMass = 20;
  const trials = [1, 2, 3].map((index) => {
    const weighed = mass + (rng() - 0.5) * 0.004;
    return {
      index,
      weighed,
      total: bottleMass + weighed,
    };
  });

  const measurements: MeasurementRow[] = trials.map((t) => ({
    index: t.index,
    values: {
      "m(bottle)": bottleMass,
      "m(total)": Number(t.total.toFixed(3)),
      "m(solute)": Number(t.weighed.toFixed(3)),
    },
    unit: { "m(bottle)": "g", "m(total)": "g", "m(solute)": "g" },
  }));

  const meanMass = trials.reduce((a, t) => a + t.weighed, 0) / trials.length;

  const calculations: CalculationStep[] = [
    {
      label: zh ? "所需溶质的物质的量" : "Moles of solute required",
      formula: "n = c \\cdot V",
      result: Number((targetConcentration * flaskVolume).toFixed(2)),
      unit: "mmol",
    },
    {
      label: zh ? "需称取溶质质量" : "Solute mass to weigh",
      formula: "m = c \\cdot V \\cdot M",
      result: Number(mass.toFixed(3)),
      unit: "g",
    },
    {
      label: zh ? "实际体积校正因子" : "Actual volume factor",
      formula: "f_V = \\frac{V_{\\text{actual}}}{V_{\\text{mark}}}",
      result: Number((volumeFactor * 100).toFixed(1)),
      unit: "%",
    },
    {
      label: zh ? "实际浓度" : "Actual concentration",
      formula: "c_{\\text{actual}} = \\frac{c_{\\text{target}}(1-\\delta)}{f_V}",
      result: Number(actual.toFixed(4)),
      unit: "mol/L",
    },
    {
      label: zh ? "浓度相对误差" : "Relative error of concentration",
      formula: "E_r = \\frac{|c_{\\text{actual}} - c_{\\text{target}}|}{c_{\\text{target}}} \\times 100\\%",
      result: Number(err.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (eyeLevel === "up") {
    warnings.push(
      zh
        ? "仰视刻度线：视线与刻度线的交点偏低，实际加水超过刻度，体积偏大，浓度偏低。"
        : "Looking up at the mark: the sight line meets the scale low, water is added past the mark, so the volume is too large and the concentration too low.",
    );
  } else if (eyeLevel === "down") {
    warnings.push(
      zh
        ? "俯视刻度线：实际液面低于刻度，体积偏小，浓度偏高。"
        : "Looking down at the mark: the actual level is below the mark, so the volume is too small and the concentration too high.",
    );
  }
  if (rinseCount < 2) {
    warnings.push(
      zh
        ? `只洗涤 ${rinseCount} 次，低于 2–3 次的正常范围，烧杯和玻璃棒上残留溶质，浓度偏低。`
        : `Only ${rinseCount} rinse(s), below the normal 2–3 range; solute remains on the beaker and rod, so the concentration reads low.`,
    );
  }

  const soluteName = solute === "na2co3" ? "Na2CO3" : "NaCl";
  const eyeText =
    eyeLevel === "up"
      ? zh
        ? "仰视"
        : "looking up"
      : eyeLevel === "down"
        ? zh
          ? "俯视"
          : "looking down"
        : zh
          ? "平视"
          : "level";

  const errorAnalysis = zh
    ? `三次称量的平均溶质质量为 ${meanMass.toFixed(3)} g，与理论值 ${mass.toFixed(3)} g 相差 ${Math.abs(meanMass - mass).toFixed(3)} g，说明天平称量本身较稳定。浓度偏差主要来自定容：${eyeText}刻度线使实际体积为标记体积的 ${(volumeFactor * 100).toFixed(1)}%；${rinseCount < 2 ? `洗涤仅 ${rinseCount} 次，溶质未全部转移；` : `洗涤 ${rinseCount} 次，溶质转移较完全；`}此外读数时凹液面最低点判断、滴管最后一滴的控制也会带来少量误差。`
    : `The mean weighed solute is ${meanMass.toFixed(3)} g, only ${Math.abs(meanMass - mass).toFixed(3)} g from the theoretical ${mass.toFixed(3)} g, so the balance itself is stable. The concentration deviation comes mainly from make-up: ${eyeText} at the mark makes the actual volume ${(volumeFactor * 100).toFixed(1)}% of the marked volume; ${rinseCount < 2 ? `only ${rinseCount} rinse(s) leave solute in the beaker; ` : `${rinseCount} rinses transfer the solute well; `}judging the meniscus bottom and the final drop from the dropper add small reading errors.`;

  const conclusion = zh
    ? `配制 ${flaskVolume} mL、${targetConcentration.toFixed(2)} mol/L 的 ${soluteName} 溶液需称取 ${mass.toFixed(3)} g 溶质；按所选条件定容后实际浓度约为 ${actual.toFixed(4)} mol/L，相对偏差 ${err.toFixed(2)}%。定容时应平视刻度线，并洗涤烧杯和玻璃棒 2–3 次。`
    : `Preparing ${flaskVolume} mL of ${targetConcentration.toFixed(2)} mol/L ${soluteName} solution requires ${mass.toFixed(3)} g of solute; after make-up under the chosen conditions the actual concentration is about ${actual.toFixed(4)} mol/L, a relative deviation of ${err.toFixed(2)}%. Keep the eye level with the mark and rinse the beaker and rod two or three times.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
