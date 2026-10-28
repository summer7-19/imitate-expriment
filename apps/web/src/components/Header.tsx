import { Link, NavLink } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import type { UIStringKey } from "../i18n/strings";
import styles from "./layout.module.scss";

const NAV: { to: string; key: UIStringKey; end: boolean }[] = [
  { to: "/", key: "nav.home", end: true },
  { to: "/render", key: "nav.render", end: false },
  { to: "/about", key: "nav.about", end: false },
];

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.brand}>
          PHYSCHEM LAB
        </Link>
        <nav className={styles.nav} aria-label="main navigation">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <span className={styles.tagline}>{t("header.tagline")}</span>
        <select
          aria-label={t("common.locale")}
          value={locale}
          onChange={(e) => setLocale(e.target.value as "zh-CN" | "en-US")}
          className={styles.langSelect}
        >
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
    </header>
  );
}
