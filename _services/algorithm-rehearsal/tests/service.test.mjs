import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSheet, verifyReview, assess, fail, EDITION } from '../core.mjs';
import { createMeter } from '../meter.mjs';
import { buildGateway } from '../api/feedback.mjs';

const sheet = () => cleanSheet({ copper: 'd', jade: 'c', pebble: '10000', cedar: '(18,12), (12,6), (6,0), 최대공약수 6', ink: 'return -1', cost: 'O(n)' }, 'py');
function repository() {
  const rows = new Map(); let version = 0;
  return {
    rows,
    async read(path) { return structuredClone(rows.get(path) || null); },
    async write(path, value, etag) {
      const old = rows.get(path);
      if (old ? old.etag !== etag : !!etag) throw fail('CONFLICT', 409);
      rows.set(path, { value: structuredClone(value), etag: String(++version) });
    }
  };
}
async function request(handler, body, overrides = {}) {
  if (body && typeof body === 'object') body = { edition: EDITION, ...body };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(value) { this.value = value; return this; }, end() {} };
  await handler({ method: 'POST', headers: { origin: 'https://sangdon-park.github.io', 'content-type': 'application/json', 'x-real-ip': '127.0.0.1', ...overrides.headers }, body, ...Object.fromEntries(Object.entries(overrides).filter(([k]) => k !== 'headers')) }, res);
  return res;
}
test('strict sheet contract and size bounds', () => {
  assert.equal(sheet().copper, 'd');
  assert.equal(cleanSheet({ copper: 'e', jade: 'e' }, 'py').copper, 'e');
  for (const value of [{ hidden: 'x' }, { copper: 'ab' }, { ink: 'x'.repeat(6001) }, { cedar: 4 }, { cost: '\0' }]) assert.throws(() => cleanSheet(value, 'py'), /BAD_SHEET/);
  assert.throws(() => cleanSheet({}, 'javascript'), /BAD_SHEET/);
  assert.equal(cleanSheet({}, 'c99').ink, '');
});
test('AI feedback cannot invent evidence, exceed points, or repeat keys', () => {
  const raw = { tiles: ['pebble', 'cedar', 'ink', 'cost'].map(key => ({ key, earned: 0, tip: '확인 필요', quotes: [] })) };
  assert.equal(verifyReview(raw, sheet()).length, 4);
  for (const change of [r => r.tiles[0].earned = 3, r => r.tiles[0].earned = 0.5, r => r.tiles[0].quotes = ['invented'], r => r.tiles[1].key = 'pebble', r => r.tiles[0].earned = 1]) {
    const copy = structuredClone(raw); change(copy); assert.throws(() => verifyReview(copy, sheet()), /UNUSABLE_FEEDBACK/);
  }
});
test('grading isolates instructions and combines deterministic MC with validated AI', async () => {
  let packet;
  const result = await assess(sheet(), 'py', { key: 'fixture-only', fetcher: async (url, options) => {
    assert.ok(url.endsWith('/gemini-3.8-flash:generateContent')); packet = JSON.parse(options.body);
    return { ok: true, json: async () => ({ modelVersion: 'gemini-3.8-flash', candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ tiles: ['pebble', 'cedar', 'ink', 'cost'].map(key => ({ key, earned: 0, tip: '확인 필요', quotes: [] })) }) }] } }] }) };
  } });
  assert.equal(result.earned, 4); assert.equal(result.ceiling, 14); assert.equal(result.tiles.length, 6);
  assert.equal(result.model, 'gemini-3.8-flash'); assert.equal(result.requestedModel, 'gemini-3.8-flash');
  assert.match(packet.systemInstruction.parts[0].text, /신뢰하지 않는 데이터/);
  assert.match(result.note, /답안과 코드를 읽고 채점/);
  await assert.rejects(() => assess(sheet(), 'py', { key: 'fixture', fetcher: async () => ({ ok: false, status: 429 }) }), /PROVIDER_BUSY/);
});
test('rejects unexpected or missing model metadata without falling back', async () => {
  for (const modelVersion of ['gemini-3.6-flash', 'gemini-3.5-flash', undefined]) {
    let calls = 0;
    await assert.rejects(() => assess(sheet(), 'py', { key: 'fixture', fetcher: async () => {
      calls++;
      return { ok: true, json: async () => ({ modelVersion, candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"tiles":[]}' }] } }] }) };
    } }), /MODEL_MISMATCH/);
    assert.equal(calls, 1);
  }
});
test('persistent quotas, single use, response replay, and expiry', async () => {
  let now = 1800000000000;
  const repo = repository(), meter = createMeter(repo, () => now);
  const { pass } = await meter.begin('one');
  assert.ok((await meter.begin('one')).pass, 'independent students may share a campus address');
  assert.equal((await meter.reserve(pass, 'one', 'digest')).cached, null);
  await assert.rejects(() => meter.reserve(pass, 'one', 'digest'), /TRY_LATER/);
  await meter.finish(pass, { earned: 14 });
  assert.equal((await meter.reserve(pass, 'one', 'digest')).cached.earned, 14);
  await assert.rejects(() => meter.reserve(pass, 'one', 'different'), /ALREADY_SENT/);
  await assert.rejects(() => meter.reserve('0'.repeat(64), 'one', 'digest'), /INVALID_PASS/);
  now += 3600001;
  await assert.rejects(() => meter.reserve(pass, 'one', 'digest'), /INVALID_PASS/);
  assert.ok(!JSON.stringify([...repo.rows]).includes('return -1'));
});
test('CAS only permits one concurrent reservation; retries capped', async () => {
  let now = 1800000000000;
  const meter = createMeter(repository(), () => now), { pass } = await meter.begin('one');
  const results = await Promise.allSettled([meter.reserve(pass, 'one', 'a'), meter.reserve(pass, 'one', 'a')]);
  assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
  await meter.finish(pass, null); now += 21000;
  await meter.reserve(pass, 'one', 'a'); await meter.finish(pass, null); now += 21000;
  await assert.rejects(() => meter.reserve(pass, 'one', 'a'), /TRY_LATER/);
});
test('per-address grade quota persists across new meter instances', async () => {
  let now = 1800000000000; const repo = repository();
  for (let n = 0; n < 200; n++) {
    const meter = createMeter(repo, () => now), { pass } = await meter.begin('one');
    await meter.reserve(pass, 'one', String(n)); await meter.finish(pass, { earned: 0 }); now += 21000;
  }
  const meter = createMeter(repo, () => now), { pass } = await meter.begin('one');
  await assert.rejects(() => meter.reserve(pass, 'one', 'cap'), /DAILY_LIMIT/);
  const { pass: other } = await meter.begin('two');
  await assert.rejects(() => meter.reserve(other, 'two', 'global-cap'), /DAILY_LIMIT/);
});
test('gateway rejects bad origins, methods, malformed payloads, and forged passes', async () => {
  const handler = buildGateway({ key: 'fixture', meter: createMeter(repository()) });
  assert.equal((await request(handler, {}, { headers: { origin: 'https://evil.invalid' } })).statusCode, 403);
  assert.equal((await request(handler, {}, { method: 'GET' })).statusCode, 405);
  assert.equal((await request(handler, {}, { method: 'OPTIONS' })).statusCode, 204);
  for (const body of ['{', 'x'.repeat(32001), {}, { task: 'assess', sheet: { unknown: 'x' }, dialect: 'py' }]) assert.equal((await request(handler, body)).statusCode, 400);
  assert.equal((await request(handler, { task: 'assess', sheet: {}, dialect: 'py', pass: 'fake' })).statusCode, 401);
});
test('gateway caches identical submissions without extra AI calls', async () => {
  let calls = 0; const meter = createMeter(repository());
  const handler = buildGateway({ key: 'fixture', meter, grader: async () => { calls++; return { earned: 14 }; } });
  const begun = await request(handler, { task: 'begin' });
  const body = { task: 'assess', pass: begun.value.pass, dialect: 'py', sheet: sheet() };
  assert.equal((await request(handler, body)).value.earned, 14);
  assert.equal((await request(handler, body)).value.earned, 14); assert.equal(calls, 1);
  assert.equal((await request(handler, { ...body, sheet: {} })).statusCode, 409);
});
test('provider failures never become a zero grade or leak errors', async () => {
  const handler = buildGateway({ key: 'fixture', meter: createMeter(repository()), grader: async () => { throw Error('SECRET_PROVIDER_TRACE'); } });
  const begun = await request(handler, { task: 'begin' });
  const response = await request(handler, { task: 'assess', pass: begun.value.pass, dialect: 'py', sheet: sheet() });
  assert.equal(response.statusCode, 503); assert.deepEqual(response.value, { problem: 'TEMPORARY_FAILURE' });
});
test('old or missing editions are rejected before allocating storage or grading', async () => {
  let calls = 0;
  const handler = buildGateway({ key: 'fixture', meter: { begin: async () => { calls++; } }, grader: async () => { calls++; } });
  for (const edition of [undefined, 'rehearsal-20261018-a']) {
    const response = await request(handler, { task: 'begin', edition });
    assert.equal(response.statusCode, 409); assert.equal(response.value.problem, 'EDITION_CHANGED');
  }
  assert.equal(calls, 0);
});
test('no submission or no code deterministically receives zero without an AI validation error', () => {
  const raw = { tiles: ['pebble', 'cedar', 'ink', 'cost'].map(key => ({ key, earned: 1, tip: '의도적으로 만든 AI 오판정', quotes: ['invented evidence'] })) };
  const result = verifyReview(raw, cleanSheet({ cost: 'O(n)' }, 'py'));
  assert.deepEqual(result.map(t => t.earned), [0,0,0,0]);
});
