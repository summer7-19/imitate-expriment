import React from "react";
import type {
  ExperimentContent,
  ExperimentMeta,
  Locale,
  ParamValues,
} from "@physchem/experiment-schema";
import { defaultParams } from "@physchem/experiment-schema";
import { EXPERIMENT_METAS, getExperimentContent } from "@physchem/experiment-data";
import { AcidBaseTitration } from "./experiments/AcidBaseTitration";
import { YoungsDoubleSlit } from "./experiments/YoungsDoubleSlit";
import { ConductometricTitration } from "./experiments/ConductometricTitration";
import { PhotoelectricEffect } from "./experiments/PhotoelectricEffect";
import { FreezingPointDepression } from "./experiments/FreezingPointDepression";
import { Spectrophotometry } from "./experiments/Spectrophotometry";
import { LensImaging } from "./experiments/LensImaging";
import { VoltmeterAmmeterResistance } from "./experiments/VoltmeterAmmeterResistance";
import { LeverBalance } from "./experiments/LeverBalance";
import { OxygenPreparation } from "./experiments/OxygenPreparation";
import { CarbonDioxidePreparation } from "./experiments/CarbonDioxidePreparation";
import { CrudeSaltPurification } from "./experiments/CrudeSaltPurification";
import { SolutionPreparation } from "./experiments/SolutionPreparation";
import { NewtonsSecondLaw } from "./experiments/NewtonsSecondLaw";
import { MechanicalEnergyConservation } from "./experiments/MechanicalEnergyConservation";
import { EmfInternalResistance } from "./experiments/EmfInternalResistance";
import { ReactionRateFactors } from "./experiments/ReactionRateFactors";
import { GalvanicCell } from "./experiments/GalvanicCell";

/** 必须是 type alias（而非 interface）：Remotion 要求组件 props 满足 Record<string, unknown> */
export type CompositionProps = {
  lang: Locale;
  params: ParamValues;
};

export interface CompositionEntry {
  meta: ExperimentMeta;
  component: React.FC<CompositionProps>;
  /** 按 locale 取实验内容（回退 zh-CN） */
  getContent: (locale: Locale) => ExperimentContent;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultParams: ParamValues;
}

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

const COMPONENTS: Record<string, React.FC<CompositionProps>> = {
  "acid-base-titration": AcidBaseTitration,
  "youngs-double-slit": YoungsDoubleSlit,
  "conductometric-titration": ConductometricTitration,
  "photoelectric-effect": PhotoelectricEffect,
  "freezing-point-depression": FreezingPointDepression,
  spectrophotometry: Spectrophotometry,
  "lens-imaging": LensImaging,
  "voltmeter-ammeter-resistance": VoltmeterAmmeterResistance,
  "lever-balance": LeverBalance,
  "oxygen-preparation": OxygenPreparation,
  "carbon-dioxide-preparation": CarbonDioxidePreparation,
  "crude-salt-purification": CrudeSaltPurification,
  "solution-preparation": SolutionPreparation,
  "newtons-second-law": NewtonsSecondLaw,
  "mechanical-energy-conservation": MechanicalEnergyConservation,
  "emf-internal-resistance": EmfInternalResistance,
  "reaction-rate-factors": ReactionRateFactors,
  "galvanic-cell": GalvanicCell,
};

export const COMPOSITIONS: Record<string, CompositionEntry> = Object.fromEntries(
  EXPERIMENT_METAS.map((meta) => {
    const component = COMPONENTS[meta.compositionId];
    if (!component) {
      throw new Error(`实验 ${meta.id} 声明的 compositionId 没有对应组件`);
    }
    const durationInFrames = meta.durationInSeconds * FPS;
    return [
      meta.compositionId,
      {
        meta,
        component,
        getContent: (locale: Locale) =>
          getExperimentContent(meta.id, locale) as ExperimentContent,
        durationInFrames,
        fps: FPS,
        width: WIDTH,
        height: HEIGHT,
        defaultParams: defaultParams(
          getExperimentContent(meta.id, "zh-CN") as ExperimentContent,
        ),
      } satisfies CompositionEntry,
    ];
  }),
);

export function getCompositionEntry(compositionId: string): CompositionEntry {
  const entry = COMPOSITIONS[compositionId];
  if (!entry) throw new Error(`未注册的 Composition：${compositionId}`);
  return entry;
}
