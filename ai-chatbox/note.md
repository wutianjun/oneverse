# 项目构建与变更笔记 (Project Change Log)

本文记录了 AI 问答助手项目在构建过程中的关键技术决策、变更历程及其背后的原因。

## 1. 初始规划 (Phase 1)
- **目标**: 基于 Claude Agent SDK 构建 Web 问答系统。
- **技术栈**: Node.js + Express + `@anthropic-ai/claude-agent-sdk`。
- **进展**: 完成了基础项目结构搭建。

## 2. 第一次架构调整：转向 Client SDK (Phase 2-3)
- **变更内容**: 放弃使用 Claude Agent SDK，改用官方通用的 `@anthropic-ai/sdk` (Client SDK)。
- **原因**:
    1.  **第三方 API 适配问题**: 早期调试发现 Agent SDK 强依赖本地 CLI 环境，且未能成功配置第三方 Base URL（用于绕过 Cloudflare）。
    2.  **稳定性考量**: 认为 Client SDK 作为纯 API 客户端，在生产环境中更可控，也更容易配置代理。
- **结果**: 成功跑通了基于 Client SDK 的问答流程，实现了流式响应和第三方 API 的完美调用。

## 3. 第二次架构调整：回退至 Agent SDK (Phase 4 - Current)
- **变更内容**: **重新回退** 到 `@anthropic-ai/claude-agent-sdk`，并配合本地 `claude` CLI 工具。
- **原因**: 
    1.  **高级功能需求**: 用户明确需要未来支持 **MCP (Model Context Protocol)**、**Skill 调用** 和 **Command快捷指令**。这些是 Agent SDK 的核心强项，如果用 Client SDK 重写成本过高。
    2.  **网络方案突破**: 经确认，Agent SDK 底层调用的 `claude` CLI 可以通过环境变量 (`ANTHROPIC_BASE_URL`, `ANTHROPIC_API_KEY`) 正确透传代理配置，从而解决了之前的连接痛点。
- **实施细节**:
    - 全局安装 `claude` CLI 遇到权限问题，改为**本地安装** (`npm install @anthropic-ai/claude-code`)。
    - 代码中通过 `path.resolve` 动态定位 CLI 可执行文件路径。
    - 在创建 `SDKSession` 时，显式注入 `process.env` 以确保 CLI 继承环境变量。
    - 开启 `includePartialMessages: true` 并重写流式处理逻辑，以支持实时打字机效果。

## 4. 最终状态
目前项目运行稳健，既保留了 Agent SDK 的强大扩展能力（为未来集成 MCP 铺平道路），又完美适配了第三方 API 环境。