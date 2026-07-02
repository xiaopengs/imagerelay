# 设计文档三轮审核报告

> 三个角色（开发者 / 产品经理 / 架构师）分别对 DESIGN.md v1.0 做了严格审核。
> 以下为审核发现及修正建议，已全部合并到 DESIGN.md v2.0 定稿中。

---

## 审核一：开发者视角

### A. 技术可行性问题

**A1. API 路径与 new-api 实际端点严重不匹配（致命级）**

前端当前使用的路径与 new-api 路由完全不同：

| 前端当前调用 | new-api 实际路径 | 差异 |
|---|---|---|
| `POST /api/v1/users/login` | `POST /api/user/login` | 无 /v1/，users→user |
| `POST /api/v1/users/register` | `POST /api/user/register` | 同上 |
| `GET /api/v1/users/me` | `GET /api/user/self` | 端点名不同 |
| `POST /api/v1/users/top_up` | `POST /api/user/topup` | 端点+入参都不同 |
| `POST /api/v1/images/generations` | `POST /v1/images/generations` | 无 /api/ 前缀 |
| `GET/POST/DELETE /api/v1/tokens` | `GET/POST/DELETE /api/token/` | 去 /v1/，tokens→token |
| `GET /api/v1/images/history` | **不存在** | new-api 无此端点 |

**修正**：v2.0 第 5 节完全重写，增加 Phase 0 API 迁移步骤。

**A2. 图片历史端点不存在（致命级）**

new-api 的 relay 层只做 API 转发，不存储生成历史。

**修正**：Phase 1 砍掉 HistoryView，用 sessionStorage 缓存当前会话结果，Phase 2 再补。

**A3. 充值到账接口用法错误（严重）**

`POST /api/user/topup` 是用户用兑换码充值的接口，不是管理员充值接口。管理员充值需调 `POST /api/user/manage`。

**修正**：v2.0 第 7.5 节修正为正确的管理员接口 + 双 header 认证。

**A4. 支付宝 SDK 用法错误（严重）**

- `alipayPublicKey` 拼写错误，应为 `alipayPublickKey`
- `QUICK_WAP_WAY` 不存在，应为 `QUICK_WAP_PAY`
- 返回值不是 URL 而是 HTML form

**修正**：v2.0 第 7.4 节全部修正，锁定 SDK 版本 v3.6.1。

**A5. Tailwind @apply 交叉引用可能编译失败（中等）**

`.card-hover { @apply card ... }` 引用同层定义的 `.card` 在某些 Tailwind 版本下会报错。

**修正**：v2.0 第 2.2 节展开所有 @apply，不引用自定义 class。

### B. 实现复杂度评估

**被低估的工作量**：
- API 路径迁移：未单独列出 → 实际需要 1 天
- 支付微服务：4 天 → 实际 7-10 天
- 200 条提示词整理：2 天 → 实际 3-4 天

**可以砍掉或推迟的功能**：
- 画廊 Phase 1 只做 30 条（不是 200 条）
- DocsView 推迟到 Phase 2
- 首页砍 Gallery Preview 和 Pricing Preview（5 section → 3 section）
- 优先评估 new-api 内置 epay，可能不需要独立支付微服务

### C. 开发顺序建议

增加 Phase 0（API 路径迁移），ImagePreview 提到 Phase 0（编译阻塞）。

---

## 审核二：产品经理视角

### A. 用户体验闭环

**新用户引导缺失**：注册后直接跳到控制台，缺少引导步骤。

**建议**：注册后自动跳转到 `/console/create`，展示 3 步引导（输入提示词 → 选参数 → 生成图片）。

**余额不足提示不够强**：生图按钮 disabled 状态不够醒目。

**建议**：余额不足时显示红色提示条 + "立即充值" 链接。

### B. 商业闭环

**免费试用 → 付费转化触发点**：新用户获得 10 积分，大约可生成 5-10 张图。当积分耗尽时的转化路径需要设计。

