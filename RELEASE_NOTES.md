# ChHeader 0.4.8

Header values now reject unsupported ASCII control characters before saving,
while preserving horizontal tabs and the existing line-break validation. Invalid
values stay visible for correction without replacing the saved value.

Updated compatible development dependencies and pinned GitHub Actions. Release
recovery preserves already-published archives and checksums rather than replacing
them.

No new permissions or storage-format changes.
