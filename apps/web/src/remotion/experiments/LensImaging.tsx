import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CompositionProps } from "../registry";
import { DISCLAIMER_FRAMES, sceneStarts, type SceneStart } from "@physchem/experiment-schema";
import {
  clamp,
  getExperimentContent,
  lensCase,
  thinLensImage,
  type LensCase,
} from "@physchem/experiment-data";
import { EndDisclaimer, Panel, Reading, SceneCaption, StageFrame } from "../shared/Stage";

const STROKE = "var(--border-strong, #C4BFB6)";
const LINE = "var(--border-default, #DDD9D2)";
const SUBTLE = "var(--bg-subtle, #EFEDE8)";
const RAY = "#B5762F"; // 光路数据色
const IMAGE_COLOR = "#1F7A68";

const LENS_X = 620;
const AXIS_Y = 470;
const PX_PER_CM_X = 8;
const PX_PER_CM_Y = 10;

function currentSceneIndex(scenes: SceneStart[], frame: number): number {
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) idx = i;
  }
  return idx;
}

const CASE_TEXT: Record<LensCase, { zh: string; en: string }> = {
  "reduced-real": { zh: "倒立、缩小的实像", en: "Inverted, reduced real image" },
  "equal-real": { zh: "倒立、等大的实像", en: "Inverted, same-size real image" },
  "magnified-real": { zh: "倒立、放大的实像", en: "Inverted, magnified real image" },
  virtual: { zh: "正立、放大的虚像", en: "Upright, magnified virtual image" },
  none: { zh: "不成像（u = f）", en: "No image (u = f)" },
};

const LABELS = {
  "zh-CN": {
    object: "物",
    image: "像",
    virtualImage: "虚像",
    screen: "光屏",
    focal: "焦点",
    readings: "测量读数",
    focalLength: "焦距 f",
    objectDistance: "物距 u",
    imageDistance: "像距 v",
    magnification: "放大率 |m|",
    nature: "像的性质",
    formula: "薄透镜公式",
    offset: "光屏偏差",
    blur: "光屏不在像的位置，像模糊",
    noImage: "物距不大于焦距，光屏上不能得到实像",
    infinite: "∞（像距过远）",
  },
  "en-US": {
    object: "Object",
    image: "Image",
    virtualImage: "Virtual",
    screen: "Screen",
    focal: "F",
    readings: "Readings",
    focalLength: "Focal length f",
    objectDistance: "Object distance u",
    imageDistance: "Image distance v",
    magnification: "Magnification |m|",
    nature: "Image type",
    formula: "Thin-lens equation",
    offset: "Screen offset",
    blur: "The screen is off the image plane — image blurred",
    noImage: "u ≤ f: no real image can be formed on the screen",
    infinite: "∞ (beyond the bench)",
  },
} as const;

