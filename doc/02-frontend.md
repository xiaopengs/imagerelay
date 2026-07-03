# 02 - 前端详解

> 本文档覆盖前端入口、目录结构、构建配置、设计系统、页面视图与组件。

---

## 一、应用入口

### 1.1 `main.ts` — 应用启动

文件：`frontend/src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/global.css'
import { setupAxiosInterceptors } from './utils/axiosSetup'

setupAxiosInterceptors()  // 注册全局 axios 响应拦截器

const app = createApp(App)
app.use(createPinia())     // 状态管理
app.use(router)            // 路由
app.mount('#app')
```

启动顺序：注册拦截器 → 创建 app → 注册 Pinia → 注册 Router → 挂载到 `#app`。

### 1.2 `App.vue` — 根布局

文件：`frontend/src/App.vue`

```vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
```

**重要约定**：`App.vue` 统一提供 Header + Footer + ToastContainer。**所有 View 组件禁止**自行引入 `AppHeader` / `AppFooter`，否则会出现重复页眉页脚。

---

## 二、目录结构

```
frontend/src/
├── api/                  # API 封装层（5 文件）
│   ├── auth.ts           # 登录/注册/用户信息（baseURL: /api）
│   ├── user.ts           # Token CRUD/充值/日志（baseURL: /api）
│   ├── images.ts         # 生图/模型列表（baseURL: /v1，用 API Key）
│   ├── payment.ts        # 支付订单/充值记录（baseURL: /api）
│   └── gallery.ts        # 画廊（纯前端，import prompts.json）
├── assets/
│   └── styles/
│       └── global.css    # Tailwind + 组件层（card/btn-primary/input-field/chip）
├── components/           # 公共组件（8 个）
│   ├── AppHeader.vue     # 顶栏（导航 + 用户菜单）
│   ├── AppFooter.vue     # 页脚（产品/支持/法律）
│   ├── ImagePreview.vue  # 图片网格 + lightbox
│   ├── ImageUploader.vue # 图片上传（拖拽/点击，转 base64）
│   ├── PromptInput.vue   # 提示词输入 + 预设
│   ├── StyleSelector.vue # 风格/尺寸/数量选择器
│   ├── ToastContainer.vue # 全局 Toast 通知
│   └── LoadingSpinner.vue # 加载圈
├── views/                # 页面视图（9 个）
├── stores/
│   └── auth.ts           # Pinia store（双 Token 认证）
├── router/
│   └── index.ts          # 路由 + 守卫
├── utils/
│   ├── axiosSetup.ts     # 全局 axios 拦截器
│   ├── toast.ts          # Toast 单例
│   └── promptHelpers.ts  # 画廊辅助（渐变色/emoji/占位符替换）
├── data/
│   └── prompts.json      # 30 条精选提示词
├── App.vue
└── main.ts
```

---

## 三、构建配置

### 3.1 `vite.config.ts`

文件：`frontend/vite.config.ts`

- **路径别名**：`@` → `src/`（如 `import { authApi } from '@/api/auth'`）
- **开发端口**：5173
- **开发代理**：3 条规则（`/api/pay` → :3001，`/api` → :3000，`/v1` → :3000）
- **构建**：`vue-tsc && vite build`（先类型检查，再构建）

### 3.2 `tailwind.config.js`

文件：`frontend/tailwind.config.js`

主题定制：
- **主色 primary**：浅蓝科技色系（`#3B82F6` 为 primary-500，从 50 到 900 全色阶）
- **gray**：slate 色系（`#F8FAFC` 到 `#0F172A`）
- **字体**：`Inter, PingFang SC, Noto Sans SC, system-ui`（中英混排优化）
- **阴影**：自定义 `glow`（`0 0 20px rgba(59,130,246,0.15)` 蓝色光晕）

---

## 四、设计系统（global.css）

文件：`frontend/src/assets/styles/global.css`

定义了 7 个可复用的组件类（`@layer components`）：

| 类名 | 用途 | 关键样式 |
|------|------|----------|
| `.card` | 卡片容器 | 白底 + 圆角 + 边框 + 阴影 |
| `.card-hover` | 可悬停卡片 | card 基础 + hover 上浮 + 蓝色边框 |
| `.btn-primary` | 主按钮 | 蓝色渐变 + 悬停上浮 + 禁用态 |
| `.btn-secondary` | 次按钮 | 白底蓝字 + 蓝色边框 |
| `.btn-ghost` | 幽灵按钮 | 透明底 + 悬停灰底 |
| `.input-field` | 输入框 | 全宽 + 圆角 + 聚焦蓝色边框 + ring |
| `.chip` | 标签 chip | 小圆角 + 边框 + 悬停蓝色 |
| `.chip-active` | 激活态 chip | 蓝底 + 蓝边 + 蓝字 |
| `.section-tag` | 章节标签 | 小写大写混合 + 蓝底 |

**使用约定**：所有组件统一使用这些预定义类，避免散落的样式。按钮可叠加 `!py-2 !px-4` 微调尺寸（`!` 表示 important 覆盖）。

---

## 五、页面视图（9 个 View）

