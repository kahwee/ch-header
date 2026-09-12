# Contributing

## Setup

Use the exact package-manager version declared in `package.json`:

```bash
pnpm install --frozen-lockfile
pnpm run storybook
```

## Code conventions

- Keep TypeScript strict and avoid `any`. Narrow DOM and Chrome API values explicitly.
- Put domain behavior in `src/lib`, presentation behavior in `src/ui/core`, and reusable markup in
  `src/ui/components`.
- Use semantic class names and the tokens in `styles.css`. Do not add a CSS utility framework.
- Escape all user-controlled strings rendered into HTML.
- Preserve stored color-token values for backward compatibility.
- Use delegated events for repeated rows and clean up listeners owned by mounted components.

### Component files

- `*.render.ts` contains the single HTML renderer for a reusable component.
- The adjacent component entry point exposes the renderer to Storybook and other templates.
- `*.component.ts` adds lifecycle and interaction behavior when mounting is required.
- Tests live beside the responsibility they cover in `__tests__`.

Avoid assertions for incidental CSS declarations. Tests should verify semantic classes, accessible
attributes, escaped content, and behavior.

## Verification

Run this sequence before committing:

```bash
pnpm run format:check
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm run storybook:build
```

For UI changes, also inspect the actual toolbar popup at 744 × 440 and the Full Layout story. Check keyboard
navigation, dropdowns, profile search, editing controls, the enable toggle, and persistent Apply
action.

## Extension build

`pnpm run build` writes an unpacked extension to `dist`. Load that directory from
`chrome://extensions` to verify Chrome-specific storage and declarative rule behavior.

See [AGENTS.md](AGENTS.md) for shared contributor guidance and [TESTING.md](TESTING.md)
for the localhost fixture, execution record and release checklist.
