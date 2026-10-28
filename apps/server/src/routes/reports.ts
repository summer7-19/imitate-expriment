import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ExperimentReport, Locale, ParamValue } from "@physchem/experiment-schema";
import { EXPERIMENT_METAS, getExperimentContent } from "@physchem/experiment-data";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { reports } from "../db/schema";
import { generateReportData, reportToMarkdown } from "../report/calculators";

export function registerReportRoutes(app: FastifyInstance): void {
  /** 生成报告：测量模拟 + 计算全部在服务端完成 */
  app.post<{
    Body: {
      experimentId?: string;
      locale?: string;
      sessionId?: string;
      parameters?: Record<string, ParamValue>;
    };
  }>("/api/reports", async (req, reply) => {
    const { experimentId = "", locale = "zh-CN" } = req.body ?? {};
    const meta = EXPERIMENT_METAS.find((m) => m.id === experimentId);
    const resolvedLocale: Locale = locale === "en-US" ? "en-US" : "zh-CN";
    const content = meta ? getExperimentContent(meta.id, resolvedLocale) : undefined;
    if (!meta || !content) {
      return reply.code(400).send({ error: "未知的 experimentId" });
    }
    const parameters = req.body?.parameters ?? {};
    for (const v of Object.values(parameters)) {
      const t = typeof v;
      if (t !== "number" && t !== "string" && t !== "boolean") {
        return reply.code(400).send({ error: "parameters 的值只能是 number / string / boolean" });
      }
    }
    const data = generateReportData(meta.id, content, parameters, resolvedLocale);
    const report: ExperimentReport = {
      id: randomUUID(),
      experimentId: meta.id,
      sessionId: req.body?.sessionId ?? randomUUID(),
      locale: resolvedLocale,
      createdAt: new Date().toISOString(),
      parameters,
      measurements: data.measurements,
      calculations: data.calculations,
      errorAnalysis: data.errorAnalysis,
      conclusion: data.conclusion,
      warnings: data.warnings,
    };
    db.insert(reports)
      .values({
        id: report.id,
        experimentId: report.experimentId,
        sessionId: report.sessionId,
        locale: report.locale,
        createdAt: report.createdAt,
        payload: JSON.stringify(report),
      })
      .run();
    return reply.code(201).send(report);
  });

  app.get<{ Params: { id: string } }>("/api/reports/:id", async (req, reply) => {
    const rows = db.select().from(reports).where(eq(reports.id, req.params.id)).all();
    if (rows.length === 0) return reply.code(404).send({ error: "报告不存在" });
    return JSON.parse(rows[0].payload) as ExperimentReport;
  });

  app.get<{ Params: { id: string }; Querystring: { format?: string } }>(
    "/api/reports/:id/export",
    async (req, reply) => {
      const rows = db.select().from(reports).where(eq(reports.id, req.params.id)).all();
      if (rows.length === 0) return reply.code(404).send({ error: "报告不存在" });
      const report = JSON.parse(rows[0].payload) as ExperimentReport;
      const meta = EXPERIMENT_METAS.find((m) => m.id === report.experimentId);
      const content = meta
        ? getExperimentContent(meta.id, report.locale as Locale)
        : undefined;
      const md = reportToMarkdown({
        title: content?.title ?? report.experimentId,
        parameters: report.parameters,
        measurements: report.measurements,
        calculations: report.calculations,
        errorAnalysis: report.errorAnalysis,
        conclusion: report.conclusion,
        warnings: report.warnings,
        locale: report.locale as Locale,
      });
      reply.header("Content-Type", "text/markdown; charset=utf-8");
      reply.header(
        "Content-Disposition",
        `attachment; filename="report-${report.id.slice(0, 8)}.md"`,
      );
      return md;
    },
  );
}
