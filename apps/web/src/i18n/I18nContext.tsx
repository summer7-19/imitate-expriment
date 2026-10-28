import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@physchem/experiment-schema";
import { UI_STRINGS, type UIStringKey } from "./strings";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** 取 UI 字符串；缺 key 时回退 zh-CN */
  t: (key: UIStringKey) => string;
  /** 带占位符格式化：t 的返回值中 {n} {text} 等会被替换 */
  tf: (key: UIStringKey, vars: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = "physchem.locale";

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === "zh-CN" || saved === "en-US") return saved;
    if (navigator.language.startsWith("en")) return "en-US";
  } catch {
    // 忽略存储异常
  }
  return "zh-CN";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // 忽略存储异常
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = () => UI_STRINGS[locale === "en-US" ? "en-US" : "zh-CN"];
    const t = (key: UIStringKey) => dict()[key] ?? UI_STRINGS["zh-CN"][key] ?? key;
    const tf = (key: UIStringKey, vars: Record<string, string | number>) => {
      let out = t(key);
      for (const [k, v] of Object.entries(vars)) {
        out = out.split(`{${k}}`).join(String(v));
      }
      return out;
    };
    return { locale, setLocale, t, tf };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n 必须在 LocaleProvider 内使用");
  return ctx;
}
