import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../../../algorithm-lab/app.js',import.meta.url),'utf8');
const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,replaceChildren(){}});return elements.get(id);};
const calls=[];
const ctx=vm.createContext({
  $:el,cloud:{session:{student:{id:'isolated'}}},ready:true,busy:false,index:0,language:'python',token:0,job:null,timer:null,
  problems:[{id:'P47',tests:[{public:true,args:[[1],1],expected:0}]}],saved:{answers:{},passed:{P47:{code:'previous',passed:4,total:4}},judged:{P47:'previous'}},
  customCompleted:false,worker:{postMessage:payload=>calls.push(['worker',payload]),terminate:()=>calls.push(['terminate'])},
  controls(){},clearErrorLine(){},getCode:()=> 'current source',answerKey:id=>id,persist:()=>calls.push(['persist']),setResult:message=>calls.push(['message',message]),
  customLabel:ko=>ko,T:x=>x,languageName:()=> 'Python',customArgsFromUI:()=>[[8,2,2],2],
  rememberJudgedAnswer:()=>calls.push(['judged']),rememberHintRun:()=>calls.push(['hint']),cloudAttempt:()=>calls.push(['submit']),finishCustom:report=>calls.push(['custom',report]),
  setTimeout:fn=>{ctx.timeout=fn;return 1;},clearTimeout(){},requirePracticeAccount:()=>calls.push(['login']),
});
for(const [start,end]of [['function armTimeout(ms){','function run(mode){'],['function run(mode){','function finish(report){'],['function finish(report){',"$('code').addEventListener"]])vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),ctx);
const stop=source.slice(source.indexOf("$('stop').onclick="),source.indexOf("$('reset').onclick="));vm.runInContext(stop,ctx);
const unchanged=()=>{assert.equal(JSON.stringify(ctx.saved.passed),' {"P47":{"code":"previous","passed":4,"total":4}}'.trim());assert.equal(JSON.stringify(ctx.saved.judged),'{"P47":"previous"}');assert.ok(!calls.some(c=>['submit','judged','hint'].includes(c[0])),JSON.stringify(calls));};
for(const report of [{custom:{value:'1'}},{error:'compile error',diagnostics:[]},{error:'runtime error',custom:{stdout:'before'}}]){
  calls.length=0;ctx.ready=true;ctx.busy=false;vm.runInContext("run('custom')",ctx);
  const sent=calls.find(c=>c[0]==='worker')[1];assert.equal(sent.mode,'custom');assert.equal(JSON.stringify(sent.cases),'[{"args":[[8,2,2],2]}]');assert.equal('expected' in sent.cases[0],false);
  ctx.report=report;vm.runInContext('finish(report)',ctx);assert.ok(calls.some(c=>c[0]==='custom'));unchanged();
}
for(const action of ['timeout','stop']){
  calls.length=0;ctx.ready=true;ctx.busy=false;vm.runInContext("run('custom')",ctx);
  if(action==='timeout')ctx.timeout();else el('stop').onclick();
  assert.equal(ctx.busy,false);assert.equal(ctx.ready,false);assert.equal(el('retry').hidden,false);assert.ok(calls.some(c=>c[0]==='terminate'));unchanged();
}
calls.length=0;ctx.ready=true;ctx.customArgsFromUI=()=>{throw Error('invalid input');};vm.runInContext("run('custom')",ctx);assert.equal(ctx.busy,false);assert.equal(el('custom-input-error').textContent,'invalid input');assert.ok(!calls.some(c=>c[0]==='worker'));unchanged();
ctx.cloud.session=null;calls.length=0;vm.runInContext("run('custom')",ctx);assert.deepEqual(calls,[['login']]);
console.log('Custom run state: success, compile/runtime errors, invalid inputs, timeout, stop, account gate and no changes to judged/solved/submission/hint state passed.');
