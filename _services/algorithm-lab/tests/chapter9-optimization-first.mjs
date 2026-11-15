import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {TOTALS,draft,submission} from '../supabase/functions/algorithm-lab/core.mjs';
import {peerProblem} from '../supabase/functions/algorithm-lab/peer-review.mjs';
const lab=new URL('../../../algorithm-lab/',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,lab),'utf8');
const bank=JSON.parse(read('final-problems.json'));
const p=bank.find(p=>p.id==='F10-02-v2'),old=bank.find(p=>p.id==='F10-02');
assert.equal(p.function,'approx_weight');assert.deepEqual(p.params,['weights','capacity']);
assert.equal(p.finalExam,true);assert.equal(p.displayId,'9-2');assert.equal(p.chapter,9);
assert.equal(old.function,'list_scheduling');assert.equal(old.retired,true);assert.equal(old.finalExam,false);
assert.equal(TOTALS[old.id],6);assert.equal(TOTALS['F10-01-v2'],11);
assert.equal(peerProblem(old.id),false);assert.equal(peerProblem(p.id),true);
const ctx=vm.createContext({p,bank});
for(const f of ['problem-catalog.js','final-exam-contracts.js','java-problems.js','examples.js'])vm.runInContext(read(f),ctx);
assert.equal(vm.runInContext('findLinkedProblem(bank,"9-2",9)',ctx),bank.indexOf(p));
assert.equal(vm.runInContext('findLinkedProblem(bank,"F10-02",9)',ctx),-1);
for(const t of p.tests){ctx.t=t;vm.runInContext('validateFinalArgs(p,t.args)',ctx);assert.match(vm.runInContext('finalCCase(p,t.args).call',ctx),/approx_weight\(weights,\d+,\d+\)/);}
for(const args of [[[0],10],[[-1],10],[[1],0],[[1000001],10],[Array(1001).fill(1),10]]){ctx.args=args;assert.throws(()=>vm.runInContext('validateFinalArgs(p,args)',ctx));}
draft({problem:p.id,language:'c',code:p.c.solution});
assert.equal(submission({id:'c0953417-749e-42c1-b7e9-1162b6fcf21b',problem:p.id,language:'python',code:p.solution,report:{passed:p.tests.length,total:p.tests.length}}).solved,true);
console.log('Chapter 9 replacement, legacy preservation, C/Java examples and input boundaries pass.');
