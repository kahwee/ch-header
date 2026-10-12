
## Immutable GitHub release assets

The existing tag release workflow now uses `scripts/release-assets.py`. It verifies
that the tag resolves to the checked-out source, compares all existing matching
assets by SHA-256 (downloading older assets without server digests), and uploads
only missing files. Differing published bytes stop recovery before any uploads;
there is no `--clobber`. This preserves releases after partial uploads and handles
an identical rerun without replacing assets. Rebuilt archives can differ because
of timestamps: keep the original published artifact and investigate rather than
replacing it. New GitHub releases retain the repository's release notes behavior.
Run `python3 scripts/test_release_assets.py` for isolated recovery regressions.
Existing workflow permissions are unchanged.

Normal PR CI now runs mocked CLI recovery tests for matching assets, missing assets, differing bytes, registry/API 403 errors and a missing (404) release. No real GitHub release write is performed by these fixtures.
