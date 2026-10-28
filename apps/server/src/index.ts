import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { mkdirSync } from "node:fs";
import { RENDER_DIR } from "./paths";
import { registerExperimentRoutes } from "./routes/experiments";
import { registerRenderRoutes } from "./routes/render";
import { registerReportRoutes } from "./routes/reports";
import { registerVirtualOpsRoutes } from "./routes/virtualops";

const app = Fastify({
  logger: true,
  bodyLimit: 2 * 1024 * 1024,
});

await app.register(cors, { origin: true });

// 渲染产物静态目录（/files/<id>.mp4）；下载也可走 /api/render/:id/download
mkdirSync(RENDER_DIR, { recursive: true });
await app.register(fastifyStatic, {
  root: RENDER_DIR,
  prefix: "/files/",
});

// 引入 db/client 即完成建表与种子（实验内容从 TS 数据源幂等写入 SQLite）
await import("./db/client");

registerExperimentRoutes(app);
registerVirtualOpsRoutes(app);
registerReportRoutes(app);
registerRenderRoutes(app);

app.get("/api/health", async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 3002);
try {
  await app.listen({ port, host: "127.0.0.1" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
