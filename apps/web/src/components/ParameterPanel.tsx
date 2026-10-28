import type { ExperimentContent, ParamValues } from "@physchem/experiment-schema";
import {
  evaluateNormalRanges,
  formatParamValue,
} from "@physchem/experiment-schema";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { useJobsStore } from "../stores/jobs";
import { useParamsStore, useParamValues } from "../stores/params";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Select } from "./ui/Select";
import { Slider } from "./ui/Slider";
import { Toggle } from "./ui/Toggle";
import styles from "./panels.module.scss";

/** 参数面板：动态渲染 ParameterDef[]，onChange 更新 Zustand */
export function ParameterPanel({ content }: { content: ExperimentContent }) {
  const { t } = useI18n();
  const values = useParamValues(content);
  const setValue = useParamsStore((s) => s.setValue);
  const reset = useParamsStore((s) => s.reset);
  const submit = useJobsStore((s) => s.submit);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRender = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submit(content.experimentId, content.locale === "en-US" ? "en-US" : "zh-CN", values);
      navigate("/render");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title={t("params.title")}>
      <div className={styles.rows}>
        {content.parameters.map((def) => {
          const value = values[def.id];
          return (
            <div key={def.id} className={styles.row}>
              <span className={styles.label}>{def.label}</span>
              {def.kind === "slider" ? (
                <div className={styles.controlBox}>
                  <Slider
                    min={def.min}
                    max={def.max}
                    step={def.step}
                    value={typeof value === "number" ? value : def.defaultValue}
                    onChange={(v) => setValue(content.experimentId, def.id, v)}
                    ariaLabel={def.label}
                  />
                  <span className={styles.readout}>
                    {formatParamValue(def, typeof value === "number" ? value : def.defaultValue)}
                    <span className={styles.unit}>{def.unit}</span>
                  </span>
                </div>
              ) : def.kind === "select" ? (
                <Select
                  value={String(value)}
                  onChange={(v) => setValue(content.experimentId, def.id, v)}
                  options={def.options}
                  ariaLabel={def.label}
                />
              ) : (
                <Toggle
                  checked={value === true}
                  onChange={(v) => setValue(content.experimentId, def.id, v)}
                  ariaLabel={def.label}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <Button variant="primary" onClick={submitRender} disabled={submitting}>
          {submitting ? t("params.exporting") : t("params.export")}
        </Button>
        <Button variant="secondary" onClick={() => reset(content.experimentId)}>
          {t("params.reset")}
        </Button>
      </div>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </Card>
  );
}

/** 正常范围判定：状态用文字 + 颜色共同表达，必须展示"教学简化"说明 */
export function NormalRangePanel({
  content,
  values,
}: {
  content: ExperimentContent;
  values: ParamValues;
}) {
  const { t } = useI18n();
  if (content.normalRanges.length === 0) return null;
  const checks = evaluateNormalRanges(content, values);
  return (
    <Card title={t("normalRange.title")}>
      {checks.map(({ range, value, ok }) => (
        <div key={range.parameterId} className={styles.rangeRow}>
          <div className={styles.rangeHead}>
            <span className={styles.label}>{range.label}</span>
            <span className={ok ? styles.ok : styles.warn}>
              {ok ? t("normalRange.ok") : t("normalRange.off")}
            </span>
          </div>
          <div className={styles.rangeValue}>
            {t("normalRange.current")} {String(value)} · {t("normalRange.interval")}{" "}
            {range.min} – {range.max}
          </div>
          <div className={styles.rangeNote}>{range.note}</div>
        </div>
      ))}
    </Card>
  );
}
