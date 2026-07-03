# 05 - 后端 new-api 说明

> 本文档描述后端 new-api 的技术栈、源码结构、关键端点与定制化开发指引。后端源码已 vendored 到 `backend/new-api/`。

---

## 一、技术栈

| 项 | 说明 |
|----|------|
| 语言 | Go 1.26+ |
| Web 框架 | Gin |
| ORM | GORM |
| 数据库 | MySQL 8.0（生产）/ SQLite（开发） |
| 缓存 | Redis 7 |
| 前端（new-api 自带管理后台） | React + Bun（在 `backend/new-api/web/`） |
| 容器基础镜像 | debian:bookworm-slim（运行时） |

---

## 二、源码结构（vendored 在 `backend/new-api/`）

```
backend/new-api/
├── main.go                 # Go 入口
├── Dockerfile              # 多阶段构建（bun 前端 + golang 后端 + debian 运行）
├── go.mod / go.sum         # Go 依赖
├── VERSION                 # 版本号
│
├── router/                 # Gin 路由定义
│   ├── main.go             # 路由入口（注册所有路由组）
│   ├── api-router.go       # 管理接口路由（/api/*）
│   ├── relay-router.go     # Relay 接口路由（/v1/*，OpenAI 兼容）
│   ├── channel-router.go   # 渠道管理路由
│   ├── authz-router.go     # 授权路由
│   ├── dashboard.go        # 仪表盘路由
│   ├── video-router.go     # 视频路由
│   └── web-router.go       # Web 静态文件路由
│
├── controller/             # API 控制器（处理 HTTP 请求）
│   ├── user.go             # 用户：登录/注册/用户信息/充值
│   ├── token.go            # Token CRUD
│   ├── image.go            # 图片生成
│   ├── relay.go            # Relay 转发
│   ├── log.go              # 日志查询
│   ├── topup.go            # 充值码 + 在线支付
│   ├── billing.go          # 计费
│   ├── channel.go          # 渠道管理
│   ├── pricing.go          # 定价
│   ├── redemption.go       # 兑换码
│   ├── misc.go             # 杂项（验证码、状态等）
│   └── ...                 # 其他控制器
│
├── model/                  # GORM 数据模型
│   ├── user.go             # 用户表
│   ├── token.go            # Token 表
│   ├── log.go              # 日志表
│   ├── channel.go          # 渠道表
│   ├── redemption.go       # 兑换码表
│   ├── topup.go            # 充值记录表
│   ├── pricing.go          # 定价表
│   └── ...
│
├── middleware/             # 中间件
│   ├── auth.go             # 认证（Session Token + API Key 双轨）
│   ├── cors.go             # CORS 跨域
│   ├── rate-limit.go       # 速率限制
│   ├── cache.go            # 缓存
│   ├── distributor.go      # 渠道分发
│   ├── request-id.go       # 请求 ID
│   └── ...
│
├── relay/                  # 上游模型适配层（核心）
│   ├── channel/            # 各上游渠道适配器
│   │   ├── openai/         # OpenAI 适配（GPT Image 2 / DALL-E 3）
│   │   ├── gemini/         # Google Gemini 适配（Imagen 3）
│   │   ├── claude/         # Anthropic Claude 适配
│   │   ├── ali/            # 阿里通义适配
│   │   ├── baidu/          # 百度文心适配
│   │   └── ...             # 其他 30+ 渠道
│   ├── common/             # Relay 公共逻辑（计费、转发等）
│   ├── helper/             # Relay 辅助（价格计算、流处理等）
│   ├── image_handler.go    # 图片生成处理器
│   └── relay_adaptor.go    # 适配器选择
│
├── service/                # 业务服务层
│   ├── billing.go          # 计费服务
│   ├── image.go            # 图片服务
│   ├── epay.go             # 易支付（支付宝）
│   ├── quota.go            # 配额服务
│   ├── channel.go          # 渠道服务
│   └── ...
│
├── setting/                # 配置项
│   ├── operation_setting/  # 运营配置（支付、限流等）
│   ├── ratio_setting/      # 倍率配置（模型倍率、分组倍率）
│   ├── model_setting/      # 模型配置
│   └── ...
│
├── common/                 # 通用工具
│   ├── constants.go        # 常量
│   ├── database.go         # 数据库连接
│   ├── redis.go            # Redis 操作
│   ├── gin.go              # Gin 辅助
│   ├── utils.go            # 工具函数
│   └── ...
│
├── dto/                    # 数据传输对象
├── types/                  # 类型定义
├── i18n/                   # 国际化
├── logger/                 # 日志
├── oauth/                  # OAuth 第三方登录
└── web/                    # new-api 自带 React 管理后台源码
    ├── default/            # 默认主题
    └── classic/            # 经典主题
```

