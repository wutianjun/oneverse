const agentService = require('../agent');

/**
 * 处理普通聊天请求
 */
exports.handleChat = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: '请输入问题' });
        }

        const response = await agentService.processMessage(message);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * 处理流式聊天请求 (SSE)
 */
exports.handleStreamChat = async (req, res) => {
    try {
        const { message } = req.query;

        if (!message) {
            res.write('event: error\ndata: {"message": "请输入问题"}\n\n');
            return res.end();
        }

        // 设置各类 SSE 头部
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // 调用 Agent 的流式接口
        await agentService.processStreamMessage(message, (chunk) => {
            // 构造 SSE 数据格式
            // 注意: chunk 可能是字符串或对象，这里假设是增量文本
            const data = JSON.stringify({ delta: chunk });
            res.write(`event: message\ndata: ${data}\n\n`);
        });

        // 发送结束信号 (作为普通消息发送，以便前端 onmessage 捕获)
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Stream error:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
    }
};
