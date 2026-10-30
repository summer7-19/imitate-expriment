import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { clamp, fallingSpeed, getExperimentContent } from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const POTENTIAL_COLOR = "#B5652A"; // ΔEp 数据色
const KINETIC_COLOR = "#1F7A68"; // ΔEk 数据色
const TAPE_TOP = 210;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    ticker: "打点计时器",
    tape: "纸带",
    weight: "重物",
    stand: "铁架台",
    height: "下落高度 h",
    readings: "测量读数",
    speed: "瞬时速度 v",
    potential: "重力势能减少量 ΔEp",
    kinetic: "动能增加量 ΔEk",
    difference: "能量相对差值",
    energy: "能量比较",
    condition: "守恒条件",
    dragOn: "空气阻力做负功：ΔEk < ΔEp",
    dragOff: "阻力可忽略：ΔEk ≈ ΔEp",
    loss: (p: string) => `ΔEk 比 ΔEp 少 ${p}%`,
    equal: "两者在误差范围内相等",
    start: "起始点",
    perMass: "单位质量：gh = ½v²",
    massNote: "质量 m 在等式两边可约去",
  },
  "en-US": {
    ticker: "Ticker timer",
    tape: "Paper tape",
    weight: "Falling mass",
    stand: "Retort stand",
    height: "Drop height h",
    readings: "Readings",
    speed: "Speed v",
    potential: "ΔEp (lost)",
    kinetic: "ΔEk (gained)",
    difference: "Energy difference",
    energy: "Energy comparison",
    condition: "Conservation condition",
    dragOn: "Drag does negative work: ΔEk < ΔEp",
    dragOff: "Drag negligible: ΔEk ≈ ΔEp",
    loss: (p: string) => `ΔEk is ${p}% below ΔEp`,
    equal: "Agreement within experimental error",
    start: "Start dot",
    perMass: "Per unit mass: gh = ½v²",
    massNote: "The mass m cancels on both sides",
  },
} as const;

