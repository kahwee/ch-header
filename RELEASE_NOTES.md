# ChHeader 0.4.3

Hardens rule maintenance: every URL matcher now receives a stable DNR rule ID,
and duplicate IDs fail clearly instead of silently omitting a rule. Saved legacy
resource types remain compatible.

The build now requires Node 26.7.0 or newer and uses pnpm 12.4.2. No extension
permissions, data collection, or profile behavior changed.
