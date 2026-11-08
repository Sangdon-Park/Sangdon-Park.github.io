import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(import.meta.dirname,'../../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bank=JSON.parse(read('algorithm-lab/final-problems.json'));
const context=vm.createContext({T:value=>value});
for(const file of ['java-problems.js','examples.js','final-exam-contracts.js','custom-inputs.js']){
  vm.runInContext(read('algorithm-lab/'+file),context);
}
assert.equal(vm.runInContext('typeof practiceExamplesForProblem',context),'function',
  'Displayed examples and sample execution must use one shared selector.');

const expectedFirst={'F08-01':9,'F08-02':4,'F08-03':9,'F08-04':9};
let count=0;
for(const problem of bank.filter(p=>p.chapter===8)){
  context.problem=problem;
  const examples=vm.runInContext('practiceExamplesForProblem(problem)',context);
  assert.equal(examples[0].expected,expectedFirst[problem.id],problem.id+' must start with the PPTX example');
  assert.equal(JSON.stringify(vm.runInContext('customFields(problem).map(field=>field.value)',context)),
    JSON.stringify(examples[0].args),problem.id+' direct input must start with the displayed example');
  assert.ok(examples.length>=3);
  for(const label of ['구할 값','입력','반환값','계산 규칙'])assert.ok(problem.statement.includes(label));
  assert.ok(problem.c.statement.startsWith(problem.statement));
  assert.ok(!problem.c.argumentGuide.includes('Python과 같은'));
  assert.match(problem.statement,/0번/);
  for(const example of examples){
    context.example=example;
    vm.runInContext('validateCustomArgs(problem,example.args)',context);
    assert.ok(example.title&&example.explanation);
    for(const language of ['python','c','java']){
      context.language=language;
      const result=vm.runInContext('formatProblemExample(problem,example,language,problem.c,1)',context);
      assert.ok(result.includes(example.explanation));
      assert.ok(result.includes(String(example.expected)));
      assert.doesNotMatch(result,/undefined|NaN/);
    }
    count++;
  }
}
const legacy=bank.find(p=>p.chapter===9);
context.problem=legacy;
assert.equal(JSON.stringify(vm.runInContext('practiceExamplesForProblem(problem)',context)),
  JSON.stringify(legacy.tests.filter(test=>test.public)));

const app=read('algorithm-lab/app.js');
assert.match(app,/for\(const \[j,t\] of practiceExamplesForProblem\(p\)\.entries\(\)\)/);
assert.match(app,/mode==='sample'\?practiceExamplesForProblem\(p\):p\.tests/);
console.log(JSON.stringify({chapter:8,illustratedExamples:count,languages:3,legacyFallback:true}));
