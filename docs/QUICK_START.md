# 🚀 快速开始 - 5分钟上手指南

## 第一步：启动项目

```bash
# 确保你在项目目录中
cd /Users/benson/Documents/learn/node/bus-comming

# 启动开发服务器
npm run dev
```

等待几秒钟，看到以下信息表示启动成功：
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
```

## 第二步：访问应用

打开浏览器访问：**http://localhost:3000**

你会看到一个空白页面，显示"还没有监听的公交站点"。

## 第三步：添加第一个站点

1. 点击 **"➕ 管理监听的站点和线路"** 按钮
2. 点击 **"添加新站点"**
3. 填写以下信息：

```
站点名称: 测试站点
站点代码: 67661
监听线路: 371
```

4. 点击 **"添加"** 按钮
5. 点击 **"← 返回主页"**

## 第四步：查看实时数据

现在你应该能看到：
- 🚌 公交线路卡片（371路）
- ⏰ 实时倒计时（多久到站）
- 🎯 当前一趟、下一趟、下下一趟
- 🔴/🟠/🔵 状态标识（即将到站/快到了/在路上）
- 📍 实时位置或预计时间标识

数据会每10秒自动刷新！

## 第五步：测试跨域配置（可选）

打开浏览器开发者工具（F12），切换到 Console 标签，运行：

```javascript
// 测试代理 API（应该成功）
fetch('/api/bus-arrival?code=67661')
  .then(r => r.json())
  .then(data => console.log('✅ 代理成功:', data))
  .catch(err => console.error('❌ 错误:', err))

// 测试直接调用（会失败，这是预期的）
fetch('https://arrivelah2.busrouter.sg/?id=67661')
  .then(r => r.json())
  .then(data => console.log('意外成功:', data))
  .catch(err => console.error('❌ CORS 错误（符合预期）:', err.message))
```

**预期结果**:
- ✅ 第一个请求成功（通过代理）
- ❌ 第二个请求失败（CORS 错误）

这证明我们的跨域解决方案正常工作！

## 更多站点示例

你可以添加更多站点进行测试：

### 示例 1
```
站点名称: 另一个测试站
站点代码: 59009
监听线路: 36
```

### 示例 2（监听多条线路）
```
站点名称: 多线路站点
站点代码: 09022
监听线路: 7, 123, 174
```

## 常见问题

### Q: 看不到数据怎么办？

1. 检查网络连接
2. 打开浏览器开发者工具，查看 Console 是否有错误
3. 确认站点代码是否正确（应该是5位数字）
4. 确认线路号在该站点是否存在

### Q: 数据多久更新？

- 倒计时：每秒更新
- 实时数据：每10秒从 API 获取

### Q: 数据保存在哪里？

保存在浏览器的 LocalStorage 中，清除浏览器数据会丢失配置。

### Q: 可以在手机上使用吗？

可以！界面是响应式的，完美支持移动端。在同一网络下，手机访问电脑的 IP:3000 即可。

例如：`http://192.168.1.100:3000`

## 生产环境部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

或部署到 Vercel：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 项目文件说明

```
├── src/app/page.tsx              # 主页（显示公交信息）
├── src/app/manage/page.tsx       # 管理页（添加/编辑站点）
├── src/app/api/bus-arrival/      # API 代理（解决跨域）
├── src/utils/localStorage.ts     # 本地存储工具
├── src/utils/busApi.ts           # API 工具函数
└── docs/CORS_SOLUTION.md         # 跨域解决方案详解
```

## 下一步

- 📖 阅读 [README.md](./README.md) 了解完整功能
- 🔍 查看 [docs/CORS_SOLUTION.md](./docs/CORS_SOLUTION.md) 了解跨域处理
- 📚 阅读 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解技术细节

---

**享受你的公交到站提醒系统吧！** 🎉

