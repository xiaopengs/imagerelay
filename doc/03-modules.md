# 03 - 模块详解

> 本文档详解 `api/`、`stores/`、`router/`、`utils/`、`data/` 五个模块的职责与代码结构。

---

## 一、api/ — API 封装层

**设计原则**：每个文件创建独立的 axios 实例，按 baseURL 拆分。Header 由各文件的 helper 函数按需添加，全局拦截器只做错误处理（不加 header）。

### 1.1 `auth.ts` — 认证 API

文件：`frontend/src/api/auth.ts`

- **baseURL**：`/api`
- **Header 构造**：`authHeaders()` 返回 `{ Authorization: Bearer <token> }`，token 从 `localStorage('token')` 读取

| 方法 | HTTP | 路径 | 认证 | 用途 |
|------|------|------|------|------|
| `login(email, password)` | POST | `/user/login` | 无 | 登录，返回 session token |
| `register(email, password)` | POST | `/user/register` | 无 | 注册 |
| `getSelf()` | GET | `/user/self` | Session Token | 获取当前用户信息 |

### 1.2 `user.ts` — 用户管理 API

文件：`frontend/src/api/user.ts`

- **baseURL**：`/api`
- **Header 构造**：`authHeaders()`（同 auth.ts）

| 方法 | HTTP | 路径 | 用途 |
|------|------|------|------|
| `topUp(key)` | POST | `/user/topup` | 兑换码充值 |
| `createToken()` | POST | `/token/` | 创建 API Key（sk-xxx） |
| `getTokens()` | GET | `/token/` | 获取 Token 列表 |
| `deleteToken(id)` | DELETE | `/token/:id` | 删除 Token |
| `getLogs(page, type?)` | GET | `/log/self?page=&p_size=20&type=` | 使用日志（type=5 为图片生成） |

### 1.3 `images.ts` — 生图 API

文件：`frontend/src/api/images.ts`

- **baseURL**：`/v1`（Relay 接口，OpenAI 兼容）
- **Header 构造**：`apiKeyHeaders()` 返回 `{ Authorization: Bearer <apiKey> }`，apiKey 从 `localStorage('apiKey')` 读取（sk-xxx 格式）
- **超时**：120 秒（生图耗时较长）

```typescript
export interface GenerateParams {
  model?: string       // 默认 'gpt-image-1'
  prompt: string
  n?: number           // 生成数量，默认 1
  size?: string        // 尺寸，默认 '1024x1024'
  input_image?: string // 图生图的 base64 输入图
}
```

| 方法 | HTTP | 路径 | 用途 |
|------|------|------|------|
| `generate(params)` | POST | `/images/generations` | 生成图片（文生图/图生图） |
| `listModels()` | GET | `/models` | 获取可用模型列表 |

### 1.4 `payment.ts` — 支付 API

文件：`frontend/src/api/payment.ts`

- **baseURL**：`/api`
- **Header 构造**：`authHeaders()`

| 方法 | HTTP | 路径 | 用途 |
|------|------|------|------|
| `createPayOrder(amount)` | POST | `/user/pay` | 创建支付宝支付订单（走 new-api 内置 epay） |
| `getTopUpRecords(page, pageSize)` | GET | `/user/topup/self` | 充值记录 |
| `getTopUpInfo()` | GET | `/user/topup/info` | 充值信息（是否开启在线支付） |
| `redeemCode(key)` | POST | `/user/topup` | 兑换码充值（与 `userApi.topUp` 相同） |

### 1.5 `gallery.ts` — 画廊（纯前端）

文件：`frontend/src/api/gallery.ts`

- **不调后端**：直接 `import promptsData from '@/data/prompts.json'`
- **接口**：`PromptItem`（id/title/titleEn/description/content/arguments/categories/featured/needReferenceImages/exampleImage）

| 方法 | 用途 |
|------|------|
| `getAll()` | 返回全部提示词 |
| `getFeatured()` | 返回 featured: true 的精选提示词 |
| `search(q)` | 模糊搜索（title/titleEn/content/description） |
| `getByCategory(cat)` | 按分类过滤（useCases/styles/subjects） |
| `getById(id)` | 按 ID 查找 |

