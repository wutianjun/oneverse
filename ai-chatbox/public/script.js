const chatContainer = document.getElementById('messagesContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const welcomeScreen = document.getElementById('welcomeScreen');

let isGenerating = false;

// 自动调整输入框高度
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function setInput(text) {
    userInput.value = text;
    autoResize(userInput);
    userInput.focus();
}

function clearChat() {
    chatContainer.innerHTML = '';
    chatContainer.appendChild(welcomeScreen);
    welcomeScreen.style.display = 'flex';
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function createMessageElement(type, content) {
    const div = document.createElement('div');
    div.className = `message ${type}`;

    // 简单的 Markdown 处理 (实际项目建议用 marked.js)
    let formattedContent = content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    div.innerHTML = `
        <div class="bubble">${formattedContent}</div>
        <div class="meta">${type === 'user' ? '你' : 'AI 助手'} · ${getCurrentTime()}</div>
    `;
    return div;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isGenerating) return;

    // UI 更新
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    // 添加用户消息
    chatContainer.appendChild(createMessageElement('user', text));
    userInput.value = '';
    userInput.style.height = 'auto';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 准备 AI 消息容器
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message ai';
    aiMessageDiv.innerHTML = `
        <div class="bubble"><span class="cursor"></span></div>
        <div class="meta">AI 助手 · ${getCurrentTime()}</div>
    `;
    chatContainer.appendChild(aiMessageDiv);
    const bubbleContent = aiMessageDiv.querySelector('.bubble');

    isGenerating = true;
    sendBtn.disabled = true;

    try {
        // 使用 EventSource 进行 SSE 连接
        const eventSource = new EventSource(`/api/chat/stream?message=${encodeURIComponent(text)}`);
        let fullText = '';

        eventSource.onmessage = (event) => {
            // 检查结束信号
            if (event.data === '[DONE]') {
                eventSource.close();
                isGenerating = false;
                sendBtn.disabled = false;
                bubbleContent.innerHTML = formatMarkdown(fullText);
                return;
            }

            try {
                const data = JSON.parse(event.data);
                if (data.delta) {
                    fullText += data.delta;
                    bubbleContent.innerText = fullText;
                    bubbleContent.innerHTML += '<span class="cursor"></span>';
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            } catch (e) {
                console.error('Parse error:', e);
            }
        };

        eventSource.onerror = (err) => {
            // 如果是在生成过程中遇到错误，且不是正常关闭
            if (eventSource.readyState === EventSource.CLOSED) {
                // 连接关闭，通常意味着结束
                isGenerating = false;
                sendBtn.disabled = false;
                bubbleContent.innerHTML = formatMarkdown(fullText); // 确保最后格式化
            } else {
                console.error('SSE Error:', err);
                eventSource.close();
                isGenerating = false;
                sendBtn.disabled = false;
                bubbleContent.innerHTML += '<br><span style="color:red; font-size: 0.8em;">[连接已断开]</span>';
            }
        };

    } catch (error) {
        console.error('Fetch error:', error);
        isGenerating = false;
        sendBtn.disabled = false;
    }
}

// 简单的 Markdown 格式化器
function formatMarkdown(text) {
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```(\w*)([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
        })
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// 监听 Shift+Enter
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
