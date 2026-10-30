import type { ExperimentContent, ExperimentMeta, Locale } from "@physchem/experiment-schema";
import { acidBaseTitrationContent, acidBaseTitrationMeta } from "./experiments/acid-base-titration";
import { youngsDoubleSlitContent, youngsDoubleSlitMeta } from "./experiments/youngs-double-slit";
import { conductometricTitrationContent, conductometricTitrationMeta } from "./experiments/conductometric-titration";
import { photoelectricEffectContent, photoelectricEffectMeta } from "./experiments/photoelectric-effect";
import { freezingPointDepressionContent, freezingPointDepressionMeta } from "./experiments/freezing-point-depression";
import { spectrophotometryContent, spectrophotometryMeta } from "./experiments/spectrophotometry";
import { lensImagingContent, lensImagingMeta } from "./experiments/lens-imaging";
import { voltmeterAmmeterResistanceContent, voltmeterAmmeterResistanceMeta } from "./experiments/voltmeter-ammeter-resistance";
import { leverBalanceContent, leverBalanceMeta } from "./experiments/lever-balance";
import { oxygenPreparationContent, oxygenPreparationMeta } from "./experiments/oxygen-preparation";
import { carbonDioxidePreparationContent, carbonDioxidePreparationMeta } from "./experiments/carbon-dioxide-preparation";
import { crudeSaltPurificationContent, crudeSaltPurificationMeta } from "./experiments/crude-salt-purification";
import { solutionPreparationContent, solutionPreparationMeta } from "./experiments/solution-preparation";
import { newtonsSecondLawContent, newtonsSecondLawMeta } from "./experiments/newtons-second-law";
import { mechanicalEnergyConservationContent, mechanicalEnergyConservationMeta } from "./experiments/mechanical-energy-conservation";
import { emfInternalResistanceContent, emfInternalResistanceMeta } from "./experiments/emf-internal-resistance";
import { reactionRateFactorsContent, reactionRateFactorsMeta } from "./experiments/reaction-rate-factors";
import { galvanicCellContent, galvanicCellMeta } from "./experiments/galvanic-cell";

export * from "./models";

export const EXPERIMENT_METAS: ExperimentMeta[] = [
  acidBaseTitrationMeta,
  youngsDoubleSlitMeta,
  conductometricTitrationMeta,
  photoelectricEffectMeta,
  freezingPointDepressionMeta,
  spectrophotometryMeta,
  lensImagingMeta,
  voltmeterAmmeterResistanceMeta,
  leverBalanceMeta,
  oxygenPreparationMeta,
  carbonDioxidePreparationMeta,
  crudeSaltPurificationMeta,
  solutionPreparationMeta,
  newtonsSecondLawMeta,
  mechanicalEnergyConservationMeta,
  emfInternalResistanceMeta,
  reactionRateFactorsMeta,
  galvanicCellMeta,
];

const CONTENTS: Record<string, Partial<Record<Locale, ExperimentContent>>> = {
  "acid-base-titration": acidBaseTitrationContent,
  "youngs-double-slit": youngsDoubleSlitContent,
  "conductometric-titration": conductometricTitrationContent,
  "photoelectric-effect": photoelectricEffectContent,
  "freezing-point-depression": freezingPointDepressionContent,
  spectrophotometry: spectrophotometryContent,
  "lens-imaging": lensImagingContent,
  "voltmeter-ammeter-resistance": voltmeterAmmeterResistanceContent,
  "lever-balance": leverBalanceContent,
  "oxygen-preparation": oxygenPreparationContent,
  "carbon-dioxide-preparation": carbonDioxidePreparationContent,
  "crude-salt-purification": crudeSaltPurificationContent,
  "solution-preparation": solutionPreparationContent,
  "newtons-second-law": newtonsSecondLawContent,
  "mechanical-energy-conservation": mechanicalEnergyConservationContent,
  "emf-internal-resistance": emfInternalResistanceContent,
  "reaction-rate-factors": reactionRateFactorsContent,
  "galvanic-cell": galvanicCellContent,
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
