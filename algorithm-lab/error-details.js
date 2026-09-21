let errorLine = null;
function clearErrorLine() {
  if (errorLine !== null && editor) editor.removeLineClass(errorLine, 'background', 'answer-error-line');
  errorLine = null;
}
function showDiagnostic(detail, source, raw = '') {
  const card = document.createElement('section');
  card.className = 'error-detail';
  const own = ['answer.py', 'answer.c'].includes(detail.file);
  const validLine = own && Number.isInteger(detail.line) && detail.line > 0 && detail.line <= source.split('\n').length;
  const label = document.createElement('strong');
  label.textContent = (detail.severity === 'warning' ? T('경고') : detail.severity === 'note' ? T('참고') : T('오류')) + ': ' + messageText(detail.message);
  card.append(label);
  if (validLine) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = T('답안 줄: ') + detail.line + (detail.column ? T(' · 열: ') + detail.column : '') + ' · ' + T('코드로 이동');
    const problemId = problems[index].id, codeLanguage = language;
    button.onclick = () => {
      if (getCode() !== source || problems[index].id !== problemId || language !== codeLanguage) {
        button.textContent = T('답안이 바뀌었습니다. 다시 실행해 주세요.');
        return;
      }
      document.getElementById('coding-tab').click();
      clearErrorLine();
      errorLine = editor.addLineClass(detail.line - 1, 'background', 'answer-error-line');
      editor.setCursor({line: detail.line - 1, ch: 0});
      editor.scrollIntoView({line: detail.line - 1, ch: 0}, 80);
      editor.focus();
    };
    card.append(button);
    const snippet = document.createElement('pre');
    const lines = source.split('\n'), start = Math.max(0, detail.line - 3), end = Math.min(lines.length, detail.line + 2);
    snippet.textContent = lines.slice(start, end).map((line, i) => `${start + i + 1 === detail.line ? '>' : ' '} ${String(start + i + 1).padStart(4)} | ${line}`).join('\n');
    card.append(snippet);
  } else {
    const note = document.createElement('p');
    note.textContent = T('이 오류는 답안의 정확한 줄을 확인할 수 없습니다.') + (detail.file ? ' (' + detail.file + ')' : '');
    card.append(note);
  }
  if (detail.frames?.length > 1) {
    const trace = document.createElement('p');
    trace.textContent = T('호출 순서: ') + detail.frames.map(frame => `${frame.name} (${frame.line})`).join(' → ');
    card.append(trace);
  }
  if (raw || detail.raw) {
    const log = document.createElement('details'), title = document.createElement('summary'), pre = document.createElement('pre');
    title.textContent = T('원본 오류 로그');
    pre.textContent = raw || detail.raw;
    log.append(title, pre); card.append(log);
  }
  document.getElementById('case-results').append(card);
}
