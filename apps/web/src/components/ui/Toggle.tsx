import styles from "./form.module.scss";

/** 开关：无位移动画（UI 过渡只用颜色过渡 0.15s） */
export function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
    >
      <span className={`${styles.knob} ${checked ? styles.knobOn : ""}`} />
    </button>
  );
}
