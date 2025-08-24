// Gemini Chatbot Integration (Netlify)
const CHATBOT_API = 'https://sangdon-chatbot.netlify.app/.netlify/functions/chat-ai-driven';

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.attachEventListeners();
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot-container">
                <button id="chatbot-toggle" class="chatbot-toggle">
                    <span class="chat-icon">💬</span>
                    <span class="close-icon" style="display:none;">✕</span>
                </button>
                
                <div id="chatbot-window" class="chatbot-window" style="display:none;">
                    <div class="chatbot-header">
                        <h3>박상돈과 대화하기</h3>
                        <span class="chatbot-status">● Online</span>
                    </div>
                    
                    <div id="chatbot-messages" class="chatbot-messages">
                        <div class="bot-message">
                            <div class="message-content">
                                안녕하세요! 저는 박상돈입니다. 제 홈페이지를 방문해주셔서 감사합니다. 연구, 프로젝트, 경력 등 궁금한 점이 있으시면 편하게 물어보세요!
                            </div>
                        </div>
                    </div>
                    
                    <div class="chatbot-input-area">
                        <input type="text" id="chatbot-input" placeholder="메시지 입력..." />
                        <button id="chatbot-send">전송</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        this.addStyles();
    }

    addStyles() {
        const styles = `
            <style>
                .chatbot-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .chatbot-toggle {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .chatbot-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                }

                .chatbot-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 450px;
                    height: 650px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chatbot-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .chatbot-header h3 {
                    margin: 0;
                    font-size: 16px;
                }

                .chatbot-status {
                    font-size: 12px;
                    opacity: 0.9;
                }

                .chatbot-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background: #f7f7f7;
                }

                .bot-message, .user-message {
                    margin-bottom: 12px;
                    display: flex;
                }

                .user-message {
                    justify-content: flex-end;
                }

                .message-content {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 18px;
                    word-wrap: break-word;
                }

                .bot-message .message-content {
                    background: white;
                    color: #333;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    line-height: 1.6;
                }

                .bot-message .message-content h2,
                .bot-message .message-content h3,
                .bot-message .message-content h4 {
                    margin: 0.5em 0 0.3em 0;
                    color: #667eea;
                }

                .bot-message .message-content h2 { font-size: 1.2em; }
                .bot-message .message-content h3 { font-size: 1.1em; }
                .bot-message .message-content h4 { font-size: 1em; }

                .bot-message .message-content p {
                    margin: 0.5em 0;
                }

                .bot-message .message-content ul,
                .bot-message .message-content ol {
                    margin: 0.5em 0;
                    padding-left: 1.5em;
                }

                .bot-message .message-content li {
                    margin: 0.2em 0;
                }

                .bot-message .message-content code {
                    background: #f4f4f4;
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: monospace;
                    font-size: 0.9em;
                }

                .bot-message .message-content pre {
                    background: #f4f4f4;
                    padding: 8px;
                    border-radius: 4px;
                    overflow-x: auto;
                    margin: 0.5em 0;
                }

                .bot-message .message-content pre code {
                    background: none;
                    padding: 0;
                }

                .bot-message .message-content a {
                    color: #667eea;
                    text-decoration: underline;
                }

                .bot-message .message-content strong {
                    font-weight: 600;
                    color: #222;
                }

                .user-message .message-content {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .thinking-message .message-content {
                    font-style: italic;
                    opacity: 0.8;
                    background: #f0f0f0;
                }
                
                .action-message .message-content {
                    background: linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%);
                    color: #1565c0;
                    font-size: 0.9em;
                    padding: 8px 12px;
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
                
                .search-results {
                    margin: 10px;
                    padding: 10px;
                    background: #f9f9f9;
                    border-radius: 8px;
                    border-left: 3px solid #667eea;
                }
                
                .search-results-header {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #667eea;
                }
                
                .search-result-item {
                    padding: 4px 0;
                    font-size: 0.9em;
                }
                
                .result-type {
                    color: #999;
                    font-size: 0.85em;
                    margin-right: 5px;
                }
                
                .result-title {
                    color: #333;
                }

                .chatbot-input-area {
                    padding: 15px;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    gap: 10px;
                }

                #chatbot-input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    outline: none;
                }

                #chatbot-input:focus {
                    border-color: #667eea;
                }

                #chatbot-send {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 600;
                }

                #chatbot-send:hover {
                    opacity: 0.9;
                }

                #chatbot-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .typing-indicator {
                    display: inline-block;
                    padding: 10px 14px;
                    background: white;
                    border-radius: 18px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }

                .typing-indicator span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #999;
                    margin: 0 2px;
                    animation: typing 1.4s infinite;
                }

                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }

                @media (max-width: 768px) {
                    .chatbot-window {
                        width: 90vw;
                        height: 80vh;
                        right: 5vw;
                        bottom: 70px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const window = document.getElementById('chatbot-window');
        const chatIcon = toggle.querySelector('.chat-icon');
        const closeIcon = toggle.querySelector('.close-icon');

        toggle.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            window.style.display = this.isOpen ? 'flex' : 'none';
            chatIcon.style.display = this.isOpen ? 'none' : 'inline';
            closeIcon.style.display = this.isOpen ? 'inline' : 'none';
            
            if (this.isOpen) {
                input.focus();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.conversationHistory.push({ role: 'user', content: message });
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // STEP 1: Ask AI what to do
            const response1 = await fetch(CHATBOT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    history: this.conversationHistory.slice(-10),
                    step: 1
                })
            });

            const data1 = await response1.json();
            
            console.log('=== Step 1 Response ===');
            console.log('Action:', data1.action);
            console.log('Query:', data1.query);
            console.log('Initial Message:', data1.initialMessage);

            if (!response1.ok) {
                throw new Error(data1.error || 'API 오류가 발생했습니다');
            }

            this.hideTypingIndicator();
            
            // If it's just chat, prefer initialMessage; otherwise fallback to step 2
            if (!data1.needsSecondStep) {
                const initial = (data1.initialMessage || '').trim();
                if (initial) {
                    this.addMessage(initial, 'bot');
                    this.conversationHistory.push({ role: 'assistant', content: initial });
                    return;
                }
                // Fallback: proceed to step 2 to generate an answer
                await new Promise(resolve => setTimeout(resolve, 500));
                this.showTypingIndicator();
                const response2 = await fetch(CHATBOT_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        history: this.conversationHistory,
                        action: data1.action || 'CHAT',
                        query: data1.query || '',
                        step: 2
                    })
                });
                const data2 = await response2.json();
                this.hideTypingIndicator();
                if (!response2.ok) {
                    throw new Error(data2.error || 'API 오류가 발생했습니다');
                }
                if (data2.searchResults && data2.searchResults.length > 0) {
                    this.showSearchResults(data2.searchResults.map(r => ({ type: 'result', item: { title: r } })));
                }
                const reply2 = data2.reply || '죄송합니다. 일시적인 오류가 발생했습니다.';
                this.addMessage(reply2, 'bot');
                this.conversationHistory.push({ role: 'assistant', content: reply2 });
                return;
            }
            
            // Show initial message
            if (data1.initialMessage) {
                this.addMessage(data1.initialMessage, 'bot');
            }
            
            // STEP 2: Execute action and get final response
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showTypingIndicator();
            
            const response2 = await fetch(CHATBOT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message,
                    action: data1.action,
                    query: data1.query,
                    step: 2
                })
            });

            const data2 = await response2.json();
            
            console.log('=== Step 2 Response ===');
            console.log('Reply:', data2.reply);
            console.log('Search Results:', data2.searchResults);
            
            this.hideTypingIndicator();
            
            // Show search results if any (strings or objects)
            if (data2.searchResults && data2.searchResults.length > 0) {
                const normalized = data2.searchResults.map(r => {
                    if (typeof r === 'string') return { type: 'result', item: { title: r } };
                    if (r && r.item && (r.item.title || r.item.name)) return r; 
                    return { type: 'result', item: { title: String(r) } };
                });
                this.showSearchResults(normalized);
            }
            
            // Add final reply
            this.addMessage(data2.reply, 'bot');
            this.conversationHistory.push({ role: 'assistant', content: data2.reply });

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            this.addMessage('죄송합니다. 일시적인 오류가 발생했습니다.', 'bot');
        }
    }

    addMessage(content, type, subtype = '') {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
        
        if (subtype === 'thinking') {
            messageDiv.classList.add('thinking-message');
        } else if (subtype === 'action') {
            messageDiv.classList.add('action-message');
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Convert markdown to HTML
        const htmlContent = this.parseMarkdown(content);
        contentDiv.innerHTML = htmlContent;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showSearchResults(results) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results';
        resultsDiv.innerHTML = `
            <div class="search-results-header">📚 관련 자료</div>
            ${results.map(r => `
                <div class="search-result-item">
                    <span class="result-type">[${r.type}]</span>
                    <span class="result-title">${r.item.title || r.item.name}</span>
                </div>
            `).join('')}
        `;
        messagesContainer.appendChild(resultsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    parseMarkdown(text) {
        // Escape HTML to prevent XSS
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };
        
        // First escape HTML
        let html = escapeHtml(text);
        
        // Then apply markdown parsing
        html = html
            // Code blocks first (to avoid parsing markdown inside them)
            .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Headers
            .replace(/^### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^# (.*$)/gim, '<h2>$1</h2>')
            // Bold (must come before italic to handle **text**)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_]+)__/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
            .replace(/_([^_\n]+)_/g, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Lists
            .replace(/^[\*\-] (.+)$/gim, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
        
        // Wrap consecutive list items in ul tags
        html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, (match) => {
            return '<ul>' + match + '</ul>';
        });
        
        // Wrap in paragraph tags if not already wrapped
        if (!html.match(/^<[hpul]/)) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbot = new Chatbot();
    });
} else {
    window.chatbot = new Chatbot();
}