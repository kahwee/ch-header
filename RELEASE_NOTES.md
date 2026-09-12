# ChHeader 0.4.2

Website access is now optional. Each profile has an explicit list of allowed
sites; Chrome asks for access when you enable it. Regex and broad URL rules stay
within that profile’s list. Denied or revoked access leaves the profile off.

The popup shows granted sites and can revoke all website access. Updates clear
old grants and turn profiles off while retaining saved profiles. Approve your
sites again; if Chrome closes the consent popup, reopen ChHeader and enable the
profile. Domain grants include subdomains, HTTP/HTTPS and all ports.

This also fixes duplicate native switch events in Chrome. MIT licensed, with
local profiles and no ads or analytics.
