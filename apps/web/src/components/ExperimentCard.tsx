import { Thumbnail } from "@remotion/player";
import type { ExperimentContent, ExperimentMeta, Locale } from "@physchem/experiment-schema";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { COMPOSITIONS } from "../remotion/registry";
import { Tag } from "./ui/Tag";
import styles from "./ExperimentCard.module.scss";

/** 卡片缩略图取每个实验最有代表性的一帧（颜色变化 / 条纹 / 曲线） */
const REPRESENTATIVE_FRAME: Record<string, number> = {
  "acid-base-titration": 950,
  "youngs-double-slit": 960,
  "conductometric-titration": 1180,
  "photoelectric-effect": 1120,
  "freezing-point-depression": 1150,
  spectrophotometry: 1150,
};

/**
 * 缩略图懒加载：Thumbnail 是真实的 Remotion 渲染实例，6 张卡片全部挂载内存压力过大，
 * 进入视口后才真正挂载。
 */
function LazyThumb({
  meta,
  locale,
}: {
  meta: ExperimentMeta;
  locale: Locale;
}) {
  const entry = COMPOSITIONS[meta.compositionId];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={styles.thumbInner}>
      {visible ? (
        <Thumbnail
          component={entry.component}
          compositionWidth={entry.width}
          compositionHeight={entry.height}
          durationInFrames={entry.durationInFrames}
          fps={entry.fps}
          frameToDisplay={REPRESENTATIVE_FRAME[meta.id] ?? 0}
          inputProps={
            {
              lang: locale === "en-US" ? "en-US" : "zh-CN",
              params: entry.defaultParams,
            } as { lang: Locale; params: typeof entry.defaultParams }
          }
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
}

export function ExperimentCard({
  meta,
  content,
}: {
  meta: ExperimentMeta;
  content: ExperimentContent;
}) {
  const { t } = useI18n();
  return (
    <Link to={`/experiment/${meta.id}`} className={styles.card}>
      <div className={styles.thumb}>
        <LazyThumb meta={meta} locale={content.locale === "en-US" ? "en-US" : "zh-CN"} />
        <span className={styles.badge}>示意</span>
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{content.title}</h3>
          <Tag>{t(`category.${meta.category}`)}</Tag>
        </div>
        <p className={styles.subtitle}>{content.subtitle}</p>
        <div className={styles.meta}>
          <span>{t(`difficulty.${meta.difficulty}`)}</span>
          <span>·</span>
          <span>{meta.durationInSeconds}s</span>
          <span>·</span>
          <span>
            {t("card.animation")}
            {meta.modes.includes("virtual-ops")
              ? ` + ${t("card.virtualOps")}`
              : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
