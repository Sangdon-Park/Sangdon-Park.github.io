# Algorithm Lab classroom service

## Anonymous pair code review (2026-10-21)

`/algorithm-lab/peer-review.html` snapshots a voluntarily shared practice solution.
The server places students in progress quartiles within their section, based on
distinct solved problems recorded by the service. Ties stay together. Within the
same section, problem, answer language and quartile, it pairs the nearest solution
counts. Unmatched students wait; matching never silently switches sections or languages.
The SQL enqueue RPC serializes matching and preserves idempotency.

Partners exchange anonymous reviews. Names, student numbers, partner record IDs
and progress bands are omitted from student responses. A student's own name and
number are rejected in the initial shared code/explanation. Students are also
instructed to omit identifying details from feedback. Both students submit their
reviews before received feedback is released. Original code, structured feedback,
revision decisions, final code and reflection are preserved on the server.

Instructor view `?view=teacher` requires an existing admin session. Instructors
can see identities, record a 0–5 rubric assessment, and export evidence JSON or
summary CSV. These records support assessment of regular coding practice; the
feature does not change existing course grade weights or examination records.
Practice browser-check results remain the progress proxy described below.

Apply `peer-review-migration.sql`, then deploy the Edge Function and static files.
Run `node _services/algorithm-lab/tests/peer-review.mjs` for authorization,
anonymity, matching bands, feedback release, reflection and grading checks.

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

### Chapters 2–6 PPTX coding practice

`/algorithm-lab/?chapter=2` opens the 47 active writing exercises in
the existing dark workspace; the old `exercises.html` URL redirects here.
Each chapter lists PPTX exercises first, followed immediately by existing
lecture practice in one list; stored problem IDs remain unchanged. Coverage: chapter 2
questions 61/65/69/71/74/78/79/80/88/99, chapter 3 questions
91/92/95/97/98/99/100, chapter 4 questions 91–100, and chapters 5–6 questions 91–100.
Chapter 4 questions 97/98 cover two-pointer partition and quicksort, with
Python/C examples, matching lecture conventions and stored-array checks.
They retain their original IDs within P37–P86 and existing progress; P87/P88
retain the quicksort tasks when their displayed numbers change from 101/102 to 97/98.
P63/P64 are retired; their historical records remain stored. P49, P50,
and P52 are retired because their algorithms are not covered in the lecture body.
Each has the PPTX
prompt, Python/C reference, public examples, additional tests and a written
preparation panel. Written self-checks are separate from execution scores;
students can append their notes as code comments for cloud storage/export.
Chapters 1–3 require only the code and its time-complexity explanation; the
preparation panel asks only for time complexity and retains older notes in storage.

`exercise-source.json` was checked against the current PPTX question and code
slides. Stable source IDs and saved random test cases prevent removals from
renumbering later exercises or changing their verified cases. The generator
records file hashes in the public problem bank. Large
integer outputs are transported as decimal strings to avoid JavaScript rounding,
while students must still return integers. Mutation checks cover sorting,
path compression, relaxation and memoization. Supplied helpers/tables are
available to both runtimes as specified in the source exercises.

```powershell
python _services/algorithm-lab/build_exercise_lab.py
python _services/algorithm-lab/tests/exercise-lab.py
node _services/algorithm-lab/tests/exercise-lab.mjs
node _services/algorithm-lab/tests/chapter-02-dashboard.mjs
```

Apply `exercise-lab-migration.sql`, followed by `chapter-04-sorts-migration.sql`,
before deploying the updated Edge Function and the new public catalog.
This only extends accepted problem IDs; it does not remove student records.
The database must allow P87/P88 in both draft and submission constraints;
updating the Edge Function's TOTALS alone is insufficient. `exercise-sync.mjs`
checks the schema and supplement migration against the complete backend catalog.
Storage allows IDs through P88. The visible catalog has 72 problems: 11 / 24 / 7 /
10 / 10 / 10 by chapter. Ten duplicated chapter-two lecture problems redirect
to their PPTX versions via `problem-catalog.js`. Legacy drafts remain stored and
are copied only into an empty canonical draft; they must be checked against the
current tests again. P04 (first-occurrence binary search) is also retired because
the lecture teaches only ordinary binary search. Existing records are retained;
new submissions are accepted only for active catalog IDs. Answer downloads
include archived duplicate and retired drafts.

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

### 단계별 실습 힌트

