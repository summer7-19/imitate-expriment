import type { ActionDef } from "@physchem/experiment-schema";
import styles from "../pages/VirtualOpsPage.module.scss";

/**
 * 可用操作条：按 ActionDef[] 生成；click 类为按钮，input 类渲染为参数滑块，
 * 调整即记录该操作（paramMapping 关联参数）。当前可操作项加 border-accent。
 */
export function ActionBar({
  actions,
  currentActionId,
  params,
  onAction,
  onParamChange,
  measureField,
  measureValue,
  onMeasureChange,
  disabled,
}: {
  actions: ActionDef[];
  currentActionId?: string;
  params: Record<string, number | string | boolean>;
  onAction: (actionId: string) => void;
  onParamChange: (paramId: string, value: number) => void;
  /** record 类操作需要的测量读数输入框 */
  measureField?: { paramKey: string; label: string };
  measureValue: string;
  onMeasureChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.actions}>
      {actions.map((action) => {
        const isCurrent = action.id === currentActionId;
        if (action.type === "input" && action.paramMapping) {
          const def = action;
          const value = Number(params[def.paramMapping as string] ?? 0);
          const meta = def.label.split("|"); // label 约定 "标签|min|max|step|unit"
          const [label, min, max, step] = meta;
          return (
            <div key={action.id} className={`${styles.paramGroup} ${isCurrent ? styles.actionBtnCurrent : ""}`}>
              <span className={styles.paramLabel}>{label}</span>
              <input
                type="range"
                aria-label={label}
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => {
                  onParamChange(def.paramMapping as string, Number(e.target.value));
                  onAction(action.id);
                }}
                className={styles.paramSlider}
              />
              <span className={styles.paramLabel}>
                {value} {meta[4] ?? ""}
              </span>
            </div>
          );
        }
        return (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action.id)}
            className={`${styles.actionBtn} ${isCurrent ? styles.actionBtnCurrent : ""}`}
          >
            {action.label}
          </button>
        );
      })}
      {measureField ? (
        <label className={styles.paramGroup}>
          <span className={styles.paramLabel}>{measureField.label}</span>
          <input
            type="number"
            value={measureValue}
            onChange={(e) => onMeasureChange(e.target.value)}
            className={styles.measureInput}
            aria-label={measureField.label}
          />
        </label>
      ) : null}
    </div>
  );
}

/** 检查点/操作反馈条：文字 + 细边框提示，不用弹窗 */
export function CheckpointFeedback({
  text,
  kind,
}: {
  text: string;
  kind: "info" | "ok" | "err";
}) {
  return (
    <div
      className={`${styles.feedback} ${kind === "ok" ? styles.feedbackOk : kind === "err" ? styles.feedbackErr : ""}`}
      role="status"
    >
      {text}
    </div>
  );
}
