const app = require('./src/server/app');
const config = require('./src/agent/config');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 AI 问答助手服务器已启动！`);
    console.log(`🔗 本地地址: http://localhost:${PORT}`);
    console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);

    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('⚠️  警告: 未检测到 ANTHROPIC_API_KEY，请检查 .env 文件');
    }
});
