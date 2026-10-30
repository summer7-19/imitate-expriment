import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { clamp, galvanicCurrent, getExperimentContent } from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const INK = "var(--text-primary, #2B2A27)";
const SECONDARY = "var(--text-secondary, #6B6862)";
const WARN = "var(--warn, #8A6D3B)";
const ELECTRON_COLOR = "#1F6E8C";
const ION_COLOR = "#7A5AA6";
const ZINC_COLOR = "#A8A9A5";
const ZINC_STROKE = "#6B6862";
const COPPER_COLOR = "#B5762F";
const COPPER_STROKE = "#8A5A24";
const ZN_SOLUTION = "rgba(214, 222, 226, 0.7)";
const CU_SOLUTION = "rgba(47, 111, 181, 0.38)";
const ACID_SOLUTION = "rgba(202, 210, 214, 0.55)";

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const WIRE_PATH = [
  { x: 293, y: 250 },
  { x: 293, y: 150 },
  { x: 773, y: 150 },
  { x: 773, y: 250 },
];
const WIRE_SEGMENTS = WIRE_PATH.slice(0, -1).map((from, i) => {
  const to = WIRE_PATH[i + 1];
  return { from, to, length: Math.hypot(to.x - from.x, to.y - from.y) };
});
const WIRE_LENGTH = WIRE_SEGMENTS.reduce((sum, seg) => sum + seg.length, 0);

function pointOnWire(distance: number): { x: number; y: number } {
  let d = ((distance % WIRE_LENGTH) + WIRE_LENGTH) % WIRE_LENGTH;
  for (const seg of WIRE_SEGMENTS) {
    if (d <= seg.length) {
      const t = d / seg.length;
      return {
        x: seg.from.x + (seg.to.x - seg.from.x) * t,
        y: seg.from.y + (seg.to.y - seg.from.y) * t,
      };
    }
    d -= seg.length;
  }
  return WIRE_PATH[0];
}

const BRIDGE_D = "M 430 380 C 430 245, 640 245, 640 380";

