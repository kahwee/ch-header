# Working on ChHeader

ChHeader is a Manifest V3 Chrome extension for profile-based request and response
header editing. Keep the popup compact and familiar to Chrome users.

## Source of truth

- `src/ui/core/popup-template.ts` and `styles.css`: popup layout shared with Storybook.
- `src/ui/core/profile-*` and `popup-elements.ts`: appearance, list filtering, keyboard navigation and typed DOM queries.
- `src/ui/components/`: small TypeScript renderers and custom elements.
- `src/lib/dnr-rules.ts`: Chrome declarativeNetRequest rule generation.
- `src/background.ts`: serialized updates to installed dynamic rules.
- `src/lib/storage.ts`: local profiles and active-profile selection.
- `package.json`: release version; Vite writes it into `dist/manifest.json`.
- `TESTING.md`: reproducible browser checks and observed results.

## Development

Use Node from `.node-version` / `.nvmrc` and pnpm from `package.json`.
Install with `pnpm install --frozen-lockfile`. Keep the pnpm lockfile; do not
introduce npm or yarn lockfiles. `pnpm dev:extension` rebuilds `dist/` on edits;
reload the unpacked extension in Chrome after each build. `pnpm dev` is a web
preview and does not install the extension.

Before a release run `pnpm typecheck`, `pnpm format:check`,
`pnpm test:coverage`, `pnpm build:package`, and `pnpm storybook:build`.
Vitest uses jsdom: passing tests do not prove that Chrome accepts DNR rules.
Exercise the actual toolbar popup with the localhost fixture in TESTING.md.
Record failures and untested cases honestly; never infer a browser pass from a mock.

## UI and regression guardrails

- Use the existing neutral surface and blue accent tokens. Keep branding in
  `public/icons/logo.svg`; regenerate the 16/32/48/128px PNGs when it changes.
- Keep all row actions visible at the popup's 744 × 440 CSS-pixel size. The
  editor body scrolls; the heading and Apply footer stay visible.
- Give non-submit buttons `type="button"`; prevent form navigation when applying.
- Preserve visible focus and accessible labels, including controls in shadow DOM.
- Matchers use Chrome resource types (`main_frame`, not `document`) and explicit
  `regexFilter` for `regex:` input. Test positive and excluded URLs.
- Serialize the entire read/build/replace operation for background rule updates.
- Add focused regression tests for behavioral bugs. Avoid tests that merely
  repeat CSS values or implementation details.
- Use only localhost-scoped test profiles, set the matcher before enabling, and
  disable test profiles afterward. Screenshots must contain demonstration data.

## Releases

Follow the release checklist in TESTING.md. Update package and source manifest
versions together, RELEASE_NOTES.md, screenshots and any changed behavior docs.
Push the reviewed commit and confirm CI, then push an annotated `vX.Y.Z` tag.
The tag workflow validates the version and publishes a ZIP plus SHA-256 checksum.
Do not claim Chrome Web Store publication: GitHub releases are unpacked builds.
No scheduled CI is configured; the README contains the tentative roadmap.
