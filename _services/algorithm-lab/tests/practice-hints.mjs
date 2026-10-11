import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../../../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const context=vm.createContext({T:x=>x});
for(const file of ['c-problems.js','java-problems.js','hint-guides.js','hint-references.js','java-hint-references.js','practice-hints.js','problem-catalog.js'])vm.runInContext(read('algorithm-lab/'+file),context);
vm.runInContext('this.hints=practiceHintData;this.c=C_PROBLEMS;this.duplicates=LAB_DUPLICATES;',context);
const bank=['problems.json','chapter-02.json','exercise-problems.json'].flatMap(file=>JSON.parse(read('algorithm-lab/'+file))).filter(p=>!context.duplicates[p.id]);
assert.equal(bank.length,72,'Every visible problem must have reviewed hints.');
for(const p of bank){
  if(p.c)context.c[p.id]=p.c;
  for(const lang of ['python','c','java']){
    const hint=context.hints(p,lang);
    assert.ok(hint.tools.length>0,p.id);
    assert.ok(hint.method,p.id);
    assert.equal(hint.steps.length,3,`${p.id}/${lang}: three concrete learning steps`);
    assert.ok(hint.check.length>15,`${p.id}/${lang}: problem-specific check`);
    assert.ok(hint.signature.includes(p.function),`${p.id}/${lang}: exact function contract`);
    if(lang==='java'){
      assert.match(hint.tools.join('\n'),/main/);
      assert.match(hint.solution,/public class Solution extends LabSupport/);
    }
    assert.ok(hint.solution,p.id);
    assert.ok(hint.blanks.length>0,`${p.id}/${lang}: key code scaffolding`);
    let restored=hint.skeleton;
    for(const blank of hint.blanks)restored=restored.replace(blank.label,blank.answer);
    assert.equal(restored,hint.solution,`${p.id}/${lang}: blank answer must restore the reviewed solution exactly`);
  }
}
const lock=bank.find(p=>p.id==='P37');
assert.ok(context.hints(lock,'python').tools.some(s=>s.startsWith('range(')));
assert.ok(context.hints(lock,'c').tools.some(s=>s.startsWith('strcmp(')));
assert.ok(!context.hints(lock,'c').tools.some(s=>s.startsWith('range(')));
assert.ok(!context.hints(bank.find(p=>p.id==='P25'),'python').solution.includes('import'));
assert.ok(!context.hints(bank.find(p=>p.id==='P28'),'python').solution.includes('lru_cache'));
assert.ok(!context.hints(bank.find(p=>p.id==='P57'),'python').solution.includes('extend'));
assert.match(context.hints(bank.find(p=>p.id==='P33'),'c').steps[2],/인덱스/);
assert.match(context.hints(bank.find(p=>p.id==='P87'),'python').blanks.map(b=>b.answer).join('\n'),/L <= R/);
const inversions=bank.find(p=>p.id==='P66');
assert.match(context.hints(inversions,'python').steps[2],/len\(a\)-i/);
assert.match(context.hints(inversions,'c').steps[2],/n - i/);
assert.match(context.hints(inversions,'java').steps[2],/a\.length - i/);
console.log(`All ${bank.length} visible problems × Python/C/Java: reviewed steps, boundary checks, contracts and restorable key-line scaffolding passed.`);
