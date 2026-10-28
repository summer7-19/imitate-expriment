import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QuizPanel } from "../components/QuizPanel";
import { EmptyState } from "../components/ui/EmptyState";
import { useI18n } from "../i18n/I18nContext";
import { fetchExperiment, type ExperimentBundle } from "../lib/api";
import styles from "./ExperimentDetailPage.module.scss";

export function QuizPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const [bundle, setBundle] = useState<ExperimentBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchExperiment(id, locale)
      .then((b) => {
        if (!cancelled) setBundle(b);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t("common.error"));
      });
    return () => {
      cancelled = true;
    };
  }, [id, locale, t]);

  if (error) return <EmptyState>{error}</EmptyState>;
  if (!bundle) return <EmptyState>{t("common.loading")}</EmptyState>;

  return (
    <div>
      <Link to={`/experiment/${id}`} className={styles.back}>
        {t("report.back")}
      </Link>
      <h1 className={styles.pageTitle}>
        {t("quiz.title")} · {bundle.content.title}
      </h1>
      <div className={styles.sectionGap}>
        <QuizPanel content={bundle.content} />
      </div>
    </div>
  );
}
