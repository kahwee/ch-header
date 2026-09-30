# Working on ChHeader

ChHeader is a local-profile HTTP header editor for Chrome Manifest V3.
Read [CONTRIBUTING.md](CONTRIBUTING.md) for the architecture and development loop;
read the relevant [TESTING.md](TESTING.md) cases before behavior changes.
`.codex/config.toml` owns model selection for this trusted project.

## Code boundaries

- `src/lib/` owns contracts, parsing, URL rules, and Chrome access helpers; keep
  popup components and DOM presentation out of it.
- `src/background.ts` serializes service-worker rule updates. `popup-app.ts`
  composes the popup; keep commands in `controller.ts`, rendering in
  `popup-view.ts`, and queued writes in `popup-store.ts`.
- `src/ui/components/` owns reusable markup; `src/ui/lib/` owns mounted behavior
  and lifecycle. Share actual popup markup with Storybook via `popup-template.ts`.
- Preserve async ordering, recovery, focused inputs, and listener cleanup.
  Use existing modules and plain CSS surface/accent tokens. Extract modules for
  a distinct responsibility or real duplication, and search consumers before removal.

## Product contracts

- Preserve keyboard focus, labels, contrast, and the 744 × 440 light/dark popup.
  All buttons except Apply use `type="button"`.
- Context actions target the invoked profile; selection does not enable it.
  Imports receive new IDs and start off. Parse imports before storage changes.
- Keep saved colors compatible; new colors use simple names or custom hex.
- Serialize background updates. Chrome uses `main_frame` and explicit
  `regexFilter` for regular expressions.

## Checks

- Use pinned Node/pnpm and `pnpm install --frozen-lockfile`. Biome owns formatting
  and linting. Run `pnpm check` before pushing; docs-only edits need diff/link checks.
- Start behavior checks with `pnpm test:fast`; it is a smoke set. Use
  `src/test/chrome-harness.ts` and `src/test/popup-harness.ts` to exercise real
  modules. Await `chrome.settle()`; test observable results and concrete regressions.
- For popup/rule changes, follow `TESTING.md` in the actual Chrome toolbar popup.
  Use the requested browser tool, localhost demo profiles, and restore temporary
  settings afterward. jsdom and Storybook cannot prove Chrome rule acceptance.
- Record concise results and limits in `TESTING.md`; distinguish automated checks
  from actual Chrome checks. Inspect the final diff for API/storage changes,
  stale references, and generated files.

## Artifacts and releases

- Preserve unrelated work. Keep QA captures, logs, and one-off reports under
  ignored `.local/qa/`; publish them only when explicitly requested.
- Curated product images belong in `docs/screenshots/`; change them only when requested.
- Stage explicit paths and review the staged diff. Do not force-add ignored QA or
  rewrite published history. Preserve local copies when untracking artifacts.
- Commit/push only when authorized. Fetch and incorporate remote advances before
  retrying a push. For an authorized release, align package/manifest versions and
  notes, confirm CI, then push an annotated version tag. Never move published tags.
