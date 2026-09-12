# Working on ChHeader

ChHeader is a local-profile HTTP header editor for Chrome Manifest V3.

- Use the pinned Node/pnpm versions. Install with `pnpm install --frozen-lockfile`.
- Run `pnpm check` before pushing. `pnpm test:workflows` is the focused behavior suite.
- Share actual popup markup with Storybook (`popup-template.ts`). Use plain CSS,
  semantic classes and the existing surface/accent tokens; add no styling framework.
- Keep every control usable at 744 × 440. Preserve keyboard focus and accessible labels.
  All buttons except Apply must be `type="button"`.
- Context actions target the invoked profile. Selection is separate from enabled state.
  Imports get new IDs and start off; parsing must finish before storage changes.
- Keep saved colors compatible. New values use simple color names or custom hex.
- Serialize background rule updates. Chrome uses `main_frame` and explicit `regexFilter`.
- Test behavior with real modules, not copied mock UI. jsdom cannot prove Chrome accepts rules.
- Follow [TESTING.md](TESTING.md) in the actual toolbar popup. Scope test profiles to
  localhost, disable them afterward, and use demonstration data in screenshots.
- Keep README short. Record actual results and limits in TESTING.md.
- Before releasing, align package/manifest versions and release notes, confirm CI on
  the pushed commit, then push an annotated version tag. Never move published tags.
