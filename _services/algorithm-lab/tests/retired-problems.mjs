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
assert.equal(ctx.active.length,5);
assert.deepEqual(Array.from(ctx.active,p=>p.exercise),[91,92,93,95,100]);
const retired=[['P70',94],['P72',96],['P73',97],['P74',98],['P75',99]];
for(const [id,exercise] of retired){
 ctx.retiredId=id;ctx.retiredExercise=String(exercise);
 assert.equal(vm.runInContext('findLinkedProblem(problems,retiredExercise,5)',ctx),-1);
 assert.equal(vm.runInContext('findLinkedProblem(problems,retiredId,5)',ctx),-1);
}
for(const exercise of [91,92]){
 ctx.requiredExercise=String(exercise);
 assert.ok(vm.runInContext('findLinkedProblem(problems,requiredExercise,5)',ctx)>=0);
}
// Exercise metadata/contracts remain intact for historical submissions.
assert.equal(bank.find(p=>p.id==='P75').function,'completion_sum');
const show=app.slice(app.indexOf('function show(i){'),app.indexOf('  const target=problems[i]'));
ctx.resetAIHint=()=>{};ctx.clearErrorLine=()=>{};
vm.runInContext(show+'return i;}',ctx);
for(const [id] of retired){
 ctx.retiredIndex=bank.findIndex(p=>p.id===id);
 assert.equal(vm.runInContext('show(retiredIndex)',ctx),bank.findIndex(p=>p.id==='P67'));
}
// The existing export path archives retired answers without deleting saved data.
const exportLine=app.split('\n').find(line=>line.includes('for(const [id,oldChapter] of Object.entries(LAB_RETIRED))'));
for(const language of ['python','c','java'])for(const [id] of retired){
 ctx.retiredId=id;
 ctx.archiveLanguage=language;ctx.studyEntry=()=>({});
 vm.runInContext('language=archiveLanguage',ctx);
 vm.runInContext('chapter=5;saved.answers={[answerKey(retiredId)]:"old code"};saved.passed={[answerKey(retiredId)]:{solved:true}};this.archivedAnswers=[]',ctx);
 vm.runInContext(exportLine,ctx);
 assert.equal(ctx.archivedAnswers.length,1);
 assert.equal(ctx.archivedAnswers[0].id,id);
 assert.equal(ctx.archivedAnswers[0].code,'old code');
 assert.equal(ctx.archivedAnswers[0].retired,true);
 assert.equal(vm.runInContext('saved.answers[answerKey(retiredId)]',ctx),'old code');
}
console.log('Chapter 5 scope: 5 active exercises, exam coding retained, five retired exercises archived in every language.');
