import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHandler} from '../supabase/functions/algorithm-lab/core.mjs';
import {repeatsHint} from '../supabase/functions/algorithm-lab/ai-hint.mjs';
let role='student', configured=true, limited=false, upstream=200, text='반복문이 배열의 마지막 원소까지 확인하는지 살펴보세요.', finish='STOP';
let hintQueue=[],transportFailure=null;
const calls=[];
const handler=createHandler({env:name=>name==='GEMINI_API_KEY'?(configured?'private-fixture-key':''):name==='ALGOLAB_HINT_MODEL'?'': 'fixture',fetcher:async(url,options)=>{
  calls.push({url,...options});
  if(url.includes('dju_algolab_sessions?'))return Response.json([{role,student_id:'student-fixture',token_hash:'session-fixture'}]);
  if(url.includes('rate_limit'))return Response.json(!(limited&&JSON.parse(options.body).p_key.startsWith('hint:')));
  if(url.startsWith('https://generativelanguage.googleapis.com/')){if(transportFailure)throw transportFailure;return Response.json({candidates:[{finishReason:finish,content:{parts:[{text:JSON.stringify({hint:hintQueue.length?hintQueue.shift():text})}]}}]}, {status:upstream});}
  throw Error('Unexpected request');
}});
const body={problem:'P01',language:'python',locale:'ko',code:'def linear_search(A, target):\n    return -1',statement:'Find the first index.',execution:'{"passed":0,"total":2}',name:'DO NOT SEND NAME',solution:'DO NOT SEND SOLUTION'};
const send=(patch={},token='a'.repeat(64))=>handler(new Request('https://fixture.invalid',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({action:'ai-hint',...body,...patch})}));
assert.equal((await send({},'')).status,401);
role='admin';assert.equal((await send()).status,403);role='student';
assert.equal((await send({problem:'bad'})).status,400);
assert.equal((await send({locale:'xx'})).status,400);
assert.equal((await send({code:'x'.repeat(20001)})).status,400);
for(const history of ['bad',[null],[''],Array(11).fill('hint'),['x'.repeat(641)]])assert.equal((await send({history})).status,400);
for(const step of [0,1.5,101])assert.equal((await send({step})).status,400);
assert.equal((await send({history:['earlier'],step:1})).status,400);
configured=false;assert.equal((await send()).status,503);configured=true;
assert.equal(calls.filter(c=>c.url.includes('googleapis')).length,0);
for(const locale of ['ko','en','es-ES','es-419'])assert.equal((await send({locale})).status,200);
const google=calls.find(c=>c.url.includes('googleapis'));
assert.match(google.url,/gemini-3\.7-flash:generateContent$/);
assert.equal(google.headers['x-goog-api-key'],'private-fixture-key');
assert.ok(!google.body.includes('DO NOT SEND'));
assert.ok(!google.body.includes('student-fixture'));
assert.match(JSON.parse(google.body).systemInstruction.parts[0].text,/Never provide a solution/);
assert.match(JSON.parse(google.body).systemInstruction.parts[0].text,/ADVANCE/);
assert.ok(calls.some(c=>c.body&&JSON.parse(c.body).p_limit===30));
assert.ok(calls.some(c=>c.body&&JSON.parse(c.body).p_limit===1000));
limited=true;const before=calls.length;const throttled=await send();assert.equal(throttled.status,429);assert.ok((await throttled.json()).retryAfter>0);assert.ok(!calls.slice(before).some(c=>c.url.includes('googleapis')));limited=false;
upstream=403;let response=await send();assert.equal(response.status,502);assert.ok(!(await response.text()).includes('private-fixture-key'));upstream=200;
for(text of ['```python\nreturn 4\n```','x'.repeat(641),''])assert.equal((await send()).status,502);
text='Check the loop boundary.';finish='MAX_TOKENS';assert.equal((await send()).status,502);finish='STOP';
assert.ok(repeatsHint(' CHECK the loop boundary! ',['Check the loop boundary.']));
assert.ok(!repeatsHint('Move the final return outside the loop.',[text]));
hintQueue=[text,'Move the final return outside the loop so later elements can be inspected.'];
const duplicateStart=calls.length;
response=await send({history:[text],step:2});assert.equal(response.status,200);
assert.equal((await response.json()).step,2);
const retryCalls=calls.slice(duplicateStart).filter(c=>c.url.includes('googleapis'));
assert.equal(retryCalls.length,2,'Repeated output must be regenerated once.');
assert.deepEqual(JSON.parse(JSON.parse(retryCalls[0].body).contents[0].parts[0].text).history,[text]);
assert.ok(JSON.parse(retryCalls[1].body).systemInstruction.parts[0].text.includes('Regenerate'));
hintQueue=['Insert the missing increment so the loop moves forward.','Trace i=0 through one iteration: without an increment the next read is still A[0].'];
const semanticStart=calls.length;
response=await send({history:['Advance i after adding the element.'],step:2});assert.equal(response.status,200);
const semanticCalls=calls.slice(semanticStart).filter(c=>c.url.includes('googleapis'));
assert.equal(semanticCalls.length,2,'Continuations must review meaning, even when strings differ.');
assert.match(JSON.parse(semanticCalls[1].body).systemInstruction.parts[0].text,/MEANING/);
assert.equal(JSON.parse(JSON.parse(semanticCalls[1].body).contents[0].parts[0].text).proposalHint,'Insert the missing increment so the loop moves forward.');
const allRepeated=calls.length;response=await send({history:[text]});assert.equal(response.status,502);
assert.equal((await response.json()).reason,'repeated_hint');
assert.equal(calls.slice(allRepeated).filter(c=>c.url.includes('googleapis')).length,2,'No unbounded duplicate retry.');
upstream=503;const transientStart=calls.length;response=await send();assert.equal(response.status,503);assert.equal((await response.json()).reason,'provider_busy');assert.equal(calls.slice(transientStart).filter(c=>c.url.includes('googleapis')).length,2);upstream=200;
for(const [name,reason] of [['TimeoutError','provider_timeout'],['TypeError','provider_network']]){
  transportFailure=Object.assign(new Error('Private provider error must stay private'),{name});
  const start=calls.length;response=await send();assert.equal(response.status,503);
  const data=await response.json();assert.equal(data.reason,reason);assert.ok(!JSON.stringify(data).includes('Private provider'));
  assert.equal(calls.slice(start).filter(c=>c.url.includes('googleapis')).length,2);
}
transportFailure=null;