export const LensImaging: React.FC<CompositionProps> = ({ lang: locale, params }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const content = getExperimentContent("lens-imaging", locale)!;
  const L = LABELS[locale === "en-US" ? "en-US" : "zh-CN"];
  const zh = locale !== "en-US";

  const f = Number(params.focalLength);
  const u = Number(params.objectDistance);
  const h = Number(params.objectHeight);
  const offset = Number(params.screenOffset);
  const showRays = params.showRays !== false;

  const scenes = useMemo(() => sceneStarts(content), [content]);
  const sceneIndex = currentSceneIndex(scenes, frame);
  const [, s2, s3] = scenes.map((s) => s.startFrame);

  const img = thinLensImage(f, u);
  const kind = lensCase(f, u);
  const hasRealImage = img.real && Number.isFinite(img.imageDistance);
  const objX = clamp(LENS_X - u * PX_PER_CM_X, 60, LENS_X - 30);
  const objH = clamp(h * PX_PER_CM_Y, 20, 170);
  const objTipY = AXIS_Y - objH;
  const imgH = Number.isFinite(img.magnification)
    ? clamp(Math.abs(img.magnification) * objH, 6, 215)
    : 0;
  const imgX = Number.isFinite(img.imageDistance)
    ? clamp(LENS_X + img.imageDistance * PX_PER_CM_X, 40, 1190)
    : LENS_X;

  // 光屏：第 2 幕从右侧移向像的位置；其余幕停在目标位置
  const screenTarget = clamp(
    hasRealImage ? LENS_X + (img.imageDistance + offset) * PX_PER_CM_X : LENS_X + 240,
    LENS_X + 40,
    1180,
  );
  const screenX =
    sceneIndex < 2
      ? 1180
      : sceneIndex === 2
        ? interpolate(frame, [s2, Math.max(s2 + 1, s3 - 30)], [1180, screenTarget], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : screenTarget;

  const sharpness = hasRealImage ? clamp(1 - Math.abs(offset) / 3, 0, 1) : 0;
  const imageVisible = frame >= s2;

  const rays = useMemo(() => {
    if (!showRays || !Number.isFinite(img.magnification)) return null;
    const imgTipY = hasRealImage ? AXIS_Y + imgH : AXIS_Y - imgH;
    if (hasRealImage) {
      return {
        paths: [
          `M ${objX} ${objTipY} L ${LENS_X} ${objTipY} L ${imgX} ${imgTipY}`,
          `M ${objX} ${objTipY} L ${LENS_X} ${AXIS_Y} L ${imgX} ${imgTipY}`,
          `M ${objX} ${objTipY} L ${LENS_X} ${imgTipY} L ${imgX} ${imgTipY}`,
        ],
        dashed: [] as string[],
      };
    }
    // 虚像：折射光线发散，反向延长线交于物侧
    const focusX = LENS_X + f * PX_PER_CM_X;
    const t = (1220 - LENS_X) / Math.max(1, focusX - LENS_X);
    const endY = objTipY + (AXIS_Y - objTipY) * t;
    return {
      paths: [
        `M ${objX} ${objTipY} L ${LENS_X} ${objTipY} L 1220 ${endY}`,
        `M ${objX} ${objTipY} L ${LENS_X} ${imgTipY} L 1220 ${imgTipY}`,
      ],
      dashed: [
        `M ${LENS_X} ${objTipY} L ${imgX} ${imgTipY}`,
        `M ${LENS_X} ${imgTipY} L ${imgX} ${imgTipY}`,
      ],
    };
  }, [showRays, img.magnification, hasRealImage, imgH, imgX, objX, objTipY, f]);

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let d = -50; d <= 70; d += 10) {
      if (d === 0) continue;
      const x = LENS_X + d * PX_PER_CM_X;
      if (x > 40 && x < 1200) arr.push(d);
    }
    return arr;
  }, []);

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
        <div style={{ flex: 1.45, minWidth: 0 }}>
          <svg viewBox="0 0 1240 620" style={{ width: "100%", height: "100%" }}>
            {/* 光具座与刻度 */}
            <rect x={30} y={486} width={1180} height={18} fill={SUBTLE} stroke={LINE} />
            {ticks.map((d) => (
              <g key={d}>
                <line
                  x1={LENS_X + d * PX_PER_CM_X}
                  y1={486}
                  x2={LENS_X + d * PX_PER_CM_X}
                  y2={d % 20 === 0 ? 504 : 497}
                  stroke={LINE}
                />
                {d % 20 === 0 ? (
                  <text
                    x={LENS_X + d * PX_PER_CM_X}
                    y={522}
                    fontSize={11}
                    fill="var(--text-muted, #9C9890)"
                    textAnchor="middle"
                  >
                    {Math.abs(d)}
                  </text>
                ) : null}
              </g>
            ))}
            {/* 主光轴 */}
            <line x1={40} y1={AXIS_Y} x2={1220} y2={AXIS_Y} stroke={LINE} strokeDasharray="6 5" />

            {/* 焦点标记 */}
            {[LENS_X - f * PX_PER_CM_X, LENS_X + f * PX_PER_CM_X].map((x, i) => (
              <g key={i}>
                <line x1={x} y1={AXIS_Y - 8} x2={x} y2={AXIS_Y + 8} stroke={STROKE} strokeWidth={2} />
                <text x={x} y={AXIS_Y + 26} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  {i === 0 ? "F" : "F′"}
                </text>
              </g>
            ))}

            {/* 凸透镜 */}
            <path
              d={`M ${LENS_X} ${AXIS_Y - 132} Q ${LENS_X + 30} ${AXIS_Y} ${LENS_X} ${AXIS_Y + 132} Q ${LENS_X - 30} ${AXIS_Y} ${LENS_X} ${AXIS_Y - 132} Z`}
              fill="rgba(255, 255, 255, 0.62)"
              stroke={STROKE}
              strokeWidth={2.5}
            />
            <line x1={LENS_X} y1={AXIS_Y - 132} x2={LENS_X} y2={AXIS_Y + 132} stroke={LINE} />

            {/* 光路 */}
            {rays && showRays && frame >= s2 ? (
              <g>
                {rays.paths.map((d, i) => (
                  <path key={`r${i}`} d={d} fill="none" stroke={RAY} strokeWidth={1.8} opacity={0.85} />
                ))}
                {rays.dashed.map((d, i) => (
                  <path key={`d${i}`} d={d} fill="none" stroke={RAY} strokeWidth={1.4} strokeDasharray="6 5" opacity={0.7} />
                ))}
              </g>
            ) : null}

            {/* 物体 */}
            <line x1={objX} y1={AXIS_Y} x2={objX} y2={objTipY} stroke={IMAGE_COLOR} strokeWidth={3} />
            <polygon
              points={`${objX - 7},${objTipY + 12} ${objX + 7},${objTipY + 12} ${objX},${objTipY - 2}`}
              fill={IMAGE_COLOR}
            />
            <text x={objX} y={objTipY - 10} fontSize={14} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.object}
            </text>

            {/* 实像（画在光屏上） */}
            {imageVisible && hasRealImage ? (
              <g opacity={0.35 + 0.65 * sharpness}>
                <line x1={screenX} y1={AXIS_Y} x2={screenX} y2={AXIS_Y + imgH} stroke={IMAGE_COLOR} strokeWidth={2.5} />
                <polygon
                  points={`${screenX - 6},${AXIS_Y + imgH - 10} ${screenX + 6},${AXIS_Y + imgH - 10} ${screenX},${AXIS_Y + imgH + 2}`}
                  fill={IMAGE_COLOR}
                />
              </g>
            ) : null}

            {/* 虚像（物侧，虚线） */}
            {imageVisible && !hasRealImage && !img.none ? (
              <g>
                <line
                  x1={imgX}
                  y1={AXIS_Y}
                  x2={imgX}
                  y2={AXIS_Y - imgH}
                  stroke={IMAGE_COLOR}
                  strokeWidth={2}
                  strokeDasharray="7 5"
                />
                <text x={imgX} y={AXIS_Y - imgH - 10} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
                  {L.virtualImage}
                </text>
              </g>
            ) : null}

            {/* 光屏 */}
            <rect x={screenX - 6} y={AXIS_Y - 150} width={12} height={300} fill="var(--bg-surface, #FFFFFF)" stroke={STROKE} strokeWidth={2} />
            <text x={screenX} y={AXIS_Y + 174} fontSize={13} fill="var(--text-secondary, #6B6862)" textAnchor="middle">
              {L.screen}
            </text>

            {/* 模糊提示圆斑 */}
            {imageVisible && sharpness < 0.85 ? (
              <ellipse cx={screenX} cy={AXIS_Y + imgH / 2} rx={10} ry={imgH / 2 + 6} fill={IMAGE_COLOR} opacity={0.12} />
            ) : null}
          </svg>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Panel title={L.readings}>
            <Reading label={L.focalLength} value={f.toFixed(1)} unit="cm" />
            <Reading label={L.objectDistance} value={u.toFixed(1)} unit="cm" />
            <Reading
              label={L.imageDistance}
              value={
                img.none
                  ? "—"
                  : Number.isFinite(img.imageDistance)
                    ? img.imageDistance.toFixed(1)
                    : L.infinite
              }
              unit={Number.isFinite(img.imageDistance) ? "cm" : undefined}
            />
            <Reading
              label={L.magnification}
              value={Number.isFinite(img.magnification) ? Math.abs(img.magnification).toFixed(2) : "—"}
              highlight={hasRealImage}
            />
            <Reading label={L.nature} value={CASE_TEXT[kind][zh ? "zh" : "en"]} />
            <Reading label={L.offset} value={offset.toFixed(1)} unit="cm" highlight={sharpness > 0.5} />
          </Panel>

          <Panel title={L.formula}>
            <div style={{ fontSize: 26, color: "var(--text-primary, #2B2A27)", fontFamily: "ui-monospace, Menlo, monospace" }}>
              1/f = 1/u + 1/v
            </div>
            <div style={{ fontSize: 15, color: "var(--text-secondary, #6B6862)", marginTop: 10, lineHeight: 1.6 }}>
              {zh
                ? `1/${f.toFixed(1)} = 1/${u.toFixed(1)} + 1/${Number.isFinite(img.imageDistance) ? img.imageDistance.toFixed(1) : "∞"}`
                : `1/${f.toFixed(1)} = 1/${u.toFixed(1)} + 1/${Number.isFinite(img.imageDistance) ? img.imageDistance.toFixed(1) : "∞"}`}
            </div>
            {img.none || (!hasRealImage && frame >= s3) ? (
              <div style={{ fontSize: 15, color: "var(--warn, #8A6D3B)", marginTop: 10 }}>{L.noImage}</div>
            ) : null}
            {hasRealImage && Math.abs(offset) > 1.5 ? (
              <div style={{ fontSize: 15, color: "var(--warn, #8A6D3B)", marginTop: 10 }}>{L.blur}</div>
            ) : null}
          </Panel>
        </div>
      </StageFrame>
      <SceneCaption scene={scenes[sceneIndex]} lang={locale} />
      {frame >= durationInFrames - DISCLAIMER_FRAMES ? <EndDisclaimer /> : null}
    </>
  );
};
