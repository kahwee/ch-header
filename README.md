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

Download and extract the ZIP from [GitHub Releases](https://github.com/kahwee/ch-header/releases/latest).
In `chrome://extensions/`, enable **Developer mode**, choose **Load unpacked**,
select the extracted folder, then pin ChHeader. To update, replace those files and
click **Reload**. Version 0.4.2 is awaiting Chrome Web Store review.

This README describes main; check release notes for your installed version.
The video shows 0.4.1, before optional website permissions.

## Try it

Open the [HTTPS header tester](https://headers.kahwee.com). Import the
[ready-made test profile](docs/examples/https-profile.json), or set up one site:

1. Create a profile. Set **Allowed sites** to `headers.kahwee.com`.
2. Choose **URL pattern** and enter `|https://headers.kahwee.com/headers/match|`.
3. Add request header `X-ChHeader-Test: hello-gecko` and response header `X-ChHeader-Response: modified`.
4. Turn the profile **on** and approve access. If Chrome closes the popup, reopen it,
   select that profile and enable it again.
5. Reload the test pages, then click **Run checks**. Only the matching path should change.
   Turn the profile off and run again to compare.

Use demo values on the public tester. For secrets, run `pnpm test:headers` locally
at `http://127.0.0.1:3002`. The [tester source](tools/header-echo) is included.

## Why the permissions exist

`storage` keeps your profiles locally. `declarativeNetRequestWithHostAccess` lets
Chrome apply header rules to approved sites. Optional HTTP/HTTPS host patterns
let ChHeader **ask** for hosts you choose; installation grants no website access.

For a page at `app.example.com` calling `api.example.com`, approve both hostnames.
Choose **URL pattern** `|https://api.example.com/v1/` and **XHR/Fetch** to change
only those HTTPS API requests. Avoid approving the parent `example.com`.

- **Allowed sites bound the destinations.** Current grants include subdomains,
  HTTP/HTTPS and all ports; URL rules narrow actual changes. Regex cannot escape
  the profile's site list. No URL rules means no changes.
- **Off is not revoked.** Disabling a profile stops its rules. Chrome retains
  grants, including sites removed from a profile. Use **Revoke all website access**,
  then approve only what you still need. Updates also reset grants.
- **Secrets stay your responsibility.** Local profiles have no extra encryption.
  Exports blank common credential headers; review custom values and notes.

New and imported profiles start off. On main, rejected rule updates also clear old
rules and turn profiles off; that fix is not in 0.4.2. No ads, analytics or remote code.

Read [permission tradeoffs and narrower setups](docs/permissions.md),
[privacy](PRIVACY.md), and [test results](TESTING.md). Browser 403/client blocks made
some repeat tests inconclusive; failed requests are not proof of correct filtering.

## Everyday use

Use **Site** for a hostname and optional port, **URL pattern** for Chrome’s filter
syntax, or **Regex** for advanced matching. **All allowed sites** covers the whole
profile site list. Each rule can also filter request types.

Selecting a profile does not enable it. Edits save automatically; URL rules save
on blur. Invalid URL drafts keep the last saved rule. **Apply** reapplies saved
rules. Use **Options** to duplicate, export or delete; **Import** accepts JSON.

## Develop

Use the pinned Node and pnpm versions in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm test:fast
pnpm check          # format, lint, types, tests, extension ZIP and Storybook
pnpm dev:extension  # load dist/ unpacked; reload Chrome after edits
```

[Contributor guidance](AGENTS.md) · [MIT license](LICENSE) · Copyright 2026 KahWee Teng.
