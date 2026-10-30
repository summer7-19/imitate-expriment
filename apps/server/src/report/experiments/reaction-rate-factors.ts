import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { relativeRate } from "@physchem/experiment-data";
import { num, type Calculator } from "../types";

const V_MAX = 60; // 收集气体体积上限 / mL
const TAU_BASE = 18; // 基准特征时间 / s

function volumeAt(timeS: number, rate: number): number {
  const tau = TAU_BASE / Math.max(0.05, rate);
  return V_MAX * (1 - Math.exp(-Math.max(0, timeS) / tau));
}

export const reactionRateFactorsCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const temperature = num(params, "temperature", 25);
  const concentration = num(params, "concentration", 0.5);
  const catalyst = params.catalyst === true;
  const powder = params.powder === true;
  const controlled = params.controlled !== false;

  const rate = relativeRate(temperature, concentration, catalyst, powder);
  const tau = TAU_BASE / Math.max(0.05, rate);
  const t40 = -tau * Math.log(1 - 40 / V_MAX);

  const times = [10, 20, 30, 40];
  const measurements: MeasurementRow[] = times.map((t, i) => ({
    index: i + 1,
    values: {
      t_s: t,
      V_mL: Number((volumeAt(t, rate) + (rng() - 0.5) * 0.8).toFixed(2)),
      v_mL_s: Number(((V_MAX / tau) * Math.exp(-t / tau)).toFixed(3)),
    },
    unit: { t_s: "s", V_mL: "mL", v_mL_s: "mL/s" },
  }));

  const vFirst = measurements[0].values.V_mL;
  const vLast = measurements[measurements.length - 1].values.V_mL;
  const vMean = (vLast - vFirst) / (times[times.length - 1] - times[0]);

  const calculations: CalculationStep[] = [
    {
      label: zh ? "相对速率（归一化模型）" : "Relative rate (normalised model)",
      formula:
        "r = 2^{\\frac{T-25}{10}} \\cdot \\frac{c}{0.5} \\cdot k_{\\mathrm{cat}} \\cdot k_{A}",
      result: Number(rate.toFixed(2)),
      unit: "×",
    },
    {
      label: zh ? "特征时间" : "Characteristic time",
      formula: "\\tau = \\frac{18.0}{r}",
      result: Number(tau.toFixed(3)),
      unit: "s",
    },
    {
      label: zh ? "收集 40 mL 所需时间" : "Time to collect 40 mL",
      formula: "t_{40} = -\\tau \\ln\\left(1-\\frac{40}{60}\\right)",
      result: Number(t40.toFixed(3)),
      unit: "s",
    },
    {
      label: zh ? "10–40 s 平均速率" : "Mean rate from 10–40 s",
      formula: "\\bar{v} = \\frac{V_{40}-V_{10}}{30}",
      result: Number(vMean.toFixed(3)),
      unit: "mL/s",
    },
  ];

  const warnings: string[] = [];
  if (!controlled) {
    warnings.push(
      zh
        ? "未保持其他条件不变：温度与浓度同时改变，速率变化无法归因，实验失去控制变量意义。"
        : "Other variables were not held constant: temperature and concentration change together, so the rate change cannot be attributed to either factor.",
    );
  }
  if (temperature < 25 || temperature > 60) {
    warnings.push(
      zh
        ? `水浴温度 ${temperature.toFixed(0)} °C 超出 25–60 °C 的建议范围，水分蒸发加快，注射器读数可能不稳定。`
        : `The bath temperature ${temperature.toFixed(0)} °C is outside the suggested 25–60 °C range; faster evaporation makes the syringe readings less stable.`,
    );
  }
  if (rate > 100) {
    warnings.push(
      zh
        ? "多因素叠加使相对速率极大，气体在很短时间内就接近收集上限，难以分辨曲线的斜率差异。"
        : "The combined factors give an extremely large relative rate; the gas reaches the collection limit almost at once, so slope differences are hard to resolve.",
    );
  }

  const conditionZh = `T = ${temperature.toFixed(0)} °C、c(HCl) = ${concentration.toFixed(1)} mol/L、${catalyst ? "加入 MnO₂" : "未加催化剂"}、石灰石为${powder ? "粉末" : "块状"}`;
  const conditionEn = `T = ${temperature.toFixed(0)} °C, c(HCl) = ${concentration.toFixed(1)} mol/L, ${catalyst ? "MnO₂ added" : "no catalyst"}, marble as ${powder ? "powder" : "blocks"}`;

  const errorAnalysis = zh
    ? `实验条件为 ${conditionZh}。曲线按 V(t) = V∞(1 − e^(−t/τ)) 模拟，注射器读数叠加了 ±0.4 mL 的随机噪声。误差主要来自：注射器活塞摩擦与读数估读、水浴温度波动（尤其高于 60 °C 时水分蒸发）、石灰石表面不均匀以及导管内少量气体的滞留。${controlled ? "由于每次只改变一个因素，速率差异可以归因于该因素。" : "本组温度与浓度同时改变，虽然曲线仍可绘出，但无法判断速率变化由哪一因素主导，这是控制变量失败带来的系统性问题。"}`
    : `Conditions: ${conditionEn}. The curve follows V(t) = V∞(1 − e^(−t/τ)) with ±0.4 mL random noise on each syringe reading. Deviations come from plunger friction and reading uncertainty, water-bath temperature drift (evaporation matters above 60 °C), an uneven marble surface, and gas held in the delivery tube. ${controlled ? "Because only one factor changes at a time, the rate difference can be attributed to that factor." : "Here temperature and concentration change together; the curve can still be plotted, but the dominant cause of the rate change cannot be identified — a systematic failure of the controlled-variable method."}`;

  const conclusion = zh
    ? `在${conditionZh}下，相对速率为基准条件的 ${rate.toFixed(2)} 倍，模型预测收集 40 mL CO₂ 约需 ${t40.toFixed(2)} s，10–40 s 的平均速率为 ${vMean.toFixed(2)} mL/s。${controlled ? "结果说明温度、浓度、催化剂与接触面积都会改变反应速率，比较曲线斜率即可判断快慢。" : "由于未控制变量，上述数值只能描述综合效果，不能作为单一因素影响的证据。"}`
    : `Under ${conditionEn}, the relative rate is ${rate.toFixed(2)} times the baseline; the model predicts about ${t40.toFixed(2)} s to collect 40 mL of CO₂, with a mean rate of ${vMean.toFixed(2)} mL/s from 10–40 s. ${controlled ? "Temperature, concentration, catalyst and contact area all change the rate, and the curve slope ranks the trials." : "With the variables confounded, these values describe only the combined effect and cannot prove the influence of any single factor."}`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
