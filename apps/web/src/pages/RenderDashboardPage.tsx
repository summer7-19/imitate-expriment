import type { RenderJobStatus } from "@physchem/experiment-schema";
import { useEffect, useState } from "react";
import { Button, } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { useI18n } from "../i18n/I18nContext";
import { fetchExperiments, type ExperimentBundle } from "../lib/api";
import { useJobsStore } from "../stores/jobs";
import styles from "./RenderDashboardPage.module.scss";

const STATUS_KEY: Record<RenderJobStatus, "render.queued" | "render.rendering" | "render.completed" | "render.failed"> = {
  queued: "render.queued",
  rendering: "render.rendering",
  completed: "render.completed",
  failed: "render.failed",
};

const STATUS_CLASS: Record<RenderJobStatus, string> = {
  queued: styles.statusQueued,
  rendering: styles.statusRendering,
  completed: styles.statusCompleted,
  failed: styles.statusFailed,
};

export function RenderDashboardPage() {
  const { t, tf, locale } = useI18n();
  const jobs = useJobsStore((s) => s.jobs);
  const error = useJobsStore((s) => s.error);
  const refresh = useJobsStore((s) => s.refresh);
  const submit = useJobsStore((s) => s.submit);
  const submitMany = useJobsStore((s) => s.submitMany);
  const remove = useJobsStore((s) => s.remove);
  const [bundles, setBundles] = useState<ExperimentBundle[]>([]);
  const [experimentId, setExperimentId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 2000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    fetchExperiments(locale)
      .then((list) => {
        setBundles(list);
        if (list.length > 0) setExperimentId((prev) => prev || list[0].meta.id);
      })
      .catch(() => undefined);
  }, [locale]);

  const onCreate = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await submit(experimentId, locale, {});
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const onBatch = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await submitMany(bundles.map((b) => ({ experimentId: b.meta.id, locale })));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    setActionError(null);
    try {
      await remove(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("render.deleteFailed"));
    }
  };

  return (
    <div className={styles.page}>
      <h1>{t("render.title")}</h1>
      <Card title={t("render.new")}>
        <div className={styles.formRow}>
          <label htmlFor="render-experiment" className={styles.label}>
            {t("render.select")}
          </label>
          <select
            id="render-experiment"
            value={experimentId}
            onChange={(e) => setExperimentId(e.target.value)}
            className={styles.select}
          >
            {bundles.map((b) => (
              <option key={b.meta.id} value={b.meta.id}>
                {b.content.title}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={onCreate} disabled={submitting || !experimentId}>
            {t("render.create")}
          </Button>
          <Button variant="secondary" onClick={onBatch} disabled={submitting || bundles.length === 0}>
            {t("render.createBatch")}
          </Button>
        </div>
        <p className={styles.hint}>{t("render.usingDefaults")}</p>
      </Card>

      {error || actionError ? (
        <p className={styles.errorText}>{error ?? actionError}</p>
      ) : null}

      <Card title={tf("render.list", { n: jobs.length })}>
        {jobs.length === 0 ? (
          <EmptyState>{t("render.empty")}</EmptyState>
        ) : (
          <ul className={styles.list}>
            {jobs.map((job) => {
              const bundle = bundles.find((b) => b.meta.id === job.experimentId);
              return (
                <li key={job.id} className={styles.job}>
                  <div className={styles.jobHead}>
                    <span className={styles.jobTitle}>{bundle?.content.title ?? job.experimentId}</span>
                    <span className={`${styles.status} ${STATUS_CLASS[job.status]}`}>
                      {t(STATUS_KEY[job.status])}
                    </span>
                    <span className={styles.jobTime}>
                      {new Date(job.createdAt).toLocaleString(locale)}
                    </span>
                  </div>
                  {job.status === "rendering" || job.status === "queued" ? (
                    <div className={styles.track}>
                      <div
                        className={styles.fill}
                        style={{ width: `${Math.round(job.progress * 100)}%` }}
                      />
                    </div>
                  ) : null}
                  <div className={styles.jobMeta}>
                    <span className={styles.jobId}>#{job.id.slice(0, 8)}</span>
                    <span className={styles.progress}>{tf("render.progress", { n: Math.round(job.progress * 100) })}</span>
                    {job.videoUrl ? (
                      <a href={job.videoUrl} download className={styles.download}>
                        {t("render.download")}
                      </a>
                    ) : null}
                    {job.status !== "rendering" ? (
                      <button type="button" onClick={() => void onDelete(job.id)} className={styles.clear}>
                        {t("render.clear")}
                      </button>
                    ) : null}
                  </div>
                  {job.error ? <p className={styles.errorText}>{job.error}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
