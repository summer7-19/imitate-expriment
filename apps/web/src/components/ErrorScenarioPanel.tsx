import type { ExperimentContent } from "@physchem/experiment-schema";
import { useI18n } from "../i18n/I18nContext";
import { useParamsStore, useParamValues } from "../stores/params";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import styles from "./panels.module.scss";

/** 错误操作场景演示：点击后把触发参数设为触发值，撤销则恢复原值 */
export function ErrorScenarioPanel({ content }: { content: ExperimentContent }) {
  const { t } = useI18n();
  const values = useParamValues(content);
  const applyScenario = useParamsStore((s) => s.applyScenario);
  const undoScenario = useParamsStore((s) => s.undoScenario);
  const backup = useParamsStore((s) => s.scenarioBackup);

  if (content.errorScenarios.length === 0) return null;

  return (
    <Card title={t("errors.title")}>
      <div>
        {content.errorScenarios.map((scenario) => {
          const active = values[scenario.triggerParam] === scenario.triggerValue;
          const canUndo = Boolean(backup[scenario.id]);
          return (
            <div key={scenario.id} className={styles.rangeRow}>
              <div className={styles.rangeHead}>
                <span className={styles.label}>{scenario.label}</span>
                {active ? (
                  <Button
                    variant="secondary"
                    onClick={() => undoScenario(scenario.id)}
                    disabled={!canUndo}
                  >
                    {t("errors.undo")}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      applyScenario(
                        content.experimentId,
                        scenario.id,
                        scenario.triggerParam,
                        scenario.triggerValue,
                        values[scenario.triggerParam],
                      )
                    }
                  >
                    {t("errors.demo")}
                  </Button>
                )}
              </div>
              {active ? (
                <div className={styles.scenarioActive}>
                  <div className={styles.scenarioText}>{scenario.consequence}</div>
                  <div className={styles.rangeNote}>
                    {t("errors.visual")}：{scenario.visualCue}
                  </div>
                </div>
              ) : (
                <div className={styles.rangeNote}>{scenario.consequence}</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
