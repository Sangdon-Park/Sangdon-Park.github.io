import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TOTALS,draft,submission} from '../supabase/functions/algorithm-lab/core.mjs';
import {peerProblem} from '../supabase/functions/algorithm-lab/peer-review.mjs';

const root = new URL('../../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name,root),'utf8');
const bank = JSON.parse(read('algorithm-lab/final-problems.json'));
const p = bank.find(p=>p.id==='F10-01-v2');
assert.ok(p,'9-1 must have a new ID so old student answers retain their contract');
assert.equal(p.function,'two_machine_time');
assert.deepEqual(p.params,['jobs']);
assert.equal(p.finalExam,true);
assert.equal(p.displayId,'9-1');
assert.equal(p.chapter,9);
assert.equal(p.level,'쉬움');
const old = bank.find(p=>p.id==='F10-01');
assert.equal(old.function,'within_factor');
assert.equal(old.finalExam,false);
assert.equal(old.retired,true);
assert.equal(TOTALS[old.id],6);
assert.equal(peerProblem(old.id),false);
assert.equal(peerProblem(p.id),true);
assert.equal(TOTALS[p.id],p.tests.length);
const ctx=vm.createContext({});
for(const name of ['problem-catalog.js','final-exam-contracts.js','java-problems.js','examples.js'])vm.runInContext(read('algorithm-lab/'+name),ctx);
ctx.p=p;ctx.bank=bank;
assert.equal(vm.runInContext('findLinkedProblem(bank,"9-1",9)',ctx),bank.indexOf(p));
assert.equal(vm.runInContext('findLinkedProblem(bank,"F10-01",9)',ctx),-1);
for(const [jobs,expected] of [[[],0],[[7],7],[[3,2,4],6],[[4,3,2],5],[[2,2,2],4],[[1,1,2],3],[[0,0],0],[[8,7,6,5,4,3],17]]){
  const t=p.tests.find(t=>JSON.stringify(t.args)===JSON.stringify([jobs]));
  assert.ok(t,`Missing required test ${JSON.stringify(jobs)}`);
  assert.equal(t.expected,expected);
}
for(const test of p.tests){
  ctx.args=test.args;
  vm.runInContext('validateFinalArgs(p,args)',ctx);
  const harness=vm.runInContext('finalCCase(p,args)',ctx);
  assert.match(harness.call,/two_machine_time\(a,\d+\)/);
  for(const language of ['python','c','java']){
    ctx.test=test;ctx.language=language;
    const example=vm.runInContext('formatProblemExample(p,test,language,p.c,1)',ctx);
    assert.ok(!/undefined|NaN/.test(example));
  }
}
for(const args of [[[-1]],[[1000001]],[new Array(1001).fill(1)],[3],[]]){
  ctx.args=args;assert.throws(()=>vm.runInContext('validateFinalArgs(p,args)',ctx));
}
draft({problem:p.id,language:'c',code:p.c.solution});
assert.equal(submission({id:'c0953417-749e-42c1-b7e9-1162b6fcf21b',problem:p.id,language:'python',code:p.solution,report:{passed:p.tests.length,total:p.tests.length}}).solved,true);
console.log('Two-machine problem, archived comparison, examples, validation and backend contract pass.');
