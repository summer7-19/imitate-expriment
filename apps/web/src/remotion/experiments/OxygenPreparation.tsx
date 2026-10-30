import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import {
  clamp,
  getExperimentContent,
  oxygenRate,
  type OxygenMethod,
} from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const GLASS = "rgba(255, 255, 255, 0.62)";
const WATER = "rgba(168, 190, 199, 0.38)";
const OXY = "#2F7D6B"; // 氧气数据色
const FLAME = "#D9822B";
const CRACK = "#9C4A42";

const JAR_CAPACITY = 300; // 集气瓶容积 mL
const TROUGH_WATER_Y = 405;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    method: "制取方法",
    h2o2: "过氧化氢分解法",
    kmno4: "高锰酸钾加热法",
    rate: "产氧速率",
    collected: "已收集体积",
    target: "目标体积",
    purity: "氧气纯度（估算）",
    timeNeeded: "预计收集时间",
    readings: "实时读数",
    apparatus: "发生装置",
    gasJar: "集气瓶",
    trough: "水槽",
    cotton: "棉花",
    tube: "试管",
    flask: "锥形瓶",
    funnel: "分液漏斗",
    lamp: "酒精灯",
    splint: "带火星木条",
    relight: "木条复燃",
    noHeat: "未加热：高锰酸钾不分解，没有氧气产生",
    tiltWarn: "试管口向上：冷凝水会倒流，可能使热试管炸裂",
    airTest: "气泡法查气密性",
    collecting: "气泡连续均匀冒出后再收集",
    o2: "O₂",
    water: "水",
    lowO2: "氧气不足，木条未复燃",
  },
  "en-US": {
    method: "Method",
    h2o2: "H₂O₂ with MnO₂",
    kmno4: "Heated KMnO₄",
    rate: "Oxygen rate",
    collected: "Collected volume",
    target: "Target volume",
    purity: "Oxygen purity (est.)",
    timeNeeded: "Time to collect",
    readings: "Live readings",
    apparatus: "Generator",
    gasJar: "Gas jar",
    trough: "Trough",
    cotton: "Cotton",
    tube: "Test tube",
    flask: "Flask",
    funnel: "Dropping funnel",
    lamp: "Alcohol lamp",
    splint: "Glowing splint",
    relight: "Splint relights",
    noHeat: "No heat: permanganate does not decompose, so no oxygen forms",
    tiltWarn: "Tube mouth up: condensed water runs back and may crack the hot tube",
    airTest: "Bubble test for leaks",
    collecting: "Collect once bubbles come out steadily",
    o2: "O₂",
    water: "Water",
    lowO2: "Not enough oxygen to relight",
  },
} as const;

