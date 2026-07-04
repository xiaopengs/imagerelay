#!/bin/sh
set -e

# new-api 后端地址
# 默认 http://new-api:3000（docker-compose / Zeabur 同项目服务名互访兼容）
# Zeabur 部署时：若 new-api 服务名非 new-api，请在控制台设置 NEW_API_URL 环境变量
export NEW_API_URL="${NEW_API_URL:-http://new-api:3000}"

# 从 /etc/resolv.conf 提取 nameserver IP，给 nginx resolver 用
# K8s/Zeabur 环境下通常是 kube-dns（如 169.254.25.10 或 10.43.0.10）
# 这样 nginx 能在请求时动态解析后端主机名，避免启动时硬解析失败导致 emerg
RESOLVER=$(grep -E '^nameserver' /etc/resolv.conf | head -1 | awk '{print $2}')
if [ -z "$RESOLVER" ]; then
    RESOLVER="169.254.25.10"  # K3s 默认 kube-dns 兜底
fi
export RESOLVER

echo "[entrypoint] NEW_API_URL=$NEW_API_URL"
echo "[entrypoint] RESOLVER=$RESOLVER"

# 只替换 NEW_API_URL 和 RESOLVER，保留 nginx 内置变量（$host $remote_addr $backend 等）
envsubst '${NEW_API_URL} ${RESOLVER}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf
rm /etc/nginx/conf.d/default.template

exec nginx -g 'daemon off;'
