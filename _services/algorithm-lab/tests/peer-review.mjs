import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/algorithm-lab/core.mjs';
import {skillBand} from '../supabase/functions/algorithm-lab/peer-review.mjs';
const ids=Array.from({length:5},(_,i)=>`${i+1}`.repeat(8)+'-1111-4111-8111-111111111111');
const students=ids.map((id,i)=>({id,section:i===3?'02':'01',student_no:'9999900'+i,name:'검증학생'+i,problems:[]}));
const reviews=[];const calls=[];
function matches(row,query){for(const [k,v] of query){if(['select','order','limit','on_conflict'].includes(k))continue;if(v==='is.null'&&row[k]!=null)return false;if(v.startsWith('eq.')&&String(row[k])!==v.slice(3))return false;}return true;}
const handler=createHandler({env:k=>k==='SUPABASE_URL'?'https://fixture.invalid':'fixture',fetcher:async(url,opts)=>{
 const u=new URL(url),table=u.pathname.split('/').at(-1),body=opts.body?JSON.parse(opts.body):null;calls.push({table,body,method:opts.method});
 if(table==='dju_algolab_sessions'){
  const hash=u.searchParams.get('token_hash').slice(3);
  const {digest}=await import('../supabase/functions/algorithm-lab/core.mjs');
  for(let i=0;i<5;i++)if(hash===await digest(String.fromCharCode(97+i).repeat(64)))return Response.json([{role:i===4?'admin':'student',student_id:i===4?null:ids[i],token_hash:hash}]);
  return Response.json([]);
 }
 if(table==='dju_algolab_rate_limit')return Response.json(true);
 if(table==='dju_algolab_dashboard')return Response.json(students);
 if(table==='dju_algolab_students')return Response.json(students.filter(s=>matches(s,u.searchParams)));
 if(table==='dju_algolab_peer_enqueue'){
  let mine=reviews.find(r=>r.id===body.p_id||r.owner_id===body.p_student&&r.problem===body.p_problem&&r.language===body.p_language&&!r.reflected_at);
  if(!mine){mine={id:body.p_id,owner_id:body.p_student,section:body.p_section,problem:body.p_problem,language:body.p_language,original_code:body.p_code,explanation:body.p_explanation,skill_count:body.p_skill,skill_band:body.p_band,created_at:new Date().toISOString(),partner_id:null,feedback:null,reflection:null,assessment:null};reviews.push(mine);
   const peer=reviews.find(r=>r!==mine&&r.owner_id!==mine.owner_id&&!r.partner_id&&r.section===mine.section&&r.problem===mine.problem&&r.language===mine.language&&r.skill_band===mine.skill_band);
   if(peer){mine.partner_id=peer.id;peer.partner_id=mine.id;mine.matched_at=peer.matched_at=new Date().toISOString();}
  }return Response.json(mine);
 }
 if(table==='dju_algolab_peer_reviews'){
  const rows=reviews.filter(r=>matches(r,u.searchParams));
  if(opts.method==='PATCH')rows.forEach(r=>Object.assign(r,body));
  const selected=u.searchParams.get('select');return Response.json(selected&&selected!=='*'?rows.map(r=>Object.fromEntries(selected.split(',').map(k=>[k,r[k]??null]))):rows);
 }
 throw Error('Unexpected DB request '+url);
}});
async function send(action,body={},who=0){const response=await handler(new Request('https://fixture.invalid',{method:'POST',headers:{Authorization:'Bearer '+String.fromCharCode(97+who).repeat(64),Origin:'https://sangdon-park.github.io'},body:JSON.stringify({action,...body})}));return {status:response.status,data:await response.json()};}
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const submit={problem:'P01',language:'python',code:'def f(a):\n    return 0',explanation:'입력을 차례로 비교해 답을 찾습니다.'};
assert.equal((await send('peer-create',{id:a,...submit,skill_band:3,section:'02'})).status,200);
assert.equal(reviews[0].skill_band,0);assert.equal(reviews[0].section,'01');
assert.equal((await send('peer-create',{id:a,...submit})).status,200);assert.equal(reviews.length,1);
assert.equal((await send('peer-create',{id:b,...submit},1)).status,200);assert.equal(reviews[0].partner_id,b);assert.equal(reviews[1].partner_id,a);
let result=await send('peer-detail',{id:a});
const raw=JSON.stringify(result.data);
for(const secret of [...ids,...students.map(s=>s.student_no),...students.map(s=>s.name),'skill_band','skill_count','owner_id','partner_id',b])assert.ok(!raw.includes(secret),'Anonymous response leaked '+secret);
assert.equal((await send('peer-detail',{id:a},2)).status,404);
assert.equal((await send('peer-feedback',{id:b,strength:'남의 기록 변조'},0)).status,404);
assert.equal((await send('admin-peer-list',{},0)).status,403);
assert.equal((await send('peer-list',{},4)).status,403);
assert.equal((await send('peer-reflect',{id:a,decision:'accepted'})).status,409);
const feedback={strength:'반복 흐름이 명확합니다.',improvement:'빈 배열에서 경계 조건을 확인하세요.',test:'빈 배열을 넣으면 결과는 0이어야 합니다.',complexity:'반복은 n번이므로 O(n)입니다.'};
assert.equal((await send('peer-feedback',{id:a,...feedback})).status,200);
assert.equal((await send('peer-feedback',{id:a,...feedback})).status,200);
assert.equal((await send('peer-feedback',{id:a,...feedback,strength:'다른 내용으로 바꾸려는 요청'})).status,409);
assert.equal((await send('peer-detail',{id:b},1)).data.review.feedback,null,'Received feedback unlocked too early');
assert.equal((await send('peer-feedback',{id:b,...feedback},1)).status,200);
assert.deepEqual((await send('peer-detail',{id:a})).data.review.feedback,feedback);
const reflection={decision:'partial',reason:'빈 배열 처리는 반영하고 나머지는 검증했습니다.',revised_code:'def f(a):\n    return len(a)',verification:'빈 배열과 원소 하나 입력을 다시 실행했습니다.'};
assert.equal((await send('peer-reflect',{id:a,...reflection})).status,200);
assert.equal((await send('peer-reflect',{id:a,...reflection})).status,200);
assert.equal((await send('admin-peer-assess',{id:a,score:7,comment:'잘 작성했습니다.'},4)).status,400);
assert.equal((await send('admin-peer-assess',{id:a,score:4,comment:'분석과 검증 근거가 충실합니다.'},4)).status,200);
assert.equal((await send('admin-peer-detail',{id:a},4)).data.review.owner.student_no,students[0].student_no);
assert.equal((await send('peer-detail',{id:a})).data.review.assessment.score,4);
const c='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
assert.equal((await send('peer-create',{id:c,...submit},3)).status,200);assert.equal(reviews.at(-1).partner_id,null,'Cross-section match');
const ranks=[0,1,2,3,4,5,6,7].map((n,i)=>({id:String(i),section:'01',problems:Array.from({length:n},(_,k)=>({problem:'P'+k,solved:true}))}));
const active=new Set(Array.from({length:8},(_,i)=>'P'+i));
assert.deepEqual(ranks.map(s=>skillBand(ranks,s,active).band),[0,0,1,1,2,2,3,3]);
assert.equal(skillBand(students,students[0],active).band,skillBand(students,students[1],active).band);
console.log('Anonymous peer review: queue, ability bands, mutual feedback gate, immutable evidence, reflection, instructor assessment, identity allowlist and cross-account access checks passed.');
