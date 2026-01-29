const { unstable_v2_createSession } = require('@anthropic-ai/claude-agent-sdk');
const config = require('./config');
const path = require('path');
require('dotenv').config();

// 全局 Session 实例 (单例模式)
let globalSession = null;

/**
 * 获取或创建 Session
 */
async function getSession() {
    if (globalSession) return globalSession;

    try {
        // 构造本地 claude CLI 的绝对路径
        const executablePath = path.resolve(process.cwd(), 'node_modules', '.bin', 'claude');

        console.log('Initializing Agent Session...');
        console.log('Executable:', executablePath);

        globalSession = unstable_v2_createSession({
            model: config.AGENT_CONFIG.model,
            pathToClaudeCodeExecutable: executablePath,
            // 关键：将当前环境变量（包含 API Key 和 Base URL）传递给 CLI 进程
            env: {
                ...process.env,
                ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
                ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
            },
            includePartialMessages: true // 尝试开启流式增量
        });

        return globalSession;

    } catch (error) {
        console.error('Failed to create session:', error);
        throw error;
    }
}

/**
 * 处理一次性消息 (兼容老接口)
 */
exports.processMessage = async (userMessage) => {
    let fullText = '';
    await exports.processStreamMessage(userMessage, (chunk) => {
        fullText += chunk;
    });
    return { reply: fullText };
};

/**
 * 处理流式消息
 */
exports.processStreamMessage = async (userMessage, onChunk) => {
    try {
        const session = await getSession();

        // 1. 发送消息
        await session.send(userMessage);

        const stream = session.stream();

        // 追踪当前消息 ID 和已发送长度，用于计算 Delta
        let currentMessageId = null;
        let lastLength = 0;

        for await (const message of stream) {
            // 适配 SDK 实际结构: message.message 是核心对象
            const innerMessage = message.message || message;

            if (message.type === 'assistant' || message.type === 'assistant_message') {

                // 检查是否是同一条消息
                if (innerMessage.uuid && innerMessage.uuid !== currentMessageId) {
                    currentMessageId = innerMessage.uuid;
                    lastLength = 0; // 重置
                }

                if (innerMessage.content && Array.isArray(innerMessage.content)) {
                    const fullText = innerMessage.content
                        .filter(c => c.type === 'text')
                        .map(c => c.text)
                        .join('');

                    if (fullText) {
                        // 计算增量
                        const delta = fullText.slice(lastLength);
                        if (delta) {
                            onChunk(delta);
                            lastLength = fullText.length;
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error('Agent Stream Error:', error);
        throw error;
    }
};
