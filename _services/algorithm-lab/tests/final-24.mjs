import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {TOTALS} from '../supabase/functions/algorithm-lab/core.mjs';
const lab=path.resolve(import.meta.dirname,'../../../algorithm-lab');
const read=f=>fs.readFileSync(path.join(lab,f),'utf8');
const bank=['problems.json','chapter-02.json','exercise-problems.json','final-problems.json'].flatMap(f=>JSON.parse(read(f)));
const finals=bank.filter(p=>p.finalExam);
const ctx=vm.createContext({bank,localStorage:{getItem:()=>null}});
for(const file of ['problem-catalog.js','final-exam-contracts.js','custom-inputs.js','custom-c-harness.js','java-problems.js','examples.js'])vm.runInContext(read(file),ctx);
vm.runInContext(read('app.js').split('function persist()')[0],ctx);vm.runInContext('problems=bank',ctx);
assert.equal(finals.length,24);assert.equal(new Set(bank.map(p=>p.id)).size,bank.length);
for(const chapter of [6,7,8,9,10,11]){
 ctx.chapterUnderTest=chapter;
 assert.deepEqual(Array.from(vm.runInContext('orderedChapter(chapterUnderTest)',ctx),p=>p.displayId),([6,7].includes(chapter)?[2,3,4]:[1,2,3,4]).map(i=>`${chapter}-${i}`));
}
let publicExamples=0,cases=0;
for(const p of finals){
 assert.equal(TOTALS[p.id],p.tests.length);
 assert.ok(!p.exercise);assert.ok(p.solution);assert.ok(p.c.solution);ctx.p=p;assert.ok(p.slides>0||p.challenge||vm.runInContext('LAB_RETIRED[p.id]',ctx));
 for(const t of p.tests){
  ctx.p=p;ctx.t=t;
  vm.runInContext('validateCustomArgs(p,t.args); finalCCase(p,t.args)',ctx);cases++;
  if(t.public)for(const language of ['python','c','java']){
   ctx.languageUnderTest=language;
   const text=vm.runInContext('formatProblemExample(p,t,languageUnderTest,p.c,1)',ctx);
   assert.ok(!/undefined|NaN/.test(text),`${p.id} ${language}: ${text}`);publicExamples++;
  }
 }
 ctx.p=p;
 const retired=vm.runInContext('Boolean(LAB_RETIRED[p.id])',ctx);
 assert.equal(vm.runInContext('findLinkedProblem(problems,p.displayId,p.chapter)',ctx),retired?-1:bank.indexOf(p));
 assert.equal(vm.runInContext('findLinkedProblem(problems,p.id,p.chapter)',ctx),retired?-1:bank.indexOf(p));
}
const invalids=[['F06-01-v3',[-1]],['F06-01-v3',[10001]],['F06-01-v2',[91]],['F06-01-v2',[-1]],['F06-01-v2',[0]],['F06-02-v2',[[]]],['F06-02-v2',[[1000001]]],['F07-02',[[1,0],1]],['F08-01',[[[0,1],[1,0]],[0,0]]],['F08-02',[[[1,2],[3,4]],[1,1],1]],['F09-04',[1,[[0,1,1]]]],['F10-04',[2,[4]]],['F11-03',[10,12,-1,0.2]],['F11-03',[10,12,1,1]]];
for(const [id,args] of invalids){ctx.p=finals.find(p=>p.id===id);ctx.args=args;assert.throws(()=>vm.runInContext('validateCustomArgs(p,args)',ctx),id);}
assert.equal(finals.find(p=>p.chapter===6&&p.function==='max_subarray').javaResult,'long');
for(const chapter of [1,2,3,4,5]){
 ctx.chapterUnderTest=chapter;
 const old=bank.filter(p=>(p.chapter||1)===chapter&&!vm.runInContext(`LAB_DUPLICATES[${JSON.stringify(p.id)}]||LAB_RETIRED[${JSON.stringify(p.id)}]`,ctx));
 assert.equal(vm.runInContext('orderedChapter(chapterUnderTest).length',ctx),old.length);
}
assert.equal(finals.filter(p=>{ctx.p=p;return !vm.runInContext('LAB_RETIRED[p.id]',ctx);}).length,22);
assert.equal(finals.find(p=>p.id==='F06-03').challenge,true);
assert.equal(finals.find(p=>p.id==='F07-04').challenge,true);
assert.equal(finals.find(p=>p.id==='F07-04').slides,null);
assert.equal(finals.find(p=>p.id==='F07-01').slides,null);
console.log(JSON.stringify({activeProblems:22,archivedProblems:2,cases,languageExamples:publicExamples,invalidInputs:invalids.length,chapters:[6,7,8,9,10,11]}));
