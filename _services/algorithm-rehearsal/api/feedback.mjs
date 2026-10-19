import { assess, cleanSheet, EDITION, fail } from '../core.mjs';
import { blobRepository, createMeter, digest } from '../meter.mjs';
import { createCodexQueue } from '../codex-queue.mjs';
const allowed = new Set(['https://sangdon-park.github.io']);
export function buildGateway({ meter, grader = assess, key = process.env.GEMINI_API_KEY } = {}) {
  return async (req, res) => {
    const origin = req.headers.origin;
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Vary', 'Origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!allowed.has(origin)) return res.status(403).json({ problem: 'ORIGIN_DENIED' });
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Retry-After');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ problem: 'METHOD_DENIED' });
    const started = Date.now();
    let pass, lease, quota, reserved = false;
    try {
      if (!key || !process.env.BLOB_READ_WRITE_TOKEN && !meter) throw fail('FEEDBACK_NOT_CONFIGURED', 503);
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw fail('BAD_SHEET');
      let payload = req.body;
      if (typeof payload === 'string') { if (Buffer.byteLength(payload) > 32000) throw fail('BAD_SHEET'); try { payload = JSON.parse(payload); } catch { throw fail('BAD_SHEET'); } }
      if (!payload || Buffer.byteLength(JSON.stringify(payload)) > 32000) throw fail('BAD_SHEET');
      if (typeof payload !== 'object' || Array.isArray(payload) || !['begin', 'assess'].includes(payload.task)) throw fail('BAD_SHEET');
      if (payload.edition !== EDITION) throw fail('EDITION_CHANGED', 409);
      quota = meter || createMeter(blobRepository());
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim().slice(0, 64);
      if (payload.task === 'begin') return res.status(200).json({ edition: EDITION, ...await quota.begin(ip) });
      if (payload.task !== 'assess') throw fail('BAD_SHEET');
      const sheet = cleanSheet(payload.sheet, payload.dialect);
      pass = payload.pass;
      const reservation = await quota.reserve(pass, ip, digest(JSON.stringify([EDITION, payload.dialect, sheet])));
      if (reservation.cached) return res.status(200).json(reservation.cached);
      reserved = true; lease = reservation.lease;
      const feedback = await grader(sheet, payload.dialect, { key });
      await quota.finish(pass, feedback, lease); reserved = false;
      console.info('Rehearsal grading completed', JSON.stringify({ model: feedback.model, elapsedMs: Date.now() - started }));
      return res.status(200).json(feedback);
    } catch (error) {
      const tag = error.tag || 'TEMPORARY_FAILURE';
      const status = error.status || 503;
      if (reserved) console.warn('Rehearsal grading deferred', JSON.stringify({ problem: tag, elapsedMs: Date.now() - started }));
      const retryable = error.retryable ?? ['TEMPORARY_FAILURE', 'TRY_LATER', 'DAILY_LIMIT', 'PROVIDER_DAILY_LIMIT', 'PROVIDER_BUSY', 'PROVIDER_TIMEOUT', 'PROVIDER_UNAVAILABLE', 'UNUSABLE_FEEDBACK', 'INVALID_PASS'].includes(tag);
      const retryAfterSeconds = retryable ? Math.min(86400, Math.max(1, Math.ceil(error.retryAfterSeconds || (tag === 'INVALID_PASS' ? 1 : 30)))) : 0;
      if (error.providerCooldown && quota?.deferProvider) { try { await quota.deferProvider(retryAfterSeconds, tag); } catch {} }
      if (reserved) { try { await quota.finish(pass, null, lease, retryAfterSeconds || 30); } catch {} }
      if (retryable) res.setHeader('Retry-After', String(retryAfterSeconds));
      // Never return upstream errors, prompts, submitted code, keys, or stack traces.
      return res.status(status).json({ problem: tag, retryable, ...(retryable ? { retryAfterSeconds } : {}) });
    }
  };
}
// Production only accepts/polls isolated Codex jobs. No Gemini fallback.
export function buildCodexGateway({ repo = blobRepository(), queue = createCodexQueue(repo), meter = createMeter(repo) } = {}) {
  return async (req, res) => {
    const origin = req.headers.origin;
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Vary', 'Origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!allowed.has(origin)) return res.status(403).json({ problem: 'ORIGIN_DENIED' });
    res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Expose-Headers', 'Retry-After');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ problem: 'METHOD_DENIED' });
    try {
      let payload = req.body;
      if (typeof payload === 'string') { if (Buffer.byteLength(payload) > 32000) throw fail('BAD_SHEET'); try { payload = JSON.parse(payload); } catch { throw fail('BAD_SHEET'); } }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Buffer.byteLength(JSON.stringify(payload)) > 32000 || !['begin', 'assess'].includes(payload.task)) throw fail('BAD_SHEET');
      if (payload.edition !== EDITION) throw fail('EDITION_CHANGED', 409);
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim().slice(0, 64);
      if (payload.task === 'begin') return res.status(200).json({ edition: EDITION, provider: 'codex', ...await meter.begin(ip) });
      const feedback = await queue.submit(payload.pass, cleanSheet(payload.sheet, payload.dialect), payload.dialect, ip);
      if (feedback.state) { res.setHeader('Retry-After', '5'); return res.status(202).json(feedback); }
      return res.status(200).json(feedback);
    } catch (error) {
      const problem = error.tag || 'TEMPORARY_FAILURE', retryable = error.retryable ?? ['TEMPORARY_FAILURE', 'TRY_LATER', 'DAILY_LIMIT', 'INVALID_PASS'].includes(problem);
      const retryAfterSeconds = error.retryAfterSeconds || 5;
      if (retryable) res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(error.status || 503).json({ problem, retryable, ...(retryable ? { retryAfterSeconds } : {}) });
    }
  };
}
export default buildCodexGateway();
