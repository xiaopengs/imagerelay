# Backend — new-api Vendored 源码

本目录存放 [QuantumNous/new-api](https://github.com/QuantumNous/new-api) 的 Go 源码，已 vendored（实际拷贝，非 submodule）到本仓库，支持随时定制化开发。

## 来源

- **上游仓库**：https://github.com/QuantumNous/new-api
- **Go 模块路径**：`github.com/QuantumNous/new-api`
- **Go 版本**：1.25.1+
- **克隆方式**：`git clone --depth 1`（浅克隆，未含完整历史）

## 目录结构

详见 [../doc/05-backend.md](../doc/05-backend.md) 的"源码结构"章节。关键目录：

| 目录 | 职责 |
|------|------|
| `new-api/main.go` | Go 入口 |
| `new-api/router/` | Gin 路由（api-router / relay-router） |
| `new-api/controller/` | API 控制器（user / token / image / topup 等） |
| `new-api/model/` | GORM 数据模型 |
| `new-api/middleware/` | 中间件（auth / cors / rate-limit） |
| `new-api/relay/` | 上游模型适配层（openai / gemini / claude 等 30+ 渠道） |
| `new-api/service/` | 业务服务（billing / image / epay） |
| `new-api/Dockerfile` | 多阶段构建文件 |

## 定制化开发

### 修改源码

直接编辑 `new-api/` 下的 Go 文件。常见定制场景见 [../doc/05-backend.md](../doc/05-backend.md) 的"定制化开发指引"章节。

### 重新构建镜像

```bash
cd infra
docker compose up -d --build new-api
```

构建过程（约 5-10 分钟）：
1. bun 构建 React 管理后台（web/default + web/classic）
2. golang 编译 Go 二进制
3. 打包到 debian:bookworm-slim 运行时镜像

### 回退到官方镜像

若无需定制，可改用官方预构建镜像（更快，但无法改后端逻辑）：

编辑 `infra/docker-compose.yml`，注释 `build:` 段，取消注释 `image:` 行：

```yaml
new-api:
  # build:
  #   context: ../backend/new-api
  #   dockerfile: Dockerfile
  image: calciumion/new-api:latest
```

## 同步上游更新

vendoring 后无法直接 `git pull`。若需同步上游更新：

```bash
cd backend/new-api
git init
git remote add origin https://github.com/QuantumNous/new-api.git
git fetch origin main
git merge origin/main
# 解决冲突后
rm -rf .git
```

> 注意：定制化修改可能与上游冲突，合并时需仔细处理。

## 构建产物忽略

以下构建产物已在根 `.gitignore` 中忽略，不会提交：

- `new-api/new-api`（编译二进制）
- `new-api/data/`（运行数据）
- `new-api/*.db`（SQLite 文件）
- `new-api/web/default/dist/`、`new-api/web/classic/dist/`（前端构建产物）

new-api 自身的 `.gitignore` 也会忽略 `node_modules/`、`build/`、`logs/` 等。
