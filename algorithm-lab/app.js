const $ = id => document.getElementById(id);
const KEY = 'dju-algorithm-lab-v1';
let problems=[], index=0, worker=null, ready=false, busy=false, timer=null, advance=null, token=0, job=null;
let saved={answers:{},passed:{},student:'',index:0};
try { const item=JSON.parse(localStorage.getItem(KEY)); if(item) saved={...saved,...item}; } catch (_) {}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(_){$('result').textContent='브라우저 저장 공간을 사용할 수 없습니다. 답안을 내려받아 보관하세요.';}}
function setResult(text,kind=''){ $('result').textContent=text; $('result').className=kind; }
function controls(){ $('judge').disabled=$('sample').disabled=!ready||busy; $('stop').hidden=!busy; $('code').readOnly=busy; document.body.classList.toggle('busy',busy); }
function boot(){
  if(worker) worker.terminate(); clearTimeout(timer); ready=false;busy=false;controls();$('engine').textContent='Python 준비 중…';$('retry').hidden=true;
  worker=new Worker('worker.js?v=20260914-paste1');
  const mine=worker;
  timer=setTimeout(()=>{if(worker!==mine)return;mine.terminate();$('engine').textContent='연결 지연';$('retry').hidden=false;setResult('Python을 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 연결을 눌러주세요.','error');},90000);
  worker.onmessage=({data})=>{
    if(worker!==mine)return;
    if(data.type==='ready'){clearTimeout(timer);ready=true;$('engine').textContent='● Python 실행 준비 완료';controls();return;}
    if(data.type==='boot-error'){clearTimeout(timer);$('engine').textContent='연결 실패';$('retry').hidden=false;setResult('Python 실행 환경을 받지 못했습니다. 다시 연결을 눌러주세요.','error');return;}
    if(data.type==='result'&&job&&data.token===job.token){clearTimeout(timer);busy=false;controls();finish(data.report);}
  };
  worker.onerror=()=>{clearTimeout(timer);busy=false;ready=false;controls();$('retry').hidden=false;$('engine').textContent='실행 환경 오류';setResult('실행 환경에 오류가 났습니다. 답안은 저장되어 있습니다. 다시 연결을 눌러주세요.','error');};
}
function renderNav(){
  $('problems').replaceChildren();
  for(let i=0;i<problems.length;i++){
    const p=problems[i], b=document.createElement('button');
    const ok=saved.passed[p.id]&&saved.passed[p.id].code===saved.answers[p.id];
    b.textContent=`${ok?'✓':'○'} ${p.id} ${p.title}`;b.className=(i===index?'active ':'')+(ok?'solved':'');
    b.onclick=()=>{if(!busy)show(i);};$('problems').append(b);
  }
  const count=problems.filter(p=>saved.passed[p.id]&&saved.passed[p.id].code===saved.answers[p.id]).length;
  $('progress').textContent=`${count} / ${problems.length} 해결`;
}
function show(i){
  clearTimeout(advance);index=i;saved.index=i;persist();const p=problems[i];
  $('title').textContent=p.title;$('meta').textContent=`${p.id} · ${p.section} · PPT ${p.slides}`;$('level').textContent=p.level;
  $('statement').textContent=p.statement;$('hint').textContent=p.hint;$('code').value=saved.answers[p.id]??p.starter;
  $('examples').replaceChildren();
  for(const [j,t] of p.tests.filter(t=>t.public).entries()){
    const pre=document.createElement('pre');pre.textContent=`예시 ${j+1}\n입력: ${p.function}(${t.args.map(x=>JSON.stringify(x)).join(', ')})\n반환: ${JSON.stringify(t.expected).replaceAll('null','None')}`;$('examples').append(pre);
  }
  $('case-results').replaceChildren();$('repair-note').hidden=true;$('next').hidden=true;setResult('코드를 작성한 뒤 예시 실행 또는 채점하기를 누르세요.');renderNav();
}
function run(mode){
  if(!ready||busy)return;clearTimeout(advance);const p=problems[index];const code=$('code').value;
  saved.answers[p.id]=code;persist();busy=true;controls();$('next').hidden=true;$('case-results').replaceChildren();setResult(mode==='sample'?'공개 예시 실행 중…':'전체 검사로 채점 중…');
  job={token:++token,pid:p.id,index,mode,code};
  timer=setTimeout(()=>{busy=false;ready=false;worker.terminate();controls();$('retry').hidden=false;$('engine').textContent='실행 중단';setResult('시간 제한을 넘겨 중단했습니다. while 조건과 low/high 갱신을 확인하세요. 답안을 수정한 뒤 다시 연결을 눌러주세요.','error');},6000);
  worker.postMessage({token:job.token,code,problem:p,cases:mode==='sample'?p.tests.filter(t=>t.public):p.tests});
}
function finish(report){
  if(report.normalizedCount){
    job.code=report.normalizedCode;$('code').value=job.code;saved.answers[job.pid]=job.code;persist();
    $('repair-note').textContent=`붙여넣기에 섞인 특수 공백 ${report.normalizedCount}개를 정리했습니다. 문자열과 주석은 그대로 유지했습니다.`;
    $('repair-note').hidden=false;renderNav();
  }
  if(report.error){setResult(report.error,'error');return;}
  const success=report.passed===report.total;
  for(const r of report.rows){const row=document.createElement('p');row.textContent=`${r.ok?'✓':'✗'} ${r.public?'공개 예시':'추가 검사'} ${r.number}${r.ok?' 통과':'\n입력: '+r.input+'\n'+r.message}`;$('case-results').append(row);}
  if(job.mode==='sample'){setResult(`예시 ${report.passed}/${report.total} 통과. 전체 검사는 채점하기로 확인하세요.`,success?'success':'error');return;}
  if(success){
    saved.passed[job.pid]={code:job.code,passed:report.passed,total:report.total,at:new Date().toISOString()};persist();renderNav();
    const all=problems.every(p=>saved.passed[p.id]&&saved.passed[p.id].code===saved.answers[p.id]);
    setResult(all?'🎉 12문제를 모두 해결했습니다! 답안·결과를 내려받아 LMS에 제출하세요.':`✅ 통과! ${report.passed}/${report.total}개 검사 성공.`, 'success');
    let next=problems.findIndex((p,i)=>i>index&&!(saved.passed[p.id]&&saved.passed[p.id].code===saved.answers[p.id]));
    if(next<0)next=problems.findIndex(p=>!(saved.passed[p.id]&&saved.passed[p.id].code===saved.answers[p.id]));
    if(next>=0){$('next').hidden=false;$('next').onclick=()=>show(next);if($('auto').checked){setResult(`✅ 통과! ${report.passed}/${report.total}개 검사 성공. 3초 뒤 다음 문제로 이동합니다.`,'success');advance=setTimeout(()=>{if($('auto').checked)show(next);},3000);}}
  }else{delete saved.passed[job.pid];persist();renderNav();setResult(`다시 도전해 보세요. ${report.passed}/${report.total}개 검사 통과. 아래에서 실패한 입력과 반환값을 확인하세요.`,'error');}
}
$('code').addEventListener('input',()=>{clearTimeout(advance);saved.answers[problems[index].id]=$('code').value;persist();renderNav();});
$('code').addEventListener('keydown',e=>{
  if(e.key==='Tab'){e.preventDefault();const t=e.target,a=t.selectionStart,b=t.selectionEnd;t.setRangeText('    ',a,b,'end');t.dispatchEvent(new Event('input'));}
  if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run('judge');}
  else if(e.key==='Enter'){e.preventDefault();const t=e.target,a=t.selectionStart,b=t.selectionEnd,line=t.value.slice(0,a).split('\n').pop();const spaces=(line.match(/^ */)||[''])[0]+(line.trimEnd().endsWith(':')?'    ':'');t.setRangeText('\n'+spaces,a,b,'end');t.dispatchEvent(new Event('input'));}
});
$('judge').onclick=()=>run('judge');$('sample').onclick=()=>run('sample');$('retry').onclick=boot;
$('stop').onclick=()=>{worker.terminate();clearTimeout(timer);busy=false;ready=false;controls();$('engine').textContent='사용자가 중단함';$('retry').hidden=false;setResult('실행을 중단했습니다. 답안을 수정하고 다시 연결을 눌러주세요.');};
$('auto').onchange=()=>{if(!$('auto').checked)clearTimeout(advance);};
$('reset').onclick=()=>{if(busy)return;if(confirm('이 문제의 답안을 처음 상태로 되돌릴까요?')){delete saved.answers[problems[index].id];delete saved.passed[problems[index].id];show(index);}};
$('student').value=saved.student;$('student').oninput=()=>{saved.student=$('student').value;persist();};
$('download').onclick=()=>{
  const rows=problems.map(p=>({id:p.id,title:p.title,code:saved.answers[p.id]??p.starter,solved:!!(saved.passed[p.id]&&saved.passed[p.id].code===saved.answers[p.id]),result:saved.passed[p.id]?{passed:saved.passed[p.id].passed,total:saved.passed[p.id].total,at:saved.passed[p.id].at}:null}));
  const output={course:'알고리즘 1장 코딩 실습',student:saved.student,exportedAt:new Date().toISOString(),solved:rows.filter(r=>r.solved).length,total:rows.length,answers:rows};
  const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`알고리즘_${(saved.student||'이름미입력').replace(/[^가-힣a-zA-Z0-9_-]/g,'_')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
fetch('problems.json').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{problems=data;index=Math.min(Math.max(0,saved.index||0),data.length-1);show(index);boot();}).catch(()=>{setResult('문제 파일을 불러오지 못했습니다. 페이지를 새로고침하세요.','error');});
