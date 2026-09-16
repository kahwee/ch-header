# Product media

These are curated product images used by the README, Chrome Web Store listing and
demo video. They show the real unpacked Chrome extension with synthetic demo data.

## Current walkthrough

1. `access-needed.jpg` — saved hostname before Chrome access is approved.
2. `access-approved.jpg` — access approved while the profile remains off.
3. `popup.jpg` — approved profile enabled with its request header visible.
4. `header-check.jpg` — a real localhost request received by the demo server.
5. `access-revoked.jpg` — access revoked and every profile off.

Keep each popup capture at 758 × 454. Keep browser results at 1470 × 947. Use only
demo hostnames and values, leave profiles off, revoke temporary website access and
stop local fixtures after capture.

Raw screen captures, crops and contact sheets belong in `.local/qa/`; do not commit
them. After replacing the curated files, run `pnpm media:video` to create the local
1080p video, captions and upload copy, then visually inspect its contact sheet.
