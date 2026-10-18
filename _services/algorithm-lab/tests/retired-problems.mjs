import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const bank=JSON.parse(read('algorithm-lab/exercise-problems.json'));
const ctx=vm.createContext({localStorage:{getItem:()=>null},bank});
vm.runInContext(read('algorithm-lab/problem-catalog.js'),ctx);
const app=read('algorithm-lab/app.js');
vm.runInContext(app.slice(0,app.indexOf('function persist()')),ctx);
vm.runInContext('problems=bank;this.active=orderedChapter(5)',ctx);
assert.equal(ctx.active.length,9);
assert.deepEqual(Array.from(ctx.active,p=>p.exercise),[91,92,93,94,95,96,97,98,100]);
assert.equal(vm.runInContext('findLinkedProblem(problems,"99",5)',ctx),-1);
assert.equal(vm.runInContext('findLinkedProblem(problems,"P75",5)',ctx),-1);
assert.ok(vm.runInContext('findLinkedProblem(problems,"98",5)',ctx)>=0);
// Exercise metadata/contracts remain intact for historical submissions.
assert.equal(bank.find(p=>p.id==='P75').function,'completion_sum');
const show=app.slice(app.indexOf('function show(i){'),app.indexOf('  const target=problems[i]'));
ctx.resetAIHint=()=>{};ctx.clearErrorLine=()=>{};
vm.runInContext(show+'return i;}',ctx);
ctx.retiredIndex=bank.findIndex(p=>p.id==='P75');
assert.equal(vm.runInContext('show(retiredIndex)',ctx),bank.findIndex(p=>p.id==='P67'));
// The existing export path archives retired answers without deleting saved data.
const exportLine=app.split('\n').find(line=>line.includes('for(const [id,oldChapter] of Object.entries(LAB_RETIRED))'));
for(const language of ['python','c','java']){
 ctx.archiveLanguage=language;ctx.studyEntry=()=>({});
 vm.runInContext('language=archiveLanguage',ctx);
 vm.runInContext('chapter=5;saved.answers={[answerKey("P75")]:"old code"};saved.passed={[answerKey("P75")]:{solved:true}};this.archivedAnswers=[]',ctx);
 vm.runInContext(exportLine,ctx);
 assert.equal(ctx.archivedAnswers.length,1);
 assert.equal(ctx.archivedAnswers[0].id,'P75');
 assert.equal(ctx.archivedAnswers[0].code,'old code');
 assert.equal(ctx.archivedAnswers[0].retired,true);
 assert.equal(vm.runInContext('saved.answers[answerKey("P75")]',ctx),'old code');
}
console.log('ATM retirement: 9 active exercises, links/restores guarded, TSP retained, all language archives preserved.');
