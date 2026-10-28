import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import { getExperimentContent } from "@physchem/experiment-data";
import { KF_BENZENE, TF_BENZENE_PURE, freezingPointDepression } from "@physchem/experiment-data";
import { CurvePlot, type CurvePoint } from "../shared/CurvePlot";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const PURE_COLOR = "#4A7FBF";
const SOLUTION_COLOR = "#1F7A68";
const STROKE = "var(--border-strong, #C4BFB6)";

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const LABELS = {
  "zh-CN": {
    bench: "凝固点测定管",
    bath: "低温恒温槽（约 2 ℃）",
    stirrer: "磁力搅拌",
    params: "实验参数",
    solute: "溶质（联苯）质量",
    solvent: "溶剂（苯）质量",
    tfPure: "纯溶剂凝固点",
    tfSolution: "溶液凝固点",
    deltaTf: "凝固点降低 ΔTf",
    molality: "质量摩尔浓度",
    molarMass: "测得摩尔质量",
    curve: "冷却曲线 T–t",
    curveX: "时间 t / s",
    curveY: "温度 T / ℃",
    pure: "纯溶剂",
    solution: "溶液",
    dtLabel: (dt: string) => `ΔTf = ${dt} ℃`,
    formula: "M = Kf·m / (ΔTf·m₀)",
  },
  "en-US": {
    bench: "Freezing-point tube",
    bath: "Cryostat bath (about 2 °C)",
    stirrer: "Magnetic stirring",
    params: "Parameters",
    solute: "Solute (biphenyl) mass",
    solvent: "Solvent (benzene) mass",
    tfPure: "Pure-solvent freezing point",
    tfSolution: "Solution freezing point",
    deltaTf: "Depression ΔTf",
    molality: "Molality",
    molarMass: "Measured molar mass",
    curve: "Cooling curves T–t",
    curveX: "Time t / s",
    curveY: "Temperature T / °C",
    pure: "Pure solvent",
    solution: "Solution",
    dtLabel: (dt: string) => `ΔTf = ${dt} °C`,
    formula: "M = Kf·m / (ΔTf·m₀)",
  },
} as const;

const WINDOW_SECONDS = 90; // 冷却曲线时间窗