export const OxygenPreparation: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("oxygen-preparation", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const zh = locale !== "en-US";

  const method: OxygenMethod = params.method === "kmno4" ? "kmno4" : "h2o2";
  const catalyst = Number(params.catalystAmount);
  const heated = params.heated !== false;
  const target = Number(params.collectVolume);
  const tubeTilt = params.tubeTilt === "up" ? "up" : "down";

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const s2 = scenes[2].startFrame;

  const rate = oxygenRate(method, catalyst, heated);
  const rateFactor = clamp(rate / 10, 0, 1);
  const elapsed = Math.max(0, (frame - s2) / 30) * 3; // 3 倍时间压缩，便于观察
  const volume = sceneIndex < 2 ? 0 : clamp(rate * elapsed, 0, target);
  const gasFraction = clamp(volume / JAR_CAPACITY, 0, 1);
  const purity = rate <= 0 ? 0 : method === "h2o2" ? clamp(90 + catalyst * 3.5 + (heated ? 1.5 : 0), 0, 98.5) : 97;
  const timeNeeded = rate > 0 ? target / rate : 0;
  const jarLevelY = 188 + gasFraction * 300;
  const jarWaterHeight = Math.max(0, 508 - jarLevelY);

  const mouth = tubeTilt === "down" ? { x: 372, y: 310 } : { x: 372, y: 190 };
  const closed = tubeTilt === "down" ? { x: 164, y: 190 } : { x: 164, y: 310 };
  const tiltDeg = tubeTilt === "down" ? 120 : 60;

  const outlet = method === "h2o2" ? { x: 330, y: 300 } : { x: mouth.x + 8, y: mouth.y };
  const tubeEnd = { x: 745, y: 495 };

  const bubbles = Array.from({ length: 9 }, (_, i) => {
    const phase = (frame * (0.006 + rateFactor * 0.02) + i * 0.137) % 1;
    return {
      x: 758 + ((i * 37) % 72),
      y: 500 - phase * Math.max(12, 500 - (jarLevelY + 18)),
      r: 3 + ((i * 13) % 4),
      key: i,
    };
  });
  const outletBubbles = Array.from({ length: 5 }, (_, i) => {
    const phase = (frame * (0.01 + rateFactor * 0.03) + i * 0.21) % 1;
    return { x: tubeEnd.x + ((i * 11) % 16), y: TROUGH_WATER_Y + 90 - phase * 86, key: i };
  });

  const showSplint = sceneIndex >= 3;
  const relights = volume >= 100;
  const condensed = tubeTilt === "up" && sceneIndex >= 1;

  const methodText = method === "h2o2" ? L.h2o2 : L.kmno4;

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
            {/* 实验台 */}
            <rect x={40} y={558} width={1160} height={12} fill={SUBTLE} stroke={LINE} />

            {/* 铁架台 */}
            <rect x={96} y={120} width={9} height={438} fill={SUBTLE} stroke={LINE} />
            <rect x={60} y={548} width={120} height={10} fill={SUBTLE} stroke={LINE} />
            <rect x={104} y={248} width={96} height={7} fill={SUBTLE} stroke={LINE} />

            {method === "kmno4" ? (
              <g transform={`rotate(${tiltDeg} 268 250)`}>
                <rect x={235} y={130} width={66} height={240} rx={33} fill={GLASS} stroke={STROKE} strokeWidth={2.5} />
                <rect x={240} y={148} width={56} height={16} fill={SUBTLE} stroke={STROKE} />
                <rect x={246} y={300} width={44} height={54} fill="#5B3A6E" opacity={0.85} />
                {condensed ? (
                  <path d="M 250 360 l 10 -12 l -6 -10 l 14 -9" fill="none" stroke={CRACK} strokeWidth={2.4} />
                ) : null}
              </g>
            ) : (
              <g>
                {/* 分液漏斗 */}
                <polygon points="270,126 330,126 320,196 280,196" fill={GLASS} stroke={STROKE} strokeWidth={2.2} />
                <rect x={292} y={196} width={16} height={134} fill={GLASS} stroke={STROKE} strokeWidth={2} />
                <circle cx={300} cy={246} r={8} fill={SUBTLE} stroke={STROKE} strokeWidth={1.6} />
                {/* 锥形瓶 */}
                <polygon points="285,268 315,268 315,300 362,455 238,455 285,300" fill={GLASS} stroke={STROKE} strokeWidth={2.5} />
                <polygon points="250,392 350,392 362,455 238,455" fill={WATER} />
                <line x1={250} y1={392} x2={350} y2={392} stroke={STROKE} strokeWidth={1.4} />
                <ellipse cx={270} cy={444} rx={11} ry={6} fill={SUBTLE} stroke={LINE} />
                <ellipse cx={316} cy={446} rx={13} ry={6} fill={SUBTLE} stroke={LINE} />
                {heated ? (
                  <g>
                    <rect x={252} y={492} width={72} height={54} rx={6} fill={GLASS} stroke={STROKE} strokeWidth={2} />
                    <polygon points="288,492 279,466 288,438 297,466" fill={FLAME} />
                  </g>
                ) : null}
              </g>
            )}

            {/* 酒精灯（高锰酸钾法） */}
            {method === "kmno4" && heated ? (
              <g>
                <rect x={250} y={482} width={72} height={62} rx={6} fill={GLASS} stroke={STROKE} strokeWidth={2} />
                <rect x={284} y={468} width={10} height={16} fill={SUBTLE} stroke={LINE} />
                <polygon points="289,468 279,436 289,398 299,436" fill={FLAME} />
              </g>
            ) : null}

            {/* 标签 */}
            <text x={method === "kmno4" ? 140 : 196} y={382} fontSize={14} fill="var(--text-secondary, #6B6862)">
              {method === "kmno4" ? L.tube : L.flask}
            </text>
            {method === "h2o2" ? (
              <text x={338} y={152} fontSize={14} fill="var(--text-secondary, #6B6862)">
                {L.funnel}
              </text>
            ) : null}
            {heated ? (
              <text x={286} y={542} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {L.lamp}
              </text>
            ) : null}
            {method === "kmno4" ? (
              <text x={392} y={272} fontSize={13} fill="var(--text-secondary, #6B6862)">
                {L.cotton}
              </text>
            ) : null}

            {/* 导气管 */}
            <path
              d={`M ${outlet.x} ${outlet.y} L 470 ${outlet.y} Q 486 ${outlet.y} 486 ${outlet.y + 16} L 486 430 Q 486 446 502 446 L 640 446 Q 662 446 676 462 L 700 482`}
              fill="none"
              stroke={STROKE}
              strokeWidth={4}
              strokeLinecap="round"
            />

            {/* 水槽 */}
            <rect x={600} y={380} width={380} height={166} fill={GLASS} stroke={STROKE} strokeWidth={2.5} rx={4} />
            <rect x={606} y={TROUGH_WATER_Y} width={368} height={140} fill={WATER} />
            <line x1={606} y1={TROUGH_WATER_Y} x2={974} y2={TROUGH_WATER_Y} stroke={STROKE} strokeWidth={1.4} />
            <text x={610} y={566} fontSize={14} fill="var(--text-secondary, #6B6862)">
              {L.trough}
            </text>

            {/* 水中气泡（导管口） */}
            {rate > 0 || sceneIndex === 0 ? (
              <g>
                {outletBubbles.map((b) => (
                  <circle key={b.key} cx={b.x} cy={b.y} r={3.4} fill="none" stroke={STROKE} strokeWidth={1.2} opacity={0.8} />
                ))}
              </g>
            ) : null}

            {/* 倒置集气瓶 + 排水收集（前三幕） */}
            {sceneIndex < 3 ? (
              <g>
                <rect x={730} y={175} width={140} height={341} fill={GLASS} stroke={STROKE} strokeWidth={2.5} rx={3} />
                <rect x={736} y={jarLevelY} width={128} height={jarWaterHeight} fill={WATER} />
                {jarLevelY > 190 ? (
                  <rect x={736} y={188} width={128} height={jarLevelY - 188} fill={OXY} opacity={0.14} />
                ) : null}
                <line x1={736} y1={jarLevelY} x2={864} y2={jarLevelY} stroke={STROKE} strokeWidth={1.4} />
                {volume > 0 && jarLevelY > 220 ? (
                  <text x={800} y={188 + (jarLevelY - 188) / 2} fontSize={16} fill={OXY} textAnchor="middle" fontWeight={600}>
                    {L.o2}
                  </text>
                ) : null}
                {sceneIndex >= 2 && rate > 0 && gasFraction < 0.97
                  ? bubbles.map((b) => (
                      <circle key={b.key} cx={b.x} cy={b.y} r={b.r} fill="none" stroke={STROKE} strokeWidth={1.3} opacity={0.75} />
                    ))
                  : null}
                <text x={800} y={566} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  {L.gasJar}
                </text>
              </g>
            ) : null}

            {/* 带火星木条复燃（第四幕，集气瓶移到台面） */}
            {showSplint ? (
              <g>
                <rect x={978} y={244} width={136} height={252} fill={GLASS} stroke={STROKE} strokeWidth={2.5} rx={3} />
                <rect x={984} y={250} width={124} height={240} fill={OXY} opacity={volume > 0 ? 0.14 : 0.04} />
                <text x={1046} y={494} fontSize={16} fill={OXY} textAnchor="middle" fontWeight={600}>
                  {L.o2}
                </text>
                <line x1={1096} y1={196} x2={1046} y2={356} stroke="#8A6A45" strokeWidth={5} strokeLinecap="round" />
                {relights ? (
                  <g>
                    <polygon points="1046,372 1034,342 1046,306 1058,342" fill={FLAME} />
                    <polygon points="1046,360 1040,340 1046,322 1052,340" fill="#F2C14E" />
                  </g>
                ) : (
                  <circle cx={1046} cy={362} r={5} fill={FLAME} />
                )}
                <text x={1114} y={190} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="end">
                  {L.splint}
                </text>
                <text x={1046} y={548} fontSize={14} fill={relights ? OXY : "var(--text-muted, #9C9890)"} textAnchor="middle" fontWeight={600}>
                  {relights ? L.relight : L.lowO2}
                </text>
              </g>
            ) : null}

            {/* 冷凝水回流与裂纹提示 */}
            {condensed ? (
              <g>
                {[0, 1, 2].map((i) => {
                  const p = ((frame / 60 + i * 0.33) % 1) * 0.55 + 0.2;
                  const x = mouth.x + (closed.x - mouth.x) * p;
                  const y = mouth.y + (closed.y - mouth.y) * p;
                  return <circle key={i} cx={x} cy={y} r={3.2} fill="#7FA6B8" />;
                })}
                <path
                  d={`M ${closed.x - 18} ${closed.y + 12} l 12 9 l -6 11 l 15 10`}
                  fill="none"
                  stroke={CRACK}
                  strokeWidth={2.4}
                />
              </g>
            ) : null}

            {/* 气密性检查提示（第一幕） */}
            {sceneIndex === 0 ? (
              <g>
                <text x={700} y={352} fontSize={15} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  {L.airTest}
                </text>
                <path d="M 700 360 L 700 386" stroke={LINE} strokeWidth={1.2} strokeDasharray="4 4" />
              </g>
            ) : null}

            {sceneIndex === 2 ? (
              <text x={800} y={158} fontSize={15} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {L.collecting}
              </text>
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.method} value={methodText} />
            <Reading label={L.rate} value={rate.toFixed(1)} unit="mL/s" highlight={rate > 0} />
            <Reading label={L.collected} value={volume.toFixed(0)} unit="mL" />
            <Reading label={L.target} value={target.toFixed(0)} unit="mL" />
            <Reading
              label={L.purity}
              value={purity > 0 ? purity.toFixed(0) : "—"}
              unit={purity > 0 ? "%" : undefined}
              highlight={purity > 90}
            />
            <Reading label={L.timeNeeded} value={timeNeeded > 0 ? timeNeeded.toFixed(1) : "—"} unit={timeNeeded > 0 ? "s" : undefined} />
          </Panel>

          <Panel title={L.apparatus}>
            <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", lineHeight: 1.7 }}>
              {zh
                ? `${method === "h2o2" ? "锥形瓶中加入 MnO₂，滴加过氧化氢溶液" : "试管中平铺高锰酸钾，管口塞棉花"}；导管伸入水槽，集气瓶倒扣在水中，瓶内水面随气体增多而下降。`
                : `${method === "h2o2" ? "MnO₂ in the flask, hydrogen peroxide dripped in" : "Permanganate spread in the tube with a cotton plug"}; the delivery tube leads into the trough and the inverted jar slowly fills with gas as its water level falls.`}
            </div>
            {rate <= 0 ? (
              <div style={{ fontSize: 15, color: "var(--danger, #9C4A42)", marginTop: 12, fontWeight: 600 }}>{L.noHeat}</div>
            ) : null}
            {tubeTilt === "up" ? (
              <div style={{ fontSize: 15, color: "var(--danger, #9C4A42)", marginTop: 12, fontWeight: 600 }}>{L.tiltWarn}</div>
            ) : null}
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
