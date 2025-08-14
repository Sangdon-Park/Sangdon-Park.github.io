---
layout: default
title: Home
show_back_to_top: true
---

<!-- Page Header -->
<header class="page-header" id="page-header">
    <h1 class="page-title">Recent Posts</h1>
</header>

<!-- Category Tabs -->
<div class="category-tabs" id="category-tabs">
    <a href="#research" class="category-tab active" data-category="research">
        <span>Research</span>
    </a>
    <a href="#ai" class="category-tab" data-category="ai">
        <span>AI</span>
    </a>
    <a href="#insight" class="category-tab" data-category="insight">
        <span>Insight</span>
    </a>
    <a href="#others" class="category-tab" data-category="others">
        <span>Others</span>
    </a>
</div>

<!-- Posts Section -->
<section id="posts" class="posts-section">
    <div class="posts-list">
        {% for post in site.posts %}
        <article class="post-card" data-category="{{ post.category | downcase }}">
            <a href="{{ post.url | relative_url }}" class="post-link">
                <div class="post-header">
                    <span class="post-category">{{ post.category }}</span>
                    <span class="post-date">{{ post.date | date: "%Y.%m.%d" }}</span>
                </div>
                <h2 class="post-title">{{ post.title }}</h2>
                <p class="post-excerpt">{{ post.description }}</p>
                <div class="post-footer">
                    <span class="read-more">자세히 보기 →</span>
                </div>
            </a>
        </article>
        {% endfor %}
    </div>
</section>

<!-- Research Section -->
<section id="research" class="posts-section" style="display: none;">
    <div class="section-header">
        <h2 class="section-title">Research Interests</h2>
    </div>
    <div class="research-grid">
        <div class="research-card">
            <h3>Edge Computing & Resource Optimization</h3>
            <p>엣지 컴퓨팅 환경에서의 자원 최적화 및 동적 가격 책정 메커니즘 연구</p>
        </div>
        <div class="research-card">
            <h3>AI-Driven Game Development</h3>
            <p>LLM 기반 NPC 상호작용 및 동적 스토리텔링 시스템 개발</p>
        </div>
        <div class="research-card">
            <h3>Energy Trading in Smart Grid</h3>
            <p>마이크로그리드 환경에서의 게임 이론 기반 에너지 거래 시스템</p>
        </div>
        <div class="research-card">
            <h3>IoT Data Markets</h3>
            <p>블록체인 기반 개인 데이터 거래 플랫폼 및 프라이버시 가치 평가</p>
        </div>
    </div>
</section>

<!-- Experience & Education Section -->
<section id="experience" class="posts-section" style="display: none;">
    <div class="section-header">
        <h2 class="section-title">Experience & Education</h2>
    </div>
    
    <div class="timeline">
        <h3 style="color: var(--accent); margin-bottom: 20px;">Experience</h3>
        <div class="timeline-item">
            <div class="timeline-date">2025.05 - Present</div>
            <div class="timeline-content">
                <h4>Principal Researcher</h4>
                <p>Sayberry Games Inc. - AI 게임 개발 연구</p>
            </div>
        </div>
        <div class="timeline-item">
            <div class="timeline-date">2021.03 - 2025.04</div>
            <div class="timeline-content">
                <h4>Senior Researcher</h4>
                <p>한국과학기술원(KAIST) - 엣지 컴퓨팅 및 자원 최적화 연구</p>
            </div>
        </div>
        
        <h3 style="color: var(--accent); margin: 30px 0 20px;">Education</h3>
        <div class="timeline-item">
            <div class="timeline-date">2015 - 2021</div>
            <div class="timeline-content">
                <h4>Ph.D. in Electrical Engineering</h4>
                <p>한국과학기술원(KAIST)</p>
                <p style="font-size: 14px; color: var(--text-secondary);">논문: Energy Trading Mechanisms in Smart Grid Systems</p>
            </div>
        </div>
        <div class="timeline-item">
            <div class="timeline-date">2011 - 2015</div>
            <div class="timeline-content">
                <h4>B.S. in Electrical Engineering</h4>
                <p>한국과학기술원(KAIST)</p>
            </div>
        </div>
    </div>
</section>

<!-- Projects Section -->
<section id="projects" class="posts-section" style="display: none;">
    <div class="section-header">
        <h2 class="section-title">Projects</h2>
    </div>
    <div class="projects-grid">
        <div class="project-card">
            <h3>AI 캐릭터 기반 인터랙티브 게임</h3>
            <p>LLM API를 활용한 실시간 대화형 NPC 시스템 개발</p>
            <div class="project-tags">
                <span class="project-tag">Gemini API</span>
                <span class="project-tag">Game Dev</span>
                <span class="project-tag">Python</span>
            </div>
        </div>
        <div class="project-card">
            <h3>엣지 컴퓨팅 GUI 시뮬레이터</h3>
            <p>자원 할당 및 태스크 오프로딩 최적화 시뮬레이션 도구</p>
            <div class="project-tags">
                <span class="project-tag">Edge Computing</span>
                <span class="project-tag">Optimization</span>
                <span class="project-tag">Python</span>
            </div>
        </div>
        <div class="project-card">
            <h3>마을공동체 활성화 플랫폼</h3>
            <p>주민 참여형 문화 프로그램 관리 시스템</p>
            <div class="project-tags">
                <span class="project-tag">Community</span>
                <span class="project-tag">Web App</span>
            </div>
        </div>
    </div>
</section>

<script>
// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.posts-section');
    const pageHeader = document.getElementById('page-header');
    const categoryTabs = document.getElementById('category-tabs');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.includes('#')) {
                e.preventDefault();
                const target = href.split('#')[1];
                
                // Update active nav
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide sections
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                const targetSection = document.getElementById(target);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
                
                // Show/hide header and tabs for posts
                if (target === 'posts') {
                    if (pageHeader) pageHeader.style.display = 'block';
                    if (categoryTabs) categoryTabs.style.display = 'flex';
                } else {
                    if (pageHeader) pageHeader.style.display = 'none';
                    if (categoryTabs) categoryTabs.style.display = 'none';
                }
            }
        });
    });
    
    // Category filter
    const categoryTabLinks = document.querySelectorAll('.category-tab');
    categoryTabLinks.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active tab
            categoryTabLinks.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            const category = this.dataset.category;
            const posts = document.querySelectorAll('.post-card');
            
            posts.forEach(post => {
                if (category === 'all' || post.dataset.category === category) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });
});
</script>