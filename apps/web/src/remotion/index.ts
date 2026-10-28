// Remotion 打包入口：服务端渲染（@remotion/bundler）与 CLI（remotion studio/render）都从这里进入。
// 注意：这里不引入 SCSS token（Remotion 内置 webpack 无 sass-loader）。
// Composition 内所有 var(--x) 均带同值回退色，服务端渲染与 Web 端视觉一致；
// 修改设计 token 时必须同步更新 src/styles/_tokens.scss 中的回退值。
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
