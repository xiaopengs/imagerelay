# ImageRelay 规格书

## 技术栈
- 前端：Vue.js 3 + Vite + TypeScript + TailwindCSS
- 后端网关：One API（MIT 开源，Docker 部署）
- 数据库：SQLite（One API 内置，生产可选 MySQL）
- 界面语言：简体中文（可扩展英文）

## 功能范围

### P0（必须上线）
1. 文生图（Text-to-Image）— GPT Image 2
2. 图生图（Image-to-Image）
3. 用户注册/登录（邮箱 + 密码）
4. 个人 API Token 生成与管理
5. 积分余额展示
6. 充值码充值功能
7. 生图历史记录

### P1（发版后迭代）
1. 图片编辑（局部重绘）
2. 订阅套餐页面
3. 管理后台（用户管理、渠道管理）
4. API 文档页

## 页面结构
- `/` — 首页（Landing）
- `/login` — 登录
- `/register` — 注册
- `/console` — 控制台主页
- `/console/text2image` — 文生图
- `/console/image2image` — 图生图
- `/console/history` — 历史记录
- `/console/settings` — 个人设置
- `/pricing` — 定价页
- `/docs` — API 文档

## API 集成
- One API 网关：部署在本地 :3000
- 前端通过 Vite 代理转发到 One API（/api/v1 和 /v1）
- 用户认证：One API 内置 JWT，前端 Pinia 管理

## 支付方式
- 充值码：线下转账后获得充值码，在个人设置页充值

## 配色方案
- 主色：#7c6af5（紫蓝色）
- 背景：#0a0a0f（深色）
- 卡片：#141420
- 文字：#e0e0e0
- 强调色：#9d8cff
- 成功：#4ade80
- 错误：#f87171