import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const lab=path.resolve(import.meta.dirname,'../../../algorithm-lab');
let receive;
const next=()=>new Promise(resolve=>{receive=resolve;});
const ctx=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,
 fetch:async file=>{const b=fs.readFileSync(path.join(lab,String(file).split('?')[0]));return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};},
 self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}
});
ctx.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(lab,file.split('?')[0]),'utf8'),ctx));
const boot=next();vm.runInContext(fs.readFileSync(path.join(lab,'c-worker.js'),'utf8'),ctx);assert.equal((await boot).type,'ready');
const p=JSON.parse(fs.readFileSync(path.join(lab,'problems.json'),'utf8'))[0];
async function run(code){const pending=next();await ctx.self.onmessage({data:{token:1,problem:p,cases:p.tests.slice(0,1),code}});return (await pending).report;}
let r=await run('int linear_search(const int A[], int n, int target) {\n  return 0\n}\n');
assert.ok(r.error);assert.equal(r.diagnostics.find(d=>d.severity==='error').line,2);assert.equal(r.diagnostics[0].file,'answer.c');assert.match(r.rawError,/expected ';'/);
r=await run('int linear_search(const int A[], int n, int target) {\n  int length = sizeof(A) / sizeof(A[0]);\n  return length;\n}\n');
assert.ok(!r.error);assert.ok(r.diagnostics.some(d=>d.severity==='warning'&&d.line===2));
r=await run('int linear_search(const int A[], int n, int target) {\n  __builtin_trap();\n  return 0;\n}\n');
assert.ok(r.error);assert.equal(r.diagnostics[0].line,null);assert.match(r.rawError,/unreachable|trap/);
r=await run('int linear_search(const int A[], int n, int target) {\n  for(int i=0;i<n;i++) if(A[i]==target) return i;\n  return -1;\n}\n');
assert.ok(!r.error);assert.equal(r.passed,1);
console.log('Real Clang/WASM: exact student compile line, warnings, runtime trap without invented line, and success passed.');
