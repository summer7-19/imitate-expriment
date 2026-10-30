import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import {
  carbonDioxideVolume,
  clamp,
  getExperimentContent,
  type CarbonateAcid,
} from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const GLASS = "rgba(255, 255, 255, 0.62)";
const ACID = "rgba(176, 194, 200, 0.42)";
const CO2_TINT = "#3C6E8F"; // 二氧化碳数据色
const MILKY = "rgba(255, 255, 255, 0.92)";

const JAR_CAPACITY = 300; // 集气瓶容积 mL

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    acid: "所用酸",
    hcl: "稀盐酸",
    h2so4: "稀硫酸",
    rate: "产气速率",
    volume: "已收集 CO₂",
    elapsed: "反应时间",
    readings: "实时读数",
    stopped: "反应已停止",
    reacting: "反应进行中",
    flask: "锥形瓶",
    funnel: "长颈漏斗",
    jar: "集气瓶（向上排空气）",
    lime: "澄清石灰水",
    marble: "石灰石",
    airtight: "长颈漏斗液封，检查气密性",
    collect: "导管伸到瓶底，把空气从下往上排出",
    turbid: "石灰水变浑浊，证明是二氧化碳",
    clear: "石灰水仍澄清",
    crust: "白色硫酸钙覆盖层",
    acidWarn: "稀酸用量超出教学范围：过少气体不足，过多造成浪费",
    sulfateWarn: "稀硫酸与石灰石生成微溶的硫酸钙，覆盖在表面使反应很快停止",
    noGas: "几乎没有气体产生",
  },
  "en-US": {
    acid: "Acid",
    hcl: "Dilute HCl",
    h2so4: "Dilute H₂SO₄",
    rate: "Gas rate",
    volume: "CO₂ collected",
    elapsed: "Reaction time",
    readings: "Live readings",
    stopped: "Reaction stopped",
    reacting: "Reacting",
    flask: "Conical flask",
    funnel: "Long-neck funnel",
    jar: "Gas jar (upward displacement)",
    lime: "Clear limewater",
    marble: "Marble",
    airtight: "Liquid seal in the funnel; check airtightness",
    collect: "Tube to the jar bottom pushes air out from below",
    turbid: "Limewater turns milky — carbon dioxide confirmed",
    clear: "Limewater stays clear",
    crust: "White calcium sulfate crust",
    acidWarn: "Acid volume is outside the teaching range: too little gas or wasted reagent",
    sulfateWarn: "Sulfuric acid forms slightly soluble calcium sulfate that coats the marble and stops the reaction",
    noGas: "Almost no gas is produced",
  },
} as const;

