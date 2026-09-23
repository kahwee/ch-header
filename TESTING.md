# Testing ChHeader

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:headers
```

`check` runs the same types, formatting, coverage and build checks as CI.
`pnpm test:fast` runs the focused popup-to-storage-to-rules loop alongside JSON
and action tests. `pnpm test:fast:watch` keeps it running while editing.
`pnpm test:workflows` focuses on JSON round trips, validation, context actions,
Undo and status updates using the real popup template. `pnpm test` watches;
`pnpm test:run` exits. Tests use jsdom and mocked Chrome APIs, so also test Chrome.

## Fast harness

`src/test/popup-harness.ts` mounts the production popup and custom checkbox, with
real controller, storage and background modules. Its Chrome boundary clones stored
values, emits storage events and records dynamic rules. Use `createPopupHarness()`,
`click()` / `input()`, then `await chrome.settle()` before asserting rules. The
settle operation queues Apply after earlier storage events; it needs no polling or
sleep. DOM listeners, globals and module state are cleaned up after each test.

The harness does not validate Chrome's rule schema, measure layout at 744 × 440,
or simulate real network requests. Keep the Chrome matrix below for those checks.

## Real Chrome check — public HTTPS domains

Build and reload `dist/` in Chrome. Import
[https-profile.json](docs/examples/https-profile.json) through the actual toolbar
popup. It starts off and allows only `headers.kahwee.com` and
`headers-peer.kahwee.com`; URL rules target exactly `/headers/match` on each.

Open [the tester](https://headers.kahwee.com) and
[the second site](https://headers-peer.kahwee.com). Run these cases on both:

| Case | Expected |
| --- | --- |
| Off or denied access | Test header absent; response `original`. |
| On, both test hosts approved | `/headers/match`: `hello-gecko` / `modified`. |
| Excluded path and redirect | `/headers/other` and `/redirect`: absent / `original`. |
| Check second site | Same path boundaries on the other domain. |
| Allow only `headers.kahwee.com` | Primary matching path changes; peer remains unchanged. |
| Restore both domains, edit header name to `Bad Header` on main | Rejected replacement turns profile off; previous headers stop. |
| Restore valid header and enable | Matching path changes again. |
| Revoke all website access | Both sites return to baseline; all profiles off. |

Chrome may close the permission prompt: reopen, select this profile, then enable
it again. Reload both pages after changing access. Failed requests are inconclusive,
not proof that headers were removed. Approve the exact test hosts, never `kahwee.com` or a broad suffix.
`pnpm test:echo:live` checks the deployed Worker responses, privacy headers and
CORS on both domains. It does **not** exercise Chrome or the extension. Unit tests
remain offline; historical results below retain the URLs actually tested.

## Offline Chrome check

Build and reload `dist/` in `chrome://extensions/`. Open the toolbar popup,
click **Import**, and choose [local-profile.json](docs/examples/local-profile.json).
Confirm it starts off. Open `http://127.0.0.1:3002/` and click **Run checks**.

| Case                                     | Expected                                                       |
| ---------------------------------------- | -------------------------------------------------------------- |
| Profile off                              | Document and fetch request headers absent; response `original` |
| `127.0.0.1:3002`, All request types, on  | Document `enabled`; all fetches `enabled` / `modified`         |
| `127.0.0.1:3002/match/*`                 | Only `/match/echo` modified                                    |
| `regex:^http://127\.0\.0\.1:3002/match/` | Only `/match/echo` modified                                    |
| XHR/Fetch                                | Document absent, fetches modified                              |
| Documents                                | Document enabled, fetches unchanged                            |
| Request header unchecked                 | Request absent, matching response modified                     |
| Disable afterward                        | Baseline restored                                              |

Reload the page for document checks. The server always sends `original`; seeing
`modified` proves Chrome changed the response. `curl` does not test the extension.
Stop the fixture with Ctrl+C afterward.

## Interaction checklist

- Right-click an unselected profile: actions affect that profile, not the editor's selection.
- Delete → Undo restores it off. Switch profiles on: only one On badge remains.
- Use Shift+F10, arrows and Escape for the context menu; verify focus restoration.
- Import malformed JSON: inline error, no partial import. Paste/file import: new IDs, off.
- Copy JSON → paste into Import. Download → choose that file. Check one/all export scope
  and sensitive-value masking without changing the stored values.
- Add/delete rows, scroll, search, change color, reopen and reload. Apply by button
  and Enter must not navigate or remove rows. Check Chrome's extension Errors page.

## Verification records

