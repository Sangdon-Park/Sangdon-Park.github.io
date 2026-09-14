// Shared-PC cleanup: delete this lab's local records only, never server records.
(()=>{
  const button=document.getElementById('clear-browser');
  const dialog=document.createElement('dialog');dialog.id='browser-reset-dialog';
  const heading=document.createElement('h2');heading.textContent=UI_EN?'Reset this browser':'이 브라우저 초기화';
  const description=document.createElement('p');
  description.textContent=UI_EN?'Remove all students’ saved answers, progress, sign-in information and editor settings from this browser. Server records remain available when the same student joins again. Python/C runtime downloads are kept.':'이 브라우저에 남은 모든 학생의 답안·진도·접속 정보·편집기 설정을 지웁니다. 서버 기록은 유지되며 같은 학생 정보로 다시 접속하면 불러올 수 있습니다. Python/C 실행 환경 다운로드는 유지합니다.';
  const warning=document.createElement('p');warning.id='browser-reset-warning';warning.setAttribute('role','alert');
  const actions=document.createElement('div');actions.className='dialog-actions';
  const cancel=document.createElement('button');cancel.textContent=UI_EN?'Cancel':'취소';cancel.onclick=()=>dialog.close();
  const confirm=document.createElement('button');confirm.id='confirm-browser-reset';confirm.textContent=UI_EN?'Clear local records':'브라우저 기록 지우기';
  actions.append(cancel,confirm);dialog.append(heading,description,warning,actions);document.body.append(dialog);
  const owned=key=>key.startsWith('dju-algorithm-lab-')||key.startsWith('dju-algolab-');
  const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('dju-algolab-reset'):null;
  if(channel)channel.onmessage=()=>{
    if(typeof cloud!=='undefined')cloud.resetting=true;
    const adminToken=sessionStorage.getItem('dju-algolab-admin');
    if(adminToken)fetch('https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+adminToken},body:JSON.stringify({action:'logout'}),keepalive:true}).catch(()=>{});
    for(const key of Object.keys(sessionStorage))if(owned(key))sessionStorage.removeItem(key);
    location.reload();
  };
  button.onclick=()=>{
    let pending=0;
    for(const key of Object.keys(localStorage))if(key.startsWith('dju-algolab-outbox:')){try{pending+=JSON.parse(localStorage.getItem(key)).length;}catch{}}
    warning.textContent=pending?(UI_EN?`${pending} pending uploads will also be deleted. Cancel and wait for saving to finish if you need these answers.`:`아직 전송되지 않은 기록 ${pending}건도 삭제됩니다. 필요한 답안이면 취소한 뒤 서버 저장 완료를 기다리세요.`):'';
    dialog.showModal();
  };
  confirm.onclick=async()=>{
    confirm.disabled=true;cancel.disabled=true;button.disabled=true;
    if(typeof cloud!=='undefined'){cloud.resetting=true;clearTimeout(cloud.draftTimer);}
    if(typeof worker!=='undefined'&&worker)worker.terminate();
    const tokens=[];
    try{const stored=JSON.parse(localStorage.getItem('dju-algolab-session'));if(stored?.token)tokens.push(stored.token);}catch{}
    const admin=sessionStorage.getItem('dju-algolab-admin');if(admin)tokens.push(admin);
    // Revoke current sessions when online. Offline cleanup must still work.
    await Promise.allSettled(tokens.map(token=>fetch('https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'logout'}),signal:AbortSignal.timeout(3000)})));
    for(const store of [localStorage,sessionStorage])for(const key of Object.keys(store))if(owned(key))store.removeItem(key);
    // Keep only the selected display language for the new student.
    localStorage.setItem('dju-algolab-locale',UI_EN?'en':'ko');
    channel?.postMessage('reset');location.reload();
  };
})();
