import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { carbonDioxideVolume, type CarbonateAcid } from "@physchem/experiment-data";
import { num, type Calculator } from "../types";

export const carbonDioxidePreparationCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const acid: CarbonateAcid = String(params.acid) === "diluteH2SO4" ? "diluteH2SO4" : "diluteHCl";
  const acidVolume = num(params, "acidVolume", 50);
  const marbleMass = num(params, "marbleMass", 15);
  const collectionTime = num(params, "collectionTime", 15);

  const fractions = [0.25, 0.5, 0.75, 1];
  const measurements: MeasurementRow[] = fractions.map((f, i) => {
    const t = Number((collectionTime * f).toFixed(1));
    const { volumeMl } = carbonDioxideVolume(acid, acidVolume, marbleMass, t);
    const vMeasured = Math.max(0, volumeMl + (rng() - 0.5) * 0.8);
    return {
      index: i + 1,
      values: {
        "t(s)": t,
        "V(mL)": Number(vMeasured.toFixed(1)),
        "v(mL/s)": Number((vMeasured / Math.max(t, 0.1)).toFixed(2)),
      },
      unit: { "t(s)": "s", "V(mL)": "mL", "v(mL/s)": "mL/s" },
    };
  });

  const totalTime = measurements.reduce((sum, row) => sum + row.values["t(s)"], 0);
  const totalVolume = measurements.reduce((sum, row) => sum + row.values["V(mL)"], 0);
  const meanRate = totalTime > 0 ? totalVolume / totalTime : 0;

  const finalVol = carbonDioxideVolume(acid, acidVolume, marbleMass, collectionTime).volumeMl;
  const acidCoefficient = acid === "diluteHCl" ? 12 : 1.5;
  const acidCap = acidVolume * acidCoefficient;
  const marbleCap = marbleMass * 22;

  const calculations: CalculationStep[] = [
    {
      label: zh ? "收集时间内平均产气速率" : "Mean gas rate over the collection time",
      formula: "\\bar{v} = \\frac{\\sum V_i}{\\sum t_i}",
      result: Number(meanRate.toFixed(2)),
      unit: "mL/s",
    },
    {
      label: zh ? "按酸量估算的气体上限" : "Upper volume set by the acid",
      formula: `V_{\\max} \\approx ${acidCoefficient} \\cdot V_{\\text{acid}}`,
      result: Number(acidCap.toFixed(0)),
      unit: "mL",
    },
    {
      label: zh ? "按石灰石估算的气体上限" : "Upper volume set by the marble",
      formula: "V_{\\max} \\approx 22 \\cdot m_{\\text{marble}}",
      result: Number(marbleCap.toFixed(0)),
      unit: "mL",
    },
    {
      label: zh ? "收集结束时的气体体积" : "Volume collected by the end",
      formula: "V = V_{\\max} \\left[1 - \\left(1 - \\frac{t}{t_{\\text{full}}}\\right)^2\\right]",
      result: Number(finalVol.toFixed(0)),
      unit: "mL",
    },
  ];

  const warnings: string[] = [];
  if (acidVolume < 30) {
    warnings.push(
      zh
        ? "稀酸用量低于 30 mL，产生的气体偏少，可能不足以收集满一瓶。"
        : "Acid volume is below 30 mL, so the gas may not fill the jar.",
    );
  } else if (acidVolume > 60) {
    warnings.push(
      zh
        ? "稀酸用量超过 60 mL（教学范围），会浪费药品并延长反应时间。"
        : "Acid volume exceeds the 60 mL teaching range, wasting reagent and time.",
    );
  }
  if (acid === "diluteH2SO4") {
    warnings.push(
      zh
        ? "稀硫酸与石灰石生成微溶的硫酸钙，覆盖在石灰石表面阻止反应，气泡很快停止。"
        : "Sulfuric acid forms slightly soluble calcium sulfate that coats the marble; the bubbles soon stop.",
    );
  }
  const stopped = carbonDioxideVolume(acid, acidVolume, marbleMass, collectionTime).stopped;
  if (stopped) {
    warnings.push(
      zh
        ? `反应在约 4 s 时已基本停止，收集时间 ${collectionTime.toFixed(0)} s 内后期几乎没有新气体。`
        : `The reaction is essentially over by about 4 s, so little new gas forms during the ${collectionTime.toFixed(0)} s collection.`,
    );
  }

  const acidZh = acid === "diluteH2SO4" ? "稀硫酸" : "稀盐酸";
  const acidEn = acid === "diluteH2SO4" ? "dilute sulfuric acid" : "dilute hydrochloric acid";

  const errorAnalysis = zh
    ? `${acidZh}与石灰石反应生成二氧化碳，本组数据由教学模型计算并在体积上叠加 ±0.4 mL 读数噪声。平均产气速率为 ${meanRate.toFixed(2)} mL/s，${collectionTime.toFixed(0)} s 内共收集约 ${finalVol.toFixed(0)} mL。气体体积受酸量（${acidVolume.toFixed(0)} mL）和石灰石质量（${marbleMass.toFixed(0)} g）共同限制，取两者估算上限中较小的一个；${acid === "diluteH2SO4" ? "硫酸钙覆盖层使反应提前停止，是本组最主要的偏差来源。" : "随着酸被消耗、石灰石表面减少，后期速率会逐渐下降。"}集气瓶刻度与反应开始时刻的判断也会带来少量误差。`
    : `${acidEn} reacts with marble to give carbon dioxide. The volumes come from the teaching model with ±0.4 mL reading noise added. The mean rate is ${meanRate.toFixed(2)} mL/s and about ${finalVol.toFixed(0)} mL is collected in ${collectionTime.toFixed(0)} s. The yield is limited by both the acid (${acidVolume.toFixed(0)} mL) and the marble (${marbleMass.toFixed(0)} g), whichever cap is lower; ${acid === "diluteH2SO4" ? "the calcium sulfate coating stops the reaction early and is the main source of deviation." : "the rate falls as acid is consumed and the marble surface shrinks."} Reading the jar scale and judging the start of the reaction add a little more uncertainty.`;

  const conclusion = zh
    ? `用${acidZh}与石灰石反应，${collectionTime.toFixed(0)} s 内平均产气速率约 ${meanRate.toFixed(2)} mL/s，收集到约 ${finalVol.toFixed(0)} mL 二氧化碳；气体经向上排空气法收集后通入澄清石灰水，石灰水变浑浊即可证明是二氧化碳。${acid === "diluteH2SO4" ? "本组用稀硫酸，反应很快停止，说明稀硫酸不适合代替稀盐酸。" : ""}`
    : `With ${acidEn} and marble, the mean rate over ${collectionTime.toFixed(0)} s is about ${meanRate.toFixed(2)} mL/s and roughly ${finalVol.toFixed(0)} mL of carbon dioxide is collected. Collected by upward displacement of air, the gas turns clear limewater milky, confirming carbon dioxide.${acid === "diluteH2SO4" ? " Here sulfuric acid stops the reaction quickly, so it is not a suitable replacement for hydrochloric acid." : ""}`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
