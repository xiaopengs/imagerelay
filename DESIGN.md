# GPT Image 2 生图平台 — 实用设计文档 v2.0（定稿）

> v1.0 经开发者 / 产品经理 / 架构师三轮审核，本版本修正了所有致命级问题。
> 原则：每个章节回答"开发时怎么做"，不回答的不写。

---

## 0. 三轮审核发现的关键修正

| 问题 | 严重度 | 修正 |
|------|--------|------|
| API 路径全部与 new-api 不匹配 | 致命 | 第 5 节完全重写，逐条列出正确路径 |
| new-api 不存在 `/images/history` 端点 | 致命 | Phase 1 砍掉历史页，改用前端会话缓存 |
| 充值到账接口调错端点 + 认证方式错误 | 致命 | 第 7.5 节修正为 `/api/user/manage` + 双 header |
| 支付微服务可能不需要（new-api 内置 epay） | 严重 | 第 7.0 节新增"优先评估内置支付" |
| 前端两种 token 混淆（session vs API key） | 严重 | 第 5.4 节新增认证分层说明 |
| 支付宝 SDK 参数拼写错误 | 中等 | 第 7.4 节修正 |
| Tailwind @apply 交叉引用可能编译失败 | 中等 | 第 2.2 节展开所有 @apply |
| 首页 section 过多增加维护成本 | 低 | 第 4.1 节砍为 3 个 section |
| 提示词 200 条工作量被低估 | 低 | 第 6 节改为 Phase 1 只做 30 条 |

---

## 1. 我们在做什么

基于 imagerelay (Vue 3 + Vite + TailwindCSS) 前端原型，做以下 6 个具体变更：

1. **换后端** — OneAPI 换成 new-api (QuantumNous)，API 路径需要全量迁移（见第 5 节）
2. **换主题** — 暗紫黑色换成浅蓝科技白色系
3. **加画廊** — 新增 `/gallery` 页面，静态 JSON 展示精选提示词（Phase 1 做 30 条）
4. **加支付** — 先评估 new-api 内置 epay，不行再建独立微服务（见第 7 节）
5. **修 bug** — 补 ImagePreview 组件、修重复 Header、让风格参数生效
6. **迁移 API 路径** — 前端所有 API 调用路径适配 new-api 实际路由（最关键的前置任务）

不改的东西：技术栈（Vue 3 + Pinia + Vue Router + Tailwind）、项目结构（frontend/ + infra/）。

---

## 2. 设计系统

### 2.1 tailwind.config.js（完整替换）

与 v1.0 相同，不重复。

### 2.2 global.css（完整替换 — 修正 @apply 交叉引用）

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background-color: #F8FAFC;
  color: #334155;
  font-family: 'Inter', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #F1F5F9; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

