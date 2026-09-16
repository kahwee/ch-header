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

## Chrome Web Store preparation — September 12, 2026

Prepared 0.4.0 with matching package/manifest versions, a clearer summary, and removal
of the unused optional declarativeNetRequestWithHostAccess permission. No rule or
popup behavior changed in this pass. Pinned Node 26.7.0 / pnpm 11.25.0 frozen install
and `pnpm check` passed: 432 tests, types, formatting, lint, coverage, ZIP and
Storybook. Biome reports the existing noImportantStyles warning for the hidden-state
rule; it is non-failing. ZIP contents were inspected for the root manifest and
bundled assets.

Computer Use uploaded 0.4.0 to the existing store draft and saved corrected listing
copy, support links, and privacy explanations. The old policy link returned 404.
The 1280 × 800 store image uses the real popup module/template with isolated demo
profiles and a mocked Chrome boundary; it is promotional artwork, not evidence of
Chrome rule acceptance. The small promotional tile is 440 × 280, opaque PNG.
Actual toolbar/network behavior was not repeated in this store-preparation pass;
prior Chrome verification is recorded above. No live profile or system setting was
changed. Source captures and preview scaffolding remain under ignored `.local/qa/store/`.

The first CI run found a missing accessible title in the new promotional SVG.
Added the title; the raster upload is unchanged. The public policy URL was then
verified reachable and saved in the dashboard, which enabled Submit for review.
Reviewer instructions were also saved. The new screenshot is first in the gallery;
removal of the older image requires confirmation because Google marks it irreversible.

## Demonstration video — September 12, 2026

Computer Use reloaded the actual Chrome toolbar extension as 0.4.0 and created a
disposable, off-by-default Demo: Local API profile. Site 127.0.0.1:3002, request
X-ChHeader-Test: enabled, and response X-ChHeader-Response: modified were configured.
After enabling, the real fixture showed the document request header and all three
fetch request/response changes. After disabling and deleting the demo profile,
reloading and rerunning restored absent requests and original responses. Existing
profiles remained off. The new local fixture process was stopped afterward.

