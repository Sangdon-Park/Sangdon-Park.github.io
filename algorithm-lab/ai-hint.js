let hintPending = false, hintVersion = 0, lastHintRun = null, hintController = null, hintTimer = null;
const AI_HINT_KEY = 'dju-algolab-ai-hints-v2';
let hintState = {contexts:{}, cooldowns:{}};
try {
  const stored = JSON.parse(sessionStorage.getItem(AI_HINT_KEY));
  if (stored?.contexts && typeof stored.contexts === 'object' && !Array.isArray(stored.contexts) && stored?.cooldowns && typeof stored.cooldowns === 'object' && !Array.isArray(stored.cooldowns)) hintState = stored;
} catch (_) {}
function saveAIHints() {
  // Keep this tab's hints across refreshes. Never store student code in this cache.
  hintState.contexts = Object.fromEntries(Object.entries(hintState.contexts).slice(-80));
  try { sessionStorage.setItem(AI_HINT_KEY, JSON.stringify(hintState)); } catch (_) {}
}
function aiHintContextKey() {
  const account = cloud.session?.student.id, p = problems[index];
  return account && p ? [account, p.id, language, UI_LOCALE].join(':') : null;
}
function aiHintContext() {
  const key = aiHintContextKey();
  if (!key) return {hints:[], count:0};
  const data = hintState.contexts[key];
  if (!data || !Array.isArray(data.hints) || data.hints.length > 10 || !Number.isInteger(data.count) || data.count < data.hints.length || data.count > 100 || data.hints.some(h => typeof h !== 'string' || !h.trim() || h.length > 640)) return hintState.contexts[key] = {hints:[], count:0};
  return data;
}
function aiHintWait() {
  const until = hintState.cooldowns[cloud.session?.student.id];
  return Number.isFinite(until) ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0;
}
function aiHintControls() {
  const button = document.getElementById('ai-hint'), count = aiHintContext().count, wait = aiHintWait();
  button.disabled = hintPending || busy || !cloud.session || cloud.expired || wait > 0 || count >= 100;
  button.textContent = hintPending ? T('AI 힌트 요청 중…') : wait ? T('다음 힌트까지') + ' ' + (wait >= 60 ? Math.ceil(wait / 60) + T('분') : wait + T('초')) : count ? T('다음 AI 힌트 받기') : T('AI 힌트 받기');
  clearTimeout(hintTimer);
  if (wait && cloud.session && !cloud.expired) hintTimer = setTimeout(aiHintControls, wait >= 60 ? 10000 : 1000);
}
function renderAIHints() {
  const list = document.getElementById('ai-hint-history');
  if (!list) return;
  list.replaceChildren();
  const {hints, count} = aiHintContext();
  for (const [i, text] of hints.entries()) {
    const card = document.createElement('details'), label = document.createElement('summary'), content = document.createElement('p');
    label.textContent = T('받은 힌트') + ' ' + (count - hints.length + i + 1);
    content.textContent = text; card.open = i === hints.length - 1; card.append(label, content); list.append(card);
  }
  list.hidden = !hints.length;
  aiHintControls();
}
function resetAIHint() {
  hintVersion++;
  hintController?.abort(); hintController = null; hintPending = false;
  const output = document.getElementById('ai-hint-result');
  if (output) { output.textContent = ''; output.hidden = true; }
  // Editing invalidates the pending response, but keeps accepted hints as context.
  renderAIHints();
}
function rememberHintRun(report) {
  // Only actual diagnostics and pass counts; never hidden test inputs or answers.
  const details = [...(report.diagnostics || []), ...(report.rows || []).map(r => r.diagnostic).filter(Boolean)];
  const execution = JSON.stringify({
    error: report.errorSummary || (details.length ? undefined : report.error),
    passed: report.passed, total: report.total,
    diagnostics: details.slice(0, 4).map(d => ({line:d.line, column:d.column, message:d.message})),
  }).slice(0, 4000);
  lastHintRun = {pid:job.pid, language:job.language, code:job.code, execution};
}
async function requestAIHint() {
  if (hintPending || busy || !cloud.session || cloud.expired || !problems[index] || aiHintWait() || aiHintContext().count >= 100) return;
  const p = problems[index], code = getCode(), version = ++hintVersion, key = aiHintContextKey();
  const account = cloud.session.student.id, lang = language, context = aiHintContext();
  const output = document.getElementById('ai-hint-result'), controller = new AbortController();
  hintController = controller; hintPending = true;
  hintState.cooldowns[account] = Date.now() + 15000; saveAIHints(); controls();
  output.hidden = false; output.textContent = T('현재 코드에 맞는 다음 힌트를 생각하고 있어요…');
  const timeout = setTimeout(() => controller.abort(), 28000);
  const matching = lastHintRun?.pid === p.id && lastHintRun.language === lang && lastHintRun.code === code;
  const current = () => version === hintVersion && key === aiHintContextKey() && code === getCode();
  try {
    const data = await labRequest('ai-hint', {
      problem:p.id, language:lang, locale:UI_LOCALE, code,
      statement:[p.title, p.statement, lang === 'java' ? javaView(p).signature : lang === 'c' ? C_PROBLEMS[p.id].statement : ''].filter(Boolean).join('\n'),
      execution:matching ? lastHintRun.execution : 'This current code has not been run. Do not assume any previous error still applies.',
      history:context.hints.slice(-10), step:context.count + 1,
    }, cloud.session.token, {signal:controller.signal});
    if (!current()) return;
    const normalize = text => text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]/gu, '');
    if (typeof data.hint !== 'string' || !data.hint.trim() || data.hint.length > 640 || context.hints.some(h => normalize(h) === normalize(data.hint))) throw new Error('Repeated or invalid hint');
    context.hints = [...context.hints, data.hint.trim()].slice(-10); context.count++;
    saveAIHints(); renderAIHints(); output.textContent = ''; output.hidden = true;
  } catch (error) {
    if (!current()) return;
    if (error.status === 429 && Number.isFinite(error.retryAfter)) { hintState.cooldowns[account] = Date.now() + Math.min(86400, Math.max(1, error.retryAfter)) * 1000; saveAIHints(); }
    output.textContent = error.status ? error.message : T('AI 힌트를 받지 못했습니다. 잠시 후 다시 시도하세요.');
  } finally {
    clearTimeout(timeout);
    if (version === hintVersion) { hintPending = false; hintController = null; controls(); }
  }
}
document.getElementById('ai-hint').onclick = requestAIHint;
