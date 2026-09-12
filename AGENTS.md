# Working on ChHeader

ChHeader is a local-profile HTTP header editor for Chrome Manifest V3.

## Work to the requested outcome

- Treat action requests as instructions to implement and verify. Resolve routine
  choices from the code and session context; ask only when missing information
  changes scope or correctness.
- Follow the user's latest instructions. Apply relevant skills without expanding
  the task into an unsolicited redesign, report, release or artifact collection.
- Inspect the working tree before editing. Preserve unrelated changes and keep the
  patch focused. Use existing modules and tokens before introducing abstractions.
- Give concise updates about findings and remaining work. Finish with the outcome,
  relevant checks and material limits; avoid a chronological tool transcript.

## Product invariants

- Share actual popup markup with Storybook through `popup-template.ts`. Use plain
  CSS, semantic classes and existing surface/accent tokens; no styling framework.
- Keep controls usable at 744 × 440 in light and dark modes. Preserve keyboard
  focus, accessible labels and readable contrast. All buttons except Apply must
  be `type="button"`.
- Context actions target the invoked profile. Selection is separate from enabled
  state. Imports get new IDs and start off; finish parsing before storage changes.
- Keep saved colors compatible. New values use simple color names or custom hex.
- Serialize background rule updates. Chrome uses `main_frame` and explicit
  `regexFilter` for regular expressions.

## Verification

- Use the pinned Node/pnpm versions and `pnpm install --frozen-lockfile`.
- Use the repository's Biome commands for formatting and linting.
- Start with `pnpm test:fast` for relevant behavior changes. Exercise real modules
  through the reusable harness; do not copy production UI into tests.
- Test in proportion to the change. For documentation or ignore-only edits, check
  the diff, links and ignore behavior. Do not invent tests that mirror the code.
- Run `pnpm check` before pushing. Repeat checks after relevant changes, failures
  or conflict resolution, rather than rerunning successful checks without cause.
- For popup or rule changes, follow the applicable cases in `TESTING.md` in the
  actual Chrome toolbar popup. jsdom cannot prove layout or Chrome rule acceptance.
- Use the user's requested Computer/browser tool. Scope test profiles to localhost,
  disable them afterward and restore temporary system settings. Use demo data.
- Record concise actual results and limits in `TESTING.md`. Say which checks were
  automated, checked in Chrome, or unavailable. Keep README short.

## Local artifacts and Git

- Save generated QA screenshots, recordings, traces, logs and one-off review reports
  under ignored `.local/qa/`. They are local evidence, not source deliverables.
- Do not stage or commit generated QA artifacts unless the user explicitly asks
  for those files. A request to test, capture screenshots or push code is not a
  request to publish the evidence. Skill instructions to save captures mean local
  storage unless the user specifies otherwise.
- Keep curated README/product images in `docs/screenshots/`. Update those only
  when requested; do not add run-specific screenshot directories there.
- Stage explicit paths and inspect the staged diff before committing. Never use
  `git add -f` to include ignored evidence. When untracking artifacts, preserve
  local copies with `git rm --cached`; do not rewrite published history by default.
- Commit and push when authorized in the session. If the remote advances, inspect
  and incorporate its changes, resolve conflicts and validate before retrying.
- A push is not a release. Before an authorized release, align package/manifest
  versions and release notes, confirm CI on the pushed commit, then push an
  annotated version tag. Never move published tags.
