// 实验数据计算模型：溶液颜色、条纹颜色、各实验物理量一律由这些纯函数映射。
// 数据可视化颜色允许超出 UI 饱和度限制（设计规范），但坐标轴/文字用 UI 语义色。

export type IndicatorId = "phenolphthalein" | "methylOrange";

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/* ---------- 酸碱滴定 ---------- */

/**
 * 强碱（NaOH）滴定强酸（HCl）：加入 vb mL 碱后的近似 pH。
 * 忽略水的自偶电离（等当点附近按 pH=7 处理），对教学示意足够准确。
 */
export function pHAfterAdding(
  acidConc: number,
  acidVolume: number,
  baseConc: number,
  addedBaseVolume: number,
): number {
  const total = acidVolume + addedBaseVolume;
  if (total <= 0) return 7;
  const excessH = (acidConc * acidVolume - baseConc * addedBaseVolume) / total;
  if (excessH > 1e-9) return -Math.log10(excessH);
  const excessOH = -excessH;
  if (excessOH > 1e-9) return 14 + Math.log10(excessOH);
  return 7;
}

export interface SolutionColor {
  css: string;
  /** 颜色深度 0-1，用于判断"颜色过深"（过量） */
  depth: number;
}

const COLORLESS = "rgba(228, 226, 222, 0.85)";

function mix(a: number[], b: number[], t: number): number[] {
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));
}