export const CarbonDioxidePreparation: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("carbon-dioxide-preparation", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const zh = locale !== "en-US";

  const acid: CarbonateAcid = params.acid === "diluteH2SO4" ? "diluteH2SO4" : "diluteHCl";
  const acidVolume = Number(params.acidVolume);
  const marbleMass = Number(params.marbleMass);
  const collectionTime = Number(params.collectionTime);

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const s2 = scenes[2].startFrame;

  const elapsed =
    sceneIndex < 2
      ? 0
      : sceneIndex === 2
        ? clamp(((frame - s2) / scenes[2].durationFrames) * collectionTime, 0, collectionTime)
        : collectionTime;

  const { volumeMl, rateMlPerS, stopped } = carbonDioxideVolume(
    acid,
    acidVolume,
    marbleMass,
    elapsed,
  );

  const gasFraction = clamp(volumeMl / JAR_CAPACITY, 0, 1);
  const gasTopY = 514 - gasFraction * 302;
  const turbidity = sceneIndex >= 3 ? clamp(volumeMl / 70, 0, 1) : 0;
  const sulfate = acid === "diluteH2SO4";
  const crust = sulfate && elapsed >= 1.6;
  const bubbling = rateMlPerS > 0 && !stopped;

  const flaskBubbles = Array.from({ length: 7 }, (_, i) => {
    const phase = (frame * 0.03 + i * 0.19) % 1;
    return {
      key: i,
      x: 268 + ((i * 23) % 64),
      y: 442 - phase * 42,
      r: 2.5 + ((i * 7) % 3),
    };
  });
  const limeBubbles = Array.from({ length: 6 }, (_, i) => {
    const phase = (frame * 0.035 + i * 0.21) % 1;
    return {
      key: i,
      x: 1014 + ((i * 9) % 32),
      y: 442 - phase * 44,
    };
  });
  const milkyDots = Array.from({ length: 10 }, (_, i) => ({
    key: i,
    x: 1008 + ((i * 17) % 44),
    y: 402 + ((i * 29) % 74),
    r: 2 + ((i * 5) % 3),
  }));

  const acidText = acid === "diluteH2SO4" ? L.h2so4 : L.hcl;

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

            {/* 长颈漏斗 */}
            <polygon points="270,116 330,116 316,180 284,180" fill={GLASS} stroke={STROKE} strokeWidth={2.2} />
            <rect x={294} y={180} width={12} height={250} fill={GLASS} stroke={STROKE} strokeWidth={2} />
            <rect x={296} y={300} width={8} height={112} fill={ACID} />

            {/* 锥形瓶与液体 */}
            <polygon points="278,252 322,252 322,300 400,460 240,460 278,300" fill={GLASS} stroke={STROKE} strokeWidth={2.5} />
            <polygon points="258,400 342,400 400,460 240,460" fill={ACID} />
            <line x1={258} y1={400} x2={342} y2={400} stroke={STROKE} strokeWidth={1.4} />

            {/* 石灰石碎块 */}
            <ellipse cx={278} cy={446} rx={14} ry={7} fill={SUBTLE} stroke={LINE} />
            <ellipse cx={318} cy={450} rx={16} ry={7} fill={SUBTLE} stroke={LINE} />
            <ellipse cx={350} cy={444} rx={11} ry={6} fill={SUBTLE} stroke={LINE} />
            {crust ? (
              <g>
                <ellipse cx={278} cy={444} rx={12} ry={5.5} fill="#FFFFFF" stroke={STROKE} strokeWidth={1} />
                <ellipse cx={318} cy={448} rx={14} ry={5.5} fill="#FFFFFF" stroke={STROKE} strokeWidth={1} />
                <ellipse cx={350} cy={442} rx={9} ry={4.5} fill="#FFFFFF" stroke={STROKE} strokeWidth={1} />
              </g>
            ) : null}

            {/* 双孔橡皮塞 */}
            <rect x={272} y={238} width={56} height={16} rx={3} fill={SUBTLE} stroke={STROKE} strokeWidth={1.8} />

            {/* 反应气泡 */}
            {bubbling
              ? flaskBubbles.map((b) => (
                  <circle key={b.key} cx={b.x} cy={b.y} r={b.r} fill="none" stroke={STROKE} strokeWidth={1.2} opacity={0.8} />
                ))
              : null}

            {/* 导气管：通向集气瓶 */}
            <path
              d="M 318 240 L 318 190 Q 318 180 328 180 L 500 180 L 700 180 Q 715 180 715 196 L 715 456"
              fill="none"
              stroke={STROKE}
              strokeWidth={4}
              strokeLinecap="round"
            />
            {/* 导气管：通向石灰水试管 */}
            <path
              d="M 500 180 L 500 126 Q 500 114 514 114 L 1016 114 Q 1030 114 1030 128 L 1030 438"
              fill="none"
              stroke={STROKE}
              strokeWidth={4}
              strokeLinecap="round"
            />

            {/* 集气瓶（向上排空气） */}
            <rect x={700} y={200} width={150} height={318} fill={GLASS} stroke={STROKE} strokeWidth={2.5} rx={3} />
            {gasFraction > 0 ? (
              <rect x={706} y={gasTopY} width={138} height={514 - gasTopY} fill={CO2_TINT} opacity={0.16} />
            ) : null}
            {gasFraction > 0 ? (
              <line x1={706} y1={gasTopY} x2={844} y2={gasTopY} stroke={CO2_TINT} strokeWidth={1.4} opacity={0.6} />
            ) : null}
            {gasFraction > 0.03 ? (
              <text x={775} y={gasTopY > 250 ? gasTopY - 12 : 232} fontSize={15} fill={CO2_TINT} textAnchor="middle" fontWeight={600}>
                CO₂
              </text>
            ) : null}

            {/* 澄清石灰水试管 */}
            <rect x={1000} y={338} width={60} height={164} rx={30} fill={GLASS} stroke={STROKE} strokeWidth={2.4} />
            <path
              d="M 1004 400 L 1056 400 L 1056 472 Q 1056 496 1030 496 Q 1004 496 1004 472 Z"
              fill={turbidity > 0 ? "rgba(232, 234, 230, 0.95)" : ACID}
            />
            {turbidity > 0 ? (
              <g opacity={0.35 + 0.65 * turbidity}>
                <rect x={1004} y={400} width={52} height={96} fill={MILKY} opacity={0.75} />
                {milkyDots.map((d) => (
                  <circle key={d.key} cx={d.x} cy={d.y} r={d.r} fill="#FFFFFF" />
                ))}
              </g>
            ) : null}
            {sceneIndex >= 3 && bubbling
              ? limeBubbles.map((b) => (
                  <circle key={b.key} cx={b.x} cy={b.y} r={3} fill="none" stroke={STROKE} strokeWidth={1.2} />
                ))
              : null}
            <line x1={1004} y1={400} x2={1056} y2={400} stroke={STROKE} strokeWidth={1.2} />

            {/* 标签 */}
            <text x={300} y={520} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.flask}
            </text>
            <text x={338} y={150} fontSize={14} fill="var(--text-secondary, #6B6862)">
              {L.funnel}
            </text>
            <text x={775} y={548} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.jar}
            </text>
            <text x={1030} y={524} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.lime}
            </text>
            {crust ? (
              <text x={408} y={444} fontSize={13} fill="var(--text-secondary, #6B6862)">
                {L.crust}
              </text>
            ) : null}

            {/* 场景提示 */}
            {sceneIndex === 0 ? (
              <text x={300} y={208} fontSize={15} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {L.airtight}
              </text>
            ) : null}
            {sceneIndex === 2 ? (
              <text x={775} y={176} fontSize={15} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                {L.collect}
              </text>
            ) : null}
            {sceneIndex >= 3 ? (
              <text x={1030} y={318} fontSize={14} fill={turbidity > 0.2 ? CO2_TINT : "var(--text-muted, #9C9890)"} textAnchor="middle" fontWeight={600}>
                {turbidity > 0.2 ? L.turbid : L.clear}
              </text>
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.acid} value={acidText} />
            <Reading label={L.rate} value={rateMlPerS.toFixed(1)} unit="mL/s" highlight={rateMlPerS > 0} />
            <Reading label={L.volume} value={volumeMl.toFixed(0)} unit="mL" highlight={gasFraction > 0.5} />
            <Reading label={L.elapsed} value={elapsed.toFixed(1)} unit="s" />
            <Reading
              label={stopped ? L.stopped : L.reacting}
              value={stopped ? (zh ? "已停止" : "Stopped") : zh ? "正常" : "Normal"}
              highlight={!stopped}
            />
          </Panel>

          <Panel title={L.marble}>
            <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", lineHeight: 1.7 }}>
              {zh
                ? `锥形瓶中先放石灰石（${marbleMass.toFixed(0)} g），再由长颈漏斗加入${acidText}（${acidVolume.toFixed(0)} mL），导管伸到集气瓶底部。`
                : `Marble (${marbleMass.toFixed(0)} g) goes into the flask first, then ${acidText} (${acidVolume.toFixed(0)} mL) through the funnel; the tube reaches the jar bottom.`}
            </div>
            {acidVolume < 30 || acidVolume > 60 ? (
              <div style={{ fontSize: 15, color: "var(--warn, #8A6D3B)", marginTop: 12 }}>{L.acidWarn}</div>
            ) : null}
            {sulfate ? (
              <div style={{ fontSize: 15, color: "var(--danger, #9C4A42)", marginTop: 12, fontWeight: 600 }}>
                {L.sulfateWarn}
              </div>
            ) : null}
            {rateMlPerS === 0 && stopped ? (
              <div style={{ fontSize: 15, color: "var(--danger, #9C4A42)", marginTop: 8 }}>{L.noGas}</div>
            ) : null}
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