---

## 二、stores/ — 状态管理

### `auth.ts` — 认证 Store

文件：`frontend/src/stores/auth.ts`（90 行，Composition API 风格 setup store）

#### State（3 个 ref）

| 状态 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `token` | `string` | `localStorage.getItem('token') \|\| ''` | Session Token（管理接口用） |
| `apiKey` | `string` | `localStorage.getItem('apiKey') \|\| ''` | API Key（Relay 接口用，sk-xxx） |
| `user` | `UserInfo \| null` | `null` | 用户信息（id/username/display_name/email/quota 等） |

#### Getters（2 个 computed）

| Getter | 计算 | 用途 |
|--------|------|------|
| `isLoggedIn` | `!!token.value` | 是否已登录（基于 token，非 user） |
| `balance` | `user.value?.quota ?? 0` | 原始 quota（调用方需 `/500000` 转积分） |

#### Actions（7 个函数）

| Action | 流程 | 说明 |
|--------|------|------|
| `setToken(t)` | 设置 token + 持久化 | localStorage('token') |
| `setApiKey(key)` | 设置 apiKey + 持久化 | localStorage('apiKey') |
| `fetchUser()` | 调 `authApi.getSelf()` → 设置 user；失败则 `logout()` | 获取用户信息 |
| `ensureApiKey()` | 若 apiKey 为空 → 调 `createToken()` → setApiKey | 幂等，登录后自动调用 |
| `login(email, pwd)` | login → setToken → fetchUser → ensureApiKey | 完整登录流程 |
| `register(email, pwd)` | register → setToken → fetchUser → ensureApiKey | 完整注册流程 |
| `logout()` | 清空 token/apiKey/user + 移除 localStorage | 仅清前端，不调后端 |

#### 关键代码：login 流程

```typescript
async function login(email: string, password: string) {
  const res = await authApi.login(email, password)
  if (res.data?.token) {
    setToken(res.data.token)
  }
  await fetchUser()      // 获取用户信息
  await ensureApiKey()   // 确保 API Key 存在
}
```

---

## 三、router/ — 路由

文件：`frontend/src/router/index.ts`（31 行）

### 路由表（9 条）

**公开页（5 条，无 auth）**：

| 路径 | name | 加载方式 |
|------|------|----------|
| `/` | home | 静态 import HomeView（首屏优化） |
| `/login` | login | 动态 import |
| `/register` | register | 动态 import |
| `/pricing` | pricing | 动态 import |
| `/gallery` | gallery | 动态 import |

**需登录页（4 条，`meta.requiresAuth: true`）**：

| 路径 | name |
|------|------|
| `/console` | console |
| `/console/create` | create |
| `/console/billing` | billing |
| `/console/settings` | settings |

### 路由守卫

