import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { TOTALS, draft, submission } from '../supabase/functions/algorithm-lab/core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const lab = path.join(root, 'algorithm-lab');
const problems = JSON.parse(fs.readFileSync(path.join(lab, 'chapter-02.json'), 'utf8'));
const original = JSON.parse(fs.readFileSync(path.join(lab, 'problems.json'), 'utf8'));
assert.equal(problems.length, 24);
for (const p of [...original, ...problems]) {
  assert.equal(TOTALS[p.id], p.tests.length, p.id + ' backend count');
  assert.ok(p.tests.some(t => t.public) && p.tests.some(t => !t.public));
  draft({problem: p.id, language: 'c', code: 'test'});
  const result = submission({id: 'c0953417-749e-42c1-b7e9-1162b6fcf21b', problem: p.id,
    language: 'c', code: 'test', report: {passed: p.tests.length, total: p.tests.length}});
  assert.ok(result.solved);
}
assert.throws(() => draft({problem: 'P87', language: 'c', code: ''}));

let receive;
const nextMessage = () => new Promise(resolve => { receive = resolve; });
const context = vm.createContext({
  TextEncoder, TextDecoder, WebAssembly, Uint8Array, ArrayBuffer, DataView,
  console, setTimeout, clearTimeout, performance,
  fetch: async file => {
    const buffer = fs.readFileSync(path.join(lab, String(file).split('?')[0]));
    return {ok: true, arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)};
  },
  self: {postMessage: data => { if (data.type !== 'phase') receive(data); }}
});
context.importScripts = (...files) => files.forEach(file => vm.runInContext(fs.readFileSync(path.join(lab, file.split('?')[0]), 'utf8'), context));
const boot = nextMessage();
vm.runInContext(fs.readFileSync(path.join(lab, 'c-worker.js'), 'utf8'), context);
assert.equal((await boot).type, 'ready');
let tested = 0;
for (const p of problems) {
  const result = nextMessage();
  await context.self.onmessage({data: {token: p.id, problem: p, cases: p.tests, code: p.c.solution}});
  const {report} = await result;
  assert.equal(report.error, undefined, p.id + ': ' + report.error);
  assert.equal(report.passed, report.total, p.id + ': ' + JSON.stringify(report.rows.filter(r => !r.ok)));
  tested += report.total;
  console.log(`${p.id} C11/WASM: ${report.passed}/${report.total}`);
}
// Exercise the unchanged chapter-one harness as well as compilation failures and wrong answers.
for (const [p, code, expected] of [
  [original[0], 'int linear_search(const int A[],int n,int target){for(int i=0;i<n;i++)if(A[i]==target)return i;return -1;}', 'pass'],
  [problems[0], 'int lock_attempts(const char secret[]){return 0;}', 'wrong'],
  [problems[0], 'int lock_attempts(const char secret[]){ broken C }', 'error'],
  [problems[1], 'int find_divisors(int n,int out[]){return 10001;}', 'wrong']
]) {
  const result = nextMessage();
  await context.self.onmessage({data: {token: 'negative', problem: p, cases: p.tests, code}});
  const {report} = await result;
  if (expected === 'error') assert.ok(report.error);
  else {
    assert.equal(report.error, undefined);
    assert.ok(expected === 'pass' ? report.passed === report.total : report.passed < report.total);
  }
}
console.log(`Verified ${tested} chapter-two C cases, backend contracts, chapter-one compatibility, and invalid answers.`);
