import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { clamp, getExperimentContent, leverBalance } from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const INK = "var(--text-primary, #2B2A27)";
const INK_SECONDARY = "var(--text-secondary, #6B6862)";
const MUTED = "var(--text-muted, #9C9890)";
const ACCENT = "var(--accent, #4A6B5D)";
const LEFT_COLOR = "#4A6B5D";
const RIGHT_COLOR = "#B5762F";
const WARN = "var(--warn, #8A6D3B)";

const PIVOT_X = 620;
const BEAM_Y = 300;
const PX_PER_CM = 14;
const HOOK_DROP = 46;
const BLOCK_W = 36;
const BLOCK_H = 13;
const BLOCK_GAP = 2;
const WEIGHT_PER_BLOCK = 0.5;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    readings: "测量读数",
    leftForce: "左侧钩码 F₁",
    leftArm: "左侧力臂 L₁",
    rightForce: "右侧钩码 F₂",
    rightArm: "右侧力臂 L₂",
    offset: "挂钩位置偏差",
    torqueLeft: "左侧力矩 F₁L₁",
    torqueRight: "右侧力矩 F₂L₂",
    balance: "杠杆状态",
    balanced: "水平平衡",
    tilted: "失去平衡",
    title0: "调节杠杆水平平衡",
    title1: "左侧钩码与力臂",
    title2: "右侧调平",
    title3: "验证 F₁L₁ = F₂L₂",
    tip0: "不挂钩码时转动平衡螺母，直到杠杆水平、水平泡居中。",
    tip1: "左侧力矩使杠杆左端下沉，记录 F₁ 与 L₁ 后保持不动。",
    tip2: "移动右侧挂钩位置，直到杠杆重新水平；指针回到中央即平衡。",
    tip3: "两侧力矩相等时杠杆水平；偏差越大，倾斜越明显。",
    bubble: "水平泡",
    tilt: "倾角",
    lever: "杠杆",
    fulcrum: "支点",
    weights: "钩码",
    offsetWarn: "挂钩位置有偏差，F₁L₁ ≠ F₂L₂",
    formula: "F₁L₁ = F₂L₂",
  },
  "en-US": {
    readings: "Readings",
    leftForce: "Left weight F₁",
    leftArm: "Left arm L₁",
    rightForce: "Right weight F₂",
    rightArm: "Right arm L₂",
    offset: "Hook offset",
    torqueLeft: "Left torque F₁L₁",
    torqueRight: "Right torque F₂L₂",
    balance: "Lever state",
    balanced: "Horizontal",
    tilted: "Out of balance",
    title0: "Level the lever",
    title1: "Left weights and arm",
    title2: "Balance from the right",
    title3: "Verify F₁L₁ = F₂L₂",
    tip0: "With no weights hung, turn the balance nuts until the beam is horizontal and the bubble is centred.",
    tip1: "The left torque tips the beam down on that side; record F₁ and L₁ and leave it unchanged.",
    tip2: "Slide the right hook until the beam is horizontal again; the pointer back at centre means balance.",
    tip3: "When the two torques are equal the beam is horizontal; the larger the mismatch, the steeper the tilt.",
    bubble: "Spirit level",
    tilt: "Tilt",
    lever: "Lever",
    fulcrum: "Fulcrum",
    weights: "Weights",
    offsetWarn: "The hook is offset, so F₁L₁ ≠ F₂L₂",
    formula: "F₁L₁ = F₂L₂",
  },
} as const;

