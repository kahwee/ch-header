# Historical testing notes — superseded by ../../TESTING.md

## Automated checks

Use the Node and pnpm versions declared in `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test:run
pnpm run build
```

`test:run` currently runs Vitest with jsdom. It does not load the extension into
Chrome or prove that Chrome accepts the generated declarativeNetRequest rules.
Use the installed-extension checks below before treating a release as verified.

## Repeatable localhost check

```sh
node scripts/header-check.js
```

Open `http://127.0.0.1:3002/` in the same Chrome profile as the extension. The
server binds only to `127.0.0.1`; it has no dependencies. Set
`CHHEADER_TEST_PORT` to use another port and adjust the matcher accordingly.

1. Build the extension and load `dist/` from Chrome's **Load unpacked** control.
   For subsequent builds, click ChHeader's **Reload** in `chrome://extensions/`.
2. Open the actual toolbar popup. Create a profile named `QA Local Headers`.
3. Set the matcher to `127.0.0.1:3002` **before enabling the profile**.
4. Add request header `X-ChHeader-Test` with value `enabled`.
5. Add response header `X-ChHeader-Response` with value `modified`.
6. Enable the profile, click **Apply**, and click **Run checks** on the fixture.
7. Change one setting at a time, apply it, and rerun the checks below.
8. Disable the QA profile when finished. Keep the local matcher and saved rows
   for the next run. Stop the fixture with Ctrl+C.

The fixture performs real browser fetches. The server echoes the received request
headers; the page reads the response header exposed by Chrome. The server always
sends `X-ChHeader-Response: original`, so `modified` proves the extension changed
the response. No Chrome APIs are mocked in this workflow. `curl` is useful for
checking the server but does not exercise the browser extension.

| Case              | Setting                                  | Expected result                                    |
| ----------------- | ---------------------------------------- | -------------------------------------------------- |
| Baseline          | Profile disabled                         | All paths: request `(absent)`, response `original` |
| Simple host       | `127.0.0.1:3002`, All request types      | All paths: `enabled` / `modified`                  |
| Wildcard          | `127.0.0.1:3002/match/*`                 | Only `/match/echo`: `enabled` / `modified`         |
| Regex             | `regex:^http://127\.0\.0\.1:3002/match/` | Only `/match/echo`: `enabled` / `modified`         |
| Fetch             | Simple host, XHR/Fetch                   | All fetch paths modified                           |
| Documents         | Simple host, Documents                   | All fixture fetch paths unmodified                 |
| Individual header | All request types; request row unchecked | Request absent; response modified                  |
| Off               | Disable profile after successful checks  | All paths return to baseline                       |
| Persistence       | Close and reopen popup                   | Saved name, rows, matcher and enabled state remain |

For a document-positive check, reload the fixture's root page and read its
**Document request header** value. With the simple host matcher and Documents,
it must show `enabled` while all three fetches remain unmodified. With XHR/Fetch,
a reload must show `(absent)` while the fetches are modified. This reads the
header observed by the server for the HTML navigation itself.

## Popup interaction and visual checks

- Check the actual toolbar popup, not only the Storybook canvas.
- Populate both header sections with long names and values. Every checkbox,
  field, delete action, request-type selector, and Apply button must fit.
- Add a request header, response header and matcher while a non-active profile
  is selected. The editor must retain that selection and must not navigate or
  append `?profileName=...` to the popup URL.
- Click Apply and press Enter in a text field. Neither should navigate the form.
- Add enough rows to require scrolling. Check the last row and sticky footer.
- Open Options and each section menu; verify placement, dismissal, keyboard
  focus and the expected actions. Check the profile color picker too.
- Search for a profile by name and notes, clear the search, and check no-results.
- Inspect Chrome's ChHeader Errors view after a fresh reload and a burst of
  edits/applications. Retain old evidence separately from new errors.

The native popup is designed for 760 × 540 CSS pixels, with a 190px sidebar.
Header tables use fixed layout and zero-minimum grid columns to keep actions
visible. Long input contents can scroll within their fields.

## 2026-09-12 execution record

