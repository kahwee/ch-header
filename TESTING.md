# Testing ChHeader

```sh
pnpm install --frozen-lockfile
pnpm check
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

Run `pnpm test:headers` in a separate terminal and leave it running. It starts the
local HTTP fixture at `http://127.0.0.1:3002`; it is not an automated test suite.

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

### Documentation and Biome maintenance — September 23, 2026

Updated Biome from 2.5.13 to 2.5.14 with matching schema and lockfile, added
`pnpm lint:fix`, and aligned the release workflow with CI's `pnpm check`.
Corrected website-access labels and steps against production markup, clarified
the local fixture command, and moved September 20–22 records into the history
without changing their contents.

Automated: Node 26.7.0 / pnpm 12.4.2 frozen-lockfile install and `pnpm check`
passed: Biome formatting/lint, TypeScript, 442 extension tests, five Worker tests,
extension ZIP and Storybook. Checked 31 local documentation link/image paths
and diff whitespace. Storybook retains its existing `module.register()`
deprecation warning. Check output remains under ignored `.local/qa/`.

No extension runtime changed; actual Chrome checks and release publication were
not performed for this maintenance pass.

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
