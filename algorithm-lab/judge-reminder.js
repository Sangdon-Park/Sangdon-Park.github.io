let pendingPracticeMove = null;
function needsJudgeReminder() {
  const p = problems[index];
  if (!p || !cloud.session || cloud.expired) return false;
  const code = getCode(), key = answerKey(p.id);
  return !!code.trim() && code.trim() !== starter(p).trim()
    && saved.judged?.[key] !== code && saved.passed?.[key]?.code !== code;
}
function rememberJudgedAnswer(attempt) {
  if (attempt.mode !== 'judge') return;
  const key = attempt.language === 'python' ? attempt.pid : attempt.language + ':' + attempt.pid;
  saved.judged = {...saved.judged, [key]:attempt.code};
  persist();
}
function requestPracticeMove(move) {
  if (busy) return;
  if (!needsJudgeReminder()) { move(); return; }
  pendingPracticeMove = move;
  document.getElementById('reminder-judge').disabled = !ready;
  document.getElementById('judge-reminder').showModal();
}
function moveToProblem(i) {
  if (i === index) return;
  requestPracticeMove(() => show(i));
}
document.getElementById('reminder-stay').onclick = () => document.getElementById('judge-reminder').close();
document.getElementById('reminder-continue').onclick = () => {
  const move = pendingPracticeMove;
  document.getElementById('judge-reminder').close();
  pendingPracticeMove = null;
  if (move) move();
};
document.getElementById('reminder-judge').onclick = () => {
  document.getElementById('judge-reminder').close();
  pendingPracticeMove = null;
  run('judge');
};
document.getElementById('judge-reminder').addEventListener('close', () => {
  // A queued close event must not cancel a newer navigation dialog.
  if (!document.getElementById('judge-reminder').open) pendingPracticeMove = null;
});