**建议**：积分低于 5 时，在 CreateView 顶部显示黄色提示条 + 充值入口。

**积分消耗感知**：用户需要清楚知道"每张图花多少钱"。

**建议**：CreateView 的生成按钮上显示"生成 — N 积分"，生成成功后 toast 提示"已消耗 N 积分，剩余 X 积分"。

### C. 功能缺失/多余

**Phase 1 必须但文档没覆盖的**：
- 生成失败的用户友好提示（网络超时、内容审核拒绝等）
- 登录后自动创建 API Key 的流程（新用户没有 sk-xxx key 无法生图）

**文档中有但 Phase 1 不需要的**：
- 首页 Gallery Preview 和 Pricing Preview（通过导航可达即可）

---

## 审核三：架构师视角

### A. 系统边界与职责

**payment-service 调 new-api 充值存在严重问题**：

1. 端点搞错了 — `/api/user/topup` 是用户兑换码充值，不是管理员充值
2. 认证方式错了 — new-api 强制要求 `New-Api-User` header
3. 权限模型不匹配 — 需要 admin 角色 access_token + user_id header

**修正**：v2.0 第 7.5 节修正为 `POST /api/user/manage` + 双 header，同时增加方案 B（自动创建兑换码+自动兑换）。

**前端不应传递 quota 值**：套餐对应的 quota 由后端维护，前端只传 packageId。

### B. 数据流完整性

**前端认证方式混淆**：

- 管理接口 `/api/*` 应走 session cookie（浏览器自动管理）
- Relay 接口 `/v1/*` 应走 API token（sk-xxx），前端需要登录后创建

**修正**：v2.0 第 5.4 节新增认证分层说明，stores/auth.ts 重写为双 token 管理。

**并发风险**：payment-service 没有与 new-api 共享锁。同一用户多笔支付可能出现竞态。

**修正**：v2.0 第 7.5 节增加幂等检查（回调前检查订单状态，仅 pending 时处理）。

### C. 安全与风险

- ADMIN_TOKEN 暴露在环境变量 → 建议创建专用 service account
- MySQL 密码硬编码 → 改为从 .env 读取
- CORS 配置 `AllowAllOrigins + AllowCredentials` 不合规 → 同源代理不需要 CORS
- localStorage 存 token 有 XSS 风险 → Phase 1 可接受，后续迁移 httpOnly cookie

### D. 扩展性

- 添加微信支付：架构上容易扩展，约 30% 改动，orders 表预留 payment_provider 字段
- 提示词从 JSON 迁移到后端 API：galleryApi 已做抽象层，改动小
- 用户增长瓶颈：MySQL 连接数 → Redis 缓存 → 图片生成排队

---

## 总结：v2.0 定稿修正清单

| 修正项 | 来源 | 影响章节 |
|--------|------|----------|
| API 路径全量迁移表 | 开发者 + 架构师 | §5 完全重写 |
| 新增 Phase 0 开发步骤 | 开发者 | §10 重排 |
| 认证双轨制说明 | 架构师 | §5.4 新增 |
| stores/auth.ts 双 token | 架构师 | §5.2 重写 |
| 充值到账接口修正 | 开发者 + 架构师 | §7.5 重写 |
| 支付宝 SDK 参数修正 | 开发者 | §7.4 重写 |
| 优先评估 new-api 内置支付 | 开发者 + 产品经理 | §7.0 新增 |
| 砍掉 HistoryView | 开发者 + 架构师 | §3、§4.6 |
| 首页精简为 3 section | 产品经理 | §4.1 |
| 提示词 Phase 1 减至 30 条 | 开发者 | §6 |
| @apply 交叉引用展开 | 开发者 | §2.2 |
| 幂等保障说明 | 架构师 | §7.5 |
| Nginx 路由顺序修正 | 架构师 | §8.2 |
