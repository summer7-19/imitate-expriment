import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import {
  actualConcentration,
  clamp,
  getExperimentContent,
  soluteMassG,
} from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const INK = "var(--text-primary, #2B2A27)";
const MUTED = "var(--text-secondary, #6B6862)";
const ACCENT = "#2E7D8F"; // 定容视线与液面的数据可视化色
const GLASS = "rgba(255, 255, 255, 0.6)";
const WATER = "rgba(156, 190, 199, 0.4)";
const NACL_SOLUTION = "rgba(215, 214, 208, 0.6)";
const NA2CO3_SOLUTION = "rgba(86, 148, 184, 0.34)";
const POWDER = "rgba(190, 188, 182, 0.9)";

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const LABELS = {
  "zh-CN": {
    readings: "配制数据",
    mass: "需称取溶质质量",
    target: "目标浓度",
    actual: "实际浓度",
    volume: "容量瓶规格",
    rinse: "洗涤次数",
    rinseUnit: "次",
    eye: "视线位置",
    eyeLevel: "平视",
    eyeUp: "仰视",
    eyeDown: "俯视",
    notes: "定容提示",
    formula: "c = n / V = m / (M·V)",
    stageWeigh: "称量",
    stageDissolve: "溶解",
    stageFlask: "转移·定容",
    stageAnalyse: "摇匀·分析",
    balance: "托盘天平",
    weighingBottle: "称量瓶",
    beaker: "溶解烧杯",
    flask: "容量瓶",
    mark: "刻度线",
    meniscus: "凹液面放大",
    dropper: "胶头滴管",
    transfer: "玻璃棒引流",
    nacl: "NaCl 无色溶液",
    na2co3: "Na₂CO₃ 溶液",
    overfill: "液面高于刻度线",
    upNote: "仰视刻度线：视线与刻度线的交点偏低，实际加水超过刻度，体积偏大，浓度偏低。",
    downNote: "俯视刻度线：实际加水未到刻度，体积偏小，浓度偏高。",
    rinseNote: "洗涤次数不足：溶质残留在烧杯和玻璃棒上，溶质物质的量偏小，浓度偏低。",
    okNote: "平视刻度线：凹液面最低点与刻度线相平，体积准确，浓度符合目标值。",
    actualShort: "c实",
    targetShort: "c目",
  },
  "en-US": {
    readings: "Preparation data",
    mass: "Solute mass to weigh",
    target: "Target concentration",
    actual: "Actual concentration",
    volume: "Flask size",
    rinse: "Rinses",
    rinseUnit: "times",
    eye: "Eye position",
    eyeLevel: "Level",
    eyeUp: "Looking up",
    eyeDown: "Looking down",
    notes: "Make-up notes",
    formula: "c = n / V = m / (M·V)",
    stageWeigh: "Weigh",
    stageDissolve: "Dissolve",
    stageFlask: "Transfer · make up",
    stageAnalyse: "Mix · analyse",
    balance: "Balance",
    weighingBottle: "Weighing bottle",
    beaker: "Dissolving beaker",
    flask: "Volumetric flask",
    mark: "Mark",
    meniscus: "Magnified meniscus",
    dropper: "Dropper",
    transfer: "Guided by glass rod",
    nacl: "NaCl, colourless solution",
    na2co3: "Na₂CO₃ solution",
    overfill: "Meniscus above the mark",
    upNote: "Looking up at the mark: the sight line meets the scale low, water is added past the mark, the volume is too large and the concentration too low.",
    downNote: "Looking down at the mark: water stops short of the mark, the volume is too small and the concentration too high.",
    rinseNote: "Too few rinses: solute remains on the beaker and rod, so n is too small and the concentration too low.",
    okNote: "Eye level with the mark: the meniscus bottom meets the mark, the volume is accurate and the concentration matches the target.",
    actualShort: "c(actual)",
    targetShort: "c(target)",
  },
} as const;

const STATION_X = [180, 480, 840, 1126];

