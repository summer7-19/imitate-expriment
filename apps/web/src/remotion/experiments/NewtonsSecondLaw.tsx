import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { cartAcceleration, clamp, getExperimentContent } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const CART_COLOR = "#3E6B8C"; // 小车数据色
const CURVE_COLOR = "#B5652A"; // a–F 曲线数据色
const DOT_COLOR = "#2B2A27";

const TRACK_LEFT = 90;
const TRACK_RIGHT = 1010;
const BASE_Y = 430;
const TILT = 34;
const PULLEY_X = 1046;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    cartMass: "小车质量 M",
    hangingMass: "悬挂砝码质量 m",
    friction: "摩擦力",
    compensated: "已平衡",
    notCompensated: "未平衡",
    acceleration: "加速度 a",
    tension: "绳的拉力 T",
    readings: "测量读数",
    model: "模型关系",
    force: "合外力 F",
    netForce: "F ≈ mg",
    graph: "a–F 图",
    graphX: "F / N",
    graphY: "a / (m/s²)",
    tilt: "垫高木板，平衡摩擦力",
    level: "木板水平，存在摩擦力",
    hesitation: "起步迟滞：阻力抵消了部分拉力，图线不过原点",
    forceMarker: (f: string) => `当前 F = ${f} N`,
    tape: "纸带",
    timer: "打点计时器",
    cart: "小车",
    weights: "砝码",
    pulley: "定滑轮",
  },
  "en-US": {
    cartMass: "Cart mass M",
    hangingMass: "Hanging mass m",
    friction: "Friction",
    compensated: "Compensated",
    notCompensated: "Not compensated",
    acceleration: "Acceleration a",
    tension: "Tension T",
    readings: "Readings",
    model: "Model relation",
    force: "Net force F",
    netForce: "F ≈ mg",
    graph: "a–F graph",
    graphX: "F / N",
    graphY: "a / (m/s²)",
    tilt: "Track tilted to compensate friction",
    level: "Level track: friction present",
    hesitation: "Hesitation: drag cancels part of the pull, so the line misses the origin",
    forceMarker: (f: string) => `F = ${f} N now`,
    tape: "Paper tape",
    timer: "Ticker timer",
    cart: "Cart",
    weights: "Weights",
    pulley: "Pulley",
  },
} as const;

