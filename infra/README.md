# ImageRelay 部署指南

## 环境要求
- Docker ≥ 20.10
- Docker Compose ≥ 2.0
- 云服务器（推荐新加坡/日本，2核2G+）

## 快速启动

```bash
cd infra

# 1. 申请 SSL 证书目录
mkdir -p ssl

# 2. 编辑 .env 文件（One API 数据持久化）
cp ../.env.example .env

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

## 服务地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost （或你的域名） |
| One API 管理后台 | http://localhost:3000 |

## One API 初始化

1. 首次访问 `http://localhost:3000`，使用以下账号登录：
   - 用户名：`root`
   - 密码：`123456`

2. **立即修改默认密码！**

3. 在「渠道管理」中添加 OpenAI API Key：
   - 类型：OpenAI
   - API Key：你的 OpenAI API Key
   - 模型：`dall-e-3`、`gpt-image-2`

4. 在「渠道管理」中添加 Google AI API Key（可选）：
   - 类型：Google
   - API Key：你的 Google AI API Key
   - 模型：`imagen-3`、`imagen-4`

## SSL 证书申请

```bash
# 使用 Let's Encrypt
certbot --nginx -d your-domain.com
```

将生成的 `fullchain.pem` 和 `key.pem` 复制到 `infra/ssl/` 目录。

## 目录结构

```
infra/
├── docker-compose.yml   # 服务编排
├── nginx.conf           # Nginx 配置
├── ssl/                 # SSL 证书（需自行申请）
├── one-api-data/        # One API 数据持久化（自动创建）
└── README.md            # 本文件
```

## 常用命令

```bash
# 重启服务
docker-compose restart

# 更新 One API
docker-compose pull one-api && docker-compose up -d

# 查看 One API 日志
docker-compose logs -f one-api

# 查看 Nginx 日志
docker-compose logs -f nginx
```

## 前端开发

```bash
cd frontend
npm install
npm run dev      # 开发模式（端口 5173）
npm run build     # 生产构建（输出到 dist/）
```

## 常见问题

**Q: 页面显示 502？**  
A: 检查 One API 是否正常启动：`docker-compose ps`

**Q: 生成图片失败？**  
A: 在 One API 管理后台确认渠道 API Key 有效、余额充足。

**Q: 上传文件报错？**  
A: 检查 Nginx 配置中 `client_max_body_size` 是否足够大。