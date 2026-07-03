# 04 - 关键类与函数说明

> 本文档列出前端核心 API 方法、Store action、工具函数的签名与使用说明。

---

## 一、API 层方法签名

### 1.1 `authApi` — 认证 API

来源：`frontend/src/api/auth.ts`

```typescript
export const authApi = {
  login: (email: string, password: string) => Promise<AxiosResponse>
  register: (email: string, password: string) => Promise<AxiosResponse>
  getSelf: () => Promise<AxiosResponse<UserInfo>>
}
```

**使用示例**：

```typescript
// 登录
const res = await authApi.login('user@example.com', 'password123')
if (res.data?.token) {
  // 登录成功，token 在 res.data.token
}

// 获取当前用户
const res = await authApi.getSelf()
// res.data = { id, username, display_name, email, quota, used_quota, ... }
```

### 1.2 `userApi` — 用户管理 API

来源：`frontend/src/api/user.ts`

```typescript
export const userApi = {
  topUp: (key: string) => Promise<AxiosResponse>
  createToken: () => Promise<AxiosResponse<{ key: string }>>
  getTokens: () => Promise<AxiosResponse<{ data: Token[] }>>
  deleteToken: (id: number) => Promise<AxiosResponse>
  getLogs: (page?: number, type?: number) => Promise<AxiosResponse>
}
```

**使用示例**：

```typescript
// 创建 API Key（登录后自动调用）
const res = await userApi.createToken()
const apiKey = res.data.key  // 'sk-xxxxxxxx'

// 获取使用日志（type=5 为图片生成日志）
const res = await userApi.getLogs(1, 5)
// res.data = { data: [...logs], total_count: 100 }

// 兑换码充值
const res = await userApi.topUp('XXXX-XXXX-XXXX-XXXX')
```

### 1.3 `imagesApi` — 生图 API

来源：`frontend/src/api/images.ts`

```typescript
export interface GenerateParams {
  model?: string       // 默认 'gpt-image-1'
  prompt: string       // 必填
  n?: number           // 默认 1
  size?: string        // 默认 '1024x1024'
  input_image?: string // 图生图的 base64 输入
}

export const imagesApi = {
  generate: (params: GenerateParams) => Promise<AxiosResponse>
  listModels: () => Promise<AxiosResponse>
}
```

**使用示例**：

```typescript
// 文生图
const res = await imagesApi.generate({
  prompt: '一只可爱的橘猫趴在窗台上晒太阳',
  model: 'gpt-image-1',
  size: '1024x1024',
  n: 1,
})
// res.data = { data: [{ url: 'https://...' }] } 或 { data: [{ b64_json: '...' }] }

// 图生图（需上传图片转 base64）
const res = await imagesApi.generate({
  prompt: '改为赛博朋克风格',
  input_image: 'data:image/png;base64,iVBORw0KGgo...',
})

// 获取可用模型
const res = await imagesApi.listModels()
// res.data = { data: [{ id: 'gpt-image-1', ... }, ...] }
```

### 1.4 `paymentApi` — 支付 API

来源：`frontend/src/api/payment.ts`

```typescript
export const paymentApi = {
  createPayOrder: (amount: number) => Promise<AxiosResponse<PayOrderResult>>
  getTopUpRecords: (page?: number, pageSize?: number) => Promise<AxiosResponse>
  getTopUpInfo: () => Promise<AxiosResponse>
  redeemCode: (key: string) => Promise<AxiosResponse>
}
```

### 1.5 `galleryApi` — 画廊 API（纯前端）

来源：`frontend/src/api/gallery.ts`

```typescript
export const galleryApi = {
  getAll: () => PromptItem[]
  getFeatured: () => PromptItem[]
  search: (q: string) => PromptItem[]
  getByCategory: (cat: string) => PromptItem[]
  getById: (id: string) => PromptItem | undefined
}
```

---

## 二、Store Actions — `useAuthStore()`

来源：`frontend/src/stores/auth.ts`

### State & Getters

```typescript
const auth = useAuthStore()

// State
auth.token      // string — Session Token
auth.apiKey     // string — API Key (sk-xxx)
auth.user       // UserInfo | null

// Getters
auth.isLoggedIn // boolean — !!token
auth.balance    // number — 原始 quota（需 /500000 转积分）
```

### Actions

| Action | 签名 | 流程 |
|--------|------|------|
| `setToken` | `(t: string) => void` | 设置 token + localStorage 持久化 |
| `setApiKey` | `(key: string) => void` | 设置 apiKey + localStorage 持久化 |
| `fetchUser` | `() => Promise<void>` | 调 `getSelf()` → 设置 user；失败则 logout() |
| `ensureApiKey` | `() => Promise<void>` | 若 apiKey 为空 → createToken() → setApiKey |
| `login` | `(email, password) => Promise<void>` | login → setToken → fetchUser → ensureApiKey |
| `register` | `(email, password) => Promise<void>` | register → setToken → fetchUser → ensureApiKey |
| `logout` | `() => void` | 清空 state + 移除 localStorage |