@layer components {
  .card {
    @apply bg-white rounded-xl border border-gray-200 shadow-sm;
  }
  /* 修正：展开所有 utility，不引用 .card */
  .card-hover {
    @apply bg-white rounded-xl border border-gray-200 shadow-sm
           transition-all duration-200 hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5;
  }
  .btn-primary {
    @apply bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
           text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200
           shadow-sm hover:shadow-md hover:-translate-y-0.5
           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0;
  }
  .btn-secondary {
    @apply bg-white hover:bg-primary-50 text-primary-600 border border-primary-200
           hover:border-primary-400 font-medium py-2.5 px-5 rounded-lg transition-all;
  }
  .btn-ghost {
    @apply bg-transparent hover:bg-gray-100 text-gray-600 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  .input-field {
    @apply w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700
           placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100
           focus:outline-none transition-all;
  }
  .chip {
    @apply text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600
           hover:border-primary-300 hover:text-primary-600 cursor-pointer transition-all;
  }
  .chip-active {
    @apply bg-primary-50 border-primary-400 text-primary-600;
  }
  .section-tag {
    @apply inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold
           rounded-xl uppercase tracking-wide;
  }
}
```

### 2.3 CSS 入口文件整理

**删除** `src/style.css`（与 global.css 重复的 @tailwind 指令）。
**仅保留** `src/assets/styles/global.css`，在 `main.ts` 中 `import './assets/styles/global.css'`。

### 2.4 App.vue（完整替换）

与 v1.0 相同。规则：所有 View 禁止引入 AppHeader/AppFooter。

---

## 3. 路由结构

与 v1.0 相同，但有一个变化：
- **删除 `/console/history`** — new-api 不提供图片历史端点，Phase 1 不做历史页
- 将来需要时，通过自建轻量记录服务补充

```ts
const routes = [
  // 公开页
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  { path: '/pricing', name: 'pricing', component: () => import('@/views/PricingView.vue') },
  { path: '/gallery', name: 'gallery', component: () => import('@/views/GalleryView.vue') },

  // 需登录
  { path: '/console', name: 'console', component: () => import('@/views/ConsoleView.vue'), meta: { requiresAuth: true } },
  { path: '/console/create', name: 'create', component: () => import('@/views/CreateView.vue'), meta: { requiresAuth: true } },
  { path: '/console/billing', name: 'billing', component: () => import('@/views/BillingView.vue'), meta: { requiresAuth: true } },
  { path: '/console/settings', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { requiresAuth: true } },
]
```

---

## 4. 逐页设计规格

### 4.1 首页 HomeView（精简为 3 个 section）

```
Hero Section (bg: primary-50 渐变到 white)
  badge: "Powered by GPT Image 2"
  h1: "AI 图片创作平台" + gradient-text
  副标题: 一句话价值描述
  [开始创作 btn-primary] [浏览画廊 btn-secondary]
  统计行: 11,600+ 提示词 | 5+ 模型 | <10s 生成

Features Section (3x2 grid, card-hover)
  文生图 / 图生图 / 多模型 / 提示词库 / API 接入 / 极速生成

CTA Section (primary-500~700 渐变卡片)
  "免费注册获得 10 积分"
```

砍掉了 Gallery Preview 和 Pricing Preview — 通过导航栏可达，无需在首页重复。

### 4.2 核心生图页 CreateView

与 v1.0 相同（左侧参数面板 + 右侧结果区）。以下修正 API 调用：

```ts
// api/images.ts — baseURL 改为 /v1（不是 /api/v1）
const api = axios.create({ baseURL: '/v1' })

export const imagesApi = {
  generate: (params: {
    model?: string
    prompt: string
    n?: number
    size?: string
    input_image?: string
  }) => {
    // 注意：这里用的是 API token (sk-xxx)，不是 session token
    const apiKey = localStorage.getItem('apiKey') || ''
    return api.post('/images/generations', {
      model: params.model || 'gpt-image-1',
      prompt: params.prompt,
      n: params.n || 1,
      size: params.size || '1024x1024',
      ...(params.input_image && { input_image: params.input_image }),
    }, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 120000,
    })
  }
}
```

### 4.3 ImagePreview 组件

与 v1.0 相同。但移到 Phase 0（项目无法编译的阻塞问题）。

### 4.4 画廊页 GalleryView

与 v1.0 相同，但数据量改为 Phase 1 精选 30 条。

### 4.5 账单页 BillingView

与 v1.0 相同。支付方式取决于第 7.0 节评估结果。

### 4.6 控制台仪表盘 ConsoleView

```
欢迎卡片 (bg primary-50): "欢迎回来, {username}" + 余额

快捷操作行 (3 个按钮):
  [创建图片 → /console/create]
  [浏览画廊 → /gallery]
  [充值 → /console/billing]

当前会话生成记录 (从 localStorage 读取本次会话结果，3列 grid)
```

**变化**：砍掉"最近生成"对后端 API 的依赖，改为前端 sessionStorage 缓存当前会话的生成结果。

---

## 5. API 层变更（完全重写 — 审核修正）

### 5.1 API 路径迁移对照表

这是整个项目最关键的部分。new-api 的路由结构与旧 OneAPI 完全不同：

| 功能 | 旧前端路径 (OneAPI) | new-api 实际路径 | 变化说明 |
|------|---------------------|------------------|----------|
| 登录 | `POST /api/v1/users/login` | `POST /api/user/login` | 去 /v1/，users→user |
| 注册 | `POST /api/v1/users/register` | `POST /api/user/register` | 同上 |
| 用户信息 | `GET /api/v1/users/me` | `GET /api/user/self` | 端点名不同 |
| 兑换码充值 | `POST /api/v1/users/top_up` | `POST /api/user/topup` | 入参 {key} 不变 |
| 生图 | `POST /api/v1/images/generations` | `POST /v1/images/generations` | **去 /api/ 前缀** |
| Token CRUD | `GET/POST/DELETE /api/v1/tokens` | `GET/POST/DELETE /api/token/` | 去 /v1/，tokens→token |
| 模型列表 | `GET /api/v1/models` | `GET /v1/models` | 去 /api/ 前缀 |
| 生图历史 | `GET /api/v1/images/history` | **不存在** | Phase 1 砍掉 |
| 使用日志 | 无 | `GET /api/log/self` | new-api 有，可按 type 过滤 |
| 支付订单 | 无 | `POST /api/user/pay` (如用内置 epay) | 待评估 |

### 5.2 前端 API 封装重写

需要拆分为两个 baseURL（这是审核发现的关键问题 — 管理接口和 relay 接口的前缀不同）：

```ts
// src/api/auth.ts — 管理接口用 /api 前缀
const manageApi = axios.create({ baseURL: '/api' })

