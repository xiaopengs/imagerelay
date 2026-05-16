# 🐾 ImageRelay

<div align="center">

**面向全球用户的 AI 生图 SaaS 平台**

*GPT Image 2 · Gemini Imagen · One API 中转网关*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)
[![Vue.js 3](https://img.shields.io/badge/Vue.js-3-42b883?logo=vuedotjs)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 🎯 项目简介

ImageRelay 是一个 AI 生图 SaaS 平台，聚合接入 GPT Image 2（OpenAI）和 Gemini Imagen（Google）两大模型，通过 One API 中转网关统一对外提供服务，支持文生图、图生图、API 接入、充值码计费。

**核心能力：** 文生图 / 图生图 / API 接入 / 充值码计费 / 额度管理

---

## 📁 项目结构

```
imagerelay/
├── frontend/                    # Vue.js 3 SPA（Vite + TypeScript + TailwindCSS）
│   ├── src/
│   │   ├── api/                 # API 封装（auth / images / user）
│   │   ├── components/           # 公共组件（AppHeader / PromptInput / ImagePreview...）
│   │   ├── views/                # 页面（10个）：登录/注册/文生图/图生图/控制台...
│   │   ├── stores/               # Pinia 状态管理（auth + credits）
│   │   └── router/               # Vue Router + 路由守卫
│   └── dist/                     # 生产构建产物
├── infra/                        # 基础设施配置
│   ├── docker-compose.yml        # Docker Compose 编排（One API + Nginx）
│   ├── nginx.conf                # Nginx 反向代理配置
│   └── README.md                 # 部署文档
├── docs/
│   └── index.html                # 静态部署指南页（浏览器直接打开）
├── SPEC.md                       # 产品规格书（唯一真实来源）
└── README.md                     # 项目总览（本文件）
```

---

## 🚀 快速部署

### 环境要求

| 要求 | 规格 |
|------|------|
| 服务器 | 2核2G+，推荐新加坡/日本节点 |
| 域名 | 已解析到服务器 IP |
| Docker | ≥ 20.10 |
| Docker Compose | ≥ 2.0 |
| SSL 证书 | Let's Encrypt 或商业证书 |

### 7 步完成部署

```bash
# 1. 克隆项目
git clone https://github.com/xiaopengs/imagerelay.git && cd imagerelay

# 2. 构建前端
cd frontend && npm install && npm run build && cd ..

# 3. 复制构建产物
mkdir -p infra/frontend-dist && cp -r frontend/dist/* infra/frontend-dist/

# 4. 申请 SSL 证书（如已有，跳过）
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
mkdir -p infra/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem infra/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem infra/ssl/key.pem

# 5. 修改 nginx.conf 中的域名（your-domain.com → 真实域名）

# 6. 启动服务
cd infra && docker-compose up -d

# 7. 配置 One API 管理后台
# 访问 http://your-ip:3000，登录 root/123456，立即修改密码
# 渠道管理 → 添加 OpenAI Key + 模型 gpt-image-2, dall-e-3
```

**部署完成：**
- 前端：`https://your-domain.com`
- 管理后台：`https://your-domain.com/api/`

详细步骤见 [docs/index.html](docs/index.html) 或 [infra/README.md](infra/README.md)。

---

## 💻 本地开发

```bash
git clone https://github.com/xiaopengs/imagerelay.git && cd imagerelay
cd frontend && npm install

# 启动 One API（Docker）
docker run --name one-api-dev -d -p 3000:3000 -e TZ=Asia/Shanghai justsong/one-api

# 启动前端开发服务器
npm run dev   # → http://localhost:5173
```

前端通过 Vite 代理连接 One API（`/api/*` → `localhost:3000`）。

---

## 🔌 API 文档

Base URL：`https://your-domain.com`

### 认证

```
Authorization: Bearer <your-api-token>
```

Token 在 One API 管理后台 → 令牌管理 → 创建令牌获取。

### 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/v1/images/generations` | 生成图片（文生图/图生图）|
| `GET`  | `/v1/models` | 获取可用模型列表 |
| `GET`  | `/api/v1/users/me` | 获取用户信息（含余额）|
| `POST` | `/api/v1/users/top_up` | 充值码充值 |
| `POST` | `/api/v1/tokens` | 创建 API Token |
| `GET`  | `/api/v1/tokens` | 获取用户所有 Token |
| `DELETE` | `/api/v1/tokens/:id` | 删除 Token |

### 示例

```bash
curl https://your-domain.com/v1/images/generations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"dall-e-3","prompt":"a futuristic city at night","n":1,"size":"1024x1024"}'
```

---

## 🧩 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue.js 3 + Vite + TypeScript |
| 样式 | TailwindCSS（#7C6AF5 紫蓝主色系）|
| 状态管理 | Pinia（auth + credits）|
| HTTP 客户端 | Axios |
| 后端网关 | One API（MIT，开源）|
| Web 服务器 | Nginx（反向代理 + 静态托管）|
| 容器化 | Docker + Docker Compose |
| 数据库 | SQLite（开发）/ MySQL（生产）|
| SSL | Let's Encrypt（Certbot）|

---

## 🛡️ 安全建议

- 首次部署后立即修改 One API 默认密码（root/123456）
- HTTPS 强制（nginx.conf 已配置 HTTP→HTTPS 重定向）
- One API 管理后台仅通过 Nginx 访问，不对外暴露 3000 端口
- 建议配置 CORS 白名单（管理后台 → 系统设置 → 允许来源）
- 高价值用户建议设置 IP 白名单（令牌管理）

---

## 🐛 故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| 502 | One API 未启动 | `docker-compose ps` → `docker-compose restart` |
| 生成失败 | API Key 无效或渠道禁用 | 管理后台 → 渠道管理 → 检查 Key 和余额 |
| 上传报错 | Nginx 文件大小限制 | nginx.conf 中 `client_max_body_size 20M` |
| CORS 错误 | One API 未配置允许来源 | 管理后台 → 系统设置 → 允许来源填写你的域名 |

---

## 📄 许可证

MIT License · © 2026 ImageRelay · 由 **🐾 黑爪爪** 设计开发

---

*详细部署文档：* [docs/index.html](docs/index.html) · [infra/README.md](infra/README.md)