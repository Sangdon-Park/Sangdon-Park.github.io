import { get, put } from '@vercel/blob';
import { createHash, randomBytes } from 'node:crypto';
import { fail } from './core.mjs';
const digest = value => createHash('sha256').update(value).digest('hex');
export function blobRepository() {
  return {
    async read(path) { const r = await get(path, { access: 'private', useCache: false }); return r ? { value: await new Response(r.stream).json(), etag: r.blob.etag.replace(/^W\//, '') } : null; },
    async write(path, value, etag) {
      try { await put(path, JSON.stringify(value), { access: 'private', addRandomSuffix: false, allowOverwrite: !!etag, ...(etag ? { ifMatch: etag } : {}), contentType: 'application/json', cacheControlMaxAge: 60 }); }
      catch (error) { if (/precondition|already exists/i.test(error.message)) throw fail('CONFLICT', 409); throw error; }
    }
  };
}
async function revise(repo, path, transform) {
  for (let retry = 0; retry < 5; retry++) {
    const saved = await repo.read(path);
    const next = transform(saved?.value);
    try { await repo.write(path, next, saved?.etag); return next; }
    catch (error) { if (error.tag !== 'CONFLICT') throw error; }
  }
  throw fail('TRY_LATER', 429);
}
export function createMeter(repo, now = () => Date.now()) {
  const day = () => new Date(now()).toISOString().slice(0, 10);
  const mark = (ip, date) => digest(date + ':' + ip + ':' + (process.env.BLOB_READ_WRITE_TOKEN || 'local-test')).slice(0, 32);
  async function daily(path, cap, interval = 0) {
    return revise(repo, path, value => {
      const old = value || { count: 0, last: 0 };
      if (old.count >= cap || now() - old.last < interval) throw fail('DAILY_LIMIT', 429);
      return { count: old.count + 1, last: now() };
    });
  }
  return {
    async begin(ip) {
      // Independent private store: contains no examination records or credentials.
      await daily(`meter/${day()}/open-all.json`, 1500);
      await daily(`meter/${day()}/open-${mark(ip, day())}.json`, 300);
      const pass = randomBytes(32).toString('hex');
      await repo.write(`passes/${digest(pass)}.json`, { until: now() + 3600000, phase: 'fresh', tries: 0 });
      return { pass, validFor: 3600 };
    },
    async reserve(pass, ip, fingerprint) {
      if (!/^[a-f0-9]{64}$/.test(pass || '')) throw fail('INVALID_PASS', 401);
      const path = `passes/${digest(pass)}.json`;
      const old = await repo.read(path);
      if (!old || old.value.until < now()) throw fail('INVALID_PASS', 401);
      if (old.value.phase === 'done') {
        if (old.value.fingerprint !== fingerprint) throw fail('ALREADY_SENT', 409);
        return { cached: old.value.feedback };
      }
      if (old.value.phase === 'busy' || old.value.tries >= 2) throw fail('TRY_LATER', 429);
      try { await repo.write(path, { ...old.value, phase: 'busy', tries: old.value.tries + 1, fingerprint }, old.etag); }
      catch (error) { if (error.tag === 'CONFLICT') throw fail('TRY_LATER', 429); throw error; }
      try {
        // These persistent CAS counters are enforced across serverless instances.
        // Campus Wi-Fi can put an entire class behind one address. Do not apply
        // a per-address cooldown that serializes independent students.
        await daily(`meter/${day()}/grade-${mark(ip, day())}.json`, 200);
        await daily(`meter/${day()}/grade-all.json`, 200);
      } catch (error) { await this.finish(pass, null); throw error; }
      return { cached: null };
    },
    async finish(pass, feedback) {
      const path = `passes/${digest(pass)}.json`;
      return revise(repo, path, value => {
        if (!value) throw fail('INVALID_PASS', 401);
        return { ...value, phase: feedback ? 'done' : 'fresh', ...(feedback ? { feedback } : {}) };
      });
    }
  };
}
export { digest };
