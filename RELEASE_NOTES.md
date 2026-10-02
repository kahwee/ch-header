# ChHeader 0.4.6

File imports now ignore results that arrive after you switch or delete the target
profile, close or reopen the sharing dialog, or paste newer JSON. Oversized header
files are rejected. This prevents delayed reads from changing the wrong profile
or overwriting a redacted export.

Export rendering reuses one selection snapshot, and HTML escaping reuses a fixed
entity map. Contributor and testing docs are shorter, with older verification
records preserved in the test history. Test-harness cleanup now waits for queued
background work; development dependencies have also been refreshed since 0.4.5.

No new permissions or storage-format changes.

Verified with 505 extension tests, five Worker tests, and actual Chrome toolbar
checks in light/dark modes, including export redaction and localhost request/response
matching. Full formatting, lint, type, package and Storybook checks passed.
