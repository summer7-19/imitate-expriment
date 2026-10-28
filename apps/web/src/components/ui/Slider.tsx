import styles from "./form.module.scss";

/** 滑块：轨道 bg-subtle，已填充 accent，把手白底 + 1px 边框。参数面板与播放器进度条共用 */
export function Slider({
  min,
  max,
  step,
  value,
  onChange,
  ariaLabel,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className={styles.wrapper}>
      <div className={styles.track} />
      <div className={styles.fill} style={{ width: `${pct}%` }} />
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.input}
      />
    </div>
  );
}
