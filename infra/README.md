# ImageRelay 部署指南

本目录包含 ImageRelay 的 Docker 部署配置，使用 Docker Compose 编排 One API + Nginx 服务。

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 服务器 1核 1GB+（推荐 2核 2GB+）

## 目录结构

```
infra/
├── docker-compose.yml    # 容器编排配置
├── nginx.conf           # Nginx 反向代理配置
├── README.md            # 本文档
├── ssl/                 # SSL 证书目录（需自行申请后放入）
│   ├── fullchain.pem
│   └── privkey.pem
├── frontend-dist/       # 前端静态文件（需从 frontend/ 构建后复制到此）
└── one-api-data/        # One API 数据持久化目录（自动创建）
```

## 快速启动

```bash
# 1. 进入 infra 目录
cd infra

# 2. 首次启动（自动拉取镜像并启动）
docker compose up -d

# 3. 查看服务状态
docker compose ps

# 4. 查看日志
docker compose logs -f
```

服务启动后，访问 `http://<服务器IP>` 即可使用。

## One API 管理后台

One API 启动后，可通过以下方式访问管理后台：

- **地址**：`http://<服务器IP>:3000`
- **默认账号**：`root`
- **默认密码**：`123456`

> ⚠️ **首次使用建议**：登录后立即修改默认密码！

首次登录后，One API 会引导你配置渠道（Channel），即填写你的 AI API Key（如 OpenAI、Claude 等），之后即可通过 ImageRelay 调用。

## SSL 证书申请（Let's Encrypt）

启用 HTTPS 前，需先申请 SSL 证书：

### 方式一：使用 certbot 自动申请

```bash
# 安装 certbot
apt update && apt install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
certbot certonly --nginx -d your-domain.com

# 复制证书到 ssl 目录
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/ssl/

# 编辑 nginx.conf，取消 HTTPS server 块的注释并修改域名
```

### 方式二：手动申请（DNS 验证）

```bash
# 使用 standalone 模式申请
certbot certonly --manual --preferred-challenges dns -d your-domain.com

# 按照提示配置 DNS TXT 记录后，复制证书到 ssl 目录
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/ssl/
```

### 方式三：使用 Cloudflare 等代理

如果使用 Cloudflare、腾讯云等 CDN/代理服务，可直接在后台申请免费证书并配置。

## 常用命令

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 查看日志
docker compose logs -f [服务名]

# 进入 One API 容器（调试用）
docker exec -it imagerelay-one-api sh

# 重新构建（镜像更新后）
docker compose pull
docker compose up -d

# 清理未使用的镜像
docker image prune -f
```

## 前端构建

部署前需要先构建前端并复制到 infra 目录：

```bash
# 在项目根目录执行
cd frontend
npm install
npm run build

# 复制构建产物到 infra
cp -r dist ../infra/frontend-dist
```

## 数据持久化

- `one-api-data/` 目录保存 One API 的数据库和配置，重启后数据不丢失。
- 如需备份，复制整个目录即可：
  ```bash
  tar -czvf one-api-backup.tar.gz infra/one-api-data/
  ```

## 故障排查

```bash
# 查看 One API 日志
docker compose logs one-api

# 查看 Nginx 日志
docker compose logs nginx

# 检查容器状态
docker compose ps

# 重启特定服务
docker compose restart one-api
docker compose restart nginx

# 检查端口占用
netstat -tlnp | grep -E '80|443|3000'
```

## 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 80   | Nginx | HTTP 入口 |
| 443  | Nginx | HTTPS 入口（需配置 SSL） |
| 3000 | One API | 仅本地访问，外部通过 Nginx 代理 |

## 更新 One API

```bash
# 拉取最新镜像
docker pull justsong/one-api:latest

# 重启服务
docker compose up -d
```