import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dangerText";

export function Button({
  variant = "secondary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...rest}
      className={`${styles.button} ${styles[variant]} ${className}`}
    />
  );
}
