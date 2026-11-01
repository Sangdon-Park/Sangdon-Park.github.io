import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';
const problems=JSON.parse(fs.readFileSync(new URL('../../../algorithm-lab/final-problems.json',import.meta.url),'utf8'));
const lab=path.resolve(import.meta.dirname,'../../../algorithm-lab');const read=file=>fs.readFileSync(path.join(lab,file),'utf8');
let receive;const next=()=>new Promise(resolve=>receive=resolve);
const ctx=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,fetch:async file=>{const b=fs.readFileSync(path.join(lab,String(file).split('?')[0]));return{ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};},self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}});
ctx.importScripts=(...files)=>files.forEach(file=>vm.runInContext(read(file.split('?')[0]),ctx));
const boot=next();vm.runInContext(read('c-worker.js'),ctx);assert.equal((await boot).type,'ready');
const reports=[];
for(const p of problems){
 const pending=next();await ctx.self.onmessage({data:{mode:'judge',token:p.id,problem:p,cases:p.tests,code:p.c.solution}});
 const {report:r}=await pending;assert.ok(!r.error,JSON.stringify({id:p.id,...r}));assert.equal(r.passed,r.total,JSON.stringify({id:p.id,...r}));
 // Exercise the same harness through the direct-input route too.
 const custom=next();await ctx.self.onmessage({data:{mode:'custom',token:p.id+'-custom',problem:p,cases:[{args:p.tests[0].args}],code:p.c.solution}});
 const {report:c}=await custom;assert.ok(!c.error,JSON.stringify({id:p.id,...c}));
 assert.deepEqual(JSON.parse(c.custom.value),p.tests[0].expected,p.id+' direct input');
 const wrong=next();await ctx.self.onmessage({data:{mode:'judge',token:p.id+'-wrong',problem:p,cases:p.tests,code:p.c.starter}});
 const {report:w}=await wrong;assert.ok(w.error||w.passed<w.total,p.id+' accepted unfinished code');
 reports.push({id:p.id,passed:r.passed,total:r.total,custom:c.custom.value,unfinishedRejected:true});console.log('C/WASM',p.id,r.passed+'/'+r.total);
}
console.log("All final C reference cases passed: "+reports.reduce((n,r)=>n+r.total,0));
