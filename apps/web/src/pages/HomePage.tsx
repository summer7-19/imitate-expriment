import type { ExperimentCategory } from "@physchem/experiment-schema";
import { useEffect, useMemo, useState } from "react";
import { ExperimentCard } from "../components/ExperimentCard";
import { EmptyState } from "../components/ui/EmptyState";
import { useI18n } from "../i18n/I18nContext";
import { fetchExperiments, type ExperimentBundle } from "../lib/api";
import styles from "./HomePage.module.scss";

type CategoryFilter = "all" | ExperimentCategory;

const FILTERS: { value: CategoryFilter }[] = [
  { value: "all" },
  { value: "junior-physics" },
  { value: "junior-chemistry" },
  { value: "senior-physics" },
  { value: "senior-chemistry" },
  { value: "physical-chemistry" },
];

export function HomePage() {
  const { t, locale, tf } = useI18n();
  const [bundles, setBundles] = useState<ExperimentBundle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setBundles(null);
    setError(null);
    fetchExperiments(locale)
      .then((list) => {
        if (!cancelled) setBundles(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t("common.error"));
      });
    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  const filtered = useMemo(() => {
    if (!bundles) return [];
    const q = query.trim().toLowerCase();
    return bundles.filter(({ meta, content }) => {
      if (category !== "all" && meta.category !== category) return false;
      if (!q) return true;
      return (
        content.title.toLowerCase().includes(q) ||
        content.subtitle.toLowerCase().includes(q) ||
        meta.id.includes(q)
      );
    });
  }, [bundles, category, query]);

  return (
    <div>
      <div className={styles.head}>
        <h1>{t("home.title")}</h1>
        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="category filter">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setCategory(f.value)}
                aria-pressed={category === f.value}
                className={`${styles.filterBtn} ${category === f.value ? styles.filterBtnActive : ""}`}
              >
                {f.value === "all" ? t("filter.all") : t(`category.${f.value}`)}
              </button>
            ))}
          </div>
          <div className={styles.searchField}>
            <svg
              className={styles.searchIcon}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.label")}
              className={styles.search}
            />
          </div>
        </div>
      </div>

      {error ? (
        <EmptyState>
          {t("common.serverOffline")} · {error}
        </EmptyState>
      ) : bundles === null ? (
        <EmptyState>{t("common.loading")}</EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>{t("home.empty")}</EmptyState>
      ) : (
        <div className={styles.grid}>
          {filtered.map((bundle) => (
            <ExperimentCard key={bundle.meta.id} meta={bundle.meta} content={bundle.content} />
          ))}
        </div>
      )}

      <p className={styles.note}>
        {tf("home.count", { n: filtered.length })} · {t("home.disclaimer")}
      </p>
    </div>
  );
}