export const authApi = {
  login: (email: string, password: string) =>
    manageApi.post('/user/login', { email, password }),
  register: (email: string, password: string) =>
    manageApi.post('/user/register', { email, password }),
  getSelf: () =>
    manageApi.get('/user/self', { headers: authHeaders() }),
}
```

```ts
// src/api/images.ts — relay 接口用 /v1 前缀
const relayApi = axios.create({ baseURL: '/v1' })

export const imagesApi = {
  generate: (params: GenerateParams) => {
    const apiKey = localStorage.getItem('apiKey') || ''
    return relayApi.post('/images/generations', buildBody(params), {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 120000,
    })
  },
  listModels: () => {
    const apiKey = localStorage.getItem('apiKey') || ''
    return relayApi.get('/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
  }
}
```

```ts
// src/api/user.ts — 管理接口
const manageApi = axios.create({ baseURL: '/api' })

export const userApi = {
  topUp: (key: string) =>
    manageApi.post('/user/topup', { key }, { headers: authHeaders() }),
  createToken: () =>
    manageApi.post('/token/', {}, { headers: authHeaders() }),
  getTokens: () =>
    manageApi.get('/token/', { headers: authHeaders() }),
  deleteToken: (id: number) =>
    manageApi.delete(`/token/${id}`, { headers: authHeaders() }),
  getLogs: (type?: number) =>
    manageApi.get(`/log/self?type=${type || ''}`, { headers: authHeaders() }),
}
```

### 5.3 vite.config.ts 代理更新

```ts
proxy: {
  '/api/pay': { target: 'http://localhost:3001', changeOrigin: true },
  '/api': { target: 'http://localhost:3000', changeOrigin: true },
  '/v1': { target: 'http://localhost:3000', changeOrigin: true },
}
```

**注意**：`/api/pay` 必须在 `/api` 之前，否则会被 `/api` 规则截获。

### 5.4 认证分层（审核新增 — 关键架构决策）

new-api 有两套认证机制，前端必须正确区分：

| 认证方式 | 适用范围 | 存储位置 | 格式 |
|----------|----------|----------|------|
| Session Cookie | 管理接口 `/api/*` | 浏览器自动管理 | cookie |
| API Token | Relay 接口 `/v1/*` | localStorage('apiKey') | `sk-xxx` |

**登录流程**：
1. 用户登录 `POST /api/user/login` → 服务端设置 session cookie + 返回用户信息
2. 登录成功后，自动创建 API Token `POST /api/token/` → 返回 `sk-xxx`
3. 将 `sk-xxx` 存入 `localStorage('apiKey')`，用于后续生图调用
4. Pinia auth store 同时存储 session 状态和 apiKey

```ts
// stores/auth.ts — 更新后的版本
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const apiKey = ref(localStorage.getItem('apiKey') || '')
  const isLoggedIn = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    user.value = res.data  // session cookie 由浏览器自动存储
    await ensureApiKey()
  }

  async function ensureApiKey() {
    if (apiKey.value) return
    // 创建 API token 用于生图调用
    const res = await userApi.createToken()
    apiKey.value = res.data.key  // sk-xxx
    localStorage.setItem('apiKey', apiKey.value)
  }

  function logout() {
    user.value = null
    apiKey.value = ''
    localStorage.removeItem('apiKey')
    // session 由服务端过期管理
  }

  return { user, apiKey, isLoggedIn, login, logout, ensureApiKey }
})
```

---

## 6. 提示词数据

### 6.1 数据格式

与 v1.0 相同。

### 6.2 数量调整

Phase 1 精选 **30 条**（不是 200 条）。覆盖主要分类即可，上线后迭代补充。
原因：每条提示词需要翻译标题、填写 arguments、验证生成效果，200 条整理工作量约 3-4 天。

---

## 7. 支付方案（审核重写）

### 7.0 优先方案：使用 new-api 内置支付

new-api 已内置 epay（易支付）网关，相关端点：
- `POST /api/user/pay` — 创建支付订单
- `POST /api/user/epay/notify` — 支付异步回调
- `GET /api/user/topup/info` — 获取充值信息
- `GET /api/user/topup/self` — 获取用户充值记录

**配置方式**：在 new-api 管理后台 → 运营设置 → 支付配置中填入支付宝商户号和密钥。

**如果此方案可行，则完全不需要独立 payment-service。** 前端只需：
1. BillingView 调用 `POST /api/user/pay` 获取支付链接
2. 用户完成支付后，支付宝回调 new-api 自动充值
3. 前端轮询 `GET /api/user/self` 确认余额变化

**开发时优先验证此方案。** 如果 new-api 内置 epay 不支持支付宝当面付/手机网站支付，再启用以下备选方案。

### 7.1 备选方案：独立支付微服务

（仅当 7.0 不可行时使用）

独立 Node.js + Express 服务。

### 7.2 最小实现

```
payment-service/
  src/
    index.ts          — Express 入口 + 3 个路由
    alipay.ts         — alipay-sdk@3.6.1 封装
  package.json
  Dockerfile
```

### 7.3 API 端点

```
POST /api/pay/create-order
  入参: { packageId }  ← 只传 packageId，金额/积分由后端查表
  出参: { orderNo, payForm }  ← payForm 是 HTML form 字符串

POST /api/pay/alipay-notify
  入参: 支付宝异步通知 form-data
  逻辑: 验签 → 幂等检查(仅 pending 状态处理) → 调 new-api 充值

GET /api/pay/orders?page=N
  出参: { data: Order[], total }
```

### 7.4 支付宝 SDK（修正版）

```ts
import AlipaySdk from 'alipay-sdk'  // 锁定 v3.6.1

const alipay = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublickKey: process.env.ALIPAY_PUBLIC_KEY!,  // 注意拼写：alipayPublickKey
})

// 手机网站支付
const result = await alipay.exec('alipay.trade.wap.pay', {
  notifyUrl: `${BASE_URL}/api/pay/alipay-notify`,
  returnUrl: `${BASE_URL}/console/billing`,
  bizContent: {
    outTradeNo: orderNo,
    totalAmount: amount.toFixed(2),
    subject: `充值 ${credits} 积分`,
    productCode: 'QUICK_WAP_PAY',  // 修正：不是 QUICK_WAP_WAY
  },
})
// result 是 HTML form 字符串，需要前端 document.write(result) 提交
```

### 7.5 充值到账（修正版）

```ts
// 方案 A: 用管理员接口充值（需要双 header）
await fetch(`${NEW_API_URL}/api/user/manage`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ADMIN_ACCESS_TOKEN}`,
    'New-Api-User': `${ADMIN_USER_ID}`,  // new-api 强制要求此 header
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: userId,
    action: 'add_quota',
    value: credits * 500000,  // QuotaPerUnit = 500000
  }),
})

// 方案 B: 自动创建兑换码 + 自动兑换（两步走，更稳妥）
// Step 1: 管理员创建兑换码
const redeemRes = await fetch(`${NEW_API_URL}/api/redemption/`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}`, 'New-Api-User': `${ADMIN_ID}` },
  body: JSON.stringify({ name: `pay-${orderNo}`, quota: credits * 500000, count: 1 }),
})
const redeemKey = redeemRes.data.key

// Step 2: 以用户身份兑换
await fetch(`${NEW_API_URL}/api/user/topup`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${USER_TOKEN}` },
  body: JSON.stringify({ key: redeemKey }),
})
```

**幂等保障**：回调处理前必须检查订单状态，仅 `pending` 状态时执行充值：
```ts
async function handleAlipayNotify(params) {
  const order = await db.orders.findOne({ where: { orderNo: params.out_trade_no } })
  if (!order || order.status !== 'pending') return 'success'  // 已处理过，直接返回成功
  // ... 验签 + 充值 + 更新状态
}
```

---

## 8. 基础设施

### 8.1 docker-compose.yml

与 v1.0 相同，但修正：
- MySQL 密码从 `.env` 读取（不硬编码）
- payment-service 仅在 7.0 不可行时启用

```yaml
# .env 文件（不入 git）
MYSQL_ROOT_PASSWORD=your-strong-password
ALIPAY_APP_ID=xxx
ALIPAY_PRIVATE_KEY=xxx
ALIPAY_PUBLIC_KEY=xxx
```

### 8.2 Nginx 路由规则（修正）

```nginx
# 前端静态文件
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}

# 支付 API → payment-service（如使用独立微服务）
location /api/pay/ {
    proxy_pass http://payment:3001;
}

# 管理 API → new-api
location /api/ {
    proxy_pass http://new-api:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Relay API → new-api（生图等 OpenAI 兼容接口）
location /v1/ {
    proxy_pass http://new-api:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 120s;  # 生图可能耗时
}
```

**关键**：`/api/pay/` 在 `/api/` 之前（Nginx 最长前缀匹配），确保支付请求不被 `/api/` 截获。

---

## 9. 明确不做的事（更新）

| 不做 | 原因 |
|------|------|
| 生图历史服务端 | new-api 不存储生图历史，Phase 1 用 sessionStorage 缓存会话结果 |
| HistoryView 页面 | 无后端端点支撑，推迟到 Phase 2 |
| DocsView 页面 | 推迟到 Phase 2，不影响核心功能 |
| 微信支付 | Phase 1 只做支付宝 |
| 暗色模式 | Phase 1 只做浅色 |
| 图片 CDN / OSS | 直接用 new-api 返回的临时 URL |
| 批量生成 | Phase 2 |
| 用户贡献提示词 | Phase 2 |
| 国际化 | Phase 1 只做中文 |

---

## 10. 开发顺序（审核修正版 — 严格按此顺序）

```
Phase 0 — API 路径迁移 + 编译修复 (Day 1)  ← 新增！最高优先级
  1. 新建 ImagePreview.vue（缺失组件，项目无法编译）
  2. 删除 style.css，只保留 global.css
  3. 重写 api/auth.ts（baseURL: '/api'，路径改 /user/login 等）
  4. 重写 api/images.ts（baseURL: '/v1'，路径改 /images/generations）
  5. 重写 api/user.ts（baseURL: '/api'，路径改 /token/ 等）
  6. 重写 stores/auth.ts（双 token 管理：session + apiKey）
  7. 删除 stores/credits.ts（合并到 auth store）
  8. 更新 vite.config.ts（/api/pay → 3001, /api → 3000, /v1 → 3000）
  9. npm run build 确认编译通过

Phase 1 — 主题 + 基础组件 (Day 2-3)
  10. 替换 tailwind.config.js
  11. 替换 global.css
  12. 替换 App.vue（去重复 Header）
  13. 重写 AppHeader.vue（毛玻璃 + 浅蓝）
  14. 重写 AppFooter.vue
  15. 更新 router/index.ts（新路由，去掉 history 和 docs）
  16. 重写 LoginView.vue + RegisterView.vue
  17. npm run dev 确认页面可看

Phase 2 — 核心页面 (Day 4-7)
  18. 重写 HomeView.vue（3 section）
  19. 新建 CreateView.vue（合并文生图/图生图）
  20. 重写 ConsoleView.vue（sessionStorage 缓存生成结果）
  21. 重写 SettingsView.vue（换色为主，结构不改）

Phase 3 — 画廊 (Day 8-9)
  22. 从 awesome-gpt-image-2 精选 30 条提示词 → prompts.json
  23. 新建 GalleryView.vue
  24. 画廊 → CreateView 联动（query 传参 + arguments 弹窗）

Phase 4 — 支付 (Day 10-13)
  25. 优先验证 new-api 内置 epay（管理后台配置支付宝参数）
  26. 如可行：BillingView 直接调 /api/user/pay，跳过 27-29
  27. 如不可行：搭建 payment-service
  28. 如不可行：实现支付宝 SDK 对接
  29. 新建 BillingView.vue
  30. docker-compose 集成

Phase 5 — 收尾 (Day 14-16)
  31. 重写 PricingView.vue（换色）
  32. 响应式适配
  33. 全链路联调：注册 → 登录 → 生图 → 充值 → 再生图
  34. 部署测试
```

预计总工期：14-16 天（比 v1.0 的 14 天略长，因为加了 Phase 0 API 迁移）。
