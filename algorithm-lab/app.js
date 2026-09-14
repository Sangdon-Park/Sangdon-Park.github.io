const $ = id => document.getElementById(id);
let KEY = 'dju-algorithm-lab-v1';
let problems=[], index=0, worker=null, ready=false, busy=false, timer=null, token=0, job=null;
let saved={answers:{},passed:{},student:'',index:0};
try { const item=JSON.parse(localStorage.getItem(KEY)); if(item) saved={...saved,...item}; } catch (_) {}
let language=saved.language==='c'?'c':'python';
const answerKey = id => language==='c'?'c:'+id:id;
const starter = p => language==='c'?C_PROBLEMS[p.id].starter:p.starter;
const languageName = () => language==='c'?'C':'Python';
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(_){$('result').textContent=T('브라우저 저장 공간을 사용할 수 없습니다. 답안을 내려받아 보관하세요.');}}
function setResult(text,kind=''){ $('result').textContent=messageText(text); $('result').className=kind; }
function controls(){ $('judge').disabled=$('sample').disabled=!ready||busy; $('stop').hidden=!busy; $('code').readOnly=busy; if(editor)editor.setOption('readOnly',busy); $('language').disabled=busy;$('ui-language').disabled=busy;$('clear-browser').disabled=busy;for(const id of ['indent-more','indent-less','indent-align','editor-undo'])$(id).disabled=busy;document.body.classList.toggle('busy',busy); }
function boot(){
  if(worker) worker.terminate(); clearTimeout(timer); ready=false;busy=false;controls();$('engine').textContent=language==='c'?T('C 준비 중… (첫 실행 약 60MB)'):T('Python 준비 중…');$('retry').hidden=true;
  worker=new Worker(language==='c'?'c-worker.js?v=20260914-c1':'worker.js?v=20260914-paste1');
  const mine=worker;
  timer=setTimeout(()=>{if(worker!==mine)return;mine.terminate();$('engine').textContent=T('연결 지연');$('retry').hidden=false;setResult(languageName()+T('을 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 연결을 눌러주세요.'),'error');},180000);
  worker.onmessage=({data})=>{
    if(worker!==mine)return;
    if(data.type==='ready'){clearTimeout(timer);ready=true;$('engine').textContent='● '+languageName()+T(' 실행 준비 완료');controls();return;}
    if(data.type==='boot-error'){clearTimeout(timer);$('engine').textContent=T('연결 실패');$('retry').hidden=false;setResult(languageName()+T(' 실행 환경을 받지 못했습니다. 다시 연결을 눌러주세요.'),'error');return;}
    if(data.type==='phase'&&job&&data.token===job.token){
      if(data.phase==='run'){armTimeout(6000);setResult(T('C 실행·채점 중…'));}
      else setResult(T('C 컴파일 중…'));
    }
    if(data.type==='result'&&job&&data.token===job.token){clearTimeout(timer);busy=false;controls();finish(data.report);}
  };
  worker.onerror=()=>{clearTimeout(timer);busy=false;ready=false;controls();$('retry').hidden=false;$('engine').textContent=T('실행 환경 오류');setResult(T('실행 환경에 오류가 났습니다. 답안은 저장되어 있습니다. 다시 연결을 눌러주세요.'),'error');};
}
function renderNav(){
  $('problems').replaceChildren();
  for(let i=0;i<problems.length;i++){
    const p=problems[i], b=document.createElement('button');
    const ok=saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)];
    const badge=document.createElement('span');badge.className='problem-id';badge.textContent=p.id;const name=document.createElement('span');name.textContent=p.title;b.append(badge,name);b.className=(i===index?'active ':'')+(ok?'solved':'');
    b.onclick=()=>{if(!busy)show(i);};$('problems').append(b);
  }
  const count=problems.filter(p=>saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]).length;
  $('progress-bar').style.width=`${count/problems.length*100}%`;
  $('progress').textContent=`${count} / ${problems.length}${T(" 해결")}`;
}
function show(i){
  index=i;saved.index=i;persist();const p=problems[i];
  $('title').textContent=p.title;$('meta').textContent=`${p.id} · ${p.section} · PPT ${p.slides}`;$('level').textContent=p.level;
  const view=language==='c'?C_PROBLEMS[p.id]:p;
  $('statement').textContent=view.statement;$('hint').textContent=view.hint;editor.setOption('mode',language==='c'?'text/x-csrc':'python');setCode(saved.answers[answerKey(p.id)]??starter(p),true);
  $('editor-label').textContent=p.function+(language==='c'?'.c':'.py');$('editor-language').textContent=language==='c'?'C / C11':'Python 3';
  $('instructions').textContent=language==='c'?T('함수 틀의 이름과 매개변수를 유지하세요. main()과 scanf()는 작성하지 않습니다. 채점기가 함수를 호출합니다.\n')+view.result+T('\n배열 길이는 n입니다. out·trace·sorted·stats는 채점기가 준비한 결과 저장 공간입니다.'):T('함수의 이름과 매개변수를 유지하세요. input() 없이 전달받은 값을 사용하고, 답은 return으로 반환합니다.');
  $('examples').replaceChildren();
  for(const [j,t] of p.tests.filter(t=>t.public).entries()){
    const pre=document.createElement('pre');
    if(language==='c'){
      const args=t.args, hasArray=Array.isArray(args[0]);
      const input=hasArray?`A = {${args[0].join(', ')}}, n = ${args[0].length}${args.length>1?', target = '+args[1]:''}`:`n = ${args[0]}${args.length>1?', p = '+args[1]:''}`;
      const expected=p.id==='P06'&&t.expected[0]===null?[0,0]:t.expected;
      pre.textContent=`${T("예시 ")}${j+1}${T("\n입력: ")}${input}${T("\n결과: ")}${JSON.stringify(expected)}\n${view.result}`;
    }else pre.textContent=`${T("예시 ")}${j+1}${T("\n입력: ")}${p.function}(${t.args.map(x=>JSON.stringify(x)).join(', ')}${T(")\n반환: ")}${JSON.stringify(t.expected).replaceAll('null','None')}`;
    $('examples').append(pre);
  }
  $('case-results').replaceChildren();$('repair-note').hidden=true;$('next').hidden=true;setResult(T('코드를 작성한 뒤 예시 실행 또는 채점하기를 누르세요.'));renderNav();
}
function armTimeout(ms){
  clearTimeout(timer);timer=setTimeout(()=>{if(job)cloudAttempt(job,{error:T('시간 제한 초과')});busy=false;ready=false;worker.terminate();controls();$('retry').hidden=false;$('engine').textContent=T('실행 중단');setResult(T('시간 제한을 넘겨 중단했습니다. 반복 조건과 변수 갱신을 확인하세요. 답안을 수정한 뒤 다시 연결을 눌러주세요.'),'error');},ms);
}
function run(mode){
  if(!ready||busy)return;const p=problems[index];const code=getCode();
  saved.answers[answerKey(p.id)]=code;persist();busy=true;controls();$('next').hidden=true;$('case-results').replaceChildren();setResult(mode==='sample'?T('공개 예시 실행 중…'):T('전체 검사로 채점 중…'));
  job={token:++token,pid:p.id,index,mode,code,language};
  armTimeout(language==='c'?60000:6000);
  worker.postMessage({token:job.token,code,problem:p,cases:mode==='sample'?p.tests.filter(t=>t.public):p.tests});
}
function finish(report){
  if(report.normalizedCount){
    job.code=report.normalizedCode;setCode(job.code);saved.answers[answerKey(job.pid)]=job.code;persist();
    $('repair-note').textContent=`${T("붙여넣기에 섞인 특수 공백 ")}${report.normalizedCount}${T("개를 정리했습니다. 문자열과 주석은 그대로 유지했습니다.")}`;
    $('repair-note').hidden=false;renderNav();
  }
  cloudAttempt(job,report);
  if(report.error){setResult(report.error,'error');return;}
  const success=report.passed===report.total;
  for(const r of report.rows){const row=document.createElement('p');row.textContent=`${r.ok?'✓':'✗'} ${r.public?T('공개 예시'):T('추가 검사')} ${r.number}${r.ok?T(' 통과'):T('\n입력: ')+r.input+'\n'+messageText(r.message)}`;$('case-results').append(row);}
  if(job.mode==='sample'){setResult(`${T("예시 ")}${report.passed}/${report.total}${T(" 통과. 전체 검사는 채점하기로 확인하세요.")}`,success?'success':'error');return;}
  if(success){
    saved.passed[answerKey(job.pid)]={code:job.code,passed:report.passed,total:report.total,at:new Date().toISOString()};persist();renderNav();
    const all=problems.every(p=>saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]);
    setResult(all?T('🎉 12문제를 모두 해결했습니다! 답안·결과를 내려받아 LMS에 제출하세요.'):`${T("✅ 통과! ")}${report.passed}/${report.total}${T("개 검사 성공.")}`, 'success');
    let next=problems.findIndex((p,i)=>i>index&&!(saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]));
    if(next<0)next=problems.findIndex(p=>!(saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]));
    if(next>=0){$('next').hidden=false;$('next').onclick=()=>show(next);}
  }else{delete saved.passed[answerKey(job.pid)];persist();renderNav();setResult(`${T("다시 도전해 보세요. ")}${report.passed}/${report.total}${T("개 검사 통과. 아래에서 실패한 입력과 반환값을 확인하세요.")}`,'error');}
}
$('code').addEventListener('input',()=>{saved.answers[answerKey(problems[index].id)]=$('code').value;persist();renderNav();cloudDraft(problems[index].id,language,$('code').value);});
$('judge').onclick=()=>run('judge');$('sample').onclick=()=>run('sample');$('retry').onclick=boot;
$('stop').onclick=()=>{if(job)cloudAttempt(job,{error:T('사용자가 실행을 중단했습니다.')});worker.terminate();clearTimeout(timer);busy=false;ready=false;controls();$('engine').textContent=T('사용자가 중단함');$('retry').hidden=false;setResult(T('실행을 중단했습니다. 답안을 수정하고 다시 연결을 눌러주세요.'));};
$('reset').onclick=()=>{if(busy)return;if(confirm(T('이 문제의 답안을 처음 상태로 되돌릴까요?'))){delete saved.answers[answerKey(problems[index].id)];delete saved.passed[answerKey(problems[index].id)];show(index);}};
$('student').value=saved.student;$('student').oninput=()=>{saved.student=$('student').value;persist();};
$('download').onclick=()=>{
  const rows=problems.map(p=>({id:p.id,title:p.title,language,code:saved.answers[answerKey(p.id)]??starter(p),solved:!!(saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]),result:saved.passed[answerKey(p.id)]?{passed:saved.passed[answerKey(p.id)].passed,total:saved.passed[answerKey(p.id)].total,at:saved.passed[answerKey(p.id)].at}:null}));
  const output={language,course:T('알고리즘 1장 코딩 실습'),student:saved.student,exportedAt:new Date().toISOString(),solved:rows.filter(r=>r.solved).length,total:rows.length,answers:rows};
  const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${T("알고리즘_")}${language}_${(saved.student||T('이름미입력')).replace(/[^가-힣a-zA-Z0-9_-]/g,'_')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('language').value=language;
$('language').onchange=()=>{
  if(busy)return;
  language=$('language').value;saved.language=language;persist();show(index);boot();
};
initEditor();
initCloudUI();
fetch('problems.json').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(async data=>{if(UI_EN){for(const p of data){Object.assign(p,EN_PROBLEMS[p.id]);p.starter=p.starter.replace('# 여기에 코드를 작성하세요.','# Write your code here.');Object.assign(C_PROBLEMS[p.id],EN_PROBLEMS[p.id].c);C_PROBLEMS[p.id].starter=C_PROBLEMS[p.id].starter.replace('// 여기에 코드를 작성하세요. 아래 임시 결과를 수정하세요.','// Write your code here. Replace the placeholder result below.');}}problems=data;index=Math.min(Math.max(0,saved.index||0),data.length-1);show(index);editor.setOption('readOnly',true);await cloudInit();boot();}).catch(()=>{setResult(T('문제 파일을 불러오지 못했습니다. 페이지를 새로고침하세요.'),'error');});
