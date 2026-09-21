import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHandler} from '../supabase/functions/algorithm-lab/core.mjs';
const calls=[];
let role='student', conflict=false;
const handler=createHandler({env:name=>name==='SUPABASE_URL'?'https://fixture.invalid':'fixture',fetcher:async(url,options)=>{
  calls.push({url,...options});
  if(url.includes('dju_algolab_sessions?'))return Response.json([{role,student_id:'own-student',token_hash:'fixture'}]);
  if(url.includes('rate_limit'))return Response.json(true);
  if(options.method==='PATCH')return conflict?Response.json({}, {status:409}):Response.json([{id:'own-student',section:JSON.parse(options.body).section,name:'학생',student_no:'123456'}]);
  throw Error('Unexpected request '+url);
}});
const send=(body,token='a'.repeat(64))=>handler(new Request('https://fixture.invalid',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({action:'change-section',...body})}));
let response=await send({section:'02',student_id:'someone-else',name:'changed'});
assert.equal(response.status,200);
const patch=calls.find(c=>c.method==='PATCH');
assert.match(patch.url,/id=eq.own-student&/);
assert.deepEqual(JSON.parse(patch.body),{section:'02'});
assert.equal(calls.filter(c=>c.method==='PATCH').length,1);
assert.equal((await send({section:'03'})).status,400);
assert.equal((await send({section:'02'},'')).status,401);
role='admin';assert.equal((await send({section:'02'})).status,403);role='student';
conflict=true;response=await send({section:'02'});
assert.equal(response.status,409);assert.match((await response.json()).error,/기록 통합/);

const elements=new Map();
const element=id=>{
  if(!elements.has(id))elements.set(id,{value:'',disabled:false,textContent:'',classList:{toggle(){}},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}});
  return elements.get(id);
};
const storage=new Map();
const ctx=vm.createContext({$,document:{getElementById:element},URLSearchParams,location:{search:''},localStorage:{setItem:(k,v)=>storage.set(k,v)},setInterval(){},window:{addEventListener(){}},T:x=>x,busy:false});
function $(id){return element(id);}
vm.runInContext(fs.readFileSync(new URL('../../../algorithm-lab/cloud.js',import.meta.url),'utf8'),ctx);
vm.runInContext(`cloud.session={token:'token',student:{id:'own-student',section:'01',name:'학생'}};cloud.queue=[{action:'submit',body:{code:'unsent'}}];initCloudUI();labRequest=async(action,body)=>{if(action!=='change-section')throw Error('Unexpected request');return {student:{id:'own-student',section:body.section,name:'학생'}};};`,ctx);
element('cloud-section').onclick();assert.equal(element('section-select').value,'01');
element('section-select').value='02';await element('section-form').onsubmit({preventDefault(){}});
assert.equal(vm.runInContext('cloud.session.student.section',ctx),'02');
assert.equal(vm.runInContext('cloud.queue[0].body.code',ctx),'unsent');
assert.equal(JSON.parse(storage.get('dju-algolab-session')).student.id,'own-student');
assert.equal(element('section-dialog').open,false);
vm.runInContext(`labRequest=async()=>{throw Error('duplicate account');};`,ctx);
element('cloud-section').onclick();element('section-select').value='01';await element('section-form').onsubmit({preventDefault(){}});
assert.equal(element('section-dialog').open,true);
assert.equal(element('section-message').textContent,'duplicate account');
assert.equal(vm.runInContext('cloud.session.student.section',ctx),'02');
console.log('Section change: authenticated identity, allowed sections, duplicate protection, session persistence and pending code preservation passed.');
