# 🚀 部署指南

## 验证构建

在部署之前，确保项目可以成功构建：

```bash
npm run build
```

如果看到类似以下输出，说明构建成功：

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (7/7)
```

## 本地生产环境测试

```bash
# 构建
npm run build

# 运行生产版本
npm start
```

访问 http://localhost:3000 测试生产版本。

## 部署到 Vercel（推荐）

### 方法 1: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 方法 2: 通过 Git 集成

1. 将代码推送到 GitHub：
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. 访问 [vercel.com](https://vercel.com)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 点击 "Deploy"

**配置说明**：
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**环境变量**：无需配置（全部使用前端存储）

## 部署到其他平台

### Netlify

1. 创建 `netlify.toml`：
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. 部署：
```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod
```

### Docker

1. 创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. 构建和运行：
```bash
# 构建镜像
docker build -t bus-comming .

# 运行容器
docker run -p 3000:3000 bus-comming
```

### 云服务器（VPS）

```bash
# 连接到服务器
ssh user@your-server.com

# 克隆代码
git clone your-repo-url
cd bus-comming

# 安装依赖
npm install

# 构建
npm run build

# 使用 PM2 运行
npm i -g pm2
pm2 start npm --name "bus-comming" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 环境变量（可选）

虽然当前项目不需要环境变量，但如果你想添加配置：

创建 `.env.production`：
```bash
# API 配置（如果需要）
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com

# 其他配置
NEXT_PUBLIC_APP_NAME=公交到站提醒
```

在 Vercel 中配置：
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加变量

## 性能优化

### 1. 启用 ISR（增量静态再生）

在 `src/app/page.tsx` 中添加：
```typescript
export const revalidate = 60; // 每60秒重新验证
```

### 2. 启用压缩

在 `next.config.ts` 中添加：
```typescript
compress: true,
```

### 3. 优化图片

如果添加了图片，使用 Next.js Image 组件：
```tsx
import Image from 'next/image';

<Image src="/bus-icon.png" width={50} height={50} alt="Bus" />
```

## CDN 配置

### Vercel（自动）
Vercel 自动配置全球 CDN，无需额外设置。

### Cloudflare
1. 添加站点到 Cloudflare
2. 配置 DNS 指向你的服务器
3. 启用 CDN 和缓存

## 监控和日志

### Vercel Analytics

在 `src/app/layout.tsx` 中添加：
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 自定义日志

在 API 路由中已经包含了基本日志：
```typescript
console.error('Error fetching bus arrival data:', error);
```

生产环境建议使用专业日志服务（如 Sentry）。

## 域名配置

### Vercel
1. 进入项目设置
2. 点击 "Domains"
3. 添加自定义域名
4. 配置 DNS 记录

### 自定义域名 DNS 配置

**A 记录**（指向 IP）：
```
Type: A
Name: @
Value: your-server-ip
```

**CNAME 记录**（指向 Vercel）：
```
Type: CNAME
Name: @
Value: your-project.vercel.app
```

## HTTPS/SSL

### Vercel
自动配置 Let's Encrypt SSL 证书。

### 自托管
使用 Certbot：
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 健康检查

添加健康检查端点 `src/app/api/health/route.ts`：

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
```

测试：
```bash
curl https://your-domain.com/api/health
```

## 部署检查清单

- [ ] 代码构建成功
- [ ] 所有测试通过
- [ ] API 代理工作正常
- [ ] CORS 配置正确
- [ ] 环境变量配置（如果需要）
- [ ] 域名 DNS 配置
- [ ] SSL 证书配置
- [ ] 性能优化
- [ ] 监控和日志配置
- [ ] 备份和恢复计划

## 故障排查

### 问题：API 调用失败

检查：
1. 网络连接
2. API 路由是否正确部署
3. CORS 配置是否生效
4. 外部 API 是否可访问

### 问题：页面空白

检查：
1. 浏览器控制台错误
2. LocalStorage 是否可用
3. JavaScript 是否启用

### 问题：数据不更新

检查：
1. 网络请求是否成功（开发者工具 Network 标签）
2. API 响应是否正常
3. 定时器是否运行

## 回滚

### Vercel
在部署历史中点击 "Promote to Production"

### 自托管
```bash
git checkout previous-commit
npm run build
pm2 restart bus-comming
```

## 联系支持

如有问题，检查：
1. [Next.js 文档](https://nextjs.org/docs)
2. [Vercel 文档](https://vercel.com/docs)
3. 项目 GitHub Issues

---

**祝部署顺利！** 🚀

