# ImageRelay 开发待办清单

> 基于 Phase 0+1 完成后的项目审计生成。每完成一项勾选 `[x]` 并提交。

---

## 已完成（Phase 0+1）

- [x] 浅蓝科技主题替换（#3B82F6 主色 + 白色卡片背景）
- [x] tailwind.config.js + global.css 设计系统
- [x] App.vue 统一 Header/Footer 布局
- [x] AppHeader.vue 毛玻璃导航栏（桌面 + 移动端）
- [x] AppFooter.vue 深色四栏底部栏
- [x] API 路径从 OneAPI 迁移到 new-api（/api/user/* + /v1/*）
- [x] 双 Token 认证（Session Token + API Key）
- [x] LoginView / RegisterView 重写
- [x] HomeView 首页（Hero + Features + Gallery Preview + Pricing Preview + CTA）
- [x] ConsoleView 仪表盘（欢迎卡 + 快捷入口 + 空状态）
- [x] PricingView 定价页（4 档套餐 + FAQ）
- [x] SettingsView 设置页（个人资料 / API Keys / 充值码）
- [x] ImagePreview 组件（网格 + lightbox + 下载）
- [x] PromptInput / StyleSelector / ImageUploader 组件
- [x] infra/docker-compose.yml 升级到 new-api + MySQL + Redis
- [x] infra/nginx.conf 适配新路由
- [x] README.md 部署指南
- [x] 设计文档保存（DESIGN.md v2.0 + docs/）

---

## Phase 2 — 核心生图页 ✅ 已完成

### 2.1 CreateView 完整实现

- [x] 重写 CreateView.vue，合并文生图 + 图生图为 Tab 切换
- [x] 使用 `imagesApi.generate()` 替代 raw fetch（统一走 `/v1/images/generations`）
- [x] 使用 `apiKey`（而非 session token）认证生图请求
- [x] 内置提示词预设（6 条精选 prompt）
- [x] 内置风格选择器（7 种风格 → prompt 后缀拼接）
- [x] 内置图片上传组件（图生图模式，拖拽 + 点击，10MB 限制，类型校验）
- [x] 实现模型 chip 选择器（gpt-image-1 / dall-e-3 / imagen-3）
- [x] 实现尺寸 chip 选择器（1:1 / 16:9 / 9:16）
- [x] 实现数量 chip 选择器（1 / 2 / 4）
- [x] 接入 ImagePreview 组件展示生成结果
- [x] 显示积分消耗预估和当前余额
- [x] 生成中骨架屏 / loading 动画
- [x] 错误提示（余额不足 / 网络超时 / 模型不可用 / 401）
- [x] 支持 URL query 传参（从画廊跳转时自动填入提示词）
- [x] 余额不足时禁用生成按钮并引导充值

### 2.2 ConsoleView 增强

- [x] 从 auth store 获取真实用户数据
- [x] 实现"最近使用"区域 — 调 `/api/log/self` 获取最近记录
- [x] 余额不足时显示充值提示

### 2.3 清理废弃文件

- [x] 删除 `Text2ImageView.vue`（生图逻辑已迁移到 CreateView）
- [x] 删除 `Image2ImageView.vue`（上传逻辑已迁移到 CreateView）
- [x] 删除 `HistoryView.vue`（new-api 无端点）
- [x] 删除 `DocsView.vue`（API 文档已在 README 中）

---

## Phase 3 — 提示词画廊 ✅ 已完成

### 3.1 数据准备

- [x] 从 awesome-gpt-image-2 精选 30 条提示词
- [x] 创建 `src/data/prompts.json`
- [x] 每条包含：id / title / titleEn / description / content / arguments / categories / featured
- [x] 覆盖 6 个分类：头像 / 社交媒体 / 电商 / 信息图 / 游戏 / 漫画

### 3.2 GalleryView 完整实现

- [x] 实现分类筛选栏（chip 样式，前端过滤）
- [x] 实现搜索框（前端过滤 title + content + description，大小写不敏感）
- [x] 实现卡片网格（1-4 列响应式，card-hover，渐变预览 + emoji + 标题 + 摘要 + 分类标签）
- [x] 点击卡片：无参数直接跳转 CreateView（query 传 prompt）
- [x] 点击卡片：有参数弹出对话框填写 {argument} 后跳转（全局替换占位符）
- [x] 实现 `src/api/gallery.ts`（前端静态加载，不调后端）

### 3.3 HomeView 画廊联动

- [x] 首页 Gallery Preview 使用 prompts.json 中的 featured 数据
- [x] 有参数的 featured prompt 点击弹出参数对话框（非直接跳转）
- [x] "查看更多" 链接到 /gallery

### 3.4 审核修复

- [x] 提取共享 promptHelpers.ts（gradients / emojiMap / getGradient / getEmoji / replaceArguments）
- [x] 修复 goToCreate 的 replaceAll 问题（占位符多次出现时全部替换）
- [x] 修复 galleryApi.search 大小写不敏感搜索
- [x] HomeView 画廊卡片支持参数对话框

---

## Phase 4 — 支付系统 ✅ 已完成

### 4.1 支付方案评估

- [x] 研究 new-api 内置 epay（易支付）网关能力
- [x] 决策：优先使用 new-api 内置 epay，前端调 `POST /api/user/pay`
- [x] 备选方案：兑换码充值（`POST /api/user/topup`）

### 4.2 BillingView 完整实现

- [x] 余额概览 Tab：显示真实余额 + 最近消费记录（调 `/api/log/self`）
- [x] 充值 Tab：4 档套餐卡片（体验包 19.9 / 标准包 49.9 / 专业包 99.9 / 企业包 299.9）
- [x] 选中套餐后显示支付宝支付按钮
- [x] 支付成功后刷新余额按钮
- [x] 兑换码充值区域
- [x] 订单记录 Tab：表格展示历史充值记录（分页）
- [x] 接入 `api/payment.ts`（createPayOrder / getTopUpRecords / redeemCode）

### 4.3 审核修复

- [x] 修复 pay_form DOM 泄漏（添加 setTimeout cleanup）
- [x] 添加支付后刷新余额功能
- [x] 修复 ordersTotal falsy 检查（typeof 判断）
- [x] 修复分页按钮使用独立方法（避免内联表达式副作用）

---

## Phase 5 — 收尾与打磨 ✅ 已完成

### 5.1 响应式适配

- [x] CreateView 移动端左右面板改为上下布局（flex-col lg:flex-row）
- [x] GalleryView 网格响应式（1-2-3-4 列）
- [x] ImagePreview 响应式（grid-cols-1 sm:grid-cols-2）
- [x] PricingView / BillingView 卡片响应式堆叠

### 5.3 错误处理与边界情况

- [x] 全局 Axios 拦截器：401 自动跳转登录、网络错误 Toast 提示
- [x] Toast 通知系统（success / error / info，自动消失，可点击关闭）
- [x] 生图超时处理（120s 超时后友好提示）
- [x] 余额不足时禁用生成按钮并引导充值
- [x] 图片加载失败 fallback（broken image → 占位图 + "加载失败"）
- [x] 路由守卫增强：未登录访问 /console/* 跳转登录并保留来源页（redirect query）
- [x] LoginView 支持 redirect 回跳（登录后返回原页面）

### 5.4 性能优化

- [x] 图片懒加载（ImagePreview 使用 loading="lazy"）
- [x] 路由级代码分割（lazy import）
- [x] prompts.json 静态加载（30 条数据量小，无需按需加载）

---

## 已知技术问题（部署时注意）

| 问题 | 说明 | 影响 |
|------|------|------|
| 余额单位 | new-api quota 单位是 500000 = 1 积分，前端显示需除以 500000 | 所有显示余额的地方统一用 `formatBalance()` |
| alipay SDK 参数拼写 | `alipayPublickKey`（多一个 k）、`QUICK_WAP_PAY`（非 WAY） | 对接支付时注意 |
| 管理员接口双 header | new-api 管理接口需 `Authorization` + `New-Api-User` | payment-service 回调充值时需要 |
| 内置 epay 需配置 | new-api 管理后台需配置支付宝商户参数才能使用在线支付 | 未配置时前端会提示"支付服务暂未开通" |

---

## Git 提交历史

| 提交 | 说明 |
|------|------|
| `336fdc4` | Phase 1: 浅蓝主题 + new-api 迁移 + 全 UI 重写 |
| `2246d07` | Phase 2: CreateView 完整实现 + ConsoleView 增强 + 组件主题更新 |
| `df265db` | Phase 2 审核修复: apiKey 守卫, 变体 base64, 文件校验, 余额符号 |
| `bd1bd33` | Phase 3: 提示词画廊 30 条 + 搜索 + 分类筛选 + 参数对话框 |
| `414c701` | Phase 3 审核修复: 提取 promptHelpers, replaceAll, featured 对话框 |
| `3f657a1` | Phase 4: BillingView + 支付 API + 4 档套餐 + 订单记录 |
| `c38322e` | Phase 4 审核修复: DOM 清理, 刷新余额, ordersTotal, 分页 |
| 最新 | Phase 5: Toast 通知 + Axios 拦截器 + 路由守卫增强 + 响应式 + 图片容错 |
