(() => {
  'use strict';
  const SERVICE = 'https://algorithm-rehearsal.vercel.app/api/feedback';
  const EDITION = 'rehearsal-20261018-ch1-4';
  const FEEDBACK_NOTE = 'Gemini가 답안과 코드를 읽고 채점한 결과입니다. 점수는 체험용으로만 사용합니다.';
  const DRAWER = 'algorithm-rehearsal-20261018-ch1-4';
  const leaves = ['copper', 'jade', 'pebble', 'cedar', 'ink'];
  const labels = ['객관식', '객관식', '단답형', '서술형', '코딩형'];
  const starters = {
    py: 'def first_index(a, x):\n    # x가 처음 등장하는 인덱스, 없으면 -1을 반환하세요.\n    pass\n',
    c99: 'int first_index(const int a[], int n, int x) {\n    // x가 처음 등장하는 인덱스, 없으면 -1을 반환하세요.\n    return -1;\n}\n'
  };
  const solutions = {
    copper: {
      answer: '④ n−1번',
      steps: ['첫 번째 원소를 지금까지의 최댓값으로 정합니다. 이때는 다른 원소와 비교하지 않습니다.', '두 번째 원소부터 마지막 원소까지, 지금까지의 최댓값과 한 번씩 비교합니다. 원소가 n개이므로 비교할 원소는 n−1개입니다.', '예를 들어 원소가 4개면 두 번째·세 번째·네 번째 원소를 비교하므로 총 3번입니다. 원소가 1개면 비교는 0번입니다.'],
      criteria: '④를 고르면 2점, 다른 선택이나 미응답은 0점입니다.'
    },
    jade: {
      answer: '③ 두 부분 배열이 각각 정렬되어 있어야 합니다.',
      steps: ['병합은 두 부분 배열의 맨 앞 원소를 비교하고, 더 작은 원소부터 결과에 옮기는 과정입니다.', '이 방법이 성립하려면 각 부분 배열 안에서는 이미 작은 값부터 나열되어 있어야 합니다. 그래야 맨 앞 원소가 그 부분에서 남은 최솟값입니다.', '예를 들어 [1, 4]와 [2, 3]을 병합하면 1 → 2 → 3 → 4가 됩니다. 반면 [4, 1]과 [2, 3]에 같은 절차를 적용하면 2 → 3 → 4 → 1이 되어 정렬에 실패합니다.'],
      criteria: '③을 고르면 2점, 다른 선택이나 미응답은 0점입니다.'
    },
    pebble: {
      answer: '10,000회',
      steps: ['네 자리 각각에 0부터 9까지 10개 숫자를 넣을 수 있습니다. 첫 자리가 0인 0000, 0001 등도 모두 포함합니다.', '첫 자리를 하나 정할 때마다 나머지 세 자리의 모든 조합을 시도합니다. 따라서 전체 후보 수는 10 × 10 × 10 × 10 = 10,000개입니다.', '0000도 첫 번째 시도입니다. 마지막 숫자 표기가 9999라고 해서 시도 횟수가 9999인 것은 아닙니다. 0부터 9999까지의 정수 개수가 10,000개인 것과 같습니다.'],
      criteria: '10000, 10,000, 10⁴, 10×10×10×10, 만 회처럼 같은 값을 나타내면 2점입니다. 정답만 써도 2점이며, 다른 값이나 미응답은 0점입니다.'
    },
    cedar: {
      answer: '(18, 12) → (12, 6) → (6, 0), 최대공약수 6',
      steps: ['처음에는 a=18, b=12입니다. 18을 12로 나눈 나머지는 6이므로 다음 쌍은 (12, 6)입니다.', '다음에는 12를 6으로 나눕니다. 나머지가 0이므로 다음 쌍은 (6, 0)입니다.', 'b가 0이 되어 반복을 끝내고 a를 반환합니다. 이때 a=6이므로 최대공약수는 6입니다. 쌍을 갱신할 때는 이전 a와 b를 기준으로 (b, a%b)를 함께 계산합니다.'],
      criteria: '(18,12), (12,6), (6,0)를 올바른 순서로 쓰면 각 1점, 최대공약수 6을 쓰면 1점으로 총 4점입니다. 같은 뜻의 문장 표현도 인정합니다.'
    },
    ink: {
      answer: '앞에서부터 찾다가 처음 같은 값을 만나는 즉시 그 인덱스를 반환합니다.',
      steps: ['인덱스는 0부터 시작합니다. 예를 들어 a=[8, 3, 3], x=3이면 답은 1입니다. 값 3이나 두 번째 등장 위치 2를 반환하면 요구한 답과 다릅니다.', 'a[i]가 x와 같으면 바로 i를 반환합니다. 즉시 함수를 끝내므로 같은 값이 뒤에 또 있어도 첫 등장 위치가 유지됩니다.', '반복이 끝날 때까지 찾지 못하면 -1을 반환합니다. 빈 배열에서도 반복을 한 번도 하지 않고 -1을 반환합니다. 아래 코드는 배열의 원소를 읽기만 하므로 입력 배열이 바뀌지 않습니다.'],
      criteria: '올바른 범위의 원소 검색 1점, 첫 일치의 0부터 센 인덱스 반환 1점, 미발견·빈 배열에서 -1 반환 및 입력 배열 유지 1점입니다.',
      code: {
        py: 'def first_index(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1',
        c99: 'int first_index(const int a[], int n, int x) {\n    for (int i = 0; i < n; i++) {\n        if (a[i] == x) {\n            return i;\n        }\n    }\n    return -1;\n}'
      }
    },
    cost: {
      answer: '위 참고 코드의 최악 시간 복잡도는 O(n)입니다.',
      steps: ['x가 없거나 마지막 원소에서 발견되면 n개 원소를 모두 비교합니다. 원소 수가 두 배가 되면 최대 비교 횟수도 두 배가 되므로 O(n)입니다.', '첫 원소에서 찾으면 한 번 만에 끝나지만, 문제는 가장 오래 걸리는 경우를 묻습니다. 따라서 최선의 경우 O(1)만 쓰면 이 질문의 답이 되지 않습니다.'],
      criteria: '제출한 코드에 맞는 최악 시간 복잡도와 근거를 함께 쓰면 1점입니다. 다른 구현도 그 구현에 맞게 설명하면 인정하며, 코드나 설명이 비면 0점입니다.'
    }
  };
  const grab = id => document.getElementById(id);
  let folio, cursor = 0, sending = false, sandbox, runnerClock, loadClock, generation = 0, locked = false, connecting, retryClock;
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
    const response = await fetch(SERVICE, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, edition: EDITION }), signal: AbortSignal.timeout(155000) });
    const data = await response.json().catch(() => ({ problem: 'TEMPORARY_FAILURE' }));
    if (!response.ok) throw Object.assign(new Error(data.problem || 'TEMPORARY_FAILURE'), { status: response.status, retryable: data.retryable,
      retryAfterSeconds: Math.max(Number(data.retryAfterSeconds) || 0, Number(response.headers.get('Retry-After')) || 0) });
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
    return '채점 서버에 연결하지 못했습니다. 작성한 답안은 그대로 유지됩니다. 잠시 뒤 다시 요청해 주세요.';
  }
  function askSend() {
    if (sending || folio.sent) return;
    const missing = leaves.map((leaf, i) => filled(leaf) ? null : i + 1).filter(Boolean);
    grab('send-summary').textContent = missing.length ? `아직 작성하지 않은 문항: ${missing.join(', ')}번. 빈 답안은 0점으로 채점됩니다.` : '다섯 문항을 모두 작성했습니다. 시간 복잡도 설명도 확인해 주세요.';
    grab('send-dialog').showModal();
  }
  function pending() { return folio?.sent && !folio.feedback; }
  function retryStatus() {
    if (!pending() || sending) return;
    grab('pause-feedback').hidden = false; grab('retry-help').hidden = false;
    grab('pause-feedback').textContent = folio.retryPaused ? '자동 재시도 이어가기' : '자동 재시도 일시정지';
    if (folio.retryPaused) {
      if (!grab('submission-status').classList.contains('is-error')) grab('submission-status').textContent = '자동 재시도를 멈췄습니다. 답안은 보관되어 있습니다.';
      return;
    }
    const left = Math.max(0, Math.ceil(((folio.nextRetryAt || Date.now()) - Date.now()) / 1000));
    if (left >= 3600) {
      const when = new Date(folio.nextRetryAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const reason = ['DAILY_LIMIT', 'PROVIDER_DAILY_LIMIT'].includes(folio.lastIssue) ? '채점 API의 오늘 사용 한도에 도달했습니다.' : '채점 API에서 지정한 시간까지 대기합니다.';
      grab('submission-status').textContent = `${reason} 다음 자동 요청: ${when}. 답안은 저장했습니다.`;
      return;
    }
    const wait = left >= 3600 ? `${Math.ceil(left / 3600)}시간` : left >= 60 ? `${Math.floor(left / 60)}분 ${left % 60}초` : `${left}초`;
    const lead = navigator.onLine === false ? '인터넷 연결을 기다리고 있습니다.' : ['DAILY_LIMIT', 'PROVIDER_DAILY_LIMIT'].includes(folio.lastIssue) ? '채점 API의 오늘 사용 한도에 도달했습니다.' : folio.lastIssue === 'PROVIDER_BUSY' ? '채점 API의 다음 요청을 기다리고 있습니다.' : 'Gemini 응답을 기다리고 있습니다.';
    grab('submission-status').textContent = `${lead} ${wait} 뒤 자동으로 다시 요청합니다.`;
  }
  function resumePending() {
    clearTimeout(retryClock);
    if (!pending() || sending) return;
    retryStatus();
    if (folio.retryPaused) return;
    const delay = Math.max(0, (folio.nextRetryAt || 0) - Date.now());
    retryClock = setTimeout(() => { if (pending() && !folio.retryPaused) send(); }, Math.min(delay, 86400000));
  }
  function defer(error) {
    folio.retryAttempt = (folio.retryAttempt || 0) + 1;
    folio.lastIssue = error.message || 'NETWORK_ERROR';
    const backoff = Math.min(120000, 15000 * 2 ** Math.min(3, folio.retryAttempt - 1));
    folio.nextRetryAt = Date.now() + Math.max(backoff, (error.retryAfterSeconds || 0) * 1000);
    folio.retryPaused = false;
    persist();
    grab('submission-status').classList.remove('is-error');
    grab('retry-feedback').hidden = false; grab('retry-feedback').textContent = '지금 다시 요청';
  }
  async function send(auto = false) {
    if (sending || folio.feedback) return;
    clearTimeout(retryClock);
    sending = true; locked = true; folio.sent = true; persist(); paintInputs(); stopRunner();
    if (navigator.onLine === false) {
      sending = false; locked = false; defer(new Error('OFFLINE')); resumePending(); return;
    }
    grab('retry-feedback').hidden = true;
    const status = grab('submission-status'); status.classList.remove('is-error'); status.textContent = (auto ? '연습 시간이 끝났습니다. ' : '') + '답안을 제출하고 Gemini 피드백을 기다리는 중입니다…';
    try {
      await connect();
      const feedback = await packet({ task: 'assess', pass: folio.pass, dialect: folio.dialect, sheet: folio.sheet });
      if (feedback.edition !== EDITION || !Array.isArray(feedback.tiles) || !Number.isFinite(feedback.earned) || feedback.ceiling !== 14) throw Error('BAD_FEEDBACK');
      folio.feedback = feedback; persist(); showFeedback();
    } catch (error) {
      if (error.message === 'INVALID_PASS') folio.pass = null;
      const retryable = error.retryable ?? (!error.status || [401, 429, 500, 502, 503, 504].includes(error.status));
      if (retryable && !['EDITION_CHANGED', 'MODEL_MISMATCH', 'BAD_SHEET', 'FEEDBACK_NOT_CONFIGURED'].includes(error.message)) defer(error);
      else {
        folio.retryPaused = true; folio.lastIssue = error.message; persist();
        status.textContent = error.message === 'MODEL_MISMATCH' || error.message === 'FEEDBACK_NOT_CONFIGURED' ? '채점 서버 설정 확인이 필요합니다. 답안은 보관했습니다.' : friendly(error);
        status.classList.add('is-error'); grab('retry-feedback').hidden = false;
      }
    }
    finally { sending = false; locked = false; if (pending()) resumePending(); }
  }
  function tick() {
    if (!folio || grab('workspace').hidden) return;
    const left = Math.max(0, Math.ceil((folio.until - Date.now()) / 1000));
    grab('practice-clock').textContent = `${Math.floor(left / 60).toString().padStart(2, '0')}:${(left % 60).toString().padStart(2, '0')}`;
    grab('practice-clock').classList.toggle('clock-urgent', left < 120);
    retryStatus();
    if (!left && !folio.sent && !sending) { grab('send-dialog').close(); send(true); }
  }
  function showFeedback() {
    clearTimeout(retryClock);
    grab('welcome').hidden = true; grab('workspace').hidden = true; grab('feedback-view').hidden = false;
    grab('score-summary').textContent = `${folio.feedback.earned} / 14점`;
    grab('feedback-note').textContent = FEEDBACK_NOTE;
    grab('feedback-tiles').replaceChildren();
    leaves.forEach((leaf, index) => {
      const rows = folio.feedback.tiles.filter(t => t.key === leaf || leaf === 'ink' && t.key === 'cost');
      const tile = document.createElement('section'); tile.className = 'result-tile';
      const heading = document.createElement('h2'), caption = document.createElement('span'), points = document.createElement('span');
      caption.textContent = `${index + 1}번 · ${labels[index]}`; points.textContent = rows.reduce((s, x) => s + x.earned, 0) + ' / ' + rows.reduce((s, x) => s + x.ceiling, 0) + '점';
      heading.append(caption, points); tile.append(heading);
      rows.forEach(row => {
        const part = document.createElement('div'); part.className = 'feedback-part';
        const title = document.createElement('h3'); title.textContent = (row.key === 'cost' ? '시간 복잡도' : '내 답안 피드백') + ` · ${row.earned}/${row.ceiling}점`; part.append(title);
        const answerLabel = document.createElement('p'); answerLabel.className = 'answer-label'; answerLabel.textContent = '내가 제출한 답안'; part.append(answerLabel);
        const submitted = document.createElement(row.key === 'ink' ? 'pre' : 'blockquote'); submitted.className = 'submitted-answer';
        const choice = ['copper', 'jade'].includes(row.key) ? Array.from(document.querySelectorAll(`input[name="${row.key}"]`)).find(input => input.value === folio.sheet[row.key]) : null;
        submitted.textContent = choice ? choice.closest('label').textContent.trim() : folio.sheet[row.key] || '(미응답)'; part.append(submitted);
        const text = document.createElement('p'); text.className = 'personal-feedback'; text.textContent = row.tip; part.append(text);
        const reference = solutions[row.key], explanation = document.createElement('div'); explanation.className = 'reference-answer';
        const correct = document.createElement('h4'); correct.textContent = '풀이 · ' + reference.answer; explanation.append(correct);
        const steps = document.createElement('ol');
        reference.steps.forEach(step => { const item = document.createElement('li'); item.textContent = step; steps.append(item); }); explanation.append(steps);
        if (reference.code) {
          const codeLabel = document.createElement('p'); codeLabel.textContent = (folio.dialect === 'py' ? 'Python' : 'C') + ' 참고 코드'; explanation.append(codeLabel);
          const pre = document.createElement('pre'), code = document.createElement('code'); code.textContent = reference.code[folio.dialect]; pre.append(code); explanation.append(pre);
        }
        const criteria = document.createElement('p'); criteria.className = 'score-criteria'; criteria.textContent = '채점 기준: ' + reference.criteria; explanation.append(criteria);
        part.append(explanation); tile.append(part);
      });
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
    if (folio.feedback) showFeedback(); else { showWorkspace(); if (folio.sent) { grab('retry-feedback').hidden = false; resumePending(); } }
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
  grab('retry-feedback').onclick = () => { folio.retryPaused = false; folio.nextRetryAt = 0; persist(); send(); };
  grab('pause-feedback').onclick = () => {
    folio.retryPaused = !folio.retryPaused; clearTimeout(retryClock); persist();
    grab('pause-feedback').textContent = folio.retryPaused ? '자동 재시도 이어가기' : '자동 재시도 일시정지';
    if (folio.retryPaused) grab('submission-status').textContent = '자동 재시도를 멈췄습니다. 답안은 보관되어 있습니다.';
    else resumePending();
  };
  grab('try-examples').onclick = examples;
  grab('stop-examples').onclick = () => { generation++; stopRunner(); grab('example-output').textContent = '사용자가 실행을 중단했습니다.'; };
  grab('restart-practice').onclick = () => { if (confirm('이 브라우저의 체험 답안과 결과를 지우고 다시 시작할까요?')) { localStorage.removeItem(DRAWER); folio = null; grab('feedback-view').hidden = true; grab('welcome').hidden = false; grab('resume-practice').hidden = true; } };
  grab('download-practice').onclick = () => { const exportData = { practiceOnly: true, savedAt: new Date().toISOString(), dialect: folio.dialect, answers: folio.sheet, feedback: folio.feedback }; const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'algorithm-preview-my-answers.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  grab('download-draft').onclick = grab('download-practice').onclick;
  grab('resume-practice').hidden = !restore();
  const saved = restore();
  if (saved?.sent && !saved.feedback) { folio = saved; showWorkspace(); grab('retry-feedback').hidden = false; resumePending(); }
  setInterval(tick, 1000);
  window.addEventListener('online', () => { if (pending() && folio.lastIssue === 'OFFLINE') folio.nextRetryAt = 0; resumePending(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) resumePending(); });
  window.addEventListener('beforeunload', event => { if (sending || locked) { event.preventDefault(); event.returnValue = ''; } });
})();
