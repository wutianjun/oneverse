---
Project: ["3企业智能体"]
Status: 进行中
---

# 🚀 零基础也能搞定！手把手教你搭建AI问答助手

> **导语**：想拥有一个24小时在线的AI助手？不用懂高深技术，跟着这篇教程，30分钟你就能在电脑上跑起来！

![文章封面图：一个友好的AI机器人正在和用户对话的场景，背景是代码和网页界面]

---

## 一、先搞清楚：Claude Agent SDK 是什么？

想象一下，你有个超级聪明的助手叫Claude，它能写代码、回答问题、帮你处理各种任务。但你想让它**自动帮你干活**，而不是每次都要手动打开网页聊天。

这时候就需要 **Claude Agent SDK** 了！

### 通俗理解：

| 传统方式 | 用Agent SDK |
|---------|------------|
| 打开网页 → 打字提问 → 复制答案 | 写几行代码 → 自动获取答案 |
| 每次都要人工操作 | 程序自动运行，7×24小时待命 |
| 只能网页聊天 | 可以集成到任何应用里 |

**一句话总结**：Agent SDK 就是让你用代码"指挥"Claude干活的遥控器！

---

## 二、我们要做什么？实战项目预览

今天我们要搭建一个 **Web问答系统**：

![项目架构图：用户打开网页 → 输入问题 → 后端调用Claude Agent → 返回答案]

**效果预览**：
1. 打开浏览器，访问 `http://localhost:3000`
2. 在输入框里打字："帮我写个Python计算斐波那契数列的代码"
3. 点击发送，等待几秒钟
4. 页面上显示Claude给出的完整代码和解释

是不是很简单？接下来我们一步步实现！

---

## 三、准备工作：你需要这些

### ✅ 必备条件：

1. **一台电脑**（Windows/Mac/Linux都行）
2. **Node.js** 环境（我们会教你怎么装）
3. **Anthropic API Key**（免费注册就能拿）
4. **Claude Code CLI**（Anthropic官方工具）

### 📦 安装Node.js

打开终端（Windows按Win+R输入cmd，Mac打开"终端"App），输入：

```bash
# 检查是否已安装
node --version

# 如果没安装，去官网下载：https://nodejs.org
# 建议下载 LTS 版本（长期支持版）
```

### 🔑 获取API Key

