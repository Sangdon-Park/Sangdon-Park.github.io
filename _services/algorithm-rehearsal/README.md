# Algorithms midterm rehearsal

Standalone, anonymous practice at `/algorithm-preview/`. Exactly five fresh examples: two multiple choice, one short answer, one essay, one Python/C function task. Mint practice UI, 15-minute timer, 14 practice points. No actual exam questions are imported.

## Isolation

- Project `sangdons-projects/algorithm-rehearsal`, API `/api/feedback`, private Blob store `algorithm-rehearsal-meter`.
- No examination authentication, cookies, roster, attempt database, administrative APIs, question banks, or execution server dependencies.
- Client drafts use only `algorithm-rehearsal-20261018` localStorage. The protocol, field names and submission flow are independently implemented. Different names are not a security boundary; separate credentials, storage and deployments are.
- The public site necessarily exposes its HTML/JS and this repository's server source. Neither relies on source secrecy.
- Python/Pyodide and C/WASM-Clang execute only the published examples in disposable browser workers, with output and execution limits. The C compiler binaries are shared public learning assets, not examination code.
- Gemini receives submitted written answers/code. Never request student identity. The store keeps hashed one-hour practice tickets, counters and feedback, not original answer sheets. Feedback can contain short answer references. Ticket expiry is logical; stored objects are not automatically deleted. Local drafts remain until reset or browser storage is cleared.

## Grading and limits

MC answers are deterministic. Only `gemini-3.8-flash` reviews the other four scoring components against a fixed rubric. The response must identify the requested model (or a versioned variant); different or missing model metadata is rejected. There is no fallback to another model. Provider quota and availability are separate from the application's daily cap; a configured key does not establish classroom capacity. Structured responses, bounded integer points and answer-evidence checks are validated server-side. Prompt-injection defenses reduce risk; AI practice grading is not a security or academic correctness guarantee.

Code feedback is **AI code review**, not server execution or a real exam grade. The UI says so explicitly. Provider failures remain retryable errors, never zero grades.

Persistent Blob conditional writes enforce one in-flight request per ticket, two tries per ticket, cached identical-result replay, and 200 grading requests/day overall (also 200/day per hashed address). Opening tickets is limited to 1,500/day overall and 300/day/address. There is no per-address cooldown: independent students can share campus Wi-Fi. Dates are UTC. Quotas can still reject legitimate use after exhaustion; this is an anonymous preview, not a high-stakes exam service. CORS permits only the public site origin; it is not authentication and non-browser clients can spoof Origin. Global quotas are the cost guardrail, not an absolute monetary cap.

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

`npm test` checks payloads, evidence bounds, deterministic scoring, CAS concurrency, quotas, expiry, replay, origin/method restrictions and safe provider errors. `tests/browser.cjs` checks desktop/mobile, persistence, submission error/retry, result/download, Python/C examples and worker cancellation with a mock feedback API. Set `NODE_PATH` to an installed Playwright package directory. Run `node tests/browser.cjs` from this service folder. Real Gemini connectivity is separately tested using synthetic answers only, without accessing exam administration or student records.
