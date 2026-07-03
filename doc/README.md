# ImageRelay Code Wiki

> 结构化代码知识库 — 覆盖架构、模块、关键类与函数、依赖关系、运行方式

---

## 项目概述

**ImageRelay** 是一个基于 [new-api (QuantumNous)](https://github.com/QuantumNous/new-api) 作为后端底座的 AI 生图 SaaS 平台。前端使用 Vue 3 + TypeScript + TailwindCSS 构建，后端 new-api 源码已 vendor 到 `backend/new-api/`，统一管理 GPT Image 2、DALL-E 3、Imagen 3 等多种图片模型，对外提供 OpenAI 兼容 API。

**核心能力**：文生图 / 图生图 / 提示词画廊 / 支付宝支付 / 多模型切换 / API 接入

---

## 文档索引

| 文档 | 内容 | 适合读者 |
|------|------|----------|
| [01-architecture.md](./01-architecture.md) | 项目整体架构、三层架构图、数据流、认证双轨、API 路径映射、Nginx 路由 | 所有开发者（先读这篇） |
| [02-frontend.md](./02-frontend.md) | 前端详解：入口、目录结构、构建配置、设计系统、9 个 View、8 个组件 | 前端开发者 |
| [03-modules.md](./03-modules.md) | 模块详解：api/、stores/、router/、utils/、data/ 的职责与代码结构 | 前端开发者 |
| [04-key-functions.md](./04-key-functions.md) | 关键类与函数说明：API 方法表、Store action 签名、拦截器逻辑、Toast API | 前端开发者 |
| [05-backend.md](./05-backend.md) | 后端 new-api 说明：技术栈、双套 API、关键端点、与 One API 差异、quota 换算 | 后端/运维 |
| [06-infra-and-running.md](./06-infra-and-running.md) | 基础设施 + 运行方式：Docker Compose、Nginx、SSL、本地开发、生产部署、故障排查 | 运维/所有开发者 |

---

## 快速导航

### 我想了解项目整体
→ 从 [01-architecture.md](./01-architecture.md) 开始

### 我想开发前端页面
→ 读 [02-frontend.md](./02-frontend.md) 了解 View/Component 结构，再查 [03-modules.md](./03-modules.md) 了解 API 调用方式

### 我想调用后端 API
→ 查 [05-backend.md](./05-backend.md) 的端点表，参考 [04-key-functions.md](./04-key-functions.md) 的 API 方法签名

### 我想本地运行项目
→ 直接看 [06-infra-and-running.md](./06-infra-and-running.md) 的"本地开发"章节

### 我想定制后端逻辑
→ 后端源码在 `backend/new-api/`，参考 [05-backend.md](./05-backend.md) 了解架构，修改后用 `docker compose up -d --build new-api` 重新构建

---

## 技术栈速览

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite 5 + TypeScript |
| 样式 | TailwindCSS 3.4（#3B82F6 浅蓝科技主题） |
| 状态管理 | Pinia（auth store，双 Token 认证） |
| HTTP 客户端 | Axios |
| 后端网关 | new-api (QuantumNous) — 源码 vendored 在 `backend/new-api/`，Go + Gin + GORM |
| 数据库 | MySQL 8.0（生产）/ SQLite（开发） |
| 缓存 | Redis 7 |
| Web 服务器 | Nginx（反向代理 + SPA 静态托管） |
| 容器化 | Docker + Docker Compose |

---

## 相关文档

- 根目录 [README.md](../README.md) — 项目总览与部署指南
- 根目录 [DESIGN.md](../DESIGN.md) — 实用设计文档 v2.0（开发权威参考）
- [docs/](../docs/) — 历史设计文档（DESIGN_PLAN.md / REVIEW_REPORTS.md / design-preview.html）
