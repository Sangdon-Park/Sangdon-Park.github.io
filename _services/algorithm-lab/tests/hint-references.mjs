import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {hintBank,hintReference} from './hint-bank.mjs';
const lab=new URL('../../../algorithm-lab/',import.meta.url);
let receive;
const next=()=>new Promise(resolve=>{receive=resolve;});
const ctx=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,
  fetch:async file=>{const bytes=fs.readFileSync(new URL(String(file).split('?')[0],lab));return {ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};},
  self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}});
ctx.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(new URL(file.split('?')[0],lab),'utf8'),ctx));
const boot=next();vm.runInContext(fs.readFileSync(new URL('c-worker.js',lab),'utf8'),ctx);assert.equal((await boot).type,'ready');
let total=0;
for(const p of hintBank){
  const result=next();
  await ctx.self.onmessage({data:{token:p.id,problem:p,cases:p.tests,code:hintReference(p,'c')}});
  const {report}=await result;
  assert.equal(report.error,undefined,p.id+': '+report.error);
  assert.equal(report.passed,report.total,p.id+': '+JSON.stringify(report.rows.filter(row=>!row.ok)));
  total+=report.passed;
}
console.log(`All ${hintBank.length} displayed C11 hint references passed ${total} public/hidden WASM worker cases.`);
