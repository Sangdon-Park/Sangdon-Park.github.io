// One synthetic, deliberately partial submission through the public browser UI.
// This consumes provider quota. Never use a student's browser profile or answers.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    let reportBlock;
    const blocked = new Promise(resolve => { reportBlock = resolve; });
    page.on('response', async response => {
      if (!response.url().endsWith('/api/feedback') || response.request().method() !== 'POST') return;
      const data = await response.json().catch(() => ({}));
      console.log(JSON.stringify({ status: response.status(), problem: data.problem, retryAfterSeconds: data.retryAfterSeconds, earned: data.earned, model: data.model }));
      if (data.retryAfterSeconds > 120) reportBlock({ problem: data.problem, retryAfterSeconds: data.retryAfterSeconds });
    });
    await page.goto('https://sangdon-park.github.io/algorithm-preview/?v=' + Date.now());
    assert.match(await page.locator('script[src*="preview.js"]').getAttribute('src'), /20261019-auto-retry/);
    await page.click('#begin-practice'); await page.check('input[name="copper"][value="d"]');
    await page.click('#jump-jade'); await page.check('input[name="jade"][value="c"]');
    await page.click('#jump-pebble'); await page.fill('#pebble-answer', '9999');
    await page.click('#jump-cedar'); await page.fill('#cedar-answer', '(18,12)');
    await page.click('#jump-ink'); await page.selectOption('#practice-dialect', 'c99');
    await page.fill('#ink-answer', 'int first_index(const int a[], int n, int x) { for(int i=0;i<n;i++) if(a[i]==x) return i+1; return -1; }');
    await page.fill('#cost-answer', 'O(1), 함수가 하나라 한 번이면 끝난다.');
    await page.click('#send-practice'); await page.click('#confirm-send');
    const outcome = await Promise.race([
      page.waitForSelector('#feedback-view:not([hidden])', { timeout: 420000 }).then(() => null),
      blocked
    ]);
    if (outcome) throw Error('Live partial-credit validation blocked by provider cooldown: ' + JSON.stringify(outcome));
    const result = await page.evaluate(() => JSON.parse(localStorage.getItem('algorithm-rehearsal-20261018-ch1-4')).feedback);
    assert.equal(result.earned, 7);
    assert.deepEqual(['copper', 'jade', 'pebble', 'cedar', 'ink', 'cost'].map(key => result.tiles.find(t => t.key === key).earned), [2,2,0,1,2,0]);
    assert.match(result.model, /^gemini-3\.8-flash(?:-|$)/);
    assert.ok(result.tiles.filter(t => ['pebble','cedar','ink','cost'].includes(t.key)).every(t => t.tip.length >= 100));
    assert.equal(await page.locator('.reference-answer').count(), 6);
    assert.match(await page.textContent('.reference-answer code'), /int first_index/);
    await page.screenshot({ path: path.join(__dirname, 'live-feedback-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(__dirname, 'live-feedback-mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, expectedPoints: 7, actualPoints: result.earned, model: result.model, feedbackCharacters: result.tiles.map(t => ({ key: t.key, length: t.tip.length })) }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
