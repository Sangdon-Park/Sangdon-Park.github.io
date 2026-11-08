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
assert.throws(()=>draft({problem:'P90',language:'c',code:''}));
assert.equal(bank.find(p=>p.id==='P89').exercise,95);
assert.ok(!bank.some(p=>p.id==='P61'));
assert.equal(TOTALS.P61,4, 'Previously saved reports retain their original contract');
for(const id of ['P04','P49','P50','P52','P63','P64']){
  assert.equal(TOTALS[id],undefined);
  assert.ok(!bank.some(p=>p.id===id));
  assert.throws(()=>draft({problem:id,language:'python',code:'saved legacy answer'}));
}
assert.equal(bank.find(p=>p.id==='P53').function,'insertion_sort');
assert.equal(bank.find(p=>p.id==='P86').function,'grid_cost');
assert.equal(bank.find(p=>p.id==='P87').exercise,97);
assert.equal(bank.find(p=>p.id==='P88').exercise,98);
const migrations=[
  'schema.sql','chapter-02-migration.sql','exercise-lab-migration.sql',
  'chapter-04-sorts-migration.sql','chapter-04-scope-migration.sql',
  'final-24-migration.sql','chapter6-v2-migration.sql',
  'chapter6-four-levels-migration.sql','chapter7-challenges-migration.sql'
];
const invalidIds=['P00','P90','P001','F06-01-v4','F07-08','F08-00','F12-01'];
const accepts=(check,id)=>check.pattern.test(id)||check.extraIds.has(id);
let currentChecks;
for(const filename of migrations){
  const sql=fs.readFileSync(new URL('../'+filename,import.meta.url),'utf8');
  currentChecks=[...sql.matchAll(/check\s*\(\s*problem\s*~\s*'([^']+)'(?:\s+or\s+problem\s+in\s*\(([^)]*)\))?\s*\)/gi)].map(match=>({
    pattern:new RegExp(match[1]),
    extraIds:new Set([...((match[2]||'').matchAll(/'([^']+)'/g))].map(item=>item[1]))
  }));
  assert.equal(currentChecks.length,2,filename+' must validate both drafts and submissions');
  for(const id of [...Object.keys(TOTALS),...invalidIds]){
    assert.equal(accepts(currentChecks[0],id),accepts(currentChecks[1],id),filename+' has inconsistent ID checks for '+id);
  }
}
// Each migration replaces the previous check. Validate the final applied state,
// including the explicit versioned and challenge IDs added after final-24.
for(const check of currentChecks){
  for(const id of Object.keys(TOTALS))assert.ok(accepts(check,id),'Final schema rejects '+id);
  for(const id of invalidIds)assert.ok(!accepts(check,id),'Final schema accepts unknown '+id);
}
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
vm.runInContext("cloud.session={token:'fixture',student:{id:'fixture'}};cloud.queue=[{action:'draft',body:{problem:'P77',language:'c',code:'new'}},{action:'draft',body:{problem:'P87',language:'python',code:'partition'}},{action:'draft',body:{problem:'P88',language:'c',code:'quick sort'}},{action:'draft',body:{problem:'P01',language:'c',code:'old'}}];",ctx);
await vm.runInContext('flushCloud()',ctx);
assert.deepEqual(sent,['P01']);
assert.equal(vm.runInContext('cloud.queue.length',ctx),3);
assert.match(status.textContent,/브라우저/);
upgraded=true;vm.runInContext('cloud.catalogChecked=0',ctx);
await vm.runInContext('flushCloud()',ctx);
assert.deepEqual(sent,['P01','P77','P87','P88']);
assert.equal(vm.runInContext('cloud.queue.length',ctx),0);
console.log(`${bank.length} exercise backend contracts passed; retired IDs rejected, retained IDs stable, staged rollout preserves drafts.`);
