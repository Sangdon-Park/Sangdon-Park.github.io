---
title: Serena MCP 설치 가이드 - 완전한 문제 해결 방법
date: 2025-08-14
meta: Claude Code와 함께 사용하는 고급 코딩 도구
lang: ko
order: 2
---

# Serena MCP 설치 가이드: 완전한 문제 해결 방법

## 개요
본 문서는 Serena MCP 설치 과정에서 발생하는 모든 알려진 문제와 해결 방법을 다룹니다. 5시간의 트러블슈팅 결과와 Chris Han님의 블로그 글의 내용을 통합하여 작성되었습니다.

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

## 일반적인 설치 실패 사례

### 사례 1: 공식 문서 방법
```bash
uvx --from serena-agent serena-mcp-server
```
**결과**: `serena-mcp-server` 명령어를 찾을 수 없음

### 사례 2: PyPI 패키지 설치
```bash
uv tool install serena-agent
```
**결과**: 설치는 되지만 실행 파일이 없음

### 사례 3: 잘못된 명령어
```bash
uvx --from serena-agent serena start-mcp-server
```
**결과**: Claude에서 연결 실패

### 사례 4: GitHub 직접 설치
```bash
uvx --from git+https://github.com/oraios/serena serena-mcp-server
```
**결과**: 여전히 연결 실패

### 사례 5: 웹 대시보드 설정 누락
**결과**: MCP 통신 실패 - stdout/stderr 오염으로 JSON-RPC 통신 차단

## 문제 원인 분석

### 원인 1: PyPI 패키지 버전 문제
- PyPI의 `serena-agent`는 구버전
- 최신 버전은 GitHub 저장소에만 존재
- GitHub 버전의 문서도 일부 부정확

### 원인 2: 웹 대시보드 간섭 (최우선 문제)
- `web_dashboard: True`가 기본값으로 설정됨
- 웹 대시보드가 stdout/stderr에 로그를 출력하여 MCP 통신 방해
- Claude는 순수한 JSON-RPC 통신을 요구하나 로그가 혼재됨
- **필수 조치: `web_dashboard: false` 설정**

### 원인 3: 의존성 설치 누락
- `git clone` 후 `uv sync` 미실행 시 실패
- 55개의 필수 패키지 설치 필요
- 이 단계 누락 시 명령어는 존재하나 실행 불가

### 원인 4: 설정 파일 충돌
```json
// 글로벌 설정
"mcpServers": {
  "serena": { ... }
}

// 프로젝트별 설정 (충돌 발생)
"projects": {
  "/path/to/project": {
    "mcpServers": {
      "serena": { ... }
    }
  }
}
```

### 원인 5: 실행 방식 차이
- `uvx` 직접 실행: 지원하지 않음
- 로컬 클론 후 `uv run --directory`: 올바른 방법

## 정확한 설치 절차

### 사전 요구사항

#### macOS/Linux
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

#### Windows (WSL2 권장)
```bash
# WSL2에서 Linux 명령어 사용
# 또는 Windows PowerShell에서
winget install astral-sh.uv
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
```python
# setup_serena.py
import json
import os
import sys

claude_config = os.path.expanduser('~/.claude.json')

# 설정 파일 존재 확인
if not os.path.exists(claude_config):
    print("Error: ~/.claude.json not found. Run Claude Code first.")
    sys.exit(1)

with open(claude_config, 'r') as f:
    data = json.load(f)

# 글로벌 설정에 추가
if 'mcpServers' not in data:
    data['mcpServers'] = {}

data['mcpServers']['serena'] = {
    'type': 'stdio',
    'command': 'uv',
    'args': [
        'run',
        '--directory',
        os.path.expanduser('~/work/serena'),
        'serena-mcp-server',
        '--context',
        'ide-assistant'
    ],
    'env': {}
}

# 프로젝트별 중복 제거
removed_count = 0
for project_path, project_config in data.get('projects', {}).items():
    if 'mcpServers' in project_config and 'serena' in project_config['mcpServers']:
        del project_config['mcpServers']['serena']
        removed_count += 1
        print(f"Removed duplicate Serena config from {project_path}")

