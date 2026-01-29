# AI Chatbox (Claude Agent SDK Edition)

这是一个基于 **Anthropic Claude Agent SDK** 构建的生产级 AI 问答助手系统。它不仅提供了现代化的 Web 对话界面，还通过集成 Claude 的 Agent 能力，为未来扩展 **MCP (Model Context Protocol)** 和自定义工具调用奠定了基础。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v25+-green.svg)
![SDK](https://img.shields.io/badge/SDK-Claude%20Agent-purple.svg)

## ✨ 核心特性

- **🚀 Agent 驱动**: 底层基于 `@anthropic-ai/claude-agent-sdk`，拥有完整的 Agent 循环和状态管理能力。
- **🔌 第三方 API 适配**: 完美支持自定义 OpenAI/Anthropic 兼容接口（如 `aicoding.sh`），支持自定义 Base URL。
- **💬 流式响应**: 实现类似官网的打字机流式输出体验。
- **🎨 现代化 UI**: 精美的紫色渐变主题，响应式设计，支持 Markdown 渲染。
- **🛠 可扩展架构**: 预留了 MCP Client 接口，未来可接入本地文件操作、网页搜索等高级 Skill。

## 🏗 技术架构

```mermaid
graph TD
    User[用户浏览器] <--> |WebSocket/HTTP| Server[Node.js Express Server]
    subgraph "Backend Core"
        Server <--> |SDK Session| Agent[Claude Agent SDK]
        Agent <--> |Spawn Process| CLI[Local Claude CLI]
    end
    CLI <--> |HTTPS (Custom BaseURL)| API[第三方 AI API]
```

## 🚀 快速开始

### 1. 环境准备
确保您的 Node.js 版本 >= 20。

### 2. 安装依赖
由于 Agent SDK 依赖底层的 `claude` 命令行工具，我们已将其配置为本地依赖，无需全局安装。

```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` (如有) 或直接创建 `.env` 文件：

```ini
# API 密钥
ANTHROPIC_API_KEY=your_api_key_here

# API 代理地址 (可选，用于国内访问或第三方服务)
ANTHROPIC_BASE_URL=https://your-custom-base-url.com

# 目标模型
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 4. 启动服务

```bash
# 启动开发服务器 (自动热加载)
npm run dev

# 浏览器访问
http://localhost:3000
```

## 📚 进阶开发

### 为什么使用 Agent SDK?
本项目选择 Agent SDK 而非普通的 Client SDK，是因为它内置了 **Agent Loop**。这意味着：
1.  它未来可以自动处理 **Tool Use** (工具调用)。
2.  它可以直接挂载 **MCP Server**，让 AI 具备操作数据库、文件系统等能力。
3.  它支持更复杂的**多轮对话状态管理**。

### 目录结构
- `src/agent/`: 封装 Agent SDK 的核心逻辑，包含 Session 管理和 CLI 桥接。
- `src/server/`: Express 服务器路由与控制器。
- `public/`: 前端静态资源。

## 📝 变更日志
查看 [note.md](./note.md) 了解本项目的架构演进历程。
