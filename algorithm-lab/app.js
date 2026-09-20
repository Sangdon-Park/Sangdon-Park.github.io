const $ = id => document.getElementById(id);
let KEY = 'dju-algorithm-lab-v1';
let problems=[], index=0, worker=null, ready=false, busy=false, timer=null, token=0, job=null;
let saved={answers:{},passed:{},student:'',index:0};
try { const item=JSON.parse(localStorage.getItem(KEY)); if(item) saved={...saved,...item}; } catch (_) {}
let language=saved.language==='c'?'c':'python';
let chapter=1;
const orderedChapter = value => problems.filter(p=>(p.chapter||1)===value&&!LAB_DUPLICATES[p.id]).sort((a,b)=>Number(!!b.exercise)-Number(!!a.exercise));
const chapterProblems = () => orderedChapter(chapter);
const firstInChapter = value => problems.indexOf(orderedChapter(value)[0]);
const answerKey = id => language==='c'?'c:'+id:id;
const starter = p => language==='c'?C_PROBLEMS[p.id].starter:p.starter;
const languageName = () => language==='c'?'C':'Python';
const expectedText=(p,value)=>p.exactInteger?String(value):JSON.stringify(value);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(_){$('result').textContent=T('브라우저 저장 공간을 사용할 수 없습니다. 답안을 내려받아 보관하세요.');}}
function setResult(text,kind=''){ $('result').textContent=messageText(text); $('result').className=kind; }
function controls(){ $('judge').disabled=$('sample').disabled=!ready||busy||!cloud.session||cloud.expired; $('stop').hidden=!busy; $('code').readOnly=busy||!cloud.session||cloud.expired; if(editor)editor.setOption('readOnly',busy||!cloud.session||cloud.expired); $('language').disabled=busy;$('chapter').disabled=busy;$('ui-language').disabled=busy;$('clear-browser').disabled=busy;for(const id of ['indent-more','indent-less','indent-align','editor-undo'])$(id).disabled=busy;document.body.classList.toggle('busy',busy); }
function boot(){
  if(worker) worker.terminate(); clearTimeout(timer); ready=false;busy=false;controls();$('engine').textContent=language==='c'?T('C 준비 중… (첫 실행 약 60MB)'):T('Python 준비 중…');$('retry').hidden=true;
  worker=new Worker(language==='c'?'c-worker.js?v=20260920-exercises':'worker.js?v=20260920-exercises');
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
  for(const p of chapterProblems()){
    const i=problems.indexOf(p), b=document.createElement('button');
    const ok=saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)];
    const badge=document.createElement('span');badge.className='problem-id';badge.textContent=p.exercise?String(p.exercise):p.id;const name=document.createElement('span');name.textContent=p.title;b.append(badge,name);b.className=(i===index?'active ':'')+(ok?'solved':'');
    b.onclick=()=>{if(!busy)show(i);};$('problems').append(b);
  }
  const active=chapterProblems();
  const count=active.filter(p=>saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]).length;
  $('progress-bar').style.width=`${count/active.length*100}%`;
  $('progress').textContent=`${count} / ${active.length}${T(" 해결")}`;
  $('chapter-count').textContent=active.length;
}
function show(i){
  i=problems.findIndex(p=>p.id===canonicalProblemId(problems[i].id));
  const target=problems[i], legacy=Object.keys(LAB_DUPLICATES).find(id=>LAB_DUPLICATES[id]===target.id);
  let restored=false;
  if(legacy&&saved.answers[answerKey(target.id)]===undefined&&saved.answers[answerKey(legacy)]!==undefined){
    saved.answers[answerKey(target.id)]=saved.answers[answerKey(legacy)];restored=true;
    cloudDraft(target.id,language,saved.answers[answerKey(target.id)]);
  }
  index=i;saved.index=i;persist();const p=problems[i];
  chapter=p.chapter||1;$('chapter').value=chapter;
  saved.chapterIndices={...saved.chapterIndices,[chapter]:i};persist();
  $('chapter-caption').textContent=`CHAPTER ${String(chapter).padStart(2,'0')}`;
  $('chapter-resources').hidden=chapter!==2;
  $('chapter-resources').querySelector('a').href='chapter-02-guide.html'+(UI_EN?'?lang=en':'');
  $('chapter-note').textContent=chapter>=3?(UI_EN?'PPTX coding exercises / Python & C':'연습문제 작성형 / Python·C 구현'):chapter===2?(UI_EN?'Loops / permutations / combinations / subsets':'반복문 / 순열·조합 / 부분집합'):(UI_EN?'Search / operation counts / complexity':'탐색 / 연산 횟수 / 복잡도');
  const url=new URL(location.href);url.searchParams.set('chapter',chapter);url.searchParams.set('problem',p.id);url.searchParams.set('code',language);url.searchParams.delete('scope');history.replaceState(null,'',url);
  $('title').textContent=p.title;$('meta').textContent=`${p.id} · ${p.section} · ${p.chapter===2?(UI_EN?"Original PPT":"원본 PPT"):"PPT"} ${p.slides}`;$('level').textContent=p.level;
  const view=language==='c'?C_PROBLEMS[p.id]:p;
  $('statement').textContent=view.statement;$('hint').textContent=view.hint;editor.setOption('mode',language==='c'?'text/x-csrc':'python');setCode(saved.answers[answerKey(p.id)]??starter(p),true);
  $('editor-label').textContent=p.function+(language==='c'?'.c':'.py');$('editor-language').textContent=language==='c'?'C / C11':'Python 3';
  $('instructions').textContent=language==='c'?T('함수 틀의 이름과 매개변수를 유지하세요. main()과 scanf()는 작성하지 않습니다. 채점기가 함수를 호출합니다.\n')+view.result+(p.chapter===2?(UI_EN?'\nInclude standard headers as needed. Output arrays are provided by the grader.':'\n표준 헤더를 포함해도 됩니다. out과 sizes는 채점기가 준비한 결과 저장 공간입니다.'):T('\n배열 길이는 n입니다. out·trace·sorted·stats는 채점기가 준비한 결과 저장 공간입니다.')):T('함수의 이름과 매개변수를 유지하세요. input() 없이 전달받은 값을 사용하고, 답은 return으로 반환합니다.');
  $('examples').replaceChildren();
  for(const [j,t] of p.tests.filter(t=>t.public).entries()){
    const pre=document.createElement('pre');
    if(p.exercise || (language==='c' && p.chapter===2)){
      pre.textContent=`${T('예시 ')}${j+1}\n${p.params.filter((_,k)=>k<t.args.length).map((name,k)=>`${name} = ${JSON.stringify(t.args[k])}`).join('\n')}\n${UI_EN?'Result':'결과'}: ${expectedText(p,t.expected)}\n${language==='c'?view.result:(p.provided||'함수를 호출한 결과를 검사합니다.')}`;
    }else if(language==='c'){
      const args=t.args, hasArray=Array.isArray(args[0]);
      const input=hasArray?`A = {${args[0].join(', ')}}, n = ${args[0].length}${args.length>1?', target = '+args[1]:''}`:`n = ${args[0]}${args.length>1?', p = '+args[1]:''}`;
      const expected=p.id==='P06'&&t.expected[0]===null?[0,0]:t.expected;
      pre.textContent=`${T("예시 ")}${j+1}${T("\n입력: ")}${input}${T("\n결과: ")}${JSON.stringify(expected)}\n${language==='c'?view.result:(p.provided||'함수를 호출한 결과를 검사합니다.')}`;
    }else pre.textContent=`${T("예시 ")}${j+1}${T("\n입력: ")}${p.function}(${t.args.map(x=>JSON.stringify(x)).join(', ')}${T(")\n반환: ")}${JSON.stringify(t.expected).replaceAll('null','None')}`;
    $('examples').append(pre);
  }
  renderPracticeHints(p);
  renderStudy(p);
  syncPracticeLayout(p);
  if(p.exercise)$('instructions').textContent=(language==='c'?p.c.starter.split('{')[0]+';\n'+p.c.result:'def '+p.function+'('+p.params.join(', ')+')\n'+(p.outputArgument===undefined?'정수·실수·문자열·목록 등 문제에 맞는 자료형으로 반환합니다.':'입력 배열을 수정합니다.'))+'\n'+(p.provided||'')+'\n입출력 함수를 호출하지 않습니다. main()은 실행 환경이 제공합니다.';
  $('case-results').replaceChildren();$('repair-note').hidden=true;$('next').hidden=true;setResult(restored?'기존 중복 문제의 답안을 불러왔습니다. PPTX 조건으로 채점하기를 눌러 확인하세요.':T('코드를 작성한 뒤 예시 실행 또는 채점하기를 누르세요.'));renderNav();
}
function armTimeout(ms){
  clearTimeout(timer);timer=setTimeout(()=>{if(job)cloudAttempt(job,{error:T('시간 제한 초과')});busy=false;ready=false;worker.terminate();controls();$('retry').hidden=false;$('engine').textContent=T('실행 중단');setResult(T('시간 제한을 넘겨 중단했습니다. 반복 조건과 변수 갱신을 확인하세요. 답안을 수정한 뒤 다시 연결을 눌러주세요.'),'error');},ms);
}
function run(mode){
  if(!cloud.session||cloud.expired){requirePracticeAccount();return;}
  $('execution-results').open=true;
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
  if(problems[job.index].exercise){const note=document.createElement('p');note.className='notice';note.textContent='실행 결과 검사입니다. 알고리즘 사용 조건과 풀이·경계·복잡도 설명은 아래 작성란과 풀이 예시로 별도 점검하세요.';$('case-results').append(note);}
  for(const r of report.rows){const row=document.createElement('p');row.textContent=`${r.ok?'✓':'✗'} ${r.public?T('공개 예시'):T('추가 검사')} ${r.number}${r.ok?T(' 통과'):T('\n입력: ')+r.input+'\n'+messageText(r.message)}`;$('case-results').append(row);}
  if(job.mode==='sample'){setResult(`${T("예시 ")}${report.passed}/${report.total}${T(" 통과. 전체 검사는 채점하기로 확인하세요.")}`,success?'success':'error');return;}
  if(success){
    saved.passed[answerKey(job.pid)]={code:job.code,passed:report.passed,total:report.total,at:new Date().toISOString()};persist();renderNav();
    const all=chapterProblems().every(p=>saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]);
    setResult(all?(UI_EN?`🎉 Chapter ${chapter}: all ${chapterProblems().length} problems solved! Download your answers in Settings.`:`🎉 ${chapter}강 ${chapterProblems().length}문제를 모두 해결했습니다! 설정에서 답안·결과를 내려받으세요.`):`${T("✅ 통과! ")}${report.passed}/${report.total}${T("개 검사 성공.")}`, 'success');
    const ordered=chapterProblems(), position=ordered.findIndex(p=>p.id===job.pid);
    const unsolved=p=>!(saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]);
    const candidate=ordered.slice(position+1).find(unsolved)||ordered.find(unsolved);
    const next=problems.indexOf(candidate);
    if(next>=0){$('next').hidden=false;$('next').onclick=()=>show(next);}
  }else{delete saved.passed[answerKey(job.pid)];persist();renderNav();setResult(`${T("다시 도전해 보세요. ")}${report.passed}/${report.total}${T("개 검사 통과. 아래에서 실패한 입력과 반환값을 확인하세요.")}`,'error');}
}
$('code').addEventListener('input',()=>{saved.answers[answerKey(problems[index].id)]=$('code').value;persist();renderNav();cloudDraft(problems[index].id,language,$('code').value);});
$('judge').onclick=()=>run('judge');$('sample').onclick=()=>run('sample');$('retry').onclick=boot;
$('stop').onclick=()=>{if(job)cloudAttempt(job,{error:T('사용자가 실행을 중단했습니다.')});worker.terminate();clearTimeout(timer);busy=false;ready=false;controls();$('engine').textContent=T('사용자가 중단함');$('retry').hidden=false;setResult(T('실행을 중단했습니다. 답안을 수정하고 다시 연결을 눌러주세요.'));};
$('reset').onclick=()=>{if(busy)return;if(confirm(T('이 문제의 답안을 처음 상태로 되돌릴까요?'))){delete saved.answers[answerKey(problems[index].id)];delete saved.passed[answerKey(problems[index].id)];show(index);}};
$('student').value=saved.student;$('student').oninput=()=>{saved.student=$('student').value;persist();};
$('download').onclick=()=>{
  const rows=chapterProblems().map(p=>({id:p.id,title:p.title,chapter,language,study:p.exercise?studyEntry(p):undefined,code:saved.answers[answerKey(p.id)]??starter(p),solved:!!(saved.passed[answerKey(p.id)]&&saved.passed[answerKey(p.id)].code===saved.answers[answerKey(p.id)]),result:saved.passed[answerKey(p.id)]?{passed:saved.passed[answerKey(p.id)].passed,total:saved.passed[answerKey(p.id)].total,at:saved.passed[answerKey(p.id)].at}:null}));
  const archivedAnswers=Object.entries(LAB_DUPLICATES).filter(([oldId,newId])=>problems.find(p=>p.id===newId)?.chapter===chapter&&saved.answers[answerKey(oldId)]!==undefined).map(([id,canonicalId])=>({id,canonicalId,language,code:saved.answers[answerKey(id)],result:saved.passed[answerKey(id)]||null}));
  const output={archivedAnswers,language,chapter,course:UI_EN?`Algorithms Chapter ${chapter}`:`알고리즘 ${chapter}장 코딩 실습`,student:saved.student,exportedAt:new Date().toISOString(),solved:rows.filter(r=>r.solved).length,total:rows.length,answers:rows};
  const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${T("알고리즘_")}ch${chapter}_${language}_${(saved.student||T('이름미입력')).replace(/[^가-힣a-zA-Z0-9_-]/g,'_')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('language').value=language;
$('language').onchange=()=>{
  if(busy)return;
  language=$('language').value;saved.language=language;persist();show(index);boot();
};
$('chapter').onchange=()=>{
  if(busy){$('chapter').value=chapter;return;}
  const requested=Number($('chapter').value);
  const previous=saved.chapterIndices?.[requested];
  show(Number.isInteger(previous)&&(problems[previous]?.chapter||1)===requested?previous:firstInChapter(requested));
};
// Capture links before show() updates the URL or cloud restore changes selection.
const entryParams=new URLSearchParams(location.search);
initEditor();
initCloudUI();
Promise.all(['problems.json','chapter-02.json?v=20260920-exercises','exercise-problems.json?v=20260920-exercises'].map(file=>fetch(file).then(r=>{if(!r.ok)throw new Error();return r.json();}))).then(async chapters=>{
  const data=chapters.flat();
  for(const p of data){
    if(p.c)C_PROBLEMS[p.id]={...p.c};
    if(UI_EN){
      const translation=p.en||EN_PROBLEMS[p.id]||{};
      // Preserve machine-readable C metadata while translating display fields.
      for(const field of ['title','section','level','statement','hint'])if(translation[field])p[field]=translation[field];
      p.starter=p.starter.replace('# 여기에 코드를 작성하세요.','# Write your code here.');
      Object.assign(C_PROBLEMS[p.id],translation.c);
      C_PROBLEMS[p.id].starter=C_PROBLEMS[p.id].starter.replace('// 여기에 코드를 작성하세요. 아래 임시 결과를 수정하세요.','// Write your code here.').replace('// TODO: 문제 설명에 따라 구현하세요.','// TODO: implement the problem.');
    }
  }
  problems=data;index=Math.min(Math.max(0,saved.index||0),data.length-1);show(index);
  editor.setOption('readOnly',true);await cloudInit();
  if(['c','python'].includes(entryParams.get('code'))){language=entryParams.get('code');saved.language=language;$('language').value=language;}
  const requestedChapter=Number(entryParams.get('chapter'));
  const requestedIndex=problems.findIndex(p=>p.id===entryParams.get('problem')&&(![1,2,3,4,5,6].includes(requestedChapter)||(p.chapter||1)===requestedChapter));
  if(requestedIndex>=0)index=requestedIndex;
  else if([1,2,3,4,5,6].includes(requestedChapter))index=firstInChapter(requestedChapter);
  if(index<0)index=0;
  show(index);boot();requirePracticeAccount();
}).catch(()=>{setResult(T('문제 파일을 불러오지 못했습니다. 페이지를 새로고침하세요.'),'error');});
