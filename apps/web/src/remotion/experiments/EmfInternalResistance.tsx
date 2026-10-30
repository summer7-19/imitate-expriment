import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent, terminalVoltage } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const INK = "var(--text-primary, #2B2A27)";
const SECONDARY = "var(--text-secondary, #6B6862)";
const CURRENT_COLOR = "#1F6E8C";
const CURVE_COLOR = "#B5762F";
const WARN = "var(--warn, #8A6D3B)";
const PLOT_W = 620;
const PLOT_H = 400;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LOOP = [
  { x: 250, y: 190 },
  { x: 1030, y: 190 },
  { x: 1030, y: 470 },
  { x: 250, y: 470 },
];
const LOOP_SEGMENTS = LOOP.map((from, i) => {
  const to = LOOP[(i + 1) % LOOP.length];
  return { from, to, length: Math.hypot(to.x - from.x, to.y - from.y) };
});
const LOOP_LENGTH = LOOP_SEGMENTS.reduce((sum, seg) => sum + seg.length, 0);

function pointOnLoop(distance: number): { x: number; y: number } {
  let d = ((distance % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH;
  for (const seg of LOOP_SEGMENTS) {
    if (d <= seg.length) {
      const t = d / seg.length;
      return {
        x: seg.from.x + (seg.to.x - seg.from.x) * t,
        y: seg.from.y + (seg.to.y - seg.from.y) * t,
      };
    }
    d -= seg.length;
  }
  return LOOP[0];
}

const LABELS = {
  "zh-CN": {
    battery: "电源",
    switchLabel: "S",
    ammeter: "电流表",
    voltmeter: "电压表",
    resistanceBox: "电阻箱",
    readings: "测量与拟合",
    emf: "电动势 E",
    internalR: "内阻 r",
    current: "电流 I",
    voltage: "路端电压 U",
    measuredEmf: "拟合电动势 E′",
    measuredR: "拟合内阻 r′",
    fit: "U–I 图像与拟合直线",
    fitX: "电流 I / A",
    fitY: "电压 U / V",
    intercept: (e: string) => `纵截距 E′ = ${e} V`,
    slope: (r: string) => `斜率 k = −r′ = −${r} Ω`,
    formula: "U = E − I r",
    loop: "电压表测量回路",
    ammeterWarn: "电流表内接：其内阻被计入电源内阻，r′ 偏大，U–I 直线变陡。",
    rangeWarn: "外电阻超出 5–40 Ω 的教学建议范围：过小电流过大，过大电压变化不明显。",
    noData: "等待描点作图",
  },
  "en-US": {
    battery: "Cell",
    switchLabel: "S",
    ammeter: "Ammeter",
    voltmeter: "Voltmeter",
    resistanceBox: "Resistance box",
    readings: "Measurements and fit",
    emf: "EMF E",
    internalR: "Internal resistance r",
    current: "Current I",
    voltage: "Terminal voltage U",
    measuredEmf: "Fitted EMF E′",
    measuredR: "Fitted resistance r′",
    fit: "U–I graph and fitted line",
    fitX: "Current I / A",
    fitY: "Voltage U / V",
    intercept: (e: string) => `Intercept E′ = ${e} V`,
    slope: (r: string) => `Slope k = −r′ = −${r} Ω`,
    formula: "U = E − I r",
    loop: "Voltmeter measuring loop",
    ammeterWarn:
      "The ammeter sits inside the loop, so its resistance adds to r: r′ reads high and the line steepens.",
    rangeWarn:
      "External resistance is outside the suggested 5–40 Ω range: too small draws too much current, too large barely changes the voltage.",
    noData: "Waiting for plotted data",
  },
} as const;

export const EmfInternalResistance: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("emf-internal-resistance", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const emf = Number(params.emf);
  const internalR = Number(params.internalR);
  const externalR = Number(params.externalR);
  const ammeterInternal = params.ammeterInternal === true;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const s3 = scenes[2].startFrame;
  const s4 = scenes[3].startFrame;

  const { current } = terminalVoltage(emf, internalR, externalR, ammeterInternal);
  const measuredR = internalR + (ammeterInternal ? 0.1 : 0);
  const measuredEmf = emf;
  const voltmeterReading = emf - current * measuredR;
  const outOfRange = externalR < 5 || externalR > 40;

  const xMax = Math.max(0.5, Math.round((emf / (1 + measuredR)) * 10) / 10 + 0.2);
  const yMax = Math.ceil(emf) + 0.2;
  const yTicks = Array.from({ length: Math.floor(emf) + 1 }, (_, i) => i);
  const xTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5].filter((t) => t <= xMax);

  const fitPoints = useMemo<CurvePoint[]>(() => {
    const arr: CurvePoint[] = [];
    for (let i = 0; i <= 50; i++) {
      const iVal = (i / 50) * xMax;
      const u = emf - measuredR * iVal;
      if (u >= 0) arr.push({ x: iVal, y: u });
    }
    return arr;
  }, [emf, measuredR, xMax]);

  const drawnX =
    frame < s3
      ? 0
      : frame < s4
        ? interpolate(frame, [s3, s3 + 180], [0, xMax], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : xMax;

  const switchAngle =
    (interpolate(frame, [20, 120], [-32, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
      Math.PI) /
    180;
  const leverEnd = { x: 360 + 66 * Math.cos(switchAngle), y: 190 + 66 * Math.sin(switchAngle) };
  const circuitClosed = frame >= 120;
  const flowSpeed = 2 + Math.sqrt(Math.max(current, 0)) * 16;

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
          <svg viewBox="0 0 1240 620" style={{ width: "100%", height: "100%" }}>
            {/* 电压表测量回路提示 */}
            <rect
              x={205}
              y={255}
              width={90}
              height={ammeterInternal ? 205 : 145}
              rx={8}
              fill="none"
              stroke={LINE}
              strokeDasharray="6 5"
            />
            {ammeterInternal ? (
              <text x={250} y={244} fontSize={12} fill={SECONDARY} textAnchor="middle">
                {L.loop}
              </text>
            ) : null}

            {/* 导线 */}
            <path d="M 250 190 H 1030 V 470 H 250 V 190" fill="none" stroke={STROKE} strokeWidth={2.5} />
            <path d="M 250 190 H 130 V 296" fill="none" stroke={STROKE} strokeWidth={2.5} />
            <path d="M 130 364 V 470 H 250" fill="none" stroke={STROKE} strokeWidth={2.5} />

            {/* 开关 */}
            <rect x={361} y={182} width={68} height={16} fill="var(--bg-page, #F7F6F3)" />
            <circle cx={360} cy={190} r={4} fill={INK} />
            <circle cx={426} cy={190} r={4} fill={INK} />
            <line
              x1={360}
              y1={190}
              x2={leverEnd.x}
              y2={leverEnd.y}
              stroke={INK}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <text x={393} y={230} fontSize={14} fill={SECONDARY} textAnchor="middle">
              {L.switchLabel}
            </text>

            {/* 电流粒子：速度与电流成正比 */}
            {circuitClosed
              ? Array.from({ length: 9 }, (_, i) => {
                  const p = pointOnLoop(frame * flowSpeed + (i * LOOP_LENGTH) / 9);
                  if (p.x < 260 && p.y > 285 && p.y < 460) return null;
                  return <circle key={i} cx={p.x} cy={p.y} r={5} fill={CURRENT_COLOR} />;
                })
              : null}

            {/* 电源与内阻 */}
            <line x1={250} y1={190} x2={250} y2={300} stroke={STROKE} strokeWidth={2.5} />
            <line x1={222} y1={300} x2={278} y2={300} stroke={INK} strokeWidth={3} />
            <line x1={234} y1={316} x2={266} y2={316} stroke={INK} strokeWidth={3} />
            <line x1={250} y1={316} x2={250} y2={345} stroke={STROKE} strokeWidth={2.5} />
            <rect
              x={232}
              y={345}
              width={36}
              height={32}
              fill="var(--bg-surface, #FFFFFF)"
              stroke={STROKE}
              strokeWidth={2}
            />
            <text x={302} y={319} fontSize={15} fill={SECONDARY}>
              E
            </text>
            <text x={302} y={369} fontSize={15} fill={SECONDARY}>
              r
            </text>
            <line x1={250} y1={377} x2={250} y2={470} stroke={STROKE} strokeWidth={2.5} />
            <text x={214} y={216} fontSize={14} fill={SECONDARY}>
              {L.battery}
            </text>

            {/* 电流表：外接或内接 */}
            {ammeterInternal ? (
              <g>
                <circle cx={250} cy={420} r={26} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2.5} />
                <text x={250} y={429} fontSize={20} fontWeight={600} fill={INK} textAnchor="middle">
                  A
                </text>
                <text x={302} y={425} fontSize={13} fill={SECONDARY}>
                  R_A
                </text>
              </g>
            ) : (
              <g>
                <circle cx={600} cy={190} r={32} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2.5} />
                <text x={600} y={200} fontSize={24} fontWeight={600} fill={INK} textAnchor="middle">
                  A
                </text>
                <text x={600} y={248} fontSize={13} fill={SECONDARY} textAnchor="middle">
                  {L.ammeter}
                </text>
              </g>
            )}

            {/* 电阻箱 */}
            <rect
              x={760}
              y={162}
              width={160}
              height={56}
              rx={4}
              fill="var(--bg-surface, #FFFFFF)"
              stroke={STROKE}
              strokeWidth={2}
            />
            <text x={840} y={184} fontSize={13} fill={SECONDARY} textAnchor="middle">
              {L.resistanceBox}
            </text>
            <text x={840} y={206} fontSize={16} fontWeight={600} fill={INK} textAnchor="middle">
              R = {externalR.toFixed(0)} Ω
            </text>

            {/* 电压表 */}
            <circle cx={130} cy={330} r={34} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2.5} />
            <text x={130} y={340} fontSize={24} fontWeight={600} fill={INK} textAnchor="middle">
              V
            </text>
            <rect x={78} y={376} width={104} height={22} fill="var(--bg-page, #F7F6F3)" />
            <text x={130} y={392} fontSize={13} fill={SECONDARY} textAnchor="middle">
              {L.voltmeter} {voltmeterReading.toFixed(2)} V
            </text>
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.emf} value={emf.toFixed(1)} unit="V" />
            <Reading label={L.internalR} value={internalR.toFixed(1)} unit="Ω" />
            <Reading label={L.current} value={current.toFixed(2)} unit="A" highlight />
            <Reading label={L.voltage} value={voltmeterReading.toFixed(2)} unit="V" />
            <Reading
              label={L.measuredEmf}
              value={measuredEmf.toFixed(2)}
              unit="V"
              highlight={frame >= s4}
            />
            <Reading
              label={L.measuredR}
              value={measuredR.toFixed(2)}
              unit="Ω"
              highlight={frame >= s4}
            />
            <div style={{ marginTop: 10, fontSize: 15, color: SECONDARY }}>{L.formula}</div>
            {ammeterInternal ? (
              <div style={{ marginTop: 8, fontSize: 14, color: WARN, lineHeight: 1.45 }}>
                {L.ammeterWarn}
              </div>
            ) : null}
            {outOfRange ? (
              <div style={{ marginTop: 8, fontSize: 14, color: WARN, lineHeight: 1.45 }}>
                {L.rangeWarn}
              </div>
            ) : null}
          </Panel>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              background: "var(--bg-surface, #FFFFFF)",
              border: `1px solid ${LINE}`,
              borderRadius: 6,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 15, color: SECONDARY, fontWeight: 600, marginBottom: 4 }}>
              {L.fit}
            </div>
            {frame >= s3 ? (
              <>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <CurvePlot
                    width={PLOT_W}
                    height={PLOT_H}
                    xMax={xMax}
                    yMin={0}
                    yMax={yMax}
                    xTicks={xTicks}
                    yTicks={yTicks}
                    xLabel={L.fitX}
                    yLabel={L.fitY}
                    points={fitPoints}
                    drawnX={drawnX}
                    color={CURVE_COLOR}
                    marker={{ x: 0, label: L.intercept(measuredEmf.toFixed(2)) }}
                  />
                </div>
                <div style={{ fontSize: 14, color: INK, fontWeight: 600, marginTop: 4 }}>
                  {L.slope(measuredR.toFixed(2))}
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  color: SECONDARY,
                }}
              >
                {L.noData}
              </div>
            )}
          </div>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
