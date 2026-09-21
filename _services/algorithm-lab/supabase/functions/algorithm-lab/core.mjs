import {hintInput,generateHint} from './ai-hint.mjs';
import {visit,requestIP} from './analytics.mjs';
export const TOTALS={"P01":10,"P02":21,"P03":7,"P04":8,"P05":7,"P06":7,"P07":7,"P08":8,"P09":11,"P10":11,"P11":8,"P12":9,"P13":6,"P14":6,"P15":7,"P16":6,"P17":6,"P18":7,"P19":7,"P20":4,"P21":5,"P22":8,"P23":6,"P24":5,"P25":5,"P26":5,"P27":7,"P28":7,"P29":6,"P30":7,"P31":6,"P32":5,"P33":5,"P34":7,"P35":7,"P36":6,"P37":6,"P38":7,"P39":7,"P40":7,"P41":7,"P42":8,"P43":6,"P44":5,"P45":5,"P46":7,"P47":12,"P48":12,"P49":12,"P50":12,"P51":6,"P52":6,"P53":11,"P54":11,"P55":6,"P56":4,"P57":5,"P58":11,"P59":4,"P60":5,"P61":4,"P62":5,"P63":6,"P64":3,"P65":5,"P66":11,"P67":6,"P68":4,"P69":5,"P70":5,"P71":5,"P72":5,"P73":4,"P74":3,"P75":4,"P76":5,"P77":6,"P78":6,"P79":6,"P80":5,"P81":5,"P82":5,"P83":6,"P84":5,"P85":6,"P86":6};
export class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export const fail=(status,message)=>{throw new HttpError(status,message);};
export const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
export const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest=async text=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))));
export async function hashPassword(password,salt){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},key,256)));
}
export function same(a,b){let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
export function password(value){if(typeof value!=='string'||value.length<8||value.length>128)fail(400,'비밀번호는 8~128자로 입력하세요.');return value;}
export function identity(body){
  const section=String(body.section||''),student_no=String(body.student_no||'').trim(),name=String(body.name||'').trim();
  if(!['01','02'].includes(section)||!/^\d{6,12}$/.test(student_no)||name.length<1||name.length>40)fail(400,'반·학번(숫자 6~12자리)·이름을 확인하세요.');
  return {section,student_no,name};
}
export function draft(body){
  if(!Object.hasOwn(TOTALS,body.problem)||!['python','c'].includes(body.language)||typeof body.code!=='string'||body.code.length>20000)fail(400,'문제·언어·코드 형식이 올바르지 않습니다. 코드는 20,000자까지 저장됩니다.');
  return {problem:body.problem,language:body.language,code:body.code};
}
export function submission(body){
  const item=draft(body),report=body.report||{},total=TOTALS[item.problem];
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id||''))fail(400,'제출 식별자가 올바르지 않습니다.');
  const error=typeof report.error==='string'?report.error.slice(0,6000):null;
  if(!error&&(!Number.isInteger(report.passed)||report.passed<0||report.passed>total||report.total!==total))fail(400,'채점 결과 형식이 올바르지 않습니다.');
  const passed=error?0:report.passed;
  return {...item,id:body.id,passed,total,solved:passed===total,source:body.source==='legacy'?'legacy':'browser',
    report:{error,passed,total,rows:Array.isArray(report.rows)?report.rows.slice(0,total).map(r=>({number:r.number,ok:!!r.ok,message:String(r.message||'').slice(0,500)})):[]}};
}
export function createHandler({env,fetcher=fetch}){
  const origins=new Set(['https://sangdon-park.github.io']);
  const url=env('SUPABASE_URL'),key=env('SUPABASE_SERVICE_ROLE_KEY');
  async function db(path,method='GET',body,prefer='return=representation'){
    const response=await fetcher(url+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:prefer},body:body===undefined?undefined:JSON.stringify(body)});
    const text=await response.text();let data;try{data=text?JSON.parse(text):null;}catch{data=null;}
    if(!response.ok){if(response.status===409)fail(409,'이미 등록된 학번입니다. 로그인하거나 교수님께 비밀번호 초기화를 요청하세요.');throw new Error('Database request failed: '+response.status);}
    return data;
  }
  const table=name=>'dju_algolab_'+name;
  async function limit(key,window,max){if(!await db('rpc/dju_algolab_rate_limit','POST',{p_key:key,p_window:window,p_limit:max}))fail(429,'요청이 너무 많습니다. 잠시 후 다시 시도하세요.');}
  async function session(req,role){
    const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
    if(!/^[a-f0-9]{64}$/.test(token))fail(401,'로그인이 필요합니다.');
    const rows=await db(table('sessions')+'?token_hash=eq.'+await digest(token)+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=*');
    const record=rows[0];if(!record)fail(401,'로그인이 만료되었습니다. 다시 로그인하세요.');
    if(role&&record.role!==role)fail(403,'접근 권한이 없습니다.');return record;
  }
  async function issue(role,id=null){const token=random();await db(table('sessions'),'POST',{token_hash:await digest(token),role,student_id:id,expires_at:new Date(Date.now()+(role==='admin'?8*3600:30*86400)*1000).toISOString()});return token;}
  async function state(id){
    const [students,drafts,passed]=await Promise.all([
      db(table('students')+'?id=eq.'+id+'&select=id,section,student_no,name,current_problem,current_language'),
      db(table('drafts')+'?student_id=eq.'+id+'&select=problem,language,code,updated_at'),
      db('rpc/dju_algolab_passed','POST',{p_student:id})]);
    return {student:students[0],drafts,passed,problemTotals:TOTALS};
  }
  async function touch(id,body){const patch={last_seen:new Date().toISOString()};if(Object.hasOwn(TOTALS,body.problem))patch.current_problem=body.problem;if(['python','c'].includes(body.language))patch.current_language=body.language;await db(table('students')+'?id=eq.'+id,'PATCH',patch);}
  async function upsertDraft(id,body){await db(table('drafts')+'?on_conflict=student_id,problem,language','POST',{student_id:id,...draft(body),updated_at:new Date().toISOString()},'resolution=merge-duplicates,return=minimal');}
  return async req=>{
    const origin=req.headers.get('Origin');
    const cors={'Access-Control-Allow-Origin':origin&&origins.has(origin)?origin:'https://sangdon-park.github.io','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8'};
    const respond=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
    if(origin&&!origins.has(origin))return respond({error:'허용되지 않은 사이트입니다.'},403);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
    if(req.method!=='POST')return respond({error:'POST 요청만 허용됩니다.'},405);
    try{
      if(Number(req.headers.get('Content-Length')||0)>600000)fail(413,'전송 크기를 초과했습니다.');
      const raw=await req.text();if(raw.length>600000)fail(413,'전송 크기를 초과했습니다.');
      let body;try{body=JSON.parse(raw);}catch{fail(400,'잘못된 요청입니다.');}
      if(!body||typeof body!=='object')fail(400,'잘못된 요청입니다.');
      const action=body.action;
      if(action==='site-visit'){
        let record;try{record=visit(body,req);}catch{fail(400,'Invalid visit.');}
        await limit('site:'+await digest((requestIP(req)||'unknown')+env('ALGOLAB_PEPPER')),60,600);
        record.visitor_hash=await digest(env('ALGOLAB_PEPPER')+':site:'+body.visitor);
        await db('dju_site_visits?on_conflict=id','POST',record,'resolution=ignore-duplicates,return=minimal');
        return respond({ok:true});
      }

      if(['enter','register','login','admin-login'].includes(action)){
        const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
        // Classroom NATs share an IP: use both a generous IP budget and a per-account budget.
        const ipHash=await digest(ip+env('ALGOLAB_PEPPER'));
        await limit('ip:'+ipHash,900,500);
        const account=action==='admin-login'?'admin':String(body.section)+':'+String(body.student_no);
        await limit('login:'+await digest(account+':'+ipHash),900,15);
      }
      if(action==='enter'){
        const person=identity(body);
        const path=table('students')+'?section=eq.'+person.section+'&student_no=eq.'+person.student_no+'&select=*';
        let rows=await db(path);
        if(!rows.length){
          // Retain legacy NOT NULL columns without requiring a student password.
          try{rows=await db(table('students'),'POST',{...person,password_salt:random(),password_hash:random()});}
          catch(error){if(!(error instanceof HttpError)||error.status!==409)throw error;rows=await db(path);}
        }
        if(!rows[0]||rows[0].name!==person.name)fail(400,'이 학번에 등록된 이름과 다릅니다. 반·학번·이름을 확인하세요.');
        await touch(rows[0].id,{});
        return respond({token:await issue('student',rows[0].id),...await state(rows[0].id)});
      }
      if(action==='register'){
        const person=identity(body),secret=password(body.password);
        if(!same(String(body.join_code||''),env('ALGOLAB_JOIN_'+person.section)||random()))fail(403,'반별 참여 코드를 확인하세요.');
        const salt=random(),hash=await hashPassword(secret,salt);
        const rows=await db(table('students'),'POST',{...person,password_salt:salt,password_hash:hash});
        return respond({token:await issue('student',rows[0].id),...await state(rows[0].id)});
      }
      if(action==='login'){
        if(!['01','02'].includes(body.section)||!/^\d{6,12}$/.test(body.student_no||''))fail(400,'반과 학번을 확인하세요.');
        const rows=await db(table('students')+'?section=eq.'+body.section+'&student_no=eq.'+body.student_no+'&select=*');
        const person=rows[0],hash=await hashPassword(String(body.password||'').slice(0,129),person?.password_salt||'no-account');
        if(!person||!same(hash,person.password_hash))fail(401,'반·학번 또는 비밀번호가 맞지 않습니다.');
        return respond({token:await issue('student',person.id),...await state(person.id)});
      }
      if(action==='admin-login'){
        const settings=await db(table('settings')+'?key=eq.admin_password&select=value');
        const configured=settings[0]?.value||{hash:env('ALGOLAB_ADMIN_HASH'),salt:env('ALGOLAB_ADMIN_SALT')};
        const hash=await hashPassword(String(body.password||'').slice(0,129),configured.salt||'unset');
        if(!configured.hash||!same(hash,configured.hash))fail(401,'관리자 비밀번호가 맞지 않습니다.');
        return respond({token:await issue('admin')});
      }
      if(action==='logout'){const auth=await session(req);await db(table('sessions')+'?token_hash=eq.'+auth.token_hash,'DELETE');return respond({ok:true});}
      const admin=String(action).startsWith('admin-'),auth=await session(req,admin?'admin':'student');
      await limit('session:'+auth.token_hash,60,admin?60:180);
      if(action==='ai-hint'){
        draft(body);
        const input=hintInput(body,fail);
        if(!env('GEMINI_API_KEY'))fail(503,'AI 힌트는 준비 중입니다. 잠시 후 다시 이용해 주세요.');
        await limit('hint:student:'+auth.student_id,15,1);
        await limit('hint:day:'+auth.student_id,86400,30);
        await limit('hint:global',86400,1000);
        return respond(await generateHint({body,input,env,fetcher,fail}));
      }
      if(action==='state')return respond(await state(auth.student_id));
      if(action==='change-section'){
        if(!['01','02'].includes(body.section))fail(400,'01분반 또는 02분반을 선택하세요.');
        let rows;
        try{rows=await db(table('students')+'?id=eq.'+auth.student_id+'&select=id,section,student_no,name,current_problem,current_language','PATCH',{section:body.section});}
        catch(error){if(error instanceof HttpError&&error.status===409)fail(409,'해당 분반에 같은 학번의 계정이 있습니다. 기록 통합은 교수님께 요청하세요.');throw error;}
        if(!rows?.length)fail(401,'로그인이 만료되었습니다. 다시 로그인하세요.');
        return respond({student:rows[0]});
      }
      if(action==='heartbeat'){await touch(auth.student_id,body);return respond({ok:true});}
      if(action==='draft'){await upsertDraft(auth.student_id,body);await touch(auth.student_id,body);return respond({ok:true});}
      if(action==='submit'){
        const item=submission(body);
        // Idempotent retries cannot overwrite an earlier submission or another student's row.
        await db(table('submissions')+'?on_conflict=id','POST',{...item,student_id:auth.student_id},'resolution=ignore-duplicates,return=minimal');
        await upsertDraft(auth.student_id,item);await touch(auth.student_id,item);return respond({ok:true});
      }
      if(action==='history')return respond({submissions:await db(table('submissions')+'?student_id=eq.'+auth.student_id+'&order=created_at.desc&limit=100&select=id,problem,language,passed,total,solved,source,created_at')});
      if(action==='admin-site-stats'){
        const days=Number(body.days||7);if(![1,7,30,90,365].includes(days))fail(400,'Invalid period.');
        return respond(await db('rpc/dju_site_stats','POST',{p_days:days}));
      }
      if(action==='admin-site-visits'){
        const offset=Number(body.offset||0);if(!Number.isInteger(offset)||offset<0||offset>1000000)fail(400,'Invalid offset.');
        const days=Number(body.days||7);if(![1,7,30,90,365].includes(days))fail(400,'Invalid period.');
        const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
        const since=new Date(Date.parse(today+'T00:00:00+09:00')-(days-1)*86400000).toISOString();
        return respond({visits:await db('dju_site_visits?visited_at=gte.'+encodeURIComponent(since)+'&order=visited_at.desc,id.desc&limit=100&offset='+offset+'&select=id,visited_at,ip,path,referrer,browser,device')});
      }
      if(action==='admin-dashboard')return respond({students:await db('rpc/dju_algolab_dashboard','POST',{}),updated_at:new Date().toISOString()});
      if(action==='admin-student'){
        if(!/^[0-9a-f-]{36}$/i.test(body.student_id||''))fail(400,'학생 식별자가 올바르지 않습니다.');
        return respond({...await state(body.student_id),submissions:await db(table('submissions')+'?student_id=eq.'+body.student_id+'&order=created_at.desc&limit=200&select=*')});
      }
      if(action==='admin-password'){
        const salt=random(),hash=await hashPassword(password(body.password),salt);
        await db(table('settings')+'?on_conflict=key','POST',{key:'admin_password',value:{salt,hash}},'resolution=merge-duplicates');
        await db(table('sessions')+'?role=eq.admin','DELETE');return respond({ok:true});
      }
      fail(400,'지원하지 않는 요청입니다.');
    }catch(error){return respond({error:error instanceof HttpError?error.message:'서버 저장에 실패했습니다. 잠시 후 다시 시도하세요.'},error instanceof HttpError?error.status:500);}
  };
}
