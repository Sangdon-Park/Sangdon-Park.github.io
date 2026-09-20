import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'../../..'),lab=path.join(root,'algorithm-lab');
const problems=JSON.parse(fs.readFileSync(path.join(lab,'exercise-problems.json'),'utf8'));
let receive;
const next=()=>new Promise(resolve=>{receive=resolve;});
const ctx=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,
  fetch:async file=>{const b=fs.readFileSync(path.join(lab,String(file).split('?')[0]));return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};},
  self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}
});
ctx.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(lab,file.split('?')[0]),'utf8'),ctx));
const boot=next();vm.runInContext(fs.readFileSync(path.join(lab,'c-worker.js'),'utf8'),ctx);
assert.equal((await boot).type,'ready');
async function run(p,code){const pending=next();await ctx.self.onmessage({data:{token:p.id,problem:p,cases:p.tests,code}});return (await pending).report;}
let total=0;
for(const p of problems){
  const r=await run(p,p.c.solution);
  assert.ok(!r.error,`${p.id} ${p.function}: ${r.error}`);
  assert.equal(r.passed,r.total,`${p.id}: ${JSON.stringify(r.rows.filter(x=>!x.ok))}`);
  total+=r.total;console.log(p.id,p.function,r.passed+'/'+r.total);
}
const bad={
  fibonacci:'long long fibonacci(int n){long long a=0,b=1;for(int i=0;i<n;i++){long long t=a+b;a=b;b=t;}return a+(n==90);}',
  dsu_find:'int dsu_find(int p[],int x){while(p[x]!=x)x=p[x];return x;}',
  relax:'int relax(long long d[],int u,int v,int w){return d[u]<1000000000000000000LL&&d[u]+w<d[v];}',
  fib_memo:'long long fib_memo(int n,long long m[]){long long a=0,b=1;for(int i=0;i<n;i++){long long t=a+b;a=b;b=t;}return a;}'
};
for(const [name,code] of Object.entries(bad)){
  const r=await run(problems.find(p=>p.function===name),code);
  assert.ok(r.error||r.passed<r.total,`${name}: wrong answer accepted`);
}
console.log(`${problems.length} real WebAssembly C references / ${total} cases passed; ${Object.keys(bad).length} incorrect answers rejected.`);
