# ImageRelay

**GPT Image 2 AI 生图 SaaS 平台**

*GPT Image 2 / DALL-E 3 / Imagen 3 — 多模型 AI 图片创作平台*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue.js 3](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)

---

## 项目简介

ImageRelay 是一个基于 [new-api (QuantumNous)](https://github.com/QuantumNous/new-api) 作为后端底座的 AI 生图 SaaS 平台。前端使用 Vue 3 + TypeScript + TailwindCSS 构建，后端通过 new-api 统一管理 GPT Image 2、DALL-E 3、Imagen 3 等多种图片模型，对外提供 OpenAI 兼容 API。

**核心能力：** 文生图 / 图生图 / 提示词画廊（11,600+ 条） / 支付宝支付 / 多模型切换 / API 接入

---

## 项目结构

```
imagerelay/
├── backend/                         # new-api 后端源码（vendored，可定制）
│   └── new-api/                     # QuantumNous/new-api Go 源码
│       ├── main.go                  # Go 入口
│       ├── Dockerfile               # 多阶段构建（bun 前端 + golang 后端）
│       ├── controller/              # API 控制器
│       ├── model/                   # GORM 数据模型
│       ├── relay/                   # 上游模型适配（openai/gemini/claude 等）
│       └── router/                  # Gin 路由
├── doc/                             # Code Wiki 文档（结构化）
│   ├── README.md                    # Wiki 导航
│   ├── 01-architecture.md           # 整体架构
│   ├── 02-frontend.md               # 前端详解
│   ├── 03-modules.md                # 模块详解
│   ├── 04-key-functions.md          # 关键类与函数
│   ├── 05-backend.md                # 后端 new-api 说明
│   └── 06-infra-and-running.md      # 基础设施与运行方式
├── frontend/                        # Vue 3 SPA
│   ├── src/
│   │   ├── api/                     # API 封装（auth / images / user / payment / gallery）
│   │   ├── assets/styles/           # 全局样式 + Tailwind 组件层
│   │   ├── components/              # 公共组件（AppHeader / AppFooter / ImagePreview 等）
│   │   ├── views/                   # 页面视图（9 个）
│   │   ├── stores/                  # Pinia 状态管理（auth，双 Token 认证）
│   │   └── router/                  # Vue Router + 路由守卫
│   ├── tailwind.config.js           # 浅蓝科技主题配置
│   └── vite.config.ts               # Vite 配置 + 开发代理
├── infra/                           # 基础设施
│   ├── docker-compose.yml           # Docker Compose（new-api + MySQL + Redis + Nginx）
│   └── nginx.conf                   # Nginx 反向代理
├── docs/                            # 历史设计文档
│   ├── DESIGN_PLAN.md               # 原始设计方案
│   ├── REVIEW_REPORTS.md            # 三轮审核报告
│   └── design-preview.html          # UI 预览（浏览器打开）
├── DESIGN.md                        # 实用设计文档 v2.0（开发权威参考）
└── README.md                        # 本文件
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite 5 + TypeScript |
| 样式 | TailwindCSS 3.4（#3B82F6 浅蓝科技主题）|
| 状态管理 | Pinia（auth store，双 Token 认证）|
| HTTP 客户端 | Axios |
| 后端网关 | [new-api (QuantumNous)](https://github.com/QuantumNous/new-api) — Go + Gin + GORM，源码 vendored 在 `backend/new-api/`，可定制化开发 |
| 数据库 | MySQL 8.0（生产）/ SQLite（开发）|
| 缓存 | Redis 7 |
| Web 服务器 | Nginx（反向代理 + SPA 静态托管）|
| 容器化 | Docker + Docker Compose |

---

## 架构说明

### 后端底座：new-api vs One API

本项目从 One API 迁移到 new-api (QuantumNous)。关键差异：

| 项目 | One API | new-api (QuantumNous) |
|------|---------|----------------------|
| 语言 | Go | Go + Gin + GORM |
| 管理接口路径 | `/api/v1/users/*` | `/api/user/*` |
| Relay 接口路径 | `/api/v1/images/*` | `/v1/images/*`（无 /api 前缀）|
| Token 接口 | `/api/v1/tokens` | `/api/token/`（单数）|
| 内置支付 | 无 | 易支付（epay）|
| 管理接口认证 | Bearer Token | Bearer Token + `New-Api-User` Header |

### 认证双轨

前端同时维护两个凭证：

1. **Session Token** — 登录获取，用于管理接口（`/api/*`），如获取用户信息、创建 Token、充值码充值
2. **API Key (sk-xxx)** — 通过 Token 接口创建，用于 Relay 生图接口（`/v1/*`）

首次登录后自动创建 API Key，存储在 `localStorage`。

### API 路径映射

| 功能 | 方法 | 路径 | 认证方式 |
|------|------|------|----------|
| 登录 | POST | `/api/user/login` | 无 |
| 注册 | POST | `/api/user/register` | 无 |
| 用户信息 | GET | `/api/user/self` | Session Token |
| 生成图片 | POST | `/v1/images/generations` | API Key |
| 模型列表 | GET | `/v1/models` | API Key |
| 创建 Token | POST | `/api/token/` | Session Token |
| Token 列表 | GET | `/api/token/` | Session Token |
| 删除 Token | DELETE | `/api/token/:id` | Session Token |
| 充值码充值 | POST | `/api/user/topup` | Session Token |
| 使用日志 | GET | `/api/log/` | Session Token |

---

## 部署指南

### 环境要求

| 项目 | 最低要求 |
|------|----------|
| 服务器 | 2 核 2G+，推荐海外节点（访问 OpenAI）|
| 系统 | Ubuntu 20.04+ / Debian 11+ |
| Docker | >= 20.10 |
| Docker Compose | >= 2.0 |
| 域名 | 已解析到服务器 IP |
| SSL 证书 | Let's Encrypt 或其他 |

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

构建产物在 `frontend/dist/` 目录。

### 第三步：复制前端产物到 infra

```bash
mkdir -p infra/frontend-dist
cp -r frontend/dist/* infra/frontend-dist/
```

### 第四步：准备 SSL 证书

使用 Let's Encrypt（免费）：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请证书（先停 80 端口或用 standalone 模式）
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到 infra/ssl/
mkdir -p infra/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/ssl/key.pem
sudo chmod 644 infra/ssl/cert.pem infra/ssl/key.pem
```

### 第五步：修改 Nginx 配置

编辑 `infra/nginx.conf`，将 `server_name` 改为你的域名：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;   # ← 改成你的域名
    ...
}
```

### 第六步：配置环境变量

在 `infra/` 目录下创建 `.env` 文件：

```bash
# infra/.env
MYSQL_ROOT_PASSWORD=your-secure-password
SESSION_SECRET=random-string-here
```

### 第七步：启动 Docker Compose（从源码构建后端）

```bash
cd infra
docker compose up -d --build   # --build 从 backend/new-api 源码构建 new-api 镜像
```

> 首次构建约 5-10 分钟（多阶段构建：bun 前端 + golang 编译）。后续启动秒级。
> 若无需定制后端，可改用官方镜像：编辑 `docker-compose.yml` 注释 `build:` 段，取消注释 `image: calciumion/new-api:latest`。

验证服务状态：

```bash
docker compose ps
# 确认所有容器 status 为 Up
```

### 第八步：配置 new-api 管理后台

1. 访问 `http://your-server-ip:3000`
2. 使用默认账号登录：`root` / `123456`
3. **立即修改默认密码**
4. 进入 **渠道管理** → **添加新的渠道**：
   - 类型选择 OpenAI 或对应的模型提供商
   - 填入你的 API Key（如 OpenAI API Key）
   - 添加模型：`gpt-image-1`, `dall-e-3`, `imagen-3`
5. 进入 **令牌管理** → 创建测试令牌，验证生图功能

### 第九步：验证

```bash
# 测试前端页面
curl -I https://your-domain.com

# 测试生图 API（用管理后台创建的 Token）
curl https://your-domain.com/v1/images/generations \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-image-1","prompt":"a cat sitting on a rainbow","n":1,"size":"1024x1024"}'
```

部署完成后的访问地址：

- 前端：`https://your-domain.com`
- new-api 管理后台：`https://your-domain.com/api/`（通过 Nginx 代理）或直接 `http://server-ip:3000`

---

## 本地开发

### 启动后端（Docker，从源码构建）

```bash
# 从 vendored 源码构建并启动 new-api（含 MySQL + Redis）
cd infra
docker compose up -d --build new-api mysql redis

# 验证
docker compose ps
curl http://localhost:3000/api/status
```

> 首次构建约 5-10 分钟（多阶段：bun 前端 + golang 编译）。后续启动秒级。

### 定制后端开发

后端源码 vendored 在 `backend/new-api/`，可随时修改：

```bash
# 1. 编辑 backend/new-api/ 下的 Go 源码
# 2. 重新构建并启动 new-api 容器
cd infra
docker compose up -d --build new-api
docker compose logs -f new-api   # 查看日志
```

常见定制场景见 [doc/05-backend.md](doc/05-backend.md) 的"定制化开发指引"章节。

### 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

前端通过 Vite 开发代理连接后端：

| 前端请求路径 | 代理目标 |
|-------------|---------|
| `/api/pay/*` | `http://localhost:3001`（支付微服务，Phase 4）|
| `/api/*` | `http://localhost:3000`（new-api 管理接口）|
| `/v1/*` | `http://localhost:3000`（new-api Relay 接口）|

### 前端开发要点

- 设计系统定义在 `src/assets/styles/global.css`，所有组件使用 `card` / `btn-primary` / `input-field` / `chip` 等预定义类
- `App.vue` 统一提供 Header + Footer，**所有 View 组件禁止**自行引入 `AppHeader` / `AppFooter`
- 认证使用 `stores/auth.ts` 中的 `useAuthStore()`，提供 `login` / `register` / `logout` / `fetchUser` / `ensureApiKey`
- 生图调用使用 `api/images.ts` 中的 `imagesApi.generate()`，自动携带 API Key

---

## Nginx 路由规则

```
/               → Nginx 静态文件（前端 SPA）
/api/user/*     → new-api:3000（管理接口：登录/注册/用户信息/充值）
/api/token/*    → new-api:3000（Token 管理）
/api/log/*      → new-api:3000（使用日志）
/v1/*           → new-api:3000（Relay 接口：生图/模型列表）
/api/pay/*      → payment:3001（支付微服务，Phase 4 实现）
```

---

## 支付（规划中）

Phase 4 将接入支付宝支付。优先评估 new-api 内置的易支付（epay）网关，如不满足需求再搭建独立 Node.js 支付微服务。

套餐规划：

| 套餐 | 价格 | 积分 | 单价 |
|------|------|------|------|
| 体验包 | 19.9 | 50 | 0.40/张 |
| 标准包 | 49.9 | 150 | 0.33/张 |
| 专业包 | 99.9 | 400 | 0.25/张 |
| 企业包 | 299.9 | 1500 | 0.20/张 |

---

## 故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| 前端白屏 | dist 未正确复制到 frontend-dist | 重新执行第三步 |
| 502 Bad Gateway | new-api 容器未启动 | `docker compose ps` → `docker compose restart` |
| 登录失败 404 | API 路径错误 | 确认 nginx 代理 `/api/` 和 `/v1/` 均指向 new-api |
| 生图超时 | API Key 无效或模型未配置 | 管理后台 → 渠道管理 → 检查 Key 和模型 |
| CORS 错误 | new-api 未配置允许来源 | 管理后台 → 系统设置 → 运营设置 → CORS |
| 401 Unauthorized | Token/Key 过期 | 退出重新登录，或管理后台重建 Token |

---

## 文档

### Code Wiki（结构化代码文档）

- [doc/README.md](doc/README.md) — Wiki 导航首页
- [doc/01-architecture.md](doc/01-architecture.md) — 项目整体架构
- [doc/02-frontend.md](doc/02-frontend.md) — 前端详解
- [doc/03-modules.md](doc/03-modules.md) — 模块详解
- [doc/04-key-functions.md](doc/04-key-functions.md) — 关键类与函数说明
- [doc/05-backend.md](doc/05-backend.md) — 后端 new-api 说明
- [doc/06-infra-and-running.md](doc/06-infra-and-running.md) — 基础设施与运行方式

### 设计文档

- [DESIGN.md](DESIGN.md) — 实用设计文档 v2.0（开发权威参考）
- [backend/README.md](backend/README.md) — vendored new-api 源码说明
- [docs/DESIGN_PLAN.md](docs/DESIGN_PLAN.md) — 原始设计方案
- [docs/REVIEW_REPORTS.md](docs/REVIEW_REPORTS.md) — 三轮审核报告
- [docs/design-preview.html](docs/design-preview.html) — UI 视觉预览

---

## License

MIT License - 2026 ImageRelay
