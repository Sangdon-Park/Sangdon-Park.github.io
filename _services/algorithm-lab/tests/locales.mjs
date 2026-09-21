import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const lab=new URL('../../../algorithm-lab/',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,lab),'utf8');
const bank=['problems.json','chapter-02.json','exercise-problems.json'].flatMap(f=>JSON.parse(read(f)));
function fixture(locale){
 const storage=new Map();
 const ctx=vm.createContext({URLSearchParams,location:{search:locale?'?lang='+locale:''},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}});
 for(const f of ['locale-en.js','locale-extra.js'])vm.runInContext(read(f),ctx);
 vm.runInContext(read('i18n.js').split('document.documentElement.lang=')[0],ctx);
 for(const f of ['c-problems.js','examples.js','practice-hints.js'])vm.runInContext(read(f),ctx);
 return ctx;
}
assert.equal(vm.runInContext('UI_LOCALE',fixture('')),'ko');
assert.equal(vm.runInContext('UI_LOCALE',fixture('fr')),'ko');
for(const locale of ['ko','en','es']){
 const ctx=fixture(locale),translate=vm.runInContext('localizeProblem',ctx),t=vm.runInContext('T',ctx),c=vm.runInContext('C_PROBLEMS',ctx),hint=vm.runInContext('practiceHintData',ctx);
 for(const original of bank){
  const p=structuredClone(original);if(p.c)c[p.id]=structuredClone(p.c);
  translate(p);
  for(const field of ['statement','hint','result'])if(c[p.id][field])c[p.id][field]=t(c[p.id][field]);
  assert.deepEqual(p.tests,original.tests,`${locale}/${p.id}: tests unchanged`);
  assert.equal(p.starter,original.starter,`${locale}/${p.id}: student/starter code untouched by text localization`);
  assert.equal(p.solution,original.solution,`${locale}/${p.id}: reference implementation unchanged`);
  assert.equal(p.c?.solution,original.c?.solution);
  if(locale!=='ko'){
   for(const obj of [p,p.study,c[p.id]])for(const field of ['title','section','slides','level','statement','hint','provided','complexity','method','boundary','result']){
    if(obj?.[field])assert.ok(!/[가-힣]|ZXQ\d+QXZ/.test(obj[field]),`${locale}/${p.id}/${field}: ${obj[field]}`);
   }
   for(const language of ['python','c']){
    const data=hint(p,language);
    for(const tool of data.tools)assert.ok(!/[가-힣]/.test(tool),`${locale}/${p.id}/hint: ${tool}`);
    for(const test of p.tests.filter(x=>x.public)){
     const result=vm.runInContext('formatProblemExample',ctx)(p,test,language,c[p.id],1,locale==='en');
     assert.ok(!/[가-힣]/.test(result),`${locale}/${p.id}/${language}/example: ${result}`);
    }
   }
  }else assert.equal(p.statement,original.statement);
 }
}
console.log('All 86 problems: Korean/English/Spanish fields, Python/C examples, hints, immutable source code and test inputs verified.');
