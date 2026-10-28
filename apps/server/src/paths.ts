import path from "node:path";
import { fileURLToPath } from "node:url";

/** 服务端所有路径约定：必须以 apps/server 为工作目录运行 */
export const SERVER_ROOT = process.cwd();
export const DATA_DIR = path.join(SERVER_ROOT, "data");
export const DB_FILE = path.join(DATA_DIR, "physchem.db");
export const RENDER_DIR = path.join(SERVER_ROOT, "out", "renders");
export const BUNDLE_DIR = path.join(SERVER_ROOT, ".bundle");

/** Remotion 打包入口：Web 应用内的 registerRoot 入口 */
export const REMOTION_ENTRY = path.resolve(SERVER_ROOT, "../web/src/remotion/index.ts");

export const WORKER_PATH = fileURLToPath(new URL("./render/worker.ts", import.meta.url));
