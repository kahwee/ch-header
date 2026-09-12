# Why ChHeader asks for website access

A header editor needs permission to change requests to the sites you choose.
Those sites are not known when the extension is installed. ChHeader 0.4.2 asks
for them when you enable a profile, using Chrome's [optional permissions API](https://developer.chrome.com/docs/extensions/reference/api/permissions).

## What each permission does

| Manifest entry | Why it is there |
| --- | --- |
| `storage` | Saves profiles and settings in Chrome's local extension storage. No account or sync service. |
| `declarativeNetRequestWithHostAccess` | Lets Chrome apply header rules where website access has been granted. ChHeader does not inject page scripts to edit headers. |
| Optional `http://*/*` and `https://*/*` | Lets ChHeader ask for user-chosen development servers and APIs. This declaration is permission to **ask**, not an installation-time grant to every website. |

There are no required host permissions. The extension does not request browsing
history, cookies, scripting or debugger API permissions. Website access is still
powerful: approve only hosts you need, even though ChHeader currently uses it for
header rules. Inspect the [manifest](../src/manifest.json) and [request code](../src/lib/site-access.ts).

## Granted access and active rules are different

Chrome grants website access to the **extension**, not separately to each profile.
Grants can accumulate and persist across tabs and browser sessions. ChHeader adds
a second boundary: every generated rule includes the active profile's allowed
destination domains. A grant left over from another profile does not expand them.
URL patterns, regex and request types narrow the rules further.

The current UI requests both HTTP and HTTPS, including subdomains and all ports,
for each domain you enter. That breadth is ChHeader's current choice; Chrome also
supports narrower scheme/host patterns. Paths cannot restrict a host permission:
Chrome ignores the path when granting access. Put path and port restrictions in
URL rules. See Chrome's [match-pattern documentation](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

Turning a profile off stops its rules but **does not revoke its grants**. Removing
a site from a profile also leaves the old Chrome grant in place. Use **Revoke all
website access** to remove grants and turn every profile off, then approve only
the sites you still need. Chrome's extension settings can also manage site access.
ChHeader updates reset grants and rules while preserving saved profiles.

## A narrower setup for an API

Suppose `app.example.com` calls `api.example.com/v1/`:

1. Enter `app.example.com, api.example.com` under **Allowed sites**, not `example.com`.
2. Choose **URL pattern** and enter `|https://api.example.com/v1/`. The leading `|`
   anchors the rule to that HTTPS URL prefix. Use `|https://api.example.com/v1/status|`
   to match one exact URL instead; a query string will not match that exact rule.
3. Choose **XHR/Fetch** if that is all you need. Avoid **All allowed sites** for
   credentials: it would also target the approved app host.
4. Enable and approve access. If Chrome closes the popup, reopen it, select this
   profile and enable again. Reload the test pages after access changes.
5. Test a matching request and an excluded request. Revoke access when finished.

For cross-origin subresource requests, Chrome needs host permission for the page
initiating the request as well as the destination. Approving only the API can
leave a profile on without changing its requests. This is documented in the
[declarativeNetRequest permission rules](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest#permissions)
and was checked in Chrome. The URL rule above keeps header changes on the API.

Enter hostnames only in Allowed sites. Wildcards, schemes, paths and ports are
rejected. Localhost and IPv4 are supported; IPv6 literals are not currently supported.

## Why this changed, and what could improve

Version 0.4.1 requested `<all_urls>` at installation so arbitrary user-chosen
servers worked without more prompts. URL rules limited changes, but did not
reduce that permission. It was convenient and unnecessarily broad. Version 0.4.2
replaced it with per-site consent; this is not a promise of faster Store approval.

Further improvements could make HTTPS and exact hosts the default, with explicit
choices for HTTP and subdomains, and add per-site revocation in the popup. Those
controls are **not implemented yet**. `activeTab` could suit a temporary current-tab
mode, but is not a drop-in replacement for persistent profiles across API hosts
and tabs. See Chrome's [activeTab description](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab).

On main, after 0.4.2, rejected rule replacements clear previous rules and turn
profiles off. Chrome's atomic rejection could otherwise leave old headers running.
Invalid drafts rejected by the editor still leave the last saved URL rule intact.
If Chrome refuses rule cleanup too, disable the extension in `chrome://extensions/`.

## Check it yourself

Use [headers.kahwee.com](https://headers.kahwee.com) and the
[HTTPS demo profile](examples/https-profile.json). It approves only the two test
subdomains and changes exactly `/headers/match`. Use demo values: Cloudflare receives
these requests. The Worker displays a small header allowlist, omits credentials
and cookies, and has no application logging or storage. Use the local fixture for
secrets; saved extension profiles have no additional encryption either.

The [test record](../TESTING.md) separates automated tests, actual Chrome results
and unresolved failures. Intermittent browser 403/client blocks made some repeat
runs inconclusive. A failed request does not prove that a rule excluded it.

Documentation and source checked September 12, 2026.
