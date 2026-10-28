import React from "react";
import {
  doubleSlitIntensity,
  fringeSpacingMm,
  indicatorColor,
  pHAfterAdding,
  wavelengthCSS,
} from "@physchem/experiment-data";
import type { ParamValues } from "@physchem/experiment-schema";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const CLICKABLE = "var(--accent, #4A6B5D)";

/* ---------------- 酸碱滴定：可交互实验台 ---------------- */

export interface AcidBenchState {
  indicator: boolean;
  stopcock: boolean;
  delivered: number;
  swirls: number;
}

export const AcidBenchScene: React.FC<{
  state: AcidBenchState;
  params: ParamValues;
  onClickStopcock: () => void;
  onClickIndicator: () => void;
  onClickFlask: () => void;
}> = ({ state, params, onClickStopcock, onClickIndicator, onClickFlask }) => {
  const ca = Number(params.acidConcentration);
  const cb = Number(params.baseConcentration);
  const va = Number(params.acidVolume);
  const pH = pHAfterAdding(ca, va, cb, state.indicator ? state.delivered : 0);
  const color = state.indicator ? indicatorColor("phenolphthalein", pH) : { css: "rgba(228, 226, 222, 0.85)", depth: 0 };
  const buretteFill = Math.max(0, (50 - state.delivered) / 50);
  const fillTop = 64 + (1 - buretteFill) * 228;
  const level = 620 - Math.min(24, state.delivered);
  const hw = (y: number) => 28 + (y - 470) * (100 / 210);
  const liquidHalf = hw(level);
  const dropVisible = state.stopcock && state.indicator;
  const dropY = 374 + ((frameTick(state.delivered) % 1) * (level - 384));
  const swirlShift = state.swirls % 2 === 1 ? 6 : 0;

  return (
    <svg viewBox="0 0 520 720" style={{ width: "100%", maxHeight: 520 }}>
      {/* 铁架台 */}
      <rect x={78} y={56} width={8} height={634} fill={SUBTLE} stroke={LINE} />
      <rect x={40} y={682} width={120} height={10} fill={SUBTLE} stroke={LINE} />
      <rect x={86} y={116} width={232} height={7} fill={SUBTLE} stroke={LINE} />
      {/* 滴定管 */}
      <rect x={318} y={56} width={44} height={244} fill="rgba(255,255,255,0.6)" stroke={STROKE} strokeWidth={2} />
      <rect x={322} y={Math.max(64, fillTop)} width={36} height={Math.max(0, 296 - Math.max(64, fillTop))} fill="rgba(190, 202, 208, 0.5)" />
      {[0, 10, 20, 30, 40, 50].map((r) => {
        const y = 64 + (r / 50) * 232;
        return (
          <g key={r}>
            <line x1={362} y1={y} x2={372} y2={y} stroke={LINE} strokeWidth={1} />
            <text x={378} y={y + 4} fontSize={12} fill="var(--text-secondary, #6B6862)">{r}</text>
          </g>
        );
      })}
      <rect x={328} y={300} width={24} height={22} fill="rgba(255,255,255,0.6)" stroke={STROKE} strokeWidth={2} />
      {/* 活塞（可点击） */}
      <g onClick={onClickStopcock} style={{ cursor: "pointer" }}>
        <circle cx={352} cy={311} r={13} fill="transparent" stroke={state.stopcock ? CLICKABLE : STROKE} strokeWidth={state.stopcock ? 2.5 : 1.5} />
        <circle cx={352} cy={311} r={6} fill={state.stopcock ? CLICKABLE : SUBTLE} stroke={STROKE} />
      </g>
      <polygon points="322,322 358,322 346,372 334,372" fill="rgba(255,255,255,0.6)" stroke={STROKE} strokeWidth={2} />
      {dropVisible ? <circle cx={340} cy={dropY} r={5} fill="rgba(154, 171, 176, 0.95)" /> : null}
      {/* 锥形瓶（可点击摇动） */}
      <g onClick={onClickFlask} style={{ cursor: "pointer" }} transform={`translate(${swirlShift}, 0)`}>
        <polygon
          points={`${340 - liquidHalf},${level} ${340 + liquidHalf},${level} 468,680 212,680`}
          fill={color.css}
        />
        <line x1={340 - liquidHalf} y1={level} x2={340 + liquidHalf} y2={level} stroke={STROKE} strokeWidth={1.5} />
        <path d="M312,400 L312,470 L212,680 M368,400 L368,470 L468,680 M212,680 L468,680" fill="none" stroke={STROKE} strokeWidth={2.5} strokeLinecap="round" />
        <rect x={306} y={392} width={68} height={10} fill="rgba(255,255,255,0.6)" stroke={STROKE} strokeWidth={2} />
      </g>
      {/* 指示剂瓶（可点击） */}
      <g onClick={onClickIndicator} style={{ cursor: "pointer" }}>
        <rect x={480} y={600} width={30} height={80} rx={4} fill={state.indicator ? "rgba(214, 31, 105, 0.35)" : "rgba(255,255,255,0.7)"} stroke={state.indicator ? CLICKABLE : STROKE} strokeWidth={state.indicator ? 2.5 : 1.5} />
        <rect x={489} y={585} width={12} height={16} fill={SUBTLE} stroke={STROKE} />
        <text x={495} y={705} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
          {state.indicator ? "+" : "○"}
        </text>
      </g>
      {/* 读数 */}
      <rect x={430} y={130} width={80} height={30} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
      <text x={470} y={150} fontSize={14} fill="var(--text-primary, #2B2A27)" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
        {state.delivered.toFixed(2)} mL
      </text>
      {/* pH 读数 */}
      <text x={40} y={200} fontSize={14} fill="var(--text-secondary, #6B6862)" style={{ fontVariantNumeric: "tabular-nums" }}>
        pH {pH.toFixed(2)}
      </text>
    </svg>
  );
};

