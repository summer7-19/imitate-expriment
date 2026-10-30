import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { clamp, getExperimentContent, relativeRate } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const INK_SECONDARY = "var(--text-secondary, #6B6862)";
const DANGER = "var(--danger, #9C4A42)";
const CURVE_COLOR = "#B5762F"; // 实际（多因素）曲线
const CURVE_ALT_T = "#3E7CB1"; // 仅升温对照曲线
const CURVE_ALT_C = "#2F7D5B"; // 仅增浓对照曲线
const BUBBLE_COLOR = "#4A7FBF";
const MARBLE_COLOR = "#B9B4AA";
const THERMO_COLOR = "#C0503F";
const GLASS_FILL = "rgba(255, 255, 255, 0.62)";
const SOLUTION_FILL = "rgba(74, 127, 191, 0.18)";

const T_MAX = 36; // 曲线横轴上限 / s
const V_MAX = 60; // 收集气体体积上限 / mL
const TAU_BASE = 18; // 基准特征时间 / s
const PLOT_WIDTH = 480;
const PLOT_HEIGHT = 330;
const PLOT_MARGIN = { l: 52, r: 16, t: 16, b: 44 };

const FLASK_CX = 380;
const LIQUID_TOP = 455;
const BUBBLE_START_Y = 468;
const BUBBLE_END_Y = 306;
const MERCURY_TOP_AT_20 = 512;
const MERCURY_RANGE = 200;

const BUBBLE_OFFSETS = [-86, -64, -42, -20, 2, 24, 46, 68, -54, -8, 34, 58];

const BLOCK_CHUNKS = [
  "288,506 312,497 329,511 306,522",
  "331,514 353,505 369,519 347,527",
  "372,508 395,499 411,515 388,524",
  "414,515 437,506 453,521 430,529",
];

const POWDER_CHIPS = [
  "274,516 286,510 292,520 281,525",
  "296,522 307,513 315,524 302,529",
  "318,515 329,507 337,518 325,523",
  "340,523 351,513 359,525 346,530",
  "362,516 373,508 381,519 369,524",
  "384,522 396,512 404,524 391,529",
  "406,515 417,507 426,518 413,523",
  "428,521 440,511 448,523 435,528",
  "450,516 461,508 469,519 457,524",
  "310,528 321,519 329,530 316,534",
  "356,528 368,519 376,530 363,534",
  "400,528 412,519 420,530 407,534",
];

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    flask: "锥形瓶：石灰石 + 稀盐酸",
    bath: "水浴",
    thermometer: "温度计",
    syringe: "气体注射器",
    gasVolume: "V(CO₂)",
    methodTitle: "控制变量法",
    methodLines: [
      "只改变水浴温度",
      "只改变盐酸浓度",
      "只加入催化剂",
      "只改变接触面积（块状/粉末）",
    ],
    methodNote: "其余条件保持一致，才能比较速率",
    confoundedLines: ["温度与浓度同时改变", "速率变化无法归因"],
    onlyT: "仅升温",
    onlyC: "仅增浓",
    actual: "实际（多因素）",
    miniA: "锥形瓶 A",
    miniB: "锥形瓶 B",
    heat: "升温",
    acid: "滴加盐酸",
    readings: "测量读数",
    rate: "相对速率",
    temperature: "水浴温度",
    concentration: "盐酸浓度",
    catalyst: "催化剂 MnO₂",
    powder: "石灰石粉末",
    elapsed: "反应时间",
    added: "已加入",
    notAdded: "未加入",
    yes: "是",
    no: "否",
    curve: "气体体积—时间曲线",
    curveX: "时间 t / s",
    curveY: "V(CO₂) / mL",
    tempOut: "温度超出 25–60 °C 建议范围，读数可能不稳",
    confoundedWarn: "未控制变量：温度与浓度同时改变，无法判断速率变化的原因",
  },
  "en-US": {
    flask: "Conical flask: marble + dilute HCl",
    bath: "Water bath",
    thermometer: "Thermometer",
    syringe: "Gas syringe",
    gasVolume: "V(CO₂)",
    methodTitle: "Controlled variables",
    methodLines: [
      "Change the bath temperature only",
      "Change the acid concentration only",
      "Add the catalyst only",
      "Change the contact area only (block/powder)",
    ],
    methodNote: "Hold everything else constant so rates can be compared",
    confoundedLines: [
      "Temperature + concentration",
      "change together; cause unclear",
    ],
    onlyT: "Temperature only",
    onlyC: "Concentration only",
    actual: "Actual (combined)",
    miniA: "Flask A",
    miniB: "Flask B",
    heat: "Heat",
    acid: "Add acid",
    readings: "Readings",
    rate: "Relative rate",
    temperature: "Bath temperature",
    concentration: "Acid concentration",
    catalyst: "Catalyst MnO₂",
    powder: "Marble powder",
    elapsed: "Elapsed time",
    added: "Added",
    notAdded: "Not added",
    yes: "Yes",
    no: "No",
    curve: "Gas volume vs time",
    curveX: "Time t / s",
    curveY: "V(CO₂) / mL",
    tempOut: "Outside the suggested 25–60 °C range; readings may drift",
    confoundedWarn:
      "No control: temperature and concentration change together, so the cause of the rate change is ambiguous",
  },
} as const;

