import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import {
  EXPERIMENT_METAS,
  SUPPORTED_LOCALES,
  getExperimentContent,
} from "@physchem/experiment-data";
import type { VirtualOperation } from "@physchem/experiment-schema";
import { DATA_DIR, DB_FILE } from "../paths";
import { VIRTUAL_OPS } from "../data/virtual-ops";
import * as schema from "./schema";

mkdirSync(DATA_DIR, { recursive: true });
const sqlite = new Database(DB_FILE);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

migrate();
seed();

function migrate(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      modes TEXT NOT NULL,
      composition_id TEXT NOT NULL,
      duration_in_seconds REAL NOT NULL,
      locales TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS experiment_contents (
      experiment_id TEXT NOT NULL,
      locale TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (experiment_id, locale)
    );
    CREATE TABLE IF NOT EXISTS virtual_ops (
      experiment_id TEXT PRIMARY KEY,
      definition TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      locale TEXT NOT NULL,
      created_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      locale TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS render_jobs (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      composition_id TEXT NOT NULL,
      status TEXT NOT NULL,
      progress REAL NOT NULL DEFAULT 0,
      input_props TEXT NOT NULL,
      frames INTEGER,
      created_at TEXT NOT NULL,
      started_at TEXT,
      finished_at TEXT,
      error TEXT
    );
  `);
}

/** 种子：实验元数据/内容从 TS 数据源幂等写入；虚拟操作答案只存服务端 DB */
function seed(): void {
  const now = new Date().toISOString();

  for (const meta of EXPERIMENT_METAS) {
    db.insert(schema.experiments)
      .values({
        id: meta.id,
        category: meta.category,
        difficulty: meta.difficulty,
        modes: JSON.stringify(meta.modes),
        compositionId: meta.compositionId,
        durationInSeconds: meta.durationInSeconds,
        locales: JSON.stringify(meta.locales),
      })
      .onConflictDoUpdate({
        target: schema.experiments.id,
        set: {
          category: meta.category,
          difficulty: meta.difficulty,
          modes: JSON.stringify(meta.modes),
          compositionId: meta.compositionId,
          durationInSeconds: meta.durationInSeconds,
          locales: JSON.stringify(meta.locales),
        },
      }).run();

    for (const locale of SUPPORTED_LOCALES) {
      const content = getExperimentContent(meta.id, locale);
      if (!content) continue;
      db.insert(schema.experimentContents)
        .values({
          experimentId: meta.id,
          locale,
          content: JSON.stringify(content),
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [schema.experimentContents.experimentId, schema.experimentContents.locale],
          set: { content: JSON.stringify(content), updatedAt: now },
        }).run();
    }
  }

  for (const def of VIRTUAL_OPS) {
    db.insert(schema.virtualOps)
      .values({ experimentId: def.experimentId, definition: JSON.stringify(def) })
      .onConflictDoUpdate({
        target: schema.virtualOps.experimentId,
        set: { definition: JSON.stringify(def) },
      }).run();
  }
}

export function loadVirtualOp(experimentId: string): VirtualOperation | undefined {
  const rows = db
    .select()
    .from(schema.virtualOps)
    .where(eq(schema.virtualOps.experimentId, experimentId))
    .all();
  if (rows.length === 0) return undefined;
  return JSON.parse(rows[0].definition) as VirtualOperation;
}
