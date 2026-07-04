# ===== ImageRelay 前端全栈镜像（Zeabur / Docker 部署用）=====
# 构建前端 Vue SPA + Nginx 托管 + 反代 /api/* /v1/* 到 new-api 后端
# 后端 new-api 需单独部署（用 backend/new-api/Dockerfile）

# ===== 阶段1：构建前端 =====
FROM node:20-alpine AS frontend-builder
WORKDIR /app
# 先复制依赖文件，利用 Docker 层缓存
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
# 复制源码并构建
# 直接用 vite build，跳过 vue-tsc 类型检查（vue-tsc 1.x 与新版 TS 不兼容会失败）
COPY frontend/ .
RUN npx vite build

# ===== 阶段2：Nginx 运行时 =====
FROM nginx:alpine
# 复制前端构建产物
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
# 复制 Nginx 配置模板（启动时用 envsubst 替换 NEW_API_URL）
COPY zeabur-nginx.conf /etc/nginx/conf.d/default.template
COPY zeabur-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# 清理 nginx 默认配置避免冲突
RUN rm -f /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
