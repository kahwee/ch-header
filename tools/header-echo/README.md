# ChHeader HTTPS tester

[Open tester](https://chheader-check.kahwee-teng.workers.dev) ·
[Second origin](https://chheader-check-peer.kahwee-teng.workers.dev)

Two standalone Cloudflare Workers serve the same page. They do not modify kahwee.com.
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

With Wrangler 4.131.1 installed and logged into your own Cloudflare account:

```sh
node --test tools/header-echo/worker.test.mjs
wrangler dev --config tools/header-echo/wrangler.jsonc --env ''
wrangler deploy --config tools/header-echo/wrangler.jsonc --env '' --dry-run
wrangler deploy --config tools/header-echo/wrangler.jsonc --env ''
wrangler deploy --config tools/header-echo/wrangler.jsonc --env peer
```

The sibling host is derived from the `chheader-check` / `chheader-check-peer`
names on the same workers.dev subdomain. No custom domain or secrets are required.
To use custom domains, explicitly configure the peer origin and CORS/CSP allowlist.

Requests from unrelated origins cannot read the echo through CORS. Cookies and
authorization are never reflected. POST bodies are rejected without being read.
Tests exercise these boundaries; real HTTPS browser checks are in [TESTING.md](../../TESTING.md).
