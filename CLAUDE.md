# ChHeader development guide

Use [README.md](README.md) for product usage and [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
conventions, and the verification checklist.

## Working rules

- Preserve Manifest V3 compatibility and the existing stored profile shape.
- Keep `src/lib` independent from the DOM.
- Keep popup business logic in `controller.ts`; keep `popup.ts` focused on composition and events.
- Extend the focused `profile-*` and `popup-*` modules instead of growing `popup.ts` again.
- Use native semantic CSS only. Do not add utility CSS or a runtime UI framework.
- Use existing source icons for standard interface actions.
- Escape profile names, notes, matchers, headers, and imported content before rendering.
- Keep TypeScript strict and do not introduce `any`.
- Update or add tests for changed behavior. Prefer behavior and accessibility assertions over exact
  style implementation details.

## Architecture boundaries

- `src/lib`: domain types, matcher parsing, DNR generation, and storage.
- `src/ui/components`: pure component renderers and the checkbox custom element.
- `src/ui/lib`: mounted component lifecycle and row/list coordination.
- `src/ui/core/controller.ts`: profile mutations and orchestration without DOM dependencies.
- `src/ui/core/popup.ts`: application wiring only.
- `src/ui/core/popup-template.ts`: top-level popup markup composition.
- `src/ui/core/profile-*`: focused profile presentation and navigation behavior.
- `src/ui/core/styles.css`: design tokens and semantic component rules.

## Required checks

```bash
pnpm run format:check
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm run storybook:build
```