export const LeverBalance: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("lever-balance", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const zh = locale !== "en-US";

  const f1 = Number(params.leftForce);
  const l1 = Number(params.leftArm);
  const f2 = Number(params.rightForce);
  const l2Param = Number(params.rightArm);
  const offset = Number(params.hookOffset);
  const l2 = l2Param + offset;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const s1 = scenes[1].startFrame;
  const s2 = scenes[2].startFrame;

  const result = leverBalance(f1, l1, f2, l2);
  const targetTilt = -1 * clamp((result.diff / Math.max(1e-6, result.torqueLeft + result.torqueRight)) * 12, -12, 12);

  let tilt: number;
  if (sceneIndex === 0) {
    tilt = 0;
  } else if (sceneIndex === 1) {
    tilt = interpolate(frame, [s1 + 40, s1 + 160], [0, -7], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (sceneIndex === 2) {
    tilt = interpolate(frame, [s2, s2 + 130], [-7, targetTilt], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else {
    tilt = targetTilt;
  }

  const theta = (tilt * Math.PI) / 180;
  const hookOnBeam = (armCm: number) => ({
    x: PIVOT_X + armCm * PX_PER_CM * Math.cos(theta),
    y: BEAM_Y + armCm * PX_PER_CM * Math.sin(theta),
  });
  const leftHook = hookOnBeam(-l1);
  const rightHook = hookOnBeam(l2);

  const leftAppear = interpolate(frame, [s1, s1 + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightAppear = interpolate(frame, [s2, s2 + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let d = -30; d <= 30; d += 5) {
      if (d === 0) continue;
      arr.push(d);
    }
    return arr;
  }, []);

  const beamHalf = 30 * PX_PER_CM + 24;
  const balanced = result.balanced;
  const showWeights = sceneIndex >= 1;

  const blocks = (force: number) =>
    Math.max(1, Math.round(force / WEIGHT_PER_BLOCK));

  const towerHeight = (n: number) => n * (BLOCK_H + BLOCK_GAP);

  const WeightTower: React.FC<{
    x: number;
    y: number;
    force: number;
    color: string;
    opacity: number;
  }> = ({ x, y, force, color, opacity }) => {
    const n = blocks(force);
    const labelOnRight = x >= PIVOT_X;
    return (
      <g opacity={opacity}>
        <line x1={x} y1={y} x2={x} y2={y + HOOK_DROP} stroke={INK_SECONDARY} strokeWidth={2} />
        {Array.from({ length: n }, (_, i) => (
          <rect
            key={i}
            x={x - BLOCK_W / 2}
            y={y + HOOK_DROP + i * (BLOCK_H + BLOCK_GAP)}
            width={BLOCK_W}
            height={BLOCK_H}
            rx={2.5}
            fill={color}
            opacity={0.88}
          />
        ))}
        <text
          x={labelOnRight ? x + BLOCK_W / 2 + 10 : x - BLOCK_W / 2 - 10}
          y={y + HOOK_DROP + towerHeight(n) / 2 + 5}
          fontSize={14}
          fill={INK_SECONDARY}
          textAnchor={labelOnRight ? "start" : "end"}
        >
          {force.toFixed(1)} N
        </text>
      </g>
    );
  };

  const bubbleOffset = clamp((tilt / 12) * 26, -26, 26);

  const equation =
    sceneIndex === 3 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 22, color: INK, fontFamily: "ui-monospace, Menlo, monospace", fontVariantNumeric: "tabular-nums", lineHeight: 1.7 }}>
          <div>
            F₁L₁ = {f1.toFixed(1)} × {l1.toFixed(0)} = {result.torqueLeft.toFixed(1)} N·cm
          </div>
          <div>
            F₂L₂ = {f2.toFixed(1)} × {l2.toFixed(0)} = {result.torqueRight.toFixed(1)} N·cm
          </div>
        </div>
        <div style={{ fontSize: 16, color: balanced ? ACCENT : WARN, fontWeight: 600 }}>
          {balanced
            ? zh
              ? "两侧力矩相等，杠杆水平平衡"
              : "Torques are equal — the lever is horizontal"
            : zh
              ? `两侧力矩相差 ${Math.abs(result.diff).toFixed(1)} N·cm`
              : `The torques differ by ${Math.abs(result.diff).toFixed(1)} N·cm`}
        </div>
      </div>
    ) : null;

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
        <div style={{ flex: 1.45, minWidth: 0 }}>
          <svg viewBox="0 0 1240 620" style={{ width: "100%", height: "100%" }}>
            {/* 支架 */}
            <rect x={PIVOT_X - 14} y={BEAM_Y + 8} width={28} height={228} fill={SUBTLE} stroke={LINE} />
            <rect x={PIVOT_X - 100} y={532} width={200} height={18} rx={3} fill={SUBTLE} stroke={STROKE} strokeWidth={2} />
            <polygon
              points={`${PIVOT_X - 22},${BEAM_Y + 14} ${PIVOT_X + 22},${BEAM_Y + 14} ${PIVOT_X},${BEAM_Y - 12}`}
              fill={STROKE}
            />
            <text x={PIVOT_X} y={560} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
              {L.fulcrum}
            </text>

            {/* 杠杆本体（绕支点旋转） */}
            <g transform={`rotate(${tilt} ${PIVOT_X} ${BEAM_Y})`}>
              <rect
                x={PIVOT_X - beamHalf}
                y={BEAM_Y - 9}
                width={beamHalf * 2}
                height={18}
                rx={4}
                fill="var(--bg-surface, #FFFFFF)"
                stroke={STROKE}
                strokeWidth={2.5}
              />
              {ticks.map((d) => (
                <g key={d}>
                  <line
                    x1={PIVOT_X + d * PX_PER_CM}
                    y1={BEAM_Y - 9}
                    x2={PIVOT_X + d * PX_PER_CM}
                    y2={d % 10 === 0 ? BEAM_Y - 22 : BEAM_Y - 17}
                    stroke={LINE}
                  />
                  {d % 10 === 0 ? (
                    <text
                      x={PIVOT_X + d * PX_PER_CM}
                      y={BEAM_Y - 30}
                      fontSize={11}
                      fill={MUTED}
                      textAnchor="middle"
                    >
                      {Math.abs(d)}
                    </text>
                  ) : null}
                </g>
              ))}
              {/* 水平泡 */}
              <rect
                x={PIVOT_X - 46}
                y={BEAM_Y - 44}
                width={92}
                height={20}
                rx={10}
                fill={SUBTLE}
                stroke={LINE}
              />
              <circle cx={PIVOT_X + bubbleOffset} cy={BEAM_Y - 34} r={6.5} fill={ACCENT} opacity={0.85} />
              <text x={PIVOT_X + 62} y={BEAM_Y - 28} fontSize={12} fill={MUTED}>
                {L.bubble}
              </text>
            </g>

            {/* 挂钩 */}
            {showWeights ? (
              <>
                <circle cx={leftHook.x} cy={leftHook.y} r={5} fill="none" stroke={LEFT_COLOR} strokeWidth={2.5} />
                <WeightTower x={leftHook.x} y={leftHook.y} force={f1} color={LEFT_COLOR} opacity={leftAppear} />
              </>
            ) : null}
            {sceneIndex >= 2 ? (
              <>
                <circle cx={rightHook.x} cy={rightHook.y} r={5} fill="none" stroke={RIGHT_COLOR} strokeWidth={2.5} />
                <WeightTower x={rightHook.x} y={rightHook.y} force={f2} color={RIGHT_COLOR} opacity={rightAppear} />
              </>
            ) : null}

            {/* 力臂尺寸线 */}
            {showWeights ? (
              <g opacity={0.8}>
                <line x1={PIVOT_X} y1={BEAM_Y + 128} x2={leftHook.x} y2={BEAM_Y + 128} stroke={LEFT_COLOR} strokeWidth={1.4} />
                <line x1={PIVOT_X} y1={BEAM_Y + 120} x2={PIVOT_X} y2={BEAM_Y + 136} stroke={LEFT_COLOR} strokeWidth={1.4} />
                <line x1={leftHook.x} y1={BEAM_Y + 120} x2={leftHook.x} y2={BEAM_Y + 136} stroke={LEFT_COLOR} strokeWidth={1.4} />
                <text x={(PIVOT_X + leftHook.x) / 2} y={BEAM_Y + 150} fontSize={14} fill={LEFT_COLOR} textAnchor="middle">
                  L₁ = {l1.toFixed(0)} cm
                </text>
              </g>
            ) : null}
            {sceneIndex >= 2 ? (
              <g opacity={0.8}>
                <line x1={PIVOT_X} y1={BEAM_Y + 176} x2={rightHook.x} y2={BEAM_Y + 176} stroke={RIGHT_COLOR} strokeWidth={1.4} />
                <line x1={PIVOT_X} y1={BEAM_Y + 168} x2={PIVOT_X} y2={BEAM_Y + 184} stroke={RIGHT_COLOR} strokeWidth={1.4} />
                <line x1={rightHook.x} y1={BEAM_Y + 168} x2={rightHook.x} y2={BEAM_Y + 184} stroke={RIGHT_COLOR} strokeWidth={1.4} />
                <text x={(PIVOT_X + rightHook.x) / 2} y={BEAM_Y + 198} fontSize={14} fill={RIGHT_COLOR} textAnchor="middle">
                  L₂ = {l2.toFixed(1)} cm
                </text>
              </g>
            ) : null}

            {!balanced && sceneIndex >= 2 ? (
              <text x={PIVOT_X} y={244} fontSize={15} fill={WARN} textAnchor="middle">
                {L.offsetWarn}
              </text>
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.leftForce} value={f1.toFixed(1)} unit="N" />
            <Reading label={L.leftArm} value={l1.toFixed(0)} unit="cm" />
            <Reading label={L.rightForce} value={f2.toFixed(1)} unit="N" />
            <Reading label={L.rightArm} value={l2.toFixed(1)} unit="cm" />
            <Reading label={L.offset} value={offset.toFixed(1)} unit="cm" highlight={Math.abs(offset) <= 1} />
            <Reading label={L.tilt} value={`${Math.abs(tilt).toFixed(1)}°`} highlight={balanced} />
          </Panel>

          <Panel
            title={
              sceneIndex === 0
                ? L.title0
                : sceneIndex === 1
                  ? L.title1
                  : sceneIndex === 2
                    ? L.title2
                    : L.title3
            }
            style={{ flex: 1, minHeight: 0 }}
          >
            {sceneIndex === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 16, color: INK_SECONDARY, lineHeight: 1.55 }}>
                <div>{L.tip0}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: ACCENT,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: INK, fontWeight: 600 }}>{L.balanced}</span>
                </div>
              </div>
            ) : null}

            {sceneIndex === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 16, color: INK_SECONDARY, lineHeight: 1.55 }}>{L.tip1}</div>
                <div style={{ fontSize: 20, color: INK, fontFamily: "ui-monospace, Menlo, monospace", fontVariantNumeric: "tabular-nums" }}>
                  F₁L₁ = {result.torqueLeft.toFixed(1)} N·cm
                </div>
              </div>
            ) : null}

            {sceneIndex === 2 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 16, color: INK_SECONDARY, lineHeight: 1.55 }}>{L.tip2}</div>
                <div style={{ fontSize: 16, color: balanced ? ACCENT : WARN, fontWeight: 600 }}>
                  {balanced ? L.balanced : L.tilted}
                </div>
                <div style={{ fontSize: 19, color: INK, fontFamily: "ui-monospace, Menlo, monospace", fontVariantNumeric: "tabular-nums" }}>
                  F₂L₂ = {result.torqueRight.toFixed(1)} N·cm
                </div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{L.tip3}</div>
              </div>
            ) : null}

            {equation}
          </Panel>

          <Panel title={L.formula} style={{ paddingTop: 14, paddingBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 15, color: INK_SECONDARY }}>
              <span>{L.torqueLeft}</span>
              <span style={{ color: INK, fontSize: 19, fontVariantNumeric: "tabular-nums" }}>
                {result.torqueLeft.toFixed(1)}
                <span style={{ fontSize: 13, color: MUTED, marginLeft: 4 }}>N·cm</span>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 15, color: INK_SECONDARY, marginTop: 8 }}>
              <span>{L.torqueRight}</span>
              <span style={{ color: INK, fontSize: 19, fontVariantNumeric: "tabular-nums" }}>
                {result.torqueRight.toFixed(1)}
                <span style={{ fontSize: 13, color: MUTED, marginLeft: 4 }}>N·cm</span>
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
