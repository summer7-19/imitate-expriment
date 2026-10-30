import type { CalculationStep, MeasurementRow } from "@physchem/experiment-schema";
import { oxygenRate, type OxygenMethod } from "@physchem/experiment-data";
import { num, relErr, type Calculator } from "../types";

export const oxygenPreparationCalculator: Calculator = ({ locale, params, rng }) => {
  const zh = locale !== "en-US";
  const method: OxygenMethod = String(params.method) === "kmno4" ? "kmno4" : "h2o2";
  const catalyst = num(params, "catalystAmount", 1);
  const heated = params.heated !== false;
  const target = num(params, "collectVolume", 150);
  const tubeTilt = String(params.tubeTilt) === "up" ? "up" : "down";

  const rate = oxygenRate(method, catalyst, heated);
  const purity = rate <= 0 ? 0 : method === "h2o2" ? Math.min(98.5, 90 + catalyst * 3.5 + (heated ? 1.5 : 0)) : 97;

  const times = [5, 10, 15, 20];
  const noiseScale = rate > 0 ? 0.2 : 0;
  const measured = times.map((t) => {
    const v = Math.max(0, rate + (rng() - 0.5) * noiseScale);
    return { t, v, volume: v * t };
  });

  const measurements: MeasurementRow[] = measured.map((row, i) => ({
    index: i + 1,
    values: {
      "t(s)": row.t,
      "V(mL)": Number(row.volume.toFixed(1)),
      "v(mL/s)": Number(row.v.toFixed(2)),
    },
    unit: { "t(s)": "s", "V(mL)": "mL", "v(mL/s)": "mL/s" },
  }));

  const totalTime = measured.reduce((sum, row) => sum + row.t, 0);
  const totalVolume = measured.reduce((sum, row) => sum + row.volume, 0);
  const meanRate = totalTime > 0 ? totalVolume / totalTime : 0;
  const timeNeeded = meanRate > 0 ? target / meanRate : 0;
  const err = relErr(meanRate, rate);

  const calculations: CalculationStep[] = [
    {
      label: zh ? "平均产氧速率" : "Mean oxygen production rate",
      formula: "\\bar{v} = \\frac{\\sum V_i}{\\sum t_i}",
      result: Number(meanRate.toFixed(2)),
      unit: "mL/s",
    },
    {
      label: zh ? "收集目标体积所需时间" : "Time needed for the target volume",
      formula: "t = \\frac{V_{\\text{target}}}{\\bar{v}}",
      result: Number(timeNeeded.toFixed(1)),
      unit: "s",
    },
    {
      label: zh ? "氧气纯度估算（教学模型）" : "Estimated oxygen purity (teaching model)",
      formula: method === "h2o2" ? "P \\approx 90\\% + 3.5\\% \\times m(\\mathrm{MnO_2})" : "P \\approx 97\\%",
      result: Number(purity.toFixed(1)),
      unit: "%",
    },
    {
      label: zh ? "速率相对偏差" : "Relative deviation of the rate",
      formula: "E_r = \\frac{|\\bar{v} - v_{\\text{model}}|}{v_{\\text{model}}} \\times 100\\%",
      result: Number(err.toFixed(2)),
      unit: "%",
    },
  ];

  const warnings: string[] = [];
  if (target < 100) {
    warnings.push(
      zh
        ? "目标收集体积低于 100 mL，气体太少，带火星木条不易复燃，不便验满。"
        : "The target volume is below 100 mL; too little gas for a reliable glowing-splint test.",
    );
  } else if (target > 250) {
    warnings.push(
      zh
        ? "目标收集体积超过 250 mL（教学范围），会消耗过多药品和时间。"
        : "The target volume exceeds the 250 mL teaching range, wasting reagents and time.",
    );
  }
  if (tubeTilt === "up") {
    warnings.push(
      zh
        ? "试管口向上倾斜：冷凝水会倒流到热的试管底部，可能使试管炸裂。"
        : "With the tube mouth tilted up, condensed water runs back to the hot bottom and may crack the tube.",
    );
  }
  if (rate <= 0) {
    warnings.push(
      zh
        ? "高锰酸钾未加热时不分解，没有氧气产生，应点燃酒精灯并先预热。"
        : "Permanganate does not decompose without heat; light the lamp and preheat the tube.",
    );
  }

  const routeZh = method === "h2o2" ? "过氧化氢在二氧化锰催化下分解" : "高锰酸钾受热分解";
  const routeEn =
    method === "h2o2"
      ? "hydrogen peroxide decomposed over manganese dioxide"
      : "potassium permanganate decomposed by heat";

  const errorAnalysis = zh
    ? `本组数据由${routeZh}的教学模型生成，平均产氧速率为 ${meanRate.toFixed(2)} mL/s，与模型值 ${rate.toFixed(1)} mL/s 的相对偏差为 ${err.toFixed(1)}%。误差主要来自秒表计时与集气瓶刻度读数（模拟叠加 ±${noiseScale.toFixed(1)} mL/s 噪声）；${catalyst > 0 ? `二氧化锰用量 ${catalyst.toFixed(1)} g 影响催化效果` : "未加入二氧化锰时催化作用很弱"}，${heated ? "加热使分子运动加快，速率增大" : "未加热时反应较慢"}。${tubeTilt === "up" ? "试管口向上还会带来冷凝水倒流的操作风险。" : ""}`
    : `The data come from the ${routeEn} teaching model. The mean rate is ${meanRate.toFixed(2)} mL/s, a ${err.toFixed(1)}% deviation from the model value ${rate.toFixed(1)} mL/s. The scatter comes from stopwatch timing and reading the jar scale (simulated ±${noiseScale.toFixed(1)} mL/s noise); ${catalyst > 0 ? `the ${catalyst.toFixed(1)} g of manganese dioxide sets the catalytic activity` : "without manganese dioxide the catalysis is weak"}, and ${heated ? "heating speeds the molecules up" : "without heating the reaction is slow"}.${tubeTilt === "up" ? " A tube mouth tilted up also risks condensed water running back." : ""}`;

  const conclusion = zh
    ? `用${method === "h2o2" ? "过氧化氢分解法" : "高锰酸钾加热法"}制氧，平均速率约 ${meanRate.toFixed(2)} mL/s，收集 ${target.toFixed(0)} mL 约需 ${timeNeeded > 0 ? timeNeeded.toFixed(1) : "—"} s，估算纯度约 ${purity.toFixed(0)}%；氧气可用排水法收集，并用带火星木条复燃来验满。`
    : `With the ${method === "h2o2" ? "hydrogen-peroxide route" : "heated-permanganate route"}, oxygen forms at about ${meanRate.toFixed(2)} mL/s, so ${target.toFixed(0)} mL takes roughly ${timeNeeded > 0 ? timeNeeded.toFixed(1) : "—"} s at an estimated purity of ${purity.toFixed(0)}%. The gas is collected over water and a glowing splint is used to confirm a full jar.`;

  return { measurements, calculations, errorAnalysis, conclusion, warnings };
};
