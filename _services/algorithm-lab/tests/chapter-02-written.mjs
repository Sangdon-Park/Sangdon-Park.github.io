import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'../../..');
const lab=path.join(root,'algorithm-lab');
const questions=JSON.parse(fs.readFileSync(path.join(lab,'exercise-problems.json'),'utf8'))
  .filter(p=>p.chapter===2);
assert.equal(questions.length,10);
assert.deepEqual(questions.map(p=>p.exercise),[61,65,69,71,74,78,79,80,88,99]);
let receive;
const next=()=>new Promise(resolve=>{receive=resolve;});
const ctx=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,
 fetch:async file=>{const b=fs.readFileSync(path.join(lab,String(file).split('?')[0]));return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};},
 self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}
});
ctx.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(lab,file.split('?')[0]),'utf8'),ctx));
const boot=next();
vm.runInContext(fs.readFileSync(path.join(lab,'c-worker.js'),'utf8'),ctx);
assert.equal((await boot).type,'ready');
let total=0;
for(const p of questions){
 const result=next();
 await ctx.self.onmessage({data:{token:p.id,problem:p,cases:p.tests,code:p.c.solution}});
 const {report}=await result;
 assert.ok(!report.error,`${p.id}: ${report.error}`);
 assert.equal(report.passed,report.total,`${p.id}: ${JSON.stringify(report.rows.filter(r=>!r.ok))}`);
 const unfinished=next();
 await ctx.self.onmessage({data:{token:p.id+'-unfinished',problem:p,cases:p.tests,code:p.c.starter}});
 const {report:rejected}=await unfinished;
 assert.ok(rejected.error||rejected.passed<rejected.total,`${p.id}: unfinished answer accepted`);
 total+=report.total;
}
console.log(`${questions.length} published written-exercise C solutions passed ${total} tests; unfinished answers rejected.`);
