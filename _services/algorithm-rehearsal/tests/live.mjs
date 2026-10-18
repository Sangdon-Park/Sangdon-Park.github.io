// Synthetic rehearsal only. No credentials, examination endpoints or student data.
import assert from 'node:assert/strict';
import { exampleSheet } from './fixture.mjs';
const endpoint = 'https://algorithm-rehearsal.vercel.app/api/feedback';
async function call(body, origin = 'https://sangdon-park.github.io') {
  const response = await fetch(endpoint, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
const begun = await call({ task: 'begin' }); assert.equal(begun.status, 200, JSON.stringify(begun));
const payload = { task: 'assess', pass: begun.data.pass, dialect: process.argv.includes('--c') ? 'c99' : 'py', sheet: exampleSheet(process.argv.includes('--c')) };
const result = await call(payload); console.log(JSON.stringify(result));
assert.equal(result.status, 200); assert.equal(result.data.earned, 14); assert.equal(result.data.tiles.length, 6);
const replay = await call(payload); assert.deepEqual(replay, result);
assert.equal((await call({ ...payload, sheet: {} })).status, 409);
assert.equal((await call({ task: 'begin' }, 'https://not-allowed.invalid')).status, 403);
assert.equal((await call({ task: 'assess', dialect: 'py', sheet: {}, pass: 'fake' })).status, 401);
console.log('Live Gemini, private CAS storage, cached replay and isolation checks passed.');
