# PHYSCHEM LAB · 经典实验程序化动画库（v2）

可调参数的经典物理 / 化学 / 物理化学实验**程序化动画库 + 虚拟操作台**：
网页内用 Remotion Player 预览，同一套 Composition 交给服务端 `renderMedia()` 出 MP4；
虚拟操作的正确顺序与报告计算全部在**服务端**完成。所有动画声明为**示意动画，非真实操作录像**。

## 功能（v2 MVP）

- **18 个实验**，按学段与学科分为 5 类，每个含：分镜动画、可调参数、1 个错误场景、3 道小测（含多选）、正常范围判定
  - 初中物理（3）：凸透镜成像规律、伏安法测电阻、探究杠杆平衡条件
  - 初中化学（3）：氧气的实验室制取与性质、二氧化碳的实验室制取与检验、粗盐提纯
  - 高中物理（5）：杨氏双缝干涉、光电效应测普朗克常量、验证牛顿第二定律、验证机械能守恒定律、测量电源的电动势和内阻
  - 高中化学（4）：酸碱滴定、配制一定物质的量浓度的溶液、探究影响化学反应速率的因素、原电池
  - 物化（3）：电导滴定、分光光度法测浓度、凝固点降低测摩尔质量
- **双语 zh-CN / en-US**：顶栏切换，实验内容与动画内文字全部随语言变化（`ja-JP` 架构预留）
- **虚拟操作模式**（酸碱滴定 / 杨氏双缝 / 电导滴定）：交互实验台、操作序列服务端判定、
  检查点文字反馈；**正确答案只存服务端 SQLite，前端 bundle 不含答案**
- **实验报告自动生成**：服务端模拟测量 + 计算（含 LaTeX/KaTeX 公式、误差分析、警示），
  可导出 Markdown；报告页含"基于程序化模拟数据"声明
- **导出 MP4**：单任务 + 批量导出，队列 + 子进程 worker，进度轮询，成片下载

## 快速开始

```bash
pnpm install
pnpm dev          # 前端 5173 + 渲染/判定/报告服务 3002（端口占用时自动顺延）
```

- `/` 实验库（分类筛选、搜索、实时缩略图懒加载）
- `/experiment/:id` 详情（播放器、参数联动、步骤时间线、错误演示、正常范围）
- `/experiment/:id/virtual` 虚拟操作台
- `/experiment/:id/report` 实验报告
- `/experiment/:id/quiz` 随堂小测
- `/render` 渲染管理（单个/批量导出、进度、下载）
- `/about` 关于 + 示意动画声明

`pnpm studio` 打开 Remotion Studio；`pnpm build` 产出前端静态文件。

## 架构

```
apps/web          React 18 + Vite；CSS Modules + SCSS（无 Tailwind、无第三方 UI 库）
  src/remotion    18 个 Composition（props: {lang, params}）+ 共享舞台组件
  src/i18n        自研 useI18n + TS 字典
apps/server       Fastify + SQLite(Drizzle) + 渲染队列（子进程 worker）
  src/db          6 张表：experiments / experiment_contents / virtual_ops /
                  reports / quiz_attempts / render_jobs；TS 数据源幂等种子
  src/data        虚拟操作序列与检查点判定（服务端专属，不下发）
  src/report      18 个实验的报告计算器（确定性伪随机模拟 + 模板误差分析）
packages/experiment-schema   共享类型（meta/content 拆分、virtual-ops、report、render-job）
packages/experiment-data     18 实验×双语内容 + 物理/化学计算模型（前后端共用，不含答案）
```

### API

| 路由 | 说明 |
|---|---|
| `GET /api/experiments?locale=` / `GET /api/experiments/:id?locale=` | 实验元数据 + 内容 |
| `GET /api/virtual-ops/:id` | 可用操作投影（**不含** requiredSequence） |
| `POST /api/virtual-ops/:id/check` | 操作序列判定，返回检查点反馈 key |
| `POST /api/reports` / `GET /api/reports/:id` | 生成 / 读取报告（服务端计算） |
| `GET /api/reports/:id/export?format=md` | 导出 Markdown |
| `POST /api/render`、`POST /api/render/batch` | 单个 / 批量渲染任务 |
| `GET /api/jobs`、`GET /api/render/:jobId` | 任务列表 / 详情（轮询） |
| `GET /api/render/:jobId/download` | 下载成片（另有 /files/ 静态目录） |
| `POST /api/quiz/:id/attempts` | 测验记录存档 |

### 渲染管线约束

- `renderMedia()` 在独立子进程执行（`--import tsx` fork），队列顺序消费，状态/进度落 SQLite
- `bundle()` 缓存在 `apps/server/.bundle/`，按 Web 端源码 mtime 指纹自动失效
- 并发默认 2（`RENDER_CONCURRENCY` 可调）——高并发会让无头 Chrome 在内存紧张的机器上 OOM
- 首次渲染自动下载 Chrome Headless Shell（100-200 MB）
- Composition 内所有 `var(--x)` 都带同值回退色（Remotion 内置 webpack 无 sass-loader）；
  **修改 `_tokens.scss` 时必须同步回退值**

## Docker

```bash
docker compose up --build
# web: http://localhost:5173 (nginx, /api 反代)
# server: http://localhost:3002
```

server 镜像含无头 Chrome 运行库与 Noto CJK 字体（视频内中文字幕需要）；数据与成片在
`server-data` / `server-out` 两个卷中。

## 新增一个实验（六步法）

1. `packages/experiment-data/src/experiments/` 写 `meta` + 双语 `content`（步骤帧数之和 + 90 帧片尾声明 = 总帧数）
2. 需要的物理/化学模型写进 `packages/experiment-data/src/models.ts`（颜色必须由函数映射）
3. `apps/web/src/remotion/experiments/` 写 Composition（props `{lang, params}`，读 `LABELS[lang]`，
   最后 90 帧渲染 `<EndDisclaimer />`）
4. `apps/web/src/remotion/registry.ts` 的 `COMPONENTS` 注册
5. 需要虚拟操作时：`apps/server/src/data/virtual-ops.ts` 加序列 + 检查点条件；前端字典加反馈文案
6. 需要报告时：`apps/server/src/report/calculators.ts` 加计算器

## 视觉规范（摘要）与自检清单

- 禁止渐变、高饱和 UI 色（S ≤ 45%）、大面积纯黑纯白、重阴影、大圆角、装饰动画、玻璃拟态、emoji 图标
- UI 只用语义 token（page/surface/subtle/ink/line/accent/ok/warn/err/info）；
  实验动画内部是数据可视化，允许饱和色但坐标轴/文字用 UI 灰度
- 状态不单靠颜色传达；交互元素有 `:focus-visible` 样式；`prefers-reduced-motion` 过渡归零
- 17 条自检（8.3/8.5）：含"虚拟操作答案不在前端 bundle"、"报告计算在服务端"、"片尾声明"、
  "双语完整或标注回退"、"参数联动不重挂 Player" 等，提交前逐条 grep / 代码走查
