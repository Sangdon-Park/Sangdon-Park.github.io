# Sangdon Park 홈페이지 챗봇 구현

## 개요
Sangdon Park의 개인 홈페이지(sangdon-park.github.io)에 통합된 AI 챗봇 시스템. Gemini 2.5 Flash API를 활용하여 박상돈 본인처럼 응답하는 지능형 챗봇.

## 기술 스택
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Netlify Functions (Serverless)
- **AI Model**: Google Gemini 2.5 Flash
- **Database**: Supabase (채팅 로그 저장)
- **Hosting**: GitHub Pages (Frontend), Netlify (Backend API)

## 주요 파일 구조

### Frontend
- `/js/chatbot.js`: 챗봇 UI 및 상호작용 로직
  - 마크다운 렌더링 지원
  - 두 단계 대화 흐름 (분석 → 응답)
  - 대화 히스토리 관리
  
### Backend (Netlify Functions)
- `/netlify/functions/chat-ai-driven.js`: 메인 챗봇 API
  - 2단계 AI 처리: Step 1(행동 결정) → Step 2(응답 생성)
  - ACTION 타입: SEARCH_PAPERS, COUNT_PAPERS, ANALYZE_COLLABORATORS, CHAT 등
- `/netlify/functions/admin-logs.js`: 관리자 페이지 API
- `/netlify/functions/test-supabase.js`: Supabase 연결 테스트

## 핵심 기능

### 1. AI 기반 행동 결정 (2-Step Process)
```javascript
// Step 1: AI가 사용자 의도 파악 및 행동 결정
ACTION: SEARCH_PAPERS // 논문 검색
QUERY: AI // 검색어
INITIAL_MESSAGE: "AI 관련 논문을 찾아보겠습니다"

// Step 2: 검색 실행 후 최종 응답 생성
```

### 2. 논문 데이터베이스
- **Edge Computing**: 6편
- **IoT**: 5편  
- **Energy Trading**: 4편
- **AI/ML**: 3편
- 총 25편 국제저널, 10편 국제학회

### 3. 프롬프트 엔지니어링
- 박상돈 본인의 페르소나 구현
- 자연스러운 한국어 존댓말 응답
- 1-2문장 간결한 답변
- 논문/프로젝트 정보 정확한 제공

### 4. Supabase 통합
- 모든 대화 로그 저장
- IP 주소 수집
- 대화 히스토리 보관
- 관리자 페이지에서 조회 가능

## 환경 변수 (Netlify)
```
GEMINI_API_KEY=<Gemini API Key>
SUPABASE_URL=https://dhumdlkdhtuwrbytcmal.supabase.co
SUPABASE_SERVICE_KEY=<Service Role Key>
ADMIN_PASSWORD=<관리자 비밀번호>
```

## 주요 개선 사항
1. **RAG-like 시스템**: AI가 스스로 검색/분석 판단
2. **마크다운 렌더링**: 굵은 글씨, 리스트, 코드 블록 지원
3. **대화 연속성**: 최근 10개 메시지 컨텍스트 유지
4. **단계별 표시**: "분석 중..." → 실제 응답
5. **에러 처리**: Fallback 응답 제공

## API 엔드포인트
- 챗봇: `https://sangdon-chatbot.netlify.app/.netlify/functions/chat-ai-driven`
- 관리자: `https://sangdon-chatbot.netlify.app/.netlify/functions/admin-logs`
- 관리자 페이지: `https://sangdon-chatbot.netlify.app/admin.html`

## 특징
- 실시간 AI 응답 (Gemini 2.5 Flash)
- 논문/프로젝트 정보 검색
- 공동연구자 분석
- 자연스러운 대화 흐름
- 모바일 반응형 디자인

## 향후 개선 방향
- 실제 논문 PDF 연동
- 더 정교한 RAG 시스템
- 다국어 지원 (영어 버전)
- 음성 대화 기능