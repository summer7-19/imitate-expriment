import type { ExperimentContent } from "@physchem/experiment-schema";
import { sceneStarts } from "@physchem/experiment-schema";
import { useI18n } from "../i18n/I18nContext";
import { Card } from "./ui/Card";
import styles from "./StepTimeline.module.scss";

/**
 * 步骤时间线：当前步骤用 accent 竖条（2px）+ 文字加粗，
 * 已完成 ink-secondary，未开始 ink-muted；无彩色圆点、无勾选动画。点击跳帧。
 */
export function StepTimeline({
  content,
  frame,
  onSeek,
}: {
  content: ExperimentContent;
  frame: number;
  onSeek: (frame: number) => void;
}) {
  const { t, tf } = useI18n();
  const scenes = sceneStarts(content);
  let current = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= scenes[i].startFrame) current = i;
  }

  return (
    <Card title={t("timeline.title")}>
      <div>
        {scenes.map((scene, i) => {
          const isCurrent = i === current;
          const isDone = i < current;
          return (
            <button
              key={scene.index}
              type="button"
              onClick={() => onSeek(scene.startFrame)}
              className={`${styles.item} ${isCurrent ? styles.itemCurrent : ""}`}
            >
              <div className={`${styles.inner} ${isCurrent ? styles.innerCurrent : ""}`}>
                <div
                  className={`${styles.title} ${
                    isCurrent ? styles.titleCurrent : isDone ? styles.titleDone : ""
                  }`}
                >
                  {i + 1}. {scene.title}
                </div>
                <div className={styles.desc}>{scene.description}</div>
                {isCurrent ? (
                  <div className={styles.keyPoint}>
                    {tf("timeline.focus", { text: scene.keyPoint })}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