export const SolutionPreparation: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("solution-preparation", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const targetConcentration = Number(params.targetConcentration);
  const flaskVolume = Number(params.flaskVolume);
  const solute = params.solute === "na2co3" ? "na2co3" : "nacl";
  const molarMass = solute === "na2co3" ? 106 : 58.5;
  const rinseCount = Number(params.rinseCount);
  const eyeLevel = typeof params.eyeLevel === "string" ? params.eyeLevel : "level";

  const mass = soluteMassG(targetConcentration, flaskVolume, molarMass);
  const actual = actualConcentration(targetConcentration, rinseCount, eyeLevel);
  const solutionColor = solute === "na2co3" ? NA2CO3_SOLUTION : NACL_SOLUTION;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const scene = scenes[sceneIndex];
  const localP = clamp((frame - scene.startFrame) / Math.max(1, scene.durationFrames), 0, 1);

  const stage = (index: number): number => {
    if (sceneIndex > index) return 1;
    if (sceneIndex === index) return localP;
    return 0;
  };

  const weighP = stage(0);
  const dissolveP = stage(1);
  const fillP = stage(2);
  const mixP = stage(3);

  // 称量：示数随称量进程增长
  const displayMass = mass * easeInOut(weighP);
  const powderH = 4 + 20 * easeInOut(weighP);

  // 溶解：液面上升、颜色出现、玻璃棒搅拌
  const beakerWaterH = 92 * easeInOut(dissolveP);
  const rodSwing = sceneIndex === 1 ? Math.sin(frame / 7) * 12 : 0;
  const solutionOpacity = dissolveP > 0.15 ? clamp((dissolveP - 0.15) / 0.5, 0, 1) : 0;

  // 容量瓶几何
  const fs = flaskVolume === 100 ? 0.86 : flaskVolume === 500 ? 1.08 : 1;
  const cx = 840;
  const topY = 286;
  const bulbTop = 376;
  const bottomY = 522;
  const neckHalf = 15 * fs;
  const bulbHalf = 76 * fs;
  const markY = 332;
  const meniscusOffset = eyeLevel === "up" ? -11 : eyeLevel === "down" ? 10 : 0;
  const targetLevel = markY + meniscusOffset;
  const flaskFillTop = fillP <= 0.001 ? bottomY : bottomY - (bottomY - targetLevel) * easeInOut(fillP);
  const flaskPath = `M ${cx - neckHalf} ${topY} L ${cx - neckHalf} ${bulbTop} C ${cx - bulbHalf} ${bulbTop + 22} ${cx - bulbHalf} ${bottomY - 26} ${cx} ${bottomY} C ${cx + bulbHalf} ${bottomY - 26} ${cx + bulbHalf} ${bulbTop + 22} ${cx + neckHalf} ${bulbTop} L ${cx + neckHalf} ${topY}`;
  const swirl = sceneIndex === 3 ? Math.sin(frame / 8) * 2.5 : 0;

  // 漏斗引流与胶头滴管
  const showFunnel = sceneIndex === 2 && localP < 0.6;
  const showDropper = sceneIndex === 2 && localP > 0.7;
  const dropperDropY = 292 + ((frame % 20) / 20) * (Math.max(300, flaskFillTop) - 292);

  // 凹液面放大视窗
  const insetMeniscusY = eyeLevel === "up" ? 368 : eyeLevel === "down" ? 392 : 380;
  const eyeY = eyeLevel === "up" ? 424 : eyeLevel === "down" ? 336 : 380;
  const eyeText = eyeLevel === "up" ? L.eyeUp : eyeLevel === "down" ? L.eyeDown : L.eyeLevel;

  const note =
    eyeLevel === "up"
      ? L.upNote
      : eyeLevel === "down"
        ? L.downNote
        : rinseCount < 2
          ? L.rinseNote
          : L.okNote;
  const noteColor =
    eyeLevel === "up" || eyeLevel === "down"
      ? "var(--warn, #8A6D3B)"
      : rinseCount < 2
        ? "var(--danger, #9C4A42)"
        : "var(--text-secondary, #6B6862)";

  return (
    <>
      <StageFrame
        title={content.title}
        subtitle={content.subtitle}
        scene={scene}
        sceneIndex={sceneIndex}
        sceneCount={scenes.length}
        lang={locale}
      >
        <div style={{ flex: 1.4, minWidth: 0 }}>
          <svg viewBox="0 0 1240 620" style={{ width: "100%", height: "100%" }}>
            {/* 实验台 */}
            <rect x={30} y={534} width={1180} height={14} fill={SUBTLE} stroke={LINE} />

            {/* 阶段编号 */}
            {STATION_X.map((x, i) => (
              <g key={`badge-${x}`}>
                <circle
                  cx={x}
                  cy={56}
                  r={16}
                  fill={i === sceneIndex ? ACCENT : "var(--bg-surface, #FFFFFF)"}
                  stroke={i === sceneIndex ? ACCENT : LINE}
                  strokeWidth={1.5}
                />
                <text
                  x={x}
                  y={61}
                  fontSize={15}
                  fontWeight={600}
                  textAnchor="middle"
                  fill={i === sceneIndex ? "#FFFFFF" : MUTED}
                >
                  {i + 1}
                </text>
              </g>
            ))}

            {/* 1 称量 */}
            <g>
              <rect x={96} y={520} width={168} height={10} fill={SUBTLE} stroke={LINE} />
              <rect x={175} y={420} width={10} height={100} fill={SUBTLE} stroke={LINE} />
              <line x1={96} y1={418} x2={264} y2={418} stroke={STROKE} strokeWidth={3} />
              <line x1={108} y1={418} x2={108} y2={444} stroke={LINE} />
              <line x1={252} y1={418} x2={252} y2={444} stroke={LINE} />
              <path d="M88 444 Q108 456 128 444" fill="none" stroke={STROKE} strokeWidth={2.5} />
              <path d="M232 444 Q252 456 272 444" fill="none" stroke={STROKE} strokeWidth={2.5} />
              {/* 称量瓶与粉末 */}
              <path d="M94 444 L94 400 L104 394 L104 388 L112 388 L112 394 L122 394 L122 400 L122 444 Z" fill={GLASS} stroke={STROKE} strokeWidth={2} />
              <rect x={97} y={444 - powderH} width={22} height={powderH} fill={POWDER} />
              {/* 砝码 */}
              <rect x={240} y={432} width={14} height={12} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
              <rect x={256} y={436} width={10} height={8} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
              <rect x={142} y={470} width={76} height={30} rx={4} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
              <text x={180} y={490} fontSize={13} fill={INK} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                {`${displayMass.toFixed(3)} g`}
              </text>
              <text x={180} y={552} fontSize={13} fill={MUTED} textAnchor="middle">
                {L.balance}
              </text>
            </g>

            {/* 2 溶解 */}
            <g>
              <path d="M408 340 L408 492 Q408 506 422 506 L538 506 Q552 506 552 492 L552 340" fill="none" stroke={STROKE} strokeWidth={2.5} />
              <rect x={411} y={502 - beakerWaterH} width={138} height={beakerWaterH} fill={WATER} />
              {solutionOpacity > 0 ? (
                <rect x={411} y={502 - beakerWaterH} width={138} height={beakerWaterH} fill={solutionColor} opacity={solutionOpacity} />
              ) : null}
              {beakerWaterH > 4 ? (
                <line x1={411} y1={502 - beakerWaterH} x2={549} y2={502 - beakerWaterH} stroke={STROKE} strokeWidth={1.5} />
              ) : null}
              <line
                x1={498 + rodSwing}
                y1={302}
                x2={526 + rodSwing}
                y2={492}
                stroke={STROKE}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {sceneIndex === 1 && localP < 0.45 ? (
                <line x1={430} y1={318} x2={430} y2={502 - beakerWaterH} stroke={WATER} strokeWidth={4} strokeLinecap="round" />
              ) : null}
              <text x={480} y={552} fontSize={13} fill={MUTED} textAnchor="middle">
                {L.beaker}
              </text>
            </g>

            {/* 3 转移与定容 */}
            <g transform={`rotate(${swirl} ${cx} 420)`}>
              <defs>
                <clipPath id="solution-preparation-flask-clip">
                  <path d={`${flaskPath} Z`} />
                </clipPath>
              </defs>
              <path d={flaskPath} fill="rgba(255, 255, 255, 0.35)" stroke={STROKE} strokeWidth={2.5} />
              <g clipPath="url(#solution-preparation-flask-clip)">
                <rect x={cx - bulbHalf - 2} y={flaskFillTop} width={bulbHalf * 2 + 4} height={bottomY - flaskFillTop} fill={solutionColor} />
                {flaskFillTop < bottomY - 1 ? (
                  <line x1={cx - bulbHalf - 2} y1={flaskFillTop} x2={cx + bulbHalf + 2} y2={flaskFillTop} stroke={STROKE} strokeWidth={1.5} />
                ) : null}
              </g>
              <line x1={cx - neckHalf} y1={topY} x2={cx + neckHalf} y2={topY} stroke={STROKE} strokeWidth={2.5} />
              {/* 刻度线 */}
              <line x1={cx - neckHalf - 12} y1={markY} x2={cx - neckHalf} y2={markY} stroke={INK} strokeWidth={2} />
              <line x1={cx + neckHalf} y1={markY} x2={cx + neckHalf + 8} y2={markY} stroke={INK} strokeWidth={1.5} />
              <text x={cx + neckHalf + 14} y={markY + 4} fontSize={11} fill={MUTED}>
                {`${flaskVolume} mL`}
              </text>
              {/* 引流漏斗或胶头滴管 */}
              {showFunnel ? (
                <g>
                  <polygon points="810,250 870,250 846,292 834,292" fill={GLASS} stroke={STROKE} strokeWidth={2} />
                  <rect x={834} y={292} width={12} height={34} fill={GLASS} stroke={STROKE} strokeWidth={1.5} />
                  <line x1={840} y1={326} x2={840} y2={Math.max(330, flaskFillTop)} stroke={solutionColor} strokeWidth={4} />
                  <text x={840} y={238} fontSize={11} fill={MUTED} textAnchor="middle">
                    {L.transfer}
                  </text>
                </g>
              ) : null}
              {showDropper ? (
                <g>
                  <rect x={834} y={240} width={12} height={30} fill={GLASS} stroke={STROKE} strokeWidth={1.5} />
                  <ellipse cx={840} cy={226} rx={12} ry={14} fill={GLASS} stroke={STROKE} strokeWidth={2} />
                  <circle cx={840} cy={dropperDropY} r={3.2} fill={solutionColor} />
                  <text x={840} y={204} fontSize={11} fill={MUTED} textAnchor="middle">
                    {L.dropper}
                  </text>
                </g>
              ) : null}
            </g>
            <text x={840} y={552} fontSize={13} fill={MUTED} textAnchor="middle">
              {L.flask}
            </text>

            {/* 4 凹液面放大视窗 */}
            <g>
              <rect x={1038} y={272} width={180} height={240} rx={5} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
              <text x={1128} y={294} fontSize={13} fill={MUTED} textAnchor="middle" fontWeight={600}>
                {L.meniscus}
              </text>
              <line x1={1078} y1={310} x2={1078} y2={474} stroke={STROKE} strokeWidth={2} />
              <line x1={1168} y1={310} x2={1168} y2={474} stroke={STROKE} strokeWidth={2} />
              <rect x={1078} y={insetMeniscusY} width={90} height={474 - insetMeniscusY} fill={solutionColor} />
              <path
                d={`M1078 ${insetMeniscusY} Q1123 ${insetMeniscusY + 8} 1168 ${insetMeniscusY}`}
                fill="none"
                stroke={STROKE}
                strokeWidth={1.8}
              />
              <line x1={1058} y1={380} x2={1188} y2={380} stroke={INK} strokeWidth={1.5} />
              <text x={1186} y={372} fontSize={11} fill={MUTED} textAnchor="end">
                {L.mark}
              </text>
              <line x1={1188} y1={eyeY} x2={1123} y2={380} stroke={ACCENT} strokeWidth={1.8} strokeDasharray="5 4" />
              <line x1={1117} y1={380} x2={1129} y2={380} stroke={ACCENT} strokeWidth={2.5} />
              <line x1={1123} y1={374} x2={1123} y2={386} stroke={ACCENT} strokeWidth={2.5} />
              <circle cx={1198} cy={eyeY} r={8.5} fill="var(--bg-surface, #FFFFFF)" stroke={INK} strokeWidth={1.5} />
              <circle cx={1198} cy={eyeY} r={3.5} fill={INK} />
              <text x={1128} y={500} fontSize={12} fill={eyeLevel === "level" ? MUTED : "var(--warn, #8A6D3B)"} textAnchor="middle" fontWeight={600}>
                {eyeText}
              </text>
            </g>
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.mass} value={mass.toFixed(3)} unit="g" />
            <Reading label={L.target} value={targetConcentration.toFixed(2)} unit="mol/L" />
            <Reading label={L.actual} value={actual.toFixed(3)} unit="mol/L" highlight={eyeLevel === "level"} />
            <Reading label={L.volume} value={String(flaskVolume)} unit="mL" />
            <Reading label={L.rinse} value={String(rinseCount)} unit={L.rinseUnit} />
            <Reading label={L.eye} value={eyeText} />
          </Panel>

          <Panel title={L.notes} style={{ flex: 1 }}>
            <div style={{ fontSize: 20, color: INK, fontFamily: "ui-monospace, Menlo, monospace" }}>
              {L.formula}
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 20,
                fontSize: 17,
                color: MUTED,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{`${L.targetShort} = ${targetConcentration.toFixed(2)}`}</span>
              <span>{`${L.actualShort} = ${actual.toFixed(3)}`}</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.7, color: noteColor }}>{note}</div>
            <div style={{ marginTop: 10, fontSize: 14, color: MUTED }}>
              {solute === "na2co3" ? L.na2co3 : L.nacl}
            </div>
            {eyeLevel === "up" ? (
              <div style={{ marginTop: 8, fontSize: 14, color: "var(--danger, #9C4A42)" }}>{L.overfill}</div>
            ) : null}
            {mixP > 0.5 ? (
              <div style={{ marginTop: 8, fontSize: 14, color: ACCENT }}>
                {locale === "en-US" ? "Flask inverted to mix the solution." : "容量瓶倒转摇匀，溶液浓度均一。"}
              </div>
            ) : null}
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scene} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