export const FreezingPointDepression: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("freezing-point-depression", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];

  const soluteMass = Number(params.soluteMass);
  const solventMass = Number(params.solventMass);
  const supercool = Number(params.supercoolDepth);
  const showBoth = params.showBothCurves !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [s2, s3, s4] = [scenes[1].startFrame, scenes[2].startFrame, scenes[3].startFrame];

  const { deltaTf, tfSolution } = freezingPointDepression(soluteMass, solventMass);
  const molality = soluteMass / 154.2 / (solventMass / 1000);
  const measuredM = deltaTf > 0.01 ? (KF_BENZENE * soluteMass) / (deltaTf * (solventMass / 1000)) : 0;

  /** 纯溶剂冷却曲线：下降 → 过冷 → 回升平台 */
  const pureTemp = (t: number): number => {
    const k = t / 25; // 降温速率 ℃/s 近似
    const base = 20 - 14.5 * k;
    if (base > TF_BENZENE_PURE - supercool) return Math.max(TF_BENZENE_PURE, base);
    if (base > TF_BENZENE_PURE - supercool - 0.6) {
      // 过冷后回升
      const p = 1 - (TF_BENZENE_PURE - supercool - base) / 0.6;
      return TF_BENZENE_PURE - supercool + p * supercool;
    }
    return TF_BENZENE_PURE; // 平台
  };

  /** 溶液冷却曲线：下降更深，过冷回升后沿缓降线（拐点后不出现平台） */
  const solutionTemp = (t: number): number => {
    const k = t / 25;
    const base = 20 - 14.5 * k;
    if (base > tfSolution - supercool) return Math.max(tfSolution, base);
    if (base > tfSolution - supercool - 0.6) {
      const p = 1 - (tfSolution - supercool - base) / 0.6;
      return tfSolution - supercool + p * supercool;
    }
    const tPlateau = 25 * ((20 - (tfSolution - supercool)) / 14.5);
    const after = t - tPlateau;
    return tfSolution - Math.min(0.8, Math.max(0, after) * 0.02);
  };

  // 当前展示时刻（随分镜推进）
  const tNow = Math.min(WINDOW_SECONDS, Math.max(0, (frame - (sceneIndex >= 1 ? s2 : 0)) / 30 + 10));
  const currentT =
    sceneIndex === 1 ? pureTemp(tNow) : sceneIndex === 2 ? solutionTemp(tNow) : solutionTemp(tNow);

  const purePoints = useMemo<CurvePoint[]>(() => {
    const arr: CurvePoint[] = [];
    for (let t = 0; t <= WINDOW_SECONDS; t += 1.5) arr.push({ x: t, y: pureTemp(t) });
    return arr;
  }, [supercool]);
  const solutionPoints = useMemo<CurvePoint[]>(() => {
    const arr: CurvePoint[] = [];
    for (let t = 0; t <= WINDOW_SECONDS; t += 1.5) arr.push({ x: t, y: solutionTemp(t) });
    return arr;
  }, [supercool, tfSolution]);

  const yMin = Math.floor(tfSolution - supercool - 1);
  const yMax = 20;

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
        <div style={{ flex: 1.1, minWidth: 0 }}>
          <svg viewBox="0 0 520 640" style={{ width: "100%", height: "100%" }}>
            {/* 恒温槽 */}
            <rect x={90} y={200} width={340} height={420} rx={10} fill="var(--bg-subtle, #EFEDE8)" stroke={STROKE} strokeWidth={1.5} />
            <text x={260} y={648} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.bath}</text>
            {/* 凝固点管 */}
            <rect x={200} y={240} width={120} height={330} rx={10} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <rect x={206} y={340} width={108} height={224} rx={8} fill="rgba(190, 214, 224, 0.55)" />
            <text x={260} y={610} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.bench}</text>
            {/* 温度计 */}
            <rect x={252} y={150} width={14} height={280} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={1.5} />
            <rect x={256} y={430 - ((currentT - yMin) / (yMax - yMin)) * 260} width={6} height={((currentT - yMin) / (yMax - yMin)) * 260} rx={3} fill="#9C4A42" />
            <text x={280} y={175} fontSize={16} fontWeight={600} fill="var(--text-primary, #2B2A27)" style={{ fontVariantNumeric: "tabular-nums" }}>
              {currentT.toFixed(2)} ℃
            </text>
            {/* 搅拌子 */}
            <ellipse cx={260} cy={556} rx={26} ry={8} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={1.5} />
            <text x={260} y={588} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">{L.stirrer}</text>
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.params}>
            <Reading label={L.solute} value={soluteMass.toFixed(2)} unit="g" />
            <Reading label={L.solvent} value={solventMass.toFixed(1)} unit="g" />
            <Reading label={L.tfPure} value={TF_BENZENE_PURE.toFixed(2)} unit="℃" />
            <Reading label={L.tfSolution} value={tfSolution.toFixed(2)} unit="℃" />
            <Reading label={L.deltaTf} value={deltaTf.toFixed(2)} unit="℃" highlight={frame >= s3} />
            <Reading label={L.molality} value={molality.toFixed(3)} unit="mol/kg" />
            <Reading label={L.molarMass} value={measuredM.toFixed(1)} unit="g/mol" highlight={frame >= s4} />
            <div style={{ marginTop: 12, fontSize: 16, color: "var(--text-primary, #2B2A27)", fontWeight: 600 }}>
              {L.formula}
            </div>
          </Panel>
          {frame >= s2 ? (
            <div style={{ flex: 1, minHeight: 0, background: "var(--bg-surface, #FFFFFF)", border: `1px solid ${STROKE}`, borderRadius: 6, padding: 12 }}>
              <CurvePlot
                width={640}
                height={430}
                xMax={WINDOW_SECONDS}
                yMin={yMin}
                yMax={yMax}
                xTicks={[0, 30, 60, 90]}
                yTicks={[yMin, yMin + 5, yMin + 10, yMin + 15, yMax].filter((v) => v <= yMax)}
                xLabel={L.curveX}
                yLabel={L.curveY}
                points={purePoints}
                drawnX={tNow}
                color={PURE_COLOR}
                marker={frame >= s4 ? { x: WINDOW_SECONDS, label: L.dtLabel(deltaTf.toFixed(2)) } : undefined}
              />
              {showBoth && frame >= s3 ? (
                <svg viewBox={`0 0 640 430`} style={{ position: "absolute", inset: 12, width: "calc(100% - 24px)", height: "calc(100% - 24px)", pointerEvents: "none" }}>
                  <OverlayPath points={solutionPoints} drawnX={tNow} xMax={WINDOW_SECONDS} yMin={yMin} yMax={yMax} color={SOLUTION_COLOR} />
                </svg>
              ) : null}
              <div style={{ fontSize: 13, color: "var(--text-secondary, #6B6862)", marginTop: 4 }}>
                {frame >= s3 ? `${L.pure} / ${L.solution}` : L.pure}
              </div>
            </div>
          ) : null}
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};

/** 将第二组点映射到与 CurvePlot 相同的坐标（叠加层） */
function OverlayPath({
  points,
  drawnX,
  xMax,
  yMin,
  yMax,
  color,
}: {
  points: CurvePoint[];
  drawnX: number;
  xMax: number;
  yMin: number;
  yMax: number;
  color: string;
}) {
  const m = { l: 52, r: 16, t: 16, b: 44 };
  const innerW = 640 - m.l - m.r;
  const innerH = 430 - m.t - m.b;
  const sx = (x: number) => m.l + (Math.min(xMax, Math.max(0, x)) / xMax) * innerW;
  const sy = (y: number) => m.t + (1 - (Math.min(yMax, Math.max(yMin, y)) - yMin) / (yMax - yMin)) * innerH;
  const visible = points.filter((p) => p.x <= drawnX);
  if (visible.length === 0) return null;
  const d = visible.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray="6 4" />;
}