export const MechanicalEnergyConservation: React.FC<CompositionProps> = ({
  lang: locale,
  params,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("mechanical-energy-conservation", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const zh = locale !== "en-US";

  const height = Number(params.dropHeight);
  const massG = Number(params.mass);
  const massKg = massG / 1000;
  const airResistance = params.airResistance === true;
  const showBars = params.showBars !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [, releaseStart, , compareStart] = scenes.map((s) => s.startFrame);

  const v = fallingSpeed(height, airResistance);
  const potential = massKg * 9.8 * height;
  const kinetic = 0.5 * massKg * v * v;
  const difference = potential > 0 ? ((potential - kinetic) / potential) * 100 : 0;

  const tapeLen = clamp(height * 200, 80, 300);
  const fallProgress =
    frame < releaseStart
      ? 0
      : Math.pow(
          clamp((frame - releaseStart) / Math.max(1, compareStart - releaseStart), 0, 1),
          2,
        );
  const weightTop = TAPE_TOP + fallProgress * tapeLen;
  const tapeBottom = TAPE_TOP + tapeLen;

  const dotCount = airResistance ? 15 : 12;
  const dotYs = useMemo(() => {
    const ys: number[] = [];
    for (let k = 1; k <= dotCount; k++) {
      ys.push(TAPE_TOP + Math.pow(k / dotCount, 2) * tapeLen);
    }
    return ys;
  }, [dotCount, tapeLen]);
  const dotsShown = Math.min(dotCount, Math.floor(fallProgress * dotCount) + 1);

  const barProgress =
    frame < compareStart
      ? 0
      : interpolate(frame, [compareStart, compareStart + 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const MAX_BAR = 240;
  const epBar = MAX_BAR * barProgress;
  const ekBar = potential > 0 ? MAX_BAR * (kinetic / potential) * barProgress : 0;
  const barBase = 520;

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
            {/* 铁架台 */}
            <rect x={120} y={556} width={230} height={8} fill={SUBTLE} stroke={LINE} />
            <line x1={150} y1={92} x2={150} y2={556} stroke={STROKE} strokeWidth={9} strokeLinecap="round" />
            <line x1={150} y1={112} x2={262} y2={112} stroke={STROKE} strokeWidth={6} />
            <text x={118} y={90} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="end">
              {L.stand}
            </text>

            {/* 打点计时器 */}
            <rect x={256} y={100} width={150} height={78} rx={4} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <circle cx={331} cy={140} r={16} fill={SUBTLE} stroke={STROKE} />
            <line x1={331} y1={178} x2={331} y2={192} stroke={STROKE} strokeWidth={2} />
            <text x={331} y={92} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.ticker}
            </text>

            {/* 纸带：点迹由下落高度与等时间间隔生成 */}
            <rect
              x={317}
              y={190}
              width={28}
              height={tapeBottom - 190 + 14}
              fill="var(--bg-surface, #FFFFFF)"
              stroke={LINE}
            />
            <circle cx={331} cy={190} r={3.5} fill={frame % 6 < 3 ? "#2B2A27" : STROKE} />
            {dotYs.slice(0, dotsShown).map((y, i) => (
              <g key={i}>
                <circle cx={331} cy={y} r={2.8} fill="#2B2A27" />
                {i === 0 ? (
                  <text x={352} y={y + 4} fontSize={12} fill="var(--text-secondary, #6B6862)">
                    {L.start}
                  </text>
                ) : null}
              </g>
            ))}
            <text x={352} y={206} fontSize={12} fill="var(--text-secondary, #6B6862)">
              {L.tape}
            </text>

            {/* 高度标注 */}
            <line x1={282} y1={TAPE_TOP} x2={282} y2={tapeBottom} stroke={LINE} />
            <line x1={274} y1={TAPE_TOP} x2={290} y2={TAPE_TOP} stroke={STROKE} />
            <line x1={274} y1={tapeBottom} x2={290} y2={tapeBottom} stroke={STROKE} />
            <text
              x={272}
              y={(TAPE_TOP + tapeBottom) / 2}
              fontSize={13}
              fill="var(--text-secondary, #6B6862)"
              textAnchor="end"
            >
              {`h = ${height.toFixed(2)} m`}
            </text>

            {/* 重物 */}
            <rect
              x={303}
              y={weightTop}
              width={56}
              height={46}
              rx={4}
              fill={KINETIC_COLOR}
              fillOpacity={0.18}
              stroke={KINETIC_COLOR}
              strokeWidth={2.5}
            />
            <line x1={331} y1={weightTop} x2={331} y2={weightTop + 10} stroke={STROKE} strokeWidth={1.5} />
            <text x={370} y={weightTop + 28} fontSize={13} fill="var(--text-secondary, #6B6862)">
              {`${L.weight} ${massG} g`}
            </text>

            {/* 能量柱 */}
            {showBars ? (
              <g>
                <text x={820} y={250} fontSize={15} fill="var(--text-secondary, #6B6862)" fontWeight={600}>
                  {L.energy}
                </text>
                <line x1={790} y1={barBase} x2={1120} y2={barBase} stroke={STROKE} strokeWidth={1.5} />
                <line x1={790} y1={barBase - MAX_BAR} x2={1120} y2={barBase - MAX_BAR} stroke={LINE} strokeDasharray="6 5" />
                <rect
                  x={820}
                  y={barBase - epBar}
                  width={84}
                  height={epBar}
                  fill={POTENTIAL_COLOR}
                  fillOpacity={0.8}
                  stroke={POTENTIAL_COLOR}
                  strokeWidth={1.5}
                />
                <rect
                  x={952}
                  y={barBase - ekBar}
                  width={84}
                  height={ekBar}
                  fill={KINETIC_COLOR}
                  fillOpacity={0.8}
                  stroke={KINETIC_COLOR}
                  strokeWidth={1.5}
                />
                <text x={862} y={barBase + 20} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  ΔEp
                </text>
                <text x={994} y={barBase + 20} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  ΔEk
                </text>
                <text x={862} y={barBase - epBar - 10} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  {`${potential.toFixed(3)} J`}
                </text>
                <text x={994} y={barBase - ekBar - 10} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  {`${kinetic.toFixed(3)} J`}
                </text>
                <text x={790} y={barBase + 50} fontSize={14} fill={airResistance ? "var(--warn, #8A6D3B)" : "var(--text-secondary, #6B6862)"}>
                  {airResistance ? L.loss(difference.toFixed(1)) : L.equal}
                </text>
              </g>
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.height} value={height.toFixed(2)} unit="m" />
            <Reading label={L.speed} value={v.toFixed(2)} unit="m/s" highlight />
            <Reading label={L.potential} value={potential.toFixed(3)} unit="J" />
            <Reading label={L.kinetic} value={kinetic.toFixed(3)} unit="J" />
            <Reading
              label={L.difference}
              value={difference.toFixed(2)}
              unit="%"
              highlight={!airResistance}
            />
          </Panel>

          <Panel title={L.condition}>
            <div style={{ fontSize: 26, color: "var(--text-primary, #2B2A27)", fontFamily: "ui-monospace, Menlo, monospace" }}>
              mgh = ½mv²
            </div>
            <div style={{ fontSize: 16, color: "var(--text-secondary, #6B6862)", marginTop: 12, lineHeight: 1.7 }}>
              {L.perMass}：9.8 × {height.toFixed(2)} = {(9.8 * height).toFixed(2)} J/kg，½v² ={" "}
              {(0.5 * v * v).toFixed(2)} J/kg
            </div>
            <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", marginTop: 8, lineHeight: 1.6 }}>
              {L.massNote}
            </div>
            <div
              style={{
                fontSize: 15,
                color: airResistance ? "var(--warn, #8A6D3B)" : "var(--text-secondary, #6B6862)",
                marginTop: 10,
                lineHeight: 1.6,
              }}
            >
              {airResistance ? L.dragOn : L.dragOff}
              {zh ? "。" : "."}
            </div>
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
