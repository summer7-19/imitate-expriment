import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent } from "@physchem/experiment-data";
import {
  ELEMENTARY_CHARGE,
  PLANCK_CONSTANT,
  SPEED_OF_LIGHT,
  photocurrent,
  stoppingVoltage,
} from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const CURVE_COLOR = "#7A5AA6"; // 数据曲线色（紫，数据可视化允许超出 UI 饱和度限制）

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    lamp: "光源",
    filter: (wl: string) => `滤光片 ${wl}nm`,
    tube: "光电管",
    ammeter: "微电流表",
    params: "测量参数",
    photonEnergy: "光子能量 E=hν",
    work: "逸出功 W",
    canEmit: "能否逸出",
    yes: "能（hν ≥ W）",
    no: "不能（hν < W）",
    current: "光电流",
    stopping: "截止电压 U₀",
    iv: "I–V 特性曲线",
    ivX: "外加电压 U / V",
    ivY: "光电流 I",
    fit: "U₀–ν 拟合",
    fitX: "频率 ν / PHz",
    fitY: "U₀ / V",
    slope: (h: string) => `斜率 h/e = ${h}×10⁻¹⁵ V·s`,
  },
  "en-US": {
    lamp: "Lamp",
    filter: (wl: string) => `Filter ${wl}nm`,
    tube: "Phototube",
    ammeter: "Micro-ammeter",
    params: "Parameters",
    photonEnergy: "Photon energy E=hν",
    work: "Work function W",
    canEmit: "Emission",
    yes: "Yes (hν ≥ W)",
    no: "No (hν < W)",
    current: "Photocurrent",
    stopping: "Stopping voltage U₀",
    iv: "I–V characteristic",
    ivX: "Applied voltage U / V",
    ivY: "Photocurrent I",
    fit: "U₀–ν fit",
    fitX: "Frequency ν / PHz",
    fitY: "U₀ / V",
    slope: (h: string) => `Slope h/e = ${h}×10⁻¹⁵ V·s`,
  },
} as const;

const FILTER_LAMBDA = [405, 436, 546, 577];

