// Synthetic practice answers and mocked API only. No student or exam records.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const root = path.resolve(__dirname, '../../..');
const endpoint = 'https://algorithm-rehearsal.vercel.app/api/feedback';
const drawer = 'algorithm-rehearsal-20261018-ch1-4', edition = 'rehearsal-20261018-ch1-4';
const sheet = { copper: 'd', jade: 'c', pebble: '10000', cedar: '(18,12) → (12,6) → (6,0), GCD=6', ink: 'def first_index(a, x):\n    for i, v in enumerate(a):\n        if v == x: return i\n    return -1', cost: 'O(n), n개를 비교한다.' };
const feedback = { edition, earned: 14, ceiling: 14, tiles: ['copper', 'jade', 'pebble', 'cedar', 'ink', 'cost'].map((key, i) => ({ key, earned: [2,2,2,4,3,1][i], ceiling: [2,2,2,4,3,1][i], tip: '합성 답안의 기준별 피드백입니다.' })) };
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8' })[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
async function until(check, label) {
  const end = Date.now() + 10000;
  while (Date.now() < end) { if (await check()) return; await new Promise(r => setTimeout(r, 30)); }
  throw Error('Timed out: ' + label);
}
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  async function setup(respond, offline = false) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } }), page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.clock.install();
    await page.addInitScript(({ drawer, sheet, offline }) => {
      if (!localStorage.getItem(drawer)) localStorage.setItem(drawer, JSON.stringify({ edition: 1, until: Date.now() + 900000, sheet, dialect: 'py', drafts: { py: sheet.ink, c99: '' }, pass: 'a'.repeat(64), sent: true, feedback: null }));
      if (offline) { window.testOnline = false; Object.defineProperty(navigator, 'onLine', { get: () => window.testOnline }); }
    }, { drawer, sheet, offline });
    await page.route(endpoint, respond);
    await page.goto(origin + '/algorithm-preview/');
    return { page, context };
  }
  const state = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), drawer);
  async function next(page, attempt) {
    await until(async () => (await state(page)).retryAttempt === attempt, 'retry scheduled ' + attempt);
    const delay = await page.evaluate(key => Math.max(0, JSON.parse(localStorage.getItem(key)).nextRetryAt - Date.now()), drawer);
    await page.clock.fastForward(delay + 100);
  }
  try {
    {
      let calls = 0, begins = 0;
      const { page, context } = await setup(route => {
        const body = route.request().postDataJSON();
        if (body.task === 'begin') { begins++; return route.fulfill({ json: { pass: 'b'.repeat(64) } }); }
        assert.deepEqual(body.sheet, sheet); calls++;
        if (calls === 1) return route.abort('failed');
        if (calls === 2) return route.fulfill({ status: 503, headers: { 'Retry-After': '45', 'Access-Control-Expose-Headers': 'Retry-After' }, json: { problem: 'PROVIDER_TIMEOUT', retryable: true, retryAfterSeconds: 30 } });
        if (calls === 3) return route.fulfill({ status: 502, json: { problem: 'UNUSABLE_FEEDBACK', retryable: true } });
        return route.fulfill({ json: feedback });
      });
      await until(async () => (await state(page)).retryAttempt === 1, 'first network error');
      await page.reload();
      assert.equal(calls, 1, 'reload respects existing delay');
      await next(page, 1);
      await until(async () => (await state(page)).retryAttempt === 2, 'provider timeout');
      const wait = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).nextRetryAt - Date.now(), drawer);
      assert.ok(wait > 44000, 'longer Retry-After header respected');
      await next(page, 2); await next(page, 3);
      await until(async () => !!(await state(page)).feedback, 'automatic success after three failures');
      assert.equal(calls, 4); assert.equal(begins, 0);
      assert.equal(await page.locator('.reference-answer').count(), 6);
      await page.clock.fastForward(600000); assert.equal(calls, 4, 'success stops retries');
      await page.screenshot({ path: path.join(__dirname, 'feedback-desktop.png'), fullPage: true });
      await context.close();
    }
    {
      let calls = 0;
      const { page, context } = await setup(route => ++calls === 1 ? route.fulfill({ status: 503, json: { problem: 'PROVIDER_BUSY', retryable: true, retryAfterSeconds: 60 } }) : route.fulfill({ json: feedback }));
      await until(async () => (await state(page)).retryAttempt === 1, 'pause setup');
      await page.click('#pause-feedback'); await page.clock.fastForward(120000);
      assert.equal(calls, 1); await page.reload();
      assert.ok((await state(page)).retryPaused);
      assert.match(await page.textContent('#submission-status'), /자동 재시도를 멈췄습니다/);
      await page.click('#pause-feedback'); await page.clock.fastForward(1);
      await until(async () => !!(await state(page)).feedback, 'resume success'); assert.equal(calls, 2);
      await context.close();
    }
    {
      let calls = 0;
      const { page, context } = await setup(route => ++calls === 1 ? route.fulfill({ status: 429, json: { problem: 'DAILY_LIMIT', retryable: true, retryAfterSeconds: 3600 } }) : route.fulfill({ json: feedback }));
      await until(async () => (await state(page)).retryAttempt === 1, 'long quota delay');
      assert.match(await page.textContent('#submission-status'), /오늘 사용 한도.*다음 자동 요청/);
      await page.clock.fastForward(120000); assert.equal(calls, 1, 'no repeated quota calls');
      await next(page, 1); await until(async () => !!(await state(page)).feedback, 'quota resumes');
      await context.close();
    }
    {
      let calls = 0;
      const { page, context } = await setup(route => { calls++; return route.fulfill({ status: 502, json: { problem: 'MODEL_MISMATCH', retryable: false } }); });
      await until(async () => (await state(page)).retryPaused, 'terminal error paused');
      assert.match(await page.textContent('#submission-status'), /서버 설정 확인/);
      await page.clock.fastForward(86400000); assert.equal(calls, 1); assert.deepEqual((await state(page)).sheet, sheet);
      await context.close();
    }
    {
      let sends = 0, begins = 0;
      const { page, context } = await setup(route => {
        const body = route.request().postDataJSON();
        if (body.task === 'begin') { begins++; return route.fulfill({ json: { pass: 'b'.repeat(64) } }); }
        sends++; assert.deepEqual(body.sheet, sheet);
        return sends === 1 ? route.fulfill({ status: 401, json: { problem: 'INVALID_PASS', retryable: true, retryAfterSeconds: 1 } }) : route.fulfill({ json: feedback });
      });
      await next(page, 1); await until(async () => !!(await state(page)).feedback, 'renewed ticket success');
      assert.equal(sends, 2); assert.equal(begins, 1); assert.equal((await state(page)).pass, 'b'.repeat(64));
      await context.close();
    }
    {
      let calls = 0;
      const { page, context } = await setup(route => { calls++; return route.fulfill({ json: feedback }); }, true);
      await until(async () => (await state(page)).lastIssue === 'OFFLINE', 'offline wait'); assert.equal(calls, 0);
      await page.evaluate(() => { window.testOnline = true; dispatchEvent(new Event('online')); });
      await page.clock.fastForward(1); await until(async () => !!(await state(page)).feedback, 'online automatic resume');
      assert.equal(calls, 1); await context.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: automatic retries, saved-submission reload, server delay, pause/resume, terminal stop, ticket renewal, offline recovery, and detailed feedback.');
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
