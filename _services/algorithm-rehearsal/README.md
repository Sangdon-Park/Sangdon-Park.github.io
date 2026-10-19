# Algorithms midterm rehearsal

## Current production: time-bounded Codex worker

As of 2026-10-19, the default `/api/feedback` handler uses `buildCodexGateway` and **never calls Gemini**. Legacy Gemini helpers/tests below remain for historical context. Questions, edition, saved-answer namespace and 14-point rubric are unchanged. Submitted answers are frozen, queued, reviewed and returned as component scores with detailed explanations, following the examination's workflow while using independent code, credentials and storage.

- The local Codex CLI worker polls every **5 seconds**, reviews up to **3 jobs concurrently**, and stops at its fixed deadline. Current window ends **2026-10-19 21:09:24 Asia/Seoul**. Keep this computer online; a time-bounded helper prevents idle system sleep without changing persistent power settings.
- `scripts/start-codex-worker.ps1 -Until <UTC ISO timestamp>` launches through the linked practice Vercel project's environment runner. Only the private practice Blob credential is required. No OpenAI API key or Gemini key is used by the worker; Codex CLI uses the existing ChatGPT login. Deadlines greater than ten hours are rejected.
- Child Codex processes ignore user config, are ephemeral/read-only, have shell/browser/apps/plugins/multi-agent/hooks disabled, and receive a stripped environment without the Blob/provider credentials. Student code is data and is never executed on the host. The published example worker still executes examples inside the student's browser.
- Private `codex/jobs/` objects temporarily store submitted answers and fingerprints. Private CAS index/leases enforce immutable submissions, claim ownership, recovery and cached replay. Completed jobs remove raw answer text; logical seven-day expiry does not physically delete old objects. Old Gemini ticket feedback is preserved in its original object. New Codex job creation is capped at 200/day; polling/replay do not spend another grading slot.
- The browser handles HTTP 202 queued/grading responses with 5-second polling. Existing failed Gemini submissions automatically resume after page reload, keeping the same saved answers. Already graded students can choose **저장한 답안으로 Codex 채점**; old feedback is retained locally and included in downloads. Do not tell students to clear browser storage or start over.
- `.vercel/codex-worker-status.json` contains only PID, heartbeat, deadline and counters. Event logs omit student answers and credentials. A separate app heartbeat checks process health and may restart only before the same fixed deadline. Do not extend the window or touch actual examination data.
- `tests/codex-queue.test.mjs` covers saved-result regrading, immutable replay, privacy, single claims, expiry and lease recovery. `tests/retry-browser.cjs` also checks Gemini-to-Codex saved-answer recovery and old-feedback preservation. A synthetic correct Python submission completed through the deployed API and local Codex worker with 14/14 points; this does not establish correctness for every student answer.

## Earlier Gemini configuration (inactive in production)

Standalone, anonymous practice at `/algorithm-preview/`. Exactly five questions excerpted from the public Chapters 1–4 exercise PPTX files: two multiple choice, one short answer, one essay, one Python/C function task. Mint practice UI, 15-minute timer, 14 practice points. No actual exam questions are imported.

## Public exercise sources

| Slot | Public exercise | Topic |
| --- | --- | --- |
| MC 1 | Chapter 1, question 22 | Maximum-finding comparisons |
| MC 2 | Chapter 4, question 2 | Merge-sort prerequisite |
| Short answer | Chapter 2, question 62 | Four-digit lock candidates |
| Essay | Chapter 3, question 77 | Euclidean algorithm trace |
| Coding | Chapter 3, question 91 | `first_index`, first matching zero-based index |

Stems, choices and input contracts are excerpted without altering their meaning. Web headings, practice points, answer fields and public execution examples are added for the rehearsal. Each question links to its source PPTX. `algorithm-preview/sources.json` records source question numbers, exact quotes, physical slide positions, part names and SHA-256 hashes. Run `pwsh -File tests/sources.ps1` to verify quotations against both original PPTX XML and visible page content. The PPTX files themselves are not modified.

Edition `rehearsal-20261018-ch1-4` uses a separate localStorage namespace. Old drafts/results are retained, not imported or graded against the new questions. API requests without the current edition are rejected before allocation or grading. Tickets and cache fingerprints are edition-bound.

## Isolation

- Project `sangdons-projects/algorithm-rehearsal`, API `/api/feedback`, private Blob store `algorithm-rehearsal-meter`.
- No examination authentication, cookies, roster, attempt database, administrative APIs, question banks, or execution server dependencies.
- Current client drafts use `algorithm-rehearsal-20261018-ch1-4` localStorage. Earlier namespaces remain untouched. The protocol, field names and submission flow are independently implemented. Different names are not a security boundary; separate credentials, storage and deployments are.
- The public site necessarily exposes its HTML/JS and this repository's server source. Neither relies on source secrecy.
- Python/Pyodide and C/WASM-Clang execute only the published examples in disposable browser workers, with output and execution limits. The C compiler binaries are shared public learning assets, not examination code.
- Gemini receives submitted written answers/code. Never request student identity. The store keeps hashed seven-day practice tickets, counters and feedback, not original answer sheets. Feedback can contain short answer references. Ticket expiry is logical; stored objects are not automatically deleted. Local drafts remain until reset or browser storage is cleared.

