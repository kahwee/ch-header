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

## UI clarity review — September 12, 2026

`pnpm install --frozen-lockfile`, `pnpm test:fast` (18 tests), and `pnpm check`
(415 tests, formatting, lint, types, coverage, packaging and Storybook) passed.
The harness also verifies that footer status follows selection independently of
which profile is enabled. Existing placeholder expectations were updated.

Using Chrome browser control and Computer Use, reloaded the existing unpacked
`dist/` installation and checked the actual 744 × 440 toolbar popup in light mode:

- Populated editor: persistent header labels, URL scope guidance and footer fit.
- New profile: empty header guidance disappears when Add creates a row.
- Name editing, Enter submission, Tab to Options and keyboard menu opening worked.
- Search with no results kept the selected editor visible; clearing restored the list.
- Import dialog guidance remained readable. Temporary demo was deleted afterward.
- Localhost profile On changed document headers and all three fetch paths to
  `enabled` / `modified`; Off restored absent requests and `original` responses.
  All profiles were left off and the local fixture was stopped.

The rebuilt popup exposed a CSS cascade defect where `.empty-state` overrode
`.hidden`; hidden state now takes precedence. Captures are local-only under
`.local/qa/clarity/`. Dark appearance, full screen-reader use, and the complete
wildcard/regex/resource-type matrix were not repeated in this pass. Existing
Chrome error history was not cleared. No rule-generation code changed.

## URL rule safety — September 12, 2026

URL editing now has Site, URL pattern, Regex and All sites modes. Site uses an
anchored hostname filter and includes HTTP/HTTPS and subdomains. New rules use
`example.invalid`; deleting the last rule now matches nothing (a deliberate change
from the old all-sites fallback). Existing nonempty filters keep their semantics.
URL edits are drafts until change/blur; empty input is rejected rather than widened.
Explicit All sites displays a destination warning.

Regex validation uses Chrome's `isRegexSupported`, both before the editor saves and
before the background replaces rules. See the [Chrome DNR API documentation](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest).
A rejected replacement retains the last applied rules. Apply failures now show a
notice rather than silently ignoring Chrome's error response.

`pnpm test:fast` passed 21 tests. `pnpm check` passed 421 tests across 24 files,
formatting, lint, types, coverage, packaging and Storybook. Added real-module
regressions for draft isolation, regex rejection/repair, storage-supplied invalid
regexes, disabling after rejection, and deleting the final rule. Unit coverage
checks anchored host conversion, explicit ports, ambiguous inputs and old filters.

Actual Chrome toolbar popup, through Chrome and Computer controls:

- Site `127.0.0.1:3002` changed document and all three fetch request/response headers.
- Regex `[` showed an inline error; prior live localhost rules remained effective.
- Repair to `^http://127\.0\.0\.1:3002/match/` modified only `/match/echo`.
- Deleting the final rule restored all fetch baselines; Off restored document baseline.
- After reloading the final build, Add defaulted to Site / `example.invalid`.
  Regex errors remained readable above the footer at 744 × 440 in light appearance.
  All sites showed a disabled value field and explicit warning while the profile was off.
- Disposable profile removed, all profiles off, fixture stopped. Local error capture:
  `.local/qa/clarity/06-regex-error.png`.

Limits: dark appearance and every request-type combination were not repeated.
This is not a comprehensive security audit. Advanced patterns can still intentionally
match broad destinations; Site includes subdomains. On a rejected replacement,
previously applied rules remain active until repaired or disabled. Pending/invalid
editor drafts are not persisted across popup closure or profile switching.

## Adversarial editor pass — September 12, 2026

Confirmed and fixed three additional defects:

- Adding a header replaced the URL input, discarding its invalid draft and feedback.
  Reproduced before the fix in Chrome and the real-module harness. Rows now remain
  connected, and unchanged URL rows retain their draft through unrelated additions.
- Site input accepted control characters and normalized path tricks. Inputs such as
  embedded tabs/newlines, extra slashes and `/a/..` now fail before URL conversion.
- Edit-save rejections were unhandled and invisible. They now show a recovery notice;
  Apply retries persistence before applying rules. Row feedback says validated,
  rather than claiming persistence succeeded before Chrome storage acknowledges it.

Added delayed-validator tests for old results arriving after newer edits, validation
finishing during a row addition, and a result arriving after its rule was deleted.
Injected storage rejection verifies the notice and successful Apply retry. Existing
row-placeholder cleanup remains covered; the full suite caught and corrected a
regression there during the fix.

Pinned Node 26.7.0 / pnpm 11.25.0: frozen install, `test:fast` (25 tests), and `check`
(426 tests in 24 files, types, format, lint, coverage, package and Storybook) passed.
The system defaults changed during the session, so the final checks ran with the
pinned versions through a temporary npm-exec environment, without changing the
project pins or system defaults.

Actual Chrome toolbar popup via Computer Use: reproduced lost invalid draft before
reload; after reload, adding a header preserved the empty draft and its error.
`127.0.0.1:3002/a/..` was rejected in Site mode, replacing it with the hostname
validated successfully, and Apply kept the popup intact. Disposable profile removed;
all profiles remained off. Storage failure and delayed results were injected only at
the automated Chrome boundary. Dark appearance and real network tests were not
repeated in this pass; previous network results remain documented above.

## Empty-library first-run review (2026-09-12)

Fixed initialization creating and activating a sample profile, including after a
user intentionally emptied their library. First install now starts empty. Welcome
explains the setup steps, offers Create/Import, and disables empty search/export.
Create focuses the name; unmatched searches have a Clear search action.

Automated: pinned Node 26.7.0 / pnpm 11.25.0 frozen install and `test:fast`
passed; final `pnpm check` passed (432 tests in 25 files, types, format, lint,
coverage, extension package and Storybook). Regression cases cover fresh/empty
storage, first creation, deleting the last profile and Undo, creation during an
unmatched search, clearing search, and importing from the welcome screen.

Chrome browser preview used the production popup module and markup at 744 × 440
with an isolated in-memory Chrome boundary. Light welcome layout, initial focus,
Create/name focus/off state, Clear search and opening Import were checked through
the requested browser tool. Computer Use found an unrelated sign-in prompt blocking
the native toolbar; actual fresh-install toolbar and dark appearance checks were
unavailable in this pass. Existing extension profiles were not changed. The preview
does not establish Chrome storage or DNR acceptance.

## Branding and README review (2026-09-12)

Replaced the slider logo with a vector H/request-response arrow mark and rendered
matching 16/32/48/128 PNG icons with rsvg-convert. Rewrote README installation,
first-profile, URL-mode and sharing guidance to match current source; removed stale
matcher and roadmap claims. Package and manifest descriptions now explain the task.

Pinned frozen install and `pnpm check` passed (432 tests). Inspected the rendered
logo, then reloaded the unpacked extension through Computer Use and verified the
new mark in the actual light Chrome toolbar popup at 744 × 440. Existing profiles
remained off. Dark appearance was not repeated. No release or store listing changed.

## Release checklist

1. Align `package.json` and `src/manifest.json`; update release notes and screenshots.
2. Run `pnpm check` and the Chrome matrix. Inspect the ZIP and manifest version.
3. Commit/push and confirm CI for that exact commit.
4. Push an annotated `vX.Y.Z` tag. The release workflow publishes a ZIP and checksum.
5. Download and verify both assets. Never move a published tag. GitHub releases do
   not publish to the Chrome Web Store.
