import { integer,primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const experiments = sqliteTable("experiments", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  difficulty: integer("difficulty").notNull(),
  modes: text("modes").notNull(), // JSON: ExperimentMode[]
  compositionId: text("composition_id").notNull(),
  durationInSeconds: real("duration_in_seconds").notNull(),
  locales: text("locales").notNull(), // JSON: Locale[]
});

export const experimentContents = sqliteTable(
  "experiment_contents",
  {
    experimentId: text("experiment_id").notNull(),
    locale: text("locale").notNull(),
    content: text("content").notNull(), // JSON: ExperimentContent
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.experimentId, t.locale] }) }),
);

/** 含答案的虚拟操作定义；API 只下发 availableActions 投影 */
export const virtualOps = sqliteTable("virtual_ops", {
  experimentId: text("experiment_id").primaryKey(),
  definition: text("definition").notNull(), // JSON: VirtualOperation
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  experimentId: text("experiment_id").notNull(),
  sessionId: text("session_id").notNull(),
  locale: text("locale").notNull(),
  createdAt: text("created_at").notNull(),
  payload: text("payload").notNull(), // JSON: ExperimentReport
});

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey(),
  experimentId: text("experiment_id").notNull(),
  locale: text("locale").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  createdAt: text("created_at").notNull(),
});

export const renderJobs = sqliteTable("render_jobs", {
  id: text("id").primaryKey(),
  experimentId: text("experiment_id").notNull(),
  compositionId: text("composition_id").notNull(),
  status: text("status").notNull(), // queued | rendering | completed | failed
  progress: real("progress").notNull().default(0),
  inputProps: text("input_props").notNull(), // JSON: { locale, params }
  frames: integer("frames"),
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  error: text("error"),
});
