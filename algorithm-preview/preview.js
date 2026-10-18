(() => {
  'use strict';
  const SERVICE = 'https://algorithm-rehearsal.vercel.app/api/feedback';
  const EDITION = 'rehearsal-20261018-ch1-4';
  const DRAWER = 'algorithm-rehearsal-20261018-ch1-4';
  const leaves = ['copper', 'jade', 'pebble', 'cedar', 'ink'];
  const labels = ['객관식', '객관식', '단답형', '서술형', '코딩형'];
  const starters = {
    py: 'def first_index(a, x):\n    # x가 처음 등장하는 인덱스, 없으면 -1을 반환하세요.\n    pass\n',
    c99: 'int first_index(const int a[], int n, int x) {\n    // x가 처음 등장하는 인덱스, 없으면 -1을 반환하세요.\n    return -1;\n}\n'
  };
  const grab = id => document.getElementById(id);
  let folio, cursor = 0, sending = false, sandbox, runnerClock, loadClock, generation = 0, locked = false, connecting;
  function restore() {
    try {
      const x = JSON.parse(localStorage.getItem(DRAWER));
      if (x?.edition !== 1 || !['py', 'c99'].includes(x.dialect) || !Number.isFinite(x.until) || !x.sheet || ![...leaves, 'cost'].every(key => typeof x.sheet[key] === 'string') || !x.drafts) return null;
      return x;
    } catch { return null; }
  }
  function persist() {
    try { localStorage.setItem(DRAWER, JSON.stringify(folio)); grab('save-note').textContent = '✓ 이 브라우저에 자동 저장됨 · ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); grab('save-note').classList.remove('is-error'); }
    catch { grab('save-note').textContent = '브라우저 저장에 실패했습니다. 창을 닫지 말고 답안을 따로 보관하세요.'; grab('save-note').classList.add('is-error'); }
  }
  function fresh() { return { edition: 1, until: Date.now() + 15 * 60 * 1000, sheet: { copper: '', jade: '', pebble: '', cedar: '', ink: starters.py, cost: '' }, dialect: 'py', drafts: { py: starters.py, c99: starters.c99 }, pass: null, sent: false, feedback: null }; }
  function filled(which) { return which === 'ink' ? !!folio.sheet.ink.trim() && folio.sheet.ink.trim() !== starters[folio.dialect].trim() : !!folio.sheet[which]?.trim(); }
  function updateRail() {
    grab('completion-label').textContent = leaves.filter(filled).length + ' / 5 작성';
    leaves.forEach((leaf, index) => {
      const jump = grab('jump-' + leaf);
      jump.classList.toggle('jump-done', filled(leaf));
      jump.setAttribute('aria-label', `${index + 1}번 ${labels[index]} ${filled(leaf) ? '작성함' : '미작성'}`);
    });
  }
  function turn(index, moveFocus = true) {
    cursor = Math.max(0, Math.min(4, index));
    document.querySelectorAll('[data-leaf]').forEach(node => { node.hidden = node.dataset.leaf !== leaves[cursor]; });
    leaves.forEach((leaf, n) => { const jump = grab('jump-' + leaf); if (n === cursor) jump.setAttribute('aria-current', 'step'); else jump.removeAttribute('aria-current'); });
    grab('previous-leaf').disabled = cursor === 0;
    grab('next-leaf').textContent = cursor === 4 ? '제출 확인 →' : '다음 문항 →';
    if (moveFocus) { const heading = document.querySelector('[data-leaf="' + leaves[cursor] + '"] h2'); heading.tabIndex = -1; heading.focus({ preventScroll: true }); if (innerWidth < 760) heading.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  }
  function paintInputs() {
    for (const key of ['copper', 'jade']) for (const radio of document.querySelectorAll(`input[name="${key}"]`)) radio.checked = radio.value === folio.sheet[key];
    for (const node of document.querySelectorAll('[data-entry]')) node.value = folio.sheet[node.dataset.entry] || '';
    grab('practice-dialect').value = folio.dialect;
    document.querySelectorAll('#workspace input, #workspace textarea, #workspace select, #restore-starter').forEach(node => { node.disabled = !!folio.sent; });
    grab('send-practice').disabled = !!folio.sent || sending;
  }
  function showWorkspace() { grab('welcome').hidden = true; grab('feedback-view').hidden = true; grab('workspace').hidden = false; paintInputs(); updateRail(); turn(0, false); tick(); }
  async function packet(body) {
    const response = await fetch(SERVICE, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, edition: EDITION }), signal: AbortSignal.timeout(55000) });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.problem || 'TEMPORARY_FAILURE'), { status: response.status });
    return data;
  }
  async function connect() {
    if (folio.pass) return;
    if (!connecting) {
      const current = folio;
      connecting = packet({ task: 'begin' }).then(opened => { if (folio === current) { folio.pass = opened.pass; persist(); } }).finally(() => { connecting = null; });
    }
    return connecting;
  }
  function friendly(error) {
    if (error.message === 'EDITION_CHANGED') return '문항이 1–4강 PPTX 발췌본으로 바뀌었습니다. 현재 답안을 내려받아 보관한 뒤 이 페이지를 새로고침해 새 체험을 시작해 주세요.';
    if (error.status === 429) return '채점 요청 한도 또는 대기 시간에 걸렸습니다. 잠시 뒤 다시 요청하거나 다음 날 체험해 주세요.';
    if (error.message === 'INVALID_PASS') return '체험 연결이 만료되었습니다. 답안은 보관되어 있습니다. 채점을 다시 요청하면 새 연결로 제출합니다.';
    return '지금 AI 채점에 연결하지 못했습니다. 답안은 이 브라우저에 보관되어 있습니다. 잠시 뒤 같은 답안으로 다시 요청해 주세요. 오류를 0점으로 처리하지 않습니다.';
  }
  function askSend() {
    if (sending || folio.sent) return;
    const missing = leaves.map((leaf, i) => filled(leaf) ? null : i + 1).filter(Boolean);
    grab('send-summary').textContent = missing.length ? `아직 작성하지 않은 문항: ${missing.join(', ')}번. 빈 답안은 0점으로 채점됩니다.` : '다섯 문항을 모두 작성했습니다. 시간 복잡도 설명도 확인해 주세요.';
    grab('send-dialog').showModal();
  }
  async function send(auto = false) {
    if (sending || folio.feedback) return;
    sending = true; locked = true; folio.sent = true; persist(); paintInputs(); stopRunner();
    grab('retry-feedback').hidden = true;
    const status = grab('submission-status'); status.classList.remove('is-error'); status.textContent = (auto ? '연습 시간이 끝났습니다. ' : '') + '답안을 제출하고 Gemini 피드백을 기다리는 중입니다…';
    try {
      await connect();
      const feedback = await packet({ task: 'assess', pass: folio.pass, dialect: folio.dialect, sheet: folio.sheet });
      if (feedback.edition !== EDITION || !Array.isArray(feedback.tiles) || !Number.isFinite(feedback.earned) || feedback.ceiling !== 14) throw Error('BAD_FEEDBACK');
      folio.feedback = feedback; persist(); showFeedback();
    } catch (error) { if (error.message === 'INVALID_PASS') { folio.pass = null; persist(); } status.textContent = friendly(error); status.classList.add('is-error'); grab('retry-feedback').hidden = false; }
    finally { sending = false; locked = false; }
  }
  function tick() {
    if (!folio || grab('workspace').hidden) return;
    const left = Math.max(0, Math.ceil((folio.until - Date.now()) / 1000));
    grab('practice-clock').textContent = `${Math.floor(left / 60).toString().padStart(2, '0')}:${(left % 60).toString().padStart(2, '0')}`;
    grab('practice-clock').classList.toggle('clock-urgent', left < 120);
    if (!left && !folio.sent && !sending) { grab('send-dialog').close(); send(true); }
  }
  function showFeedback() {
    grab('welcome').hidden = true; grab('workspace').hidden = true; grab('feedback-view').hidden = false;
    grab('score-summary').textContent = `${folio.feedback.earned} / 14점`;
    grab('feedback-note').textContent = folio.feedback.note;
    grab('feedback-tiles').replaceChildren();
    leaves.forEach((leaf, index) => {
      const rows = folio.feedback.tiles.filter(t => t.key === leaf || leaf === 'ink' && t.key === 'cost');
      const tile = document.createElement('section'); tile.className = 'result-tile';
      const heading = document.createElement('h2'), caption = document.createElement('span'), points = document.createElement('span');
      caption.textContent = `${index + 1}번 · ${labels[index]}`; points.textContent = rows.reduce((s, x) => s + x.earned, 0) + ' / ' + rows.reduce((s, x) => s + x.ceiling, 0) + '점';
      heading.append(caption, points); tile.append(heading);
      rows.forEach(row => { const text = document.createElement('p'); text.textContent = (row.key === 'cost' ? '시간 복잡도: ' : '') + row.tip; tile.append(text); });
      grab('feedback-tiles').append(tile);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function stopRunner() {
    clearTimeout(runnerClock); clearTimeout(loadClock);
    if (sandbox) sandbox.terminate(); sandbox = null;
    grab('try-examples').disabled = false; grab('stop-examples').hidden = true;
  }
  async function examples() {
    if (folio.sent) return;
    stopRunner(); const serial = ++generation;
    grab('try-examples').disabled = true; grab('stop-examples').hidden = false;
    grab('example-output').textContent = '실행 환경을 준비하고 있습니다…';
    sandbox = new Worker('sandbox.js?v=20261018-ch1-4');
    loadClock = setTimeout(() => { stopRunner(); grab('example-output').textContent = '실행 환경 다운로드 시간이 초과됐습니다. 네트워크를 확인한 뒤 다시 실행해 주세요.'; }, 90000);
    sandbox.onerror = () => { stopRunner(); grab('example-output').textContent = '실행 환경을 열지 못했습니다. 네트워크 상태를 확인하세요.'; };
    sandbox.onmessage = ({ data }) => {
      if (serial !== generation) return;
      if (data.kind === 'ready') {
        clearTimeout(loadClock);
        grab('example-output').textContent = '공개 예제를 실행하고 있습니다…';
        runnerClock = setTimeout(() => { stopRunner(); grab('example-output').textContent = '실행을 중단했습니다. 무한 반복이나 너무 오래 걸리는 코드인지 확인하세요.'; }, folio.dialect === 'py' ? 5000 : 25000);
        sandbox.postMessage({ dialect: folio.dialect, ink: folio.sheet.ink });
      } else if (data.kind === 'results' || data.kind === 'failure') { grab('example-output').textContent = data.text; stopRunner(); }
    };
    sandbox.postMessage({ launch: folio.dialect });
  }
  leaves.forEach((leaf, i) => {
    const jump = document.createElement('button'); jump.id = 'jump-' + leaf; jump.type = 'button';
    const number = document.createElement('span'), kind = document.createElement('span'); number.textContent = `${i + 1}번`; kind.textContent = labels[i]; kind.className = 'jump-kind'; jump.append(number, kind); jump.onclick = () => turn(i); grab('question-jumps').append(jump);
  });
  grab('begin-practice').onclick = () => {
    if (restore() && !confirm('저장한 체험을 지우고 새로 시작할까요? 본시험·코딩 실습 기록에는 영향이 없습니다.')) return;
    folio = fresh(); persist(); showWorkspace(); connect().catch(error => { grab('submission-status').textContent = '답안 작성은 가능합니다. ' + friendly(error); });
  };
  grab('resume-practice').onclick = () => {
    folio = restore(); if (!folio) return;
    if (folio.feedback) showFeedback(); else { showWorkspace(); if (folio.sent) { grab('submission-status').textContent = '제출한 답안이 저장되어 있습니다. 같은 답안으로 채점을 다시 요청할 수 있습니다.'; grab('retry-feedback').hidden = false; } }
  };
  document.querySelectorAll('#workspace input[type="radio"]').forEach(input => input.addEventListener('change', () => { if (folio.sent) return; folio.sheet[input.name] = input.value; persist(); updateRail(); }));
  document.querySelectorAll('[data-entry]').forEach(node => node.addEventListener('input', () => { if (folio.sent) return; folio.sheet[node.dataset.entry] = node.value; if (node.dataset.entry === 'ink') folio.drafts[folio.dialect] = node.value; persist(); updateRail(); }));
  grab('ink-answer').addEventListener('keydown', event => { if (event.key === 'Tab' && !folio.sent) { event.preventDefault(); const node = event.target; node.setRangeText('    ', node.selectionStart, node.selectionEnd, 'end'); node.dispatchEvent(new Event('input', { bubbles: true })); } });
  grab('practice-dialect').onchange = event => { stopRunner(); folio.drafts[folio.dialect] = folio.sheet.ink; folio.dialect = event.target.value; folio.sheet.ink = folio.drafts[folio.dialect] || starters[folio.dialect]; paintInputs(); persist(); updateRail(); };
  grab('restore-starter').onclick = () => { if (!confirm('현재 언어의 코드를 시작 코드로 되돌릴까요?')) return; folio.sheet.ink = starters[folio.dialect]; folio.drafts[folio.dialect] = folio.sheet.ink; paintInputs(); persist(); updateRail(); };
  grab('previous-leaf').onclick = () => turn(cursor - 1);
  grab('next-leaf').onclick = () => cursor === 4 ? askSend() : turn(cursor + 1);
  grab('send-practice').onclick = askSend;
  grab('cancel-send').onclick = () => grab('send-dialog').close();
  grab('confirm-send').onclick = () => { grab('send-dialog').close(); send(); };
  grab('retry-feedback').onclick = () => send();
  grab('try-examples').onclick = examples;
  grab('stop-examples').onclick = () => { generation++; stopRunner(); grab('example-output').textContent = '사용자가 실행을 중단했습니다.'; };
  grab('restart-practice').onclick = () => { if (confirm('이 브라우저의 체험 답안과 결과를 지우고 다시 시작할까요?')) { localStorage.removeItem(DRAWER); folio = null; grab('feedback-view').hidden = true; grab('welcome').hidden = false; grab('resume-practice').hidden = true; } };
  grab('download-practice').onclick = () => { const exportData = { practiceOnly: true, savedAt: new Date().toISOString(), dialect: folio.dialect, answers: folio.sheet, feedback: folio.feedback }; const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'algorithm-preview-my-answers.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  grab('download-draft').onclick = grab('download-practice').onclick;
  grab('resume-practice').hidden = !restore();
  setInterval(tick, 1000);
  window.addEventListener('beforeunload', event => { if (sending || locked) { event.preventDefault(); event.returnValue = ''; } });
})();
