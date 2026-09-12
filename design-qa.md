# ChHeader design QA — 0.3.0

The audit used the installed Chrome toolbar popup through Computer Use. The old
800 × 600 Storybook review missed the overflow visible in the user's screenshot.

## Before and after

[Original popup screenshot](docs/qa/2026-09-12-before.png)

![Refreshed ChHeader popup](docs/screenshots/popup.jpg)

| Finding                                           | Change and observed result                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Fields clipped and delete actions hidden          | Fixed table layout and flexible columns; both fields and row actions visible             |
| Oversized sidebar, avatars, notes and Add buttons | 184px sidebar, 24px circular markers, short notes and understated Add actions            |
| Excessive vertical space                          | Explicit 744 × 440 popup; only editor body scrolls, with stable heading and Apply footer |
| Bright blue surfaces competing with content       | Chrome-style charcoal surfaces, pale blue accents and neutral borders                    |
| Generic purple identity                           | Original header-controls SVG mark and matching toolbar PNGs; compact wordmark            |
| Checkbox used for the whole profile               | Accessible on/off switch; verified with real localhost requests                          |
| Menu focus and dismissal                          | Arrow-key navigation, Escape focus restoration and synchronized expanded state           |
| Search duplicates and hidden empty state          | One filtered list; matching and no-results states checked in Chrome                      |

The long-profile check added six request rows, scrolled to the response and matcher
sections, and confirmed that the footer and row actions stayed visible. Empty test
rows were removed. The color picker was opened, Blue selected, and the closed picker
and updated marker verified. Options keyboard entry and Escape were checked too.

## Branding

The ChHeader name remains. Its original vector mark represents editable header
rows. The palette uses `#202124`, `#292a2d`, `#303238`, `#e8eaed` and `#a8c7fa`.
System UI fonts, small circular profile markers and restrained buttons keep the
tool visually close to Chrome. See [brand assets and regeneration](docs/brand/README.md).

The current design is a dark theme; automatic Chrome theme matching and light mode
are not implemented. This audit is not a claim of full accessibility compliance.
Screen-reader, forced-color and wider-platform testing remain outstanding.

Screenshots are real captures with demonstration data, not generated mockups.
[TESTING.md](TESTING.md) records functional evidence and remaining limits.
