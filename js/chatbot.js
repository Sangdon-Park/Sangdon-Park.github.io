// Gemini Chatbot Integration (Netlify)
const CHATBOT_API = 'https://sangdon-chatbot.netlify.app/.netlify/functions/chat-ai-driven';

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.sourceChipLimit = 3;
        this.historyStorageKey = 'axgs_chat_history_v1';
        this.sessionIdStorageKey = 'axgs_chat_session_id_v1';
        this.debugRetrieval = new URLSearchParams(window.location.search).get('debug') === '1';
        this.showSourceChips = new URLSearchParams(window.location.search).get('sources') !== '0';
        this.conversationHistory = this.loadHistory();
        this.sessionId = this.loadSessionId();
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.attachEventListeners();
    }

    loadHistory() {
        try {
            const raw = sessionStorage.getItem(this.historyStorageKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter((item) => item && typeof item.role === 'string' && typeof item.content === 'string')
                .slice(-20);
        } catch (error) {
            console.warn('Failed to load chatbot history from sessionStorage:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            sessionStorage.setItem(this.historyStorageKey, JSON.stringify(this.conversationHistory.slice(-20)));
        } catch (error) {
            console.warn('Failed to save chatbot history to sessionStorage:', error);
        }
    }

    pushHistory(role, content) {
        this.conversationHistory.push({ role, content });
        this.conversationHistory = this.conversationHistory.slice(-20);
        this.saveHistory();
    }

    loadSessionId() {
        try {
            const existing = sessionStorage.getItem(this.sessionIdStorageKey);
            if (existing) return existing;

            const created = (window.crypto && typeof window.crypto.randomUUID === 'function')
                ? window.crypto.randomUUID()
                : `axgs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            sessionStorage.setItem(this.sessionIdStorageKey, created);
            return created;
        } catch (error) {
            console.warn('Failed to initialize chatbot session id:', error);
            return `axgs-fallback-${Date.now()}`;
        }
    }

    buildRequestPayload(base = {}) {
        return {
            ...base,
            history: this.conversationHistory.slice(-12),
            sessionId: this.sessionId
        };
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
                    width: min(640px, calc(100vw - 40px));
                    height: min(720px, calc(100vh - 120px));
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

                .bot-message {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .user-message {
                    justify-content: flex-end;
                }

                .message-content {
                    max-width: 90%;
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

                .source-chips {
                    margin-top: 8px;
                    display: grid;
                    gap: 6px;
                    width: min(100%, 520px);
                }

                .source-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 2px 8px;
                    border-radius: 999px;
                    border: 1px solid #d6d3d1;
                    background: #fafafa;
                    color: #444;
                    font-size: 12px;
                    line-height: 1.4;
                    text-decoration: none;
                    max-width: 100%;
                }

                .source-chip:hover {
                    border-color: #667eea;
                    color: #667eea;
                    background: #f4f6ff;
                }

                .source-chip-label {
                    color: #667eea;
                    font-weight: 600;
                }

                .source-chip-title {
                    white-space: normal;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 420px;
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
        this.pushHistory('user', message);
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
                body: JSON.stringify(this.buildRequestPayload({
                    message,
                    step: 1
                }))
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
            
            // If step 1 already produced a reply, return it directly.
            if (!data1.needsSecondStep) {
                const initial = (data1.initialMessage || '').trim();
                if (initial) {
                    this.addMessage(initial, 'bot');
                    this.pushHistory('assistant', initial);
                    return;
                }

                // Fallback to step 2 only when step 1 did not return usable text.
                await new Promise(resolve => setTimeout(resolve, 120));
                this.showTypingIndicator();
                const response2 = await fetch(CHATBOT_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.buildRequestPayload({
                        message,
                        action: data1.action || 'CHAT',
                        query: data1.query || '',
                        step: 2
                    }))
                });

                const data2 = await response2.json();
                this.hideTypingIndicator();

                if (!response2.ok) {
                    throw new Error(data2.error || 'API 오류가 발생했습니다');
                }

                const normalizedResults = this.normalizeSearchResults(data2);
                if (this.debugRetrieval && normalizedResults.length > 0) {
                    this.showSearchResults(normalizedResults);
                }

                const reply2 = (data2.reply || '').trim() || '응답을 생성하지 못했습니다. 같은 질문을 한 번 더 보내주세요.';

                this.addMessage(reply2, 'bot', '', { sources: this.extractSourceChips(normalizedResults) });
                this.pushHistory('assistant', reply2);
                return;
            }
            
            // STEP 2: Execute action and get final response
            await new Promise(resolve => setTimeout(resolve, 120));
            this.showTypingIndicator();
            
            const response2 = await fetch(CHATBOT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.buildRequestPayload({
                    message,
                    action: data1.action,
                    query: data1.query,
                    step: 2
                }))
            });

            const data2 = await response2.json();
            
            console.log('=== Step 2 Response ===');
            console.log('Reply:', data2.reply);
            console.log('Search Results:', data2.searchResults);
            
            this.hideTypingIndicator();
            
            // Show search results if any (strings or objects)
            const normalized = this.normalizeSearchResults(data2);
            if (this.debugRetrieval && normalized.length > 0) {
                this.showSearchResults(normalized);
            }
            
            // Add final reply
            const finalReply = (data2.reply || '').trim() || '응답을 생성하지 못했습니다. 같은 질문을 한 번 더 보내주세요.';
            this.addMessage(finalReply, 'bot', '', { sources: this.extractSourceChips(normalized) });
            this.pushHistory('assistant', finalReply);

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            const fallback = '질문은 확인했지만 AI 응답 서버가 현재 불안정합니다. 잠시 후 다시 시도해 주세요.';
            this.addMessage(fallback, 'bot');
            this.pushHistory('assistant', fallback);
        }
    }

    normalizeSearchResults(data) {
        if (Array.isArray(data?.searchResultsDetailed) && data.searchResultsDetailed.length > 0) {
            return data.searchResultsDetailed;
        }
        if (Array.isArray(data?.searchResults) && data.searchResults.length > 0) {
            return data.searchResults.map(r => ({ type: 'result', item: { title: r } }));
        }
        return [];
    }

    addMessage(content, type, subtype = '', options = {}) {
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

        if (this.showSourceChips && type === 'bot' && Array.isArray(options.sources) && options.sources.length > 0) {
            messageDiv.appendChild(this.renderSourceChips(options.sources));
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    extractSourceChips(results = []) {
        if (!Array.isArray(results) || results.length === 0) {
            return [];
        }

        const dedup = new Map();
        for (const result of results) {
            const title = result?.item?.title || result?.item?.name || '';
            const url = result?.item?.url || '';
            const key = (url || title || '').trim().toLowerCase();
            if (!key || dedup.has(key)) continue;
            dedup.set(key, { title: title || url, url });
            if (dedup.size >= this.sourceChipLimit) break;
        }

        return [...dedup.values()];
    }

    renderSourceChips(sources = []) {
        const wrap = document.createElement('div');
        wrap.className = 'source-chips';

        sources.forEach((source) => {
            const chip = document.createElement(source.url ? 'a' : 'span');
            chip.className = 'source-chip';
            if (source.url) {
                chip.href = source.url;
                chip.target = '_blank';
                chip.rel = 'noopener noreferrer';
            }

            const label = document.createElement('span');
            label.className = 'source-chip-label';
            label.textContent = 'Source';

            const title = document.createElement('span');
            title.className = 'source-chip-title';
            title.textContent = source.title;

            chip.appendChild(label);
            chip.appendChild(title);
            wrap.appendChild(chip);
        });

        return wrap;
    }
    
    showSearchResults(results) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results';
        resultsDiv.innerHTML = `
            <div class="search-results-header">📚 관련 자료</div>
            ${results.map(r => {
                const title = r.item?.title || r.item?.name || String(r);
                const url = r.item?.url;
                const score = r.item?.score;
                const content = url ? `<a href="${url}" target="_blank">${title}</a>` : title;
                const scoreHtml = (typeof score === 'number') ? ` <span style="color:#999; font-size:0.85em;">(${score})</span>` : '';
                return `
                <div class="search-result-item">
                    <span class="result-type">[${r.type || 'result'}]</span>
                    <span class="result-title">${content}${scoreHtml}</span>
                </div>`;
            }).join('')}
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
            // Auto-link plain URLs (e.g., https://sangdon-park.github.io/about.html)
            .replace(/(^|[\s(])(https?:\/\/[^\s<]+)/gim, (match, prefix, rawUrl) => {
                const cleanUrl = rawUrl.replace(/[),.;!?]+$/g, '');
                const trailing = rawUrl.slice(cleanUrl.length);
                return `${prefix}<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailing}`;
            })
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
