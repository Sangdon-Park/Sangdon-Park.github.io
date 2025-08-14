---
layout: post
title: "Serena MCP 개요와 설치, Claude Code 통합"
date: 2025-01-14
category: Tech
tags: ["Claude Code", "MCP", "AI Tools", "Installation Guide"]
reading_time: 15
description: "Serena MCP 설치 과정에서 발생하는 모든 문제와 해결 방법. Claude Code 통합, web_dashboard 설정, uv sync 등 상세 가이드"
keywords: "Serena MCP, Claude Code, MCP 설치, AI 코딩 도구, 설치 가이드"
custom_css: |
  .tip-box {
      background: var(--card-bg);
      border: 1px solid var(--accent);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
  }
  .tip-box h4 {
      color: var(--accent);
      margin-top: 0;
      margin-bottom: 15px;
  }
  .tip-box button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      transition: all 0.2s ease;
  }
  :root {
      --success: #10b981;
  }
---

<div class="tip-box">
    <h4>💡 Claude와 함께 문제 해결하기</h4>
    <p>Serena 설치 중 "Failed to connect" 오류가 계속 발생한다면:</p>
    <ol>
        <li>아래 버튼으로 이 글을 복사하거나 다운로드하여 <code>.md</code> 파일로 저장</li>
        <li>Claude에게 해당 파일을 제공하며 "이 가이드를 참고해서 Serena MCP 설치를 도와줘"라고 요청</li>
        <li>Claude가 가이드를 읽고 단계별로 문제를 해결해 줄 것입니다</li>
    </ol>
    <div style="margin-top: 20px; display: flex; gap: 10px;">
        <button id="copyContent" style="background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-copy"></i> 전체 복사
        </button>
        <button id="downloadMd" style="background: var(--success); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-download"></i> MD 파일 다운로드
        </button>
    </div>
    <div id="copyStatus" style="margin-top: 10px; color: var(--success); display: none;">
        <i class="fas fa-check-circle"></i> 복사되었습니다!
    </div>
</div>

## 개요

