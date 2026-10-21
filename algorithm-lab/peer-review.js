const API='https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),teacher=params.get('view')==='teacher';
const english=(params.get('lang')||localStorage.getItem('dju-algolab-locale'))==='en';
const L=(ko,en)=>english?en:ko;
let account=null,token='',state=null,records=[],selected=null,dirty=false,loading=false,pollTimer=null,newId=crypto.randomUUID();
let problemBank=[];
const bankReady=Promise.all(['problems.json','chapter-02.json','exercise-problems.json'].map(async file=>{const r=await fetch(file);if(!r.ok)throw Error('Problem bank unavailable');return r.json();})).then(banks=>{problemBank=banks.flat();}).catch(()=>{});
try{account=JSON.parse(localStorage.getItem('dju-algolab-session'));}catch{}
token=teacher?sessionStorage.getItem('dju-algolab-admin')||'':account?.token||'';
const el=(parent,tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;parent.append(node);return node;};
const time=t=>t?new Date(t).toLocaleString(english?'en-US':'ko-KR'):'';
const message=text=>{$('status').textContent=text;};
const phase=r=>(r.assessed_at||r.assessment)?L('교원 평가 완료','Instructor assessed'):r.reflected_at?L('수정·성찰 완료','Reflection submitted'):r.matched_at?L('익명 리뷰 진행','Anonymous review'):L('매칭 대기','Waiting for a match');
async function api(action,body={}){
 const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok){const error=Error(data.error||'Request failed');error.status=response.status;throw error;}return data;
}
function field(form,name,label,value='',code=false,max=2000){
 const wrap=el(form,'label',label),input=el(wrap,'textarea');input.name=name;input.required=true;input.maxLength=max;input.value=value;if(code)input.className='code';return input;
}
function formFor(parent,key,submit){
 const form=el(parent,'form'),storageKey='dju-algolab-peer-form:'+account?.student?.id+':'+key;
 let cache={};try{cache=JSON.parse(sessionStorage.getItem(storageKey)||'{}');}catch{}
 form.addEventListener('input',()=>{dirty=true;try{sessionStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(new FormData(form))));}catch{}});
 form.onsubmit=async event=>{
  event.preventDefault();if(form.dataset.busy)return;form.dataset.busy='true';form.querySelectorAll('button').forEach(b=>b.disabled=true);
  let errorNode=form.querySelector('.form-message');if(!errorNode)errorNode=el(form,'p','','form-message');errorNode.textContent=L('저장 중…','Saving…');
  try{await submit(Object.fromEntries(new FormData(form)));sessionStorage.removeItem(storageKey);dirty=false;}
  catch(error){errorNode.textContent=error.message;}
  finally{delete form.dataset.busy;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
 };
 return {form,restore(){for(const node of form.elements)if(node.name&&cache[node.name]!==undefined)node.value=cache[node.name];}};
}
function codeBlock(parent,title,code){const d=el(parent,'details');el(d,'summary',title);el(d,'pre',code);return d;}
function feedbackBlock(parent,title,feedback){
 el(parent,'h3',title);for(const [key,ko,en] of [['strength','좋은 점','Strengths'],['improvement','개선 의견과 근거','Improvements and reasons'],['test','추가 테스트와 예상 결과','Additional test and expected output'],['complexity','시간 복잡도','Time complexity']]){el(parent,'strong',L(ko,en));el(parent,'p',feedback[key]);}
}
async function openReview(id,silent=false){
 await bankReady;
 const data=await api(teacher?'admin-peer-detail':'peer-detail',{id});
 if(silent&&selected?.id!==id)return;
 if(silent&&dirty)return;
 selected=data.review;renderDetail();renderList();
}
function renderDetail(){
 const r=selected,root=$('detail');root.replaceChildren();dirty=false;
 el(root,'h2',r.problem+' · '+r.language+' · '+L('익명 짝 리뷰','Anonymous pair review'));
 el(root,'p',phase(r),'pair-status');
 if(teacher)el(root,'p',`${r.owner?.section} / ${r.owner?.student_no} ${r.owner?.name} · ${L('짝','Partner')}: ${r.reviewer?.name||L('대기','Waiting')}`);
 el(root,'p',L('상대에게 이름·학번은 표시되지 않습니다. 코드·설명·피드백에도 본인이나 친구의 이름·학번을 쓰지 마세요.','Names and student numbers are hidden. Do not include identities in code, explanations, or feedback.'),'muted');
 const problem=problemBank.find(p=>p.id===r.problem);
 if(problem){
  el(root,'h3',(problem.chapter||1)+L('강 · ',' / ')+(problem.exercise?L('연습문제 ','Exercise ')+problem.exercise+' · ':'')+problem.title);
  const view=r.language==='c'?(problem.c||C_PROBLEMS[problem.id]||problem):r.language==='java'?javaView(problem):problem;
  const prompt=el(root,'details');el(prompt,'summary',L('문제 설명·함수 형식 보기','Problem statement and function contract'));el(prompt,'p',view.statement);el(prompt,'pre',view.starter);
  const link=el(prompt,'a',L('코딩연습에서 문제·예제 확인','Open problem and examples in practice'));link.href='./?chapter='+(problem.chapter||1)+'&problem='+encodeURIComponent(r.problem)+'&code='+r.language;
 }
 codeBlock(root,L('내 원본 코드','My original code'),r.original_code);
 el(root,'p',r.explanation);
 if(!r.partner){el(root,'p',L('같은 분반·문제·언어에서 풀이 진행도가 비슷한 학생을 기다리고 있습니다. 이 화면은 10초마다 확인합니다.','Waiting for a student in the same section, problem, language, and progress band. Updates every 10 seconds.'));return;}
 const other=codeBlock(root,L('익명 짝의 코드','Anonymous partner code'),r.partner.original_code);other.open=true;el(other,'p',r.partner.explanation);
 if(!r.my_feedback&&!teacher){
  el(root,'h3',L('짝에게 보낼 리뷰','Review your partner'));
  const f=formFor(root,r.id+':feedback',async values=>{await api('peer-feedback',{id:r.id,...values});await openReview(r.id);});
  for(const [key,ko,en] of [['strength','좋은 점','Strengths'],['improvement','개선 의견과 근거','Improvements and reasons'],['test','추가 테스트와 예상 결과','Additional test and expected output'],['complexity','시간 복잡도','Time complexity']])field(f.form,key,L(ko,en),'',false,1500).minLength=5;
  el(f.form,'p',L('각 항목 5자 이상. 제출한 리뷰는 활동 기록으로 보존됩니다.','At least 5 characters per field. Submitted reviews are preserved as activity records.'),'muted');
  el(f.form,'button',L('익명 리뷰 제출','Submit anonymous review'));f.restore();
 }else if(r.my_feedback)feedbackBlock(root,L('내가 보낸 리뷰','Review I sent'),r.my_feedback);
 if(!r.feedback){el(root,'p',L('서로 리뷰를 제출하면 받은 의견이 공개됩니다.','Received feedback appears after both partners submit a review.'));return;}
 feedbackBlock(root,L('짝에게 받은 리뷰','Feedback from my partner'),r.feedback);
 if(!r.reflection&&!teacher){
  el(root,'h3',L('수정·검증·성찰','Revision, verification, and reflection'));
  const f=formFor(root,r.id+':reflection',async values=>{await api('peer-reflect',{id:r.id,...values});await openReview(r.id);});
  const label=el(f.form,'label',L('피드백 반영 여부','Feedback decision')),select=el(label,'select');select.name='decision';
  for(const [v,ko,en] of [['accepted','반영','Accepted'],['partial','일부 반영','Partly accepted'],['rejected','미반영·근거 제시','Not accepted, with reasons']])el(select,'option',L(ko,en)).value=v;
  field(f.form,'reason',L('판단 근거와 수정 내용','Reasons and changes')).minLength=5;
  field(f.form,'revised_code',L('수정·최종 코드','Revised or final code'),r.original_code,true,20000);
  field(f.form,'verification',L('재실행 결과·배운 점·다음 목표','Rerun results, learning, and next goal')).minLength=5;
  el(f.form,'button',L('수정·성찰 제출','Submit reflection'));f.restore();
 }else if(r.reflection){
  const decisions={accepted:L('반영','Accepted'),partial:L('일부 반영','Partly accepted'),rejected:L('미반영·근거 제시','Not accepted, with reasons')};
  el(root,'h3',L('수정·성찰 기록','Reflection record'));el(root,'p',decisions[r.reflection.decision]+' · '+r.reflection.reason);codeBlock(root,L('최종 코드','Final code'),r.reflection.revised_code);el(root,'p',r.reflection.verification);
 }
 if(r.assessment){const box=el(root,'div','','assessment');el(box,'h3',L('교원 평가','Instructor assessment')+' '+r.assessment.score+' / 5');el(box,'p',r.assessment.comment);}
 if(teacher){
  const button=el(root,'button',L('이 기록 증빙 JSON 내려받기','Download evidence JSON'));button.type='button';button.onclick=()=>download('code-review-'+r.id+'.json',JSON.stringify(r,null,2),'application/json');
  if(r.reflection){
   el(root,'h3','역량평가 기록');el(root,'p','분석·근거 2점, 검증·수정 1점, 피드백 검토 1점, 성찰 1점. 평소 코딩테스트 기록과 함께 교원이 평가합니다.');
   const f=formFor(root,r.id+':assess',async values=>{await api('admin-peer-assess',{id:r.id,score:Number(values.score),comment:values.comment});await openReview(r.id);});
   const label=el(f.form,'label','점수 / 5'),input=el(label,'input');input.name='score';input.type='number';input.min=0;input.max=5;input.step=.5;input.required=true;input.value=r.assessment?.score??'';
   field(f.form,'comment','평가 근거',r.assessment?.comment||'').minLength=5;el(f.form,'button','교원 평가 저장');f.restore();
  }
 }
}
function renderList(){
 const root=$('review-list');root.replaceChildren();if(!records.length)el(root,'p',L('아직 리뷰 기록이 없습니다.','No review records yet.'));
 for(const row of records){const b=el(root,'button',row.problem+' · '+row.language+'\n'+phase(row)+'\n'+time(row.created_at));b.type='button';b.setAttribute('aria-current',String(selected?.id===row.id));b.onclick=()=>{if(dirty){message(L('작성 중인 내용은 이 탭에 임시 저장됩니다.','Draft fields are saved in this tab.'));}openReview(row.id).catch(e=>message(e.message));};}
}
async function refresh(silent=false){
 if(loading||!token)return;loading=true;
 try{records=(await api(teacher?'admin-peer-list':'peer-list')).reviews;renderList();if(selected)await openReview(selected.id,silent);}
 catch(error){message(error.message);if(error.status===401&&!teacher)$('login').hidden=false;}
 finally{loading=false;}
}
async function newReview(){
 state=await api('state');const root=$('detail');root.replaceChildren();selected=null;dirty=false;renderList();
 let current=null;try{current=JSON.parse(sessionStorage.getItem('dju-algolab-peer-draft:'+account.student.id));}catch{}
 const eligible=new Set(state.peerProblems||Object.keys(state.problemTotals));
 const drafts=[...state.drafts].filter(d=>d.code.trim()&&eligible.has(d.problem));
 if(current&&eligible.has(current.problem)){const at=drafts.findIndex(d=>d.problem===current.problem&&d.language===current.language);if(at>=0)drafts.splice(at,1);drafts.unshift(current);}
 if(!drafts.length){el(root,'p',L('코딩연습에서 코드를 작성한 뒤 리뷰를 신청하세요.','Write code in the practice workspace first.'));return;}
 el(root,'h2',L('내 풀이로 익명 리뷰 신청','Submit my code for anonymous review'));
 el(root,'p',L('같은 분반·문제·언어, 비슷한 풀이 진행도 안에서 자동 매칭합니다. 코드와 설명에 이름·학번을 쓰지 마세요.','Matching uses section, problem, language, and similar solution progress. Remove names and student numbers from code and explanations.'));
 const f=formFor(root,'create',async values=>{const d=drafts[Number(values.draft)];const {review}=await api('peer-create',{id:newId,problem:d.problem,language:d.language,code:values.code,explanation:values.explanation});newId=crypto.randomUUID();await refresh();await openReview(review.id);});
 const label=el(f.form,'label',L('공유할 풀이','Code to share')),select=el(label,'select');select.name='draft';
 for(const [i,d] of drafts.entries())el(select,'option',d.problem+' · '+d.language).value=i;
 const code=field(f.form,'code',L('공유할 원본 코드','Original code snapshot'),drafts[0].code,true,20000);
 select.onchange=()=>{code.value=drafts[Number(select.value)].code;};
 field(f.form,'explanation',L('해결 전략·시간 복잡도·검토받고 싶은 부분','Strategy, complexity, and review questions')).minLength=5;
 el(f.form,'button',L('이 코드로 익명 매칭 신청','Request an anonymous match'));f.restore();
}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportList(){const quote=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';download('code-review-evidence.csv','\ufeff'+[['review_id','section','problem','language','created_at','matched_at','reviewed_at','reflected_at','score','comment'],...records.map(r=>[r.id,r.section,r.problem,r.language,r.created_at,r.matched_at,r.reviewed_at,r.reflected_at,r.assessment?.score,r.assessment?.comment])].map(r=>r.map(quote).join(',')).join('\r\n'),'text/csv;charset=utf-8');}
async function init(){
 $('locale-toggle').textContent=english?'한국어':'English';$('locale-toggle').onclick=()=>{params.set('lang',english?'ko':'en');location.search=params;};
 $('back-link').textContent=L('교수자 관리로','Instructor dashboard');$('back-link').href=teacher?'admin.html':'./';if(!teacher)$('back-link').textContent=L('코딩연습으로','Practice workspace');
 $('notice').textContent=L('같은 분반·문제·언어에서 풀이 진행도가 비슷한 학생과 익명으로 서로의 코드를 검토합니다.','Review code anonymously with a student working on the same problem and language, with similar progress in your section.');
 document.querySelector('h1').textContent=L('익명 짝 코드 리뷰','Anonymous pair code review');
 $('list-heading').textContent=teacher?'코드 리뷰 운영·증빙':L('내 리뷰 기록','My reviews');$('new-review').textContent=L('내 풀이로 리뷰 신청','Submit my code');$('refresh').textContent=L('새로고침','Refresh');
 $('new-review').hidden=teacher;$('export-list').hidden=!teacher;$('export-list').onclick=exportList;
 $('new-review').onclick=()=>newReview().catch(e=>message(e.message));$('refresh').onclick=()=>refresh();
 if(!token){if(teacher){message('교수자 관리에서 로그인한 뒤 코드 리뷰를 열어 주세요.');return;}$('login').hidden=false;return;}
 if(!teacher){try{state=await api('state');account={...account,student:state.student};}catch(error){message(error.message);$('login').hidden=false;return;}}
 $('login').hidden=true;$('workspace').hidden=false;await refresh();
 if(!teacher&&params.has('new'))await newReview();
 clearInterval(pollTimer);pollTimer=setInterval(()=>{if(!document.hidden)refresh(true);},10000);
}
$('login-form').onsubmit=async event=>{event.preventDefault();try{const data=await api('enter',Object.fromEntries(new FormData(event.currentTarget)));account={token:data.token,student:data.student};token=data.token;localStorage.setItem('dju-algolab-session',JSON.stringify(account));await init();}catch(error){message(error.message);}};
init().catch(error=>message(error.message));