function volumeAt(timeS: number, rate: number): number {
  const tau = TAU_BASE / Math.max(0.05, rate);
  return V_MAX * (1 - Math.exp(-Math.max(0, timeS) / tau));
}

function sampleCurve(rate: number): CurvePoint[] {
  const points: CurvePoint[] = [];
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * T_MAX;
    points.push({ x: t, y: volumeAt(t, rate) });
  }
  return points;
}

function plotPath(points: CurvePoint[]): string {
  const innerW = PLOT_WIDTH - PLOT_MARGIN.l - PLOT_MARGIN.r;
  const innerH = PLOT_HEIGHT - PLOT_MARGIN.t - PLOT_MARGIN.b;
  return points
    .map((p, i) => {
      const x = PLOT_MARGIN.l + (clamp(p.x, 0, T_MAX) / T_MAX) * innerW;
      const y = PLOT_MARGIN.t + (1 - clamp(p.y, 0, V_MAX) / V_MAX) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export const ReactionRateFactors: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("reaction-rate-factors", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const methodLines: readonly string[] = L.methodLines;

  const temperature = Number(params.temperature);
  const concentration = Number(params.concentration);
  const catalyst = params.catalyst === true;
  const powder = params.powder === true;
  const controlled = params.controlled !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [, s2] = scenes.map((s) => s.startFrame);

  const rate = relativeRate(temperature, concentration, catalyst, powder);
  const onlyTempRate = relativeRate(temperature, 0.5, false, false);
  const onlyConcRate = relativeRate(25, concentration, false, false);

  const elapsed = clamp((frame - s2) / 30, 0, T_MAX);
  const gasVolume = volumeAt(elapsed, rate);
  const riseFrames = clamp(26 / Math.sqrt(Math.max(rate, 0.05)), 4, 26);
  const showBubbles = frame >= s2 && gasVolume < V_MAX * 0.995;

  const bubbles = BUBBLE_OFFSETS.map((offset, i) => {
    const progress = ((frame - s2) / riseFrames + i / BUBBLE_OFFSETS.length) % 1;
    return {
      x: FLASK_CX + offset * (1 - 0.62 * progress),
      y: BUBBLE_START_Y - progress * (BUBBLE_START_Y - BUBBLE_END_Y),
      r: 3.5 + (i % 4) * 0.9,
    };
  });

  const mercuryTop =
    MERCURY_TOP_AT_20 - ((clamp(temperature, 20, 80) - 20) / 60) * MERCURY_RANGE;
  const plungerX = 892 + (gasVolume / V_MAX) * 190;

  const waveAmplitude = Math.min(3, Math.max(0, (temperature - 20) * 0.05));
  const surfacePoints: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const x = 148 + i * 24.2;
    const y = 348 + Math.sin(frame * 0.12 + x * 0.045) * waveAmplitude;
    surfacePoints.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const surfacePath = surfacePoints.join(" ");

  const marblePieces = powder ? POWDER_CHIPS : BLOCK_CHUNKS;

  const mainCurve = useMemo<CurvePoint[]>(() => sampleCurve(rate), [rate]);
  const tempCurve = useMemo<CurvePoint[]>(() => sampleCurve(onlyTempRate), [onlyTempRate]);
  const concCurve = useMemo<CurvePoint[]>(() => sampleCurve(onlyConcRate), [onlyConcRate]);
  const tempPath = controlled ? "" : plotPath(tempCurve.filter((p) => p.x <= elapsed));
  const concPath = controlled ? "" : plotPath(concCurve.filter((p) => p.x <= elapsed));

  const tempOut = temperature < 25 || temperature > 60;
  const rateText = rate >= 100 ? rate.toFixed(0) : rate.toFixed(2);

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
            <defs>
              <clipPath id="rrf-flask-body">
                <path d="M352,270 L250,520 L510,520 L408,270 Z" />
              </clipPath>
            </defs>

            {/* 实验台与加热板 */}
            <line x1={40} y1={586} x2={1200} y2={586} stroke={LINE} strokeWidth={2} />
            <rect x={148} y={546} width={492} height={22} rx={4} fill={SUBTLE} stroke={LINE} />
            {[553, 560].map((y) => (
              <line key={y} x1={168} y1={y} x2={620} y2={y} stroke={STROKE} strokeWidth={1.5} />
            ))}

            {/* 水浴 */}
            <path
              d="M140,286 L140,548 L640,548 L640,286"
              fill={GLASS_FILL}
              stroke={STROKE}
              strokeWidth={2.5}
            />
            <rect x={148} y={348} width={484} height={196} fill="rgba(74, 127, 191, 0.10)" />
            <path d={surfacePath} fill="none" stroke="rgba(74, 127, 191, 0.55)" strokeWidth={2} />
            <line x1={132} y1={286} x2={648} y2={286} stroke={STROKE} strokeWidth={3} />
            <text x={178} y={326} fontSize={15} fill={INK_SECONDARY}>
              {L.bath}
            </text>
            {temperature >= 50
              ? [0, 1, 2].map((i) => (
                  <path
                    key={i}
                    d={`M${188 + i * 30},${272 + Math.sin(frame * 0.1 + i) * 4} q8,-10 0,-20`}
                    fill="none"
                    stroke="rgba(107, 104, 98, 0.32)"
                    strokeWidth={1.6}
                  />
                ))
              : null}

            {/* 锥形瓶 */}
            <rect x={352} y={160} width={56} height={110} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />
            <rect x={346} y={154} width={68} height={12} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />
            <path
              d="M352,270 L250,520 L510,520 L408,270"
              fill={GLASS_FILL}
              stroke={STROKE}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <line x1={250} y1={520} x2={510} y2={520} stroke={STROKE} strokeWidth={2.5} />
            <g clipPath="url(#rrf-flask-body)">
              <rect x={240} y={LIQUID_TOP} width={280} height={90} fill={SOLUTION_FILL} />
              <line
                x1={240}
                y1={LIQUID_TOP}
                x2={520}
                y2={LIQUID_TOP}
                stroke="rgba(74, 127, 191, 0.55)"
                strokeWidth={1.5}
              />
              {marblePieces.map((points, i) => (
                <polygon
                  key={i}
                  points={points}
                  fill={MARBLE_COLOR}
                  stroke={STROKE}
                  strokeWidth={0.9}
                />
              ))}
              {showBubbles
                ? bubbles.map((b, i) => (
                    <circle
                      key={i}
                      cx={b.x}
                      cy={b.y}
                      r={b.r}
                      fill={BUBBLE_COLOR}
                      opacity={0.82}
                    />
                  ))
                : null}
            </g>
            <text x={380} y={608} fontSize={14} fill={INK_SECONDARY} textAnchor="middle">
              {L.flask}
            </text>

            {/* 导气管 */}
            <path
              d="M380,158 L380,118 L880,118"
              fill="none"
              stroke={STROKE}
              strokeWidth={3}
              strokeLinecap="round"
            />

            {/* 气体注射器 */}
            <rect x={880} y={88} width={250} height={64} rx={8} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />
            <rect x={884} y={92} width={Math.max(0, plungerX - 884)} height={56} fill="rgba(74, 127, 191, 0.06)" />
            <rect x={plungerX} y={92} width={10} height={56} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
            <line x1={plungerX + 10} y1={120} x2={1150} y2={120} stroke={STROKE} strokeWidth={6} />
            <rect x={1150} y={100} width={14} height={40} rx={3} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
            {[0, 20, 40, 60].map((v) => {
              const x = 892 + (v / V_MAX) * 190;
              return (
                <g key={v}>
                  <line x1={x} y1={152} x2={x} y2={160} stroke={LINE} strokeWidth={1.2} />
                  <text x={x} y={176} fontSize={11} fill={INK_SECONDARY} textAnchor="middle">
                    {v}
                  </text>
                </g>
              );
            })}
            <text x={1005} y={200} fontSize={14} fill={INK_SECONDARY} textAnchor="middle">
              {L.syringe}
            </text>
            <text
              x={1005}
              y={224}
              fontSize={17}
              fontWeight={600}
              fill="var(--text-primary, #2B2A27)"
              textAnchor="middle"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {L.gasVolume} = {gasVolume.toFixed(1)} mL
            </text>

            {/* 温度计 */}
            <text x={600} y={212} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
              {L.thermometer}
            </text>
            <rect x={592} y={222} width={16} height={298} rx={8} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />
            <rect x={597} y={mercuryTop} width={6} height={518 - mercuryTop} fill={THERMO_COLOR} />
            <circle cx={600} cy={526} r={13} fill={THERMO_COLOR} stroke={STROKE} strokeWidth={2} />
            {[20, 40, 60, 80].map((v) => {
              const y = MERCURY_TOP_AT_20 - ((v - 20) / 60) * MERCURY_RANGE;
              return (
                <g key={v}>
                  <line x1={608} y1={y} x2={618} y2={y} stroke={LINE} strokeWidth={1.2} />
                  <text x={624} y={y + 4} fontSize={11} fill={INK_SECONDARY}>
                    {v}
                  </text>
                </g>
              );
            })}

            {controlled ? (
              <g>
                <rect x={690} y={250} width={470} height={280} rx={8} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
                <text x={714} y={284} fontSize={18} fontWeight={600} fill="var(--text-primary, #2B2A27)">
                  {L.methodTitle}
                </text>
                {methodLines.map((line, i) => (
                  <g key={line}>
                    <rect x={714} y={318 + i * 42} width={7} height={7} fill={STROKE} />
                    <text x={734} y={326 + i * 42} fontSize={16} fill={INK_SECONDARY}>
                      {line}
                    </text>
                  </g>
                ))}
                <line x1={714} y1={486} x2={1136} y2={486} stroke={LINE} />
                <text x={714} y={512} fontSize={15} fill={INK_SECONDARY}>
                  {L.methodNote}
                </text>
              </g>
            ) : (
              <g>
                <rect x={660} y={196} width={260} height={76} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={DANGER} strokeWidth={1.5} />
                <text x={790} y={226} fontSize={15} fontWeight={600} fill={DANGER} textAnchor="middle">
                  {L.confoundedLines[0]}
                </text>
                <text x={790} y={252} fontSize={15} fill={DANGER} textAnchor="middle">
                  {L.confoundedLines[1]}
                </text>
                {[700, 840].map((cx, idx) => (
                  <g key={cx}>
                    <circle cx={cx} cy={302} r={7} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
                    <rect x={cx - 2} y={309} width={4} height={20} fill={GLASS_FILL} stroke={STROKE} strokeWidth={1} />
                    <circle cx={cx} cy={332 + ((frame % 30) / 30) * 12} r={3.5} fill={BUBBLE_COLOR} />
                    <text x={cx + 24} y={316} fontSize={13} fill={INK_SECONDARY}>
                      {L.acid}
                    </text>
                    <rect x={cx - 12} y={352} width={24} height={36} fill={GLASS_FILL} stroke={STROKE} strokeWidth={1.6} />
                    <path
                      d={`M${cx - 12},388 L${cx - 46},498 L${cx + 46},498 L${cx + 12},388`}
                      fill={GLASS_FILL}
                      stroke={STROKE}
                      strokeWidth={2}
                    />
                    <polygon
                      points={`${cx - 40},462 ${cx + 40},462 ${cx + 46},498 ${cx - 46},498`}
                      fill={SOLUTION_FILL}
                    />
                    <text x={cx} y={344} fontSize={13} fill={DANGER} textAnchor="middle">
                      {L.heat}
                    </text>
                    {[0, 1, 2, 3, 4].map((j) => {
                      const progress =
                        (Math.max(0, frame - s2) / (riseFrames * 1.2) + j / 5 + idx * 0.3) % 1;
                      return (
                        <circle
                          key={j}
                          cx={cx + Math.sin(j * 2.1) * 18 * (1 - 0.4 * progress)}
                          cy={494 - progress * 28}
                          r={3}
                          fill={BUBBLE_COLOR}
                          opacity={0.8}
                        />
                      );
                    })}
                    {[cx - 18, cx, cx + 18].map((ax) => (
                      <g key={ax}>
                        <line x1={ax} y1={520} x2={ax} y2={538} stroke={DANGER} strokeWidth={1.5} />
                        <polygon points={`${ax - 4},538 ${ax + 4},538 ${ax},544`} fill={DANGER} />
                      </g>
                    ))}
                    <text x={cx} y={566} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
                      {idx === 0 ? L.miniA : L.miniB}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.rate} value={rateText} unit="×" highlight={rate > 1.05} />
            <Reading label={L.temperature} value={temperature.toFixed(0)} unit="°C" />
            <Reading label={L.concentration} value={concentration.toFixed(1)} unit="mol/L" />
            <Reading label={L.catalyst} value={catalyst ? L.added : L.notAdded} highlight={catalyst} />
            <Reading label={L.powder} value={powder ? L.yes : L.no} highlight={powder} />
            <Reading label={L.elapsed} value={elapsed.toFixed(1)} unit="s" />
            {!controlled ? (
              <div style={{ fontSize: 14, color: DANGER, marginTop: 10, lineHeight: 1.5 }}>
                {L.confoundedWarn}
              </div>
            ) : null}
            {tempOut ? (
              <div style={{ fontSize: 14, color: DANGER, marginTop: 10, lineHeight: 1.5 }}>
                {L.tempOut}
              </div>
            ) : null}
          </Panel>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              background: "var(--bg-surface, #FFFFFF)",
              border: `1px solid ${LINE}`,
              borderRadius: 6,
              padding: 12,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 15, color: INK_SECONDARY, fontWeight: 600, marginBottom: 6 }}>
              {L.curve}
            </div>
            <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
              <CurvePlot
                width={PLOT_WIDTH}
                height={PLOT_HEIGHT}
                xMax={T_MAX}
                yMin={0}
                yMax={V_MAX}
                xTicks={[0, 6, 12, 18, 24, 30, 36]}
                yTicks={[0, 15, 30, 45, 60]}
                xLabel={L.curveX}
                yLabel={L.curveY}
                points={mainCurve}
                drawnX={elapsed}
                color={CURVE_COLOR}
              />
              {!controlled ? (
                <svg
                  viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <path d={tempPath} fill="none" stroke={CURVE_ALT_T} strokeWidth={2.2} strokeDasharray="7 5" />
                  <path d={concPath} fill="none" stroke={CURVE_ALT_C} strokeWidth={2.2} strokeDasharray="3 4" />
                </svg>
              ) : null}
            </div>
            {!controlled ? (
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  fontSize: 12,
                  color: INK_SECONDARY,
                  marginTop: 6,
                }}
              >
                {[
                  { color: CURVE_COLOR, text: L.actual },
                  { color: CURVE_ALT_T, text: L.onlyT },
                  { color: CURVE_ALT_C, text: L.onlyC },
                ].map((item) => (
                  <span key={item.text} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, background: item.color, display: "inline-block" }} />
                    {item.text}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
