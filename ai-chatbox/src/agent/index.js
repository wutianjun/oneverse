const Anthropic = require('@anthropic-ai/sdk');
const config = require('./config');
require('dotenv').config();

// 初始化 Anthropic Client
// SDK 会自动读取 ANTHROPIC_API_KEY，也可以显式传入
const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL, // 关键：支持第三方代理地址
    // 添加默认请求头以降低被拦截风险
    defaultHeaders: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

/**
 * 处理一次性消息
 */
exports.processMessage = async (userMessage) => {
    try {
        const response = await client.messages.create({
            model: config.AGENT_CONFIG.model,
            max_tokens: config.AGENT_CONFIG.max_tokens,
            temperature: config.AGENT_CONFIG.temperature,
            system: config.SYSTEM_PROMPT,
            messages: [
                { role: "user", content: userMessage }
            ]
        });

        return {
            reply: response.content[0].text,
            usage: response.usage
        };
    } catch (error) {
        console.error('Anthropic API error:', error);
        throw error;
    }
};

/**
 * 处理流式消息
 */
exports.processStreamMessage = async (userMessage, onChunk) => {
    try {
        const stream = await client.messages.create({
            model: config.AGENT_CONFIG.model,
            max_tokens: config.AGENT_CONFIG.max_tokens,
            temperature: config.AGENT_CONFIG.temperature,
            system: config.SYSTEM_PROMPT,
            messages: [
                { role: "user", content: userMessage }
            ],
            stream: true
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                onChunk(chunk.delta.text);
            }
        }

    } catch (error) {
        console.error('Anthropic stream error:', error);
        // 抛出错误以便上层处理 (SSE error event)
        throw error;
    }
};
