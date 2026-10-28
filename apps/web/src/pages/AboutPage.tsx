import { Card } from "../components/ui/Card";
import { useI18n } from "../i18n/I18nContext";
import type { UIStringKey } from "../i18n/strings";
import styles from "./AboutPage.module.scss";

const STACK: { labelKey: UIStringKey; valueKey: UIStringKey }[] = [
  { labelKey: "about.stack.frontend", valueKey: "about.stack.frontendValue" },
  { labelKey: "about.stack.render", valueKey: "about.stack.renderValue" },
  { labelKey: "about.stack.server", valueKey: "about.stack.serverValue" },
  { labelKey: "about.stack.db", valueKey: "about.stack.dbValue" },
  { labelKey: "about.stack.shared", valueKey: "about.stack.sharedValue" },
  { labelKey: "about.stack.state", valueKey: "about.stack.stateValue" },
  { labelKey: "about.stack.style", valueKey: "about.stack.styleValue" },
  { labelKey: "about.stack.i18n", valueKey: "about.stack.i18nValue" },
];

export function AboutPage() {
  const { t } = useI18n();
  return (
    <div className={styles.page}>
      <h1>{t("about.title")}</h1>

      <Card title={t("about.whatTitle")}>
        <p className={styles.body}>{t("about.what")}</p>
      </Card>

      <Card title={t("about.disclaimerTitle")}>
        <div className={styles.quote}>
          <p className={styles.body}>{t("about.disclaimer")}</p>
        </div>
      </Card>

      <Card title={t("about.stackTitle")}>
        <dl className={styles.stack}>
          {STACK.map((row) => (
            <div key={row.labelKey} className={styles.stackRow}>
              <dt className={styles.stackTerm}>{t(row.labelKey)}</dt>
              <dd className={styles.stackDesc}>{t(row.valueKey)}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title={t("about.runTitle")}>
        <ol className={styles.steps}>
          {t("about.runSteps")
            .split("|")
            .map((step) => (
              <li key={step}>{step}</li>
            ))}
        </ol>
      </Card>
    </div>
  );
}
