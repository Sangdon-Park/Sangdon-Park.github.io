import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {TOTALS,draft,submission} from '../supabase/functions/algorithm-lab/core.mjs';
const lab=path.resolve(import.meta.dirname,'../../../algorithm-lab');
const read=file=>fs.readFileSync(path.join(lab,file),'utf8');
const bank=JSON.parse(read('challenge-problems.json'));
const all=['problems','chapter-02','exercise-problems','final-problems','challenge-problems'].flatMap(f=>JSON.parse(read(f+'.json')));
assert.equal(new Set(all.map(p=>p.id)).size,all.length);
const ctx=vm.createContext({localStorage:{getItem:()=>null},T:x=>x,UI_LOCALE:'ko',document:{querySelectorAll:()=>[]}});
for(const file of ['problem-catalog.js','final-exam-contracts.js','custom-inputs.js','custom-c-harness.js','java-problems.js','java-hint-references.js','c-problems.js','chapter-seven.js','hint-guides.js','hint-references.js','practice-hints.js','examples.js'])vm.runInContext(read(file),ctx);
vm.runInContext(read('app.js').split('function persist()')[0],ctx);ctx.bank=all;vm.runInContext('problems=bank',ctx);
assert.deepEqual(Array.from(vm.runInContext('orderedChapter(7)',ctx),p=>p.id),['F07-02','F07-03','F07-04','F07-05','F07-06','F07-07']);
assert.equal(all.filter(p=>p.finalExam&&!vm.runInContext(`LAB_RETIRED[${JSON.stringify(p.id)}]`,ctx)).length,22);
let examples=0;
for(const p of bank){
  ctx.p=p;vm.runInContext('C_PROBLEMS[p.id]=p.c',ctx);
  assert.equal(TOTALS[p.id],p.tests.length);assert.equal(p.practiceGuide.steps.length,3);
  for (const language of ['python','c','java']) {
    const body={id:'12345678-1234-4123-8123-123456789abc',problem:p.id,language,code:p.solution,
      report:{passed:p.tests.length,total:p.tests.length,rows:[]}};
    assert.equal(draft(body).problem,p.id);
    assert.equal(submission(body).solved,true);
    assert.throws(()=>submission({...body,report:{passed:1,total:p.tests.length-1}}));
  }
  assert.equal(vm.runInContext('findLinkedProblem(problems,p.displayId,7)',ctx),all.findIndex(x=>x.id===p.id));
  for(const t of p.tests){ctx.t=t;vm.runInContext('validateCustomArgs(p,t.args);customCCase(p,t.args)',ctx);}
  for(const language of ['python','c','java']){
    ctx.lang=language;const hint=vm.runInContext('practiceHintData(p,lang)',ctx);
    assert.ok(hint.solution.includes(p.function));assert.equal(hint.steps.length,3);assert.ok(hint.blanks.length);
    for(const t of p.tests.filter(t=>t.public)){ctx.t=t;const example=vm.runInContext('formatProblemExample(p,t,lang,p.c,1)',ctx);assert.ok(!/undefined|NaN/.test(example),example);examples++;}
  }
}
for(const [id,args] of [['F07-05',['?']],['F07-05',['a?']],['F07-05',[' '.repeat(4)]],['F07-05',['?'.repeat(18)]],['F07-06',[[]]],['F07-06',[[[1,1],[1]]]],['F07-06',[[[2]]]],['F07-06',[[[1,1,1,1,1]]]],['F07-07',[[[0]]]],['F07-07',[[[5,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]]]]){
  ctx.p=bank.find(p=>p.id===id);ctx.args=args;assert.throws(()=>vm.runInContext('validateCustomArgs(p,args)',ctx),id);
}
console.log(JSON.stringify({extraTasks:bank.length,languageExamples:examples,activeChapter7:6,examTasksUnchanged:22}));

let receive;
const next=()=>new Promise(resolve=>receive=resolve);
const cctx=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,fetch:async file=>{const b=fs.readFileSync(path.join(lab,String(file).split('?')[0]));return{ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};},self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}});
cctx.importScripts=(...files)=>files.forEach(file=>vm.runInContext(read(file.split('?')[0]),cctx));
const boot=next();vm.runInContext(read('c-worker.js'),cctx);assert.equal((await boot).type,'ready');
for(const p of bank){
  let wait=next();await cctx.self.onmessage({data:{mode:'judge',token:p.id,problem:p,cases:p.tests,code:p.c.solution}});
  const {report}=await wait;assert.ok(!report.error,JSON.stringify(report));assert.equal(report.passed,report.total,JSON.stringify(report));
  wait=next();await cctx.self.onmessage({data:{mode:'custom',token:p.id,problem:p,cases:[{args:p.tests[0].args}],code:p.c.solution}});
  const {report:custom}=await wait;assert.ok(!custom.error,JSON.stringify(custom));assert.deepEqual(JSON.parse(custom.custom.value),p.tests[0].expected);
  wait=next();await cctx.self.onmessage({data:{mode:'judge',token:p.id,problem:p,cases:p.tests,code:p.c.starter}});
  const {report:wrong}=await wait;assert.ok(wrong.error||wrong.passed<wrong.total);
  console.log(`C/WASM ${p.id}: ${report.passed}/${report.total}, custom input passed, unfinished rejected`);
}
