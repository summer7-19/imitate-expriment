import styles from "./parts.module.scss";

/** 下划线式 Tabs（规范 7.3） */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`${styles.tab} ${active === tab.value ? styles.tabActive : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** 数据表：表头底色 + 1px 边框，数值列 tabular-nums */
export function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; numeric?: boolean }[];
  rows: Record<string, string | number>[];
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} scope="col">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key} className={col.numeric ? styles.num : undefined}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
