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

The focused run passed 18 tests in 4 files in 0.77 seconds locally (Vitest-reported
wall time; not a performance guarantee). It caught metadata edits replacing header
inputs. Name, notes and color edits now save and update the list without rebuilding
editor rows. Search also no longer renders the list twice per input event.

After rebuilding and reloading the actual Chrome toolbar popup, the localhost-only
“Harness smoke verified” profile imported off. Typing its name and pressing Enter
preserved the rows and popup. Enabling it produced `enabled` on the document and
`enabled` / `modified` for all three fetch paths. Disabling restored absent request
headers and `original` responses. The demo profile remains off. Existing historical
regex errors were retained; no additional entries appeared during the apply check.

The harness does not validate Chrome's rule schema, measure layout at 744 × 440,
or simulate real network requests. Keep the Chrome matrix below for those checks.

## Real Chrome check

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

## Latest verification — September 12, 2026

Local `pnpm check` passed: 415 tests across 23 files, TypeScript, formatting,
coverage, ZIP packaging and Storybook. A frozen-lockfile install also passed.

Actual macOS Chrome toolbar popup, using Computer Use:

- Right-click on an unselected profile, Duplicate, Delete and Undo passed.
- Shift+F10, arrow navigation, Escape focus restoration, all-profile export scope,
  and persistence after extension reload passed.
- Invalid JSON, valid import, Copy JSON → paste, download → file read passed.
- Imported profile started off; enabling it changed real document/fetch headers.
  Disabling it restored all baseline values. Test profiles were left off.
- Existing colors remained recognizable. Refreshed editor and sharing screenshots
  are in `docs/screenshots/`.
- Automated workflow tests cover batch rejection, fresh IDs, credential masking,
  keyboard dismissal, invoked-profile targeting, Undo and exclusive On status.

Wildcard/regex, request-type filtering, scrolling and Enter regressions were verified
for 0.3.0; see the [previous test record](docs/qa/0.3.0-testing.md).
The obsolete copied-popup test and unused browser-runner dependencies were removed.

Limits: this is not certification of every Chrome version, platform, screen reader
or resource type. Incomplete regex edits can still produce Chrome errors. Historical
regex errors were retained; the new local profile applied successfully. Common
credential-name masking is not a guarantee that an export contains no secrets.

## Light appearance verification — September 12, 2026

The actual toolbar popup now follows the system appearance. Computer Use checks
covered the 744 × 440 editor, keyboard focus, color selection, invalid-import
feedback, On/Off states and returning to dark mode. The localhost demo was left off
and the original Auto system appearance was restored. Menu keyboard dismissal and
focus restoration passed, but Computer Use could not capture the open menus.

Light-theme contrast calculations: muted text on selection 4.86:1, primary actions
6.51:1, error text 6.54:1, On badge 5.24:1 and field boundaries 3.68:1. These are
source-token calculations, not full accessibility certification. Saved palette
colors retain their existing values. `pnpm check` passed all 415 tests in 23 files,
types, formatting, coverage, extension packaging and Storybook after the CSS change.

Generated screenshots and review reports are local-only evidence. Store future
captures under ignored `.local/qa/`; keep concise results in this file. Curated
README images are maintained separately in `docs/screenshots/`.

## Release checklist

1. Align `package.json` and `src/manifest.json`; update release notes and screenshots.
2. Run `pnpm check` and the Chrome matrix. Inspect the ZIP and manifest version.
3. Commit/push and confirm CI for that exact commit.
4. Push an annotated `vX.Y.Z` tag. The release workflow publishes a ZIP and checksum.
5. Download and verify both assets. Never move a published tag. GitHub releases do
   not publish to the Chrome Web Store.
