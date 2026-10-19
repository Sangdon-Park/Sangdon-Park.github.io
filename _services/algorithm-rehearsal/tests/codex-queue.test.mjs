import test from 'node:test';
import assert from 'node:assert/strict';
import { createCodexQueue } from '../codex-queue.mjs';
import { createMeter, digest } from '../meter.mjs';
import { cleanSheet, EDITION } from '../core.mjs';
import { exampleSheet } from './fixture.mjs';
function repository() {
  const rows = new Map(); let version = 0;
  return { rows, async read(key) { return rows.has(key) ? structuredClone(rows.get(key)) : null; }, async write(key, value, etag) {
    if (rows.get(key)?.etag !== etag) throw Object.assign(Error('CONFLICT'), { tag: 'CONFLICT' });
    rows.set(key, { value: structuredClone(value), etag: String(++version) });
  } };
}
test('Codex queue grades saved Gemini submissions without changing the original ticket', async () => {
  const repo = repository(), meter = createMeter(repo), queue = createCodexQueue(repo);
  const { pass } = await meter.begin('synthetic'), sheet = cleanSheet(exampleSheet(), 'py');
  const path = `passes/${digest(pass)}.json`, ticket = await repo.read(path);
  await repo.write(path, { ...ticket.value, phase: 'done', fingerprint: digest(JSON.stringify([EDITION, 'py', sheet])), feedback: { provider: 'gemini', earned: 12 } }, ticket.etag);
  await queue.start(Date.now() + 36000000, 'one');
  assert.equal((await queue.submit(pass, sheet, 'py')).state, 'queued');
  assert.equal((await queue.submit(pass, sheet, 'py')).state, 'queued');
  const [first, second] = await Promise.all([queue.claim(), queue.claim()]);
  const job = first || second; assert.ok(job); assert.ok(!first || !second, 'single claim');
  const raw = { tiles: ['pebble','cedar','ink','cost'].map((key, i) => ({ key, earned: [2,4,3,1][i], tip: '합성 채점 근거와 수정 방법입니다.', quotes: [sheet[key].slice(0, 70)] })) };
  const result = await queue.complete(job, raw, 'codex-test');
  assert.equal(result.earned, 14); assert.equal(result.provider, 'codex');
  assert.deepEqual(await queue.submit(pass, sheet, 'py'), result);
  assert.equal((await repo.read(path)).value.feedback.earned, 12, 'preserve original Gemini result');
  assert.equal((await repo.read(`codex/jobs/${digest(pass)}.json`)).value.sheet, undefined);
  await assert.rejects(() => queue.submit(pass, { ...sheet, pebble: '9999' }, 'py'), /ALREADY_SENT/);
});
test('Codex worker deadline, lease recovery and foreign tickets are enforced', async () => {
  let now = Date.now(); const repo = repository(), meter = createMeter(repo, () => now), queue = createCodexQueue(repo, () => now);
  const { pass } = await meter.begin('synthetic'), sheet = cleanSheet(exampleSheet(), 'py');
  await assert.rejects(() => queue.submit(pass, sheet, 'py'), /CODEX_CLOSED/);
  await queue.start(now + 36000000, 'one');
  await assert.rejects(() => queue.start(now + 36000000, 'other'), /WORKER_ALREADY_RUNNING/);
  await assert.rejects(() => queue.submit('0'.repeat(64), sheet, 'py'), /INVALID_PASS/);
  await queue.submit(pass, sheet, 'py'); const old = await queue.claim();
  now += 240001; const next = await queue.claim(); assert.notEqual(old.lease, next.lease);
  await assert.rejects(() => queue.complete(old, { tiles: [] }, 'fixture'), /UNUSABLE_FEEDBACK/);
  await queue.release(next); now += 31000; assert.ok(await queue.claim());
  now += 36000000; await assert.rejects(() => queue.claim(), /CODEX_CLOSED/);
});
