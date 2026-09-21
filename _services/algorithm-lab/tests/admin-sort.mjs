import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const lab = new URL('../../../algorithm-lab/', import.meta.url);
const saved = new Map();
let exported;
function fixture() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {value:'', replaceChildren() {}});
    return elements.get(id);
  };
  element('admin-chapter').value = '2';
  element('progress-filter').value = 'all';
  element('student-sort').value = 'student_no';
  element('sort-direction').value = 'asc';
  const ctx = vm.createContext({
    document:{getElementById:element, querySelectorAll:()=>[], createElement:()=>({click(){}})},
    sessionStorage:{getItem:key=>saved.get(key)||'', setItem:(key,value)=>saved.set(key,value)},
    setInterval:()=>{}, setTimeout:()=>{}, T:x=>x, UI_EN:false, Blob,
    URL:{createObjectURL:blob=>{exported=blob;return 'blob:fixture';}, revokeObjectURL:()=>{}}
  });
  for (const file of ['problem-catalog.js', 'admin.js']) vm.runInContext(fs.readFileSync(new URL(file,lab),'utf8'),ctx);
  return {ctx, element};
}
const {ctx, element} = fixture();
vm.runInContext(`students=[
  {id:'a',name:'나학생',student_no:'10',section:'01',last_seen:'2026-09-21T03:00:00Z',problems:[{problem:'P37',solved:true,attempts:2}]},
  {id:'b',name:'가학생',student_no:'2',section:'02',last_seen:'invalid',problems:[{problem:'P37',solved:true,attempts:9},{problem:'P38',solved:true,attempts:1}]},
  {id:'c',name:'가학생',student_no:'1',section:'01',last_seen:'2026-09-20T03:00:00Z',problems:[{problem:'P37',solved:true,attempts:2},{problem:'P47',solved:true,attempts:20}]},
  {id:'d',name:'다학생',student_no:'3',section:'02',last_seen:null,problems:[]}
];`,ctx);
const ids = () => vm.runInContext("sortedStudents().map(s=>s.id).join('')",ctx);
assert.equal(ids(),'cbda'); // Natural numeric student numbers: 1, 2, 3, 10.
element('student-sort').value='name';
assert.equal(ids(),'cbad');
element('sort-direction').value='desc';
assert.equal(ids(),'dacb'); // Equal names use student number, even descending.
for (const field of ['solved','attempts']) {
  element('student-sort').value=field;
  assert.equal(ids(),'bcad');
}
element('admin-chapter').value='3';
assert.equal(ids(),'cbda'); // Counts follow the selected chapter.
element('admin-chapter').value='2';
element('student-sort').value='last_seen';
assert.equal(ids(),'acbd');
element('sort-direction').value='asc';
assert.equal(ids(),'cabd'); // Missing timestamps last in both directions.
vm.runInContext("section='01'",ctx);
element('student-search').value='가';
assert.equal(ids(),'c');
vm.runInContext("section='all'",ctx);
element('student-search').value='';
element('progress-filter').value='not-started';
assert.equal(ids(),'d');
element('progress-filter').value='all';
// Changing controls saves preferences; repaint/refresh cannot reset them.
vm.runInContext('render=()=>{}',ctx);
element('student-sort').value='attempts';
element('student-sort').onchange();
assert.equal(element('sort-direction').value,'desc');
assert.equal(ids(),'bcad');
vm.runInContext('students=[...students].reverse()',ctx);
assert.equal(ids(),'bcad');
const restored=fixture();
assert.equal(restored.element('student-sort').value,'attempts');
assert.equal(restored.element('sort-direction').value,'desc');
element('admin-csv').onclick();
const csv=await exported.text();
assert.deepEqual(csv.split('\r\n').slice(1).map(row=>row.split(',')[1]),['"2"','"1"','"10"','"3"']);
assert.equal(vm.runInContext("students.map(s=>s.id).join('')",ctx),'dcba'); // No mutation of server data.
console.log('Admin sorting: Korean names, numeric order, ties, chapter counts, filters, missing activity, refresh, persistence and CSV passed.');
