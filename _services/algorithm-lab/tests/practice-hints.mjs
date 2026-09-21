import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../../../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const context=vm.createContext({T:x=>x});
vm.runInContext(read('algorithm-lab/c-problems.js')+'\n'+read('algorithm-lab/practice-hints.js')+'\nthis.hints=practiceHintData;this.c=C_PROBLEMS;',context);
const bank=['chapter-02.json','exercise-problems.json'].flatMap(file=>JSON.parse(read('algorithm-lab/'+file)));
for(const p of bank){
  context.c[p.id]=p.c;
  for(const lang of ['python','c']){
    const hint=context.hints(p,lang);
    assert.ok(hint.tools.length>0,p.id);
    assert.ok(hint.method,p.id);
    assert.ok(hint.solution,p.id);
    let restored=hint.skeleton;
    for(const blank of hint.blanks)restored=restored.replace(blank.label,blank.answer);
    assert.equal(restored,hint.solution,`${p.id}/${lang}: blank answer must restore the reviewed solution exactly`);
  }
}
const lock=bank.find(p=>p.id==='P37');
assert.ok(context.hints(lock,'python').tools.some(s=>s.startsWith('range(')));
assert.ok(context.hints(lock,'c').tools.some(s=>s.startsWith('strcmp(')));
assert.ok(!context.hints(lock,'c').tools.some(s=>s.startsWith('range(')));
console.log('74 problem references in both languages: hints, blank restoration, and language-specific tools passed.');
