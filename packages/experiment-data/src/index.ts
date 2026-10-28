import type { ExperimentContent, ExperimentMeta, Locale } from "@physchem/experiment-schema";
import { acidBaseTitrationContent, acidBaseTitrationMeta } from "./experiments/acid-base-titration";
import { youngsDoubleSlitContent, youngsDoubleSlitMeta } from "./experiments/youngs-double-slit";
import { conductometricTitrationContent, conductometricTitrationMeta } from "./experiments/conductometric-titration";
import { photoelectricEffectContent, photoelectricEffectMeta } from "./experiments/photoelectric-effect";
import { freezingPointDepressionContent, freezingPointDepressionMeta } from "./experiments/freezing-point-depression";
import { spectrophotometryContent, spectrophotometryMeta } from "./experiments/spectrophotometry";

export * from "./models";

export const EXPERIMENT_METAS: ExperimentMeta[] = [
  acidBaseTitrationMeta,
  youngsDoubleSlitMeta,
  conductometricTitrationMeta,
  photoelectricEffectMeta,
  freezingPointDepressionMeta,
  spectrophotometryMeta,
];

const CONTENTS: Record<string, Partial<Record<Locale, ExperimentContent>>> = {
  "acid-base-titration": acidBaseTitrationContent,
  "youngs-double-slit": youngsDoubleSlitContent,
  "conductometric-titration": conductometricTitrationContent,
  "photoelectric-effect": photoelectricEffectContent,
  "freezing-point-depression": freezingPointDepressionContent,
  spectrophotometry: spectrophotometryContent,
};

export const SUPPORTED_LOCALES: Locale[] = ["zh-CN", "en-US"];

export function getExperimentMeta(id: string | undefined): ExperimentMeta | undefined {
  return EXPERIMENT_METAS.find((m) => m.id === id);
}

/** 按 locale 取内容；未本地化时回退 zh-CN */
export function getExperimentContent(id: string, locale: Locale): ExperimentContent | undefined {
  const contents = CONTENTS[id];
  if (!contents) return undefined;
  return contents[locale] ?? contents["zh-CN"];
}

export function hasLocale(meta: ExperimentMeta, locale: Locale): boolean {
  return meta.locales.includes(locale);
}