1. 访问 [Anthropic官网](https://www.anthropic.com)
2. 注册账号（有免费额度！）
3. 进入控制台 → API Keys → 创建新Key
4. **复制保存好**，等会儿要用！

![API Key获取步骤示意图：注册 → 控制台 → API Keys → 创建]

### 🛠️ 安装Claude Code CLI

```bash
# 用npm安装（Node.js自带的包管理器）
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

---

## 四、开始实战：搭建Web问答系统

### 第一步：创建项目文件夹

```bash
# 创建项目目录
mkdir my-ai-assistant
cd my-ai-assistant

# 初始化项目
npm init -y
```

![项目文件夹结构图：my-ai-assistant文件夹包含server.js、public文件夹、package.json等]

### 第二步：安装必要的依赖

```bash
# 安装Express（Web服务器框架）
npm install express

# 安装CORS（处理跨域）
npm install cors

# 安装Anthropic SDK
npm install @anthropic-ai/sdk
```

### 第三步：创建后端服务器

新建文件 `server.js`，复制以下代码：

```javascript
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// 允许跨域请求
app.use(cors());
app.use(express.json());

// 提供静态文件（前端页面）
app.use(express.static('public'));

// API接口：处理问题
app.post('/api/ask', async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ error: '请输入问题' });
    }
    
    console.log('收到问题：', question);
    
    try {
        // 调用Claude Code CLI
        const command = `echo "${question.replace(/"/g, '\\"')}" | claude -p "请回答以下问题："`;
        
        exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('执行错误：', error);
                return res.status(500).json({ 
                    error: 'AI处理出错，请检查Claude Code CLI是否已安装并登录' 
                });
            }
            
            console.log('AI回答：', stdout);
            res.json({ 
                answer: stdout,
                timestamp: new Date().toLocaleString()
            });
        });
    } catch (err) {
        console.error('服务器错误：', err);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 AI助手服务器已启动！`);
    console.log(`📱 请打开浏览器访问：http://localhost:${PORT}`);
    console.log(`⚠️  确保已运行 claude auth login 登录`);
});
```

![代码结构图：server.js的主要组成部分，包括依赖引入、中间件配置、API路由、服务器启动]

### 第四步：创建前端页面

创建文件夹和文件：

```bash
mkdir public
touch public/index.html
```

编辑 `public/index.html`，复制以下代码：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的AI助手 🤖</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
                         'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        
        .chat-container {
            padding: 30px;
            min-height: 400px;
            max-height: 500px;
            overflow-y: auto;
        }
        
        .welcome-message {
            text-align: center;
            color: #666;
            padding: 40px 20px;
        }
        
        .welcome-message h2 {
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .message {
            margin-bottom: 20px;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .message.user {
            text-align: right;
        }
        
        .message.ai {
            text-align: left;
        }
        
        .message-bubble {
            display: inline-block;
            max-width: 70%;
            padding: 15px 20px;
            border-radius: 20px;
            word-wrap: break-word;
        }
        
        .message.user .message-bubble {
            background: #667eea;
            color: white;
            border-bottom-right-radius: 5px;
        }
        
        .message.ai .message-bubble {
            background: #f0f2f5;
            color: #333;
            border-bottom-left-radius: 5px;
        }
        
        .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .input-area {
            padding: 20px 30px;
            border-top: 1px solid #eee;
            background: #fafafa;
        }
        
        .input-wrapper {
            display: flex;
            gap: 10px;
        }
        
        #questionInput {
            flex: 1;
            padding: 15px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 30px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }
        
        #questionInput:focus {
            border-color: #667eea;
        }
        
        #sendBtn {
            padding: 15px 30px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 30px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        #sendBtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        
        #sendBtn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #667eea;
        }
        
        .loading.show {
            display: block;
        }
        
        .spinner {
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
        }
        
        .example-questions {
            padding: 20px 30px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
        }
        
        .example-questions h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .example-btn {
            display: inline-block;
            padding: 8px 15px;
            margin: 5px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .example-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 我的AI助手</h1>
            <p>基于Claude Agent SDK搭建的智能问答系统</p>
        </div>
        
        <div class="chat-container" id="chatContainer">
            <div class="welcome-message">
                <h2>👋 你好！我是你的AI助手</h2>
                <p>在下方输入你的问题，我会尽力为你解答<br>
                可以问我编程、写作、学习、生活等各种问题</p>
            </div>
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>AI正在思考中，请稍候...</p>
        </div>
        
        <div class="example-questions">
            <h3>💡 试试这些问题：</h3>
            <button class="example-btn" onclick="setQuestion('用Python写个计算器程序')">用Python写个计算器</button>
            <button class="example-btn" onclick="setQuestion('解释一下什么是API')">什么是API</button>
            <button class="example-btn" onclick="setQuestion('给我讲个程序员笑话')">程序员笑话</button>
            <button class="example-btn" onclick="setQuestion('如何学习JavaScript？')">如何学JavaScript</button>
        </div>
        
        <div class="input-area">
            <div class="input-wrapper">
                <input 
                    type="text" 
                    id="questionInput" 
                    placeholder="输入你的问题，按回车发送..."
                    onkeypress="handleKeyPress(event)"
                >
                <button id="sendBtn" onclick="sendQuestion()">发送</button>
            </div>
        </div>
    </div>

    <script>
        const chatContainer = document.getElementById('chatContainer');
        const questionInput = document.getElementById('questionInput');
        const sendBtn = document.getElementById('sendBtn');
        const loading = document.getElementById('loading');
        
        // 设置示例问题
        function setQuestion(text) {
            questionInput.value = text;
            questionInput.focus();
        }
        
        // 处理回车键
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendQuestion();
            }
        }
        
        // 发送问题
        async function sendQuestion() {
            const question = questionInput.value.trim();
            
            if (!question) {
                alert('请输入问题！');
                return;
            }
            
            // 添加用户消息到聊天区
            addMessage('user', question);
            
            // 清空输入框并禁用按钮
            questionInput.value = '';
            sendBtn.disabled = true;
            loading.classList.add('show');
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    addMessage('ai', '❌ ' + data.error, true);
                } else {
                    addMessage('ai', data.answer);
                }
            } catch (error) {
                addMessage('ai', '❌ 网络错误，请检查服务器是否运行', true);
            } finally {
                sendBtn.disabled = false;
                loading.classList.remove('show');
                questionInput.focus();
            }
        }
        
        // 添加消息到聊天区
        function addMessage(type, content, isError = false) {
            // 如果是第一条消息，清空欢迎语
            if (chatContainer.querySelector('.welcome-message')) {
                chatContainer.innerHTML = '';
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            
            const time = new Date().toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.innerHTML = `
                <div class="message-bubble" style="${isError ? 'background: #ffebee; color: #c62828;' : ''}">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                <div class="message-time">${time}</div>
            `;
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    </script>
</body>
</html>
```

