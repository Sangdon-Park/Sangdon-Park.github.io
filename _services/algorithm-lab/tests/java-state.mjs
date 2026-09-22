import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {draft,submission,TOTALS} from '../supabase/functions/algorithm-lab/core.mjs';
const lab=new URL('../../../algorithm-lab/',import.meta.url);
for(const problem of Object.keys(TOTALS)){
  assert.equal(draft({problem,language:'java',code:'class Solution {}'}).language,'java');
  assert.ok(submission({id:'c0953417-749e-42c1-b7e9-1162b6fcf21b',problem,language:'java',code:'class Solution {}',report:{passed:TOTALS[problem],total:TOTALS[problem]}}).solved);
}
assert.throws(()=>draft({problem:'P01',language:'javascript',code:''}));
const sent=[],element={textContent:'',classList:{toggle(){}}};let supported=false;
const ctx=vm.createContext({Set,Date,JSON,AbortSignal,T:x=>x,document:{getElementById:()=>element},localStorage:{setItem(){}},fetch:async(url,options)=>{
  const b=JSON.parse(options.body);
  if(b.action==='state')return {ok:true,json:async()=>({problemTotals:TOTALS,languages:supported?['python','c','java']:['python','c']})};
  sent.push(b.language);return {ok:true,json:async()=>({ok:true})};
}});
vm.runInContext(fs.readFileSync(new URL('cloud.js',lab),'utf8'),ctx);
vm.runInContext("cloud.session={token:'fixture',student:{id:'fixture'}};cloud.queue=['java','python','c'].map(language=>({action:'draft',body:{problem:'P01',language,code:'fixture'}}));",ctx);
await vm.runInContext('flushCloud()',ctx);
assert.deepEqual(sent,['python','c']);
assert.equal(vm.runInContext('cloud.queue[0].body.language',ctx),'java');
supported=true;vm.runInContext('cloud.catalogChecked=0',ctx);await vm.runInContext('flushCloud()',ctx);
assert.deepEqual(sent,['python','c','java']);
assert.equal(vm.runInContext('cloud.queue.length',ctx),0);
console.log('Java accepted for all 86 backend contracts; staged Java uploads retain drafts without blocking Python/C and resume after upgrade.');
