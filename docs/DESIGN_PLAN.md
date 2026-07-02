# GPT Image 2 生图平台 - 整体设计方案与工作流

## 一、项目概述

基于 imagerelay 项目原型，构建一套以 GPT Image 2 为核心的 AI 生图 SaaS 平台。替换 OneAPI 底座为 QuantumNous/new-api，集成 11,600+ 提示词库，接入支付宝支付，采用浅蓝科技风格的全新 UI 设计。

---

## 二、技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
│         Vue 3 + TypeScript + TailwindCSS + Vite              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                    Nginx 反向代理                             │
│          静态资源托管 / API 转发 / SSL 终止                    │
└───────┬─────────────────────────────┬───────────────────────┘
        │ /api/*                      │ /pay/*
┌───────▼────────────┐    ┌───────────▼─────────────┐
│   new-api (Go)     │    │  支付回调服务 (Node.js)   │
│  ┌──────────────┐  │    │  支付宝 SDK              │
│  │ 用户认证     │  │    │  订单管理                │
│  │ 额度管理     │  │    │  充值到账通知            │
│  │ 渠道管理     │  │    └───────────┬─────────────┘
│  │ 请求代理     │  │                │
│  │ 用量追踪     │  │    ┌───────────▼─────────────┐
│  │ 模型路由     │  │    │   MySQL / PostgreSQL     │
│  └──────────────┘  │    │  orders / payments       │
└───────┬────────────┘    └─────────────────────────┘
        │
┌───────▼─────────────────────────────────────────┐
│              上游 AI 服务商                       │
│  ┌─────────┐ ┌──────────┐ ┌──────┐ ┌─────────┐ │
│  │ OpenAI  │ │ MidJourney│ │ Flux │ │ Gemini  │ │
│  │ GPT-Img │ │          │ │      │ │ Imagen  │ │
│  └─────────┘ └──────────┘ └──────┘ └─────────┘ │
└─────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Vue 3.4+ (Composition API + `<script setup>`) | 沿用 imagerelay 技术栈 |
| **构建工具** | Vite 5.x | 沿用 |
| **语言** | TypeScript 5.x | 沿用 |
| **样式框架** | TailwindCSS 3.4+ | 重新定义浅蓝科技主题 |
| **状态管理** | Pinia | 沿用 |
| **路由** | Vue Router 4.x | 沿用 |
| **HTTP 客户端** | Axios | 统一封装 |
| **图标库** | Lucide Vue | 新增，现代轻量图标 |
| **动效** | @vueuse/motion + CSS transitions | 新增，提升交互体验 |
| **后端网关** | QuantumNous/new-api (Go + Gin + GORM) | 替换 OneAPI |
| **数据库** | MySQL 8.0 / PostgreSQL 15 | 生产环境 |
| **缓存** | Redis 7.x | 限流、会话、热点数据 |
| **支付服务** | Node.js + Alipay SDK | 新增，支付宝当面付/手机网站 |
| **对象存储** | 阿里云 OSS / MinIO | 新增，图片持久化存储 |
| **容器化** | Docker + Docker Compose | 沿用 |
| **SSL** | Let's Encrypt | 沿用 |

---

## 三、设计系统 - 浅蓝科技风格

### 3.1 色彩体系

```
主色调（Primary）
├── primary-50:   #EFF6FF    最浅背景
├── primary-100:  #DBEAFE    次浅背景/卡片悬浮
├── primary-200:  #BFDBFE    边框/分隔线
├── primary-300:  #93C5FD    禁用态文字
├── primary-400:  #60A5FA    次要按钮/标签
├── primary-500:  #3B82F6    主按钮/链接 ★ 品牌主色
├── primary-600:  #2563EB    主按钮悬浮
├── primary-700:  #1D4ED8    主按钮按下
├── primary-800:  #1E40AF    深色强调
└── primary-900:  #1E3A8A    最深文字

中性色（Neutral）
├── gray-50:   #F8FAFC      页面背景
├── gray-100:  #F1F5F9      卡片背景
├── gray-200:  #E2E8F0      输入框背景
├── gray-300:  #CBD5E1      边框
├── gray-400:  #94A3B8      占位文字
├── gray-500:  #64748B      次要文字
├── gray-600:  #475569      正文文字
├── gray-700:  #334155      标题文字
├── gray-800:  #1E293B      深色标题
└── gray-900:  #0F172A      最深文字

语义色（Semantic）
├── success:   #10B981 / #D1FAE5    成功/完成
├── warning:   #F59E0B / #FEF3C7    警告/待处理
├── error:     #EF4444 / #FEE2E2    错误/删除
└── info:      #3B82F6 / #DBEAFE    信息/提示

特殊色
├── gradient-hero:  linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)
├── gradient-card:  linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)
├── gradient-btn:   linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
└── glass-bg:       rgba(255, 255, 255, 0.7) + backdrop-blur(12px)
```

### 3.2 字体系统

```
标题字体: "Inter", "PingFang SC", "Noto Sans SC", system-ui, sans-serif
正文字体: "Inter", "PingFang SC", "Noto Sans SC", system-ui, sans-serif
代码字体: "JetBrains Mono", "Fira Code", "Consolas", monospace

字号规范:
  display:   48px / 72px line-height / font-weight 800
  h1:        36px / 44px / 700
  h2:        30px / 38px / 700
  h3:        24px / 32px / 600
  h4:        20px / 28px / 600
  body-lg:   18px / 28px / 400
  body:      16px / 24px / 400
  body-sm:   14px / 20px / 400
  caption:   12px / 16px / 400
```

### 3.3 间距与圆角

```
间距基准 (4px grid):
  xs: 4px    sm: 8px    md: 16px    lg: 24px    xl: 32px    2xl: 48px    3xl: 64px

圆角:
  sm: 6px     (按钮、输入框)
  md: 10px    (卡片、弹窗)
  lg: 16px    (大卡片、模态框)
  xl: 24px    (特殊装饰)
  full: 9999px (头像、胶囊按钮)

阴影:
  sm:   0 1px 2px rgba(0,0,0,0.05)
  md:   0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)
  lg:   0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)
  xl:   0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)
  glow: 0 0 20px rgba(59,130,246,0.15)
```

### 3.4 组件设计规范

**按钮 (Button)**
- Primary: 渐变蓝底 + 白色文字 + 圆角 sm + hover 加深 + 微上移 2px
- Secondary: 白底 + primary-500 边框 + primary-500 文字 + hover 填充 primary-50
- Ghost: 透明底 + gray-600 文字 + hover 填充 gray-100
- Danger: 白底 + error 边框 + error 文字
- 所有按钮: 高度 40px (md) / 48px (lg), 内边距 16px/24px, transition 200ms

**卡片 (Card)**
- 白底 + gray-200 边框 (1px) + 圆角 md + shadow-sm
- hover: shadow-md + 微上移 2px + border 变为 primary-200
- 内边距: 24px

**输入框 (Input)**
- 白底 + gray-300 边框 + 圆角 sm + 高度 40px
- focus: border-primary-500 + ring 2px primary-200
- placeholder: gray-400

**导航栏 (Navbar)**
- 固定顶部 + 高度 64px + 白底 (glass-bg 毛玻璃效果)
- Logo 左对齐 + 导航链接居中 + 用户信息右对齐
- 底部 1px gray-200 分隔线 + shadow-sm

---

## 四、功能模块拆解

### 4.1 页面结构与路由

```
公开页面（无需登录）
├── /                         首页 Landing Page
├── /pricing                  定价页面
├── /gallery                  公开画廊（提示词灵感库）
├── /docs                     API 文档
├── /login                    登录
├── /register                 注册
└── /reset-password           重置密码

控制台页面（需登录）
├── /console                  控制台首页（仪表盘）
├── /console/create           创建图片（核心生图页）
├── /console/history          生成历史
├── /console/gallery          我的画廊（收藏/精选）
├── /console/billing          账单中心
│   ├── /console/billing/overview    余额概览
│   ├── /console/billing/topup       充值（支付宝）
│   └── /console/billing/orders      订单记录
├── /console/api-keys         API Key 管理
├── /console/settings         个人设置
└── /console/docs             开发者文档

管理后台（管理员）
├── /admin                    管理后台入口
├── /admin/channels           渠道管理
├── /admin/users              用户管理
├── /admin/tokens             Token 管理
├── /admin/logs               日志查看
└── /admin/settings           系统设置
```

### 4.2 核心功能模块

#### 模块 A: 首页 Landing Page

| 区块 | 内容 |
|------|------|
| Hero | 大标题 + 副标题 + CTA 按钮 + 实时生图演示动画 |
| 功能展示 | 4-6 个核心能力卡片（文生图、图生图、多模型、API 接入、画廊、极速生成） |
| 模型展示 | GPT Image 2 / DALL-E 3 / Midjourney / Flux / Imagen 模型 Logo + 样例图 |
| 定价预览 | 3 档套餐卡片 + "查看更多" 链接 |
| 画廊精选 | 6-8 张精选生成作品 + "探索画廊" |
| CTA 区域 | "立即开始，免费获得 10 积分" |
| Footer | 链接、版权、社交媒体 |

#### 模块 B: 核心生图页 /console/create

这是平台的核心交互页面，整合文生图和图生图为统一界面：

```
┌──────────────────────────────────────────────────┐
│  [文生图]  [图生图]  [批量生成]   ← 模式切换 Tab  │
├──────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ 提示词输入区          │  │  参考图上传区     │  │
│  │ - 多行文本框          │  │  (图生图模式)     │  │
│  │ - 智能提示词补全      │  │                  │  │
│  │ - 提示词模板快捷选择  │  │                  │  │
│  └──────────────────────┘  └──────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐│
│  │ 参数设置区                                     ││
│  │ 模型: [GPT Image 2 ▾] [DALL-E 3] [MJ] [Flux] ││
│  │ 尺寸: [1:1] [16:9] [9:16] [4:3] [3:4]       ││
│  │ 质量: [标准] [高清 HD]                         ││
│  │ 数量: [1] [2] [4]                             ││
│  │ 风格: [自动] [写实] [动漫] [油画] [水彩] ...  ││
│  │ 高级: 负面提示词 / 种子值 / CFG Scale         ││
│  └──────────────────────────────────────────────┘│
│                                                    │
│  [✨ 开始生成 (消耗 2 积分)]  ← 主 CTA 按钮      │
│                                                    │
│  ┌──────────────────────────────────────────────┐│
│  │ 生成结果区                                     ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             ││
│  │ │ img │ │ img │ │ img │ │ img │             ││
│  │ └─────┘ └─────┘ └─────┘ └─────┘             ││
│  │ 操作: [下载] [收藏] [分享] [变体] [放大]      ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

#### 模块 C: 提示词画廊 /gallery

整合 awesome-gpt-image-2 的 11,600+ 提示词：

| 功能 | 说明 |
|------|------|
| 分类浏览 | 按用途（头像/社交媒体/信息图/缩略图/漫画/产品/电商/游戏）、风格（16种）、主题（15种）筛选 |
| 搜索 | 关键词搜索提示词标题和内容 |
| 提示词卡片 | 展示：示例图 + 标题 + 提示词摘要 + 分类标签 |
| 一键使用 | 点击提示词卡片 → 跳转到生图页并自动填入提示词 |
| 参数化 | 支持 {argument} 占位符的提示词弹出参数填写表单 |
| 收藏 | 登录用户可收藏提示词到个人收藏夹 |
| 贡献 | 用户可提交自己的提示词 |

#### 模块 D: 支付系统（支付宝）

```
支付流程:
  用户选择套餐/充值金额
    → 前端创建订单 POST /api/pay/create-order
    → 后端调用支付宝 SDK 生成支付链接/二维码
    → 跳转支付宝收银台 / 展示扫码弹窗
    → 用户完成支付
    → 支付宝异步通知 POST /api/pay/alipay-notify
    → 后端验签 → 更新订单状态 → 调用 new-api 充值额度
    → 前端轮询/WebSocket 获取支付结果
    → 显示充值成功

套餐设计:
  ┌──────────┬────────┬────────┬───────────┐
  │ 套餐名   │ 价格   │ 积分   │ 单价      │
  ├──────────┼────────┼────────┼───────────┤
  │ 体验包   │ ¥19.9  │ 50     │ ¥0.40/张  │
  │ 标准包   │ ¥49.9  │ 150    │ ¥0.33/张  │
  │ 专业包   │ ¥99.9  │ 400    │ ¥0.25/张  │
  │ 企业包   │ ¥299.9 │ 1500   │ ¥0.20/张  │
  └──────────┴────────┴────────┴───────────┘

  自定义充值: ¥10 - ¥10000, ¥0.35/积分

支付宝接入方式:
  - 手机网站支付 (H5) - 移动端
  - 当面付 (Face-to-face) - PC 端扫码
  - 电脑网站支付 (PC) - PC 端跳转
```

#### 模块 E: 用户系统

| 功能 | 实现 |
|------|------|
| 注册/登录 | new-api 内置用户系统（邮箱 + 密码） |
| OAuth | GitHub OAuth (new-api 内置) |
| 个人中心 | 显示名称、邮箱、注册时间、总消费 |
| 安全设置 | 修改密码 |
| API Key 管理 | 创建/查看/删除 API Key |
| 额度管理 | 查看余额、消费记录、充值 |

#### 模块 F: 管理后台

new-api 自带完整管理后台，复用以下能力：
- 渠道管理：配置上游 AI 服务商连接
- 用户管理：查看/编辑/禁用用户、充值额度
- Token 管理：管理下发的 API Key
- 日志查看：全量请求日志、用量统计
- 系统设置：全局参数配置

---

## 五、提示词库集成方案

### 5.1 数据迁移

从 awesome-gpt-image-2 的 Payload CMS 导出提示词数据，转为本地 JSON 格式：

```json
{
  "id": "prompt_001",
  "title": "写实人像摄影",
  "titleEn": "Realistic Portrait Photography",
  "description": "生成具有自然光影和浅景深的写实人像照片",
  "content": "A photorealistic portrait photograph of {subject}, shot on Canon EOS R5...",
  "categories": {
    "useCases": ["profile-avatar"],
    "styles": ["photography"],
    "subjects": ["portrait-selfie"]
  },
  "arguments": [
    { "name": "subject", "default": "a young woman with curly hair", "label": "拍摄主体" }
  ],
  "featured": false,
  "imageUrl": "https://...",
  "author": { "name": "...", "link": "..." },
  "needReferenceImages": false
}
```

### 5.2 存储方案

- **Phase 1**: 提示词数据以静态 JSON 文件打包到前端（约 2000+ 精选提示词）
- **Phase 2**: 后端 API 提供提示词 CRUD + 搜索（接入 Elasticsearch 或 MySQL FULLTEXT）
- **Phase 3**: 用户贡献提示词 + 社区投票 + 审核流程

---

## 六、支付宝支付集成方案

### 6.1 技术选型

使用 Node.js + `alipay-sdk` 构建独立的支付微服务：

```
payment-service/
├── src/
│   ├── index.ts           入口
│   ├── routes/
│   │   ├── order.ts       订单创建/查询
│   │   └── alipay.ts      支付宝回调
│   ├── services/
│   │   ├── alipay.ts      支付宝 SDK 封装
│   │   └── quota.ts       额度充值（调用 new-api）
│   ├── models/
│   │   ├── order.ts       订单模型
│   │   └── payment.ts     支付记录模型
│   └── config/
│       └── alipay.ts      支付宝配置（密钥、回调地址）
├── package.json
└── Dockerfile
```

### 6.2 数据库设计（支付服务）

```sql
-- 订单表
CREATE TABLE orders (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no      VARCHAR(64) UNIQUE NOT NULL,     -- 订单号
  user_id       INT NOT NULL,                    -- new-api 用户 ID
  product_type  ENUM('package', 'custom'),       -- 套餐/自定义
  amount        DECIMAL(10, 2) NOT NULL,         -- 支付金额（元）
  credits       INT NOT NULL,                    -- 充值积分
  status        ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  pay_channel   ENUM('alipay', 'wechat') DEFAULT 'alipay',
  pay_trade_no  VARCHAR(128),                    -- 支付宝交易号
  paid_at       DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_order_no (order_no)
);

-- 支付通知记录表
CREATE TABLE payment_notifications (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no      VARCHAR(64) NOT NULL,
  raw_body      TEXT NOT NULL,                   -- 原始通知内容
  verified      BOOLEAN DEFAULT FALSE,           -- 验签结果
  processed     BOOLEAN DEFAULT FALSE,           -- 是否已处理
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 七、开发工作流与里程碑

### Phase 1: 基础设施搭建（Week 1）

| 序号 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| 1.1 | 克隆 imagerelay 到 F:\CreateAI\qcoder 并重命名项目 | P0 | 0.5h |
| 1.2 | 重构 tailwind.config.js 为浅蓝科技主题 | P0 | 2h |
| 1.3 | 重写 global.css 设计系统变量和基础组件 | P0 | 3h |
| 1.4 | 设计并实现新的 AppHeader（毛玻璃导航栏） | P0 | 2h |
| 1.5 | 设计并实现新的 AppFooter | P1 | 1h |
| 1.6 | 部署 new-api 替换 OneAPI（Docker Compose） | P0 | 3h |
| 1.7 | 配置 new-api 渠道（GPT Image 2 / DALL-E 3） | P0 | 1h |
| 1.8 | 调整 vite.config.ts 代理指向 new-api | P0 | 0.5h |

### Phase 2: 核心页面重构（Week 2-3）

| 序号 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| 2.1 | 重写 HomeView 首页（Hero + 功能展示 + 模型展示 + CTA） | P0 | 6h |
| 2.2 | 重写 LoginView / RegisterView（浅蓝卡片式表单） | P0 | 3h |
| 2.3 | 重写 ConsoleView 仪表盘（数据统计 + 快捷操作 + 最近生成） | P0 | 4h |
| 2.4 | 重写 Text2ImageView 为核心 CreateView（统一生图入口） | P0 | 8h |
| 2.5 | 集成图生图到 CreateView | P0 | 3h |
| 2.6 | 实现 ImagePreview 组件（缺失组件补全 + 图片查看器） | P0 | 3h |
| 2.7 | 重写 HistoryView（瀑布流 + 筛选 + 分页） | P1 | 4h |
| 2.8 | 重写 SettingsView（个人资料 + API Key + 安全） | P1 | 3h |
| 2.9 | 重写 PricingView（套餐卡片 + 对比表 + FAQ） | P1 | 3h |
| 2.10 | 模型选择器组件（支持多模型切换 + 参数联动） | P0 | 3h |
| 2.11 | 风格选择器增强（实际生效的 prompt 后缀注入） | P1 | 2h |
| 2.12 | 生成结果展示区（加载动画 + 网格布局 + 操作栏） | P0 | 4h |

### Phase 3: 提示词画廊（Week 3-4）

| 序号 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| 3.1 | 从 awesome-gpt-image-2 提取并结构化提示词数据 | P0 | 4h |
| 3.2 | 构建提示词数据 JSON 文件（精选 500+ 条） | P0 | 3h |
| 3.3 | 实现 GalleryView 画廊页（分类筛选 + 搜索 + 网格展示） | P0 | 6h |
| 3.4 | 实现 PromptCard 组件（示例图 + 标题 + 标签 + 一键使用） | P0 | 3h |
| 3.5 | 实现参数化提示词表单（解析 {argument} 占位符） | P1 | 4h |
| 3.6 | 画廊 → 生图页联动（一键使用跳转 + 自动填充） | P0 | 2h |
| 3.7 | 收藏功能（后端 API + 前端交互） | P2 | 3h |

### Phase 4: 支付宝支付集成（Week 4-5）

| 序号 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| 4.1 | 搭建 payment-service Node.js 项目骨架 | P0 | 2h |
| 4.2 | 实现支付宝 SDK 封装（下单、验签、退款） | P0 | 4h |
| 4.3 | 实现订单创建 API + 订单查询 API | P0 | 3h |
| 4.4 | 实现支付宝异步回调处理 + 验签 | P0 | 3h |
| 4.5 | 实现充值到账逻辑（调用 new-api topup 接口） | P0 | 2h |
| 4.6 | 前端充值页面（套餐选择 + 支付宝扫码/跳转） | P0 | 5h |
| 4.7 | 前端订单列表 + 支付状态轮询 | P1 | 3h |
| 4.8 | Docker Compose 集成 payment-service | P0 | 1h |
| 4.9 | 沙箱环境联调测试 | P0 | 4h |

### Phase 5: 完善与优化（Week 5-6）

| 序号 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| 5.1 | 响应式适配（移动端 + 平板） | P1 | 6h |
| 5.2 | 加载状态优化（骨架屏 + 进度条） | P2 | 3h |
| 5.3 | 错误处理与用户提示体系 | P1 | 3h |
| 5.4 | API 文档页重写 | P2 | 2h |
| 5.5 | SEO 优化（meta 标签 + sitemap） | P2 | 2h |
| 5.6 | 性能优化（图片懒加载 + 代码分割 + CDN） | P2 | 3h |
| 5.7 | 暗色模式支持（可选） | P3 | 4h |

### Phase 6: 部署上线（Week 6）

| 序号 | 任务 | 优先级 | 预估 |
|------|------|--------|------|
| 6.1 | 生产环境 Docker Compose 编排 | P0 | 2h |
| 6.2 | Nginx 配置优化（SSL + 缓存 + 压缩） | P0 | 2h |
| 6.3 | 数据库迁移脚本（MySQL） | P0 | 1h |
| 6.4 | 支付宝生产环境配置 | P0 | 1h |
| 6.5 | 域名 DNS 配置 + SSL 证书 | P0 | 1h |
| 6.6 | 监控告警（服务健康检查 + 日志收集） | P1 | 3h |
| 6.7 | 压力测试 + 安全审计 | P1 | 4h |

---

## 八、项目目录结构（目标状态）

```
qcoder/                              ← 项目根目录
├── frontend/                        ← Vue 3 前端
│   ├── public/
│   │   └── images/                  ← 静态图片资源
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── style.css                ← Tailwind + 基础样式
│   │   ├── api/                     ← API 请求封装
│   │   │   ├── auth.ts
│   │   │   ├── images.ts
│   │   │   ├── user.ts
│   │   │   ├── gallery.ts           ← 新增：画廊 API
│   │   │   └── payment.ts           ← 新增：支付 API
│   │   ├── stores/                  ← Pinia 状态管理
│   │   │   ├── auth.ts
│   │   │   ├── credits.ts
│   │   │   ├── gallery.ts           ← 新增：画廊状态
│   │   │   └── generation.ts        ← 新增：生图状态
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── components/              ← 通用组件
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── PromptInput.vue
│   │   │   ├── ModelSelector.vue    ← 新增：模型选择器
│   │   │   ├── StyleSelector.vue
│   │   │   ├── SizeSelector.vue     ← 新增：尺寸选择器
│   │   │   ├── ImageUploader.vue
│   │   │   ├── ImagePreview.vue     ← 新增：图片预览器
│   │   │   ├── ImageGrid.vue        ← 新增：图片网格
│   │   │   ├── PromptCard.vue       ← 新增：提示词卡片
│   │   │   ├── PricingCard.vue      ← 新增：定价卡片
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── PaymentModal.vue     ← 新增：支付弹窗
│   │   │   └── CategoryFilter.vue   ← 新增：分类筛选器
│   │   ├── views/                   ← 页面视图
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── ConsoleView.vue
│   │   │   ├── CreateView.vue       ← 新增：统一生图页
│   │   │   ├── GalleryView.vue      ← 新增：公开画廊
│   │   │   ├── HistoryView.vue
│   │   │   ├── BillingView.vue      ← 新增：账单中心
│   │   │   ├── SettingsView.vue
│   │   │   ├── PricingView.vue
│   │   │   └── DocsView.vue
│   │   ├── data/                    ← 新增：静态数据
│   │   │   └── prompts.json         ← 提示词库数据
│   │   ├── composables/             ← 新增：组合式函数
│   │   │   ├── useGeneration.ts
│   │   │   ├── usePayment.ts
│   │   │   └── useGallery.ts
│   │   └── types/                   ← 新增：TypeScript 类型
│   │       ├── api.ts
│   │       ├── prompt.ts
│   │       └── payment.ts
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── payment-service/                 ← 新增：支付微服务
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── config/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── infra/                           ← 基础设施配置
│   ├── docker-compose.yml           ← 更新：集成 new-api + payment
│   ├── docker-compose.prod.yml
│   ├── nginx.conf                   ← 更新：新路由规则
│   ├── new-api/                     ← new-api 配置
│   └── mysql/                       ← MySQL 初始化脚本
│
├── docs/                            ← 项目文档
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 九、与 80ai.net 的功能对标

| 功能模块 | 80ai.net | 本平台 | 差异 |
|----------|----------|--------|------|
| 文生图 | ✅ | ✅ | 支持更多模型 |
| 图生图 | ✅ | ✅ | 同上 |
| 多模型支持 | GPT Image + 多模型 | GPT Image 2 + DALL-E 3 + MJ + Flux + Imagen | 通过 new-api 统一接入 |
| 提示词画廊 | ✅ 基础 | ✅ 增强 | 11,600+ 提示词 + 分类 + 参数化 |
| 定价系统 | ✅ | ✅ | 人民币定价 + 支付宝 |
| 在线支付 | ✅ | ✅ 支付宝 | Phase 2 可扩展微信 |
| API 接入 | ✅ | ✅ | OpenAI 兼容 API |
| 用户系统 | ✅ | ✅ | new-api 内置 |
| 管理后台 | ✅ | ✅ | new-api 自带 |
| 批量生成 | ❓ | ✅ | Phase 2 |
| 图片存储 | ❓ | ✅ OSS | 阿里云 OSS |
| 响应式设计 | ✅ | ✅ | 全端适配 |

---

## 十、关键决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 后端底座 | new-api 替换 OneAPI | 更多模型支持、更完善的计费、Midjourney 代理 |
| 支付服务 | 独立 Node.js 微服务 | 与 Go 后端解耦、支付宝 SDK 生态成熟 |
| 提示词数据 | 静态 JSON → 后端 API | 渐进式开发，先快速上线精选，再扩展全量 |
| 图片存储 | 阿里云 OSS | 国内访问速度、成本可控 |
| UI 风格 | 浅蓝科技 | 用户明确需求，区别于 imagerelay 的暗色主题 |
| 生图页面 | 统一 CreateView | 文生图/图生图合并为一个页面，减少认知负担 |
