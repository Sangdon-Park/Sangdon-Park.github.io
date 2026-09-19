// First-party visit analytics. No query strings, form values, names or source code.
(()=>{
  const allowed=['sangdon-park.github.io'];
  if(!allowed.includes(location.hostname)||/admin|site-stats|privacy/i.test(location.pathname))return;
  const en=document.documentElement.lang==='en';
  const footer=document.querySelector('footer')||document.body;
  const notice=document.createElement('small');notice.style.cssText='display:block;padding:8px;text-align:center;font:11px/1.6 sans-serif;color:inherit;opacity:.8';
  const link=document.createElement('a');link.href='/privacy.html';link.textContent=en?'Visit statistics & IP collection · Privacy / opt out':'방문 통계·IP 수집 안내 / 수집 해제';link.style.color='inherit';notice.append(link);footer.append(notice);
  try{
    if(localStorage.getItem('site-analytics-disabled')==='1'||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
    let stored;try{stored=JSON.parse(localStorage.getItem('site-analytics-visitor'));}catch{}
    if(!stored||Date.now()-stored.created>365*86400000||!/^[a-f0-9-]{36}$/.test(stored.id)){stored={id:crypto.randomUUID(),created:Date.now()};localStorage.setItem('site-analytics-visitor',JSON.stringify(stored));}
    const body=JSON.stringify({action:'site-visit',id:crypto.randomUUID(),visitor:stored.id,path:location.pathname,referrer:document.referrer?new URL(document.referrer).origin:''});
    fetch('https://tltrbkttwzvwghaplurl.supabase.co/functions/v1/algorithm-lab',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});
  }catch{/* Storage blocked: do not fingerprint or interfere with the page. */}
})();
