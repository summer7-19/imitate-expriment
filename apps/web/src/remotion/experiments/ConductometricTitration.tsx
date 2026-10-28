import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent } from "@physchem/experiment-data";
import { conductivity } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { TitrationBench } from "../shared/Glassware";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const CURVE_COLOR = "#1F6E8C";

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    meter: "电导率仪 · DJS-1 电极",
    rising: "↑ 回升",
    falling: "↓ 下降",
    initial: "初始值",
    lambdaNote: "H⁺ 350 · OH⁻ 198 · Cl⁻ 76.3 · Na⁺ 50.1（S·cm²/mol）",
    xLabel: "V(NaOH) / mL",
    yLabel: "κ / (mS/cm)",
    marker: (ve: string) => `等当点 ${ve} mL`,
    initialReading: "初读数",
    currentReading: "当前读数",
    theoretical: "理论等当点",
    minimum: "谷底电导率",
  },
  "en-US": {
    meter: "Conductivity meter · DJS-1 cell",
    rising: "↑ rising",
    falling: "↓ falling",
    initial: "Initial",
    lambdaNote: "H⁺ 350 · OH⁻ 198 · Cl⁻ 76.3 · Na⁺ 50.1 (S·cm²/mol)",
    xLabel: "V(NaOH) / mL",
    yLabel: "κ / (mS/cm)",
    marker: (ve: string) => `Equivalence ${ve} mL`,
    initialReading: "Initial reading",
    currentReading: "Current reading",
    theoretical: "Theoretical endpoint",
    minimum: "Minimum conductivity",
  },
} as const;

export const ConductometricTitration: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("conductometric-titration", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const ca = Number(params.acidConcentration);
  const cb = Number(params.baseConcentration);
  const va = Number(params.acidVolume);
  const overshoot = Number(params.overshoot);
  const showCurve = params.showCurve !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [s2, s3, s4] = [scenes[1].startFrame, scenes[2].startFrame, scenes[3].startFrame];

  const ve = (ca * va) / cb;

  let vb = 0;
  if (frame >= s2 && frame < s3) {
    vb = ve * 0.92 * easeInOut((frame - s2) / (s3 - s2));
  } else if (frame >= s3 && frame < s4) {
    const drops = 16;
    const p = (frame - s3) / (s4 - s3);
    vb = ve * 0.92 + Math.floor(p * drops) * (ve * 0.08 / drops);
  } else if (frame >= s4) {
    const t = Math.min(1, (frame - s4) / 120);
    vb = ve + overshoot * t;
  }

  const kappa = conductivity(ca, va, cb, vb);
  const kappaMin = conductivity(ca, va, cb, ve);
  const kappa0 = conductivity(ca, va, cb, 0);
  const rising = frame >= s4 && overshoot > 0;

  const buretteFill = frame < s2 ? Math.min(1, frame / 140) : Math.max(0, (50 - vb) / 50);
  const dropping = frame >= s2 && frame < s4;
  const dropPeriod = frame < s3 ? 18 : 34;
  const dropPhase = frame % dropPeriod;
  const flaskLevel = 620 - Math.min(24, vb);

  const xMax = ve + 2;
  const yMax = Math.ceil((Math.max(kappa0, conductivity(ca, va, cb, xMax)) + 8) / 10) * 10;
  const points = useMemo<CurvePoint[]>(() => {
    const n = 90;
    const arr: CurvePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const v = (i / n) * xMax;
      arr.push({ x: v, y: conductivity(ca, va, cb, v) });
    }
    return arr;
  }, [ca, va, cb, xMax]);

  const atEquivalence = Math.abs(vb - ve) < ve * 0.05;

  return (
    <>
      <StageFrame
        title={content.title}
        subtitle={content.subtitle}
        scene={scenes[sceneIndex]}
        sceneIndex={sceneIndex}
        sceneCount={scenes.length}
        lang={locale}
      >
        <div style={{ flex: 1.15, minWidth: 0 }}>
          <TitrationBench
            buretteFill={buretteFill}
            buretteColor="rgba(190, 202, 208, 0.5)"
            flaskColor="rgba(228, 226, 222, 0.85)"
            flaskLevel={flaskLevel}
            showDrop={dropping && dropPhase < 14}
            dropProgress={Math.min(1, dropPhase / 14)}
            readingLabel={`${vb.toFixed(2)} mL`}
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.meter}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 600,
                  color: atEquivalence ? "var(--accent, #4A6B5D)" : "var(--text-primary, #2B2A27)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {kappa.toFixed(2)}
              </span>
              <span style={{ fontSize: 16, color: "var(--text-muted, #9C9890)" }}>mS/cm</span>
              <span style={{ marginLeft: "auto", fontSize: 15, color: "var(--text-secondary, #6B6862)" }}>
                {rising ? L.rising : frame >= s2 ? L.falling : L.initial}
              </span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted, #9C9890)" }}>
              {L.lambdaNote}
            </div>
          </Panel>
          {showCurve && frame >= s2 ? (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                background: "var(--bg-surface, #FFFFFF)",
                border: "1px solid var(--border-default, #DDD9D2)",
                borderRadius: 6,
                padding: 12,
              }}
            >
              <CurvePlot
                width={640}
                height={430}
                xMax={xMax}
                yMin={0}
                yMax={yMax}
                xTicks={[0, 5, 10, 15, 20, 25, 30, 35, 40].filter((t) => t <= xMax)}
                yTicks={Array.from({ length: Math.floor(yMax / 10) + 1 }, (_, i) => i * 10)}
                xLabel={L.xLabel}
                yLabel={L.yLabel}
                points={points}
                drawnX={vb}
                color={CURVE_COLOR}
                marker={{ x: ve, label: L.marker(ve.toFixed(2)) }}
              />
            </div>
          ) : (
            <Panel title={L.currentReading}>
              <Reading label={L.initialReading} value="0.00" unit="mL" />
              <Reading label={L.currentReading} value={vb.toFixed(2)} unit="mL" />
              <Reading label={L.theoretical} value={ve.toFixed(2)} unit="mL" highlight={atEquivalence} />
              <Reading label={L.minimum} value={kappaMin.toFixed(2)} unit="mS/cm" />
            </Panel>
          )}
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
