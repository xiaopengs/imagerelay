#!/bin/sh
set -e

# new-api 后端地址
# 默认 http://new-api:3000（docker-compose / Zeabur 同项目服务名互访兼容）
# Zeabur 部署时：若 new-api 服务名非 new-api，请在控制台设置 NEW_API_URL 环境变量
# 关键：去掉末尾斜杠，避免 proxy_pass $backend 时产生双斜杠（如 //api/status）
NEW_API_URL="${NEW_API_URL:-http://new-api:3000}"
NEW_API_URL=$(echo "$NEW_API_URL" | sed 's|/$||')
export NEW_API_URL

# 从 NEW_API_URL 提取 scheme/host/port，用于 nginx 的 SNI 和 Host header
# 例：https://newapindoe.zeabur.app/ → BACKEND_SCHEME=https, BACKEND_HOST=newapindoe.zeabur.app
# nginx 反代 HTTPS 后端时必须启用 SNI（proxy_ssl_server_name on）并把 Host 设成后端域名，
# 否则 Cloudflare/Zeabur SSL 网关无法识别请求该路由到哪个服务 → 502
BACKEND_SCHEME=$(echo "$NEW_API_URL" | sed -nE 's|^(https?)://.*|\1|p')
BACKEND_HOST=$(echo "$NEW_API_URL" | sed -nE 's|^https?://([^/:]+).*|\1|p')
export BACKEND_SCHEME BACKEND_HOST

# 从 /etc/resolv.conf 提取 nameserver IP，给 nginx resolver 用
# K8s/Zeabur 环境下通常是 kube-dns（如 169.254.25.10 或 10.43.0.10）
# 这样 nginx 能在请求时动态解析后端主机名，避免启动时硬解析失败导致 emerg
RESOLVER=$(grep -E '^nameserver' /etc/resolv.conf | head -1 | awk '{print $2}')
if [ -z "$RESOLVER" ]; then
    RESOLVER="169.254.25.10"  # K3s 默认 kube-dns 兜底
fi
export RESOLVER

echo "[entrypoint] NEW_API_URL=$NEW_API_URL"
echo "[entrypoint] BACKEND_SCHEME=$BACKEND_SCHEME"
echo "[entrypoint] BACKEND_HOST=$BACKEND_HOST"
echo "[entrypoint] RESOLVER=$RESOLVER"
echo "[entrypoint] PORT env=$PORT (nginx fixed to listen 80)"

# 替换所有 ${VAR}，保留 nginx 内置变量（$host $remote_addr $backend 等）
envsubst '${NEW_API_URL} ${RESOLVER} ${BACKEND_SCHEME} ${BACKEND_HOST}' \
  < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf
rm /etc/nginx/conf.d/default.template

exec nginx -g 'daemon off;'