![网页界面效果图：展示输入框、发送按钮、示例问题和聊天区域]

---

## 五、运行项目，见证奇迹！

### 第一步：登录Claude Code

在终端运行：

```bash
claude auth login
```

会弹出一个浏览器窗口让你授权，点击允许即可。

### 第二步：启动服务器

```bash
# 在项目目录下
node server.js
```

看到以下提示说明成功了：

```
🚀 AI助手服务器已启动！
📱 请打开浏览器访问：http://localhost:3000
⚠️  确保已运行 claude auth login 登录
```

### 第三步：打开浏览器体验

1. 打开浏览器
2. 输入 `http://localhost:3000`
3. 在输入框里打字提问
4. 点击发送，等待AI回答！

![运行效果展示图：左侧是网页界面，用户输入问题；右侧显示AI正在生成回答]

---

## 六、常见问题解决

### ❌ 问题1：提示 "claude: command not found"

**原因**：Claude Code CLI没有正确安装

**解决**：
```bash
# 重新安装
npm install -g @anthropic-ai/claude-code

# 或者检查npm全局安装路径是否加入环境变量
```

### ❌ 问题2：提示 "AI处理出错"

**原因**：没有登录Claude Code

**解决**：
```bash
claude auth login
```

### ❌ 问题3：网页打不开

**原因**：服务器没启动或端口被占用

**解决**：
```bash
# 检查3000端口是否被占用
lsof -i :3000

# 如果被占用，修改server.js里的PORT为其他数字，如3001
```

### ❌ 问题4：回答很慢或超时

**原因**：Claude处理复杂问题需要时间

**解决**：
- 简化问题
- 在 `server.js` 中增加超时时间：`{ timeout: 120000 }`（2分钟）

![问题解决流程图：列出常见问题及对应的解决方案]

---

## 七、进阶玩法：你还可以这样扩展

### 🎯 功能扩展建议：

1. **添加历史记录**：把问答记录保存到本地文件
2. **支持文件上传**：让AI分析你的文档
3. **多轮对话**：记住上下文，连续聊天
4. **语音输入**：用Web Speech API实现语音提问
5. **部署到云端**：用Vercel或Railway免费部署

### 💡 代码示例：添加历史记录功能

```javascript
const fs = require('fs');

// 保存对话历史
function saveHistory(question, answer) {
    const history = JSON.parse(fs.readFileSync('history.json', 'utf8') || '[]');
    history.push({
        question,
        answer,
        time: new Date().toISOString()
    });
    fs.writeFileSync('history.json', JSON.stringify(history, null, 2));
}
```

---

## 八、总结：你学到了什么？

通过这篇教程，你已经：

✅ 了解了什么是Claude Agent SDK  
✅ 学会了安装和配置开发环境  
✅ 亲手搭建了一个Web问答系统  
✅ 掌握了前后端交互的基本原理  
✅ 获得了继续扩展项目的思路  

**这只是一个开始！** AI的世界很大，你可以：
- 尝试接入其他AI模型（GPT、Gemini等）
- 开发更复杂的应用（智能客服、代码助手、写作工具）
- 学习更多Web开发技术（React、Vue、数据库等）

---

## 📚 附录：完整代码下载

为了方便大家，我把完整代码整理好了：

```
my-ai-assistant/
├── server.js          # 后端服务器
├── public/
│   └── index.html     # 前端页面
├── package.json       # 项目配置
└── history.json       # 对话历史（可选）
```

**GitHub仓库**：[点击获取完整代码](https://github.com/your-repo)  
**视频教程**：[B站搜索"Claude Agent实战"](https://bilibili.com)

---

## 💬 写在最后

技术从来不是高不可攀的堡垒，而是一步步搭建起来的积木。

今天的你，已经迈出了成为AI开发者的第一步。继续保持好奇心，多动手实践，你会发现编程其实很有趣！

**如果这篇教程帮到了你，欢迎：**
- 👍 点赞收藏，方便以后查看
- 💬 在评论区留言你的问题或心得
- 🔄 转发给需要的朋友

**下期预告**：我们将学习如何把今天做的项目部署到云端，让全世界都能访问你的AI助手！

---

*本文作者：技术小白成长记*  
*更新日期：2026年1月28日*  
*技术支持：Anthropic Claude Agent SDK*

---

**相关阅读**：
- [Claude官方文档](https://docs.anthropic.com)
- [Node.js入门教程](https://nodejs.org/zh-cn/docs/guides/)
- [Express框架指南](https://expressjs.com/zh-cn/)

---

*（完）*
