import type { ExperimentContent, QuizQuestion } from "@physchem/experiment-schema";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Card } from "./ui/Card";
import styles from "./QuizPanel.module.scss";

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

/** 测验面板：单选/多选；正确/错误反馈只用文字 + 左侧 2px 色条，不用整块绿/红背景 */
export function QuizPanel({ content }: { content: ExperimentContent }) {
  const { t } = useI18n();
  /** qid -> 已选选项 id 列表 */
  const [chosen, setChosen] = useState<Record<string, string[]>>({});

  const pick = (question: QuizQuestion, optionId: string) => {
    setChosen((prev) => {
      const current = prev[question.id] ?? [];
      if (question.type === "single") {
        return { ...prev, [question.id]: [optionId] };
      }
      return {
        ...prev,
        [question.id]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      };
    });
  };

  if (content.quiz.length === 0) return null;

  return (
    <Card title={t("quiz.title")}>
      {content.quiz.map((question, qi) => {
        const picked = chosen[question.id] ?? [];
        const answered = picked.length > 0;
        const correct = sameSet(picked, question.correctOptionIds);
        return (
          <div key={question.id} className={styles.question}>
            <div className={styles.stem}>
              {qi + 1}. {question.stem}
              {question.type === "multi" ? (
                <span className={styles.multiHint}> {t("quiz.multiHint")}</span>
              ) : null}
            </div>
            {question.options.map((option) => {
              const isPicked = picked.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={answered && question.type === "single"}
                  onClick={() => pick(question, option.id)}
                  className={`${styles.option} ${isPicked ? styles.optionPicked : ""}`}
                >
                  {option.text}
                </button>
              );
            })}
            {answered ? (
              <div
                className={`${styles.feedback} ${correct ? styles.feedbackOk : styles.feedbackErr}`}
              >
                <div className={`${styles.verdict} ${correct ? styles.verdictOk : styles.verdictErr}`}>
                  {correct ? t("quiz.correct") : t("quiz.wrong")}
                </div>
                <div className={styles.explanation}>{question.explanation}</div>
              </div>
            ) : null}
          </div>
        );
      })}
    </Card>
  );
}