function rgba(rgb: number[], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

const PINK = [214, 31, 105];
const ORANGE_RED = [198, 40, 40];
const YELLOW = [251, 192, 45];

/** 指示剂颜色必须由 pH 映射 */
export function indicatorColor(indicator: IndicatorId, pH: number): SolutionColor {
  if (indicator === "phenolphthalein") {
    if (pH <= 8.2) return { css: COLORLESS, depth: 0 };
    const t = Math.min(1, (pH - 8.2) / 1.8);
    return { css: rgba(mix([228, 226, 222], PINK, t), 0.9), depth: t };
  }
  // 甲基橙：pH<3.1 红 → 3.1-4.4 橙 → >4.4 黄
  if (pH <= 3.1) return { css: rgba(ORANGE_RED, 0.9), depth: 1 };
  if (pH >= 4.4) return { css: rgba(YELLOW, 0.9), depth: 0 };
  const t = (pH - 3.1) / 1.3;
  return { css: rgba(mix(ORANGE_RED, YELLOW, t), 0.9), depth: 1 - t };
}

/* ---------- 电导滴定 ---------- */

/**
 * 强酸强碱电导滴定：加入 v mL NaOH 后的电导率（mS/cm）。
 * 离子摩尔电导率（S·cm²/mol，25 ℃）：H⁺ 350、OH⁻ 198、Na⁺ 50.1、Cl⁻ 76.3。
 * κ(mS/cm) = Σ λᵢ · cᵢ(mol/L)
 */
export function conductivity(
  acidConc: number,
  acidVolume: number,
  baseConc: number,
  addedBaseVolume: number,
): number {
  const total = acidVolume + addedBaseVolume;
  const nAcid = acidConc * acidVolume;
  const nBase = baseConc * addedBaseVolume;
  const cNa = nBase / total;
  const cCl = nAcid / total;
  if (nBase <= nAcid) {
    const cH = (nAcid - nBase) / total;
    return 350 * cH + 50.1 * cNa + 76.3 * cCl;
  }
  const cOH = (nBase - nAcid) / total;
  return 198 * cOH + 50.1 * cNa + 76.3 * cCl;
}

/* ---------- 杨氏双缝 ---------- */

/** 波长（nm）→ 近似 RGB，仅用于 380-780 可见光，区间外返回灰 */
export function wavelengthToRGB(wavelength: number): [number, number, number] {
  const w = wavelength;
  let r = 0;
  let g = 0;
  let b = 0;
  if (w < 380 || w > 780) {
    return [120, 120, 120];
  }
  if (w < 440) {
    r = -(w - 440) / 60;
    b = 1;
  } else if (w < 490) {
    g = (w - 440) / 50;
    b = 1;
  } else if (w < 510) {
    g = 1;
    b = -(w - 510) / 20;
  } else if (w < 580) {
    r = (w - 510) / 70;
    g = 1;
  } else if (w < 645) {
    r = 1;
    g = -(w - 645) / 65;
  } else {
    r = 1;
  }
  let factor = 1;
  if (w < 420) factor = 0.3 + (0.7 * (w - 380)) / 40;
  else if (w > 700) factor = 0.3 + (0.7 * (780 - w)) / 80;
  return [r, g, b].map((c) => Math.round(255 * Math.pow(c * factor, 0.8))) as [
    number,
    number,
    number,
  ];
}

export function wavelengthCSS(wavelength: number): string {
  const [r, g, b] = wavelengthToRGB(wavelength);
  return `rgb(${r}, ${g}, ${b})`;
}

/** 双缝条纹间距 Δy = λL/d，换算为 mm */
export function fringeSpacingMm(wavelengthNm: number, dMm: number, lM: number): number {
  return (wavelengthNm * lM) / (dMm * 1000);
}

/** 屏上某点（相对中央，单位与 dy 同尺度）的相对光强：cos² 条纹 × 单缝包络 */
export function doubleSlitIntensity(yOffset: number, wavelengthNm: number, dMm: number, lM: number, pxPerUnit: number): number {
  const dyPx = pxPerUnit * fringeSpacingMm(wavelengthNm, dMm, lM);
  const carrier = Math.pow(Math.cos((Math.PI * yOffset) / dyPx), 2);
  const envelope = Math.pow(Math.cos((Math.PI * yOffset) / (dyPx * 8)), 2);
  return carrier * envelope;
}

/* ---------- 光电效应 ---------- */

export const PLANCK_CONSTANT = 6.62607015e-34; // J·s
export const ELEMENTARY_CHARGE = 1.602176634e-19; // C
export const SPEED_OF_LIGHT = 2.99792458e8; // m/s

/**
 * 光电效应截止电压：U₀ = hν/e − W/e。
 * workFunctionEv 为阴极逸出功（eV）；hν < W 时无光电发射。
 */
export function stoppingVoltage(
  wavelengthNm: number,
  workFunctionEv: number,
): { canEmit: boolean; stoppingVoltage: number } {
  const photonEv = 1239.841984 / wavelengthNm; // E(eV) = 1240/λ(nm)
  if (photonEv <= workFunctionEv) return { canEmit: false, stoppingVoltage: 0 };
  return { canEmit: true, stoppingVoltage: photonEv - workFunctionEv };
}

/**
 * 光电流-电压教学模型：正向饱和，反向电压达到 |U₀| 时电流为零。
 * appliedVoltage 正 = 加速，负 = 减速（Retarding）。
 */
export function photocurrent(
  appliedVoltage: number,
  stoppingV: number,
  saturationCurrent: number,
): number {
  if (!canEmitAt(stoppingV)) return 0;
  if (appliedVoltage >= 0) return saturationCurrent;
  const ratio = 1 - Math.abs(appliedVoltage) / stoppingV;
  return saturationCurrent * Math.max(0, ratio * ratio);
}

function canEmitAt(stoppingV: number): boolean {
  return stoppingV > 1e-6;
}

/* ---------- 凝固点降低 ---------- */

export const KF_BENZENE = 5.12; // 苯的摩尔凝固点降低常数 K·kg/mol
export const TF_BENZENE_PURE = 5.5; // 纯苯凝固点 ℃
export const SOLUTE_BIPHENYL_M = 154.2; // 联苯摩尔质量 g/mol（模拟中的"真值"）

/** ΔTf = Kf · m(溶质)/M / m(溶剂,kg) */
export function freezingPointDepression(
  soluteMassG: number,
  solventMassG: number,
): { deltaTf: number; tfSolution: number } {
  const moles = soluteMassG / SOLUTE_BIPHENYL_M;
  const molality = moles / (solventMassG / 1000);
  const deltaTf = KF_BENZENE * molality;
  return { deltaTf, tfSolution: TF_BENZENE_PURE - deltaTf };
}

/* ---------- 分光光度法 ---------- */

export const EPS_KMnO4_525 = 2.0e4; // 高锰酸钾 525nm 表观摩尔吸光系数 L/(mol·cm)

/** 朗伯-比尔定律 A = εbc（近似：波长偏离吸收峰时 ε 按高斯衰减） */
export function absorbance(
  concentrationMolPerL: number,
  wavelengthNm: number,
  pathLengthCm = 1,
): number {
  const eps =
    EPS_KMnO4_525 * Math.exp(-Math.pow((wavelengthNm - 525) / 60, 2));
  return eps * pathLengthCm * concentrationMolPerL;
}
