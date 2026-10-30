import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { saltYield } from "@physchem/experiment-data";
import { num, relErr, type Calculator } from "../types";

export const crudeSaltPurificationCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const waterVolume = num(params, "waterVolume", 40);
  const rinseCount = num(params, "rinseCount", 2);
  const liquidAbovePaper = params.liquidAbovePaper === true;
  const stirDuringEvaporation = params.stirDuringEvaporation !== false;

  const base = saltYield(waterVolume, rinseCount);
  const yieldPercent = Math.max(
    0,
    base.yieldPercent * (liquidAbovePaper ? 0.82 : 1) * (stirDuringEvaporation ? 1 : 0.94),
  );
  const purityPercent = Math.max(
    0,
    base.purityPercent - (liquidAbovePaper ? 5.5 : 0) - (stirDuringEvaporation ? 0 : 1.5),
  );

  const crudeMass = 5;
  const trials = [1, 2, 3, 4].map((index) => {
    const purified = (crudeMass * yieldPercent) / 100 + (rng() - 0.5) * 0.05;
    return {
      index,
      purified,
      trialYield: (purified / crudeMass) * 100,
    };
  });

  const measurements: MeasurementRow[] = trials.map((t) => ({
    index: t.index,
    values: {
      "m(crude)": crudeMass,
      "m(pure)": Number(t.purified.toFixed(3)),
      yield: Number(t.trialYield.toFixed(2)),
    },
    unit: { "m(crude)": "g", "m(pure)": "g", yield: "%" },
  }));

  const meanPurified = trials.reduce((a, t) => a + t.purified, 0) / trials.length;
  const meanYield = trials.reduce((a, t) => a + t.trialYield, 0) / trials.length;
  const err = relErr(meanYield, yieldPercent);
  const dissolvedFactor = Math.min(1, waterVolume / 35);

  const calculations: CalculationStep[] = [
    {
      label: zh ? "平均精盐质量" : "Mean purified mass",
      formula: "\\bar{m} = \\frac{1}{n}\\sum m_i",
      result: Number(meanPurified.toFixed(3)),
      unit: "g",
    },
    {
      label: zh ? "平均产率" : "Mean yield",
      formula: "\\eta = \\frac{\\bar{m}}{m_0} \\times 100\\%",
      result: Number(meanYield.toFixed(2)),
      unit: "%",
    },
    {
      label: zh ? "按水量与洗涤次数计算的产率" : "Yield from water and rinse model",
      formula: "\\eta_0 = 88\\% \\cdot f_V \\cdot f_R",
      result: Number(yieldPercent.toFixed(2)),
      unit: "%",
    },
    {
      label: zh ? "精盐纯度" : "Purity of the purified salt",
      formula: "w = 93\\% + 1.6\\% \\, n_R - \\Delta w",
      result: Number(purityPercent.toFixed(2)),
      unit: "%",
    },
    {
      label: zh ? "产率相对误差" : "Relative error of the yield",
      formula: "E_r = \\frac{|\\bar{\\eta} - \\eta_0|}{\\eta_0} \\times 100\\%",
      result: Number(err.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (liquidAbovePaper) {
    warnings.push(
      zh
        ? "液面高于滤纸边缘：滤液沿滤纸与漏斗间隙流下，可溶性杂质重新进入滤液，产率与纯度同时偏低。"
        : "The liquid level is above the paper edge: filtrate bypasses the paper, soluble impurities re-enter the filtrate and both yield and purity drop.",
    );
  }
  if (rinseCount < 2) {
    warnings.push(
      zh
        ? `只洗涤 ${rinseCount} 次，低于 2–3 次的正常范围，晶体表面残留可溶性杂质，纯度偏低。`
        : `Only ${rinseCount} rinse(s), below the normal 2–3 range; soluble impurities remain on the crystals and purity reads low.`,
    );
  }
  if (waterVolume < 30) {
    warnings.push(
      zh
        ? `溶解用水仅 ${waterVolume} mL，部分氯化钠未溶解而被滤纸截留，产率偏低。`
        : `Only ${waterVolume} mL of water was used; some sodium chloride stayed undissolved and was trapped by the paper, lowering the yield.`,
    );
  }
  if (!stirDuringEvaporation) {
    warnings.push(
      zh
        ? "蒸发时没有搅拌，局部过热导致液滴飞溅，溶质损失使产率偏低。"
        : "Without stirring during evaporation, local overheating spatters droplets and the lost solute lowers the yield.",
    );
  }

  const errorAnalysis = zh
    ? `四次平行测定的平均产率为 ${meanYield.toFixed(2)}%，与模型值 ${yieldPercent.toFixed(2)}% 的相对误差为 ${err.toFixed(1)}%。误差主要来自：精盐转移与称量时的少量损失、滤纸吸附少量溶液、蒸发终点凭外观判断${liquidAbovePaper ? "，以及液面高于滤纸边缘造成的短路" : ""}${stirDuringEvaporation ? "" : "，以及蒸发时未搅拌造成的飞溅"}。溶解因子 f_V = ${dissolvedFactor.toFixed(2)}，洗涤 ${rinseCount} 次，纯度相应为 ${purityPercent.toFixed(1)}%。`
    : `Four parallel runs give a mean yield of ${meanYield.toFixed(2)}%, a relative error of ${err.toFixed(1)}% against the model value of ${yieldPercent.toFixed(2)}%. The deviation comes from small losses during transfer and weighing, solution retained by the filter paper, and judging the end point of evaporation by eye${liquidAbovePaper ? ", plus bypass caused by the liquid level above the paper edge" : ""}${stirDuringEvaporation ? "" : ", plus spattering because the liquid was not stirred"}. The dissolution factor is f_V = ${dissolvedFactor.toFixed(2)} and with ${rinseCount} rinse(s) the purity is ${purityPercent.toFixed(1)}%.`;

  const conclusion = zh
    ? `用 ${waterVolume} mL 水溶解、洗涤 ${rinseCount} 次后，精盐产率约 ${yieldPercent.toFixed(1)}%，纯度约 ${purityPercent.toFixed(1)}%。${liquidAbovePaper ? "液面高于滤纸边缘使滤液短路，本次结果偏低，应控制液面低于滤纸边缘。" : "按“一贴二低三靠”操作并洗涤 2–3 次，可获得较高的产率与纯度。"}`
    : `Dissolving in ${waterVolume} mL of water and rinsing ${rinseCount} time(s) gives a yield of about ${yieldPercent.toFixed(1)}% and a purity of about ${purityPercent.toFixed(1)}%. ${liquidAbovePaper ? "The liquid above the paper edge let filtrate bypass the paper, so these results read low; keep the level below the paper edge." : "Following the seated-paper, low-level, low-pour, touching practice and rinsing two or three times gives a good yield and purity."}`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
