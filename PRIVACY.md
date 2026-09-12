# ChHeader privacy policy

Last updated: September 12, 2026

ChHeader is an open-source Chrome extension maintained by KahWee Teng. It lets you
configure HTTP request and response headers for websites you choose.

## Information stored on your device

ChHeader stores profile names, colors, notes, header names and values, URL rules,
and the enabled profile in Chrome's local extension storage. It does not use
Chrome Sync. Header values may contain credentials if you enter them. ChHeader
does not add encryption to this storage; it is not a password manager.

Chrome also stores the active header rules so it can apply them to matching
requests. The extension may write diagnostic messages, including profile names
and errors, to Chrome's local extension console.

## How information is used and transmitted

ChHeader uses your saved settings only to provide its header-editing features.
When you enable a profile, Chrome sends its configured request headers to websites
matching your URL and request-type rules. Response-header rules change the headers
Chrome exposes for matching responses. Those websites handle requests under their
own privacy policies. Review destinations before using credentials in a profile.

ChHeader has no developer-operated backend, analytics, advertising, or tracking
service. It does not transmit your profiles, browsing history, or page contents to
the developer. It does not sell user data or use it for advertising.

## Imports, exports, and support

Importing JSON saves the selected profiles locally. Copying or exporting profiles
places their contents on your clipboard or in a downloaded file at your request.
Common credential header values are blanked by default, but custom header names,
notes, and URL rules may still contain sensitive information. Review every export
before sharing it. Files and clipboard copies are outside ChHeader's storage.

If you voluntarily open a GitHub issue, its contents are handled by GitHub and may
be public. Do not include credentials, private URLs, or unredacted profile exports.

## Retention and deletion

Profiles remain in local extension storage until you delete them or uninstall
ChHeader. Turning a profile off stops its header changes but retains its settings.
Deleting profiles removes their saved settings; the popup temporarily retains the
most recently deleted profile for Undo until it is dismissed or closed. Uninstalling
ChHeader removes its extension storage and rules. Separately saved exports,
clipboard contents, and copies you have shared must be deleted separately.

## Limited use

ChHeader uses information only for its header-editing features. It does not sell
information, use it for advertising or credit decisions, or allow the developer to
read locally stored profiles. Transfers occur only when you configure matching
requests or choose to export or share information. These practices follow the
Chrome Web Store User Data Policy, including its Limited Use requirements.

## Changes and contact

Updates to this policy will be published here with a revised date. For questions,
contact the maintainer through https://github.com/kahwee/ch-header/issues. Use only
non-sensitive information in public support requests.
