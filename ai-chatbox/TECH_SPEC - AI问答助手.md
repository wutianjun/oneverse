# AI 问答助手 - 技术实施方案 (Tech Spec)

**版本**: 1.0
**日期**: 2026-01-28
**基于**: PRD v1.0

---

## 一、 系统架构设计

### 1.1 整体架构

系统采用经典的前后端分离架构 (B/S)，后端集成 Claude Agent SDK，通过本地 CLI 进程与外部 API 通信。

```mermaid
graph TD
    User[用户终端]
    Frontend[前端 SPA (HTML/JS)]
    Backend[后端 API 服务 (Node.js/Express)]
    AgentSDK[Claude Agent SDK (Node.js)]
    CLI[Local Claude CLI (Seperate Process)]
    ExternalAPI[第三方/官方 AI API]

    User <-->|HTTP/REST / SSE| Frontend
    Frontend <-->|REST API / SSE| Backend
    Backend <-->|SDK Session| AgentSDK
    AgentSDK <-->|Spawn/Stdio| CLI
    CLI <-->|HTTPS (Custom BaseURL)| ExternalAPI
```

### 1.2 技术栈选型

| 模块 | 技术 | 版本要求 | 说明 |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | >= v20.0.0 | 运行环境 |
| **Web Framework** | Express | ^4.18.0 | Web 服务框架 |
| **AI SDK** | @anthropic-ai/claude-agent-sdk | Latest | **核心组件**: 提供 Agent 会话管理 |
| **CLI Tool** | @anthropic-ai/claude-code | Latest | **底层运行时**: 负责实际的 API 调用和工具执行 |
| **Frontend** | Vanilla JS + CSS | - | 轻量级前端 |

---

## 二、 核心模块设计

### 2.1 目录结构

(保持不变)

### 2.2 API 接口设计

(保持不变)

### 2.3 Agent SDK 集成方案

本系统使用 `unstable_v2_createSession` API 来创建与 Agent 的会话。关键在于利用 SDK 调用本地安装的 `claude` CLI，并通过环境变量注入配置。

**核心代码逻辑 (src/agent/index.js):**

```javascript
const { unstable_v2_createSession } = require('@anthropic-ai/claude-agent-sdk');
const path = require('path');

// 单例模式管理 Session
let globalSession = null;

async function getSession() {
    if (globalSession) return globalSession;

    // 1. 定位本地 CLI 可执行文件
    const executablePath = path.resolve(process.cwd(), 'node_modules', '.bin', 'claude');

    // 2. 创建会话，注入环境变量以支持第三方 API
    globalSession = unstable_v2_createSession({
        model: process.env.ANTHROPIC_MODEL,
        pathToClaudeCodeExecutable: executablePath,
        env: {
            // 透传当前进程的环境变量
            ...process.env, 
            // 显式指定 BaseURL，解决 Cloudflare 拦截问题
            ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL 
        },
        includePartialMessages: true // 开启流式增量支持
    });
    
    return globalSession;
}
```

---

## 三、 数据流与状态管理

1.  **前端请求**: 用户输入 ->通过 Fetch API 发送请求到 Express 后端。
2.  **后端处理**: Express Controller 接收请求 -> 验证参数 -> 调用 `AgentWrapper`。
3.  **Agent 执行**: Agent SDK 接收 Prompt -> 自动规划(Planning) -> 可能调用工具 (Tool Use) -> 生成最终回复。
4.  **响应返回**: 虽然 Agent SDK 处理了复杂的思考过程，后端只需将最终文本内容流式透传给前端。

---

## 四、 安全性与配置

1.  **API Key 保护**: 使用 `.env` 文件存储 `ANTHROPIC_API_KEY`，严禁提交到 git。后端使用 `dotenv` 库加载。
2.  **输入清洗**: 简单的后端长度限制和格式检查，防止恶意长文本攻击。
3.  **CORS**: 仅允许受信任的域名（开发环境允许 localhost）。

## 五、 开发与部署流程

1.  **本地开发**:
    - `npm install`
    - 配置 `.env`
    - `npm run dev` (使用 nodemon)
2.  **部署**:
    - 标准 Node.js 容器化部署或 PM2 托管。

---

## 六、 风险评估

| 风险点 | 应对措施 |
| :--- | :--- |
| **SDK 版本变动** | 锁定 `package.json` 中的具体版本号，关注官方 changelog |
| **API 超时** | Express 设置合理的 timeout (如 60s)，前端实现重试机制 |
| **Token 消耗过大** | 在 System Prompt 中限制回答长度，或在 SDK 配置 max_tokens |
