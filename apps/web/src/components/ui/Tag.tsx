import type { ReactNode } from "react";
import styles from "./Tag.module.scss";

/** 文字 + 底色块标签，不用彩色胶囊 */
export function Tag({ children }: { children: ReactNode }) {
  return <span className={styles.tag}>{children}</span>;
}