```typescript
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

**守卫逻辑**：
- 直接读 `localStorage`（不依赖 Pinia store 实例化顺序）
- 仅检查 token 存在性，不验证有效性
- 未登录访问受保护路由 → 跳 `/login?redirect=<原路径>`
- 401 过期由全局 axios 拦截器处理（跳登录并带 `expired=1`）

### 登录回跳

`LoginView.vue` 登录成功后读取 `route.query.redirect` 回跳（带白名单校验防开放重定向）：

```typescript
const raw = (route.query.redirect as string) || '/console'
const redirect = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/console'
window.location.href = redirect
```

---

## 四、utils/ — 工具函数

### 4.1 `axiosSetup.ts` — 全局 Axios 拦截器

文件：`frontend/src/utils/axiosSetup.ts`

函数：`setupAxiosInterceptors()` — 在 `main.ts` 启动时调用一次。

**拦截逻辑**（响应错误拦截器）：

| 错误类型 | 处理 |
|----------|------|
| 401 Unauthorized | 清除 token/apiKey + 跳 `/login?redirect=<current>&expired=1`（已在登录/注册页则不跳） |
| 超时（`ECONNABORTED` 或 message 含 'timeout'） | `toast.error('请求超时，请检查网络后重试')` |
| 网络错误（无 response） | `toast.error('网络连接失败，请检查网络')` |
| 400/422 等 | 不弹 Toast，由调用方组件处理 |

**注意**：拦截器只做错误处理，**不**添加 Authorization header — header 由各 api 文件的 `authHeaders()` / `apiKeyHeaders()` 按需添加。

### 4.2 `toast.ts` — Toast 单例

文件：`frontend/src/utils/toast.ts`

函数：`useToast()` — 返回 Toast 控制 API。

| 方法 | 说明 |
|------|------|
| `success(message)` | 成功 Toast，4 秒后消失 |
| `error(message)` | 错误 Toast，6 秒后消失（更长，便于阅读） |
| `info(message)` | 信息 Toast，4 秒后消失 |
| `dismiss(id)` | 手动关闭 |

**特性**：
- 模块级单例（`toasts` ref 定义在模块作用域，全局共享）
- 最多 5 条并发，超出时移除最旧的
- `readonly(toasts)` 防止外部直接修改

### 4.3 `promptHelpers.ts` — 画廊辅助函数

文件：`frontend/src/utils/promptHelpers.ts`

| 函数 | 签名 | 用途 |
|------|------|------|
| `getGradient(id)` | `(id: string) => string` | 根据 ID 返回渐变色字符串（30 种预设，如 `'#667eea, #764ba2'`） |
| `getEmoji(prompt)` | `(prompt) => string` | 根据 `categories.subjects` 返回对应 emoji（如 portrait-selfie → 👤） |
| `replaceArguments(content, args)` | `(content: string, args: Record<string, string>) => string` | 替换 `{name}` 占位符为实际值（用 split+join 实现 replaceAll） |

**getGradient 实现**：从 id 提取数字，对 30 取模选择渐变色。

**getEmoji 映射**：21 个 subject → emoji 映射（portrait-selfie/landscape/product/character/animal/food/architecture/street/scifi/botanical/logo/banner/data/ui-design/abstract/horror/miniature/astronomy/action/children/people/social）。

---

## 五、data/ — 静态数据

### `prompts.json` — 提示词库

文件：`frontend/src/data/prompts.json`（30 条精选提示词）

#### 数据结构

```json
{
  "id": "p001",
  "title": "电影感人像",
  "titleEn": "Cinematic Portrait",
  "description": "浅景深电影感人像，自然光影，胶片质感",
  "content": "Create a cinematic portrait of {subject}, shallow depth of field, ...",
  "arguments": [
    { "name": "subject", "default": "a young woman", "label": "拍摄主体" }
  ],
  "categories": {
    "useCases": ["portrait-selfie"],
    "styles": ["cinematic"],
    "subjects": ["portrait-selfie"]
  },
  "featured": true,
  "needReferenceImages": false,
  "exampleImage": "..."
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识（p001-p030） |
| `title` | string | 中文标题（UI 显示） |
| `titleEn` | string | 英文标题（UI 副标题显示） |
| `description` | string | 中文描述（UI 显示） |
| `content` | string | **英文提示词**（实际喂给 AI 的内容，含 `{name}` 占位符） |
| `arguments` | array | 可替换参数（name/default/label） |
| `categories` | object | 分类（useCases/styles/subjects，用于筛选） |
| `featured` | boolean | 是否精选（首页/画廊预览展示） |
| `needReferenceImages` | boolean | 是否需要参考图 |
| `exampleImage` | string | 示例图 URL |

#### 覆盖分类

- **useCases**：头像/社交媒体/电商/信息图/游戏/漫画
- **styles**：写实/动漫/插画/油画/水彩/极简/摄影等
- **subjects**：portrait-selfie/landscape/product/character/animal/food/architecture/street/scifi/botanical/logo/banner/data/ui-design/abstract/horror/miniature/astronomy/action/children/people/social

> 注：DESIGN_PLAN.md 规划了 11,600+ 条提示词，但 `prompts.json` 实际只有 30 条精选。
