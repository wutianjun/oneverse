# AI 问答助手 - 技术实施方案 (Tech Spec)

**版本**: 1.0
**日期**: 2026-01-28
**基于**: PRD v1.0

---

## 一、 系统架构设计

### 1.1 整体架构

系统采用经典的前后端分离架构 (B/S)，后端作为核心，集成 Claude Agent SDK 处理智能对话逻辑。

```mermaid
graph TD
    User[用户终端]
    Frontend[前端 SPA (HTML/JS)]
    Backend[后端 API 服务 (Node.js/Express)]
    AgentRuntime[Claude Agent Runtime]
    ClaudeAPI[Anthropic API]

    User <-->|HTTP/REST| Frontend
    Frontend <-->|REST API / SSE| Backend
    Backend <-->|Agent SDK Interface| AgentRuntime
    AgentRuntime <-->|RPC/HTTPS| ClaudeAPI
```

### 1.2 技术栈选型

| 模块 | 技术 | 版本要求 | 说明 |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | >= v20.0.0 | 确保支持最新的 ES 特性和 SDK 需求 |
| **Web Framework** | Express | ^4.18.0 | 轻量级、成熟的 Web 服务框架 |
| **AI SDK** | @anthropic-ai/claude-agent-sdk | Latest | **核心组件**：提供 Agent 编排、工具调用管理 |
| **Frontend** | Vanilla JS + CSS | - | 保持轻量，无需构建工具链 |
| **Streaming** | Server-Sent Events (SSE) | - | 实现打字机效果的流式响应 |

---

## 二、 核心模块设计

### 2.1 目录结构

```
ai-chatbox/
├── src/
│   ├── agent/              # Agent 核心逻辑
│   │   ├── config.js       # Agent 配置 (System prompt, tools)
│   │   └── index.js        # Agent 实例封装
│   ├── server/
│   │   ├── app.js          # Express App 配置
│   │   ├── routes.js       # 路由定义
│   │   └── controller.js   # 业务逻辑控制器
│   └── utils/
│       └── logger.js       # 日志工具
├── public/                 # 前端静态资源
│   ├── index.html          # 主页面
│   ├── styles.css          # 样式表
│   └── script.js           # 前端逻辑
├── package.json
└── .env                    # 环境变量 (API Keys)
```

### 2.2 API 接口设计

#### 2.2.1 提交问题 (普通模式)
- **Endpoint**: `POST /api/chat`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "message": "帮我写一个 Python 冒泡排序"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "好的，这是 Python 冒泡排序的代码...",
    "usage": { "input_tokens": 50, "output_tokens": 150 }
  }
  ```

#### 2.2.2 提交问题 (流式模式 - 推荐)
- **Endpoint**: `GET /api/chat/stream`
- **Query Params**: `?message=encoded_message`
- **Protocol**: Server-Sent Events (SSE)
- **Event format**:
  - `event: message` -> `data: { "delta": "好的" }`
  - `event: end` -> `data: [DONE]`

### 2.3 Agent SDK 集成方案

根据 Anthropic Agent SDK 的最佳实践，我们将创建一个持久化的 Agent 实例（或按请求创建轻量级实例），并配置核心工具。

**核心代码逻辑 (伪代码/通过 SDK 实现):**

```javascript
// src/agent/index.js
import { Agent } from '@anthropic-ai/claude-agent-sdk';

export async function createAgent() {
  const agent = new Agent({
    name: "AI-Assistant",
    model: "claude-3-5-sonnet-20241022",
    tools: [
       // 在此扩展自定义工具，如 web_search, file_read 等
    ],
    systemPrompt: "你是一个乐于助人的专业 AI 助手..."
  });
  return agent;
}

export async function processMessage(userMessage) {
  const agent = await createAgent();
  const response = await agent.run({
    input: userMessage,
    stream: true // 开启流式支持
  });
  return response;
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
