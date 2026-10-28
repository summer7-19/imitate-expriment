// Remotion CLI 配置（npx remotion studio / remotion render 用）
// 服务端程序化渲染走 @remotion/bundler + @remotion/renderer，不读取此文件。
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("apps/web/src/remotion/index.ts");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
