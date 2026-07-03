#!/bin/sh
set -e

# new-api 后端地址
# 默认 http://new-api:3000（docker-compose / Zeabur 同项目服务名互访兼容）
# Zeabur 部署时：若 new-api 服务名非 new-api，请在控制台设置 NEW_API_URL 环境变量
export NEW_API_URL="${NEW_API_URL:-http://new-api:3000}"

# 只替换 NEW_API_URL，保留 nginx 内置变量（$host $remote_addr 等）
envsubst '${NEW_API_URL}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf
rm /etc/nginx/conf.d/default.template

exec nginx -g 'daemon off;'