export const PhotoelectricEffect: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("photoelectric-effect", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const lambda = Number(params.wavelength);
  const intensity = Number(params.lightIntensity) / 100;
  const workEv = Number(params.workFunction);
  const showIV = params.showIVCurve !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [s2, s3, s4] = [scenes[1].startFrame, scenes[2].startFrame, scenes[3].startFrame];

  const { canEmit, stoppingVoltage: u0 } = stoppingVoltage(lambda, workEv);
  const photonEv = 1239.841984 / lambda;

  // 外加电压：第 2 幕 0 V；第 3 幕从 +1 V 扫到 -(U₀+0.4)；第 4 幕回到 0
  let applied = 0;
  if (frame >= s3 && frame < s4) {
    const p = (frame - s3) / (s4 - s3);
    applied = interpolate(p, [0, 1], [1, -(u0 + 0.4)]);
  } else if (frame >= s4) {
    applied = 0;
  }

  const iSat = 8 * intensity; // 饱和电流（表盘格数）
  const current = photocurrent(applied, u0, iSat);

  // 光子/电子粒子
  const photonPeriod = Math.max(6, Math.round(24 - intensity * 16));
  const photonPhase = frame % photonPeriod;
  const photonX = interpolate(photonPhase, [0, 14], [210, 372], {
    extrapolateRight: "clamp",
  });
  const electronPhase = (frame + 7) % 20;
  const electronX = interpolate(electronPhase, [0, 14], [386, 500], {
    extrapolateRight: "clamp",
  });
  const showPhotons = frame >= s2;
  const showElectrons = canEmit && frame >= s2 && applied > -u0 + 0.05;

  const intensityGraph = useMemo(() => {
    if (!showIV) return null;
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = 1 - (i / 60) * (u0 + 1.4);
      const ii = photocurrent(u, u0, 1);
      pts.push(`${(u).toFixed(3)},${ii.toFixed(3)}`);
    }
    return pts.join(" ");
  }, [showIV, u0]);

  // U₀–ν 拟合（scene 4）
  const fitPoints = useMemo<CurvePoint[]>(() => {
    return FILTER_LAMBDA.filter((wl) => stoppingVoltage(wl, workEv).canEmit).map((wl) => ({
      x: (SPEED_OF_LIGHT / (wl * 1e-9)) / 1e15,
      y: stoppingVoltage(wl, workEv).stoppingVoltage,
    }));
  }, [workEv]);
  const fitLine = useMemo<CurvePoint[]>(() => {
    const slope = PLANCK_CONSTANT / ELEMENTARY_CHARGE;
    const arr: CurvePoint[] = [];
    for (const phz of [480, 520, 560, 600, 640, 680, 720]) {
      arr.push({ x: phz, y: slope * phz * 1e15 - workEv });
    }
    return arr.filter((p) => p.y >= 0 && p.y <= 1.6);
  }, [workEv]);

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
        <div style={{ flex: 1.3, minWidth: 0 }}>
          <svg viewBox="0 0 640 560" style={{ width: "100%", height: "100%" }}>
            {/* 光源 */}
            <rect x={60} y={220} width={110} height={70} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <text x={115} y={320} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.lamp}</text>
            {/* 滤光片 */}
            <circle cx={240} cy={255} r={26} fill={filterColor(lambda)} stroke={STROKE} strokeWidth={2} opacity={0.9} />
            <text x={240} y={310} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.filter(String(lambda))}
            </text>
            {/* 光束与光子 */}
            {showPhotons ? (
              <g>
                <line x1={170} y1={255} x2={370} y2={255} stroke={filterColor(lambda)} strokeWidth={2} opacity={0.5} />
                {photonPhase < 14 ? (
                  <circle cx={photonX} cy={255} r={5} fill={filterColor(lambda)} />
                ) : null}
              </g>
            ) : null}
            {/* 光电管 */}
            <rect x={370} y={190} width={170} height={130} rx={10} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <rect x={378} y={210} width={8} height={90} fill="#8A6D3B" />
            <rect x={520} y={225} width={6} height={60} fill={STROKE} />
            <text x={455} y={350} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.tube}</text>
            {/* 光电子 */}
            {showElectrons && electronPhase < 14 ? (
              <circle cx={electronX} cy={255} r={3.5} fill="#4A4A45" />
            ) : null}
            {showElectrons && (electronPhase + 10) % 20 < 14 ? (
              <circle cx={electronX - 60} cy={230} r={3.5} fill="#4A4A45" />
            ) : null}
            {/* 电流表 */}
            <rect x={430} y={420} width={140} height={80} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <text x={500} y={452} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.ammeter}</text>
            <text x={500} y={486} fontSize={26} fontWeight={600} fill="var(--text-primary, #2B2A27)" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
              {current.toFixed(2)}
            </text>
            {/* 电压标注 */}
            <text x={300} y={450} fontSize={14} fill="var(--text-secondary, #6B6862)">
              U = {applied >= 0 ? "+" : ""}{applied.toFixed(2)} V
            </text>
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.params}>
            <Reading label={L.photonEnergy} value={`${photonEv.toFixed(2)}`} unit="eV" />
            <Reading label={L.work} value={workEv.toFixed(2)} unit="eV" />
            <Reading
              label={L.canEmit}
              value={canEmit ? L.yes : L.no}
              highlight={canEmit}
            />
            <Reading label={L.current} value={current.toFixed(2)} unit="μA" />
            <Reading label={L.stopping} value={canEmit ? u0.toFixed(2) : "—"} unit="V" highlight={frame >= s3} />
          </Panel>
          {showIV && canEmit && frame >= s3 ? (
            <div style={{ flex: 1, minHeight: 0, background: "var(--bg-surface, #FFFFFF)", border: `1px solid ${LINE}`, borderRadius: 6, padding: 12 }}>
              <CurvePlot
                width={480}
                height={330}
                xMax={1}
                yMin={0}
                yMax={1}
                xTicks={[0, 0.5, 1]}
                yTicks={[0, 0.5, 1]}
                xLabel={L.ivX}
                yLabel={L.ivY}
                points={(intensityGraph ?? "").split(" ").filter(Boolean).map((s) => {
                  const [x, y] = s.split(",").map(Number);
                  return { x, y };
                })}
                drawnX={1}
                color={CURVE_COLOR}
                marker={{ x: 0, label: `U₀ = ${u0.toFixed(2)} V` }}
              />
            </div>
          ) : null}
          {frame >= s4 && fitPoints.length >= 2 ? (
            <div style={{ flex: 1, minHeight: 0, background: "var(--bg-surface, #FFFFFF)", border: `1px solid ${LINE}`, borderRadius: 6, padding: 12 }}>
              <CurvePlot
                width={480}
                height={330}
                xMax={720}
                yMin={0}
                yMax={1.6}
                xTicks={[480, 560, 640, 720]}
                yTicks={[0, 0.4, 0.8, 1.2, 1.6]}
                xLabel={L.fitX}
                yLabel={L.fitY}
                points={fitLine}
                drawnX={720}
                color={CURVE_COLOR}
              />
              <div style={{ fontSize: 14, color: "var(--text-primary, #2B2A27)", fontWeight: 600, marginTop: 4 }}>
                {L.slope((PLANCK_CONSTANT / ELEMENTARY_CHARGE * 1e15).toFixed(3))}
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

function filterColor(lambda: number): string {
  if (lambda < 450) return "#8E6FD8";
  if (lambda < 500) return "#4A7FBF";
  if (lambda < 570) return "#4A9E5D";
  return "#C9A03D";
}
