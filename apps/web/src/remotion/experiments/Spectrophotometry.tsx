import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent } from "@physchem/experiment-data";
import { absorbance, clamp } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const CURVE_COLOR = "#7A4A8C"; // 标准曲线数据色
const STROKE = "var(--border-strong, #C4BFB6)";

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    instrument: "分光光度计",
    source: "光源",
    mono: (wl: string) => `单色器 ${wl}nm`,
    cuvette: "比色皿",
    detector: "检测器",
    readout: "吸光度 A",
    params: "测量参数",
    wavelength: "测量波长",
    conc: "浓度 c",
    absorbance: "吸光度 A",
    unknown: "未知样浓度",
    curve: "标准曲线 A–c",
    curveX: "c / (μmol/L)",
    curveY: "A",
    standard: "标准系列",
    unknownLabel: (c: string) => `未知样 ${c} μmol/L`,
    linearNote: "A 过大（>0.9）即偏离比尔定律",
  },
  "en-US": {
    instrument: "Spectrophotometer",
    source: "Source",
    mono: (wl: string) => `Monochromator ${wl}nm`,
    cuvette: "Cuvette",
    detector: "Detector",
    readout: "Absorbance A",
    params: "Parameters",
    wavelength: "Wavelength",
    conc: "Concentration c",
    absorbance: "Absorbance A",
    unknown: "Unknown concentration",
    curve: "Calibration curve A–c",
    curveX: "c / (μmol/L)",
    curveY: "A",
    standard: "Standards",
    unknownLabel: (c: string) => `Unknown ${c} μmol/L`,
    linearNote: "A > 0.9 departs from Beer's law",
  },
} as const;

const STANDARD_CONC = [5, 10, 15, 20, 25]; // μmol/L
const UMAX = 50;

/** 高浓度端模拟对朗伯-比尔定律的偏离（A>0.8 后斜率变缓） */
function measuredAbsorbance(cMicromol: number, wavelengthNm: number): number {
  const cMol = cMicromol * 1e-6;
  const linear = absorbance(cMol, wavelengthNm, 1);
  if (linear <= 0.8) return linear;
  return 0.8 + (linear - 0.8) * 0.55;
}

export const Spectrophotometry: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("spectrophotometry", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const sampleConc = Number(params.sampleConcentration);
  const wavelength = Number(params.wavelength);
  const showCurve = params.showStandardCurve !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [s2, s3, s4] = [scenes[1].startFrame, scenes[2].startFrame, scenes[3].startFrame];

  const sampleA = measuredAbsorbance(sampleConc, wavelength);

  // 第 2 幕：逐个测标准系列；第 3 幕：曲线完整；第 4 幕：测未知样
  const standardsShown = frame < s3 ? Math.floor(((frame - s2) / (s3 - s2)) * STANDARD_CONC.length) : STANDARD_CONC.length;
  const visibleStandards = STANDARD_CONC.slice(0, Math.max(0, Math.min(STANDARD_CONC.length, standardsShown)));
  const displayA = frame >= s4 ? sampleA : frame >= s2 ? measuredAbsorbance(visibleStandards[visibleStandards.length - 1] ?? 5, wavelength) : 0;

  const beamOpacity = 0.35 + clamp(displayA / 1.0, 0, 0.5);
  const liquidDepth = clamp(sampleConc / 45, 0.08, 1);

  const curvePoints = useMemo<CurvePoint[]>(() => {
    const arr: CurvePoint[] = [];
    for (let c = 0; c <= UMAX; c += 1) {
      arr.push({ x: c, y: measuredAbsorbance(c, wavelength) });
    }
    return arr;
  }, [wavelength]);

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
        <div style={{ flex: 1.25, minWidth: 0 }}>
          <svg viewBox="0 0 640 520" style={{ width: "100%", height: "100%" }}>
            {/* 仪器机壳 */}
            <rect x={40} y={170} width={560} height={220} rx={10} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <text x={320} y={430} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.instrument}</text>
            {/* 光源 */}
            <rect x={70} y={250} width={70} height={50} rx={6} fill="var(--bg-subtle, #EFEDE8)" stroke={STROKE} strokeWidth={1.5} />
            <text x={105} y={330} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.source}</text>
            {/* 光束 */}
            {frame >= s2 ? (
              <line x1={140} y1={275} x2={430} y2={275} stroke="#C9A03D" strokeWidth={3} opacity={1 - beamOpacity * 0.7} />
            ) : null}
            {/* 单色器 */}
            <polygon points="220,300 260,250 300,300" fill="var(--bg-subtle, #EFEDE8)" stroke={STROKE} strokeWidth={1.5} />
            <text x={260} y={330} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.mono(String(wavelength))}</text>
            {/* 比色皿：颜色深度随浓度 */}
            <rect x={330} y={245} width={60} height={60} rx={4} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={1.5} />
            <rect x={336} y={251} width={48} height={48} fill={`rgba(122, 46, 140, ${0.12 + liquidDepth * 0.75})`} />
            <text x={360} y={330} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.cuvette}</text>
            {/* 检测器 */}
            <rect x={440} y={250} width={90} height={50} rx={6} fill="var(--bg-subtle, #EFEDE8)" stroke={STROKE} strokeWidth={1.5} />
            <text x={485} y={330} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.detector}</text>
            {/* 读数窗 */}
            <rect x={180} y={420} width={280} height={70} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={1.5} />
            <text x={210} y={448} fontSize={13} fill="var(--text-secondary, #6B6862)">{L.readout}</text>
            <text x={430} y={476} fontSize={30} fontWeight={600} fill="var(--text-primary, #2B2A27)" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
              {displayA.toFixed(3)}
            </text>
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.params}>
            <Reading label={L.wavelength} value={String(wavelength)} unit="nm" />
            <Reading label={L.conc} value={`${STANDARD_CONC.join(", ")}`} unit="μmol/L" />
            <Reading label={L.absorbance} value={displayA.toFixed(3)} highlight={frame >= s2} />
            <Reading label={L.unknown} value={frame >= s4 ? sampleConc.toFixed(0) : "—"} unit="μmol/L" highlight={frame >= s4} />
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted, #9C9890)" }}>{L.linearNote}</div>
          </Panel>
          {showCurve && frame >= s2 ? (
            <div style={{ flex: 1, minHeight: 0, background: "var(--bg-surface, #FFFFFF)", border: `1px solid ${STROKE}`, borderRadius: 6, padding: 12 }}>
              <CurvePlot
                width={640}
                height={430}
                xMax={UMAX}
                yMin={0}
                yMax={1}
                xTicks={[0, 10, 20, 30, 40, 50]}
                yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                xLabel={L.curveX}
                yLabel={L.curveY}
                points={curvePoints}
                drawnX={frame >= s4 ? Math.max(...STANDARD_CONC, sampleConc) : Math.max(...visibleStandards, 0)}
                color={CURVE_COLOR}
                marker={frame >= s4 ? { x: sampleConc, label: L.unknownLabel(sampleConc.toFixed(0)) } : undefined}
              />
              <div style={{ fontSize: 13, color: "var(--text-secondary, #6B6862)", marginTop: 4 }}>
                {L.standard}（A = εbc）
              </div>
            </div>
          ) : null}
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