with open(claude_config, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nClaude configuration complete.")
print(f"Serena path: {os.path.expanduser('~/work/serena')}")
if removed_count > 0:
    print(f"Removed {removed_count} duplicate configurations")
print("\nRestart Claude Code now:")
print("1. Exit with Ctrl+C or /exit")
print("2. Restart with: claude --resume")
print("3. Verify with: /mcp")
```

스크립트 실행:
```bash
python3 setup_serena.py
```

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

## 설치 확인

성공적으로 설치되면 다음과 같이 표시됩니다:
```
Serena MCP Server
Status: Connected
Command: uv
Args: run --directory /home/...
```

## 사용 방법

설치 완료 후:
```
/mcp__serena__initial_instructions
```

주요 기능:
- **심볼 검색**: 함수나 클래스를 정확히 검색
- **참조 찾기**: 특정 함수 사용 위치 파악
- **코드 수정**: 토큰 효율적인 부분 수정
- **프로젝트 메모리**: 프로젝트별 컨텍스트 관리

### 주요 명령어
```
# 프로젝트 활성화
/mcp__serena__activate_project /path/to/project

# 심볼 검색
/mcp__serena__find_symbol MyClass

# 참조 검색
/mcp__serena__find_referencing_symbols MyFunction

# 메모리 저장
/mcp__serena__write_memory "프로젝트 정보"
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

## 문제 해결

### "Failed to connect" 오류 시
1. **web_dashboard 설정 확인** (최우선)
   ```bash
   grep web_dashboard ~/.serena/serena_config.yml
   ```
2. **의존성 설치 확인**
   ```bash
   cd ~/work/serena && uv sync
   ```
3. 실행 중인 Serena 프로세스 확인
   ```bash
   ps aux | grep serena
   ```
4. ~/.claude.json 중복 설정 확인
5. 로컬 클론 경로 확인
6. Claude 재시작 확인

### 디버깅
```bash
# 직접 테스트
cd ~/work/serena
uv run serena-mcp-server --context ide-assistant --help

# JSON-RPC 테스트
echo '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":1}' | \
  uv run serena-mcp-server --context ide-assistant 2>/dev/null | head -5

# 로그 확인
tail -f ~/.serena/logs/$(date +%Y-%m-%d)/mcp_*.txt
```

### 일반적인 실수
- 프로젝트와 글로벌 설정 혼용
- `uvx`와 `uv run` 혼동
- 웹 대시보드와 MCP 서버 혼동
- 구버전 문서 참조
- `uv sync` 단계 생략
- `web_dashboard: True` 유지

## 추가 스크립트

### 프로젝트별 Serena 추가
```bash
#!/bin/bash
# add-serena.sh
SERENA_PATH=~/work/serena

claude mcp add serena -- uv run --directory $SERENA_PATH serena-mcp-server --context ide-assistant

echo "Serena MCP added to current project"
echo "Run: /mcp__serena__initial_instructions"
```

### 쉘 별칭 (.bashrc 또는 .zshrc)
```bash
alias serena-add='claude mcp add serena -- uv run --directory ~/work/serena serena-mcp-server --context ide-assistant'
alias serena-check='claude mcp list | grep serena'
alias serena-logs='tail -f ~/.serena/logs/$(date +%Y-%m-%d)/mcp_*.txt'
```

## 참고 자료

- [Serena GitHub Repository](https://github.com/oraios/serena)
- [hansdev.kr Serena MCP Guide](https://hansdev.kr/tech/serena-mcp/)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [MCP Protocol Specification](https://modelcontextprotocol.io)

## 결론

Serena MCP는 강력한 도구이나, 설치 과정에서 웹 대시보드 설정과 의존성 설치가 핵심입니다.

**필수 확인 사항:**
1. `web_dashboard: false`
2. `uv sync` 실행
3. 글로벌 설정 사용

본 가이드를 정확히 따르면 설치에 성공할 수 있습니다.

---

**Keywords**: Serena MCP, Claude Code, Model Context Protocol, AI coding assistant, installation guide, web_dashboard, uv sync

**작성일**: 2025년 1월 27일  
**최종 수정**: 2025년 8월 14일 (web_dashboard 문제 해결 추가)