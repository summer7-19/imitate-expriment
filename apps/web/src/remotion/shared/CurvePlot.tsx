import React from "react";
import { clamp } from "@physchem/experiment-data";
import { UI_FONT } from "./Stage";

const INK_SECONDARY = "var(--text-secondary, #6B6862)";
const LINE = "var(--border-default, #DDD9D2)";
const AXIS = "var(--border-strong, #C4BFB6)";

export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurvePlotProps {
  width: number;
  height: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  points: CurvePoint[];
  /** 只绘制 x <= drawnX 的部分（配合进度动画） */
  drawnX: number;
  color: string;
  marker?: { x: number; label: string };
}

/**
 * 教学曲线图：坐标轴/网格线用 UI 灰度 1px，标注 12-13px 次级文字色；
 * 数据曲线允许使用饱和色（数据表达），禁止渐变填充。
 */
export const CurvePlot: React.FC<CurvePlotProps> = ({
  width,
  height,
  xMax,
  yMin,
  yMax,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  points,
  drawnX,
  color,
  marker,
}) => {
  const m = { l: 52, r: 16, t: 16, b: 44 };
  const innerW = width - m.l - m.r;
  const innerH = height - m.t - m.b;
  const sx = (x: number) => m.l + (clamp(x, 0, xMax) / xMax) * innerW;
  const sy = (y: number) => m.t + (1 - (clamp(y, yMin, yMax) - yMin) / (yMax - yMin)) * innerH;

  const visible = points.filter((p) => p.x <= drawnX);
  const path = visible
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`,
    )
    .join(" ");
  const last = visible[visible.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%", fontFamily: UI_FONT }}>
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={m.l} y1={sy(t)} x2={width - m.r} y2={sy(t)} stroke={LINE} strokeWidth={1} />
          <text x={m.l - 8} y={sy(t) + 4} fontSize={12} fill={INK_SECONDARY} textAnchor="end" style={{ fontVariantNumeric: "tabular-nums" }}>
            {t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={`x${t}`} x={sx(t)} y={height - m.b + 20} fontSize={12} fill={INK_SECONDARY} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
          {t}
        </text>
      ))}
      {/* 坐标轴 */}
      <line x1={m.l} y1={m.t} x2={m.l} y2={height - m.b} stroke={AXIS} strokeWidth={1.5} />
      <line x1={m.l} y1={height - m.b} x2={width - m.r} y2={height - m.b} stroke={AXIS} strokeWidth={1.5} />
      <text x={m.l + innerW / 2} y={height - 6} fontSize={13} fill={INK_SECONDARY} textAnchor="middle">
        {xLabel}
      </text>
      <text x={14} y={m.t + innerH / 2} fontSize={13} fill={INK_SECONDARY} textAnchor="middle" transform={`rotate(-90 14 ${m.t + innerH / 2})`}>
        {yLabel}
      </text>
      {/* 等当点/等当体积标注：虚线，不用色块 */}
      {marker ? (
        <g>
          <line x1={sx(marker.x)} y1={m.t} x2={sx(marker.x)} y2={height - m.b} stroke={AXIS} strokeWidth={1} strokeDasharray="5 4" />
          <text x={sx(marker.x) + 6} y={m.t + 14} fontSize={12} fill={INK_SECONDARY}>
            {marker.label}
          </text>
        </g>
      ) : null}
      {path ? <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" /> : null}
      {last ? <circle cx={sx(last.x)} cy={sy(last.y)} r={4.5} fill={color} /> : null}
    </svg>
  );
};
