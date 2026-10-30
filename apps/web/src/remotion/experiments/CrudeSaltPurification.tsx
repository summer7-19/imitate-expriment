import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { clamp, getExperimentContent, saltYield } from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const INK = "var(--text-primary, #2B2A27)";
const MUTED = "var(--text-secondary, #6B6862)";
const ACCENT = "#B5762F"; // 数据可视化强调色（产率 / 纯度）
const WATER = "rgba(156, 190, 199, 0.42)";
const CLOUDY = "rgba(145, 147, 143, 0.55)";
const BRINE = "rgba(178, 190, 190, 0.45)";
const CRYSTAL = "rgba(250, 250, 248, 0.96)";
const CRYSTAL_EDGE = "#9E9A92";
const FLAME = "#DE7A2B";
const FLAME_CORE = "#F0BE47";

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
    readings: "产率与纯度",
    yield: "产率",
    purity: "纯度",
    water: "溶解用水量",
    rinse: "洗涤次数",
    rinseUnit: "次",
    notes: "操作提示",
    formula: "产率 = m(精盐) / m(粗盐) × 100%",
    stageDissolve: "溶解",
    stageFilter: "过滤",
    stageEvaporate: "蒸发结晶",
    stageWeigh: "称量",
    cloudy: "滤液浑浊",
    overflow: "液面高于滤纸边缘，滤液短路",
    errorNote: "液面高于滤纸边缘：滤液沿滤纸与漏斗间隙流下，可溶性杂质重新进入滤液，产率与纯度同时下降。",
    noStirNote: "蒸发时没有搅拌：局部过热会使液滴飞溅，造成溶质损失。",
    rinseNote: "洗涤次数不足：晶体表面残留可溶性杂质，纯度偏低。",
    waterNote: "溶解用水量偏少：部分氯化钠未溶解而被滤纸截留，产率偏低。",
    okNote: "操作规范：滤纸紧贴、液面低于滤纸边缘，蒸发时持续搅拌。",
    filtrate: "滤液",
    crude: "粗盐 + 水",
    crystals: "精盐",
    balance: "托盘天平",
    grams: "g",
    yieldShort: "η",
    purityShort: "w",
  },
  "en-US": {
    readings: "Yield and purity",
    yield: "Yield",
    purity: "Purity",
    water: "Water for dissolving",
    rinse: "Rinses",
    rinseUnit: "times",
    notes: "Procedure notes",
    formula: "Yield = m(purified) / m(crude) × 100%",
    stageDissolve: "Dissolve",
    stageFilter: "Filter",
    stageEvaporate: "Evaporate",
    stageWeigh: "Weigh",
    cloudy: "Cloudy filtrate",
    overflow: "Liquid above the paper edge — bypass",
    errorNote: "Liquid above the paper edge: filtrate runs between paper and funnel, soluble impurities re-enter the filtrate and both yield and purity fall.",
    noStirNote: "No stirring during evaporation: local overheating spatters droplets and loses solute.",
    rinseNote: "Too few rinses: soluble impurities remain on the crystals, so purity is low.",
    waterNote: "Too little water: some sodium chloride stays undissolved and is trapped by the paper, lowering the yield.",
    okNote: "Correct technique: paper seated, liquid below the paper edge, continuous stirring during evaporation.",
    filtrate: "Filtrate",
    crude: "Crude salt + water",
    crystals: "Purified salt",
    balance: "Balance",
    grams: "g",
    yieldShort: "η",
    purityShort: "w",
  },
} as const;

const STATION_X = [170, 470, 800, 1105];