---

## 三、双套 API 体系

new-api 对外提供两套独立的 API：

### 3.1 管理接口（`/api/*`）

用于用户管理、Token 管理、充值、日志查询等。认证方式：**Session Token**（`Authorization: Bearer <token>`）。

| 功能 | 方法 | 路径 | 控制器 |
|------|------|------|--------|
| 登录 | POST | `/api/user/login` | `controller/user.go` |
| 注册 | POST | `/api/user/register` | `controller/user.go` |
| 用户信息 | GET | `/api/user/self` | `controller/user.go` |
| 充值码充值 | POST | `/api/user/topup` | `controller/topup.go` |
| 在线支付 | POST | `/api/user/pay` | `controller/topup.go` |
| 创建 Token | POST | `/api/token/` | `controller/token.go` |
| Token 列表 | GET | `/api/token/` | `controller/token.go` |
| 删除 Token | DELETE | `/api/token/:id` | `controller/token.go` |
| 使用日志 | GET | `/api/log/self` | `controller/log.go` |
| 充值记录 | GET | `/api/user/topup/self` | `controller/topup.go` |

### 3.2 Relay 接口（`/v1/*`）

OpenAI 兼容的模型调用接口。认证方式：**API Key**（`Authorization: Bearer sk-xxx`）。

| 功能 | 方法 | 路径 | 处理器 |
|------|------|------|--------|
| 生成图片 | POST | `/v1/images/generations` | `relay/image_handler.go` |
| 模型列表 | GET | `/v1/models` | `controller/model.go` |
| 对话补全 | POST | `/v1/chat/completions` | `relay/compatible_handler.go` |
| 文本嵌入 | POST | `/v1/embeddings` | `relay/embedding_handler.go` |

### 3.3 路由注册

路由在 `backend/new-api/router/main.go` 中注册，关键结构：

```go
// 伪代码示意
apiRouter := root.Group("/api")
relayRouter := root.Group("/v1")

// 管理接口 — Session Token 认证
apiRouter.POST("/user/login", controller.Login)
apiRouter.GET("/user/self", middleware.Auth(), controller.GetSelf)
apiRouter.POST("/token/", middleware.Auth(), controller.CreateToken)

// Relay 接口 — API Key 认证
relayRouter.POST("/images/generations", middleware.RelayAuth(), relay.ImageHandler)
relayRouter.GET("/models", middleware.RelayAuth(), controller.ListModels)
```

---

## 四、与 One API 的关键差异

本项目从 One API 迁移到 new-api，关键差异：

| 项目 | One API | new-api (QuantumNous) |
|------|---------|----------------------|
| 语言 | Go | Go + Gin + GORM |
| 管理接口路径 | `/api/v1/users/*` | `/api/user/*` |
| Relay 接口路径 | `/api/v1/images/*` | `/v1/images/*`（无 /api 前缀） |
| Token 接口 | `/api/v1/tokens` | `/api/token/`（单数） |
| 内置支付 | 无 | 易支付（epay）+ Stripe + Creem |
| 管理接口认证 | Bearer Token | Bearer Token + `New-Api-User` Header |
| 上游渠道数量 | 较少 | 30+（OpenAI/Gemini/Claude/Ali/Baidu 等） |
| 前端管理后台 | React | React（双主题：default + classic） |

---

