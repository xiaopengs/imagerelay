# 01 - 项目整体架构

> 本文档描述 ImageRelay 的整体架构、数据流、认证机制与路由规则。

---

## 一、三层架构总览

ImageRelay 采用经典的"前端 SPA + 后端 API 网关 + 基础设施"三层架构：

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
│                   （Vue 3 SPA 前端）                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx 反向代理                            │
│   /        → 前端静态文件（SPA）                              │
│   /api/*   → new-api 管理接口                                │
│   /v1/*    → new-api Relay 接口（OpenAI 兼容）               │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
             ▼                       ▼
┌────────────────────────┐  ┌─────────────────────────────────┐
│   前端静态文件          │  │         new-api 后端              │
│  (frontend/dist/)      │  │  (backend/new-api/ Go 源码)      │
│  HTML/JS/CSS           │  │  Go + Gin + GORM                 │
└────────────────────────┘  │                                  │
                            │  管理接口 /api/user/* /api/token/* │
                            │  Relay 接口 /v1/images/* /v1/models│
                            └────────┬───────────────┬─────────┘
                                     │               │
                                     ▼               ▼
                            ┌──────────────┐ ┌──────────────┐
                            │  MySQL 8.0   │ │  Redis 7     │
                            │  (持久化)     │ │  (缓存/会话)  │
                            └──────────────┘ └──────────────┘
```

### 各层职责

| 层级 | 职责 | 实现 | 源码位置 |
|------|------|------|----------|
| 前端 | 用户界面、交互、状态管理、API 调用 | Vue 3 SPA | `frontend/src/` |
| 后端 | API 网关、用户管理、Token 管理、模型路由、计费 | new-api (Go + Gin + GORM) | `backend/new-api/`（vendored 源码） |
| 基础设施 | 容器编排、反向代理、SSL、数据持久化 | Docker Compose + Nginx | `infra/` |

---

## 二、核心数据流

### 2.1 生图请求流（核心业务）

```
用户输入提示词 → CreateView.vue
   ↓
imagesApi.generate()  →  POST /v1/images/generations
   ↓  (携带 API Key: Bearer sk-xxx)
Nginx 反向代理  →  new-api:3000/v1/images/generations
   ↓
new-api 根据模型路由到上游（OpenAI / Google 等）
   ↓
返回图片 URL / base64
   ↓
前端 ImagePreview 组件渲染
```

### 2.2 登录认证流

```
用户输入邮箱密码 → LoginView.vue
   ↓
authApi.login()  →  POST /api/user/login
   ↓
new-api 返回 session token
   ↓
stores/auth.ts setToken()  →  存入 localStorage('token')
   ↓
fetchUser()  →  GET /api/user/self  →  获取用户信息（quota 等）
   ↓
ensureApiKey()  →  POST /api/token/  →  创建 API Key
   ↓
setApiKey()  →  存入 localStorage('apiKey')  (sk-xxx)
   ↓
跳转 /console
```

---

## 三、认证双轨机制

new-api 有两套独立的认证机制，前端必须正确区分使用：

| 认证方式 | 适用范围 | 存储位置 | 格式 | Header 构造 |
|----------|----------|----------|------|-------------|
| **Session Token** | 管理接口 `/api/*`（登录、用户信息、Token CRUD、充值、日志） | `localStorage('token')` | 字符串 | `Authorization: Bearer <token>` |
| **API Key** | Relay 接口 `/v1/*`（生图、模型列表） | `localStorage('apiKey')` | `sk-xxx` | `Authorization: Bearer <apiKey>` |

### 关键点

1. **首次登录后自动创建 API Key**：`stores/auth.ts` 的 `ensureApiKey()` 在登录/注册后自动调用 `userApi.createToken()` 创建 API Key，存入 localStorage。
2. **双凭证持久化**：token 和 apiKey 都存 localStorage，刷新页面后状态不丢失。
3. **401 自动登出**：全局 axios 拦截器（`utils/axiosSetup.ts`）检测到 401 响应时，清除凭证并跳转登录页（带 `expired=1` 参数提示"登录已过期"）。
4. **logout 只清前端**：`logout()` 只清前端状态，不调后端登出接口（session 由服务端过期管理）。

### 凭证使用示例

```typescript
// 管理接口 — 用 Session Token
const res = await authApi.getSelf()  // 自动加 Authorization: Bearer <token>

// Relay 接口 — 用 API Key
const res = await imagesApi.generate({ prompt: '一只猫' })  // 自动加 Authorization: Bearer <apiKey>
```

---

## 四、API 路径映射

| 功能 | 方法 | 路径 | 认证方式 | 前端封装 |
|------|------|------|----------|----------|
| 登录 | POST | `/api/user/login` | 无 | `authApi.login()` |
| 注册 | POST | `/api/user/register` | 无 | `authApi.register()` |
| 用户信息 | GET | `/api/user/self` | Session Token | `authApi.getSelf()` |
| 生成图片 | POST | `/v1/images/generations` | API Key | `imagesApi.generate()` |
| 模型列表 | GET | `/v1/models` | API Key | `imagesApi.listModels()` |
| 创建 Token | POST | `/api/token/` | Session Token | `userApi.createToken()` |
| Token 列表 | GET | `/api/token/` | Session Token | `userApi.getTokens()` |
| 删除 Token | DELETE | `/api/token/:id` | Session Token | `userApi.deleteToken()` |
| 充值码充值 | POST | `/api/user/topup` | Session Token | `userApi.topUp()` |
| 使用日志 | GET | `/api/log/self` | Session Token | `userApi.getLogs()` |
| 创建支付订单 | POST | `/api/user/pay` | Session Token | `paymentApi.createPayOrder()` |
| 充值记录 | GET | `/api/user/topup/self` | Session Token | `paymentApi.getTopUpRecords()` |

### new-api vs One API 路径差异

本项目从 One API 迁移到 new-api，关键差异：

| 项目 | One API | new-api (QuantumNous) |
|------|---------|----------------------|
| 管理接口路径 | `/api/v1/users/*` | `/api/user/*` |
| Relay 接口路径 | `/api/v1/images/*` | `/v1/images/*`（无 /api 前缀） |
| Token 接口 | `/api/v1/tokens` | `/api/token/`（单数） |
| 内置支付 | 无 | 易支付（epay） |
| 管理接口认证 | Bearer Token | Bearer Token + `New-Api-User` Header |

---

## 五、Nginx 路由规则

生产环境 Nginx 配置（`infra/nginx.conf`）定义了三类路由：

```
/               → Nginx 静态文件（前端 SPA，try_files 回退到 index.html）
/api/*          → new-api:3000/api/*（管理接口：登录/注册/用户信息/充值/Token/日志）
/v1/*           → new-api:3000/v1/*（Relay 接口：生图/模型列表）
```

### 关键 Nginx 配置

```nginx
# 前端 SPA — 静态托管 + History 模式回退
location / {
  root /usr/share/nginx/html;
  try_files $uri $uri/ /index.html;
  expires 7d;
}

# new-api 管理接口
location /api/ {
  proxy_pass http://new-api/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 300s;  # 生图可能较慢，5 分钟超时
}

# new-api Relay 接口（OpenAI 兼容）
location /v1/ {
  proxy_pass http://new-api/v1/;
  proxy_read_timeout 300s;
}
```

### 开发环境 Vite 代理

本地开发时（`frontend/vite.config.ts`），Vite dev server 代理 API 请求：

| 前端请求路径 | 代理目标 | 说明 |
|-------------|---------|------|
| `/api/pay/*` | `http://localhost:3001` | 支付微服务（规划中，目前死代码） |
| `/api/*` | `http://localhost:3000` | new-api 管理接口 |
| `/v1/*` | `http://localhost:3000` | new-api Relay 接口 |

> 注意：`/api/pay` 必须在 `/api` 之前定义（最长前缀匹配优先）。

---

## 六、quota 单位换算

new-api 内部使用整数 quota 计量，前端显示时需换算：

```
1 积分 = 500000 quota
```

换算函数（多个组件复用）：

```typescript
function formatBalance(q: number) {
  return (q / 500000).toFixed(1) + ' 积分'
}
```

该函数出现在：`AppHeader.vue:120`、`ConsoleView.vue`、`CreateView.vue:264`、`SettingsView.vue:101`、`BillingView.vue`。

---

## 七、目录结构总览

```
imagerelay/
├── backend/                       # new-api 后端源码（vendored，可定制）
│   └── new-api/                   # QuantumNous/new-api Go 源码（26MB）
│       ├── main.go                # Go 入口
│       ├── Dockerfile             # 多阶段构建（bun 前端 + golang 后端）
│       ├── controller/            # API 控制器
│       ├── middleware/            # 中间件
│       ├── model/                 # GORM 数据模型
│       ├── router/                # Gin 路由
│       └── relay/                 # 上游模型适配
├── doc/                           # Code Wiki 文档（本目录）
├── docs/                          # 历史设计文档
├── frontend/                      # Vue 3 SPA
│   ├── src/
│   │   ├── api/                   # API 封装（5 文件）
│   │   ├── assets/styles/         # 全局样式 + Tailwind 组件层
│   │   ├── components/            # 公共组件（8 个）
│   │   ├── views/                 # 页面视图（9 个）
│   │   ├── stores/                # Pinia 状态管理（auth）
│   │   ├── router/                # Vue Router + 路由守卫
│   │   ├── utils/                 # 工具函数（axios/toast/promptHelpers）
│   │   └── data/                  # 静态数据（prompts.json）
│   ├── tailwind.config.js         # 浅蓝科技主题
│   └── vite.config.ts             # Vite 配置 + 开发代理
├── infra/                         # 基础设施
│   ├── docker-compose.yml         # 4 容器编排
│   ├── nginx.conf                 # Nginx 反向代理
│   └── README.md                  # 部署文档（旧版）
├── DESIGN.md                      # 实用设计文档 v2.0
├── SPEC.md                        # 产品规格书
├── TODO.md                        # 开发待办
└── README.md                      # 项目总览
```
