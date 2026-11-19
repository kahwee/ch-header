# ChHeader HTTPS tester

[Open tester](https://headers.kahwee.com) ·
[Second origin](https://headers-peer.kahwee.com)

Two standalone Cloudflare Workers serve the same page on subdomains of kahwee.com.
The main website is unchanged.
Use them to compare matching and excluded paths, redirects, cross-origin requests,
and behavior before/after enabling or revoking ChHeader.

The Worker returns only `Accept`, `Content-Type`, `X-Env` and `X-ChHeader-Test`.
It omits all other headers, IP addresses and query strings. Use demo values:
Cloudflare still receives requests even when a field is omitted from the response.
There is no application logging, analytics, storage, outbound fetch or credentialed
CORS. Worker observability is disabled; Cloudflare may retain platform metadata.
Responses use `no-store` and a restrictive CSP. The page renders values as text.

- `/headers/match` and `/headers/other`: demo header JSON; response header
  `X-ChHeader-Response: original` lets you test browser-side response changes.
- `/redirect`: fixed redirect to `/headers/other`.
- `/`: instructions and buttons for same-origin and sibling-origin checks.

With Wrangler 4.131.1 installed and logged into the kahwee.com Cloudflare account:

```sh
pnpm test:echo       # offline security tests
pnpm test:echo:live  # deployed kahwee.com endpoints
wrangler dev --config tools/header-echo/wrangler.jsonc --env ''
wrangler deploy --config tools/header-echo/wrangler.jsonc --env '' --dry-run
wrangler deploy --config tools/header-echo/wrangler.jsonc --env ''
wrangler deploy --config tools/header-echo/wrangler.jsonc --env peer
```

Custom domains and their exact CORS/CSP peer origins are configured in source.
The original workers.dev pair remains available. To deploy to your own account,
replace the custom domains and peer origins, or remove the custom routes to use
workers.dev alone. No secrets are required.

Requests from unrelated origins cannot read the echo through CORS. Cookies and
authorization are never reflected. POST bodies are rejected without being read.
Tests exercise these boundaries; real HTTPS browser checks are in [TESTING.md](../../TESTING.md).

Import [https-profile.json](../../docs/examples/https-profile.json) for the Chrome
test. The full manual matrix is in [TESTING.md](../../TESTING.md).
