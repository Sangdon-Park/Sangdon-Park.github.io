const $=id=>document.getElementById(id),API='https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab';
let token=sessionStorage.getItem('dju-algolab-admin')||'',students=[],section='all',detail=null,choices=[],refreshing=false,detailProblemId=null;
async function request(action,body={}){const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok){if(response.status===401&&action!=='admin-login')signOut();throw Error(T(data.error)||T('요청 실패'));}return data;}
function signOut(){token='';students=[];detail=null;choices=[];detailProblemId=null;sessionStorage.removeItem('dju-algolab-admin');$('admin-workspace').hidden=true;$('admin-login-panel').hidden=false;for(const d of document.querySelectorAll('dialog[open]'))d.close();for(const id of ['student-rows','student-cards','detail-title','detail-summary','detail-grid','submission-code','submission-report','submission-select','submission-meta','problem-cards','problem-student-rows','problem-detail-title','problem-detail-summary','problem-overview-summary'])$(id).replaceChildren();}
const selectedProblems=()=>adminProblemCatalog.filter(p=>$('admin-chapter').value==='all'||p.chapter===Number($('admin-chapter').value));
const selectedIds=()=>selectedProblems().map(p=>p.id);
const selectedTotal=()=>selectedIds().length;
function chapterStudents(){const ids=new Set(selectedIds());return students.map(s=>({...s,solved:new Set(s.problems.filter(p=>ids.has(p.problem)&&p.solved).map(p=>p.problem)).size,attempts:s.problems.filter(p=>ids.has(p.problem)).reduce((sum,p)=>sum+p.attempts,0)}));}
function matchingStudents(){const query=$('student-search').value.trim().toLowerCase();return students.filter(s=>(section==='all'||s.section===section)&&(!query||(s.student_no+' '+s.name).toLowerCase().includes(query)));}
function filtered(){const people=new Set(matchingStudents().map(s=>s.id??s.student_no)),state=$('progress-filter').value;return chapterStudents().filter(s=>people.has(s.id??s.student_no)&&(studentView==='problems'||state==='all'||(state==='not-started'&&s.solved===0)||(state==='working'&&s.solved>0&&s.solved<selectedTotal())||(state==='complete'&&s.solved===selectedTotal())));}
const studentCollator = new Intl.Collator('ko-KR', {numeric:true, sensitivity:'base'});
const sortFields = ['student_no', 'name', 'solved', 'attempts', 'last_seen'];
function sortedStudents() {
  const field = $('student-sort').value || 'student_no';
  const direction = $('sort-direction').value === 'desc' ? -1 : 1;
  return filtered().sort((a, b) => {
    let comparison;
    if (field === 'last_seen') {
      const left = Date.parse(a.last_seen), right = Date.parse(b.last_seen);
      // Missing activity remains at the end in either direction.
      if (Number.isFinite(left) !== Number.isFinite(right)) return Number.isFinite(left) ? -1 : 1;
      comparison = Number.isFinite(left) ? left - right : 0;
    } else if (field === 'solved' || field === 'attempts') comparison = a[field] - b[field];
    else comparison = studentCollator.compare(a[field] || '', b[field] || '');
    return direction * comparison || studentCollator.compare(a.student_no, b.student_no)
      || studentCollator.compare(a.section, b.section) || studentCollator.compare(a.id || '', b.id || '');
  });
}
function saveStudentSort() {
  try { sessionStorage.setItem('dju-algolab-admin-sort', JSON.stringify({field:$('student-sort').value, direction:$('sort-direction').value})); } catch {}
  render();
}
try {
  const order = JSON.parse(sessionStorage.getItem('dju-algolab-admin-sort'));
  if (order && sortFields.includes(order.field) && ['asc','desc'].includes(order.direction)) {
    $('student-sort').value = order.field;
    $('sort-direction').value = order.direction;
  }
} catch {}
let studentView = 'cards';
try { const view=sessionStorage.getItem('dju-algolab-admin-view');if (['list','problems'].includes(view)) studentView = view; } catch {}
function setStudentView(view) {
  studentView = view;
  try { sessionStorage.setItem('dju-algolab-admin-view', view); } catch {}
  render();
}
$('view-cards').onclick = () => setStudentView('cards');
$('view-list').onclick = () => setStudentView('list');
$('view-problems').onclick = () => setStudentView('problems');
function renderCards(rows) {
  const container = $('student-cards');
  container.replaceChildren();
  container.hidden = studentView !== 'cards';
  $('student-table').hidden = studentView !== 'list';
  $('view-cards').setAttribute('aria-pressed', String(studentView === 'cards'));
  $('view-list').setAttribute('aria-pressed', String(studentView === 'list'));
  for (const student of rows) {
    const card = document.createElement('article');
    card.className = 'student-card';
    const add = (parent, tag, text, className) => {
      const node = document.createElement(tag);
      node.textContent = text;
      if (className) node.className = className;
      parent.append(node);
      return node;
    };
    const heading = add(card, 'div', '', 'student-card-heading');
    add(heading, 'h3', student.name);
    add(heading, 'span', UI_EN ? 'Section ' + student.section : student.section + T('반'), 'student-card-section');
    add(card, 'p', student.student_no, 'student-card-number');
    const metrics = add(card, 'div', '', 'student-card-metrics');
    const solved = add(metrics, 'div', '');
    add(solved, 'span', T('푼 문제 수'));
    const count = add(solved, 'strong', String(student.solved));
    add(count, 'small', ' / ' + selectedTotal());
    const attempts = add(metrics, 'div', '');
    add(attempts, 'span', T('채점 제출 수'));
    add(attempts, 'strong', student.attempts + T('회'));
    const track = add(card, 'div', '', 'student-progress');
    const fill = add(track, 'div', '');
    fill.style.width = (selectedTotal() ? student.solved / selectedTotal() * 100 : 0) + '%';
    const meta = add(card, 'dl', '', 'student-card-meta');
    add(meta, 'dt', T('현재 열어 둔 문제'));
    add(meta, 'dd', student.current_problem ? student.current_problem + ' · ' + (student.current_language === 'java' ? 'Java' : student.current_language === 'c' ? 'C' : 'Python') : '—');
    add(meta, 'dt', T('최근 활동'));
    add(meta, 'dd', Number.isFinite(Date.parse(student.last_seen)) ? time(student.last_seen) : '—');
    const button = add(card, 'button', T('이력 · 코드'));
    button.onclick = () => openStudent(student.id);
    container.append(card);
  }
}
function time(value){return new Date(value).toLocaleString(UI_DATE_LOCALE,{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
const stateLabel=state=>T(state==='solved'?'통과':state==='attempted'?'제출 · 미통과':'미제출');
const problemLabel=p=>p.id+' · '+T(p.title)+(p.exercise?' · '+T('연습문제 ')+p.exercise:T(' · 강의 실습'));
function sortedProblemStudents(){return matchingStudents().slice().sort((a,b)=>studentCollator.compare(a.section,b.section)||studentCollator.compare(a.student_no,b.student_no)||studentCollator.compare(a.name,b.name));}
function visibleProblems(){
  const query=$('problem-search').value.trim().toLowerCase(),state=$('problem-filter').value,people=sortedProblemStudents();
  return selectedProblems().filter(p=>!query||(p.id+' '+p.title+' '+T(p.title)+' '+(p.exercise||'')).toLowerCase().includes(query))
    .map(p=>problemSummary(p,people)).filter(p=>state==='all'||(state==='solved'&&p.solved.length>0)||(state==='unsolved'&&p.solved.length===0));
}
function node(parent,tag,text,className){const child=document.createElement(tag);child.textContent=text;if(className)child.className=className;parent.append(child);return child;}
function renderProblems(){
  const active=studentView==='problems';$('problem-overview').hidden=!active;
  $('view-problems').setAttribute('aria-pressed',String(active));$('progress-filter').hidden=active;
  $('student-sort').parentElement.hidden=active;
  if(!active)return;
  const summaries=visibleProblems(),container=$('problem-cards');container.replaceChildren();
  $('problem-overview-summary').textContent=summaries.length+T('개 문제')+' · '+matchingStudents().length+T('명');
  for(const summary of summaries){
    const p=summary.problem,card=node(container,'article','','problem-card');card.dataset.problem=p.id;
    node(card,'p',p.chapter+T('강')+' · '+p.id+(p.exercise?' · '+T('연습문제 ')+p.exercise:T(' · 강의 실습')),'problem-card-meta');
    node(card,'h3',T(p.title));const counts=node(card,'div','','problem-counts');
    for(const [key,rows] of [['solved',summary.solved],['attempted',summary.attempted],['not-submitted',summary.notSubmitted]])node(counts,'span',stateLabel(key)+' '+rows.length+T('명'),key);
    const names=node(card,'div','','problem-solvers');
    for(const row of summary.solved.slice(0,6))node(names,'span',row.student.name+' ('+row.student.student_no+')','problem-solver');
    if(summary.solved.length>6)node(names,'span','+ '+(summary.solved.length-6)+T('명'),'problem-solver');
    if(!summary.solved.length)node(names,'span',T('아직 통과자가 없습니다.'),'problem-no-solvers');
    const button=node(card,'button',T('학생별 상태 · 코드 보기'));button.type='button';button.onclick=()=>openProblem(p.id);
  }
  $('problem-empty').hidden=summaries.length>0;
  if($('problem-detail').open)renderProblemDetail();
}
function openProblem(id){
  detailProblemId=id;$('problem-student-state').value='solved';renderProblemDetail();$('problem-detail').showModal();
}
function selectedProblemRows(){
  const state=$('problem-student-state').value;
  return sortedProblemStudents().map(s=>problemProgress(s,detailProblemId)).filter(row=>state==='all'||row.state===state);
}
function renderProblemDetail(){
  const problem=adminProblemCatalog.find(p=>p.id===detailProblemId);if(!problem)return;
  const summary=problemSummary(problem,matchingStudents());$('problem-detail-title').textContent=problemLabel(problem);
  $('problem-detail-summary').textContent=[['solved',summary.solved],['attempted',summary.attempted],['not-submitted',summary.notSubmitted]]
    .map(([state,rows])=>stateLabel(state)+' '+rows.length+T('명')).join(' · ');
  const rows=selectedProblemRows(),body=$('problem-student-rows');body.replaceChildren();
  for(const row of rows){
    const tr=node(body,'tr','');node(tr,'td',row.student.section+T('반'));const person=node(tr,'td',row.student.student_no);node(person,'strong',row.student.name);
    const status=node(tr,'td','');node(status,'span',stateLabel(row.state),'problem-status '+row.state);
    node(tr,'td',row.languages.map(l=>l==='c'?'C':l==='java'?'Java':'Python').join(' · ')||'—');node(tr,'td',row.attempts+T('회'));
    node(tr,'td',row.lastSubmit?time(row.lastSubmit):'—');const action=node(tr,'td','');
    if(row.state!=='not-submitted'){const button=node(action,'button',T('이력 · 코드'));button.type='button';button.onclick=()=>openStudent(row.student.id,problem.id);}
  }
  $('problem-detail-empty').hidden=rows.length>0;
}
function exportProblemRows(rows,filename){
  downloadAdminCsv(filename,[[T('문제 ID'),T('문제 제목'),T('강'),T('반'),T('학번'),T('이름'),T('상태'),T('통과 언어'),T('채점 제출'),T('최근 제출')],
    ...rows.map(row=>[row.problem.id,row.problem.title,row.problem.chapter,row.student.section,row.student.student_no,row.student.name,stateLabel(row.state),row.languages.join(' / '),row.attempts,row.lastSubmit||''])]);
}
$('problem-search').oninput=renderProblems;$('problem-filter').onchange=renderProblems;
$('problem-student-state').onchange=renderProblemDetail;$('problem-detail-close').onclick=()=>$('problem-detail').close();
$('problem-csv').onclick=()=>{const problem=adminProblemCatalog.find(p=>p.id===detailProblemId);if(problem)exportProblemRows(selectedProblemRows().map(row=>({problem,...row})),problem.id+'-'+section+'.csv');};
function render(){
 const rows=sortedStudents();renderCards(rows);$('student-rows').replaceChildren();$('stat-students').textContent=rows.length+T('명');$('stat-average').textContent=(rows.length?rows.reduce((n,s)=>n+s.solved,0)/rows.length:0).toFixed(1)+' / '+selectedTotal();$('stat-complete').textContent=rows.filter(s=>s.solved===selectedTotal()).length+T('명');$('stat-attempts').textContent=rows.reduce((n,s)=>n+s.attempts,0)+T('회');
 for(const student of rows){const tr=document.createElement('tr');const cell=text=>{const td=document.createElement('td');td.textContent=text;tr.append(td);return td;};cell(UI_EN?'Section '+student.section:student.section+T('반'));const person=cell(student.student_no);const name=document.createElement('strong');name.textContent=student.name;person.append(name);const progress=cell(student.solved+' / '+selectedTotal());const track=document.createElement('div');track.className='student-progress';const fill=document.createElement('div');fill.style.width=student.solved/selectedTotal()*100+'%';track.append(fill);progress.append(track);cell(student.attempts+T('회'));cell(student.current_problem+' · '+(student.current_language==='java'?'Java':student.current_language==='c'?'C':'Python'));cell(time(student.last_seen));const action=cell('');const button=document.createElement('button');button.textContent=T('이력 · 코드');button.onclick=()=>openStudent(student.id);action.append(button);$('student-rows').append(tr);}
 renderProblems();
 $('admin-empty').hidden=studentView==='problems'||rows.length>0;$('admin-empty').textContent=students.length?T('조건에 맞는 학생이 없습니다.'):T('아직 등록한 학생이 없습니다. 학생들에게 실습 링크를 안내하세요. 반·학번·이름만 입력하면 됩니다.');
}
async function refresh(){if(refreshing||!token)return;const activeToken=token;refreshing=true;$('admin-refresh').disabled=true;try{await loadAdminProblemCatalog();const data=await request('admin-dashboard');if(token!==activeToken)return;students=data.students;$('updated-at').textContent=T('최근 갱신 ')+new Date(data.updated_at).toLocaleTimeString(UI_DATE_LOCALE);$('admin-status').textContent='';render();}catch(error){$('admin-status').textContent=error.message;}finally{refreshing=false;$('admin-refresh').disabled=false;}}
$('admin-login-form').onsubmit=async event=>{event.preventDefault();$('admin-login-submit').disabled=true;try{const data=await request('admin-login',{password:$('admin-password').value});token=data.token;sessionStorage.setItem('dju-algolab-admin',token);$('admin-password').value='';$('admin-login-panel').hidden=true;$('admin-workspace').hidden=false;await refresh();}catch(error){$('admin-login-error').textContent=error.message;}finally{$('admin-login-submit').disabled=false;}};
$('admin-logout').onclick=async()=>{try{await request('logout');}catch{}signOut();};
for(const button of document.querySelectorAll('[data-section]'))button.onclick=()=>{section=button.dataset.section;for(const b of document.querySelectorAll('[data-section]'))b.setAttribute('aria-pressed',String(b===button));render();};
$('admin-chapter').onchange=render;
$('student-search').oninput=render;$('progress-filter').onchange=render;$('admin-refresh').onclick=refresh;
$('student-sort').onchange=()=>{
  $('sort-direction').value=['solved','attempts','last_seen'].includes($('student-sort').value)?'desc':'asc';
  saveStudentSort();
};
$('sort-direction').onchange=saveStudentSort;
setInterval(()=>{if(token&&$('admin-auto').checked&&!document.hidden)refresh();},10000);
async function openStudent(id,problemId=null){
 detailProblemId=problemId;
 const activeToken=token;detail=null;choices=[];
 $('student-detail').showModal();$('detail-title').textContent=T('불러오는 중…');$('detail-summary').textContent='';$('submission-code').textContent='';$('detail-grid').replaceChildren();$('submission-select').replaceChildren();$('submission-report').replaceChildren();
 try{const response=await request('admin-student',{student_id:id});if(token!==activeToken)return;detail=response;const s=detail.student;$('detail-title').textContent=s.section+T('반 · ')+s.student_no+' '+s.name;$('detail-summary').textContent=T('최근 제출 200건과 언어별 저장 초안 · 제출 시각은 서버 접수 기준');const summary=students.find(row=>row.id===id);
 for(const p of (detailProblemId?[detailProblemId]:selectedIds())){const box=document.createElement('div'),title=document.createElement('strong');title.textContent=p;box.append(title);for(const language of ['python','c','java']){const status=summary?.problems.find(item=>item.problem===p&&item.language===language),line=document.createElement('div');line.textContent=(language==='java'?'Java':language==='c'?'C':'Python')+': '+(status?.solved?T('✓ 통과'):status?T('진행 중'):T('미제출'));box.append(line);}$('detail-grid').append(box);}
 choices=[...detail.submissions.map(s=>({...s,kind:'submit'})),...detail.drafts.map(d=>({...d,kind:'draft'}))].filter(item=>!detailProblemId||item.problem===detailProblemId);for(const [i,item] of choices.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${item.problem} · ${item.language} · ${item.kind==='draft'?T('저장된 초안'):item.solved?T('통과'):item.passed+'/'+item.total} · ${time(item.created_at||item.updated_at)}${item.source==='legacy'?T(' · 기존 기록'):''}`;$('submission-select').append(option);}showCode();
 }catch(error){$('detail-title').textContent=T('조회 실패');$('detail-summary').textContent=error.message;}
}
function showCode(){const item=choices[Number($('submission-select').value)];$('submission-report').replaceChildren();$('submission-code').textContent=item?.code||T('아직 저장된 코드가 없습니다.');$('submission-meta').textContent=item?(item.source==='legacy'?T('브라우저에 남아 있던 기록을 가져온 제출입니다.'):item.kind==='draft'?T('작성 중인 초안입니다. 채점 결과가 아닙니다.'):T('브라우저 자동채점 결과 · ')+time(item.created_at)):'';if(item?.report?.error){const p=document.createElement('p');p.textContent=messageText(item.report.error);$('submission-report').append(p);}for(const row of item?.report?.rows||[]){const p=document.createElement('p');p.textContent=(row.ok?'✓':'✗')+T(' 검사 ')+row.number+' '+messageText(row.message);$('submission-report').append(p);}}
$('submission-select').onchange=showCode;$('detail-close').onclick=()=>$('student-detail').close();
function passwordDialog(){$('password-form').reset();$('password-error').textContent='';$('password-title').textContent=T('관리자 비밀번호 변경');$('password-dialog').showModal();}
$('admin-change-password').onclick=passwordDialog;$('password-cancel').onclick=()=>$('password-dialog').close();
$('password-form').onsubmit=async event=>{event.preventDefault();$('password-submit').disabled=true;try{await request('admin-password',{password:$('new-password').value});$('password-dialog').close();signOut();$('admin-login-error').textContent=T('비밀번호를 변경했습니다. 새 비밀번호로 로그인하세요.');}catch(error){$('password-error').textContent=error.message;}finally{$('password-submit').disabled=false;}};
$('admin-csv').onclick=()=>{if(studentView==='problems'){exportProblemRows(visibleProblems().flatMap(summary=>summary.rows.map(row=>({problem:summary.problem,...row}))),T('알고리즘_문제별_진행현황_')+section+'.csv');return;}const quote=value=>'"'+String(value).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';const lines=[[T('반'),T('학번'),T('이름'),T('해결 문제'),T('총 문제'),T('채점 제출'),T('최근 활동')],...sortedStudents().map(s=>[s.section,s.student_no,s.name,s.solved,selectedTotal(),s.attempts,s.last_seen])].map(row=>row.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+lines],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=T('알고리즘_진행현황_')+section+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
if(typeof window!=='undefined')loadAdminProblemCatalog().then(()=>{if(token)render();}).catch(error=>{$('admin-status').textContent=error.message;});
if(token){$('admin-login-panel').hidden=true;$('admin-workspace').hidden=false;refresh();}