| 视图文件 | 路由 | 需登录 | 职责 |
|----------|------|--------|------|
| `HomeView.vue` | `/` | 否 | 首页：Hero + 6 功能卡 + 画廊预览 + 定价预览 + CTA |
| `LoginView.vue` | `/login` | 否 | 登录页（邮箱+密码，显隐切换，redirect 回跳，expired 提示） |
| `RegisterView.vue` | `/register` | 否 | 注册页（邮箱+密码+确认密码） |
| `GalleryView.vue` | `/gallery` | 否 | 画廊：搜索 + 6 分类筛选 + 卡片网格 + 参数对话框 |
| `PricingView.vue` | `/pricing` | 否 | 定价：4 套餐卡 + 充值说明 + 4 条 FAQ |
| `ConsoleView.vue` | `/console` | 是 | 控制台：欢迎卡 + 3 快捷入口 + 最近使用记录 |
| `CreateView.vue` | `/console/create` | 是 | **核心生图页**：文生图/图生图 Tab + 提示词 + 模型/风格/尺寸/数量 |
| `BillingView.vue` | `/console/billing` | 是 | 充值中心：余额/充值/订单 三 Tab + 支付宝 + 兑换码 |
| `SettingsView.vue` | `/console/settings` | 是 | 个人设置：个人信息/API 密钥/充值 三 Tab |

### 加载策略

- `HomeView` 静态 import（首屏优化，避免首次访问的动态加载延迟）
- 其余 8 个 View 动态 `() => import(...)`（按需加载，减小首屏 bundle）

### CreateView 核心逻辑

`CreateView.vue` 是最复杂的视图，包含：
- **Tab 切换**：文生图（text2image）/ 图生图（image2image）
- **提示词输入**：6 条预设（`presets` 数组，中文）
- **模型选择**：3 个（gpt-image-1 / dall-e-3 / imagen-3）
- **风格选择**：7 种（写实/动漫/插画/油画/水彩/极简/摄影），每种对应英文后缀（如"写实" → `, photorealistic, 8K, high detail`）
- **尺寸选择**：3 种（1:1 / 16:9 / 9:16）
- **数量选择**：1 / 2 / 4 张
- **图片上传**：拖拽 + 点击，转 base64，限 10MB
- **结果展示**：调用 `ImagePreview` 组件

---

## 六、公共组件（8 个）

| 组件 | 文件 | 职责 | 被谁引用 |
|------|------|------|----------|
| `AppHeader` | `components/AppHeader.vue` | 毛玻璃固定顶栏 + 桌面导航 + 移动端底部导航 + 用户下拉菜单（头像字母、余额、退出） | `App.vue` |
| `AppFooter` | `components/AppFooter.vue` | 深色四栏页脚（产品/支持/法律 + 版权） | `App.vue` |
| `ToastContainer` | `components/ToastContainer.vue` | 全局 Toast 通知容器（Teleport 到 body） | `App.vue` |
| `ImagePreview` | `components/ImagePreview.vue` | 图片网格 + lightbox + 下载/收藏/变体按钮 + 加载骨架屏 + 失败 fallback | `CreateView`、`GalleryView`、`HomeView` |
| `LoadingSpinner` | `components/LoadingSpinner.vue` | 旋转加载圈（sm/md/lg 三档） | 多处 |
| `ImageUploader` | `components/ImageUploader.vue` | 拖拽/点击上传图片，转 base64 | **疑似废弃**（CreateView 内联了等价逻辑） |
| `PromptInput` | `components/PromptInput.vue` | 提示词输入框 + 预设 chip | **疑似废弃**（CreateView 内联了等价逻辑） |
| `StyleSelector` | `components/StyleSelector.vue` | 风格/尺寸/数量 chip 选择器 | **疑似废弃**（CreateView 内联了等价逻辑） |

> 注：`ImageUploader`、`PromptInput`、`StyleSelector` 三个组件存在但未被引用，`CreateView.vue` 内联了等价逻辑。属于遗留代码，可后续清理。

### AppHeader 关键特性

- **毛玻璃效果**：`bg-white/80 backdrop-blur-xl`
- **桌面导航**：画廊 / 定价
- **移动端底部导航**：首页 / 画廊 / 创作 / 定价（4 个 SVG 图标）
- **用户菜单**：头像字母（用户名首字母大写）+ 余额显示（`formatBalance` 换算积分）+ 创建图片/充值中心/设置/退出登录
- **未登录态**：登录 / 免费注册 按钮

### ImagePreview 关键特性

- **响应式网格**：1/2/3/4 张时不同的 grid 布局
- **Lightbox**：点击图片全屏查看，支持键盘 ←/→ 导航
- **操作按钮**：下载 / 收藏 / 生成变体
- **骨架屏**：加载时显示灰色占位
- **失败 fallback**：图片加载失败时显示图标 + "加载失败"

---

## 七、前端开发约定

1. **View 禁止引入 Header/Footer**：由 `App.vue` 统一提供
2. **API 调用走 `api/` 层**：不直接在 View 中用 axios，通过 `authApi` / `userApi` / `imagesApi` 等封装调用
3. **状态管理用 Pinia store**：认证状态用 `useAuthStore()`，不在组件内散落管理
4. **样式用预定义类**：优先用 `card` / `btn-primary` / `input-field` / `chip`，自定义样式用 Tailwind 原子类
5. **图标用内联 SVG**：未引入图标库，所有图标都是内联 SVG（保持依赖最小）