## Grading and limits

MC answers are deterministic. Only `gemini-3.8-flash` reviews the other four scoring components against a fixed rubric. The response must identify the requested model (or a versioned variant); different or missing model metadata is rejected. There is no fallback to another model. Provider quota and availability are separate from the application's daily cap; a configured key does not establish classroom capacity. Structured responses, bounded integer points and answer-evidence checks are validated server-side. Prompt-injection defenses reduce risk; AI practice grading is not a security or academic correctness guarantee.

Code feedback is **AI code review**, not server execution or a real exam grade. The UI says so explicitly. Provider failures remain retryable errors, never zero grades.

Persistent Blob conditional writes enforce one in-flight request per ticket, cached identical-result replay, and 200 grading requests/day overall (also 200/day per hashed address). Failed provider calls consume the daily request allowance. Opening tickets is limited to 1,500/day overall and 300/day/address. There is no per-address cooldown: independent students can share campus Wi-Fi. Dates are UTC. Quotas can still reject legitimate use after exhaustion; this is an anonymous preview, not a high-stakes exam service. CORS permits only the public site origin; it is not authentication and non-browser clients can spoof Origin. Global quotas are the cost guardrail, not an absolute monetary cap.

## Submission recovery and feedback

The browser saves the submitted answer before requesting grading. Temporary network/provider errors retry automatically after 15, 30, 60, then 120 seconds, or the server's longer `Retry-After` delay. The countdown and pause/resume controls remain visible. Offline submissions wait for connectivity. A closed page resumes its pending submission when reopened in the same browser; requests run only while the page is open. Reloading keeps the edition, ticket and answer. Expired tickets are renewed automatically with the saved submission. Permanent configuration/model/edition errors pause retries and show a message.

Provider requests allow 120 seconds, browser requests 155 seconds, and Vercel functions 180 seconds. A ticket lease lasts 210 seconds so abandoned requests can recover without overlapping active functions. Lease ownership prevents an older request from overwriting its replacement. Legacy busy tickets receive a 90-second recovery grace. The former two-try dead end is removed; failed tickets can continue until success, subject to daily limits and provider availability. Provider quota/HTTP-overload responses record a shared cooldown, so other tickets wait too. Successful identical submissions replay cached feedback without another model call.

Gemini is asked for 4–6 concrete sentences per written/code component covering the submitted answer, awarded points, reasoning and corrections. Result cards show the submitted text, per-component points, personalized feedback, a worked solution and the exact rubric. Python/C reference code follows the selected language. Static worked solutions also enhance previously saved results without another provider call. Code is reviewed by Gemini; the separate browser worker executes the public examples.

## Configuration and deployment

Production server environment only: `GEMINI_API_KEY`, `BLOB_READ_WRITE_TOKEN` from the **new private store**. Do not commit `.env*`, `.vercel`, keys, or `node_modules`. Never copy the examination Blob token. Use the team's existing Gemini provider credential through secure CLI stdin, not command arguments.

```powershell
npm ci
npm test
npx vercel link --scope sangdons-projects --project algorithm-rehearsal
npx vercel deploy --prod --scope sangdons-projects
```

Public Pages changes deploy through the repository's existing GitHub Pages workflow. Preview pages must use `https://algorithm-rehearsal.vercel.app/api/feedback`. Do not deploy this service into the actual examination project. Production API must be publicly reachable without Vercel login; preview deployments may remain protected.

## Verification

`npm test` checks payloads, evidence bounds, deterministic scoring, CAS concurrency, quotas, expiry, replay, lease recovery/ownership, provider cooldowns, model/edition restrictions, zero credit without code and safe provider errors. `tests/browser.cjs` checks desktop/mobile, source links, old-draft isolation, persistence, submission error/retry, detailed result/download, Python/C examples and worker cancellation with a mock feedback API. `tests/retry-browser.cjs` checks automatic recovery, reload, pause/resume, expired tickets and terminal failures using virtual time. Set `NODE_PATH` to an installed Playwright package directory. Run these scripts from this service folder. `tests/live.mjs` and `tests/live-matrix.mjs` use synthetic answers against the public practice API only. `tests/live-browser.cjs` submits one synthetic partial-credit C answer through the deployed page and checks exact component scores, detailed feedback, model metadata and desktop/mobile layout. Do not run these live tests unnecessarily because each uncached grading call consumes the provider's quota. They never access exam administration or student records. Runtime logs record model, elapsed time and failure tags without answer text or credentials.
