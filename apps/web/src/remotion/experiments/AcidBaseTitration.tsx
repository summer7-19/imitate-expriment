import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent } from "@physchem/experiment-data";
import { indicatorColor, pHAfterAdding, type IndicatorId } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { TitrationBench } from "../shared/Glassware";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const CURVE_COLOR = "#1F7A68"; // 数据曲线色（数据可视化允许超出 UI 饱和度限制）

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

/** Composition 内部读数面板文案（按 locale） */
const LABELS = {
  "zh-CN": {
    phenolphthalein: "酚酞 · 无色 → 粉红（pH 8.2-10.0）",
    methylOrange: "甲基橙 · 红 → 黄（pH 3.1-4.4）",
    initial: "初读数",
    current: "当前读数",
    ph: "当前 pH",
    endpoint: "理论等当点",
    changed: "指示剂已变色",
    unchanged: "未变色",
    xLabel: "V(NaOH) / mL",
    yLabel: "pH",
    marker: (ve: string) => `等当点 ${ve} mL`,
    tooDeep: "颜色过深：已超过终点，误差增大",
  },
  "en-US": {
    phenolphthalein: "Phenolphthalein · colorless → pink (pH 8.2-10.0)",
    methylOrange: "Methyl orange · red → yellow (pH 3.1-4.4)",
    initial: "Initial reading",
    current: "Current reading",
    ph: "Current pH",
    endpoint: "Theoretical endpoint",
    changed: "Indicator changed",
    unchanged: "Not changed",
    xLabel: "V(NaOH) / mL",
    yLabel: "pH",
    marker: (ve: string) => `Equivalence ${ve} mL`,
    tooDeep: "Too dark: past the endpoint, error growing",
  },
} as const;

export const AcidBaseTitration: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("acid-base-titration", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const ca = Number(params.acidConcentration);
  const cb = Number(params.baseConcentration);
  const va = Number(params.acidVolume);
  const overshoot = Number(params.overshoot);
  const indicator: IndicatorId = params.indicator === "methylOrange" ? "methylOrange" : "phenolphthalein";
  const showCurve = params.showCurve !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [s2, s3, s4] = [scenes[1].startFrame, scenes[2].startFrame, scenes[3].startFrame];

  const ve = (ca * va) / cb;

  let vb = 0;
  if (frame >= s2 && frame < s3) {
    vb = ve * 0.9 * easeInOut((frame - s2) / (s3 - s2));
  } else if (frame >= s3 && frame < s4) {
    const drops = 20;
    const p = (frame - s3) / (s4 - s3);
    vb = ve * 0.9 + Math.floor(p * drops) * ((ve * 0.1 + overshoot) / drops);
  } else if (frame >= s4) {
    vb = ve + overshoot;
  }

  const pH = pHAfterAdding(ca, va, cb, vb);
  const solution = indicatorColor(indicator, pH);
  const deep = solution.depth > 0.85 && vb > ve + 0.5;

  const buretteFill = frame < s2 ? Math.min(1, frame / 140) : Math.max(0, (50 - vb) / 50);

  const dropping = frame >= s2 && frame < s4;
  const dropPeriod = frame < s3 ? 18 : 30;
  const dropPhase = frame % dropPeriod;
  const flaskLevel = 620 - Math.min(24, vb);

  const xMax = ve + 2;
  const points = useMemo<CurvePoint[]>(() => {
    const n = 90;
    const arr: CurvePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const v = (i / n) * xMax;
      arr.push({ x: v, y: pHAfterAdding(ca, va, cb, v) });
    }
    return arr;
  }, [ca, va, cb, xMax]);

  const showCurvePanel = showCurve && frame >= s2;
  const indicatorFlipped = indicator === "phenolphthalein" ? pH >= 8.2 : pH >= 3.1 && pH <= 4.4;

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
            flaskColor={solution.css}
            flaskLevel={flaskLevel}
            showDrop={dropping && dropPhase < 14}
            dropProgress={Math.min(1, dropPhase / 14)}
            readingLabel={`${vb.toFixed(2)} mL`}
            warning={deep ? L.tooDeep : undefined}
          />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {showCurvePanel ? (
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
                yMax={14}
                xTicks={[0, 5, 10, 15, 20, 25, 30, 35, 40].filter((t) => t <= xMax)}
                yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
                xLabel={L.xLabel}
                yLabel={L.yLabel}
                points={points}
                drawnX={vb}
                color={CURVE_COLOR}
                marker={{ x: ve, label: L.marker(ve.toFixed(2)) }}
              />
            </div>
          ) : null}
          <Panel title={indicator === "phenolphthalein" ? L.phenolphthalein : L.methylOrange}>
            <Reading label={L.initial} value="0.00" unit="mL" />
            <Reading label={L.current} value={vb.toFixed(2)} unit="mL" />
            <Reading label={L.ph} value={pH.toFixed(2)} highlight={indicatorFlipped} />
            <Reading label={L.endpoint} value={ve.toFixed(2)} unit="mL" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1px solid var(--border-default, #DDD9D2)",
                  background: solution.css,
                }}
              />
              <span style={{ fontSize: 14, color: "var(--text-secondary, #6B6862)" }}>
                {indicatorFlipped ? L.changed : L.unchanged}
              </span>
            </div>
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