export const NewtonsSecondLaw: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("newtons-second-law", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const zh = locale !== "en-US";

  const cartMass = Number(params.cartMass);
  const hangingMass = Number(params.hangingMass);
  const compensated = params.frictionCompensated !== false;
  const showGraph = params.showGraph !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [, releaseStart, processStart, graphStart] = scenes.map((s) => s.startFrame);

  const { acceleration, tension, friction } = cartAcceleration(
    cartMass,
    hangingMass,
    compensated,
  );

  const yLeft = compensated ? BASE_Y - TILT : BASE_Y;
  const trackSlope = (BASE_Y - yLeft) / (TRACK_RIGHT - TRACK_LEFT);
  const trackY = (x: number) => yLeft + (x - TRACK_LEFT) * trackSlope;

  // 小车位移由模型加速度决定；未平衡摩擦力且拉不动时保持静止
  const distancePx =
    acceleration <= 0.01 ? 0 : clamp(acceleration * 170, 60, 660);
  const progress =
    frame < releaseStart
      ? 0
      : Math.pow(
          clamp((frame - releaseStart) / Math.max(1, processStart - releaseStart - 30), 0, 1),
          2,
        );
  const cartX = 200 + progress * distancePx;
  const cartBottomY = trackY(cartX);
  const cartTopY = cartBottomY - 50;

  const dotsShown = sceneIndex >= 2 ? 12 : Math.min(12, Math.ceil(progress * 12));
  const dotXs = useMemo(() => {
    const xs: number[] = [];
    let x = 222;
    for (let k = 0; k < 12; k++) {
      x += 1 + (2 * k + 1) * Math.min(acceleration, 5) * 0.9;
      xs.push(x);
    }
    return xs;
  }, [acceleration]);

  const graphPoints = useMemo<CurvePoint[]>(() => {
    const pts: CurvePoint[] = [];
    for (let i = 0; i <= 10; i++) {
      const mi = i * 0.02;
      pts.push({
        x: Number((mi * 9.8).toFixed(3)),
        y: Number(cartAcceleration(cartMass, Number(mi.toFixed(2)), compensated).acceleration.toFixed(3)),
      });
    }
    return pts;
  }, [cartMass, compensated]);

  const xMax = 2.2;
  const drawnX =
    frame < graphStart
      ? 0
      : interpolate(frame, [graphStart, graphStart + 150], [0, xMax], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const blockCount = clamp(Math.round(hangingMass * 30), 1, 6);
  const tapeY = yLeft - 58;

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
            {/* 桌面 */}
            <line x1={40} y1={560} x2={1200} y2={560} stroke={STROKE} strokeWidth={2} />
            <line x1={1010} y1={BASE_Y} x2={1010} y2={560} stroke={LINE} strokeWidth={2} />

            {/* 木板（平衡摩擦力时左端垫高） */}
            <line
              x1={TRACK_LEFT}
              y1={yLeft}
              x2={TRACK_RIGHT}
              y2={BASE_Y}
              stroke={STROKE}
              strokeWidth={8}
              strokeLinecap="round"
            />
            {compensated ? (
              <polygon
                points={`${TRACK_LEFT},${yLeft} ${TRACK_LEFT},${BASE_Y} ${TRACK_LEFT + 34},${BASE_Y}`}
                fill={SUBTLE}
                stroke={LINE}
              />
            ) : null}
            <text x={120} y={BASE_Y + 52} fontSize={14} fill="var(--text-secondary, #6B6862)">
              {compensated ? L.tilt : L.level}
            </text>

            {/* 打点计时器 */}
            <rect x={96} y={yLeft - 124} width={104} height={62} rx={4} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <circle cx={148} cy={yLeft - 93} r={13} fill={SUBTLE} stroke={STROKE} />
            <line x1={148} y1={yLeft - 62} x2={148} y2={tapeY - 8} stroke={STROKE} strokeWidth={2} />
            <text x={148} y={yLeft - 134} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.timer}
            </text>

            {/* 纸带与点迹：点距随加速度增大 */}
            <rect x={210} y={tapeY - 8} width={760} height={16} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
            {dotXs.slice(0, dotsShown).map((x, i) => (
              <circle key={i} cx={x} cy={tapeY} r={3.2} fill={DOT_COLOR} />
            ))}
            <text x={960} y={tapeY - 16} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="end">
              {L.tape}
            </text>

            {/* 定滑轮 */}
            <circle cx={PULLEY_X} cy={BASE_Y - 30} r={18} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2.5} />
            <circle cx={PULLEY_X} cy={BASE_Y - 30} r={3} fill={STROKE} />
            <line x1={PULLEY_X} y1={BASE_Y - 12} x2={PULLEY_X} y2={BASE_Y + 3} stroke={STROKE} strokeWidth={2} />
            <text x={PULLEY_X} y={BASE_Y + 24} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.pulley}
            </text>

            {/* 细绳 */}
            <line x1={cartX + 54} y1={cartTopY + 16} x2={PULLEY_X} y2={BASE_Y - 30} stroke={STROKE} strokeWidth={1.5} />
            <line x1={PULLEY_X} y1={BASE_Y - 12} x2={PULLEY_X} y2={BASE_Y + 28} stroke={STROKE} strokeWidth={1.5} />

            {/* 悬挂砝码 */}
            {Array.from({ length: blockCount }).map((_, i) => (
              <rect
                key={i}
                x={PULLEY_X - 26}
                y={BASE_Y + 28 + i * 16}
                width={52}
                height={13}
                rx={2}
                fill="var(--bg-surface, #FFFFFF)"
                stroke={STROKE}
                strokeWidth={1.5}
              />
            ))}
            <text x={PULLEY_X + 40} y={BASE_Y + 58} fontSize={13} fill="var(--text-secondary, #6B6862)">
              {L.weights}
            </text>

            {/* 小车 */}
            <g>
              <rect
                x={cartX - 55}
                y={cartTopY}
                width={110}
                height={44}
                rx={4}
                fill={CART_COLOR}
                fillOpacity={0.16}
                stroke={CART_COLOR}
                strokeWidth={2.5}
              />
              <line x1={cartX - 55} y1={cartTopY + 18} x2={cartX + 55} y2={cartTopY + 18} stroke={CART_COLOR} strokeWidth={1.2} />
              <circle cx={cartX - 32} cy={cartBottomY - 6} r={7} fill="var(--bg-surface, #FFFFFF)" stroke={CART_COLOR} strokeWidth={2.5} />
              <circle cx={cartX + 32} cy={cartBottomY - 6} r={7} fill="var(--bg-surface, #FFFFFF)" stroke={CART_COLOR} strokeWidth={2.5} />
              <text x={cartX} y={cartTopY + 30} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {L.cart}
              </text>
            </g>

            {/* 未平衡摩擦力的提示 */}
            {!compensated ? (
              <text x={210} y={BASE_Y - 170} fontSize={15} fill="var(--warn, #8A6D3B)">
                {L.hesitation}
              </text>
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.cartMass} value={cartMass.toFixed(2)} unit="kg" />
            <Reading label={L.hangingMass} value={hangingMass.toFixed(2)} unit="kg" />
            <Reading
              label={L.friction}
              value={compensated ? L.compensated : L.notCompensated}
              highlight={compensated}
            />
            <Reading label={L.acceleration} value={acceleration.toFixed(2)} unit="m/s²" highlight={compensated} />
            <Reading label={L.tension} value={tension.toFixed(3)} unit="N" />
            {!compensated ? (
              <div style={{ fontSize: 14, color: "var(--warn, #8A6D3B)", marginTop: 10 }}>
                {zh
                  ? `阻力 f = ${friction.toFixed(3)} N，小车起步迟滞`
                  : `Resistance f = ${friction.toFixed(3)} N makes the cart hesitate`}
              </div>
            ) : null}
          </Panel>

          {showGraph && frame >= graphStart ? (
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
              <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", fontWeight: 600, marginBottom: 4 }}>
                {L.graph}
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <CurvePlot
                  width={480}
                  height={330}
                  xMax={xMax}
                  yMin={0}
                  yMax={6}
                  xTicks={[0, 0.5, 1, 1.5, 2]}
                  yTicks={[0, 2, 4, 6]}
                  xLabel={L.graphX}
                  yLabel={L.graphY}
                  points={graphPoints}
                  drawnX={drawnX}
                  color={CURVE_COLOR}
                  marker={{
                    x: clamp(hangingMass * 9.8, 0, xMax),
                    label: L.forceMarker((hangingMass * 9.8).toFixed(2)),
                  }}
                />
              </div>
            </div>
          ) : (
            <Panel title={L.model}>
              <div style={{ fontSize: 24, color: "var(--text-primary, #2B2A27)", fontFamily: "ui-monospace, Menlo, monospace" }}>
                a = F / (M + m)
              </div>
              <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", marginTop: 12, lineHeight: 1.7 }}>
                {L.force}：{L.netForce} = {(hangingMass * 9.8).toFixed(3)} N
              </div>
              <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", lineHeight: 1.7 }}>
                {L.acceleration}：{acceleration.toFixed(2)} m/s²
              </div>
              {!compensated ? (
                <div style={{ fontSize: 14, color: "var(--warn, #8A6D3B)", marginTop: 10, lineHeight: 1.6 }}>
                  {zh
                    ? "未平衡摩擦力时，图线与 F 轴交于正值，加速度系统性偏小。"
                    : "Without compensation the line intercepts the F axis above zero and accelerations read low."}
                </div>
              ) : null}
            </Panel>
          )}
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
