# 🐾 ImageRelay

<div align="center">

**GPT Image 2 + Gemini Imagen 海外中转生图平台**

*[English below](#english) · [中文](#中文)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)
[![Vue.js 3](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 🎯 项目简介

ImageRelay 是一个面向全球用户的 AI 生图 SaaS 平台，聚合接入 GPT Image 2（OpenAI）和 Gemini Imagen（Google）两大模型，通过 One API 中转网关统一对外提供服务，按调用量收费。

**核心能力：** 文生图 / 图生图 / API 接入 / 充值码计费

---

## 📁 项目结构

```
imagerelay/
├── frontend/                # Vue.js 3 SPA（Vite + TypeScript + TailwindCSS）
│   ├── src/
│   │   ├── api/             # API 封装（auth / images / user）
│   │   ├── components/      # 公共组件（AppHeader / PromptInput / ImagePreview...）
│   │   ├── views/           # 页面（10个）：登录/注册/文生图/图生图/控制台...
│   │   ├── stores/          # Pinia 状态管理（auth / credits）
│   │   └── router/          # Vue Router + 路由守卫
│   └── dist/                # 生产构建产物
├── backend/one-api/          # One API 网关（Docker 部署）
├── infra/                   # 基础设施配置
│   ├── docker-compose.yml   # Docker Compose 编排（One API + Nginx）
│   ├── nginx.conf           # Nginx 反向代理配置
│   └── README.md             # 部署文档（本文件）
├── docs/                    # 文档站点
│   └── index.html           # 静态文档/展示页
├── SPEC.md                  # 产品规格书（唯一真实来源）
└── README.md                # 项目总览（本文件）
```

---

## 🚀 快速部署（生产环境）

### 前置条件

| 要求 | 规格 | 说明 |
|------|------|------|
| 服务器 | 2核2G+ | 推荐新加坡/日本节点 |
| 域名 | 已解析到服务器 | A 记录指向服务器 IP |
| Docker | ≥ 20.10 | `docker --version` |
| Docker Compose | ≥ 2.0 | `docker-compose --version` |
| SSL 证书 | .pem 文件 | Let's Encrypt 或商业证书 |

### 第一步：服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker（若未安装）
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker --version          # ≥ 20.10
docker-compose --version  # ≥ 2.0
```

### 第二步：克隆项目

```bash
git clone https://github.com/xiaopengs/imagerelay.git
cd imagerelay
```

### 第三步：构建前端

```bash
cd frontend
npm install
npm run build        # 输出到 frontend/dist/
cd ..
```

### 第四步：配置 SSL 证书

```bash
# 方法 A：Let's Encrypt（推荐）
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com

# 将证书复制到项目目录
mkdir -p infra/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/ssl/key.pem
sudo chmod 644 infra/ssl/*.pem

# 方法 B：商业证书，直接放入 infra/ssl/
#   cert.pem  — 证书（含中间证书）
#   key.pem   — 私钥
```

### 第五步：修改 Nginx 配置中的域名

```bash
# 编辑 infra/nginx.conf，找到并替换：
#   server_name your-domain.com;

# 如果不使用 HTTPS，将 nginx.conf 中的 HTTPS server 部分注释
```

### 第六步：启动服务

```bash
cd infra

# 创建前端构建产物目录并复制
mkdir -p frontend-dist
cp -r ../frontend/dist/* frontend-dist/

# 启动（One API + Nginx）
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 第七步：One API 初始化配置

访问 `https://your-domain.com`（或 `http://your-ip:3000` 直接访问管理后台）

```
初始账号：root
初始密码：123456
```

⚠️ **立即修改默认密码！**

然后在管理后台配置渠道：

**渠道 1：OpenAI（GPT Image 2）**
- 类型：OpenAI
- API URL：`https://api.openai.com`（默认，直连）
- API Key：`sk-xxxx...`
- 模型列表：`gpt-image-2`，`dall-e-3`

**渠道 2：Google Gemini（可选）**
- 类型：Google
- API Key：`AIxxx...`
- 模型列表：`imagen-3`，`imagen-4`

---

## 💻 本地开发

```bash
# 1. 克隆
git clone https://github.com/xiaopengs/imagerelay.git
cd imagerelay

# 2. 前端依赖
cd frontend && npm install

# 3. 配置 One API（本地开发模式）
# 在 localhost:3000 运行 One API：
docker run --name one-api-dev -d -p 3000:3000 -e TZ=Asia/Shanghai justsong/one-api

# 4. 启动前端开发服务器
npm run dev   # 访问 http://localhost:5173

# 5. 前端通过 Vite 代理连接 One API
#   /api/*  → localhost:3000
#   /v1/*   → localhost:3000
```

---

## 🔧 One API 管理后台功能

| 功能 | 说明 |
|------|------|
| 渠道管理 | 添加/编辑/禁用上游 API 渠道，支持多渠道负载均衡 |
| 令牌管理 | 为用户生成 API Token，设置额度/IP限制 |
| 额度控制 | 设置用户额度上限，支持积分预付 |
| 充值码 | 批量生成充值码，线下收款后发放 |
| 用户管理 | 注册/登录/分组/配额管理 |
| 统计看板 | 查看用量、余额、渠道调用量 |
| 模型映射 | 将用户请求重定向到指定模型（高级功能）|

---

## 📊 API 文档

Base URL: `https://your-domain.com`

### 认证

所有 API 请求需要在 Header 中携带 Token：

```
Authorization: Bearer <your-api-token>
```

### 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/images/generations` | 生成图片（文生图/图生图）|
| `GET`  | `/v1/models` | 获取可用模型列表 |
| `GET`  | `/v1/images/history` | 获取生图历史记录 |
| `GET`  | `/api/v1/users/me` | 获取当前用户信息（含余额）|
| `POST` | `/api/v1/users/top_up` | 充值码充值 |
| `POST` | `/api/v1/tokens` | 创建新的 API Token |
| `GET`  | `/api/v1/tokens` | 获取用户所有 Token |
| `DELETE` | `/api/v1/tokens/:id` | 删除 Token |

### 生成图片示例

```bash
curl https://your-domain.com/v1/images/generations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "a futuristic city at night with neon lights",
    "n": 1,
    "size": "1024x1024"
  }'
```

### 响应格式

```json
{
  "created": 1715123456,
  "data": [
    {
      "url": "https://...",
      "revised_prompt": "..."
    }
  ]
}
```

---

## 🧩 技术栈详解

```
前端（Vue.js 3）
├── Vite        — 构建工具（快速 HMR）
├── TypeScript  — 类型安全
├── TailwindCSS — 原子化 CSS（#7c6af5 紫蓝主色系）
├── Pinia       — 状态管理（auth + credits）
├── Vue Router  — 路由（含登录守卫）
└── Axios       — HTTP 客户端

后端（One API 网关）
├── Go          — 高性能网关
├── SQLite      — 数据持久化（开发/小规模）
├── MySQL       — 数据持久化（生产，推荐）
├── Nginx       — 反向代理 + 静态托管 + SSL
└── Docker       — 容器化部署
```

---

## 🔐 安全配置

### 1. 修改默认密码
首次登录 One API 后立即修改 `root` 账户密码。

### 2. 配置 CORS
One API 管理后台 → 系统设置 → 允许的来源填写你的域名：
```
https://your-domain.com
```

### 3. 启用 Rate Limiting
在 Nginx 配置中添加限流：
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
```

### 4. IP 白名单
在 One API → 令牌管理 → 为高价值用户设置 IP 白名单。

### 5. HTTPS 强制
确保所有 HTTP 请求重定向到 HTTPS（nginx.conf 已配置）。

---

## 🐳 Docker Compose 详解

```yaml
# infra/docker-compose.yml
services:
  one-api:
    image: justsong/one-api:latest
    container_name: imagerelay-one-api
    restart: always
    ports:
      - "127.0.0.1:3000:3000"   # 仅本地访问，Nginx 转发
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./one-api-data:/data    # 数据持久化
    # 推荐生产使用 MySQL：
    # environment:
    #   - SQL_DSN=root:password@tcp(host:3306)/oneapi?charset=utf8mb4

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend-dist:/usr/share/nginx/html:ro  # 前端静态文件
      - ./ssl:/etc/nginx/ssl:ro                    # SSL 证书
    depends_on:
      - one-api
```

---

## 🛠️ 运维命令

```bash
# 查看服务状态
docker-compose ps

# 查看所有容器日志
docker-compose logs -f

# 查看 One API 日志
docker-compose logs -f one-api

# 查看 Nginx 日志
docker-compose logs -f nginx

# 重启所有服务
docker-compose restart

# 更新 One API
docker-compose pull one-api && docker-compose up -d

# 完整重建（无缓存）
docker-compose down -v
docker-compose up -d --build

# 进入 One API 容器（调试）
docker exec -it imagerelay-one-api sh

# 查看 One API 数据目录
ls -la infra/one-api-data/
```

---

## 📈 监控与备份

### 日志收集
```bash
# 将日志输出到文件
docker-compose logs -f > logs/app.log 2>&1 &
```

### 数据备份
```bash
# 备份 One API SQLite 数据
cp infra/one-api-data/one-api.db "backup-$(date +%Y%m%d).db"

# 备份整个项目
tar -czf imagerelay-backup.tar.gz \
  --exclude=frontend/node_modules \
  --exclude=frontend/dist \
  --exclude=infra/one-api-data \
  .
```

### MySQL 备份（生产）
```bash
mysqldump -u root -p oneapi > backup-$(date +%Y%m%d).sql
```

---

## 🐛 故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| 页面 502 | One API 未启动 | `docker-compose ps` 检查容器状态 |
| 生成图片失败 | API Key 无效/余额不足 | 登录管理后台检查渠道状态 |
| 上传报错 | Nginx client_max_body_size 过小 | 检查 nginx.conf 中 `client_max_body_size` |
| HTTPS 不生效 | 证书路径错误 | 检查 infra/ssl/ 目录下的 .pem 文件 |
| 跨域失败 | One API CORS 未配置 | 管理后台 → 系统设置 → 允许来源 |
| 数据库报错 | SQLite 权限问题 | `chmod 755 infra/one-api-data/` |

### 紧急恢复
```bash
# 强制重启所有容器
docker-compose down && docker-compose up -d

# 查看详细错误
docker-compose logs --tail=100
```

---

## 🔄 更新流程

```bash
# 1. 拉取最新代码
git pull origin master

# 2. 重新构建前端
cd frontend && npm install && npm run build && cd ..

# 3. 复制新的构建产物
rm -rf infra/frontend-dist && cp -r frontend/dist infra/frontend-dist

# 4. 重启服务
cd infra && docker-compose down && docker-compose up -d
```

---

## 📄 许可证

MIT License · © 2026 ImageRelay

---

## 🌐 相关链接

- [One API GitHub](https://github.com/songquanpeng/one-api)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Google AI Gemini](https://ai.google.dev/)
- [Vue.js 3](https://vuejs.org/)
- [TailwindCSS](https://tailwindcss.com/)

---

*由黑爪爪 🐾 设计开发 · Powered by OpenClaw*