Record new checks here with their date, scope, actual results and limits. Earlier
results are in [the test history](docs/testing-history.md); they are historical
evidence, not proof that the current checkout passes.

### Keyboard navigation coverage and harness cleanup — September 23, 2026

Added six production-popup navigation cases covering Ctrl/Cmd+K, arrow boundaries,
filtered and empty results, Enter, Escape, editor focus, and selection without
changing enabled profiles or applied rules. The popup harness now removes window
listeners as well as document listeners between tests. A teardown assertion was
verified to fail without window cleanup: the disposed popup still intercepted
Ctrl+K. It passes with the fix.

Automated: Node 26.7.0 / pnpm 12.4.2 frozen-lockfile install, the 35-test fast
baseline, targeted navigation tests, and `pnpm check` passed. The full check ran
442 extension tests across 27 files with coverage, five Worker tests, Biome,
TypeScript, extension packaging and Storybook. Storybook still emits the existing
`module.register()` dependency deprecation warning and builds successfully.

No production runtime or dependency changes were made. These are jsdom checks;
actual Chrome toolbar, layout and network checks were not repeated. The check log
is local evidence under ignored `.local/qa/`.

### Store listing and media review — September 22, 2026

The authenticated developer dashboard confirmed public and draft package versions
0.4.2. Saved revised listing copy from `docs/store-listing.txt` and replaced the
old promotional video link with the existing public 0.4.4 demo. The dashboard
reported “Item saved”; these are draft changes, not a confirmed publication.

Observed audience baseline: the Store Items page showed 3 users without an explicit
date range. YouTube Studio showed 1 view for the current demo after 6 days and
1 hour, 0% impression click-through rate, and 0:00 average view duration. Store
impressions and install counts could not be retrieved reliably; unavailable
metrics are not zero. This sample cannot establish conversion or audience growth.

Rebuilt the captioned demo with larger existing Chrome captures, concrete use
cases, and a Store install call to action. Automated: the media script ran,
Biome passed, and FFmpeg fully decoded the 39-second 1920×1080 H.264/AAC output
without errors. The contact sheet was visually inspected. Artifacts and the
measurement baseline remain under ignored `.local/qa/`.

Publication follow-up: the verified 0.4.4 package was uploaded and the dashboard
confirmed draft version 0.4.4. The replacement demo is [public on YouTube](https://youtu.be/Im4QWpc7FiQ);
YouTube reported “Video published” and completed copyright and Community Guidelines
checks with no issues. Saved its URL in the Store listing and submitted the package
and listing for review with automatic publication after approval enabled. Google
confirmed “Your extension was submitted for review”. Approval remains pending.

Existing actual Chrome captures were reused; no runtime or new toolbar checks
were performed, and no extension runtime code changed.

### Store distribution review — September 21, 2026

The public [Chrome Web Store listing](https://chromewebstore.google.com/detail/chheader/okmjidkmnlobbppegojfcedhaakadgig)
is available and reports version 0.4.2, updated September 13. Its privacy-policy
link resolves to this repository's policy. GitHub's latest release is 0.4.4;
its downloaded ZIP passed the published SHA-256 checksum. The latest main CI
and 0.4.4 release workflow succeeded. README now links to the Store first and
removes the unverified claim that 0.4.3 is awaiting review.

Automated: Node 26.7.0 / pnpm 12.4.2 frozen-lockfile install and `pnpm check`
passed, including formatting, lint, types, extension coverage tests, Worker tests,
extension packaging and Storybook. The current production source matches v0.4.4.

Limits: Google requires account reauthentication before the developer dashboard
can be inspected. Pending updates, private review feedback and distribution
settings remain unverified; no Store submission was changed. No actual Chrome
toolbar or network checks were repeated. Prioritize delivering the post-0.4.2
rule-failure cleanup and access-panel improvements before broader promotion.

### Repository cleanup and Astra setup — September 20, 2026

Added the project GPT-6 Astra default and module/test guidance. Separated dated
verification history from the current acceptance instructions. Removed obsolete
design/QA reports and a run screenshot from tracking, preserving local copies.

Automated: Node 26.7.0 / pnpm 12.4.2 frozen-lockfile install and `pnpm check`
passed: Biome format/lint, TypeScript, 436 extension tests across 26 files with
coverage, five Worker tests, extension ZIP and Storybook build. Local documentation
links, diff whitespace and ignore behavior were checked. Storybook emitted a
dependency deprecation warning for `module.register()` but built successfully.

No extension runtime code changed; actual Chrome checks were not repeated. The
model default applies when Codex loads this trusted project's configuration;
this cleanup does not verify a new Astra session or change an existing session.
