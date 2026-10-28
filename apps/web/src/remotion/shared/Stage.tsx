import React from "react";
import { AbsoluteFill } from "remotion";
import type { Locale, SceneStart } from "@physchem/experiment-schema";

const INK = "var(--text-primary, #2B2A27)";
const INK_SECONDARY = "var(--text-secondary, #6B6862)";
const LINE = "var(--border-default, #DDD9D2)";

export const UI_FONT =
  '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

const stepLine = (lang: Locale, i: number, n: number, title: string) =>
  lang === "en-US"
    ? `Step ${i + 1} / ${n} · ${title}`
    : `步骤 ${i + 1} / ${n} · ${title}`;

const focusLabel = (lang: Locale) => (lang === "en-US" ? "Focus: " : "焦点：");

/** 舞台统一框架：浅底、页眉（标题+当前步骤）、内容区。背景用 --bg-page，不用纯黑舞台 */
export const StageFrame: React.FC<{
  title: string;
  subtitle: string;
  scene: SceneStart;
  sceneIndex: number;
  sceneCount: number;
  lang: Locale;
  children: React.ReactNode;
}> = ({ title, subtitle, scene, sceneIndex, sceneCount, lang, children }) => (
  <AbsoluteFill
    style={{
      background: "var(--bg-page, #F7F6F3)",
      fontFamily: UI_FONT,
      padding: "40px 56px 88px",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottom: `1px solid ${LINE}`,
        paddingBottom: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 30, fontWeight: 600, color: INK, lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 17, color: INK_SECONDARY, marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ fontSize: 16, color: INK_SECONDARY, fontVariantNumeric: "tabular-nums" }}>
        {stepLine(lang, sceneIndex, sceneCount, scene.title)}
      </div>
    </header>
    <div style={{ flex: 1, display: "flex", gap: 40, marginTop: 24, minHeight: 0 }}>
      {children}
    </div>
  </AbsoluteFill>
);

/** 底部说明条：当前步骤的视觉焦点描述 */
export const SceneCaption: React.FC<{ scene: SceneStart; lang: Locale; extra?: string }> = ({
  scene,
  lang,
  extra,
}) => (
  <div
    style={{
      position: "absolute",
      left: 56,
      right: 56,
      bottom: 24,
      display: "flex",
      alignItems: "baseline",
      gap: 16,
      borderTop: `1px solid ${LINE}`,
      paddingTop: 12,
    }}
  >
    <span style={{ fontSize: 17, color: INK, fontWeight: 600, flexShrink: 0 }}>
      {focusLabel(lang)}{scene.keyPoint}
    </span>
    <span style={{ fontSize: 15, color: INK_SECONDARY }}>
      {extra ?? scene.description}
    </span>
  </div>
);

/** 片尾声明：最后 3 秒白底深灰字，无动画（规范 9.7） */
export const EndDisclaimer: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "var(--bg-surface, #FFFFFF)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      fontFamily: UI_FONT,
    }}
  >
    <div style={{ fontSize: 36, fontWeight: 600, color: INK }}>
      示意动画，非真实操作录像
    </div>
    <div style={{ fontSize: 19, color: INK_SECONDARY }}>
      本片由参数化模型程序生成，仅用于教学演示
    </div>
  </AbsoluteFill>
);

/** 信息卡片（读数面板等），遵循 UI 视觉规范 */
export const Panel: React.FC<{
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, children, style }) => (
  <div
    style={{
      background: "var(--bg-surface, #FFFFFF)",
      border: `1px solid ${LINE}`,
      borderRadius: 6,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    {title ? (
      <div
        style={{
          fontSize: 15,
          color: INK_SECONDARY,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
    ) : null}
    {children}
  </div>
);

export const Reading: React.FC<{
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}> = ({ label, value, unit, highlight }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "6px 0",
      borderBottom: `1px solid ${LINE}`,
    }}
  >
    <span style={{ fontSize: 16, color: INK_SECONDARY }}>{label}</span>
    <span
      style={{
        fontSize: 24,
        fontWeight: 600,
        color: highlight ? "var(--accent, #4A6B5D)" : INK,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
      {unit ? (
        <span style={{ fontSize: 14, color: "var(--text-muted, #9C9890)", marginLeft: 4 }}>
          {unit}
        </span>
      ) : null}
    </span>
  </div>
);
