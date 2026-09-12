# Website access in ChHeader

## Why 0.4.1 requests broad access

The submitted version declares `host_permissions: ["<all_urls>"]`. ChHeader is a
header editor for destinations chosen by the user: localhost, internal staging
services and public APIs. These hosts cannot be listed in advance. The current
model lets saved profiles work without a separate permission request for each host.

Chrome requires host access for header modification. ChHeader uses declarative
rules rather than reading page content to rewrite headers. Its URL rules limit
which requests it changes; they do **not** reduce the host permissions granted to
the extension. An off profile is not the same as revoked website access.

This was a convenience tradeoff, not the only viable design. The source has no
content scripts or developer backend, but broad access still deserves scrutiny.
Google flagged it for possible additional review.

## Recommended next version: access on demand

Declare HTTP/HTTPS hosts under `optional_host_permissions` instead of requesting
all hosts at installation. When the user enables a profile, explain the required
sites and call `chrome.permissions.request()` from that user action. Keep the
profile off if the user declines. This is a proposal, not behavior in 0.4.1.

Use `declarativeNetRequestWithHostAccess` with `storage` for this header-only design;
changing that API permission alone does not narrow website access. Example:

```json
{
  "permissions": ["declarativeNetRequestWithHostAccess", "storage"],
  "optional_host_permissions": ["http://*/*", "https://*/*"]
}
```

The broad optional declaration permits asking for individual hosts later; it does
not grant all hosts on installation. Start with explicit Site rules. Ask for
subdomains only when the profile needs them. Host permission paths are ignored,
so retain precise path and port matching in the declarative rules.

For arbitrary regex or URL-filter rules, require an explicit list of allowed
sites rather than guessing domains from the pattern. Reserve all-site access
for an explicit advanced choice. Show granted sites and allow revocation;
handle permission removal, imported profiles, denied requests and existing
installations without leaving the UI falsely reporting a working profile.

Before shipping, test navigation, same-site and cross-site API calls, multiple
tabs, subdomains, localhost, browser restart, permission revocation and migration
from broad access in actual Chrome. Check which request contexts need additional
grants rather than silently widening access.

## Other options

- `activeTab`: useful for a separate temporary current-tab mode. It grants
  temporary access to the main-frame origin after a user action, not blanket
  access to every API host or every tab. It is not a drop-in replacement for
  persistent profiles.
- HTTP/HTTPS-only required hosts: removes unnecessary URL schemes, but still
  grants every website. This is a smaller improvement than per-site consent.
- Fixed host allowlist: appropriate for an internal tool with known destinations,
  but would limit this general-purpose editor.

The pending 0.4.1 package is unchanged. A permission redesign needs a new version
and actual Chrome testing before a separate Store update.

Sources checked September 12, 2026:
[declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest),
[optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions),
[activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab),
[match patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).
