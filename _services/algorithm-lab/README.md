# Algorithm Lab classroom service

The GitHub Pages UI remains in `/algorithm-lab/`. This directory starts with `_`
and is not published as a Jekyll site directory. It contains the reproducible
Supabase schema and Edge Function source, without credentials.

## Deployed service

- Supabase project: `tltrbkttwzvwghaplurl` (school project)
- Edge Function: `algorithm-lab`
- Dedicated tables: `public.dju_algolab_*`
- No existing school tables, auth users, or policies are modified.
- Students enter with section, student number and name; no student password or join code.
- Matching identities reconnect to existing records (classroom self-identification).
- Legacy password columns remain for compatibility with already open old pages.
- Admin passwords use PBKDF2-SHA256, 120,000 iterations and independent salts.
- Session tokens are random 256-bit values; only hashes are stored in the DB.
- Student sessions expire after 30 days; admin sessions after 8 hours.
- All direct anonymous/authenticated table and RPC access is revoked. The Edge
  Function validates its own session and role before service-role access.
- Admin password changes revoke admin sessions. Passwords can be changed in
  the dashboard; the initial secret is then superseded by the DB hash.

## Scope of grading

This is a classroom progress tracker. Code execution and correctness checks still
run in the browser. The service validates result shapes and records receipt time,
identity, source, and code, but does not independently execute submitted code.
It is not an authoritative or tamper-resistant examination judge. Imported
historic records are tagged `legacy` and excluded from new submission counts.
Dashboard completion counts a problem solved in either language once.

## Chapter 2

- Chapter 1 keeps P01–P12; chapter 2 adds P13–P36 (24 Python/C exercises).
- Chapter selection scopes navigation, completion, answer downloads and instructor statistics.
- `build_chapter2.py` produces `algorithm-lab/chapter-02.json`; `build_chapter2_examples.mjs` produces the standalone C examples. The browser worker and C examples share `chapter-02-harness.js`.
- Update existing databases with `chapter-02-migration.sql`, then deploy the Edge Function. This extends the two problem-ID checks without modifying student records or access policies.
- The original 59-slide PPTX is preserved. The separate Python/C edition has 95 editable slides and is linked from both course pages.

From the repository root:

```powershell
python _services/algorithm-lab/tests/chapter-02.py
node _services/algorithm-lab/tests/chapter-02.mjs
node _services/algorithm-lab/tests/chapter-02-dashboard.mjs
```

These run 146 cases per language through the actual graders, test the original C harness and invalid answers, and check instructor totals without accessing student data.

### Chapter 2 written exercises

The algorithm-writing edition keeps the 60 multiple-choice questions and organizes questions 61–100 into 30 short-answer questions and 10 implementation tasks (61, 65, 69, 71, 74, 78, 79, 80, 88, 99). The DOCX includes design steps, complexity, boundary examples and marking criteria. The classroom PPTX presents each implementation task followed by separate Python and C solutions, and each short-answer question followed by an explanation (210 slides total). Both course pages link to the revised editions; original files remain available.

The question bank and executable reference checks can be reproduced from the repository root:

```powershell
python _services/algorithm-lab/build_chapter2_exercises.py
node _services/algorithm-lab/tests/chapter-02-written.mjs
```

The generator writes `.codex-pptx-work/chapter2-exercises/questions.json` and checks the 10 Python implementations against 65 cases. The Node test compiles and executes the 10 C implementations with the browser's WebAssembly compiler against the same cases. These commands validate the content; they do not rebuild the delivered DOCX/PPTX layouts.

## Deployment

From the repository root, using an already authenticated Supabase CLI:

```powershell
npx supabase db query --linked --project-ref tltrbkttwzvwghaplurl --agent no -f _services/algorithm-lab/schema.sql
npx supabase secrets set --project-ref tltrbkttwzvwghaplurl --env-file PATH_TO_PRIVATE_ENV
npx supabase functions deploy algorithm-lab --project-ref tltrbkttwzvwghaplurl --use-api --no-verify-jwt --workdir _services/algorithm-lab
```

Disabling the platform JWT check is intentional: all protected actions require
the application's opaque session token instead. Do not remove role checks.

Required secrets: `ALGOLAB_ADMIN_HASH`, `ALGOLAB_ADMIN_SALT`, `ALGOLAB_PEPPER`. Supabase supplies `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` to the function. No secrets belong in Git or frontend
assets. Legacy join secrets are used only by the old registration endpoint.

## Operational notes

- Student drafts and the retry outbox are namespaced by account in browser
  storage. Every submission has an idempotency UUID.
- The dashboard displays registered students only; it does not infer absence
  without a roster.
- Student history shows the latest 100 submissions; admin detail shows 200.
- Dashboard code/progress refreshes every 10 seconds while the tab is visible.
- Student heartbeats occur every 30 seconds in a visible tab.
- Keep credentials and student exports out of the public repository.

Validation includes isolated fixture API/browser tests for authentication,
cross-student access denial, duplicate retries, imports, offline drafts, logout,
admin password changes and safe code rendering; transactional DB aggregation checks are
rolled back. Production authentication and RLS privileges are verified separately.

## Shared PCs and interface language

- Both pages offer Korean/English UI selection, persisted locally or selected with `?lang=en`.
- `locale-en.js` translates UI and all Python/C problem descriptions. Student source code and names are preserved.
- “Reset this browser” removes only Algorithm Lab local/session storage, including all cached accounts and pending uploads after confirmation. It never deletes server records.
- Current sessions are revoked when online. Other open lab tabs are notified to clear their tab-local sessions and reload. Offline reset still removes local data.
- Python/C runtime downloads are retained; students do not need to download the compiler again.
- Verification: both languages, all 24 problem descriptions, grading, unchanged student code, pending-upload warning/cancel, offline reset, unrelated storage retention, and server record recovery.

## First-party website analytics (2026-09-19)

`site-analytics.sql` creates the dedicated RLS-protected `dju_site_visits` table,
service-role-only statistics RPC, and an hourly pg_cron retention job. The public
`site-visit` action accepts bounded page metadata and an idempotency UUID. It hashes
a random browser ID with the private pepper, strips referrer paths, and derives
IP from the hosted Cloudflare `cf-connecting-ip` header. The XFF chain includes
AWS proxy addresses and is deliberately not used. IP matching was checked against
the requesting connection; a spoofed XFF did not override it.

Only existing admin sessions can call `admin-site-stats` and `admin-site-visits`.
`/site-stats/` provides period summaries and paginated 100-row IP/CSV history.
`/js/site-analytics.js` is included on 41 public HTML pages, excludes admin/privacy,
honors DNT/GPC and local opt-out, and never sends queries, forms or student answers.
IP retention is 30 days; other visit records and browser IDs are limited to 365 days.
Hourly cleanup can lag the cutoff by up to one hour. `/privacy.html` explains this.
Counts represent observed JavaScript page views and distinct browser IDs, not
all HTTP traffic or verified individual people. Existing Google tags are separate.
