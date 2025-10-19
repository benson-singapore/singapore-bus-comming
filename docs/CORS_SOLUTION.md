# 跨域问题解决方案

## 问题说明

当前端直接调用 `https://arrivelah2.busrouter.sg/?id=67661` 时，会遇到 CORS（跨域资源共享）错误，因为浏览器的同源策略阻止了跨域请求。

## 解决方案

本项目采用了**服务端代理**的方式来解决跨域问题，具体实现了三层防护：

### 1. API 路由代理（主要解决方案）

**文件**: `src/app/api/bus-arrival/route.ts`

前端不直接调用外部 API，而是调用我们自己的 API 路由：

```typescript
// 前端调用
fetch('/api/bus-arrival?code=67661')  // 同域请求，不会有 CORS 问题

// 服务端代理
// Next.js 服务器再去调用外部 API
fetch('https://arrivelah2.busrouter.sg/?id=67661')
```

**优势**：
- ✅ 完全避免浏览器 CORS 限制（服务端请求不受 CORS 限制）
- ✅ 可以添加自定义 headers（如 User-Agent）
- ✅ 统一错误处理
- ✅ 可以添加缓存、限流等中间层逻辑

### 2. CORS Headers 配置

**文件**: `next.config.ts`

在 Next.js 配置中添加 CORS 响应头：

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST,PUT,DELETE' },
        { key: 'Access-Control-Allow-Headers', value: '...' },
      ],
    },
  ];
}
```

**作用**：
- 允许其他域名访问我们的 API（如果需要的话）
- 处理浏览器的预检请求（OPTIONS）

### 3. Middleware 中间件

**文件**: `src/middleware.ts`

在请求处理流程中添加 CORS headers：

```typescript
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}
```

**作用**：
- 在所有 API 响应中统一添加 CORS headers
- 处理 OPTIONS 预检请求

## 数据流程图

```
┌─────────────┐         ┌──────────────────┐         ┌────────────────────┐
│   浏览器     │         │  Next.js 服务器   │         │  外部 API          │
│  (前端)      │         │  (同域代理)       │         │  arrivelah2.sg     │
└─────────────┘         └──────────────────┘         └────────────────────┘
      │                         │                            │
      │  GET /api/bus-arrival   │                            │
      │  ?code=67661            │                            │
      │────────────────────────>│                            │
      │                         │                            │
      │                         │  GET /?id=67661            │
      │                         │  (服务端请求，无CORS限制)    │
      │                         │───────────────────────────>│
      │                         │                            │
      │                         │  JSON Response             │
      │                         │<───────────────────────────│
      │                         │                            │
      │  JSON Response          │                            │
      │  (带 CORS headers)      │                            │
      │<────────────────────────│                            │
      │                         │                            │
```

## 前端调用方式

### ❌ 错误方式（会遇到 CORS 错误）

```typescript
// 直接调用外部 API
fetch('https://arrivelah2.busrouter.sg/?id=67661')
// ❌ CORS Error: No 'Access-Control-Allow-Origin' header
```

### ✅ 正确方式（使用代理）

```typescript
// 调用本地 API 路由
fetch('/api/bus-arrival?code=67661')
// ✅ 成功！服务端代理处理了跨域问题
```

## 代码示例

在 `src/utils/busApi.ts` 中：

```typescript
export async function fetchBusArrivals(stopCode: string) {
  // 调用本地 API，不会有 CORS 问题
  const response = await fetch(`/api/bus-arrival?code=${stopCode}`);
  return await response.json();
}
```

## 额外特性

### 1. OPTIONS 请求处理

API 路由支持 OPTIONS 方法，用于处理浏览器的预检请求：

```typescript
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
```

### 2. 自定义 User-Agent

在代理请求中添加了 User-Agent，避免被目标服务器识别为爬虫：

```typescript
headers: {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; BusArrivalApp/1.0)',
}
```

### 3. 缓存控制

设置 `cache: 'no-store'` 确保每次都获取最新数据：

```typescript
cache: 'no-store',
```

## 测试跨域配置

### 测试 1: 检查 CORS Headers

```bash
curl -I http://localhost:3000/api/bus-arrival?code=67661
```

应该看到响应头包含：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

### 测试 2: 测试 OPTIONS 请求

```bash
curl -X OPTIONS http://localhost:3000/api/bus-arrival
```

应该返回 200 状态码并包含 CORS headers。

### 测试 3: 在浏览器中测试

打开浏览器控制台：

```javascript
fetch('/api/bus-arrival?code=67661')
  .then(r => r.json())
  .then(data => console.log(data))
```

应该成功返回公交数据，无 CORS 错误。

## 常见问题

### Q: 为什么不在前端直接处理 CORS？

A: CORS 是浏览器的安全机制，前端无法绕过。必须由服务器端设置响应头，或者使用服务端代理。

### Q: 生产环境也能工作吗？

A: 是的！Next.js 的 API Routes 在生产环境中以无服务器函数（Serverless Functions）的形式运行，同样支持服务端代理。

### Q: 会影响性能吗？

A: 影响很小。虽然多了一层代理，但 Next.js API Routes 性能优秀，而且我们设置了适当的缓存策略。

### Q: 可以限流或添加认证吗？

A: 可以！在 API 路由中可以添加任何自定义逻辑：

```typescript
// 限流
if (tooManyRequests) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}

// 认证
const token = request.headers.get('Authorization');
if (!isValidToken(token)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 总结

通过 **Next.js API Routes 代理**，我们完美解决了跨域问题：

1. ✅ 前端调用同域 API，无 CORS 问题
2. ✅ 服务端代理外部 API，绕过浏览器限制
3. ✅ 统一错误处理和响应格式
4. ✅ 支持添加中间层逻辑（缓存、限流、认证等）
5. ✅ 生产环境和开发环境表现一致

这是处理跨域问题的最佳实践方案！

