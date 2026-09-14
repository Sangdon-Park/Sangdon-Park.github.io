const LAB_API='https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab';
const cloud={session:null,queue:[],flushing:false,draftTimer:null};
const cloudStatus=(text,error=false)=>{document.getElementById('cloud-status').textContent=text;document.getElementById('cloud-status').classList.toggle('cloud-error',error);};
async function labRequest(action,body={},token=cloud.session?.token){
  const response=await fetch(LAB_API,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(20000)});
  const data=await response.json();if(!response.ok){if(response.status===401&&cloud.session)cloud.expired=true;const error=new Error(T(data.error)||T('서버 요청 실패'));error.status=response.status;throw error;}return data;
}
function queueKey(){return 'dju-algolab-outbox:'+cloud.session.student.id;}
function saveQueue(){if(cloud.resetting)return false;try{localStorage.setItem(queueKey(),JSON.stringify(cloud.queue));return true;}catch{cloudStatus(T('저장 공간 부족 · 답안 파일을 내려받아 보관하세요.'),true);return false;}}
function enqueue(action,body,send=true){
  if(!cloud.session||cloud.resetting)return;
  if(action==='draft')cloud.queue=cloud.queue.filter(item=>!(item.action==='draft'&&item.body.problem===body.problem&&item.body.language===body.language));
  cloud.queue.push({action,body});if(saveQueue()&&send)flushCloud();
}
async function flushCloud(){
  if(cloud.resetting||cloud.flushing||!cloud.session||!cloud.queue.length)return;
  cloud.flushing=true;cloudStatus(T('서버에 저장 중…'));
  try{
    while(cloud.queue.length&&!cloud.resetting){const item=cloud.queue[0];await labRequest(item.action,item.body);cloud.queue=cloud.queue.filter(queued=>queued!==item);saveQueue();}
    cloudStatus(T('● 서버 저장 완료 · 교수님께 진행 상황 공유 중'));
  }catch(error){cloudStatus(error.status===401?T('연결이 만료되었습니다. 실습 시작 버튼을 눌러주세요.'):T('연결 대기 · 이 브라우저에 보관 중 / 자동 재시도'),true);}
  finally{cloud.flushing=false;}
}
function cloudDraft(problem,language,code){if(!cloud.session||cloud.resetting)return;enqueue('draft',{problem,language,code},false);clearTimeout(cloud.draftTimer);cloud.draftTimer=setTimeout(flushCloud,1200);}
function cloudAttempt(job,report){
  if(!cloud.session||job.mode!=='judge'||job.recorded)return;job.recorded=true;
  clearTimeout(cloud.draftTimer);
  enqueue('submit',{id:crypto.randomUUID(),problem:job.pid,language:job.language,code:job.code,report,source:'browser'});
}
function cloudAccount(data){
  cloud.expired=false;cloud.session={token:data.token,student:data.student};localStorage.setItem('dju-algolab-session',JSON.stringify(cloud.session));
  KEY='dju-algorithm-lab-v1:account:'+data.student.id;
  try{cloud.queue=JSON.parse(localStorage.getItem(queueKey())||'[]');}catch{cloud.queue=[];}
  let local;try{local=JSON.parse(localStorage.getItem(KEY));}catch{}
  const remote={answers:{},passed:{},student:data.student.student_no+' '+data.student.name,index:Number(data.student.current_problem.slice(1))-1,language:data.student.current_language};
  for(const d of data.drafts){const key=d.language==='c'?'c:'+d.problem:d.problem;remote.answers[key]=d.code;}
  for(const p of data.passed){const key=p.language==='c'?'c:'+p.problem:p.problem;if(!remote.passed[key])remote.passed[key]={code:p.code,passed:p.passed,total:p.total,at:p.created_at};}
  saved=local&&cloud.queue.length?{...local,student:remote.student}:remote;
  const changed=language!==(saved.language||'python');language=saved.language||'python';$('language').value=language;
  $('student').value=saved.student;$('student').readOnly=true;
  $('cloud-login').textContent=data.student.section+T('반 · ')+data.student.name;
  $('cloud-logout').hidden=false;$('cloud-history').hidden=false;
  const legacy=JSON.parse(localStorage.getItem('dju-algorithm-lab-v1')||'{}');$('cloud-import').hidden=!Object.keys(legacy.answers||{}).length;
  show(Math.max(0,Math.min(11,saved.index||0)));if(changed&&worker)boot();
  cloudStatus(T('● 실습 기록 연결 완료 · 진행 상황 자동 저장'));flushCloud();
}
async function cloudInit(){
  let session;try{session=JSON.parse(localStorage.getItem('dju-algolab-session'));}catch{}
  if(!session)return;
  try{const data=await labRequest('state',{},session.token);cloudAccount({...data,token:session.token});}
  catch(error){
    let local;try{local=JSON.parse(localStorage.getItem('dju-algorithm-lab-v1:account:'+session.student.id));}catch{}
    if(error.status!==401&&local){
      const drafts=Object.entries(local.answers||{}).map(([key,code])=>({problem:key.replace(/^c:/,''),language:key.startsWith('c:')?'c':'python',code}));
      const passed=Object.entries(local.passed||{}).map(([key,p])=>({...p,problem:key.replace(/^c:/,''),language:key.startsWith('c:')?'c':'python',created_at:p.at}));
      cloudAccount({token:session.token,student:{...session.student,current_problem:'P'+String((local.index||0)+1).padStart(2,'0'),current_language:local.language||'python'},drafts,passed});
      cloudStatus(T('연결 대기 · 이 PC에 저장된 답안으로 연습할 수 있습니다.'),true);
    }else cloudStatus(T('실습 시작 버튼을 눌러 반·학번·이름을 입력하세요.'),true);
  }
}
function initCloudUI(){
  const dialog=$('account-dialog'),form=$('account-form');
  const preferred=new URLSearchParams(location.search).get('section');if(['01','02'].includes(preferred))$('account-section').value=preferred;
  $('cloud-login').onclick=()=>{if(busy)return;if(cloud.session&&!cloud.expired){$('cloud-history').click();return;}form.reset();if(['01','02'].includes(preferred))$('account-section').value=preferred;if(cloud.session){$('account-section').value=cloud.session.student.section;$('account-number').value=cloud.session.student.student_no;$('account-name').value=cloud.session.student.name;}$('account-message').textContent='';dialog.showModal();};
  $('account-close').onclick=()=>dialog.close();
  form.onsubmit=async event=>{
    event.preventDefault();if(cloud.flushing){$('account-message').textContent=T('저장 요청이 끝난 뒤 다시 시도하세요.');return;}$('account-submit').disabled=true;$('account-message').textContent=T('확인 중…');
    try{const data=await labRequest('enter',{section:$('account-section').value,student_no:$('account-number').value.trim(),name:$('account-name').value.trim()},null);cloudAccount(data);dialog.close();}
    catch(error){$('account-message').textContent=error.message;}
    finally{$('account-submit').disabled=false;}
  };
  $('cloud-logout').onclick=async()=>{
    if(busy)return;clearTimeout(cloud.draftTimer);enqueue('draft',{problem:problems[index].id,language,code:getCode()});while(cloud.flushing)await new Promise(resolve=>setTimeout(resolve,100));
    if(cloud.queue.length){cloudStatus(T('전송 대기 기록이 있습니다. 연결 복구 후 로그아웃하세요.'),true);return;}
    try{await labRequest('logout');}catch{}
    localStorage.removeItem('dju-algolab-session');location.reload();
  };
  $('cloud-import').onclick=()=>{
    if(busy||!cloud.session)return;
    const legacy=JSON.parse(localStorage.getItem('dju-algorithm-lab-v1')||'{}');
    $('import-description').textContent=`${T("이 브라우저의 이전 답안 ")}${Object.keys(legacy.answers||{}).length}${T("개를 ")}${cloud.session.student.section}${T("반 ")}${cloud.session.student.name}${T(" 계정에 저장합니다. 이전 이름: ")}${legacy.student||T('미입력')}${T(". 본인의 답안인지 확인하세요. 같은 문제의 서버 초안은 가져온 코드로 바뀝니다.")}`;
    if(UI_EN)$('import-description').textContent=`Import ${Object.keys(legacy.answers||{}).length} previous answers from this browser into Section ${cloud.session.student.section}, ${cloud.session.student.name}. Previous name: ${legacy.student||'Not entered'}. Confirm these are your answers. Imported code replaces the saved draft for the same problem.`;
    $('import-dialog').showModal();
  };
  $('import-cancel').onclick=()=>$('import-dialog').close();
  $('import-confirm').onclick=()=>{
    const legacy=JSON.parse(localStorage.getItem('dju-algorithm-lab-v1')||'{}');
    for(const [key,code] of Object.entries(legacy.answers||{})){
      const language=key.startsWith('c:')?'c':'python',problem=key.replace(/^c:/,'');if(!problems.some(p=>p.id===problem))continue;
      saved.answers[key]=code;const record=legacy.passed?.[key];
      if(record&&record.code===code){saved.passed[key]=record;enqueue('submit',{id:crypto.randomUUID(),problem,language,code,source:'legacy',report:{passed:record.passed,total:record.total}});}
      else enqueue('draft',{problem,language,code});
    }
    persist();show(index);$('import-dialog').close();$('cloud-import').hidden=true;
  };
  $('cloud-history').onclick=async()=>{
    $('history-dialog').showModal();$('history-list').textContent=T('불러오는 중…');
    try{const data=await labRequest('history');$('history-list').replaceChildren();for(const item of data.submissions){const row=document.createElement('p');row.textContent=`${item.problem} · ${item.language==='c'?'C':'Python'} · ${item.solved?T('통과'):`${item.passed}/${item.total}`} · ${new Date(item.created_at).toLocaleString((UI_EN?'en-US':'ko-KR'))}${item.source==='legacy'?T(' · 기존 기록 가져옴'):''}`;$('history-list').append(row);}if(!data.submissions.length)$('history-list').textContent=T('아직 제출 기록이 없습니다.');}catch(error){$('history-list').textContent=error.message;}
  };
  $('history-close').onclick=()=>$('history-dialog').close();
  setInterval(()=>{if(cloud.resetting||!cloud.session||document.hidden)return;flushCloud();labRequest('heartbeat',{problem:problems[index]?.id,language}).catch(()=>{});},30000);
  window.addEventListener('online',flushCloud);
}
