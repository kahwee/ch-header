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
| Restore both domains, type header name `Bad Header` on main | Inline error; draft stays visible; saved name and live rules stay unchanged. |
| Restore a valid header name and leave the field | Saved name updates; matching path uses the repaired header. |
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
- Add/delete rows, scroll, search, change color, reopen and reload. Enter must save valid header names without navigating or removing rows.
  No Apply button is shown; Retry stays hidden during normal autosave and appears
  after a save/application failure. Retry must persist pending edits, disable while
  running, and disappear on success with focus returned to the status. Check Chrome's extension Errors page.
- Type an invalid header name character by character. The saved name and live
  rules must stay unchanged, including after leaving the field or adding a row.
  Repair it: leaving the field or Enter saves the valid name. Multiline paste
  reports an inline error without inserting a silently flattened value.
- Turn a localhost profile on: footer reports installed URL-rule count and toolbar
  shows **ON** with the profile name in its tooltip. Removing its last URL rule
  reports why no rules applied and clears the badge. Turning it off restores baseline.
- Reopen the popup: the last application result remains visible. Missing access
  explains approval and re-enabling; rejection explains correction and re-enabling.
  Applied status confirms installed rules, not whether any particular request matched.

## Verification records

Record new checks here with their date, scope, actual results and limits. Earlier
results are in [the test history](docs/testing-history.md); they are historical
evidence, not proof that the current checkout passes.

### Maintenance release 0.4.6 — October 2, 2026

Simplified export selection and HTML escaping; shortened contributor/setup docs
and moved older verification records into the history without changing results.

Automated: pinned Node 26.7.0 / pnpm 12.4.2 frozen-lockfile install, 43 fast tests,
and full `pnpm check` passed: 505 extension tests, five Worker tests, formatting,
lint, types, extension ZIP and Storybook. Local documentation links, archive
integrity and ZIP integrity passed. Storybook retains the existing
`module.register()` deprecation warning.

Actual Chrome for Testing 154: checked the toolbar popup in light/dark modes,
malformed then valid JSON import, imported profiles starting off, special characters
in profile names, selected/all export, sensitive-value redaction, copy feedback,
and focus returning to Export all. Approved only the localhost demo host. Enabling
installed one rule; document and fetch requests carried `enabled` and response
headers read `modified`. Narrowing to `/match/*` changed only `/match/echo`.
Revoking access turned the profile off and restored absent request headers and
`original` responses on all three endpoints. Browser appearance was restored.

The Full Layout story was visually checked at 744 × 440 in both modes without
horizontal overflow. An initial dynamic-import load failed during setup; reload
and a subsequent reload passed with no console or page errors. Delayed file-read
races remain automated checks; native file-picker timing and the public HTTPS
matrix were not repeated. The isolated browser and local servers were closed.
Logs and captures remain under ignored `.local/qa/`.

### Simpler autosave footer — October 2, 2026

Removed the persistent Apply button. The footer reports saved/application state;
Retry appears only after failed saves, failed application, or an unconfirmed
application result. Retry is disabled while pending and returns keyboard focus to
the status when recovery succeeds. Enter still commits valid header names without
submitting navigation.

Automated: pinned Node 26.7.0 / pnpm 12.4.2 frozen-lockfile install, 43 fast tests,
and final `pnpm check` passed: 506 extension tests, five Worker tests, formatting,
lint, types, extension packaging and Storybook build. Recovery tests cover failed
writes, failed application acknowledgement, disabled Retry, hiding after success,
and Chrome's blur-on-disable focus behavior. The existing Storybook
`module.register()` deprecation warning remains.

Chrome for Testing 154: inspected the actual light-mode toolbar popup, imported a
localhost-only demo, approved 127.0.0.1, enabled it, edited its name, and pressed
Enter in a header-name field. The footer reported Saved / Applied without an Apply
or Retry button. Real document and fetch requests carried `enabled`; response
headers read `modified`. Revoking access restored absent request headers and
`original` responses on all three fixture paths. A dark-mode extension-page check
at 744 × 440 had no horizontal overflow. An injected storage failure in the
extension page exposed Retry; restoring storage and retrying saved the edit and
hid Retry. The final keyboard recovery check confirmed focus on applicationStatus.
Failure injection and dark-mode inspection used the extension page, not the native
toolbar popup. Public HTTPS and the full matching matrix were not repeated.

Initial browser setup overlapped a build replacing dist and left its background
worker unavailable; a fresh isolated launch after the build resolved it. Temporary
permissions were revoked and isolated browsers closed. No user browser settings
were changed. QA logs remain under ignored `.local/qa/simplify-footer/`.