export const CrudeSaltPurification: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("crude-salt-purification", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const waterVolume = Number(params.waterVolume);
  const rinseCount = Number(params.rinseCount);
  const liquidAbovePaper = params.liquidAbovePaper === true;
  const stirDuringEvaporation = params.stirDuringEvaporation !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const scene = scenes[sceneIndex];
  const localP = clamp((frame - scene.startFrame) / Math.max(1, scene.durationFrames), 0, 1);

  const stage = (index: number): number => {
    if (sceneIndex > index) return 1;
    if (sceneIndex === index) return localP;
    return 0;
  };

  const base = saltYield(waterVolume, rinseCount);
  const yieldPercent = Math.max(
    0,
    base.yieldPercent * (liquidAbovePaper ? 0.82 : 1) * (stirDuringEvaporation ? 1 : 0.94),
  );
  const purityPercent = Math.max(
    0,
    base.purityPercent - (liquidAbovePaper ? 5.5 : 0) - (stirDuringEvaporation ? 0 : 1.5),
  );

  const dissolveP = stage(0);
  const filterP = stage(1);
  const evaporateP = stage(2);
  const weighP = stage(3);

  // 烧杯液面随水量上升，溶解阶段完成后保持
  const beakerWaterH = (34 + ((waterVolume - 20) / 60) * 74) * easeInOut(dissolveP);
  const saltOpacity = 1 - 0.88 * dissolveP;
  const rodSwing = sceneIndex === 0 ? Math.sin(frame / 7) * 10 : 0;

  // 过滤：液滴循环下落，接收瓶液面上升；错误操作时滤液浑浊
  const dropPhase = (frame % 24) / 24;
  const drops = [0, 0.34, 0.68].map((offset) => {
    const t = (dropPhase + offset) % 1;
    return { y: 442 + t * 60, opacity: sceneIndex === 1 ? 0.9 - t * 0.6 : 0 };
  });
  const filtrateH = 8 + filterP * 40;
  const filtrateColor = liquidAbovePaper ? CLOUDY : BRINE;

  // 蒸发：液面下降、蒸汽上升、晶体出现
  const dishLevel = 470 + 20 * evaporateP;
  const crystalOpacity = clamp((evaporateP - 0.55) / 0.45, 0, 1);
  const steamPhase = Math.sin(frame / 9) * 0.25 + 0.75;
  const flameFlicker = Math.sin(frame / 4) * 2;
  const rodStirX =
    sceneIndex === 2 && stirDuringEvaporation ? Math.sin(frame / 6) * 13 : 0;
  const spatter = sceneIndex === 2 && !stirDuringEvaporation;

  // 称量：晶体质量由产率换算
  const crystalMass = (5 * yieldPercent) / 100;
  const pointerTilt = clamp((crystalMass - 2.4) * 4, -9, 10) * weighP;

  const note = liquidAbovePaper
    ? L.errorNote
    : !stirDuringEvaporation
      ? L.noStirNote
      : rinseCount < 2
        ? L.rinseNote
        : waterVolume < 30
          ? L.waterNote
          : L.okNote;
  const noteColor = liquidAbovePaper ? "var(--danger, #9C4A42)" : "var(--text-secondary, #6B6862)";

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

            {/* 1 溶解 */}
            <g>
              <path
                d="M104 336 L104 498 Q104 512 118 512 L222 512 Q236 512 236 498 L236 336"
                fill="none"
                stroke={STROKE}
                strokeWidth={2.5}
              />
              <rect x={107} y={498 - beakerWaterH} width={126} height={beakerWaterH} fill={WATER} />
              {beakerWaterH > 4 ? (
                <line
                  x1={107}
                  y1={498 - beakerWaterH}
                  x2={233}
                  y2={498 - beakerWaterH}
                  stroke={STROKE}
                  strokeWidth={1.5}
                />
              ) : null}
              <path
                d={`M112 498 Q170 ${486 - saltOpacity * 2} 228 498 Z`}
                fill="rgba(118, 116, 110, 0.6)"
                opacity={saltOpacity}
              />
              <line
                x1={148 + rodSwing}
                y1={292}
                x2={190 + rodSwing}
                y2={486}
                stroke={STROKE}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <text x={170} y={548} fontSize={13} fill={MUTED} textAnchor="middle">
                {L.crude}
              </text>
            </g>

            {/* 2 过滤 */}
            <g>
              <polygon
                points="392,286 548,286 502,392 438,392"
                fill="rgba(255, 255, 255, 0.6)"
                stroke={STROKE}
                strokeWidth={2.5}
              />
              <path d="M406 302 L534 302 L470 386 Z" fill="rgba(250, 250, 248, 0.9)" stroke={LINE} strokeWidth={1.5} />
              {liquidAbovePaper ? (
                <path d="M406 302 L534 302 L470 386 Z" fill={CLOUDY} opacity={0.75} />
              ) : null}
              <line x1={392} y1={286} x2={548} y2={286} stroke={STROKE} strokeWidth={2.5} />
              <rect x={458} y={392} width={24} height={50} fill="rgba(255, 255, 255, 0.6)" stroke={STROKE} strokeWidth={2} />
              <path d="M432 456 L432 508 Q432 520 444 520 L496 520 Q508 520 508 508 L508 456" fill="none" stroke={STROKE} strokeWidth={2.5} />
              <rect x={435} y={518 - filtrateH} width={70} height={filtrateH} fill={filtrateColor} />
              {filtrateH > 4 ? (
                <line x1={435} y1={518 - filtrateH} x2={505} y2={518 - filtrateH} stroke={STROKE} strokeWidth={1.2} />
              ) : null}
              {sceneIndex === 1
                ? drops.map((d, i) => (
                    <circle key={`drop-${i}`} cx={470} cy={d.y} r={3.6} fill={liquidAbovePaper ? CLOUDY : BRINE} opacity={d.opacity} />
                  ))
                : null}
              {liquidAbovePaper ? (
                <g>
                  <path d="M536 300 Q552 322 548 344" fill="none" stroke={CLOUDY} strokeWidth={4} strokeLinecap="round" />
                  <circle cx={548} cy={352} r={4} fill={CLOUDY} />
                  <text x={470} y={552} fontSize={13} fill="var(--danger, #9C4A42)" textAnchor="middle" fontWeight={600}>
                    {L.cloudy}
                  </text>
                </g>
              ) : (
                <text x={470} y={552} fontSize={13} fill={MUTED} textAnchor="middle">
                  {L.filtrate}
                </text>
              )}
            </g>

            {/* 3 蒸发 */}
            <g>
              <path d="M704 452 L700 462 Q700 492 736 498 L864 498 Q900 492 900 462 L896 452" fill="rgba(255, 255, 255, 0.55)" stroke={STROKE} strokeWidth={2.5} />
              <line x1={704} y1={452} x2={896} y2={452} stroke={STROKE} strokeWidth={2.5} />
              <defs>
                <clipPath id="crude-salt-dish-clip">
                  <path d="M704 456 L896 456 L896 466 Q896 494 860 498 L740 498 Q704 494 704 466 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#crude-salt-dish-clip)">
                <rect x={700} y={dishLevel} width={200} height={498 - dishLevel} fill={BRINE} />
                <rect x={700} y={498 - 10 * crystalOpacity} width={200} height={12} fill={CRYSTAL} opacity={0.8} />
              </g>
              <line x1={710} y1={dishLevel} x2={890} y2={dishLevel} stroke={STROKE} strokeWidth={1.2} />
              {crystalOpacity > 0 ? (
                <g opacity={crystalOpacity}>
                  <polygon points="752,496 766,478 780,496" fill={CRYSTAL} stroke={CRYSTAL_EDGE} strokeWidth={1.5} />
                  <polygon points="788,496 800,482 812,496" fill={CRYSTAL} stroke={CRYSTAL_EDGE} strokeWidth={1.5} />
                  <polygon points="818,496 830,484 842,496" fill={CRYSTAL} stroke={CRYSTAL_EDGE} strokeWidth={1.5} />
                </g>
              ) : null}
              <line
                x1={818}
                y1={368}
                x2={800 + rodStirX}
                y2={486}
                stroke={STROKE}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {sceneIndex === 2 ? (
                <g opacity={steamPhase}>
                  <path d="M778 442 C768 418 792 408 784 384" fill="none" stroke="#B7B2A8" strokeWidth={2.5} strokeLinecap="round" />
                  <path d="M806 440 C798 414 822 402 814 376" fill="none" stroke="#B7B2A8" strokeWidth={2.5} strokeLinecap="round" />
                  <path d="M834 444 C826 422 848 414 840 392" fill="none" stroke="#B7B2A8" strokeWidth={2.5} strokeLinecap="round" />
                </g>
              ) : null}
              {spatter ? (
                <g>
                  <circle cx={780 + Math.sin(frame / 5) * 10} cy={462} r={3} fill={BRINE} />
                  <circle cx={816 + Math.cos(frame / 6) * 8} cy={456} r={3} fill={BRINE} />
                  <circle cx={800 + Math.sin(frame / 4) * 14} cy={470} r={2.5} fill={BRINE} />
                </g>
              ) : null}
              {sceneIndex === 2 ? (
                <g>
                  <path
                    d={`M768 532 Q776 512 ${800 + flameFlicker} 500 Q${824 + flameFlicker} 512 832 532 Z`}
                    fill={FLAME}
                  />
                  <path d="M786 532 Q792 518 800 508 Q808 518 814 532 Z" fill={FLAME_CORE} />
                  <rect x={770} y={528} width={60} height={8} fill={SUBTLE} stroke={LINE} />
                </g>
              ) : null}
              <text x={800} y={552} fontSize={13} fill={MUTED} textAnchor="middle">
                {L.stageEvaporate}
              </text>
            </g>

            {/* 4 称量 */}
            <g>
              <rect x={1030} y={522} width={150} height={10} fill={SUBTLE} stroke={LINE} />
              <rect x={1098} y={412} width={14} height={112} fill={SUBTLE} stroke={LINE} />
              <line x1={1032} y1={410} x2={1178} y2={410} stroke={STROKE} strokeWidth={3} />
              <line
                x1={1105}
                y1={412}
                x2={1105 + pointerTilt * 3}
                y2={448}
                stroke={ACCENT}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <line x1={1032} y1={410} x2={1046} y2={440 + pointerTilt * 0.5} stroke={LINE} />
              <line x1={1178} y1={410} x2={1164} y2={440 - pointerTilt * 0.5} stroke={LINE} />
              <path d={`M1024 ${440 + pointerTilt * 0.5} Q1046 ${452 + pointerTilt * 0.5} 1068 ${440 + pointerTilt * 0.5}`} fill="none" stroke={STROKE} strokeWidth={2.5} />
              <path d={`M1142 ${440 - pointerTilt * 0.5} Q1164 ${452 - pointerTilt * 0.5} 1186 ${440 - pointerTilt * 0.5}`} fill="none" stroke={STROKE} strokeWidth={2.5} />
              {weighP > 0 ? (
                <polygon
                  points={`1038,${438 + pointerTilt * 0.5} 1058,${438 + pointerTilt * 0.5} 1048,${436 + pointerTilt * 0.5 - 8 - crystalMass * 2}`}
                  fill={CRYSTAL}
                  stroke={CRYSTAL_EDGE}
                  strokeWidth={1.5}
                  opacity={weighP}
                />
              ) : null}
              <rect x={1062} y={474} width={86} height={30} rx={4} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
              <text x={1105} y={495} fontSize={14} fill={INK} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                {weighP > 0 ? `${crystalMass.toFixed(2)} ${L.grams}` : "—"}
              </text>
              <text x={1105} y={552} fontSize={13} fill={MUTED} textAnchor="middle">
                {L.balance}
              </text>
            </g>
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.yield} value={yieldPercent.toFixed(1)} unit="%" highlight />
            <Reading label={L.purity} value={purityPercent.toFixed(1)} unit="%" highlight={!liquidAbovePaper} />
            <Reading label={L.water} value={String(waterVolume)} unit="mL" />
            <Reading label={L.rinse} value={String(rinseCount)} unit={L.rinseUnit} />
          </Panel>

          <Panel title={L.notes} style={{ flex: 1 }}>
            <div style={{ fontSize: 20, color: INK, fontFamily: "ui-monospace, Menlo, monospace" }}>
              {L.formula}
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 24,
                fontSize: 17,
                color: MUTED,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>{`${L.yieldShort} = ${yieldPercent.toFixed(1)}%`}</span>
              <span>{`${L.purityShort} = ${purityPercent.toFixed(1)}%`}</span>
            </div>
            <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, color: noteColor }}>{note}</div>
            {liquidAbovePaper ? (
              <div style={{ marginTop: 12, fontSize: 14, color: "var(--danger, #9C4A42)" }}>{L.overflow}</div>
            ) : null}
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scene} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
