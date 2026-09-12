<p align="center"><img src="public/icons/gecko.png" width="160" height="160" alt="ChHeader’s blue gecko mascot"></p>
<h1 align="center">ChHeader</h1>
<p align="center">By <a href="https://kahwee.com">KahWee Teng</a> · No ads. Local profiles. Open source.</p>
<p align="center">Edit HTTP request and response headers in Chrome.</p>
<p align="center"><a href="https://github.com/kahwee/ch-header/releases/latest">Download for Chrome</a> · <a href="https://www.youtube.com/watch?v=vmv77KYgOAo">Watch the 55-second demo</a> · <a href="https://kahwee.com/2026/why-i-built-chheader/">Why I built it</a></p>

I’m [KahWee Teng](https://kahwee.com). I built ChHeader because ModHeader’s
[ad injection](https://news.ycombinator.com/item?id=37772829) put me off.
I wanted a header editor without ads, with local profiles and code I could inspect.

Use it, fork it, or build your own. Reviews of the [permissions](src/manifest.json)
and [header rules](src/lib/dnr-rules.ts) are welcome.

## Install

1. Download and extract the ZIP from [GitHub Releases](https://github.com/kahwee/ch-header/releases/latest).
2. Open `chrome://extensions/` and enable **Developer mode**.
3. Choose **Load unpacked**, select the extracted folder, then pin ChHeader from
   Chrome’s Extensions menu.

To update, replace the extracted files and click **Reload** on the extension card.
ChHeader 0.4.2 is awaiting Chrome Web Store review; the listing is not public yet.
Until approval, install the GitHub release using the steps above.
This README describes main. See the release notes for what is in each download.

## Your first profile

1. Click **Create profile** and give it a name, such as “Local API”.
2. Under **URL rules**, choose **Site** and enter `127.0.0.1:3002`.
3. Add a request header: `X-Env` with the value `staging`.
4. Set **Allowed sites** to `127.0.0.1`, then turn the profile **on** to approve access.
5. If Chrome closes the popup, reopen it and turn the profile **on** again. Reload the target page.

New profiles start **off**. Only one profile can be on at a time; selecting a
profile opens its editor without enabling it. Changes save on edit; URL rules save
when you leave the field. **Apply** reapplies the enabled profile’s saved rules.

## Choose where headers apply

| Mode | Use it for |
| --- | --- |
| **Site** | A hostname and optional port, such as `127.0.0.1:3002`. Covers HTTP/HTTPS and subdomains. |
| **URL pattern** | Chrome URL-filter syntax when you need to narrow matching further. |
| **Regex** | Advanced matching, checked for support by Chrome before saving. |
| **All allowed sites** | Any URL within this profile’s allowed sites. |

You can also limit each rule by request type. **No URL rules means no requests
are changed.** Invalid drafts show an inline error and leave the saved rule intact.
Start with Site mode; most profiles do not need a regular expression.

## Website access

Version 0.4.2 requests website access only when you approve a profile’s allowed
sites. Domain grants include subdomains, HTTP/HTTPS and all ports; URL rules narrow
header changes further. Regex rules cannot escape that profile’s site list.
**Revoke all website access** removes grants and turns profiles off. Updates also
reset website grants, so you must approve sites again. See [permissions](docs/permissions.md).

## Keep and share profiles

Profiles are stored on this device in Chrome’s local extension storage. Right-click
a profile or open **Options** to duplicate, export or delete it. **Undo** restores
the last deleted profile, off, while the popup remains open.

**Import** accepts pasted JSON or a file. Imported profiles get new IDs and start
off. **Export all** shares a collection; **Options → Export JSON** shares one profile.
Exports blank common credential headers by default; review custom headers and
values before sharing. A [localhost example](docs/examples/local-profile.json)
is included. Read the [privacy policy](PRIVACY.md) for storage and data handling.

## Develop

Use the Node and pnpm versions declared in the repository.

```sh
pnpm install --frozen-lockfile
pnpm check          # types, format, lint, tests, extension ZIP and Storybook
pnpm dev:extension  # rebuild on edits; load dist/ unpacked and reload in Chrome
```

`pnpm test:fast` runs focused workflow tests. `pnpm test:headers` starts the local
header fixture at `http://127.0.0.1:3002`. See [TESTING.md](TESTING.md) for actual
Chrome checks and [AGENTS.md](AGENTS.md) for contributor guidance.

## License

[MIT](LICENSE) · Copyright 2026 KahWee Teng.
