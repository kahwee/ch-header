## ChHeader 0.4.1 — prepared for submission

- Blue gecko mascot across the popup, Chrome icons, README and store artwork.
- No changes to header rules or permissions.

## ChHeader 0.4.0 — prepared for submission

- Right-click profile actions, recoverable deletion, and explicit On/Off sidebar badges.
- Copy, download and import portable JSON; import validates the whole batch and starts profiles off.
- Common credential header values are hidden in exports by default.
- Plain CSS cleanup, simple profile color names, updated screenshots and shorter documentation.
- Real-template workflow tests and a single `pnpm check` command shared with CI.
- System light/dark appearance and a first-run welcome with no enabled demo rules.
- Explicit Site, URL pattern, Regex and All sites modes; no URL rules means no requests.
- Inline regex validation, preserved invalid drafts, and visible save/apply failures.
- Chrome Web Store description, privacy policy, and submission assets.
- Removed an unused optional permission; required header and local-storage access remain.

This version is prepared locally for Chrome Web Store review; this heading does
not indicate that Google has approved it or that a GitHub release has been published.

## ChHeader 0.3.0

A calmer, tighter header editor with Chrome-inspired colors and a new header-controls
icon. The 744 × 440 popup keeps editing fields and delete actions visible, with a
scrolling body and persistent Apply footer.

- Tonal profile palette with legacy-color compatibility, subtle control elevation,
  smaller circular profile markers, compact rows, accessible profile switch,
  restrained blue actions, and keyboard navigation for menus.
- Fixed Add/Apply form navigation, Enter accidentally activating delete controls,
  and profile search/empty results.
- Integrated the modular popup architecture for appearance, lists and keyboard navigation.
- Fixed regex matchers, Documents filtering, and overlapping background rule updates.
- Added a localhost request/response test fixture and documented browser results.
- Refreshed README, screenshots, contributor guidance, and tentative roadmap.
- CI runs finite tests with coverage, type/format checks, packaging and Storybook.
  Tagged releases validate versions and include a SHA-256 checksum.

Download the ZIP, extract it, and use **Load unpacked** in `chrome://extensions/`.
For an existing unpacked installation, replace its files and click **Reload**.
This release is distributed through GitHub, not the Chrome Web Store.

Known limitation: editing an incomplete regex in an enabled profile can log a
Chrome validation error; disable the profile while editing complex patterns.
Inline validation and light-theme support are planned, without committed dates.
