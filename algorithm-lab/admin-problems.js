// Public problem metadata only. Student records still come from admin-dashboard.
let adminProblemCatalog = Array.from({length:89}, (_, i) => {
  const id = 'P' + String(i + 1).padStart(2, '0');
  return {id, title:id, chapter:i < 12 ? 1 : i < 46 ? 2 : i < 56 ? 3 : i < 66 || i >= 86 ? 4 : i < 76 ? 5 : 6};
}).filter(p => !LAB_DUPLICATES[p.id] && !LAB_RETIRED[p.id] && !['P61','P63','P64'].includes(p.id));
let adminCatalogRequest = null;

function setAdminProblemCatalog(banks) {
  adminProblemCatalog = [...new Map(banks.flat().filter(p => !LAB_DUPLICATES[p.id] && !LAB_RETIRED[p.id])
    .map(p => [p.id, {id:p.id, title:p.title, chapter:p.chapter || 1, exercise:p.exercise}])).values()]
    .sort((a, b) => a.chapter - b.chapter || Number(!!b.exercise) - Number(!!a.exercise)
      || (a.exercise || Number(a.id.slice(1))) - (b.exercise || Number(b.id.slice(1))));
}
function loadAdminProblemCatalog() {
  if (!adminCatalogRequest) adminCatalogRequest = Promise.all(['problems.json','chapter-02.json','exercise-problems.json'].map(async file => {
    const response = await fetch(file + '?v=20261012-problem-view', {signal:AbortSignal.timeout(20000)});
    if (!response.ok) throw Error(T('문제 파일을 불러오지 못했습니다. 페이지를 새로고침하세요.'));
    return response.json();
  })).then(setAdminProblemCatalog).catch(error => { adminCatalogRequest = null; throw error; });
  return adminCatalogRequest;
}
function problemProgress(student, id) {
  // Never promote an older, duplicate exercise to a pass on the current tests.
  const records = (student.problems || []).filter(p => p.problem === id);
  const solved = records.some(p => p.solved);
  const dates = records.map(p => Date.parse(p.last_submit)).filter(Number.isFinite);
  return {
    student, state:solved ? 'solved' : records.length ? 'attempted' : 'not-submitted',
    languages:[...new Set(records.filter(p => p.solved).map(p => p.language))].sort(),
    attempts:records.reduce((sum, p) => sum + (Number(p.attempts) || 0), 0),
    lastSubmit:dates.length ? new Date(Math.max(...dates)).toISOString() : null
  };
}
function problemSummary(problem, people) {
  const rows = people.map(student => problemProgress(student, problem.id));
  return {problem, rows, solved:rows.filter(r => r.state === 'solved'),
    attempted:rows.filter(r => r.state === 'attempted'), notSubmitted:rows.filter(r => r.state === 'not-submitted')};
}
function csvCell(value) {
  return '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"','""') + '"';
}
function downloadAdminCsv(filename, rows) {
  const text = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + text], {type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
