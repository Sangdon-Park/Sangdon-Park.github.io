import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../../',import.meta.url);
const bank=JSON.parse(fs.readFileSync(new URL('algorithm-lab/exercise-problems.json',root),'utf8'));
const context=vm.createContext({bank});
vm.runInContext(fs.readFileSync(new URL('algorithm-lab/problem-catalog.js',root),'utf8'),context);
for(const [index,p] of bank.entries()){
  context.index=index;
  assert.equal(vm.runInContext('displayedProblemId(bank[index])',context),String(p.exercise));
  assert.equal(vm.runInContext('findLinkedProblem(bank, String(bank[index].exercise), bank[index].chapter)',context),index);
  assert.equal(vm.runInContext('findLinkedProblem(bank, bank[index].id, bank[index].chapter)',context),index);
}
assert.equal(vm.runInContext('findLinkedProblem(bank,"P13",2)',context),bank.findIndex(p=>p.id==='P37'));
assert.equal(vm.runInContext('findLinkedProblem(bank,"93",3)',context),-1);
assert.equal(vm.runInContext('findLinkedProblem(bank,"P49",3)',context),-1);
console.log(`${bank.length} numbered links, old saved IDs and chapter-specific lookups passed.`);
