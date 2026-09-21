let hintPending = false, hintVersion = 0, lastHintRun = null;
function resetAIHint() {
  hintVersion++;
  const output = document.getElementById('ai-hint-result');
  if (output) { output.textContent = ''; output.hidden = true; }
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
  if (hintPending || busy || !cloud.session || cloud.expired || !problems[index]) return;
  const p = problems[index], code = getCode(), version = ++hintVersion;
  const account = cloud.session.student.id;
  const output = document.getElementById('ai-hint-result');
  hintPending = true; controls(); output.hidden = false; output.textContent = T('작은 힌트를 생각하고 있어요…');
  const matching = lastHintRun?.pid === p.id && lastHintRun.language === language && lastHintRun.code === code;
  try {
    const data = await labRequest('ai-hint', {
      problem:p.id, language, locale:UI_LOCALE, code,
      statement:[p.title, p.statement, language === 'c' ? C_PROBLEMS[p.id].statement : ''].filter(Boolean).join('\n'),
      execution:matching ? lastHintRun.execution : 'This current code has not been run. Do not assume any previous error still applies.',
    });
    if (version === hintVersion && cloud.session?.student.id === account) output.textContent = data.hint;
  } catch (error) {
    if (version === hintVersion && cloud.session?.student.id === account) output.textContent = error.status ? error.message : T('AI 힌트를 받지 못했습니다. 잠시 후 다시 시도하세요.');
  } finally { hintPending = false; controls(); }
}
document.getElementById('ai-hint').onclick = requestAIHint;
