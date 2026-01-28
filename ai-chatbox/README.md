# AI Chatbox (Based on Claude Agent SDK)

这是一个生产级的 AI 问答助手系统，基于 Anthropic 最新的 **Claude Agent SDK** 构建。它提供了现代化的流式对话界面，支持上下文保持和智能问答。

## ✨ 特性

- **现代化 UI**: 优雅的紫色渐变设计，响应式布局。
- **Agent 驱动**: 使用官方 SDK (`@anthropic-ai/claude-agent-sdk`) 进行智能编排。
- **流式响应**: 类似 ChatGPT 的打字机效果。
- **安全架构**: 前后端分离，API Key 仅存放于后端。

## 🚀 快速开始

### 1. 填写配置

本项目支持官方 API 和第三方代理服务。复制 `.env` 文件并填入相应配置：

```bash
# 编辑 .env 文件

# 方式一：使用官方 API
ANTHROPIC_API_KEY=sk-ant-api03-...

# 方式二：使用第三方代理 (示例)
ANTHROPIC_API_KEY=your_proxy_key
ANTHROPIC_BASE_URL=https://your-proxy-domain.com
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务

```bash
# 开发模式 (支持热重载)
npm run dev

# 或生产模式
npm start
```
## ❓ 常见问题排查

### 1. 遇到 "403 Forbidden" 或 "Cloudflare Blocked"

如果在控制台看到类似的错误：
```json
{"message": "403 <!DOCTYPE html>...Cloudflare..."}
```

**可能原因**：
- 您的 IP 地址被目标 API 服务商（aicoding.sh）的防火墙拦截。
- 您开启了 VPN，且节点 IP 信誉较低或被列入黑名单。
- 请求头缺少必要的浏览器指纹（User-Agent 等）。

**解决方案**：
1.  **关闭 VPN**: 尝试断开 VPN连接，直接使用本地网络（如果网络环境允许）。
2.  **更换节点**: 如果必须使用 VPN，尝试切换到其他国家或地区的节点（如美国、新加坡）。
3.  **添加请求头**: 在 `src/agent/index.js` 中手动添加 `User-Agent` 等请求头（见代码修改）。

### 2. 连接超时
请检查网络连接，或确认 API Base URL 是否正确。

访问浏览器: http://localhost:3000

## 🛠️ 项目结构

```
ai-chatbox/
├── src/
│   ├── agent/       # Agent 核心逻辑
│   └── server/      # Express 后端服务
├── public/          # 前端静态资源
├── .env             # 配置文件
└── package.json
```

## ⚠️ 注意事项

- 请确保您的 API Key 有效且有足够的额度。
- 本项目默认使用 `claude-3-5-sonnet-20241022` 模型。
