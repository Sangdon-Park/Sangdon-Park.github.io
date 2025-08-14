class InsightsLoader {
    constructor() {
        this.insightsPath = 'insights/';
        this.insightFiles = [];
    }

    async loadInsightsList() {
        try {
            const files = [
                '2024-04-08-ai-apt-representative.md',
                '2025-08-14-serena-mcp-guide.md'
            ];

            const insights = [];
            
            for (const file of files) {
                const response = await fetch(this.insightsPath + file);
                if (response.ok) {
                    const text = await response.text();
                    const metadata = this.extractMetadata(text);
                    const content = this.extractContent(text);
                    
                    insights.push({
                        filename: file,
                        ...metadata,
                        preview: this.getPreview(content),
                        content: content
                    });
                }
            }

            insights.sort((a, b) => a.order - b.order);
            return insights;
        } catch (error) {
            console.error('Error loading insights:', error);
            return [];
        }
    }

    extractMetadata(text) {
        const metadataMatch = text.match(/^---\n([\s\S]*?)\n---/);
        if (!metadataMatch) return {};

        const metadataText = metadataMatch[1];
        const metadata = {};
        
        const lines = metadataText.split('\n');
        lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim();
                metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        });
        
        return metadata;
    }

    extractContent(text) {
        const contentMatch = text.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/);
        return contentMatch ? contentMatch[1].trim() : text;
    }

    getPreview(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            if (line && !line.startsWith('#') && line.trim().length > 50) {
                return line.trim().substring(0, 150) + '...';
            }
        }
        return '';
    }

    parseMarkdown(markdown) {
        let html = markdown;
        
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        const paragraphs = html.split('\n\n');
        html = paragraphs
            .map(p => {
                if (!p.startsWith('<') && p.trim()) {
                    return `<p>${p}</p>`;
                }
                return p;
            })
            .join('\n');
        
        return html;
    }

    renderInsightsList(insights, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const gridHtml = insights.map(insight => `
            <div class="article-item">
                <a href="#" class="article-link" data-insight="${insight.filename}">
                    <h4 class="article-title">${insight.title || 'Untitled'}</h4>
                    <p class="article-meta">${insight.meta || ''} | ${insight.date || ''}</p>
                    <p class="article-preview">${insight.preview}</p>
                </a>
            </div>
        `).join('');

        container.innerHTML = `<div class="article-grid">${gridHtml}</div>`;

        container.querySelectorAll('.article-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filename = link.dataset.insight;
                const insight = insights.find(i => i.filename === filename);
                if (insight) {
                    this.showInsightModal(insight);
                }
            });
        });
    }

    showInsightModal(insight) {
        const existingModal = document.getElementById('insight-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div id="insight-modal" class="insight-modal">
                <div class="insight-modal-content">
                    <span class="insight-modal-close">&times;</span>
                    <div class="insight-modal-header">
                        <h2>${insight.title}</h2>
                        <p class="insight-modal-meta">${insight.meta} | ${insight.date}</p>
                    </div>
                    <div class="insight-modal-body">
                        ${this.parseMarkdown(insight.content)}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('insight-modal');
        const closeBtn = modal.querySelector('.insight-modal-close');

        closeBtn.onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const loader = new InsightsLoader();
    const container = document.getElementById('insights-container');
    
    if (container) {
        try {
            const insights = await loader.loadInsightsList();
            if (insights.length > 0) {
                loader.renderInsightsList(insights, 'insights-container');
            } else {
                // Fallback to static HTML if dynamic loading fails
                container.innerHTML = `
                    <div class="article-grid">
                        <div class="article-item">
                            <a href="articles/ai-apt-representative.html" class="article-link">
                                <h4 class="article-title">AI 없이는 불가능했던 동대표 활동</h4>
                                <p class="article-meta">AI와 동대표 활동 | 2024년 4월</p>
                            </a>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading insights:', error);
            // Fallback to static HTML
            container.innerHTML = `
                <div class="article-grid">
                    <div class="article-item">
                        <a href="articles/ai-apt-representative.html" class="article-link">
                            <h4 class="article-title">AI 없이는 불가능했던 동대표 활동</h4>
                            <p class="article-meta">AI와 동대표 활동 | 2024년 4월</p>
                        </a>
                    </div>
                </div>
            `;
        }
    }
});