// 液滴相位由 delivered 推导（无需真实帧循环）
function frameTick(delivered: number): number {
  return (delivered * 20) % 1;
}

/* ---------------- 双缝：参数联动展示场景 ---------------- */

export const SlitScene: React.FC<{ params: ParamValues }> = ({ params }) => {
  const lambda = Number(params.wavelength ?? 532);
  const d = Number(params.slitSeparation ?? 0.2);
  const L = Number(params.screenDistance ?? 1);
  const dyMm = fringeSpacingMm(lambda, d, L);
  const color = wavelengthCSS(lambda);
  const rows: { y: number; alpha: number }[] = [];
  for (let y = 60; y <= 580; y += 4) {
    const intensity = doubleSlitIntensity(y - 320, lambda, d, L, 84);
    if (intensity < 0.02) continue;
    rows.push({ y, alpha: intensity });
  }
  return (
    <svg viewBox="0 0 1000 640" style={{ width: "100%", maxHeight: 480 }}>
      <line x1={40} y1={320} x2={960} y2={320} stroke={LINE} strokeWidth={1} strokeDasharray="6 5" />
      <rect x={50} y={268} width={120} height={104} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
      <line x1={170} y1={320} x2={516} y2={320} stroke={color} strokeWidth={3} opacity={0.85} />
      <rect x={516} y={60} width={8} height={235} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
      <rect x={516} y={345} width={8} height={235} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
      <text x={520} y={40} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">d = {d.toFixed(2)} mm</text>
      <rect x={880} y={40} width={16} height={560} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
      {rows.map((row, i) => (
        <rect key={i} x={880} y={row.y} width={16} height={4.5} fill={color} opacity={row.alpha} />
      ))}
      <text x={850} y={330} fontSize={14} fill="var(--text-primary, #2B2A27)" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
        Δy = {dyMm.toFixed(2)} mm
      </text>
    </svg>
  );
};

/* ---------------- 电导滴定：展示场景 ---------------- */

export const ConductScene: React.FC<{ params: ParamValues; deliveredRatio: number }> = ({ params, deliveredRatio }) => {
  const ca = Number(params.acidConcentration ?? 0.1);
  const cb = Number(params.baseConcentration ?? 0.1);
  const va = Number(params.acidVolume ?? 25);
  const ve = (ca * va) / cb;
  const vb = ve * deliveredRatio;
  return (
    <svg viewBox="0 0 520 640" style={{ width: "100%", maxHeight: 480 }}>
      <rect x={120} y={300} width={240} height={300} rx={8} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
      <rect x={126} y={380} width={228} height={214} rx={6} fill="rgba(228, 226, 222, 0.85)" />
      <rect x={225} y={240} width={10} height={240} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
      <rect x={205} y={420} width={8} height={140} fill="var(--text-secondary, #6B6862)" />
      <rect x={247} y={420} width={8} height={140} fill="var(--text-secondary, #6B6862)" />
      <rect x={380} y={320} width={120} height={90} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
      <text x={440} y={352} fontSize={12} fill="var(--text-secondary, #6B6862)" textAnchor="middle">κ</text>
      <text x={440} y={388} fontSize={24} fontWeight={600} fill="var(--text-primary, #2B2A27)" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
        {ve.toFixed(2)}
      </text>
      <text x={240} y={640} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
        V(NaOH) = {vb.toFixed(2)} mL
      </text>
    </svg>
  );
};