Captured actual popup and network-result screenshots were edited into a 67-second
1920 × 1080 H.264/AAC captioned walkthrough. Frames were visually inspected and the
finished MP4 decoded without errors. Personal introduction and closing cards identify
KahWee Teng and invite viewers to build or audit their tools. The video has no narration. The demo is published on
[YouTube](https://www.youtube.com/watch?v=QAnz_kIL6IQ). Source captures and upload copy
remain local under `.local/qa/video/`.

## Gecko branding — September 12, 2026

The approved ChatGPT-generated gecko replaces the previous mark in Chrome icon
exports and the shared popup template. `pnpm check` passed (432 tests), including
package and Storybook builds. Computer Use reloaded the installed extension as
0.4.1 and checked the actual toolbar popup at 744 × 440 in light mode; the mascot
rendered and profiles remained off. No header behavior or permissions changed.
The refreshed store screenshot uses the production template with isolated demo
profiles; it is a presentation check, not another network test. The blog image
uses that same current popup. Historical captures retain what was visible when recorded.

The replacement 55-second demo uses fresh actual Chrome 0.4.1 captures, with the
gecko in the popup and title cards. The existing localhost-only test profile
confirmed the document request and all three fetches received `enabled`, with
responses changed to `modified`. Switching it off restored absent request headers
and `original` responses. The profile was left off and the fixture stopped.
Frames were visually reviewed; the H.264/AAC MP4 decoded without errors.
The revised demo is [on YouTube](https://www.youtube.com/watch?v=vmv77KYgOAo).

## Release consistency review — September 12, 2026

For 0.4.1, `pnpm check` passed all 432 tests and the package/Storybook builds;
GitHub CI and the tagged release workflow passed. The published ZIP was downloaded
and its SHA-256 checksum, manifest version, MIT license and gecko icon verified.
It contains no local QA artifacts, node_modules or source maps. The README's latest
release link now resolves to 0.4.1. This packaging review did not repeat header
behavior tests; the actual Chrome checks above cover the unchanged rule code.
Chrome Store accepted the updated draft package, but it has not been submitted
or approved. The live blog header was checked at desktop and 390px mobile widths.

## Chrome Store submission — September 12, 2026

With user confirmation, the obsolete Store icon, two screenshots and promo tile
were replaced by the approved gecko assets. The current screenshot and demo URL
were retained. Google confirmed submission of 0.4.1 for compliance review, with
automatic publication after approval selected. Google warned that broad host
permissions may require additional review. Submission is not approval.

## Optional site access (0.4.2, September 12, 2026)

- Automated: the production popup/background harness covers denied consent,
  permission revocation, upgrade resets, scope changes, permission-prompt races,
  legacy profiles without scopes and composed native switch events. Rule tests
  verify regex conditions also carry the profile's destination-domain constraint.
- Actual Chrome toolbar popup: upgraded the existing unpacked extension from
  0.4.1 to 0.4.2; all profiles were off and no websites were granted. The consent
  dialog named only `127.0.0.1`; denial left the profile off. After approval,
  reopening and enabling applied request/response headers to actual document and
  fetch requests. Chrome closes the popup during a new consent prompt, so the UI
  documents reopening it; previously approved sites can enable directly.
- Actual Chrome network checks: an All allowed sites matcher modified
  `127.0.0.1:3002` but not the unapproved `localhost:3002`. A regex limited to
  `/match/` modified that fetch alone; document, `/echo` and `/miss/echo` retained
  original headers. Revoke all website access turned profiles off, removed grants
  and restored absent/original headers for all local requests.
- Visual: checked the normal 744 × 440 toolbar popup in light and dark appearance;
  the editor body scrolls and the footer stays available. Restored macOS Auto
  appearance. Test profiles are off, grants revoked and the local server stopped.
- Limits: no full Chrome restart, real remote subdomain or cross-origin initiating
  page test was performed. Those scenarios are not represented as verified by the
  harness. IPv6 host literals are deliberately unsupported in this version.

- Release/publication: all 443 tests and the complete local check passed. Main CI
  and the v0.4.2 release workflow passed. Verified the GitHub release checksum and
  that every packaged file matches the Store upload (archive metadata differs).
  Replaced the 0.4.1 review submission with 0.4.2; dashboard confirms Pending
  review, with automatic publication after approval.

## Released 0.4.2 network retest — September 12, 2026

Verified the downloaded GitHub release checksum and that every installed `dist`
file matches it. Reloaded that build in Chrome and tested the actual toolbar
popup with a local HTTP server and three loopback hostnames. No extension API or
network behavior was mocked. Results:

| Case | Actual Chrome result |
| --- | --- |
| No grant / denied grant | Profiles off; headers absent/original. |
| Grant `qa.localhost`, broad URL rule | Parent and `api.qa.localhost` modified; `outside.localhost` untouched. |
| Fetch from unapproved `outside.localhost` into approved API | Headers unchanged: the initiating page also needs host access. |
| Explicitly grant `outside.localhost` via a separate profile | Cross-origin calls into the active profile's allowed hosts work; the outside host itself remains unmodified. |
| Narrow allowed sites to `api.qa.localhost` | Editing turns the profile off. After re-enabling, only the child is modified, despite retained parent/other grants. |
| Revoke all access | All profiles off, no granted sites, and every tested request/response back to absent/original. |

Usability finding: Chrome closes the popup for a new permission prompt, then
ChHeader reopens on the previously active profile. Select the newly approved
profile again before enabling it. README and permission documentation now explain
this and the cross-origin initiating-page requirement. No runtime code changed.

The full automated check passed again (443 tests). Evidence remains local under
`.local/qa/permission-retest/`. Test profiles were left off with grants revoked;
server and test tabs were closed. Full browser restart and remote HTTPS were not
tested in this run. Subdomains and cross-origin requests above used loopback HTTP.

## Security hardening and public HTTPS checks — September 12, 2026

Main now clears existing dynamic rules and turns profiles off when building or
replacing rules fails. Previously Chrome could reject a replacement while leaving
the previous rules active. Removed the profile-name console log as well.

Automated: `pnpm install --frozen-lockfile`, `pnpm test:fast` (29), and `pnpm check`
passed with pinned Node 26.7.0 / pnpm 11.25.0. The full check includes 444 extension
tests and four new Worker security tests, plus build, package and Storybook.
The Worker tests cover credential/unknown-header/query omission, sibling-only CORS
without credentials, JSON reflection, fixed redirects, rejected POST bodies,
HEAD behavior and security headers. Local Wrangler HTTP checks passed. Live curl
requests to both Workers confirmed demo-header echo and credential omission.
Python urllib received a 403 remotely; curl and real Chrome succeeded.

Actual Chrome toolbar popup, rebuilt `dist`, demo values only:

| Case | Observed result |
| --- | --- |
| Both HTTPS Workers, profile off | Test request header absent; response header original. |
| Exact URL pattern for `/headers/match` | Request `X-ChHeader-Test: hello-gecko`; response `X-ChHeader-Response: modified`. |
| `/headers/other` and `/redirect` → `/headers/other` | Unchanged on both Workers. |
| Cross-origin fetches in both directions, both hosts approved | Only the exact matching paths changed. |
| Change enabled request header name to `Bad Header` | Chrome rejected it; profile turned off; previous request and response changes stopped. |
| Restore valid header and enable again | Matching requests worked again. |
| Revoke all website access | No grants, all profiles off, both HTTPS Workers unchanged. |

The test profile remains saved but off, with valid demo data and grants revoked.
The local Wrangler process was stopped; the main tester is left open. No system
settings were changed. Evidence is ignored under `.local/qa/permission-retest/`.
No full Chrome restart, incognito, Firefox or Safari testing was performed.

Deployed standalone Workers, without modifying kahwee.com:

- https://chheader-check.kahwee-teng.workers.dev
- https://chheader-check-peer.kahwee-teng.workers.dev

The [source and deployment instructions](tools/header-echo/README.md) are versioned.
Application observability is disabled; no storage, analytics or outbound fetches.
Cloudflare still processes requests, so the public fixture is for demo values.
The new extension hardening is on main only; the existing 0.4.2 Store submission
was not replaced during these tests.

### Custom domains — September 12, 2026

Added `headers.kahwee.com` and `headers-peer.kahwee.com` after checking both names
had no existing DNS records. Main website routes are unchanged. Exact peer origins
are included in CORS/CSP; unrelated origins remain denied. Original workers.dev
URLs remain available. README links now use the custom domains.

`pnpm check` passed (444 extension tests, five Worker tests). Actual Chrome loaded
the custom domain over HTTPS and returned HTTP 200 for all three same-origin and
cross-origin checks. These checks ran with extension profiles off; the earlier
active-profile checks above used workers.dev. No extra extension grants were added.

### Custom-domain fixture and repeated checks — September 12, 2026

The default public Worker tests, reviewer instructions and Chrome matrix now use
`headers.kahwee.com` / `headers-peer.kahwee.com`. Added an importable HTTPS fixture
and `pnpm test:echo:live`; offline localhost tests remain independent of the network.
Historical records retain their actual URLs. Reviewer text in the repository is
updated; the existing Store submission was not edited.

Pinned install, `pnpm test:fast` (30), and `pnpm check` passed: 445 extension tests,
five Worker tests, package and Storybook. Six live endpoint tests passed twice,
including after deployment. They test both custom domains, exact CORS peers,
main-domain/lookalike rejection, credential omission, security headers, redirects
and peer configuration. The fixture test verifies fresh off-state imports and
explicit domain/path conditions through the real parser and rule builder.

Actual Chrome imported the source-controlled fixture off, requested only the two
test subdomains, and applied `hello-gecko` / `modified` only to `/headers/match`.
Same-origin tests passed on both domains. Cross-origin tests passed in both
directions after refreshing the pages. Excluded paths and redirects were unchanged.

Repeated browser runs also hit intermittent `ERR_BLOCKED_BY_CLIENT` and HTTP 403
responses with Cloudflare ray headers but no CORS headers. Refreshing sometimes
resolved them, but they recurred, including after revocation. The narrow-to-one-site
case changed the primary matching path correctly; the excluded peer was blocked,
so its network result is **inconclusive**, not evidence of successful exclusion.
A focused Cloudflare firewall-events query returned no matching event; no firewall
settings were changed and the cause remains unresolved. Direct live endpoint tests
continued passing. Do not count blocked requests as a security pass.

The deployed page now labels request failures “Header behavior is inconclusive”
and recommends reloading both test pages after access changes. Verified that failure
message in Chrome. Revocation showed no grants and all profiles off; the reachable
peer returned absent/original on all paths. Main-domain browser checks were blocked
at that point. Restored the saved fixture's two-domain list, off, with demo values.

### Rule-builder maintenance — September 15, 2026

Removed an unused pre-RE2 matcher module and unused storage mutation helpers.
Resource types now share one runtime/type contract, while the saved `document`
alias remains normalized to `main_frame`. DNR IDs now use correct 32-bit FNV-1a
arithmetic, collision probing keeps every generated matcher rule, and duplicate
IDs passed to the low-level updater fail instead of silently dropping a rule.

Automated: the local Vitest suite passed (25 files, 432 tests), TypeScript passed,
and Biome formatting passed. The host only has pnpm 12.4.1 rather than the pinned
11.25.0, so the pnpm scripts could not be invoked directly. No Chrome toolbar
verification was run for this maintenance-only change; the last real Chrome matrix
above remains the relevant DNR acceptance evidence.

### Package-manager pin — September 15, 2026

Updated the repository pin and lockfile-managed pnpm dependency from 11.25.0 to
12.4.2, the current npm latest release at the time of the update. With pnpm 12.4.2,
`pnpm install --frozen-lockfile` passed its supply-chain policy verification;
`pnpm test:fast` passed 30 tests and `pnpm typecheck` passed. No runtime extension
behavior changed, so no Chrome toolbar check was needed.