Environment: macOS, user's Chrome profile, unpacked ChHeader 0.2.2 built from
`093d3c1` plus the working-tree changes. Node 26.7.0, pnpm 11.25.0; commands used
`--pm-on-fail=ignore` for the project pin to pnpm 11.24.0 without editing it.

| Check                                     | Observed result                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Initial install                           | Installed and enabled through native Computer Use                                       |
| Original automated suite                  | 415 tests passed despite the browser bugs below                                         |
| Revised compact popup                     | Built, reloaded in Chrome, visually inspected; row delete controls visible              |
| Add request row and delete blank test row | Passed on revised popup; no navigation                                                  |
| Apply                                     | Passed on revised popup; URL and selection stayed unchanged                             |
| Saved QA profile after extension reload   | Name, both headers, matcher and enabled state persisted                                 |
| Simple-host request/response modification | Passed for all three fixture paths                                                      |
| Wildcard path inclusion/exclusion         | Passed; only `/match/echo` modified                                                     |
| Profile disable                           | Passed; all three paths returned to baseline                                            |
| Options                                   | All four actions exposed; action execution not covered                                  |
| Initial regex behavior                    | Failed: no paths modified; generated `urlFilter` instead of `regexFilter`               |
| Initial Documents selection               | Failed: fetches retained old modifications; UI emitted invalid `document` resource type |
| Direct JSON navigation                    | Blocked by Chrome with `ERR_BLOCKED_BY_CLIENT`; not a positive document test            |
| Initialization                            | Chrome logged duplicate rule ID `486123301` and an unhandled rejection                  |
| Final automated suite                     | 418 tests across 18 files passed; TypeScript and production build passed                |

Fixes included in the final build:

- Explicit non-submit section Add buttons and a prevented form submit for Apply.
- Compact popup, neutral secondary actions, smaller avatars and checkboxes,
  short notes field, flexible header columns, and visible delete buttons.
- `regex:` matchers now generate `regexFilter`.
- Documents now uses `main_frame`; old saved `document` values are normalized.
- Background updates serialize the profile read and rule replacement, with a
  regression test for overlapping events and recovery after rejection.

## Retest after Chrome restart — 2026-09-12

The user restarted Chrome and Computer Use access returned. The final functional
build was reloaded through the native Extensions UI. This run supersedes the
previous inability to verify the final build in Chrome.

| Check                            | Result in the installed extension                                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistence across restart       | QA profile name, headers, matcher and disabled state retained                                                                                                              |
| Documents                        | Root document received `enabled`; all three fetches remained `(absent)` / `original`                                                                                       |
| XHR/Fetch                        | Root document `(absent)`; all three fetches `enabled` / `modified`                                                                                                         |
| Regex                            | Only `/match/echo` received `enabled` / `modified`; other paths unchanged                                                                                                  |
| Individual request-header toggle | Matching path request `(absent)` while response stayed `modified`                                                                                                          |
| Disable profile                  | All three paths returned to `(absent)` / `original`                                                                                                                        |
| Repeated Apply                   | Three consecutive applications completed; no duplicate-ID error observed                                                                                                   |
| Final error inspection           | Regex-validation errors recorded while editing an incomplete regex; no duplicate-ID errors in this run                                                                     |
| Search                           | Found an additional bug, fixed and reloaded: matching query now returns only the matching profile, unmatched query shows No results found, clearing restores both profiles |
| Final state                      | Latest build reloaded; QA profile disabled, header rows enabled, saved regex and XHR/Fetch retained                                                                        |

The search bug kept an unfiltered list visible alongside results and left the
empty-state element hidden. Search now filters the existing list and sets the
empty-state visibility directly, also keeping keyboard navigation on that list.

Remaining limits: this is a targeted smoke test, not full release certification.
Invalid/incomplete regex edits still log Chrome validation errors while the
profile is enabled; there is no inline validation feedback. Long-list scrolling,
color-picker selection, import and full keyboard/accessibility coverage remain
manual follow-ups. Fresh-install concurrency is covered by the automated overlap
regression, while the browser run checked reload and sequential Apply behavior.

Chrome's authoritative rule schema:
[declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest).

See [design QA](../../design-qa.md) for the screenshot findings and layout changes.
