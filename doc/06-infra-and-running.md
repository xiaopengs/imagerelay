# 06 - 基础设施与运行方式

> 本文档覆盖 Docker Compose 编排、Nginx 配置、SSL、本地开发与生产部署。

---

## 一、Docker Compose 编排

文件：`infra/docker-compose.yml`

编排 4 个容器：

| 容器 | 镜像/构建 | 端口 | 依赖 | 数据卷 |
|------|-----------|------|------|--------|
| `new-api` | 从 `backend/new-api/` 源码构建 | 3000 | mysql, redis | `./new-api-data:/data` |
| `mysql` | `mysql:8.0` | 3306（内部） | — | `mysql-data:/var/lib/mysql` |
| `redis` | `redis:7-alpine` | 6379（内部） | — | `redis-data:/data` |
| `nginx` | `nginx:alpine` | 80, 443 | new-api | `nginx.conf`, `frontend-dist`, `ssl` |

### 关键配置

```yaml
new-api:
  build:
    context: ../backend/new-api      # 从 vendored 源码构建
    dockerfile: Dockerfile
  environment:
    - TZ=Asia/Shanghai
    - SQL_DSN=root:${MYSQL_ROOT_PASSWORD}@tcp(mysql:3306)/newapi?charset=utf8mb4
    - REDIS_CONN_STRING=redis://redis:6379
    - SESSION_SECRET=${SESSION_SECRET}
  depends_on:
    - mysql
    - redis

mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    MYSQL_DATABASE: newapi
  command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4
```

### 环境变量

在 `infra/.env` 文件配置（被 `.gitignore` 忽略，不提交）：

```bash
MYSQL_ROOT_PASSWORD=your-secure-password
SESSION_SECRET=random-string-here
```

---

## 二、Nginx 配置

文件：`infra/nginx.conf`

### 路由规则

| 路径 | 转发目标 | 说明 |
|------|----------|------|
| `/` | 本地静态文件 | 前端 SPA（`try_files` 回退到 index.html） |
| `/api/*` | `http://new-api/api/*` | 管理接口（登录/注册/用户/Token/日志/充值） |
| `/v1/*` | `http://new-api/v1/*` | Relay 接口（生图/模型列表） |

### 关键配置项

```nginx
worker_processes auto;

http {
  # Gzip 压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;

  upstream new-api {
    server new-api:3000;
  }

  # HTTP → HTTPS 重定向
  server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name _;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    client_max_body_size 20M;        # 图片上传限制 20MB

    # 前端 SPA
    location / {
      root /usr/share/nginx/html;
      try_files $uri $uri/ /index.html;
      expires 7d;
    }

    # 管理接口
    location /api/ {
      proxy_pass http://new-api/api/;
      proxy_read_timeout 300s;       # 5 分钟超时（生图慢）
    }

    # Relay 接口
    location /v1/ {
      proxy_pass http://new-api/v1/;
      proxy_read_timeout 300s;
    }
  }
}
```

---

## 三、本地开发

### 3.1 启动后端（Docker）

```bash
# 从 vendored 源码构建并启动 new-api（含 MySQL + Redis）
cd infra
docker compose up -d --build new-api mysql redis

# 验证
docker compose ps
curl http://localhost:3000/api/status
```

> 首次构建约 5-10 分钟（多阶段构建：bun 前端 + golang 编译）。后续启动秒级。

### 3.2 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

### 3.3 Vite 开发代理

前端 dev server 自动代理 API 请求到本地后端：

| 前端请求 | 代理目标 | 说明 |
|----------|----------|------|
| `/api/pay/*` | `http://localhost:3001` | 支付微服务（规划中，目前死代码） |
| `/api/*` | `http://localhost:3000` | new-api 管理接口 |
| `/v1/*` | `http://localhost:3000` | new-api Relay 接口 |

### 3.4 配置 new-api 管理后台

1. 访问 `http://localhost:3000`
2. 用 `root` / `123456` 登录（**立即改密码**）
3. **渠道管理** → 添加渠道：
   - 类型：OpenAI（或对应提供商）
   - 填入上游 API Key
   - 添加模型：`gpt-image-1`, `dall-e-3`, `imagen-3`
4. **系统设置** → 运营设置 → CORS：允许 `http://localhost:5173`
5. 创建测试令牌，验证生图

---

## 四、生产部署

### 第一步：克隆项目

```bash
git clone https://github.com/xiaopengs/imagerelay.git
cd imagerelay
```

### 第二步：构建前端

```bash
cd frontend
npm install
npm run build
```

构建产物在 `frontend/dist/`。

### 第三步：复制前端产物到 infra

```bash
mkdir -p infra/frontend-dist
cp -r frontend/dist/* infra/frontend-dist/
```

