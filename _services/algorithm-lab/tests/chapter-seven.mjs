import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../../../algorithm-lab/',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const problems=JSON.parse(read('final-problems.json')).filter(p=>p.chapter===7);
assert.equal(problems.length,4);
for(const locale of ['ko','en','es-ES','es-419']) {
  const context=vm.createContext({UI_LOCALE:locale,T:x=>x,document:{querySelectorAll:()=>[]}});
  for(const file of ['chapter-seven.js','c-problems.js','java-problems.js','hint-guides.js','hint-references.js','java-hint-references.js','practice-hints.js'])vm.runInContext(read(file),context);
  context.bank=problems;
  const records=vm.runInContext(`bank.map(p=>{
    C_PROBLEMS[p.id]=p.c;
    return {id:p.id,original:p.statement,description:chapterSevenDescription(p,p),
      hints:['python','c','java'].map(lang=>({lang,...practiceHintData(p,lang)}))};
  })`,context);
  for(const record of records) {
    assert.ok(record.original.includes(record.description),record.id+' description must retain the exact published contract');
    assert.ok(!record.description.includes('\n\n예제\n'),record.id+' duplicate examples removed only from display');
    for(const h of record.hints) {
      assert.equal(h.steps.length,3);
      assert.ok(h.check.length>30);
      assert.ok(h.solution.includes(record.id==='F07-01'?'permutation_count':record.id==='F07-02'?'subset_sum_count':record.id==='F07-03'?'can_color':'nqueen_count'));
      assert.ok(h.blanks.length>0);
      let restored=h.skeleton;for(const blank of h.blanks)restored=restored.replace(blank.label,blank.answer);
      assert.equal(restored,h.solution);
      if(locale!=='ko')assert.ok(!/[가-힣]/.test(h.steps.join('')+h.check),'Chapter 7 steps localized');
    }
  }
}
console.log('Chapter 7: four contracts, three code languages, four UI locales, progressive hints and complete references verified.');
