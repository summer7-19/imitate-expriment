import type { PlayerRef } from "@remotion/player";
import type { ExperimentMeta } from "@physchem/experiment-schema";
import { useCallback, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorScenarioPanel } from "../components/ErrorScenarioPanel";
import { NormalRangePanel, ParameterPanel } from "../components/ParameterPanel";
import { PlayerViewer } from "../components/PlayerViewer";
import { QuizPanel } from "../components/QuizPanel";
import { StepTimeline } from "../components/StepTimeline";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Tag } from "../components/ui/Tag";
import { Tabs } from "../components/ui/Tabs";
import { useI18n } from "../i18n/I18nContext";
import { COMPOSITIONS } from "../remotion/registry";
import { useParamValues } from "../stores/params";
import styles from "./ExperimentDetailPage.module.scss";

export function ExperimentDetailPage() {
  const { id } = useParams();
  const { locale } = useI18n();
  const meta = COMPOSITIONS[id ?? ""]?.meta;

  if (!meta || !meta.locales.includes(locale)) {
    return <DetailNotFound />;
  }
  return <DetailLoaded meta={meta} locale={locale === "en-US" ? "en-US" : "zh-CN"} />;
}

function DetailNotFound() {
  const { t } = useI18n();
  return (
    <EmptyState>
      <p>{t("detail.notFound")}</p>
      <Link to="/" className={styles.back}>
        {t("detail.returnHome")}
      </Link>
    </EmptyState>
  );
}

function DetailLoaded({ meta, locale }: { meta: ExperimentMeta; locale: "zh-CN" | "en-US" }) {
  const { t } = useI18n();
  const entry = COMPOSITIONS[meta.compositionId];
  const content = entry.getContent(locale);
  const playerRef = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const onFrame = useCallback((f: number) => setFrame(f), []);
  const values = useParamValues(content);

  return (
    <div>
      <div className={styles.headerBlock}>
        <Link to="/" className={styles.back}>
          {t("detail.back")}
        </Link>
        <div className={styles.titleRow}>
          <h1>{content.title}</h1>
          <Tag>{t(`category.${meta.category}`)}</Tag>
          <Tag>{t(`difficulty.${meta.difficulty}`)}</Tag>
          <Tag>{meta.durationInSeconds}s</Tag>
        </div>
        <p className={styles.subtitle}>{content.subtitle}</p>
        <div className={styles.modeRow}>
          <Tabs
            ariaLabel={t("mode.animation")}
            tabs={[
              { value: "animation", label: t("mode.animation") },
              ...(meta.modes.includes("virtual-ops")
                ? [{ value: "virtual" as const, label: t("mode.virtual-ops") }]
                : []),
            ]}
            active="animation"
            onChange={(v) => {
              if (v === "virtual") window.location.assign(`/experiment/${meta.id}/virtual`);
            }}
          />
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.left}>
          <PlayerViewer
            entry={entry}
            locale={locale}
            params={values}
            playerRef={playerRef}
            onFrame={onFrame}
          />
          <StepTimeline
            content={content}
            frame={frame}
            onSeek={(f) => playerRef.current?.seekTo(f)}
          />
        </div>
        <aside className={styles.aside}>
          <ParameterPanel content={content} />
          <NormalRangePanel content={content} values={values} />
          <ErrorScenarioPanel content={content} />
        </aside>
      </div>

      <div className={styles.links}>
        <Link to={`/experiment/${meta.id}/quiz`} className={styles.back}>
          {t("quiz.go")} →
        </Link>
        <Link to={`/experiment/${meta.id}/report`} className={styles.back}>
          {t("report.link")} →
        </Link>
      </div>

      <div className={styles.infoGrid}>
        <Card title={t("principle.title")}>
          <p className={styles.principle}>{content.principle}</p>
        </Card>
        <Card title={t("equipment.title")}>
          <ul className={styles.list}>
            {content.equipment.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t("safety.title")}>
          <ul className={styles.list}>
            {content.safetyNotes.map((note) => (
              <li key={note} className={`${styles.listItem} ${styles.listItemWarn}`}>
                {note}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <QuizPanel content={content} />
    </div>
  );
}