// Frontend: progression, storage, failure recovery, account/language/problem isolation and races.
class Element {constructor(){this.textContent='';this.hidden=true;this.children=[];}append(...children){this.children.push(...children);}replaceChildren(...children){this.children=children;}}
let clock=100000;class Clock extends Date {static now(){return clock;}}
const storage=new Map(),requests=[];
function fixture(){
  const elements=Object.fromEntries(['ai-hint','ai-hint-result','ai-hint-history'].map(id=>[id,new Element()]));
  const ctx=vm.createContext({Date:Clock,AbortController,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
    document:{getElementById:id=>elements[id],createElement:()=>new Element()},busy:false,cloud:{session:{token:'fixture-token',student:{id:'fixture'}}},
    problems:[{id:'P01',title:'Find',statement:'Task',solution:'SECRET'},{id:'P02',title:'Other',statement:'Other task'}],index:0,language:'python',UI_LOCALE:'en',
    C_PROBLEMS:{P01:{statement:'C task'}},T:x=>x,controls:()=>vm.runInContext('aiHintControls()',ctx),getCode:()=>ctx.source,source:'original',job:{pid:'P01',language:'python',code:'original'},
    labRequest:(action,payload,token,options)=>new Promise((resolve,reject)=>requests.push({action,payload,token,options,resolve,reject}))});
  vm.runInContext(fs.readFileSync(new URL('../../../algorithm-lab/ai-hint.js',import.meta.url),'utf8'),ctx);
  return {ctx,elements,run:code=>vm.runInContext(code,ctx)};
}
let {ctx,elements,run}=fixture();
ctx.report={rows:[{input:'HIDDEN INPUT',message:'HIDDEN ANSWER',diagnostic:{line:2,message:'IndexError'}}],passed:0,total:1};run('rememberHintRun(report)');
let pending=run('requestAIHint()'),request=requests.at(-1);
assert.match(request.payload.execution,/IndexError/);assert.ok(!JSON.stringify(request.payload).includes('HIDDEN'));assert.ok(!JSON.stringify(request.payload).includes('SECRET'));
const initialCount=requests.length;await run('requestAIHint()');assert.equal(requests.length,initialCount,'Double clicks must not add a request.');
run('resetAIHint()');assert.ok(request.options.signal.aborted);request.resolve({hint:'outdated'});await pending;assert.equal(elements['ai-hint-result'].textContent,'');
clock+=16000;ctx.source='changed';pending=run('requestAIHint()');request=requests.at(-1);assert.match(request.payload.execution,/has not been run/);request.resolve({hint:'Check one boundary.'});await pending;
assert.equal(run('aiHintContext().count'),1);assert.equal(elements['ai-hint-history'].children[0].children[1].textContent,'Check one boundary.');
assert.ok(elements['ai-hint'].disabled,'Cooldown applies to the next click.');
clock+=16000;pending=run('requestAIHint()');request=requests.at(-1);assert.deepEqual(Array.from(request.payload.history),['Check one boundary.']);assert.equal(request.payload.step,2);
request.resolve({hint:'Track the current index and stop only on a match.'});await pending;assert.equal(run('aiHintContext().count'),2);
assert.equal(elements['ai-hint-history'].children.length,2);assert.equal(elements['ai-hint-history'].children[0].open,false);assert.equal(elements['ai-hint-history'].children[1].open,true);
ctx.source='edited again';run('resetAIHint()');assert.equal(run('aiHintContext().count'),2,'Accepted history survives code edits.');
clock+=16000;pending=run('requestAIHint()');request=requests.at(-1);request.reject(Object.assign(new Error('Provider unavailable'),{status:503}));await pending;
assert.equal(run('aiHintContext().count'),2,'Failure cannot advance the hint step.');assert.equal(elements['ai-hint-history'].children.length,2);
clock+=16000;pending=run('requestAIHint()');requests.at(-1).resolve({hint:' CHECK one boundary! '});await pending;assert.equal(run('aiHintContext().count'),2,'Repeated output cannot replace or advance history.');
clock+=16000;pending=run('requestAIHint()');request=requests.at(-1);ctx.index=1;run('resetAIHint()');clock+=16000;
const newer=run('requestAIHint()'),newRequest=requests.at(-1);assert.equal(newRequest.payload.history.length,0);request.resolve({hint:'Late previous problem'});await pending;
assert.ok(run('hintPending'),'Late completion cannot unlock a newer request.');newRequest.resolve({hint:'Other problem hint'});await newer;assert.equal(run('aiHintContext().count'),1);
ctx.index=0;ctx.language='c';run('resetAIHint()');assert.equal(run('aiHintContext().count'),0,'Language history is separate.');
ctx.language='python';ctx.cloud.session.student.id='other-account';run('resetAIHint()');assert.equal(run('aiHintContext().count'),0,'Account history is separate.');
ctx.cloud.session.student.id='fixture';run('resetAIHint()');assert.equal(run('aiHintContext().count'),2);
({ctx,elements,run}=fixture());assert.equal(run('aiHintContext().count'),2,'Refresh restores accepted hints for the same context.');
clock+=16000;pending=run('requestAIHint()');request=requests.at(-1);request.reject(Object.assign(new Error('rate limited'),{status:429,retryAfter:45}));await pending;assert.equal(run('aiHintWait()'),45);assert.equal(run('aiHintContext().count'),2);
clock+=46000;run('aiHintControls()');assert.equal(elements['ai-hint'].disabled,false);assert.match(elements['ai-hint'].textContent,/다음 AI/);
console.log('AI hints: continuation/history, bounded duplicate regeneration, auth/privacy, throttle recovery, all locales, stale edits and response races passed.');
