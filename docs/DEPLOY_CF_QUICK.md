# 🚀 Cloudflare Pages 快速部署指南

## 1分钟部署清单

### ✅ 你的应用已经准备好了！

当前代码已经完美支持 Cloudflare Pages 部署，跨域问题已通过 Next.js API Routes 解决。

---

## 📋 部署步骤

### 步骤 1: 推送代码到 GitHub

```bash
git add .
git commit -m "Deploy to Cloudflare Pages"
git push origin main
```

### 步骤 2: 创建 Cloudflare Pages 项目

1. 访问 https://dash.cloudflare.com
2. 点击左侧 **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 GitHub 并选择你的仓库

### 步骤 3: 配置构建设置

```yaml
Project name: bus-comming (或你喜欢的名字)
Production branch: main
Framework preset: Next.js (Server-side Rendering)

Build settings:
  Build command: npm run build
  Build output directory: .next
  Root directory: /
  
Environment variables:
  NODE_VERSION: 18
```

### 步骤 4: 部署

点击 **Save and Deploy**，等待 2-3 分钟。

---

## 🎯 关键配置

### ⚠️ 必须选择 SSR

**重要**: Framework preset 必须选择：
```
Next.js (Server-side Rendering)
```

**不要选择**: 
- ❌ Static Site
- ❌ Next.js (Static HTML Export)

**原因**: 我们使用了 API Routes，需要服务端渲染。

---

## ✅ 验证部署

### 测试 API

```bash
# 替换为你的域名
curl https://your-app.pages.dev/api/bus-arrival?code=67661
```

**预期结果**: 返回 JSON 数据，无错误

### 测试主页

访问: `https://your-app.pages.dev`

**检查**:
- [ ] 页面正常显示
- [ ] 默认站点加载
- [ ] 刷新按钮工作
- [ ] 无 CORS 错误

---

## 🔧 跨域问题已解决

### 当前方案: Next.js API Routes

```
浏览器 → /api/bus-arrival → Cloudflare Pages → 外部 API
         (同域请求)           (服务端代理)      (正常返回)
         ✅ 无 CORS 问题
```

### 为什么无需额外配置？

1. ✅ 已实现 API Routes (`/api/bus-arrival`)
2. ✅ 已配置 CORS headers
3. ✅ 已添加 Middleware
4. ✅ Cloudflare Pages 原生支持

**代码无需修改，直接部署即可！**

---

## 📊 性能优化（可选）

### 1. 自定义域名

在 Cloudflare Pages 项目设置中：
1. 点击 **Custom domains**
2. 添加你的域名
3. 自动配置 SSL

### 2. 环境变量

如需配置环境变量：
1. 进入项目 **Settings** → **Environment variables**
2. 添加：
```
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
```

---

## 🐛 常见问题

### Q: 部署后显示 404？

**检查**: Framework preset 是否选择了 "Next.js (SSR)"

**解决**: 
1. 进入 Settings → Builds & deployments
2. 修改 Framework preset
3. 重新部署

---

### Q: API 返回错误？

**检查**: 构建日志中是否有错误

**调试**:
```bash
# 查看 API 响应头
curl -I https://your-app.pages.dev/api/bus-arrival?code=67661
```

---

### Q: 速度慢？

**原因**: 首次冷启动需要时间

**优化**: 
- 已自动启用全球 CDN
- 第二次访问会很快
- 可考虑添加缓存

---

## 💡 提示

### 免费额度

Cloudflare Pages 免费版提供：
- ✅ 无限请求
- ✅ 无限带宽  
- ✅ 自动 SSL
- ✅ 全球 CDN

**你的应用完全免费！** 🎉

### 自动部署

每次 push 到 main 分支，自动触发部署。

### 预览部署

Pull Request 会自动创建预览环境。

---

## 📝 总结

### 你需要做的

1. 推送代码到 GitHub
2. 在 Cloudflare 创建 Pages 项目
3. 选择 Next.js (SSR)
4. 点击部署

### 你不需要做的

- ❌ 修改代码
- ❌ 配置 CORS
- ❌ 设置代理
- ❌ 额外配置

**一切都已准备就绪！** ✅

---

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [详细部署文档](CLOUDFLARE_DEPLOYMENT.md)

---

**准备好了？开始部署吧！** 🚀

