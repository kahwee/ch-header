# ChHeader 0.4.7

The popup now saves edits without a persistent Apply button. The footer reports
saved and applied status; Retry appears only when saving or confirming application
fails. Retry stays disabled while recovery runs and returns keyboard focus to the
status when it succeeds. Header names still save on blur or Enter.

No new permissions or storage-format changes.

Verified with 506 extension tests, five Worker tests, formatting, lint, types,
packaging and Storybook checks. Actual Chrome toolbar checks confirmed autosave,
Enter handling and localhost request/response headers. Extension-page checks
covered dark mode at 744 × 440, failed-save recovery and keyboard focus restoration.
