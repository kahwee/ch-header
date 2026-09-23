# Contributing

## Setup

Use Node from `.node-version` (also mirrored in `.nvmrc`) and the exact pnpm
version in `package.json`. Activate those versions with your version manager
before installing; do not bypass the version checks or regenerate the lockfile
just to accommodate a different local toolchain.

```bash
pnpm install --frozen-lockfile
pnpm test:fast
pnpm dev:extension
```

Load `dist/` as an unpacked extension in Chrome and reload it after rebuilds.
Use `pnpm storybook` for isolated component and Full Layout previews.

## GPT-6 Astra development

[.codex/config.toml](.codex/config.toml) sets `gpt-6-astra` as this project's
Codex default. Start Codex from this repository and trust the project to load
its configuration. An explicit session model choice can override the default;
the config does not switch an already running conversation. For a CLI session,
`codex --model gpt-6-astra` selects it explicitly.

See [OpenAI's configuration documentation](https://learn.chatgpt.com/docs/config-file/config-basic)
and [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra).
Keep task prompts concrete: describe the failing interaction or desired outcome,
constraints, and how success can be observed. For example:

> Fix profile metadata editing so typing a name preserves the focused header
> input and its draft. Use the real popup harness for a regression, preserve
> serialized saves, and verify the relevant Chrome interaction.

## Architecture map

| Location | Responsibility |
| --- | --- |
| `src/lib/types.ts` | Saved profile and runtime contracts. |
| `src/lib/profile-transfer.ts`, `url-rule.ts` | Import/export validation and URL parsing. |
| `src/lib/storage.ts`, `site-access.ts`, `dnr-rules.ts` | Storage initialization, Chrome permissions and rule construction/application. |
| `src/background.ts` | Service-worker events and the ordered read/build/replace rule queue. |
| `src/ui/core/popup-app.ts` | Composition root: mount and connect popup modules. |
| `src/ui/core/controller.ts` | Profile commands and state transitions. |
| `src/ui/core/popup-store.ts` | Snapshot loading and serialized popup writes. |
| `src/ui/core/popup-view.ts`, `popup-events.ts` | DOM updates and event wiring. |
| `src/ui/core/profile-*.ts` | Access, sharing, appearance, menus and navigation features. |
| `src/ui/core/popup-template.ts`, `styles.css` | Production popup markup and shared styling. |
| `src/ui/components/`, `src/ui/lib/` | Reusable renderers and mounted component lifecycle, respectively. |
| `src/test/` | Reusable Chrome and production-popup test harnesses. |
| `tools/header-echo/`, `scripts/header-check.js` | Public HTTPS tester and offline localhost fixture. |
| `scripts/`, `.github/workflows/` | Packaging/media tools and CI/release jobs. |

The main flow is popup events → controller/access actions → queued storage →
background events → URL/site-bounded DNR rules. The view reflects selection and
saved profile state; selecting a profile and enabling it are separate operations.
Domain modules must not depend on the UI. Components should receive values and
callbacks rather than reaching into the popup composition root.

Keep the existing structure while it supports clear ownership. Split a feature
when it has an independent contract and test surface; move its tests with it and
update imports and stories together. Extend the existing table/list lifecycle
before adding another component base. Keep shared helpers named for their domain
rather than growing a catch-all utility module.

### Where to improve next

Keyboard navigation is covered through the production popup in
`profile-keyboard-navigation.test.ts`, including filtering, empty results, arrow
movement, shortcuts and selection without activation. Extend those scenarios when
changing navigation. When working on sharing, cover clipboard rejection and
file-read failures through the real dialog. Sharing had lower coverage in the
September 20 check; use coverage to find missing scenarios, not as a target for
assertion counts.

If profile commands grow substantially, extract cohesive operations from
`controller.ts` behind its existing callbacks and prove the same workflow outcomes.
Keep `popup-app.ts` focused on wiring. A framework migration or wholesale folder
rename is not needed to make these improvements.

## Code conventions

- Keep TypeScript strict and avoid `any`. Narrow DOM and Chrome API values explicitly.
- Put domain behavior in `src/lib`, presentation behavior in `src/ui/core`, and reusable markup in
  `src/ui/components`.
- Use semantic class names and the tokens in `styles.css`. Do not add a CSS utility framework.
- Escape all user-controlled strings rendered into HTML.
- Preserve the appearance of saved colors; normalize old numeric names to simple app-owned tokens.
- Use delegated events for repeated rows and clean up listeners owned by mounted components.

### Component files

- `*.render.ts` contains the single HTML renderer for a reusable component.
- The adjacent component entry point exposes the renderer to Storybook and other templates.
- `*.component.ts` adds lifecycle and interaction behavior when mounting is required.
- Tests live beside the responsibility they cover in `__tests__`.

Avoid assertions for incidental CSS declarations. Tests should verify semantic classes, accessible
attributes, escaped content, and behavior.

## Verification

Choose checks by the responsibility changed:

| Change | First checks |
| --- | --- |
| Parser, profile contract or rule builder | Relevant `src/lib/__tests__` file with `pnpm test:run <path>`, plus `pnpm test:fast`. |
| Popup state, persistence or interactions | `pnpm test:fast`, then relevant colocated tests. |
| Renderer or mounted component | Its colocated tests, production Storybook story, and applicable toolbar cases. |
| Public header tester | `pnpm test:echo`; `pnpm test:echo:live` only when checking deployed endpoints. |
| Docs or ignore rules | Diff, repository links, and `git check-ignore` for affected paths. |

Use small unit tests for boundary values and workflow tests for effects across
modules. Exercise invalid imports, failed writes, overlapping saves, denied access
and rejected rules where relevant. Assert stored state, visible behavior and rule
output. Avoid copied UI fixtures, arbitrary delays and assertions tied to private
methods or incidental CSS. The fast suite is deliberately focused; it does not
replace the full suite.

Run the complete CI-equivalent check before pushing, and after a cross-module
refactor:

```bash
pnpm check
```

For UI changes, also inspect the actual toolbar popup at 744 × 440 and the Full Layout story. Check keyboard
navigation, dropdowns, profile search, editing controls, the enable toggle, and persistent Apply
action.

## Extension build

`pnpm run build` writes an unpacked extension to `dist`. Load that directory from
`chrome://extensions` to verify Chrome-specific storage and declarative rule behavior.

See [AGENTS.md](AGENTS.md) for shared contributor guidance and [TESTING.md](TESTING.md)
for the localhost fixture, execution record and Chrome acceptance cases.

## Documentation and cleanup

Keep setup and architecture here, agent rules in `AGENTS.md`, runnable acceptance
cases in `TESTING.md`, and dated old results in `docs/testing-history.md`.
`CLAUDE.md` points to the shared instructions rather than maintaining another copy.
Keep README focused on using the extension. Run artifacts belong in ignored
`.local/qa/`; curated product media belongs in `docs/screenshots/`.

Before deleting code, trace references from production entry points, tests,
Storybook, build scripts and documentation. Age alone does not make a file dead.
Preserve saved-data compatibility and release history. Dependency upgrades should
have a concrete reason and their own validation, rather than being bundled into
file organization work.
