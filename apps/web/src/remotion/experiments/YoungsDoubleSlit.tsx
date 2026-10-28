import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent } from "@physchem/experiment-data";
import { clamp, doubleSlitIntensity, fringeSpacingMm, wavelengthCSS, wavelengthToRGB } from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const LINE = "var(--border-default, #DDD9D2)";
const STROKE = "var(--border-strong, #C4BFB6)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";

// 光学台布局（viewBox 1000x640）
const AXIS_Y = 320;
const BARRIER_X = 520;
const SCREEN_X = 880;
const SLIT_GAP_PX = 90;
const HALF_SCREEN = 280;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    laser: (wl: string) => `激光器 λ=${wl}nm`,
    laserWhite: "白光光源",
    barrier: (d: string) => `双缝 d=${d}mm`,
    screen: "光屏",
    central: "中央亮纹",
    dyLabel: (dy: string) => `Δy = ${dy} mm`,
    params: "光路参数",
    wavelength: "波长 λ",
    wavelengthWhite: "400-700",
    unitWhite: "nm（复色）",
    separation: "缝间距 d",
    distance: "屏距 L",
    spacing: "条纹间距 Δy",
    spacingWhite: "随波长而异",
    formula: "Δy = λL / d",
    formulaNote: "波长增大或屏距增大 → 条纹变疏；缝间距增大 → 条纹变密",
    intensity: "屏上光强分布 I(x)",
  },
  "en-US": {
    laser: (wl: string) => `Laser λ=${wl}nm`,
    laserWhite: "White-light source",
    barrier: (d: string) => `Double slit d=${d}mm`,
    screen: "Screen",
    central: "Central maximum",
    dyLabel: (dy: string) => `Δy = ${dy} mm`,
    params: "Optics parameters",
    wavelength: "Wavelength λ",
    wavelengthWhite: "400-700",
    unitWhite: "nm (broadband)",
    separation: "Slit separation d",
    distance: "Screen distance L",
    spacing: "Fringe spacing Δy",
    spacingWhite: "varies with λ",
    formula: "Δy = λL / d",
    formulaNote: "Larger λ or L → wider fringes; larger d → denser fringes",
    intensity: "Intensity profile I(x)",
  },
} as const;

