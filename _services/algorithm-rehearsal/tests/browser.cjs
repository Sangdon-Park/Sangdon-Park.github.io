const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    let begins = 0, sends = 0;
    await page.route('https://algorithm-rehearsal.vercel.app/api/feedback', async route => {
      const body = route.request().postDataJSON();
      assert.equal(body.edition, 'rehearsal-20261018-ch1-4');
      if (body.task === 'begin') { begins++; await new Promise(r => setTimeout(r, 150)); return route.fulfill({ json: { edition: body.edition, pass: 'a'.repeat(64) } }); }
      sends++;
      if (sends === 1) return route.fulfill({ status: 503, json: { problem: 'PROVIDER_BUSY' } });
      return route.fulfill({ json: { edition: body.edition, earned: 14, ceiling: 14, note: '연습용 AI 코드 검토', tiles: ['copper', 'jade', 'pebble', 'cedar', 'ink', 'cost'].map((key, i) => ({ key, earned: [2,2,2,4,3,1][i], ceiling: [2,2,2,4,3,1][i], tip: '합성 테스트 피드백' })) } });
    });
    await page.goto(origin + '/algorithm-preview/');
    assert.ok(!(await page.textContent('body')).includes('난이도나 점수로 본시험 결과를 예측'));
    await page.evaluate(() => localStorage.setItem('algorithm-rehearsal-20261018', 'preserved-legacy-draft'));
    assert.equal(await page.locator('.field-help a[href$=".pptx"]').count(), 5);
    await page.screenshot({ path: path.join(__dirname, 'welcome-desktop.png'), fullPage: true });
    await page.click('#begin-practice');
    await page.check('input[name="copper"][value="d"]');
    await page.click('#jump-jade'); await page.check('input[name="jade"][value="c"]');
    await page.click('#jump-pebble'); await page.fill('#pebble-answer', '10000');
    await page.reload(); await page.click('#resume-practice');
    await page.click('#jump-pebble'); assert.equal(await page.inputValue('#pebble-answer'), '10000');
    assert.equal(await page.evaluate(() => localStorage.getItem('algorithm-rehearsal-20261018')), 'preserved-legacy-draft');
    await page.click('#jump-cedar'); await page.fill('#cedar-answer', '(18,12) → (12,6) → (6,0), 최대공약수 6');
    await page.click('#jump-ink');
    const py = 'def first_index(a, x):\n    for i, value in enumerate(a):\n        if value == x:\n            return i\n    return -1';
    await page.fill('#ink-answer', py); await page.fill('#cost-answer', 'O(n), n개를 한 번씩 비교');
    async function run(source, language) {
      await page.selectOption('#practice-dialect', language); await page.fill('#ink-answer', source); await page.click('#try-examples');
      await page.waitForFunction(() => /1번:|Error|실패|못했습니다|초과|중단/.test(document.querySelector('#example-output').textContent), {}, { timeout: 130000 });
      return page.textContent('#example-output');
    }
    const pyResult = await run(py, 'py'); console.log('Python:', pyResult); assert.equal((pyResult.match(/통과/g) || []).length, 3);
    const c = 'int first_index(const int a[], int n, int x) { for(int i=0;i<n;i++) if(a[i]==x) return i; return -1; }';
    const cResult = await run(c, 'c99'); console.log('C:', cResult); assert.equal((cResult.match(/통과/g) || []).length, 3);
    const wrong = await run(c.replace('return i;', 'return i+1;'), 'c99'); assert.match(wrong, /확인 필요/);
    await page.selectOption('#practice-dialect', 'py'); assert.equal(await page.inputValue('#ink-answer'), py);
    await page.fill('#ink-answer', 'def first_index(a, x):\n    while True: pass'); await page.click('#try-examples');
    await page.waitForFunction(() => document.querySelector('#example-output').textContent.includes('공개 예제를 실행'), {}, { timeout: 100000 });
    await page.click('#stop-examples'); assert.match(await page.textContent('#example-output'), /사용자가 실행을 중단/);
    await page.fill('#ink-answer', py);
    await page.screenshot({ path: path.join(__dirname, 'coding-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile horizontal overflow');
    await page.screenshot({ path: path.join(__dirname, 'coding-mobile.png'), fullPage: true });
    await page.click('#send-practice'); assert.ok(await page.locator('#send-dialog').isVisible()); await page.click('#confirm-send');
    await page.waitForSelector('#retry-feedback:not([hidden])'); assert.match(await page.textContent('#submission-status'), /작성한 답안은 그대로 유지/);
    await page.click('#retry-feedback'); await page.waitForSelector('#feedback-view:not([hidden])');
    assert.equal(await page.locator('.result-tile').count(), 5); assert.match(await page.textContent('#score-summary'), /14 \/ 14/);
    assert.match(await page.textContent('#feedback-note'), /답안과 코드를 읽고 채점/);
    assert.equal(begins, 1); assert.equal(sends, 2);
    const downloaded = page.waitForEvent('download'); await page.click('#download-practice'); assert.equal((await downloaded).suggestedFilename(), 'algorithm-preview-my-answers.json');
    await page.reload(); await page.click('#resume-practice'); assert.ok(await page.locator('#feedback-view').isVisible());
    assert.deepEqual(errors, []); console.log('Desktop/mobile, persistence, code workers, error retry and feedback passed.');
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
