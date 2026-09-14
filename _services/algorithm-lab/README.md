# Algorithm Lab classroom service

The GitHub Pages UI remains in `/algorithm-lab/`. This directory starts with `_`
and is not published as a Jekyll site directory. It contains the reproducible
Supabase schema and Edge Function source, without credentials.

## Deployed service

- Supabase project: `tltrbkttwzvwghaplurl` (school project)
- Edge Function: `algorithm-lab`
- Dedicated tables: `public.dju_algolab_*`
- No existing school tables, auth users, or policies are modified.
- Students authenticate using section, student number and a separate password.
- Registration requires the appropriate class participation code.
- Passwords use PBKDF2-SHA256, 120,000 iterations and independent salts.
- Session tokens are random 256-bit values; only hashes are stored in the DB.
- Student sessions expire after 30 days; admin sessions after 8 hours.
- All direct anonymous/authenticated table and RPC access is revoked. The Edge
  Function validates its own session and role before service-role access.
- Password resets revoke existing sessions. Admin passwords can be changed in
  the dashboard; the initial secret is then superseded by the DB hash.

## Scope of grading

This is a classroom progress tracker. Code execution and correctness checks still
run in the browser. The service validates result shapes and records receipt time,
identity, source, and code, but does not independently execute submitted code.
It is not an authoritative or tamper-resistant examination judge. Imported
historic records are tagged `legacy` and excluded from new submission counts.
Dashboard completion counts a problem solved in either language once.

## Deployment

From the repository root, using an already authenticated Supabase CLI:

```powershell
npx supabase db query --linked --project-ref tltrbkttwzvwghaplurl --agent no -f _services/algorithm-lab/schema.sql
npx supabase secrets set --project-ref tltrbkttwzvwghaplurl --env-file PATH_TO_PRIVATE_ENV
npx supabase functions deploy algorithm-lab --project-ref tltrbkttwzvwghaplurl --use-api --no-verify-jwt --workdir _services/algorithm-lab
```

Disabling the platform JWT check is intentional: all protected actions require
the application's opaque session token instead. Do not remove role checks.

Required secrets: `ALGOLAB_ADMIN_HASH`, `ALGOLAB_ADMIN_SALT`, `ALGOLAB_PEPPER`,
`ALGOLAB_JOIN_01`, `ALGOLAB_JOIN_02`. Supabase supplies `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` to the function. No secrets belong in Git or frontend
assets. Join codes are shown only after administrator authentication.

## Operational notes

- Student drafts and the retry outbox are namespaced by account in browser
  storage. Every submission has an idempotency UUID.
- The dashboard displays registered students only; it does not infer absence
  without a roster.
- Student history shows the latest 100 submissions; admin detail shows 200.
- Dashboard code/progress refreshes every 10 seconds while the tab is visible.
- Student heartbeats occur every 30 seconds in a visible tab.
- Unknown student passwords cannot be recovered, only reset.
- Keep credentials and student exports out of the public repository.

Validation includes isolated fixture API/browser tests for authentication,
cross-student access denial, duplicate retries, imports, offline drafts, logout,
password resets and safe code rendering; transactional DB aggregation checks are
rolled back. Production authentication and RLS privileges are verified separately.
