// Time-bounded local practice grader. Student code is data, never executed.
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { blobRepository } from '../meter.mjs';
import { createCodexQueue, reviewSchema } from '../codex-queue.mjs';
const untilArg = process.argv.find(v => v.startsWith('--until='))?.slice(8);
const until = Date.parse(untilArg);
if (!Number.isFinite(until) || until <= Date.now() || until > Date.now() + 10 * 3600000 + 60000) throw Error('A future deadline of at most ten hours is required.');
if (!process.env.BLOB_READ_WRITE_TOKEN) throw Error('Private practice store is not configured.');
const owner = randomBytes(16).toString('hex'), queue = createCodexQueue(blobRepository());
const runtime = await mkdtemp(path.join(tmpdir(), 'algorithm-codex-'));
const schema = path.join(runtime, 'review.schema.json'); await writeFile(schema, JSON.stringify(reviewSchema));
const cli = path.join(process.env.APPDATA || path.join(homedir(), 'AppData/Roaming'), 'npm/node_modules/@openai/codex/bin/codex.js');
const statusFile = path.resolve('.vercel/codex-worker-status.json');
await mkdir(path.dirname(statusFile), { recursive: true });
const childEnv = Object.fromEntries(['PATH','Path','SystemRoot','WINDIR','USERPROFILE','APPDATA','LOCALAPPDATA','TEMP','TMP','ComSpec','HOME','CODEX_HOME'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
const disabled = ['shell_tool','unified_exec','apps','plugins','browser_use','browser_use_external','in_app_browser','computer_use','image_generation','multi_agent','skill_search','workspace_dependencies','memories','goals','hooks'];
const active = new Set(), children = new Set();
let stopping = false, completed = 0, failed = 0, lastBeat = 0;
process.on('SIGINT', () => { stopping = true; }); process.on('SIGTERM', () => { stopping = true; });
function kill(child) {
  if (!child.pid) return;
  if (process.platform === 'win32') spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  else child.kill('SIGKILL');
}
async function grade(job) {
  return new Promise((resolve, reject) => {
    const args = [cli, 'exec', '--ignore-user-config', '--ignore-rules', '--ephemeral', '--json', '--skip-git-repo-check', '--sandbox', 'read-only',
      ...disabled.flatMap(feature => ['--disable', feature]), '-c', 'web_search="disabled"', '-c', 'model_reasoning_effort="low"', '--output-schema', schema, '-'];
    const child = spawn(process.execPath, args, { cwd: runtime, env: childEnv, windowsHide: true, stdio: ['pipe','pipe','pipe'] });
    children.add(child); let output = '', stderr = '', timedOut = false;
    const timer = setTimeout(() => { timedOut = true; kill(child); }, Math.max(1, Math.min(180000, until - Date.now())));
    child.stdout.on('data', bytes => { output += bytes.toString(); if (output.length > 2000000) kill(child); });
    child.stderr.on('data', bytes => { stderr = (stderr + bytes.toString()).slice(-30000); });
    child.on('error', error => { clearTimeout(timer); children.delete(child); reject(Error('CODEX_START_FAILED')); });
    child.on('close', code => {
      clearTimeout(timer); children.delete(child);
      if (timedOut || code !== 0) return reject(Error(timedOut ? 'CODEX_TIMEOUT' : /usage limit|rate limit/i.test(stderr) ? 'CODEX_USAGE_LIMIT' : 'CODEX_FAILED'));
      try {
        const events = output.split(/\r?\n/).filter(Boolean).flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
        // Tool-disabled grading must never execute student code or access tools.
        if (events.some(event => ['command_execution','mcp_tool_call','web_search','file_change'].includes(event.item?.type))) throw Error('UNEXPECTED_TOOL_USE');
        const message = events.filter(event => event.type === 'item.completed' && event.item?.type === 'agent_message').at(-1)?.item.text;
        const raw = JSON.parse(message); resolve({ raw, model: 'codex-cli' });
      } catch { reject(Error('CODEX_INVALID_REVIEW')); }
    });
    child.stdin.end(queue.prompt(job));
  });
}
await queue.start(until, owner);
console.log(JSON.stringify({ event: 'ready', intervalSeconds: 5, concurrency: 3, until: new Date(until).toISOString(), pid: process.pid }));
try {
  while (!stopping && Date.now() < until) {
    if (Date.now() - lastBeat > 20000) {
      await queue.heartbeat(owner, until); lastBeat = Date.now();
      await writeFile(statusFile, JSON.stringify({ pid: process.pid, until, heartbeatAt: Date.now(), active: active.size, completed, failed }));
    }
    try {
      while (active.size < 3 && !stopping && Date.now() < until) {
        const job = await queue.claim(); if (!job) break;
        const work = (async () => {
          try {
            const { raw, model } = await grade(job); await queue.complete(job, raw, model); completed++;
            console.log(JSON.stringify({ event: 'graded', completed, attempts: job.attempts }));
          } catch (error) {
            failed++; console.warn(JSON.stringify({ event: 'retry', problem: error.message, failed })); await queue.release(job).catch(() => {});
          }
        })();
        active.add(work); work.finally(() => active.delete(work));
      }
    } catch (error) { console.warn(JSON.stringify({ event: 'poll-error', problem: error.tag || error.name })); }
    await new Promise(resolve => setTimeout(resolve, Math.min(5000, Math.max(1, until - Date.now()))));
  }
} finally {
  for (const child of children) kill(child);
  await Promise.allSettled([...active]);
  await queue.heartbeat(owner, until, false).catch(() => {});
  await writeFile(statusFile, JSON.stringify({ pid: process.pid, until, stoppedAt: Date.now(), completed, failed }));
  console.log(JSON.stringify({ event: 'stopped', completed, failed }));
}
