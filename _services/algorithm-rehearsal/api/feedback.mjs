import { assess, cleanSheet, EDITION, fail } from '../core.mjs';
import { blobRepository, createMeter, digest } from '../meter.mjs';
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
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ problem: 'METHOD_DENIED' });
    let pass, reserved = false;
    try {
      if (!key || !process.env.BLOB_READ_WRITE_TOKEN && !meter) throw fail('FEEDBACK_NOT_CONFIGURED', 503);
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw fail('BAD_SHEET');
      let payload = req.body;
      if (typeof payload === 'string') { if (Buffer.byteLength(payload) > 32000) throw fail('BAD_SHEET'); try { payload = JSON.parse(payload); } catch { throw fail('BAD_SHEET'); } }
      if (!payload || Buffer.byteLength(JSON.stringify(payload)) > 32000) throw fail('BAD_SHEET');
      if (typeof payload !== 'object' || Array.isArray(payload) || !['begin', 'assess'].includes(payload.task)) throw fail('BAD_SHEET');
      if (payload.edition !== EDITION) throw fail('EDITION_CHANGED', 409);
      const quota = meter || createMeter(blobRepository());
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim().slice(0, 64);
      if (payload.task === 'begin') return res.status(200).json({ edition: EDITION, ...await quota.begin(ip) });
      if (payload.task !== 'assess') throw fail('BAD_SHEET');
      const sheet = cleanSheet(payload.sheet, payload.dialect);
      pass = payload.pass;
      const reservation = await quota.reserve(pass, ip, digest(JSON.stringify([EDITION, payload.dialect, sheet])));
      if (reservation.cached) return res.status(200).json(reservation.cached);
      reserved = true;
      const feedback = await grader(sheet, payload.dialect, { key });
      await quota.finish(pass, feedback); reserved = false;
      return res.status(200).json(feedback);
    } catch (error) {
      if (reserved) { try { await (meter || createMeter(blobRepository())).finish(pass, null); } catch {} }
      const tag = error.tag || 'TEMPORARY_FAILURE';
      const status = error.status || 503;
      if (status === 429) res.setHeader('Retry-After', '30');
      // Never return upstream errors, prompts, submitted code, keys, or stack traces.
      return res.status(status).json({ problem: tag });
    }
  };
}
export default buildGateway();