### 第四步：准备 SSL 证书

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot certonly --standalone -d your-domain.com

mkdir -p infra/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/ssl/key.pem
sudo chmod 644 infra/ssl/cert.pem infra/ssl/key.pem
```

### 第五步：修改 Nginx 配置

编辑 `infra/nginx.conf`，将 `server_name _;` 改为你的域名：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    ...
}
```

### 第六步：配置环境变量

```bash
# infra/.env
MYSQL_ROOT_PASSWORD=your-secure-password
SESSION_SECRET=random-string-here
```

### 第七步：启动 Docker Compose（从源码构建后端）

```bash
cd infra
docker compose up -d --build   # --build 从 backend/new-api 源码构建
```

验证：

```bash
docker compose ps   # 所有容器 Up
curl -I https://your-domain.com
```

### 第八步：配置 new-api 管理后台

1. 访问 `https://your-domain.com/api/` 或 `http://server-ip:3000`
2. 登录 `root` / `123456` → **立即改密码**
3. 添加渠道（OpenAI / Google）+ 配置 API Key + 添加模型
4. 创建令牌验证生图
5. 系统设置 → CORS 允许 `https://your-domain.com`

### 第九步：验证生图

```bash
curl https://your-domain.com/v1/images/generations \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-image-1","prompt":"a cat on rainbow","n":1,"size":"1024x1024"}'
```

---

## 五、定制后端开发流程

后端源码 vendored 在 `backend/new-api/`，支持随时定制。

### 修改源码后重新构建

```bash
# 1. 修改 backend/new-api/ 下的 Go 源码
# 2. 重新构建并启动 new-api 容器
cd infra
docker compose up -d --build new-api

# 查看日志
docker compose logs -f new-api
```

### 常见定制场景

| 需求 | 修改文件 |
|------|----------|
| 修改默认 quota | `model/user.go` 的用户创建逻辑 |
| 修改生图超时 | `relay/channel/openai/adaptor.go` |
| 添加新 API 端点 | `router/api-router.go` + `controller/` |
| 修改充值套餐 | `controller/topup.go` + 前端 `PricingView.vue` |
| 修改 CORS 规则 | `middleware/cors.go` |

---

## 六、故障排查

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| 前端白屏 | `dist` 未正确复制到 `frontend-dist` | 重新执行部署第三步 |
| 502 Bad Gateway | new-api 容器未启动 | `docker compose ps` → `docker compose restart new-api` |
| 登录失败 404 | API 路径错误 | 确认 nginx 代理 `/api/` 和 `/v1/` 指向 new-api |
| 生图超时 | API Key 无效或模型未配置 | 管理后台 → 渠道管理 → 检查 Key 和模型 |
| CORS 错误 | new-api 未配置允许来源 | 管理后台 → 系统设置 → CORS |
| 401 Unauthorized | Token/Key 过期 | 退出重新登录，或管理后台重建 Token |
| 构建失败（Go） | 网络问题导致 `go mod download` 失败 | 重试 `docker compose build new-api` |
| 构建失败（bun） | 网络问题导致 `bun install` 失败 | 配置 npm/bun 镜像源后重试 |

### 查看日志

```bash
# new-api 日志
docker compose logs -f new-api

# Nginx 日志
docker compose logs -f nginx

# MySQL 日志
docker compose logs -f mysql
```

### 进入容器调试

```bash
docker compose exec new-api sh
docker compose exec mysql mysql -uroot -p newapi
docker compose exec nginx sh
```

---

## 七、备份与恢复

### 备份

```bash
cd infra
# 备份 MySQL
docker compose exec mysql mysqldump -uroot -p newapi > backup-$(date +%Y%m%d).sql

# 备份 new-api 数据（含 SQLite + 上传文件）
tar -czf new-api-data-$(date +%Y%m%d).tar.gz new-api-data/
```

### 恢复

```bash
# 恢复 MySQL
docker compose exec -T mysql mysql -uroot -p newapi < backup-20260101.sql

# 恢复 new-api 数据
tar -xzf new-api-data-20260101.tar.gz
docker compose restart new-api
```

---

## 八、相关文件索引

| 文件 | 用途 |
|------|------|
| `infra/docker-compose.yml` | 容器编排（4 容器） |
| `infra/nginx.conf` | Nginx 反向代理配置 |
| `infra/.env` | 环境变量（被 gitignore） |
| `infra/ssl/` | SSL 证书目录 |
| `infra/frontend-dist/` | 前端构建产物（部署时复制） |
| `infra/new-api-data/` | new-api 运行数据 |
| `backend/new-api/Dockerfile` | new-api 多阶段构建文件 |
| `frontend/vite.config.ts` | Vite 配置 + 开发代理 |
| `frontend/tailwind.config.js` | Tailwind 主题配置 |
