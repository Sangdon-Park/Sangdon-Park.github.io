// Synthetic rehearsal only. No credentials, examination endpoints or student data.
import assert from 'node:assert/strict';
import { exampleSheet } from './fixture.mjs';
const endpoint = 'https://algorithm-rehearsal.vercel.app/api/feedback';
const edition = 'rehearsal-20261018-ch1-4';
async function call(body, origin = 'https://sangdon-park.github.io') {
  const response = await fetch(endpoint, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, edition }), signal: AbortSignal.timeout(155000) });
  return { status: response.status, data: await response.json() };
}
const begun = await call({ task: 'begin' }); assert.equal(begun.status, 200, JSON.stringify(begun));
const answers = exampleSheet(process.argv.includes('--c'));
if (process.argv.includes('--partial')) {
  answers.pebble = '9999'; answers.cedar = '(18,12)';
  answers.ink = answers.ink.replace('return i', 'return i+1');
  answers.cost = 'O(1), 함수가 하나라 한 번이면 끝난다.';
}
const payload = { task: 'assess', pass: begun.data.pass, dialect: process.argv.includes('--c') ? 'c99' : 'py', sheet: answers };
let result;
const started = Date.now();
for (let attempt = 1; attempt <= 4; attempt++) {
  result = await call(payload);
  if (result.status === 200 || !result.data.retryable || attempt === 4 || result.data.retryAfterSeconds > 120) break;
  const seconds = Math.max(15, result.data.retryAfterSeconds || 30);
  console.log(JSON.stringify({ status: result.status, problem: result.data.problem, retryAfterSeconds: seconds, attempt }));
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
console.log(JSON.stringify({ ...result, elapsedSeconds: Math.round((Date.now() - started) / 1000) }));
assert.equal(result.status, 200); assert.equal(result.data.earned, process.argv.includes('--partial') ? 7 : 14); assert.equal(result.data.tiles.length, 6);
assert.ok(result.data.tiles.filter(t => ['pebble', 'cedar', 'ink', 'cost'].includes(t.key)).every(t => t.tip.length >= 100), 'written/code feedback must include explanations');
assert.equal(result.data.requestedModel, 'gemini-3.8-flash');
assert.ok(result.data.model === 'gemini-3.8-flash' || result.data.model.startsWith('gemini-3.8-flash-'));
assert.equal(result.data.edition, edition);
const replay = await call(payload); assert.deepEqual(replay, result);
assert.equal((await call({ ...payload, sheet: {} })).status, 409);
assert.equal((await call({ task: 'begin' }, 'https://not-allowed.invalid')).status, 403);
assert.equal((await call({ task: 'assess', dialect: 'py', sheet: {}, pass: 'fake' })).status, 401);
console.log('Live Gemini, private CAS storage, cached replay and isolation checks passed.');
