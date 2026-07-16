# ImageRelay

**GPT Image 2 AI 生图 SaaS 平台**

*GPT Image 2 / DALL-E 3 / Imagen 3 / MiniMax / 豆包 Seedream — 多模型 AI 图片创作平台*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue.js 3](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)

---

## 项目简介

ImageRelay 是一个基于 [new-api (QuantumNous)](https://github.com/QuantumNous/new-api) 作为后端底座的 AI 生图 SaaS 平台。前端使用 Vue 3 + TypeScript + TailwindCSS 构建，后端通过 new-api 统一管理 GPT Image 2、DALL-E 3、Imagen 3、MiniMax、豆包 Seedream 等多种图片模型，对外提供 OpenAI 兼容 API。

**核心能力：** 文生图 / 图生图 / MiniMax 原生生图 / 提示词画廊（11,600+ 条） / 支付宝支付 / 多模型切换 / API 接入

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
│   │   ├── api/                     # API 封装（auth / images / minimax / openrouter / user / payment / gallery）
│   │   ├── assets/styles/           # 全局样式 + Tailwind 组件层
│   │   ├── components/              # 公共组件（AppHeader / AppFooter / ImagePreview 等）
│   │   ├── views/                   # 页面视图（9 个）
│   │   ├── stores/                  # Pinia 状态管理（auth，双 Token 认证）
│   │   ├── utils/                  # 工具函数（format / toast / promptHelpers）+ 单元测试
│   │   └── router/                  # Vue Router + 路由守卫
│   ├── vitest.config.ts            # Vitest 测试配置
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
   - 添加模型：`gpt-image-1`, `dall-e-3`, `imagen-3`, `image-01`, `MiniMax-M3`, `doubao-seedream-5-0-pro-260628`
   - 如需 MiniMax 生图，类型选择 MiniMax，填入 MiniMax API Key
   - 如需豆包 Seedream 生图，类型选择 VolcEngine，填入火山引擎 API Key
5. 进入 **令牌管理** → 创建测试令牌，验证生图功能

### 第九步：验证

```bash
# 测试前端页面
curl -I https://your-domain.com

# 测试生图 API — OpenAI 模型（用管理后台创建的 Token）
curl https://your-domain.com/v1/images/generations \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-image-1","prompt":"a cat sitting on a rainbow","n":1,"size":"1024x1024"}'

# 测试生图 API — MiniMax image-01 模型
curl https://your-domain.com/v1/images/generations \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"image-01","prompt":"a cat sitting on a rainbow","n":1,"size":"1024x1024"}'
```

部署完成后的访问地址：

- 前端：`https://your-domain.com`
- new-api 管理后台：`https://your-domain.com/api/`（通过 Nginx 代理）或直接 `http://server-ip:3000`

---

## Zeabur 部署（PaaS 一键部署）

适用于 Zeabur、Railway 等 PaaS 平台。**与上面 VPS 部署互斥，二选一即可。** 仓库根目录已提供 [Dockerfile](Dockerfile) + [zeabur-nginx.conf](zeabur-nginx.conf) + [zeabur-entrypoint.sh](zeabur-entrypoint.sh)，无需额外配置文件。

### 服务拓扑（4 个服务）

| 服务 | 作用 | 来源 | 公网暴露 |
|------|------|------|----------|
| **MySQL 8.0** | 数据库 | Zeabur Marketplace | ❌ 仅内部 |
| **Redis 7** | 缓存 | Zeabur Marketplace | ❌ 仅内部 |
| **new-api** | 后端网关（Go） | Git → `backend/new-api/Dockerfile` | ⚠️ 可选 |
| **前端全栈** | Vue SPA + Nginx 反代 | Git → 根目录 `Dockerfile` | ✅ 必须 |

### 配置说明

#### 服务1：MySQL（Zeabur Marketplace）

1. Add Service → Marketplace → MySQL 8.0
2. 创建后，在 **Variables** 标签获取连接信息：
   - `MYSQL_HOST`（如 `zeabur-mysql-xxx.zeabur.internal`）
   - `MYSQL_PORT`（如 `3306`）
   - `MYSQL_USERNAME` = `root`
   - `MYSQL_PASSWORD`（自动生成）
   - `MYSQL_DATABASE` = `newapi`（需手动创建数据库）

#### 服务2：Redis（Zeabur Marketplace）

1. Add Service → Marketplace → Redis 7
2. 获取 `REDIS_HOST` 和 `REDIS_PORT`（无密码或自动生成密码）

#### 服务3：new-api 后端（Git 构建）

1. Add Service → Git → 选择 `imagerelay` 仓库
2. **Build Configuration**：
   - **Root Directory / Build Context**：`backend/new-api/`（重要！指向 vendored 源码目录）
   - Zeabur 自动识别该目录下的 [Dockerfile](backend/new-api/Dockerfile)
3. **服务名必须设为 `new-api`**（前端默认通过 `http://new-api:3000` 访问）
4. **Variables** 标签配置环境变量：

   ```
   SQL_DSN=root:<MYSQL_PASSWORD>@tcp(<MYSQL_HOST>:<MYSQL_PORT>)/newapi?charset=utf8mb4
   REDIS_CONN_STRING=redis://<REDIS_HOST>:<REDIS_PORT>
   SESSION_SECRET=<openssl rand -hex 32 生成的随机字符串>
   TZ=Asia/Shanghai
   ```

   > `SQL_DSN` 中的 `<MYSQL_PASSWORD>` 等用服务1的实际值替换。

5. **Networking**：
   - **暴露端口**：`3000`
   - **公网域名**：可不绑定（仅内部通信），也可绑定如 `api.imagerelay.zeabur.app` 方便直接访问管理后台
6. 等待构建完成（首次约 5-10 分钟，多阶段：bun 前端 + golang 编译）

#### 服务4：前端全栈（Git 构建）

1. Add Service → Git → 选择同一仓库
2. **Build Configuration**：
   - **Root Directory / Build Context**：`/`（根目录，默认）
   - Zeabur 自动识别根目录 [Dockerfile](Dockerfile)（多阶段：node:20 构建前端 + nginx:alpine 托管）
3. **Variables** 标签：
   - 如果服务3命名为 `new-api`：**无需配置**（默认值 `http://new-api:3000` 已对齐）
   - 如果服务3命名为其他名字：添加 `NEW_API_URL=http://<实际服务名>:3000`
4. **Networking**：
   - **暴露端口**：`80`
   - **公网域名**：绑定你的域名，如 `imagerelay.zeabur.app` 或自定义域名

### 对外访问地址（公网）

部署完成后，**仅前端服务需要绑定公网域名**，所有 API 调用通过前端 Nginx 反代到内部 new-api。

| 用途 | 访问地址 | 说明 |
|------|----------|------|
| **前端用户界面** | `https://<前端域名>/` | Vue 3 SPA，用户注册/登录/生图 |
| **OpenAI 兼容 API** | `https://<前端域名>/v1/*` | 外部接入用，如 `https://imagerelay.zeabur.app/v1/images/generations` |
| **new-api 管理后台** | `https://<前端域名>/api/` | 通过前端 Nginx 反代访问（推荐）|
| new-api 直连（可选） | `https://<new-api独立域名>/` | 仅当服务3也绑定了公网域名时可用 |

> 💡 推荐做法：只给前端服务绑定公网域名，new-api/MySQL/Redis 全部保持内部访问。这样所有流量都经过前端 Nginx，便于统一鉴权和限流。

### 内部服务互访地址（仅 Zeabur 项目内可见）

```
前端 ──> http://new-api:3000         （Nginx 反代 /api/* 和 /v1/*）
new-api ──> mysql:3306                （GORM 连接）
new-api ──> redis:6379                （缓存）
```

Zeabur 同项目内服务可用 `http://<服务名>:<端口>` 互访，无需公网域名。

### 部署后初始化

1. 访问 `https://<前端域名>/api/` → new-api 管理后台
2. 登录 `root` / `123456` → **立即修改密码**
3. **渠道管理** → 添加渠道（见下方 [模型配置教程](#模型配置教程)）
4. **系统设置** → CORS 允许来源：`https://<前端域名>`
5. 访问 `https://<前端域名>/` → 注册账号测试生图

### Zeabur 部署故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| 前端 502 | new-api 服务未启动或服务名不对 | 确认服务3命名为 `new-api`，或在前端设置 `NEW_API_URL` |
| 前端能显示但登录失败 | `SQL_DSN` 配置错误 | 检查 MySQL 连接信息，确认数据库 `newapi` 已创建 |
| 生图报错 | 渠道未配置 | 管理后台 → 渠道管理 → 添加 OpenAI 渠道和模型 |
| 构建失败 | `vue-tsc` 类型检查 | 根目录 Dockerfile 已用 `npx vite build` 跳过，无需处理 |
| new-api 构建超时 | Go 编译耗时长 | 首次 5-10 分钟属正常，Zeabur 会自动重试 |

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
- MiniMax 生图使用 `api/minimax.ts` 中的 `generateImageViaMiniMax()`，直接调用 MiniMax 原生 API
- 豆包 Seedream 使用 `api/volcengine.ts` 中的模型分类和 API 客户端，通过 new-api 中转
- 运行测试：`cd frontend && npx vitest run`（77 个测试用例，含 MiniMax 集成测试）

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

## 模型配置教程

ImageRelay 支持多种生图模型，通过 new-api 管理后台的 **渠道管理** 统一配置。每种模型对应一个"渠道"，填入对应提供商的 API Key 即可。

### 支持的模型

| 模型 ID | 名称 | 提供商 | 生图能力 | API 兼容格式 |
|---------|------|--------|---------|-------------|
| `gpt-image-1` | GPT Image 2 | OpenAI | ✅ 文生图 / 图生图 | OpenAI Images API |
| `dall-e-3` | DALL-E 3 | OpenAI | ✅ 文生图 | OpenAI Images API |
| `imagen-3` | Imagen 3 | Google | ✅ 文生图 | OpenAI Images API（new-api 中转）|
| `image-01` | MiniMax 图生图 | MiniMax | ✅ 文生图 | OpenAI Images API（new-api 自动转换）|
| `MiniMax-M3` | MiniMax M3 | MiniMax | ❌ 仅文本 | Anthropic Messages API |
| `doubao-seedream-5-0-pro-260628` | 豆包 Seedream 5.0 Pro | VolcEngine | ✅ 文生图 / 图生图 | OpenAI Images API（new-api 中转）|
| `doubao-seedream-5-0-260128` | 豆包 Seedream 5.0 | VolcEngine | ✅ 文生图 | OpenAI Images API（new-api 中转）|
| `doubao-seedream-5-0-lite-260128` | 豆包 Seedream 5.0 Lite | VolcEngine | ✅ 文生图 | OpenAI Images API（new-api 中转）|
| `doubao-seedream-4-5-251128` | 豆包 Seedream 4.5 | VolcEngine | ✅ 文生图 | OpenAI Images API（new-api 中转）|
| `doubao-seedream-4-0-250828` | 豆包 Seedream 4.0 | VolcEngine | ✅ 文生图 | OpenAI Images API（new-api 中转）|

### 配置 OpenAI 模型（GPT Image 2 / DALL-E 3）

1. 管理后台 → **渠道管理** → **添加新的渠道**
2. 类型选择 **OpenAI**
3. 填入你的 OpenAI API Key（`sk-...`）
4. 模型填写：`gpt-image-1, dall-e-3`
5. 代理设置（可选）：如需通过代理访问，填写 Base URL
6. 点击 **测试** 验证连通性，然后保存

> **注意：** `gpt-image-1` 是 GPT Image 2 的 API 模型名，不是 `gpt-image-2`。

### 配置 Google Imagen 3

1. 管理后台 → **渠道管理** → **添加新的渠道**
2. 类型选择 **Google AI Studio** 或 **Vertex AI**
3. 填入 Google API Key 或 Service Account 凭证
4. 模型填写：`imagen-3`
5. 保存并测试

### 配置 MiniMax 模型（image-01 / MiniMax-M3）

MiniMax 提供两个模型：

- **image-01** — 图片生成模型，通过 `/v1/images/generations` 调用，new-api 自动将 OpenAI 格式转换为 MiniMax 原生 `/v1/image_generation` 接口
- **MiniMax-M3** — 文本模型（Anthropic 兼容），仅支持文本对话，**不能生图**

#### 方式一：通过 new-api 中转（推荐）

1. 管理后台 → **渠道管理** → **添加新的渠道**
2. 类型选择 **MiniMax**
3. 填入 MiniMax API Key（`sk-cp-...` 格式，从 [MiniMax 开放平台](https://platform.minimaxi.com/) 获取）
4. 模型填写：`image-01, MiniMax-M3`
5. Base URL 填写：`https://api.minimaxi.com`
6. 保存并测试

> 通过 new-api 中转时，前端使用标准的 `imagesApi.generate()` 即可，模型选 `image-01`，new-api 自动处理格式转换（OpenAI 尺寸 → MiniMax 宽高比等）。

#### 方式二：前端直接调用 MiniMax 原生 API

ImageRelay 前端内置了 MiniMax 原生 API 客户端（`api/minimax.ts`），当用户选择 `image-01` 模型时，前端会：

1. 检测模型为 MiniMax 类型
2. 直接调用 MiniMax `/v1/image_generation` 接口
3. 自动将 OpenAI 尺寸格式（如 `1024x1024`）转换为 MiniMax 宽高比（如 `1:1`）

支持的宽高比映射：

| OpenAI 尺寸 | MiniMax 宽高比 |
|-------------|---------------|
| `1024x1024` | `1:1` |
| `1792x1024` | `16:9` |
| `1024x1792` | `9:16` |
| `1536x1024` | `3:2` |
| `1024x1536` | `2:3` |
| `1152x864` | `4:3` |
| `864x1152` | `3:4` |
| `1344x576` | `21:9` |

> **注意：** 直接调用模式需要用户的 MiniMax API Key 存储在前端。推荐使用方式一（new-api 中转），Key 安全地存储在服务端。

### 配置豆包 Seedream 5.0（VolcEngine）

豆包 Seedream 是字节跳动推出的 AI 图片生成模型系列，通过火山引擎 Ark 平台提供 API。支持文生图、图生图、多图融合、组图生成等高级功能。

**Seedream 5.0 系列：**

| 模型 ID | 说明 |
|---------|------|
| `doubao-seedream-5-0-pro-260628` | 5.0 Pro — 最高画质，支持交互编辑 |
| `doubao-seedream-5-0-260128` | 5.0 标准版 |
| `doubao-seedream-5-0-lite-260128` | 5.0 Lite — 速度快，性价比高 |
| `doubao-seedream-4-5-251128` | 4.5 版本 |
| `doubao-seedream-4-0-250828` | 4.0 版本 |

#### 配置步骤

1. 管理后台 → **渠道管理** → **添加新的渠道**
2. 类型选择 **VolcEngine**
3. 填入 VolcEngine API Key（从 [火山引擎控制台](https://console.volcengine.com/ark) 获取）
4. 模型填写：`doubao-seedream-5-0-pro-260628, doubao-seedream-5-0-lite-260128, doubao-seedream-4-5-251128`
5. Base URL 默认：`https://ark.cn-beijing.volces.com`（通常自动填充）
6. 保存并测试

#### Seedream 特有参数

Seedream 模型在标准 OpenAI Images API 基础上，支持以下额外参数（通过 `extra_body` 传递）：

| 参数 | 类型 | 说明 |
|------|------|------|
| `image` | string 或 string[] | 参考图片 URL，支持单图/多图输入 |
| `output_format` | string | 输出格式：`png`、`jpeg`、`webp` |
| `watermark` | boolean | 是否添加水印（默认 false）|
| `size` | string | 支持 `1024x1024`、`2K`、`1K` 等特殊尺寸 |
| `sequential_image_generation` | string | 组图生成：`auto` 或 `disabled` |
| `sequential_image_generation_prompt` | string | 组图生成提示词 |

> **图生图说明：** 选择 Seedream 模型后，在"图生图"模式下上传参考图片，前端会自动将图片作为 `image` 参数传递。

### 配置 OpenRouter（可选）

OpenRouter 聚合了多家模型提供商，可作为备用渠道：

1. 管理后台 → **渠道管理** → **添加新的渠道**
2. 类型选择 **OpenRouter**
3. 填入 OpenRouter API Key（从 [openrouter.ai](https://openrouter.ai/) 获取）
4. 模型填写支持的图片生成模型 ID（如 `openai/dall-e-3` 等）
5. Base URL 填写：`https://openrouter.ai/api/v1`
6. 保存并测试

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
| MiniMax 生图失败 | 渠道类型或 Key 不对 | 确认渠道类型选 MiniMax，Key 以 `sk-cp-` 开头 |
| image-01 返回文本 | MiniMax-M3 不支持生图 | 选择 `image-01` 模型而非 `MiniMax-M3` |
| Seedream 生图 401 | VolcEngine Key 无效 | 确认渠道类型选 VolcEngine，Key 来自火山引擎控制台 |
| Seedream 返回空图 | 模型 ID 不完整 | 使用完整模型 ID 如 `doubao-seedream-5-0-pro-260628` |

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

### 测试

- 前端测试框架：Vitest + happy-dom
- 运行测试：`cd frontend && npx vitest run`
- 测试覆盖 77 个用例，包括：
  - `api/auth.test.ts` — 认证 API 单元测试
  - `api/gallery.test.ts` — 画廊 API 单元测试
  - `api/images.test.ts` — 图片 API 单元测试
  - `api/minimax.test.ts` — MiniMax 集成测试（Anthropic 兼容 + 原生图片 API）
  - `api/openrouter.test.ts` — OpenRouter 集成测试
  - `api/volcengine.test.ts` — VolcEngine/Seedream 模型分类与 API 测试
  - `router/index.test.ts` — 路由配置测试
  - `utils/format.test.ts` — 格式化工具测试
  - `utils/promptHelpers.test.ts` — 提示词辅助测试
  - `utils/toast.test.ts` — Toast 通知测试

### 设计文档

- [DESIGN.md](DESIGN.md) — 实用设计文档 v2.0（开发权威参考）
- [backend/README.md](backend/README.md) — vendored new-api 源码说明
- [docs/DESIGN_PLAN.md](docs/DESIGN_PLAN.md) — 原始设计方案
- [docs/REVIEW_REPORTS.md](docs/REVIEW_REPORTS.md) — 三轮审核报告
- [docs/design-preview.html](docs/design-preview.html) — UI 视觉预览

---

## License

MIT License - 2026 ImageRelay
