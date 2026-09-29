import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Element {
  constructor(tag){this.tagName=tag;this.children=[];this.value='';this.textContent='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  setAttribute(){}
}
const roots=['writing-panel','case-results','next'].map(id=>Object.assign(new Element('div'),{id}));
const all=()=>{const nodes=[];const visit=n=>{nodes.push(n);for(const c of n.children||[])visit(c);};roots.forEach(visit);return nodes;};
const get=id=>all().find(n=>n.id===id);
const storage=new Map([['fixture:study',JSON.stringify({'P53:python':{method:'keep old method',boundary:'keep old boundary',complexity:'old complexity'}})]]);
let code='def insertion_sort(a):\n    pass\n',cloudCode='';
const context=vm.createContext({
  document:{getElementById:get,createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text})},
  localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
  $:get,KEY:'fixture',answerKey:id=>id+':python',T:x=>x,UI_EN:false,
  busy:false,language:'python',saved:{answers:{}},
  getCode:()=>code,setCode:value=>{code=value;},persist(){},
  cloudDraft:(id,language,value)=>{cloudCode=value;},renderNav(){},setResult(){}
});
vm.runInContext(fs.readFileSync(new URL('../../../algorithm-lab/exercise-study.js',import.meta.url),'utf8'),context);
const render=vm.runInContext('renderStudy',context);
render({id:'P53',chapter:3,exercise:97});
assert.equal(all().filter(n=>n.tagName==='textarea').length,1);
assert.equal(get('study-method'),undefined);
assert.equal(get('study-boundary'),undefined);
get('study-complexity').value='O(n²): n is the array length.';
get('study-complexity').oninput();
const entry=JSON.parse(storage.get('fixture:study'))['P53:python'];
assert.equal(entry.method,'keep old method');
assert.equal(entry.boundary,'keep old boundary');
assert.equal(entry.complexity,'O(n²): n is the array length.');
all().find(n=>n.tagName==='button').onclick();
assert.match(code,/O\(n²\)/);
assert.doesNotMatch(code,/keep old method|keep old boundary/);
assert.equal(cloudCode,code);
assert.match(get('study-status').textContent,/반영했습니다/);

render({id:'P57',chapter:4,exercise:91});
assert.equal(all().filter(n=>n.tagName==='textarea').length,3);
all().find(n=>n.tagName==='button').onclick();
assert.match(get('study-status').textContent,/3항목을 먼저/);
console.log('Chapters 1–3 accept complexity-only notes, preserve earlier notes, and append comments; later-chapter preparation is unchanged.');
