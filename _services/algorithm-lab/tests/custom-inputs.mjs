import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'../../..'),lab=path.join(root,'algorithm-lab');
const problems=['problems','chapter-02','exercise-problems'].flatMap(f=>JSON.parse(fs.readFileSync(path.join(lab,f+'.json'))));
const read=file=>fs.readFileSync(path.join(lab,file),'utf8');
const schema=vm.createContext({});vm.runInContext(read('custom-inputs.js')+'\nthis.schema={customFields,parseCustomValue,readCustomArgs,validateCustomArgs};',schema);
const {customFields,readCustomArgs,validateCustomArgs}=schema.schema;
for(const p of problems){const fields=customFields(p);assert.ok(fields.length,p.id);const args=readCustomArgs(p,fields.map(f=>f.type.kind==='string'?f.value:JSON.stringify(f.value)));assert.equal(JSON.stringify(args),JSON.stringify(p.tests.find(t=>t.public).args),p.id);}
const search=problems.find(p=>p.id==='P47');
assert.equal(JSON.stringify(readCustomArgs(search,[' 1, 2 \n 2, -3 ','2'])),'[[1,2,2,-3],2]');
assert.equal(JSON.stringify(readCustomArgs(search,['[]','0'])),'[[],0]');
for(const input of ['', '1,,2', '1, ,2', ',1', '1,', '[1,"2"]', '[1];alert(1)', '{"length":3}', '[9007199254740993]', '[null]', '[NaN]'])assert.throws(()=>readCustomArgs(search,[input,'1']),input);
assert.throws(()=>readCustomArgs(search,['[1,2]','1.5']));
const q=p=>problems.find(x=>x.function===p);
assert.throws(()=>validateCustomArgs(q('quick_select'),[[],1]));
assert.throws(()=>validateCustomArgs(q('make_permutations'),[[1,2],3]));
assert.throws(()=>validateCustomArgs(q('grid_sum'),[[[1],[2,3]]]));
assert.throws(()=>validateCustomArgs(q('dsu_find'),[[1,0],0]));
assert.throws(()=>validateCustomArgs(q('relax'),[[0],0,1,3]));
assert.throws(()=>validateCustomArgs(q('lcs_length'),['x'.repeat(101),'x']));
validateCustomArgs(q('pick_vertex'),[[0,1e18],[true,false]]);
assert.throws(()=>readCustomArgs(q('pick_vertex'),['[1000000000000000001,1]','[false,false]']));
assert.throws(()=>readCustomArgs(search,['[1.000000000000000001]','1']));
assert.equal(JSON.stringify(readCustomArgs(q('pick_vertex'),['[1e18,1]','[false,false]'])),'[[1000000000000000000,1],[false,false]]');
console.log(`Input validation: ${problems.length} catalog entries, empty arrays, whitespace, type/range/shape/source-injection cases passed.`);

// Run the real pinned Clang compiler, linker and WASM worker without a browser.
let receive;const next=()=>new Promise(resolve=>{receive=resolve;});
const context=vm.createContext({TextEncoder,TextDecoder,WebAssembly,Uint8Array,ArrayBuffer,DataView,console,setTimeout,clearTimeout,performance,
  fetch:async file=>{const b=fs.readFileSync(path.join(lab,String(file).split('?')[0]));return{ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};},
  self:{postMessage:data=>{if(data.type!=='phase')receive(data);}}
});
context.importScripts=(...files)=>files.forEach(file=>vm.runInContext(read(file.split('?')[0]),context));
const boot=next();vm.runInContext(read('c-worker.js'),context);assert.equal((await boot).type,'ready');
async function run(p,code,args=p.tests.find(t=>t.public).args,mode='custom'){
  const pending=next();await context.self.onmessage({data:{mode,token:p.id,problem:p,cases:mode==='custom'?[{args}]:p.tests,code}});return(await pending).report;
}
vm.runInContext(read('c-problems.js')+'\nthis.cProblems=C_PROBLEMS;',context);
for(const p of problems){
  const r=await run(p,p.c?.solution||context.cProblems[p.id].starter);
  assert.ok(!r.error,`${p.id}: ${r.error}`);assert.ok(r.custom,p.id);assert.equal(r.passed,undefined,p.id);assert.equal(r.total,undefined,p.id);
  if(p.c?.solution){const expected=p.tests.find(t=>t.public).expected;assert.deepEqual(JSON.parse(r.custom.value),expected,p.id);}
}
let r=await run(search,'int first_index(const int a[],int n,int x){printf("debug <%d>\\n",n);for(int i=0;i<n;i++)if(a[i]==x)return i;return -1;}',[[8,4,4],4]);
assert.equal(r.custom.value,'1');assert.equal(r.custom.stdout,'debug <3>\n');
assert.equal(r.custom.raw,'');
r=await run(search,'int first_index(const int a[],int n,int x){printf("before crash");abort();}');assert.ok(r.error);assert.equal(r.custom.stdout,'before crash');
r=await run(search,'int first_index(const int a[],int n,int x){return -1;}',[[],8]);assert.equal(r.custom.value,'-1');
r=await run(search,'int first_index(const int a[],int n,int x){return missing;}');assert.ok(r.error);assert.ok(r.diagnostics.length);
r=await run(q('dsu_find'),q('dsu_find').c.solution,[[0,0,1,2],3]);assert.equal(r.custom.value,'0');assert.equal(r.custom.after,'[0,0,0,0]');
r=await run(q('bf_string_match'),q('bf_string_match').c.solution,['a"\\;b','"\\']);assert.equal(r.custom.value,'[1]');
r=await run(search,search.c.solution,undefined,'judge');assert.equal(r.passed,r.total);assert.equal(r.custom,undefined);
console.log(`Real C/WASM: ${problems.length} custom harnesses, fresh inputs, debug output, compile error, mutation display, quoted text and official judging passed.`);