본 문서는 Serena MCP 설치 과정에서 발생하는 모든 알려진 문제와 해결 방법을 다룹니다. 5시간의 트러블슈팅 결과와 [hansdev.kr 블로그](https://hansdev.kr/tech/serena-mcp/)를 참고하여 작성되었습니다.

## 주요 요구사항

1. **web_dashboard: false** - 이 설정이 누락되면 설치가 실패합니다.
2. **uv sync** - 의존성 설치가 반드시 필요합니다.
3. **글로벌 ~/.claude.json** - 프로젝트별 설정이 아닌 글로벌 설정을 사용해야 합니다.

## Serena MCP 소개

Serena MCP는 LLM을 위한 고급 코딩 도구입니다. 주요 기능:
- **심볼 단위 코드 분석**: 함수, 클래스, 변수를 정확하게 식별
- **프로젝트 구조 분석**: 파일 간 의존성 및 관계 파악
- **효율적인 코드 수정**: 토큰 사용량을 최소화하며 필요한 부분만 수정
- **다중 언어 지원**: Python, TypeScript, JavaScript, Go, Rust, Ruby, Swift

### MCP(Model Context Protocol)

Anthropic에서 개발한 프로토콜로, AI 모델이 외부 도구와 통신할 수 있도록 지원합니다. Claude Code의 파일 시스템 접근, 웹 검색 등이 MCP를 통해 구현됩니다.

## 정확한 설치 절차

### 사전 요구사항

```bash
# Python 3.8+ 확인
python3 --version

# Git 확인
git --version

# uv 설치 (Python 패키지 관리자)
# Homebrew 사용 (macOS)
brew install uv

# 또는 공식 설치 스크립트 (Linux/macOS)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 설치 확인
uv --version
```

### 1단계: 기존 설치 제거

```bash
# 실행 중인 프로세스 확인 및 종료
ps aux | grep serena
# kill [PID]

# uv 도구 제거
uv tool uninstall serena-agent 2>/dev/null || echo "Not installed"

# 설정 파일 삭제
rm -rf ~/.serena
rm -rf .serena

# 실행 파일 삭제
rm -f ~/.local/bin/serena*

# 캐시 정리
find ~/.local/share/uv -name "*serena*" -exec rm -rf {} + 2>/dev/null

# 기존 클론 삭제
rm -rf ~/work/serena
```

### 2단계: 로컬 설치

```bash
# 작업 디렉토리 생성
mkdir -p ~/work
cd ~/work

# GitHub에서 최신 버전 클론
git clone https://github.com/oraios/serena
cd serena

# 중요: 의존성 설치 (필수)
uv sync

# 성공 메시지 확인 (55개 패키지 설치)
# Installed 55 packages in XXXms
```

### 3단계: 설정 파일 구성

```bash
# 설정 디렉토리 생성
mkdir -p ~/.serena

# 템플릿 복사
cp src/serena/resources/serena_config.template.yml ~/.serena/serena_config.yml

# 필수: 웹 대시보드 비활성화
sed -i 's/web_dashboard: True/web_dashboard: false/g' ~/.serena/serena_config.yml
sed -i 's/web_dashboard_open_on_launch: True/web_dashboard_open_on_launch: false/g' ~/.serena/serena_config.yml

# 또는 수동 편집
# web_dashboard: false
# web_dashboard_open_on_launch: false
```

### 4단계: Claude 설정

Python 스크립트를 작성하여 Claude 설정을 자동화할 수 있습니다. 글로벌 설정에 Serena를 추가하고 프로젝트별 중복을 제거합니다.

### 5단계: 검증 및 Claude 재시작

```bash
# 설정 확인
grep -A 10 '"serena"' ~/.claude.json

# JSON-RPC 테스트
cd ~/work/serena
echo '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":1}' | \
  uv run serena-mcp-server --context ide-assistant 2>/dev/null | head -5

# Claude 재시작
# Ctrl+C 또는 /exit로 종료
claude --resume

# MCP 상태 확인
/mcp
# serena: Connected 표시 확인
```

## 핵심 지침

### 금지 사항

1. `uvx --from serena-agent` 사용 금지
2. `serena start-mcp-server` 사용 금지 (웹 대시보드 시작)
3. PyPI 패키지 사용 금지 (구버전)
4. 프로젝트별 .claude.json 설정 금지
5. `web_dashboard: True` 설정 금지
6. `uv sync` 생략 금지

### 필수 사항

1. GitHub에서 직접 클론
2. `uv sync`로 의존성 설치
3. `web_dashboard: false` 설정
4. `uv run --directory` 사용
5. 글로벌 ~/.claude.json 설정
6. 중복 설정 제거

## 결론

Serena MCP는 강력한 도구이나, 설치 과정에서 웹 대시보드 설정과 의존성 설치가 핵심입니다.

**필수 확인 사항:**
1. `web_dashboard: false`
2. `uv sync` 실행
3. 글로벌 설정 사용

본 가이드를 정확히 따르면 설치에 성공할 수 있습니다.

---
**작성일:** 2025년 1월 14일  
**참고 자료:** [hansdev.kr - Serena MCP 설치 가이드](https://hansdev.kr/tech/serena-mcp/)

<script>
// Markdown content for copy/download
const markdownContent = `# Serena MCP 개요와 설치, Claude Code 통합

## 💡 Claude와 함께 문제 해결하기

Serena 설치 중 "Failed to connect" 오류가 계속 발생한다면:
1. 이 글 전체를 복사하여 \`.md\` 파일로 저장
2. Claude에게 해당 파일을 제공하며 "이 가이드를 참고해서 Serena MCP 설치를 도와줘"라고 요청
3. Claude가 가이드를 읽고 단계별로 문제를 해결해 줄 것입니다

[... 전체 내용 ...]
`;

// Copy button functionality
document.getElementById('copyContent')?.addEventListener('click', function() {
    navigator.clipboard.writeText(markdownContent).then(function() {
        document.getElementById('copyStatus').style.display = 'block';
        setTimeout(() => {
            document.getElementById('copyStatus').style.display = 'none';
        }, 3000);
    });
});

// Download button functionality
document.getElementById('downloadMd')?.addEventListener('click', function() {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'serena-mcp-installation-guide.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});
</script>