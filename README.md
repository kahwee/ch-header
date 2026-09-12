# ChHeader

ChHeader is a profile-based HTTP header editor for Chrome. It uses Manifest V3 and
`declarativeNetRequest`, so enabled profiles modify matching requests without a persistent
background page.

[![CI Status](https://github.com/kahwee/ch-header/workflows/ChHeader%20CI/badge.svg)](https://github.com/kahwee/ch-header/actions)
[![Coverage Status](https://coveralls.io/repos/github/kahwee/ch-header/badge.svg?branch=main)](https://coveralls.io/github/kahwee/ch-header?branch=main)

## What it does

- Groups request and response headers into reusable profiles.
- Targets all sites, a domain, wildcard patterns, or explicit regular expressions.
- Optionally limits a matcher to XHR, scripts, stylesheets, images, fonts, documents, or iframes.
- Keeps profiles searchable and individually enabled.
- Imports profiles or header collections from JSON.
- Uses native semantic CSS with no styling framework or runtime UI dependency.

## Install locally

Requirements:

- Node.js 25.1 or newer
- pnpm 11.24.0
- Chromium-based browser with Manifest V3 support

```bash
pnpm install
pnpm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select
the generated `dist` directory.

For active development, run:

```bash
pnpm run dev
```

Reload ChHeader from `chrome://extensions` after a rebuild.

## Using profiles

1. Select **New** and name the profile.
2. Add one or more request or response headers.
3. Add a matcher. An empty matcher applies everywhere.
4. Enable the profile and select **Apply**.

Matcher examples:

| Input                                 | Behavior                           |
| ------------------------------------- | ---------------------------------- |
| `api.example.com`                     | Matches the domain and its paths   |
| `*.api.example.com`                   | Matches API subdomains             |
| `example.com/api/*`                   | Matches paths below `/api/`        |
| `regex:^https://.*\.example\.com/api` | Uses the expression after `regex:` |

Headers are added when absent and replaced when already present.

## Development commands

| Command                    | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `pnpm run dev`             | Watch and rebuild the extension           |
| `pnpm run build`           | Create the production extension in `dist` |
| `pnpm run build:package`   | Build and package the extension ZIP       |
| `pnpm run typecheck`       | Run strict TypeScript checks              |
| `pnpm run test:run`        | Run the complete test suite once          |
| `pnpm run test:coverage`   | Generate coverage reports                 |
| `pnpm run format:check`    | Verify formatting                         |
| `pnpm run storybook`       | Start the component workbench             |
| `pnpm run storybook:build` | Build static Storybook output             |

Before opening a pull request, run:

```bash
pnpm run format:check
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm run storybook:build
```

## Architecture

```text
src/
├── background.ts                  service worker and DNR synchronization
├── manifest.json                  extension manifest
├── lib/
│   ├── dnr-rules.ts               profiles → declarativeNetRequest rules
│   ├── matcher.ts                 matcher parsing and validation
│   ├── storage.ts                 typed Chrome storage access
│   └── types.ts                   shared domain types
└── ui/
    ├── components/                pure HTML renderers and custom elements
    ├── lib/                       mounted component lifecycle classes
    ├── core/
    │   ├── controller.ts          DOM-free popup business logic
    │   ├── popup.ts               popup composition and application wiring
    │   ├── popup-elements.ts      typed DOM queries
    │   ├── popup-template.ts      top-level popup markup
    │   ├── profile-appearance.ts  avatar and color presentation
    │   ├── profile-colors.ts      stable stored color tokens
    │   ├── profile-list-view.ts   search and profile-list rendering
    │   ├── profile-keyboard-navigation.ts
    │   ├── dropdowns.ts           framework-free dropdown behavior
    │   └── styles.css             native design tokens and component CSS
    └── popup.html                 extension UI entry point
```

The core rule is separation by responsibility:

- Domain rules stay in `src/lib` and do not depend on the DOM.
- The controller owns mutations and orchestration, but not markup.
- Render modules return HTML and escape user-controlled values.
- Component classes own lifecycle and delegated row events.
- `popup.ts` wires those pieces to Chrome storage and browser events.

See [CONTRIBUTING.md](CONTRIBUTING.md) for code conventions and the verification checklist.

## Security notes

- Treat imported JSON and stored profile content as untrusted input.
- Escape values before inserting them into rendered HTML.
- Keep extension permissions minimal and review manifest changes carefully.
- Do not log header values; profiles may contain credentials.

## License

MIT
