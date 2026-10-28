import katex from "katex";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { DataTable } from "../components/ui/Tabs";
import { EmptyState } from "../components/ui/EmptyState";
import { useI18n } from "../i18n/I18nContext";
import {
  createReport,
  fetchExperiment,
  reportExportUrl,
  type ExperimentBundle,
} from "../lib/api";
import { useParamValues } from "../stores/params";
import type { ExperimentContent, ExperimentReport } from "@physchem/experiment-schema";
import styles from "./ReportPage.module.scss";

function KaTeX({ formula }: { formula: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, { throwOnError: false, displayMode: false });
    } catch {
      return formula;
    }
  }, [formula]);
  return <span className={styles.katexInline} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ReportPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const [bundle, setBundle] = useState<ExperimentBundle | null>(null);
  const [report, setReport] = useState<ExperimentReport | null>(null);
  const [generating, setGenerating] = useState(false);
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

  const generate = async (content: ExperimentContent, parameters: Record<string, number | string | boolean>) => {
    setGenerating(true);
    setError(null);
    try {
      const r = await createReport({ experimentId: content.experimentId, locale, parameters });
      setReport(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setGenerating(false);
    }
  };

  if (error && !bundle) return <EmptyState>{error}</EmptyState>;
  if (!bundle) return <EmptyState>{t("common.loading")}</EmptyState>;

  return <ReportView bundle={bundle} report={report} generating={generating} error={error} onGenerate={generate} />;
}

function ReportView({
  bundle,
  report,
  generating,
  error,
  onGenerate,
}: {
  bundle: ExperimentBundle;
  report: ExperimentReport | null;
  generating: boolean;
  error: string | null;
  onGenerate: (content: ExperimentContent, parameters: Record<string, number | string | boolean>) => void;
}) {
  const { t } = useI18n();
  const content = bundle.content;
  const storedValues = useParamValues(content);

  const columns = report && report.measurements.length > 0
    ? [
        { key: "index", label: t("report.row"), numeric: true },
        ...Object.keys(report.measurements[0].values).map((key) => ({
          key,
          label: `${key} (${report.measurements[0].unit[key] ?? ""})`,
          numeric: true,
        })),
      ]
    : [];

  return (
    <div className={styles.page}>
      <Link to={`/experiment/${content.experimentId}`} className={styles.body}>
        {t("report.back")}
      </Link>
      <div className={styles.formRow}>
        <h1>
          {t("report.title")} · {content.title}
        </h1>
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={() => void onGenerate(content, storedValues)}
            disabled={generating}
          >
            {generating ? t("report.generating") : report ? t("report.new") : t("report.generate")}
          </Button>
          {report ? (
            <a href={reportExportUrl(report.id)} className={styles.exportLink} download>
              <Button variant="secondary">{t("report.exportMd")}</Button>
            </a>
          ) : null}
        </div>
      </div>
      <p className={styles.body}>{t("report.needsVisit")}</p>
      {error ? <p className={styles.warning}>{error}</p> : null}

      {report ? (
        <>
          <Card title={t("report.params")}>
            <div className={styles.paramRow}>
              {Object.entries(report.parameters).map(([key, value]) => (
                <span key={key} className={styles.paramChip}>
                  {key} = {String(value)}
                </span>
              ))}
            </div>
          </Card>

          <Card title={t("report.measurements")}>
            {report.measurements.length > 0 ? (
              <DataTable columns={columns} rows={report.measurements.map((row) => ({ index: row.index, ...row.values }))} />
            ) : (
              <p className={styles.body}>—</p>
            )}
          </Card>

          <Card title={t("report.calc")}>
            {report.calculations.map((step, i) => (
              <div key={i} className={styles.calcRow}>
                <span className={styles.calcLabel}>{step.label}</span>
                <KaTeX formula={step.formula} />
                <span className={styles.calcResult}>
                  = {step.result} {step.unit}
                </span>
              </div>
            ))}
          </Card>

          <Card title={t("report.analysis")}>
            <p className={styles.analysis}>{report.errorAnalysis}</p>
            {report.warnings.map((w) => (
              <p key={w} className={styles.warning}>
                {w}
              </p>
            ))}
          </Card>

          <Card title={t("report.conclusion")}>
            <p className={styles.analysis}>{report.conclusion}</p>
          </Card>

          <p className={styles.disclaimer}>{t("report.disclaimer")}</p>
        </>
      ) : null}
    </div>
  );
}
