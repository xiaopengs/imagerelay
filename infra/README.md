# infra 部署说明

本目录是 **VPS / Docker Compose 部署**入口，完整步骤见仓库根目录 [README「部署指南」](../README.md#部署指南)。

## 一键启动

```bash
# 1. 配置密钥（生产环境务必修改）
cp .env.example .env   # 若不存在，直接手动创建
#   MYSQL_ROOT_PASSWORD=your-secure-password
#   SESSION_SECRET=随机字符串

# 2. 构建并启动（前端 + new-api + MySQL + Redis）
docker compose up -d --build

# 3. 检查
docker compose ps
curl -I http://127.0.0.1/
curl http://127.0.0.1/api/status
```

## 服务拓扑

| 服务 | 镜像来源 | 端口 | 说明 |
|------|----------|------|------|
| `frontend` | 仓库根目录 `Dockerfile` | `80:80` | Vue SPA + Nginx，反代 `/api/*`、`/v1/*` |
| `new-api` | `backend/new-api/Dockerfile` | 仅内部 3000 | Go 网关 |
| `mysql` | `mysql:8.0` | 仅内部 | 数据库（库名 `newapi`）|
| `redis` | `redis:7-alpine` | 仅内部 | 缓存 |

## 常用运维命令

```bash
docker compose logs -f frontend     # 前端/Nginx 日志
docker compose logs -f new-api      # 后端日志
docker compose restart frontend     # 改完 nginx 相关配置后重启
docker compose down                 # 停止（保留数据卷）
docker compose down -v              # 停止并删除数据（谨慎）
```

## 关于 `nginx.conf`

`nginx.conf` 是**可选的 HTTPS 手动配置参考**，默认 Compose 不使用它（前端镜像自带 Nginx 配置）。
需要 HTTPS 推荐在最外层加 Caddy 自动签发证书，见根目录 README「可选：启用 HTTPS」。
