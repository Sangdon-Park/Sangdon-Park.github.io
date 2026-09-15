import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, {value: '', replaceChildren() {}});
  return elements.get(id);
};
element('admin-chapter').value = 'all';
element('progress-filter').value = 'all';
const context = vm.createContext({
  document: {getElementById: element, querySelectorAll: () => []},
  sessionStorage: {getItem: () => ''},
  setInterval: () => {}, T: x => x, UI_EN: false
});
vm.runInContext(fs.readFileSync(new URL('../../../algorithm-lab/admin.js', import.meta.url), 'utf8'), context);
vm.runInContext(`students=[{student_no:'fixture',name:'Test',section:'1',problems:[
  {problem:'P01',language:'c',solved:true,attempts:2},
  {problem:'P01',language:'python',solved:true,attempts:3},
  {problem:'P13',language:'c',solved:true,attempts:4},
  {problem:'P36',language:'python',solved:false,attempts:1}
]}];`, context);
for (const [chapter, total, solved, attempts] of [['all',36,2,10], ['1',12,1,5], ['2',24,1,5]]) {
  element('admin-chapter').value = chapter;
  assert.equal(vm.runInContext('selectedTotal()', context), total);
  assert.equal(vm.runInContext('filtered()[0].solved', context), solved);
  assert.equal(vm.runInContext('filtered()[0].attempts', context), attempts);
}
element('progress-filter').value = 'complete';
assert.equal(vm.runInContext('filtered().length', context), 0);
element('progress-filter').value = 'working';
assert.equal(vm.runInContext('filtered().length', context), 1);
console.log('Dashboard chapter totals, per-language deduplication, attempts, and filters passed.');