export const YoungsDoubleSlit: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("youngs-double-slit", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const lambda = Number(params.wavelength);
  const d = Number(params.slitSeparation);
  const dist = Number(params.screenDistance);
  const whiteLight = params.whiteLight === true;
  const showIntensity = params.showIntensity !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [s1, s2, s3, s4] = [
    scenes[0].startFrame,
    scenes[1].startFrame,
    scenes[2].startFrame,
    scenes[3].startFrame,
  ];

  const lambdaColor = wavelengthCSS(lambda);
  // 条纹像素间距与真实 Δy 成正比（λL/d），默认参数下取 84px 保证可读
  const dyPx = 84 * (lambda / 532) * (dist / 1) / (d / 0.2);
  const dyMm = fringeSpacingMm(lambda, d, dist);

  const arcPhase = (frame - s1) * 4.5;
  const arcs: { cx: number; cy: number; r: number; opacity: number }[] = [];
  const showArcs = frame >= s1 && frame < s4;
  if (showArcs) {
    for (const cy of [AXIS_Y - SLIT_GAP_PX / 2, AXIS_Y + SLIT_GAP_PX / 2]) {
      for (let k = 0; k < 7; k++) {
        const r = ((arcPhase + k * 46) % 340) + 8;
        arcs.push({
          cx: BARRIER_X + 4,
          cy,
          r,
          opacity: 0.6 * (1 - r / 348) * (frame < s3 ? 1 : 0.45),
        });
      }
    }
  }

  // 屏上条纹：默认单色按 λ 着色；白光对可见光离散采样按视见度加权
  const fringeRows: { y: number; color: string; alpha: number }[] = [];
  if (frame >= s2) {
    const expand = interpolate(frame, [s2, s2 + 90], [40, HALF_SCREEN], {
      extrapolateRight: "clamp",
    });
    const step = 4;
    for (let y = AXIS_Y - HALF_SCREEN; y <= AXIS_Y + HALF_SCREEN; y += step) {
      const off = y - AXIS_Y;
      if (Math.abs(off) > expand) continue;
      if (!whiteLight) {
        const intensity = doubleSlitIntensity(off, lambda, d, dist, 84);
        if (intensity < 0.02) continue;
        fringeRows.push({ y, color: lambdaColor, alpha: intensity });
      } else {
        let r = 0, g = 0, b = 0, wSum = 0, iSum = 0;
        for (let wl = 400; wl <= 700; wl += 25) {
          const weight = Math.exp(-Math.pow((wl - 555) / 95, 2));
          const rgb = wavelengthToRGB(wl);
          const intensity = doubleSlitIntensity(off, wl, d, dist, 84);
          r += rgb[0] * weight * intensity;
          g += rgb[1] * weight * intensity;
          b += rgb[2] * weight * intensity;
          wSum += weight;
          iSum += weight * intensity;
        }
        if (iSum < 0.02 * wSum) continue;
        fringeRows.push({
          y,
          color: `rgb(${Math.round(r / wSum)}, ${Math.round(g / wSum)}, ${Math.round(b / wSum)})`,
          alpha: clamp(iSum / wSum, 0, 1),
        });
      }
    }
  }

  const apparatusOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const beamActive = frame >= s1;
  const slitY1 = AXIS_Y - SLIT_GAP_PX / 2;
  const slitY2 = AXIS_Y + SLIT_GAP_PX / 2;

  const intensityGraph = useMemo(() => {
    if (!showIntensity) return null;
    const pts: string[] = [];
    for (let y = AXIS_Y - HALF_SCREEN; y <= AXIS_Y + HALF_SCREEN; y += 4) {
      const i = whiteLight
        ? (() => {
            let s = 0;
            let w = 0;
            for (let wl = 400; wl <= 700; wl += 25) {
              const weight = Math.exp(-Math.pow((wl - 555) / 95, 2));
              s += weight * doubleSlitIntensity(y - AXIS_Y, wl, d, dist, 84);
              w += weight;
            }
            return s / w;
          })()
        : doubleSlitIntensity(y - AXIS_Y, lambda, d, dist, 84);
      pts.push(
        `${(20 + i * 400).toFixed(1)},${(20 + ((y - (AXIS_Y - HALF_SCREEN)) / (2 * HALF_SCREEN)) * 320).toFixed(1)}`,
      );
    }
    return pts.join(" ");
  }, [showIntensity, whiteLight, lambda, dist, d]);

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
        <div style={{ flex: 1.4, minWidth: 0 }}>
          <svg viewBox="0 0 1000 640" style={{ width: "100%", height: "100%" }}>
            <defs>
              <clipPath id="wavefront-clip">
                <rect x={BARRIER_X + 4} y={20} width={SCREEN_X - BARRIER_X - 4} height={600} />
              </clipPath>
            </defs>
            <g opacity={apparatusOpacity}>
              <line x1={40} y1={AXIS_Y} x2={960} y2={AXIS_Y} stroke={LINE} strokeWidth={1} strokeDasharray="6 5" />
              <rect x={50} y={AXIS_Y - 52} width={120} height={104} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
              <rect x={166} y={AXIS_Y - 8} width={10} height={16} fill={STROKE} />
              <text x={110} y={AXIS_Y + 84} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {whiteLight ? L.laserWhite : L.laser(String(lambda))}
              </text>
              {beamActive ? (
                <line x1={176} y1={AXIS_Y} x2={BARRIER_X - 2} y2={AXIS_Y} stroke={whiteLight ? "#9A9A93" : lambdaColor} strokeWidth={3} opacity={0.85} />
              ) : null}
              <rect x={BARRIER_X - 4} y={40} width={8} height={slitY1 - 40 - 10} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
              <rect x={BARRIER_X - 4} y={slitY1 + 10} width={8} height={SLIT_GAP_PX - 20} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
              <rect x={BARRIER_X - 4} y={slitY2 + 10} width={8} height={AXIS_Y + HALF_SCREEN - slitY2 - 10} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
              <text x={BARRIER_X} y={30} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {L.barrier(d.toFixed(2))}
              </text>
              <text x={BARRIER_X - 22} y={slitY1 + 5} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="end">S₁</text>
              <text x={BARRIER_X - 22} y={slitY2 + 5} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="end">S₂</text>
            </g>
            <g clipPath="url(#wavefront-clip)">
              {arcs.map((a, i) => (
                <circle
                  key={i}
                  cx={a.cx}
                  cy={a.cy}
                  r={a.r}
                  fill="none"
                  stroke={whiteLight ? "#8E8E88" : lambdaColor}
                  strokeWidth={1.8}
                  opacity={a.opacity}
                />
              ))}
            </g>
            <rect x={SCREEN_X} y={40} width={16} height={560} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            {fringeRows.map((row, i) => (
              <rect key={i} x={SCREEN_X} y={row.y} width={16} height={4.5} fill={row.color} opacity={row.alpha} />
            ))}
            <text x={SCREEN_X + 8} y={30} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.screen}
            </text>
            <text x={SCREEN_X + 30} y={AXIS_Y - 8} fontSize={13} fill="var(--text-secondary, #6B6862)">
              {L.central}
            </text>
            <text x={SCREEN_X + 30} y={AXIS_Y + dyPx + 18} fontSize={13} fill="var(--text-secondary, #6B6862)">
              {L.dyLabel(dyMm.toFixed(2))}
            </text>
            {frame >= s3 ? (
              <g opacity={0.9}>
                <line x1={SCREEN_X - 26} y1={AXIS_Y} x2={SCREEN_X - 26} y2={AXIS_Y + dyPx} stroke={STROKE} strokeWidth={1} />
                <line x1={SCREEN_X - 32} y1={AXIS_Y} x2={SCREEN_X - 20} y2={AXIS_Y} stroke={STROKE} strokeWidth={1} />
                <line x1={SCREEN_X - 32} y1={AXIS_Y + dyPx} x2={SCREEN_X - 20} y2={AXIS_Y + dyPx} stroke={STROKE} strokeWidth={1} />
              </g>
            ) : null}
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.params}>
            <Reading label={L.wavelength} value={whiteLight ? L.wavelengthWhite : String(lambda)} unit={whiteLight ? L.unitWhite : "nm"} />
            <Reading label={L.separation} value={d.toFixed(2)} unit="mm" />
            <Reading label={L.distance} value={dist.toFixed(2)} unit="m" />
            <Reading
              label={L.spacing}
              value={whiteLight ? L.spacingWhite : dyMm.toFixed(2)}
              unit={whiteLight ? undefined : "mm"}
              highlight={frame >= s3}
            />
            <div style={{ marginTop: 12, fontSize: 16, color: "var(--text-primary, #2B2A27)", fontWeight: 600 }}>
              {L.formula}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted, #9C9890)", marginTop: 4 }}>
              {L.formulaNote}
            </div>
          </Panel>
          {intensityGraph ? (
            <Panel title={L.intensity} style={{ flex: 1 }}>
              <svg viewBox="0 0 440 360" style={{ width: "100%", flex: 1 }}>
                <line x1={20} y1={340} x2={420} y2={340} stroke={STROKE} strokeWidth={1.5} />
                <line x1={20} y1={340} x2={20} y2={20} stroke={STROKE} strokeWidth={1.5} />
                <polyline
                  points={intensityGraph ?? ""}
                  fill="none"
                  stroke={whiteLight ? "#6B6862" : lambdaColor}
                  strokeWidth={2.5}
                />
              </svg>
            </Panel>
          ) : null}
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