function bridgePoint(t: number): { x: number; y: number; angle: number } {
  const p0 = { x: 430, y: 380 };
  const p1 = { x: 430, y: 245 };
  const p2 = { x: 640, y: 245 };
  const p3 = { x: 640, y: 380 };
  const mt = 1 - t;
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
  const dx = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

const IonArrow: React.FC<{ t: number; reverse: boolean }> = ({ t, reverse }) => {
  const p = bridgePoint(t);
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle + (reverse ? 180 : 0)})`}>
      <line x1={-9} y1={0} x2={7} y2={0} stroke={ION_COLOR} strokeWidth={2} strokeLinecap="round" />
      <polygon points="10,0 2,-3.5 2,3.5" fill={ION_COLOR} />
    </g>
  );
};

const LABELS = {
  "zh-CN": {
    cell: "电池参数",
    emf: "电动势 E",
    current: "回路电流",
    resistance: "外电路电阻",
    bridge: "盐桥",
    connected: "已连接",
    open: "断开",
    electronFlow: "电子流向",
    flowText: "Zn → Cu（外电路）",
    noFlow: "无电流",
    reactions: "电极反应",
    negative: "负极（氧化）",
    positive: "正极（还原）",
    overall: "总反应",
    ionNote: "盐桥：K⁺ → Cu 侧，Cl⁻ → Zn 侧",
    noBridgeWarn: "盐桥断开后内电路不闭合，电流表指针归零，电池不能持续供电。",
    ammeter: "电流表",
    zincSolution: "ZnSO₄ 溶液",
    acidSolution: "稀硫酸",
    copperSolution: "CuSO₄ 溶液",
    bridgeLabel: "盐桥（KCl 琼脂）",
    bridgeOpen: "盐桥断开",
    electronLabel: "e⁻",
  },
  "en-US": {
    cell: "Cell parameters",
    emf: "EMF E",
    current: "Circuit current",
    resistance: "External resistance",
    bridge: "Salt bridge",
    connected: "Connected",
    open: "Open",
    electronFlow: "Electron flow",
    flowText: "Zn → Cu (external)",
    noFlow: "No current",
    reactions: "Electrode reactions",
    negative: "Negative electrode (oxidation)",
    positive: "Positive electrode (reduction)",
    overall: "Overall reaction",
    ionNote: "Salt bridge: K⁺ → Cu side, Cl⁻ → Zn side",
    noBridgeWarn:
      "With the salt bridge removed the internal circuit is open, the needle drops to zero and the cell cannot deliver current.",
    ammeter: "Ammeter",
    zincSolution: "ZnSO₄ solution",
    acidSolution: "Dilute H₂SO₄",
    copperSolution: "CuSO₄ solution",
    bridgeLabel: "Salt bridge (KCl agar)",
    bridgeOpen: "Salt bridge open",
    electronLabel: "e⁻",
  },
} as const;

export const GalvanicCell: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("galvanic-cell", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const externalR = Number(params.externalR);
  const saltBridge = params.saltBridge !== false;
  const isCuso4 = String(params.electrolyte) === "cuso4";

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const s2 = scenes[1].startFrame;
  const s3 = scenes[2].startFrame;
  const s4 = scenes[3].startFrame;

  const { emf, current } = galvanicCurrent(externalR, saltBridge);
  const currentMa = current * 1000;
  const terminalV = current * externalR;
  const flowing = saltBridge && current > 0;
  const speed = 0.4 + Math.min(18, Math.sqrt(Math.max(current, 0)) * 45);
  const needleDeg = -55 + 110 * clamp(current / 0.7, 0, 1);
  const needleRad = (needleDeg * Math.PI) / 180;
  const needleEnd = {
    x: 620 + 24 * Math.sin(needleRad),
    y: 150 - 24 * Math.cos(needleRad),
  };

  const cathodeReaction = isCuso4 ? "Cu²⁺ + 2e⁻ → Cu" : "2H⁺ + 2e⁻ → H₂↑";
  const totalReaction = isCuso4 ? "Zn + Cu²⁺ → Zn²⁺ + Cu" : "Zn + 2H⁺ → Zn²⁺ + H₂↑";
  const rightSolutionLabel = isCuso4 ? L.copperSolution : L.acidSolution;
  const rightSolutionColor = isCuso4 ? CU_SOLUTION : ACID_SOLUTION;
  const outOfRange = externalR < 5 || externalR > 80;

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
            {/* 左杯：ZnSO₄ 溶液 */}
            <rect x={152} y={350} width={316} height={218} fill={ZN_SOLUTION} />
            <path
              d="M 150 300 V 555 Q 150 570 165 570 H 455 Q 470 570 470 555 V 300"
              fill="none"
              stroke={STROKE}
              strokeWidth={2.5}
            />
            <line x1={146} y1={300} x2={474} y2={300} stroke={STROKE} strokeWidth={2.5} />
            <text x={310} y={600} fontSize={15} fill={SECONDARY} textAnchor="middle">
              {L.zincSolution}
            </text>

            {/* 右杯：所选电解质 */}
            <rect x={602} y={350} width={316} height={218} fill={rightSolutionColor} />
            <path
              d="M 600 300 V 555 Q 600 570 615 570 H 905 Q 920 570 920 555 V 300"
              fill="none"
              stroke={STROKE}
              strokeWidth={2.5}
            />
            <line x1={596} y1={300} x2={924} y2={300} stroke={STROKE} strokeWidth={2.5} />
            <text x={760} y={600} fontSize={15} fill={SECONDARY} textAnchor="middle">
              {rightSolutionLabel}
            </text>

            {/* 盐桥 */}
            {saltBridge ? (
              <g>
                <path d={BRIDGE_D} fill="none" stroke={STROKE} strokeWidth={26} strokeLinecap="round" />
                <path d={BRIDGE_D} fill="none" stroke="var(--bg-subtle, #EFEDE8)" strokeWidth={20} strokeLinecap="round" />
                <text x={535} y={250} fontSize={14} fill={SECONDARY} textAnchor="middle">
                  {L.bridgeLabel}
                </text>
                {flowing && frame >= s3 ? (
                  <g>
                    <IonArrow t={0.32} reverse={false} />
                    <IonArrow t={0.68} reverse />
                  </g>
                ) : null}
              </g>
            ) : (
              <g>
                <path d={BRIDGE_D} fill="none" stroke={LINE} strokeWidth={2} strokeDasharray="7 6" />
                <line x1={518} y1={288} x2={552} y2={312} stroke={WARN} strokeWidth={2.5} />
                <line x1={552} y1={288} x2={518} y2={312} stroke={WARN} strokeWidth={2.5} />
                <text x={535} y={250} fontSize={14} fill={WARN} textAnchor="middle">
                  {L.bridgeOpen}
                </text>
              </g>
            )}

            {/* 电极 */}
            <rect x={280} y={250} width={26} height={290} fill={ZINC_COLOR} stroke={ZINC_STROKE} strokeWidth={1.5} />
            <rect x={760} y={250} width={26} height={290} fill={COPPER_COLOR} stroke={COPPER_STROKE} strokeWidth={1.5} />
            <text x={316} y={244} fontSize={16} fontWeight={600} fill={INK}>
              Zn (−)
            </text>
            <text x={750} y={244} fontSize={16} fontWeight={600} fill={INK} textAnchor="end">
              Cu (+)
            </text>

            {/* 导线与电流表 */}
            <path d="M 293 250 V 150 H 773 V 250" fill="none" stroke={STROKE} strokeWidth={2.5} />
            {flowing && frame >= s2
              ? Array.from({ length: 9 }, (_, i) => {
                  const p = pointOnWire(frame * speed + (i * WIRE_LENGTH) / 9);
                  if (p.y < 170 && p.x > 584 && p.x < 656) return null;
                  return <circle key={i} cx={p.x} cy={p.y} r={5} fill={ELECTRON_COLOR} />;
                })
              : null}
            <text x={452} y={136} fontSize={13} fill={ELECTRON_COLOR}>
              {L.electronLabel}
            </text>
            <circle cx={620} cy={150} r={34} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2.5} />
            <line
              x1={620}
              y1={150}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#9C4A42"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle cx={620} cy={150} r={2.5} fill={INK} />
            <text x={620} y={176} fontSize={12} fill={SECONDARY} textAnchor="middle">
              A
            </text>
            <text x={620} y={208} fontSize={16} fontWeight={600} fill={INK} textAnchor="middle">
              {currentMa.toFixed(1)} mA
            </text>

            {/* 稀硫酸时铜极产生氢气泡 */}
            {!isCuso4 && flowing && frame >= s2
              ? Array.from({ length: 4 }, (_, i) => {
                  const y = 520 - ((frame * 0.9 + i * 38) % 150);
                  if (y < 370) return null;
                  return (
                    <circle
                      key={i}
                      cx={796 + (i % 2) * 10}
                      cy={y}
                      r={3}
                      fill="none"
                      stroke="#2F6FB5"
                      strokeWidth={1.2}
                    />
                  );
                })
              : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.cell}>
            <Reading label={L.emf} value={emf.toFixed(2)} unit="V" />
            <Reading label={L.current} value={currentMa.toFixed(1)} unit="mA" highlight={flowing} />
            <Reading label={L.resistance} value={externalR.toFixed(0)} unit="Ω" />
            <Reading
              label={L.bridge}
              value={saltBridge ? L.connected : L.open}
              highlight={saltBridge}
            />
            <Reading label={L.electronFlow} value={saltBridge ? L.flowText : L.noFlow} />
            <div style={{ marginTop: 10, fontSize: 14, color: SECONDARY, lineHeight: 1.5 }}>
              {L.ionNote}
            </div>
            {!saltBridge ? (
              <div style={{ marginTop: 8, fontSize: 14, color: WARN, lineHeight: 1.45 }}>
                {L.noBridgeWarn}
              </div>
            ) : null}
            {outOfRange ? (
              <div style={{ marginTop: 8, fontSize: 14, color: WARN, lineHeight: 1.45 }}>
                {locale === "en-US"
                  ? "External resistance is outside 5–80 Ω: too small heats the cell, too large gives too little current."
                  : "外电阻超出 5–80 Ω 的教学建议范围：过小电流大发热，过大电流过小不易观察。"}
              </div>
            ) : null}
          </Panel>

          <Panel
            title={L.reactions}
            style={{ borderColor: frame >= s4 ? "var(--accent, #4A6B5D)" : LINE }}
          >
            <div style={{ fontSize: 15, color: SECONDARY }}>{L.negative}</div>
            <div style={{ fontSize: 23, fontWeight: 600, color: INK, margin: "4px 0 14px" }}>
              Zn − 2e⁻ → Zn²⁺
            </div>
            <div style={{ fontSize: 15, color: SECONDARY }}>{L.positive}</div>
            <div style={{ fontSize: 23, fontWeight: 600, color: INK, margin: "4px 0 14px" }}>
              {cathodeReaction}
            </div>
            <div style={{ fontSize: 15, color: SECONDARY }}>{L.overall}</div>
            <div style={{ fontSize: 21, fontWeight: 600, color: INK, marginTop: 4 }}>
              {totalReaction}
            </div>
            <div style={{ marginTop: 14, fontSize: 14, color: SECONDARY, lineHeight: 1.5 }}>
              {locale === "en-US"
                ? `Terminal voltage U = ${terminalV.toFixed(2)} V at I = ${currentMa.toFixed(1)} mA.`
                : `路端电压 U = ${terminalV.toFixed(2)} V，电流 I = ${currentMa.toFixed(1)} mA。`}
            </div>
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