`practice-hints.js`는 Python/C/Java 선택에 따라 문법·함수 설명 → 문제별 풀이 순서 → 핵심 코드 빈칸 → 검증된 완성 예시의 네 단계를 표시합니다. 활성 72문항 모두에 언어별 완성 예시를 제공하며, 빈칸은 개별로 펼쳐 확인할 수 있습니다. 기존 답안·점수는 변경하지 않습니다. `hint-guides.js`는 문제별 세 단계와 경계 조건을, `hint-references.js`와 `java-hint-references.js`는 초보자가 읽기 쉬운 참조 풀이를 제공합니다.

검증 명령:

```powershell
node _services/algorithm-lab/tests/practice-hints.mjs
python _services/algorithm-lab/tests/hint-references.py
node _services/algorithm-lab/tests/hint-references.mjs
node _services/algorithm-lab/tests/hint-java-browser.cjs
node _services/algorithm-lab/tests/hints-browser.cjs
```

각 언어의 실제 실행기로 72문항·531개 원래 테스트를 확인합니다. Java와 UI 브라우저 검증은 Playwright와 Chrome을 사용하며, `NODE_PATH`로 기존 Playwright 설치 경로를 지정할 수 있습니다. UI 테스트는 격리된 계정·API·실행기 픽스처를 사용하여 단계 이동, 빈칸 복원, AI 힌트 이력, 실패 후 재시도와 모바일 배치를 확인합니다.


### Tiny AI hints (Google Gemini)

The authenticated `ai-hint` action sends only the current problem statement, source code, a bounded execution summary, and up to ten previously accepted hints to Google. Student identity, reference solutions and hidden test inputs/answers are excluded. Hint history is scoped to the current account/problem/language/UI locale in session storage. Code edits retain accepted hints but invalidate in-flight requests and old execution diagnostics; switching context cannot display a stale response.

Set `GEMINI_API_KEY` in Supabase Edge Function Secrets for project `tltrbkttwzvwghaplurl`. Do not put the key in frontend files or Git. Optional `ALGOLAB_HINT_MODEL` defaults to `gemini-3.7-flash`. Without a key the endpoint returns a translated unavailable message without calling Google.

The system prompt requests one short, actionable next hint in the selected UI language, no full solution or replacement function. On valid initial responses, continuations receive a second semantic review against the history: a paraphrase of the same repair must be replaced with new trace/boundary/reasoning information. Exact/text-similar duplicates are rejected and do not advance the displayed step. Each student request makes at most two provider calls, with a twelve-second timeout per call. The same budget covers transient failures and duplicate/incomplete responses. Persistent rate limits remain one request per 15-second bucket, 30 per student per UTC day, and 1,000 total per UTC day. The UI shows the cooldown and preserves earlier hints on failure; built-in steps remain available. Prompt instructions and checks reduce repetition and answer leakage but cannot guarantee semantic compliance from a generative model. Sanitized `reason` codes distinguish provider timeout, network failure, overload/rejection, repeated hints and unusable output. No API keys or upstream error bodies are returned.

Test: `node _services/algorithm-lab/tests/ai-hint.mjs`. This uses a mocked Gemini API; real-model verification requires the deployed secret.

## Java practice (2026-09-22)

All active problem IDs have Java 8 method contracts, starters and examples. The Java
editor uses class Solution with static methods; LabSupport supplies the same
helper algorithms and workspace data as the original exercises. ECJ 4.6.1 and
CheerpJ 4.3 compile and execute locally in a terminable worker. Exact long results,
array mutations, input preservation, floating tolerances and error line links
are checked. Indexed-access complexity constraints (P02) are pedagogical,
as with C; Java checks the results and time limit, not individual array reads.
Java hints provide the same four stages as Python/C, including individually
revealed key-code blanks and complete reference solutions for all 72 active problems.

Deployment order: apply java-migration.sql to the existing database, deploy the
algorithm-lab Edge Function, then publish the site. Existing identities, drafts
and submissions are retained. The state response advertises supported languages;
while an older backend is deployed, Java entries stay in the browser outbox and
do not block Python/C uploads. Java uses java:problem keys independently of C
and the legacy unprefixed Python keys, including restore/import/judge reminders.

Validation: node _services/algorithm-lab/tests/java-browser.cjs (Playwright + Chrome;
NODE_PATH can point at an existing Playwright installation). This runs the real
compiler/JVM, checks resubmission, diagnostics, long precision and mutation, and
compiles every problem's starter and all its grading cases. Existing examples,
locales, exercise-sync, judge-reminder, AI hint and instructor tests also apply.
Runtime/compiler licensing and sources are in algorithm-lab/vendor/java/README.md.