**使用示例**：

```typescript
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// 登录
await auth.login('user@example.com', 'password123')

// 检查登录状态
if (auth.isLoggedIn) {
  console.log(auth.user.display_name)
  console.log(`余额: ${(auth.balance / 500000).toFixed(1)} 积分`)
}

// 退出
auth.logout()
```

### UserInfo 接口

```typescript
interface UserInfo {
  id: number
  username: string
  display_name?: string
  email?: string
  status?: number
  quota?: number         // 原始 quota，500000 = 1 积分
  used_quota?: number
  request_count?: number
}
```

---

## 三、工具函数

### 3.1 `setupAxiosInterceptors()`

来源：`frontend/src/utils/axiosSetup.ts`

```typescript
export function setupAxiosInterceptors(): void
```

**调用时机**：`main.ts` 启动时调用一次（在 app.mount 之前）。

**拦截逻辑**：

```typescript
axios.interceptors.response.use(
  (response) => response,  // 成功直接返回
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      // 清凭证 + 跳登录（带 expired=1）
      localStorage.removeItem('token')
      localStorage.removeItem('apiKey')
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&expired=1`
      }
    } else if (超时) {
      toast.error('请求超时，请检查网络后重试')
    } else if (网络错误) {
      toast.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)  // 继续抛错给调用方
  }
)
```

### 3.2 `useToast()`

来源：`frontend/src/utils/toast.ts`

```typescript
export function useToast(): {
  toasts: Readonly<Ref<Toast[]>>  // 只读响应式列表
  success: (message: string) => void  // 4 秒消失
  error: (message: string) => void    // 6 秒消失
  info: (message: string) => void     // 4 秒消失
  dismiss: (id: number) => void       // 手动关闭
}
```

**Toast 接口**：

```typescript
interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}
```

**使用示例**：

```typescript
import { useToast } from '@/utils/toast'

const toast = useToast()
toast.success('保存成功')
toast.error('充值失败：' + e.message)
toast.info('正在加载...')
```

**特性**：
- 模块级单例（`toasts` 定义在模块作用域，所有 `useToast()` 调用共享同一状态）
- 最多 5 条并发，超出时移除最旧的
- `readonly` 防止外部直接修改数组

### 3.3 画廊辅助函数

来源：`frontend/src/utils/promptHelpers.ts`

```typescript
// 根据 ID 返回渐变色（30 种预设）
export function getGradient(id: string): string
// 示例：getGradient('p001') → '#667eea, #764ba2'

// 根据 categories.subjects 返回 emoji
export function getEmoji(prompt: { categories: { subjects: string[] } }): string
// 示例：getEmoji({ categories: { subjects: ['landscape'] } }) → '🏔'

// 替换 {name} 占位符
export function replaceArguments(content: string, args: Record<string, string>): string
// 示例：replaceArguments('a photo of {subject}', { subject: 'a cat' }) → 'a photo of a cat'
```

---

## 四、常用工具函数（组件内）

### `formatBalance(q)` — quota 转积分

多个组件复用（未抽取为公共函数，各自定义）：

```typescript
function formatBalance(q: number) {
  return (q / 500000).toFixed(1) + ' 积分'
}
```

出现在：`AppHeader.vue:120`、`ConsoleView.vue`、`CreateView.vue:264`、`SettingsView.vue:101`、`BillingView.vue`。

### `maskToken(t)` — Token 脱敏

`SettingsView.vue:134`：

```typescript
function maskToken(t: string) {
  if (!t || t.length < 16) return t
  return t.slice(0, 8) + '...' + t.slice(-4)
}
// 示例：maskToken('sk-abcdefghijklmnopqrstuvwxyz') → 'sk-abcde...wxyz'
```

### `formatTime(iso)` — 时间格式化

`SettingsView.vue:176`：

```typescript
function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
```

---

## 五、Header 构造函数（内部）

这些函数在 `api/` 各文件内部定义，不导出，仅供同文件的 API 方法使用：

```typescript
// auth.ts / user.ts / payment.ts 内部
function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return { Authorization: `Bearer ${token}` }
}

// images.ts 内部
function apiKeyHeaders() {
  const apiKey = localStorage.getItem('apiKey') || ''
  return { Authorization: `Bearer ${apiKey}` }
}
```

**设计要点**：
- 每次调用 API 时实时读取 localStorage，保证凭证最新
- 不缓存到变量，避免凭证更新后 header 不一致
- 各 api 文件独立定义，不共享（职责隔离）
