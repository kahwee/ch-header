# Website access in ChHeader

## Version 0.4.2: approve sites as needed

ChHeader has no required host permissions. It declares optional HTTP and HTTPS
hosts so users can approve specific destinations when turning a profile on.
The header API permission is `declarativeNetRequestWithHostAccess`, alongside
`storage`. No content scripts, analytics or developer backend are included.

Enter explicit hostnames under **Allowed sites**, separated by commas. A domain
grant includes its subdomains, HTTP/HTTPS and all ports. Localhost and IPv4
addresses are supported; IPv6 literals are not currently supported. Paths and
ports belong in URL rules, not the permission list. Wildcards and an all-website
grant are not accepted. Site-mode URL rules can suggest a hostname; arbitrary
URL filters and regex never determine permission scope automatically.

Chrome requests consent for those sites when you turn the profile on. Its prompt
may close the popup; reopen ChHeader, select the profile you approved, and turn
it on. The popup initially returns to the previously active profile.
Denied requests leave the profile off. Approved permissions persist across tabs
and browser sessions. A site-list change turns the profile off and requires you
to enable it again. Imports and duplicates also start off.

All rules, including regex and **All allowed sites**, are constrained by that
profile’s destination domains. Grants left over from another profile do not
expand those rules. Chrome enforces the host permissions; ChHeader checks grants
before applying rules and removes active rules when required access is revoked.
No URL rules or no allowed sites means no changes.

The popup lists granted sites. **Revoke all website access** removes all website
grants and turns profiles off; Chrome’s extension settings can manage individual
grants. Turning a profile off alone does not revoke permissions. Updates clear
website grants and live rules while preserving profiles, so users explicitly
approve destinations again. This also resets broad access from older versions.

## Why 0.4.1 requested broad access

Version 0.4.1 declared `host_permissions: ["<all_urls>"]` because users choose their
own local servers, internal services and public APIs. Those hosts were not known
in advance. This avoided per-site prompts but granted much more access at install
time. URL rules limited modifications, not the permission itself. Google flagged
that scope for possible additional review. It was a convenience tradeoff, not an
inherent requirement for a header editor.

## Remaining tradeoffs

Permissions cover hostnames and their subdomains, not a single endpoint. Choose
the narrowest domain (for example `api.example.com` instead of `example.com`) and
keep path/port rules precise. The optional manifest declaration permits asking
for any HTTP/HTTPS host, but the application requests only the entered hosts.
This reduces granted access; it does not guarantee a shorter Store review.

`activeTab` is temporary and scoped to the current main-frame origin. It is not a
replacement for profiles that must keep working across tabs and API hosts.
Cross-site API calls need host access for both the destination and the page making
the request. For example, put `app.example.com` and `api.example.com` in Allowed
sites, then use a **Site** URL rule for `api.example.com` so headers only go to the
API. A profile can be on while requests from an unapproved initiating page remain
unchanged. ChHeader does not silently grant that extra access. This behavior was
verified with separate localhost origins; see [test results](../TESTING.md).

Sources checked September 12, 2026:
[declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest),
[optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions),
[activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab),
[match patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

On main (after 0.4.2), a failed rule build or Chrome rule replacement clears the
previous dynamic rules and turns profiles off. Chrome's atomic rejection can
otherwise leave old headers running after an edit or profile switch. If Chrome
also refuses the cleanup operation, disable ChHeader in `chrome://extensions/`.
