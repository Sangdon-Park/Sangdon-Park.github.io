# Sangdon Park 홈페이지 구조 분석

## 프로젝트 개요
- **URL**: https://sangdon-park.github.io
- **프레임워크**: Jekyll (정적 사이트 생성기)
- **주 언어**: HTML/CSS/JavaScript
- **다국어 지원**: 한국어(KO), 영어(EN)

## 디렉토리 구조
```
/
├── articles/           # 블로그 포스트 HTML 파일들
│   ├── ai-apt-representative-en.html
│   ├── ai-apt-representative.html
│   ├── ai-llm-8months-passion-en.html
│   ├── ai-llm-8months-passion.html
│   ├── serena-mcp-guide-en.html
│   └── serena-mcp-guide.html
├── css/               # 스타일시트
│   ├── main.css      # 메인 스타일
│   └── article.css   # 아티클 전용 스타일
├── images/            # 이미지 리소스
│   └── Sangdon.jpg   # 프로필 사진
├── js/                # JavaScript 파일
│   ├── script.js     # 메인 스크립트
│   └── theme-toggle.js # 테마 전환 기능
├── latex/             # LaTeX 관련 파일
├── _config.yml        # Jekyll 설정
├── index.html         # 메인 페이지 (ko.html로 리다이렉트)
├── ko.html           # 한국어 메인 페이지
├── en.html           # 영어 메인 페이지
├── publications.html  # 논문 목록 페이지
├── CV-ko.pdf         # 한국어 이력서
├── CV.pdf            # 영어 이력서
├── robots.txt        # 검색엔진 크롤링 설정
└── sitemap.xml       # 사이트맵

## 주요 기능 및 특징

### 1. 다국어 지원
- 한국어/영어 버전 분리
- index.html에서 ko.html로 자동 리다이렉트
- 각 페이지에 hreflang 태그로 언어 버전 명시
- 언어 전환 버튼 제공

### 2. 레이아웃 구조
- **사이드바 네비게이션**: 프로필, 소셜 링크, 네비게이션 메뉴
- **반응형 디자인**: 모바일 토글 버튼 제공
- **섹션 구조**:
  - Posts (블로그 글)
  - Research (연구)
  - Experience & Education (경력 및 학력)
  - Projects (프로젝트)
  - Publications (논문)
  - Talks & Seminars (발표)

### 3. 콘텐츠 관리
- Jekyll Collections로 포스트 관리
- 카테고리별 필터링 (All, Research, AI, Insight, Others)
- 포스트 카드 형식의 목록 표시

### 4. SEO 및 분석
- Google Tag Manager (GTM-NKT8SV46)
- Google Analytics (G-1K1LDRRVD1)
- 구조화된 sitemap.xml
- Canonical URL 설정
- robots.txt 최적화

### 5. 기술 스택
- **프론트엔드**: 순수 HTML/CSS/JavaScript
- **스타일링**: CSS 변수 활용, Font Awesome 아이콘
- **빌드**: Jekyll (Ruby 기반)
- **배포**: GitHub Pages

### 6. JavaScript 기능
- 부드러운 스크롤
- 네비게이션 활성화 상태 관리
- 모바일 메뉴 토글
- 프로필 이미지 플레이스홀더
- 헤더 스크롤 효과
- 테마 전환 (theme-toggle.js)

### 7. 특별 페이지
- **gtm-debug.html**: GTM 디버깅용
- **analytics-test.html**: 분석 테스트용
- **publications.html**: 논문 목록 전용 페이지

## 개선 가능 영역
1. 다크모드 구현 완성 (theme-toggle.js 활용)
2. 검색 기능 추가
3. 댓글 시스템 통합
4. RSS 피드 활성화
5. 이미지 최적화 및 lazy loading