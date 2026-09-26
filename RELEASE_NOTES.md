# ChHeader 0.4.5

ChHeader now explains whether changes are saved, rules are applied, website access
is missing, or a profile has no rules to apply. Application failures include a
recovery action, and the last result stays available when you reopen the popup.
The toolbar shows **ON** after Chrome accepts rules, with the profile name in its
tooltip. Installed rules do not guarantee that a particular request matched.

Header names validate as you type and save when you leave the field or press Enter.
Invalid drafts keep the last saved name and working rules intact, including when
you add another row. Inline feedback identifies invalid names and rejects multiline
paste before it can silently change a header value.

Apply now retries the active profile ID along with profile data after a failed
activation save. Status and toolbar failures no longer stop successfully installed
rules. The Storybook preview now matches the actual 744 × 440 popup.

Verified with 496 extension tests, five Worker tests, and actual Chrome toolbar
checks in light and dark modes, including localhost request/response modifications.
Failure injection is covered by the automated harness. The build uses Node 26.7.0
and pnpm 12.4.2. No new permissions or data collection; profiles and application
status remain local.