## 五、quota 计费单位

new-api 内部使用整数 `quota` 计量，**500000 quota = 1 积分**。

```go
// backend/new-api/common/constants.go
const QuotaPerUnit = 500000
```

前端显示时统一换算：

```typescript
function formatBalance(q: number) {
  return (q / 500000).toFixed(1) + ' 积分'
}
```

计费流程：
1. 用户调用生图 API → `middleware/distributor.go` 选择渠道
2. `relay/helper/price.go` 计算本次调用的 quota 消耗
3. `service/quota.go` 扣减用户 quota
4. `model/log.go` 记录使用日志

---

## 六、内置支付（epay）

new-api 内置易支付（epay）网关，支持支付宝支付，无需独立支付微服务。

**关键文件**：
- `service/epay.go` — 易支付服务封装
- `controller/topup.go` — 支付订单创建与回调
- `setting/operation_setting/payment_setting.go` — 支付配置

**配置方式**：在 new-api 管理后台（`http://server:3000`）→ 系统设置 → 运营设置 → 支付设置中配置支付宝商户参数。

**前端调用**：`paymentApi.createPayOrder(amount)` → `/api/user/pay`

---

## 七、定制化开发指引

后端源码已 vendored 在 `backend/new-api/`，可随时修改。

### 7.1 修改后端代码

直接编辑 `backend/new-api/` 下的 Go 源码。常见定制场景：

| 场景 | 修改位置 |
|------|----------|
| 修改登录逻辑 | `controller/user.go` 的 `Login` 函数 |
| 修改生图参数校验 | `relay/image_handler.go` 或 `relay/channel/openai/relay_image.go` |
| 添加新的 API 端点 | `router/api-router.go` + `controller/` 新文件 |
| 修改计费规则 | `service/billing.go` 或 `relay/helper/price.go` |
| 修改用户表结构 | `model/user.go` |
| 添加新渠道适配器 | `relay/channel/<new_provider>/adaptor.go` |

### 7.2 重新构建镜像

修改源码后，重新构建 Docker 镜像：

```bash
cd infra
docker compose up -d --build new-api
```

构建过程（多阶段，约 5-10 分钟）：
1. **阶段 1（builder）**：用 `oven/bun:1` 构建 React 管理后台（`web/default`）
2. **阶段 2（builder-classic）**：构建经典主题（`web/classic`）
3. **阶段 3（builder2）**：用 `golang:1.26-alpine` 编译 Go 二进制
4. **阶段 4（运行时）**：基于 `debian:bookworm-slim` 运行

### 7.3 开发模式（热重载）

new-api 提供 `Dockerfile.dev` 和 `docker-compose.dev.yml` 用于开发：

```bash
cd backend/new-api
docker compose -f docker-compose.dev.yml up
```

### 7.4 版本与上游同步

当前 vendored 版本见 `backend/new-api/VERSION`。若需同步上游更新：

```bash
# 添加上游远程
cd backend/new-api
git init && git remote add origin https://github.com/QuantumNous/new-api.git
git fetch origin main
git merge origin/main  # 合并上游更新
# 解决冲突后，移除 .git
rm -rf .git
```

> **注意**：vendoring 后无法直接 `git pull` 上游更新，需手动同步（如上）。定制化修改可能与上游冲突。

---

## 八、new-api 管理后台

new-api 自带 React 管理后台（源码在 `backend/new-api/web/`），构建后嵌入 Go 二进制。

**访问方式**：`http://server-ip:3000`（或通过 Nginx 代理 `https://your-domain.com/api/`）

**默认账号**：`root` / `123456`（**首次登录后必须修改**）

**关键配置**：
1. **渠道管理** → 添加上游渠道（OpenAI/Google 等）+ 配置 API Key + 添加模型（gpt-image-1/dall-e-3/imagen-3）
2. **令牌管理** → 创建测试令牌，验证生图功能
3. **系统设置** → 运营设置 → CORS（允许前端域名）+ 支付设置（支付宝商户参数）
4. **用户管理** → 查看用户、调整 quota
