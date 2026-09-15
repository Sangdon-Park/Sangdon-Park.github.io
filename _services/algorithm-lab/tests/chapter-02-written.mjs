import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'../../..');
const lab=path.join(root,'algorithm-lab');
const questions=JSON.parse(fs.readFileSync(path.join(root,'.codex-pptx-work/chapter2-exercises/questions.json'),'utf8')).filter(p=>p.kind==='algorithm');
assert.equal(questions.length,10);
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
vm.runInContext(`const normalCase=chapterTwoCase;
chapterTwoCase=(p,args)=>{
 if(!p.custom)return normalCase(p,args);
 let setup='',inputs=[];
 args.forEach((arg,i)=>{
  if(Array.isArray(arg)){
   setup+='int a'+i+'['+Math.max(1,arg.length)+']={'+(arg.join(',')||'0')+'};';
   inputs.push('a'+i,arg.length);
  }else inputs.push(JSON.stringify(arg));
 });
 return {setup,call:'printf("%d",'+p.function+'('+inputs.join(',')+'));'};
};`,ctx);
let total=0;
for(const p of questions){
 const result=next();
 await ctx.self.onmessage({data:{token:p.q,problem:{...p,chapter:2},cases:p.tests,code:p.c.solution}});
 const {report}=await result;
 assert.ok(!report.error,`${p.q}: ${report.error}`);
 assert.equal(report.passed,report.total,`${p.q}: ${JSON.stringify(report.rows.filter(r=>!r.ok))}`);
 total+=report.total;
}
console.log(`${questions.length} written-exercise C reference solutions passed all ${total} tests.`);
