# PHYSCHEM LAB 渲染服务：Node 20 + 无头 Chromium 运行库
FROM node:20-bookworm-slim

# Remotion 无头 Chrome 所需的系统库 + 中文字体（视频字幕需要）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 libpango-1.0-0 libcairo2 libatspi2.0-0 \
    fonts-noto-cjk ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/server ./apps/server

RUN pnpm install --frozen-lockfile --filter @physchem/server...

WORKDIR /app/apps/server
EXPOSE 3002
# 首次渲染会自动下载 Chrome Headless Shell；RENDER_CONCURRENCY 压低并发防 OOM
ENV RENDER_CONCURRENCY=2
CMD ["pnpm", "start"]
