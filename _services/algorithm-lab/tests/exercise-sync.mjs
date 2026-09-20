import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TOTALS,draft,submission} from '../supabase/functions/algorithm-lab/core.mjs';
const bank=JSON.parse(fs.readFileSync(new URL('../../../algorithm-lab/exercise-problems.json',import.meta.url),'utf8'));
for(const p of bank){
  assert.equal(TOTALS[p.id],p.tests.length);
  draft({problem:p.id,language:'c',code:p.c.solution});
  assert.ok(submission({id:'c0953417-749e-42c1-b7e9-1162b6fcf21b',problem:p.id,language:'python',code:p.solution,report:{passed:p.tests.length,total:p.tests.length}}).solved);
}
assert.throws(()=>draft({problem:'P87',language:'c',code:''}));
const store=new Map(),sent=[],status={textContent:'',classList:{toggle(){}}};
let upgraded=false;
const ctx=vm.createContext({Date,Set,JSON,console,AbortSignal,T:x=>x,
  document:{getElementById:()=>status},
  localStorage:{setItem:(k,v)=>store.set(k,v)},
  fetch:async(url,options)=>{
    const body=JSON.parse(options.body);
    if(body.action==='state')return {ok:true,json:async()=>upgraded?{problemTotals:TOTALS}:{}};
    sent.push(body.problem);return {ok:true,json:async()=>({ok:true})};
  }
});
vm.runInContext(fs.readFileSync(new URL('../../../algorithm-lab/cloud.js',import.meta.url),'utf8'),ctx);
vm.runInContext("cloud.session={token:'fixture',student:{id:'fixture'}};cloud.queue=[{action:'draft',body:{problem:'P77',language:'c',code:'new'}},{action:'draft',body:{problem:'P01',language:'c',code:'old'}}];",ctx);
await vm.runInContext('flushCloud()',ctx);
assert.deepEqual(sent,['P01']);
assert.equal(vm.runInContext('cloud.queue.length',ctx),1);
assert.match(status.textContent,/브라우저/);
upgraded=true;vm.runInContext('cloud.catalogChecked=0',ctx);
await vm.runInContext('flushCloud()',ctx);
assert.deepEqual(sent,['P01','P77']);
assert.equal(vm.runInContext('cloud.queue.length',ctx),0);
console.log('50 exercise backend contracts passed; staged rollout retains new drafts, saves old drafts and resumes sync.');
