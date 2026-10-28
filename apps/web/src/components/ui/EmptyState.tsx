import type { ReactNode } from "react";
import styles from "./parts.module.scss";

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}
