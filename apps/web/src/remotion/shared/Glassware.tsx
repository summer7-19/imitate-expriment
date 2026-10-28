import React from "react";
import { UI_FONT } from "./Stage";

const INK_SECONDARY = "var(--text-secondary, #6B6862)";
const STROKE = "var(--border-strong, #C4BFB6)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const LINE = "var(--border-default, #DDD9D2)";

/** 玻璃器皿不描渐变，玻璃壁用 2px 描边 + 近白填充 */
const GLASS_FILL = "rgba(255, 255, 255, 0.6)";

export interface TitrationBenchProps {
  /** 滴定管液面比例 0-1（1 = 满管，读数 0.00） */
  buretteFill: number;
  /** 滴定管内液体颜色 */
  buretteColor: string;
  /** 锥形瓶内液体颜色 */
  flaskColor: string;
  /** 锥形瓶液面 y（viewBox 坐标，620 = 初始） */
  flaskLevel: number;
  /** 是否正在落液滴 */
  showDrop: boolean;
  /** 液滴下落进度 0-1 */
  dropProgress: number;
  /** 滴定管读数标注（mL） */
  readingLabel: string;
  /** 警示文字（如"颜色过深"） */
  warning?: string;
}

export const BURETTE_TIP_X = 340;

/** 滴定台：滴定管（居中）+ 锥形瓶 + 铁架台，SVG viewBox 520x720 */
export const TitrationBench: React.FC<TitrationBenchProps> = ({
  buretteFill,
  buretteColor,
  flaskColor,
  flaskLevel,
  showDrop,
  dropProgress,
  readingLabel,
  warning,
}) => {
  const fillTop = 64 + (1 - buretteFill) * 228;
  const level = Math.min(660, Math.max(480, flaskLevel));
  const hw = (y: number) => 28 + (y - 470) * (100 / 210); // 锥形瓶半宽随高度
  const liquidHalf = hw(level);
  const dropY = 374 + dropProgress * (level - 384);

  return (
    <svg
      viewBox="0 0 520 720"
      style={{ width: "100%", height: "100%", fontFamily: UI_FONT }}
    >
      {/* 铁架台 */}
      <rect x={78} y={56} width={8} height={634} fill={SUBTLE} stroke={LINE} />
      <rect x={40} y={682} width={120} height={10} fill={SUBTLE} stroke={LINE} />
      <rect x={86} y={116} width={232} height={7} fill={SUBTLE} stroke={LINE} />

      {/* 滴定管 */}
      <rect x={318} y={56} width={44} height={244} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />
      <rect x={322} y={Math.max(64, fillTop)} width={36} height={Math.max(0, 296 - Math.max(64, fillTop))} fill={buretteColor} />
      {buretteFill > 0.02 ? (
        <line x1={322} y1={fillTop} x2={358} y2={fillTop} stroke={STROKE} strokeWidth={1.5} />
      ) : null}
      {/* 刻度（读数自上而下 0→50 mL） */}
      {[0, 10, 20, 30, 40, 50].map((r) => {
        const y = 64 + (r / 50) * 232;
        return (
          <g key={r}>
            <line x1={362} y1={y} x2={372} y2={y} stroke={LINE} strokeWidth={1} />
            <text x={378} y={y + 4} fontSize={12} fill={INK_SECONDARY}>
              {r}
            </text>
          </g>
        );
      })}
      {/* 活塞与尖嘴 */}
      <rect x={328} y={300} width={24} height={22} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />
      <circle cx={352} cy={311} r={6} fill={SUBTLE} stroke={STROKE} strokeWidth={1.5} />
      <polygon points="322,322 358,322 346,372 334,372" fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />

      {/* 液滴 */}
      {showDrop ? <circle cx={340} cy={dropY} r={5} fill="rgba(154, 171, 176, 0.95)" /> : null}

      {/* 锥形瓶 */}
      <polygon
        points={`${340 - liquidHalf},${level} ${340 + liquidHalf},${level} 468,680 212,680`}
        fill={flaskColor}
      />
      <line x1={340 - liquidHalf} y1={level} x2={340 + liquidHalf} y2={level} stroke={STROKE} strokeWidth={1.5} />
      <path
        d={`M312,400 L312,470 L212,680 M368,400 L368,470 L468,680 M212,680 L468,680`}
        fill="none"
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <rect x={306} y={392} width={68} height={10} fill={GLASS_FILL} stroke={STROKE} strokeWidth={2} />

      {/* 读数气泡提示 */}
      <g>
        <rect x={430} y={130} width={80} height={30} rx={6} fill="var(--bg-surface, #FFFFFF)" stroke={LINE} />
        <text x={470} y={150} fontSize={14} fill="var(--text-primary, #2B2A27)" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
          {readingLabel}
        </text>
      </g>

      {warning ? (
        <text x={340} y={712} fontSize={16} fill="var(--danger, #9C4A42)" textAnchor="middle" fontWeight={600}>
          {warning}
        </text>
      ) : null}
    </svg>
  );
};
