# ChHeader

A profile-based HTTP header editor for Chrome using Manifest V3 and declarativeNetRequest.

[![CI Status](https://github.com/kahwee/ch-header/workflows/ChHeader%20CI/badge.svg)](https://github.com/kahwee/ch-header/actions)
[![Coverage Status](https://coveralls.io/repos/github/kahwee/ch-header/badge.svg?branch=main)](https://coveralls.io/github/kahwee/ch-header?branch=main)

## Features

- Multiple header profiles with search and filtering
- Three matcher formats: simple domains, wildcards, and regex patterns
- Apply headers to specific request types (XHR, scripts, stylesheets, images, fonts, documents, iframes)
- Modify request and response headers
- Profile colors for quick identification
- Declarative rules for immediate application

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Build the extension

```bash
npm run build
```

### 3. Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

### 4. Development mode

```bash
npm run dev
```

Watch mode builds the extension automatically. Reload the extension in `chrome://extensions/` to see changes.

## Usage

### Creating a Profile

1. Click **New** to create a profile
2. Enter a profile name, optional notes, and select a color
3. Add matchers to specify which URLs the headers apply to
4. Add request and/or response headers
5. Toggle **Enable this profile** and click **Apply**

### URL Matchers

The extension supports three matcher formats:

**Simple Format**

Type a domain to match that domain and all its paths:

```
localhost:3002         → localhost:3002 and all paths
api.example.com        → api.example.com and all paths
```

Empty matcher applies to all domains.

**Wildcard Format**

Use `*` for flexible matching:

```
localhost:300*         → localhost:3000-3009
*.api.example.com      → All subdomains
example.com/api/*      → Only /api/* paths
```

**Regex Format**

Use `regex:` prefix for regular expressions:

```
regex:localhost:30(0[0-9])
regex:(staging|prod)\.example\.com
regex:^https://.*\.example\.com/api
```

### Request Type Filtering

Headers can be filtered by request type:

- All request types (default)
- XHR/Fetch
- Scripts
- Stylesheets
- Images
- Fonts
- Documents
- Iframes

### Header Modification

Headers are added if they don't exist, or replaced if they do. Both request and response headers are supported.

## Development

### Code Quality

```bash
# Type checking
npm run typecheck

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Run tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run Storybook for component testing
npm run storybook
```

### Project Structure

```
src/
├── manifest.json              # Extension manifest (V3)
├── background.ts              # Service worker with DNR rule management
├── ui/
│   ├── popup.html            # Popup UI
│   ├── popup.ts              # Popup UI logic and event handlers
│   ├── popup-template.ts      # Shared template functions
│   ├── controller.ts          # Business logic controller (testable)
│   ├── utils.ts              # Utility functions (escapeHtml, color helpers)
│   ├── styles.css            # Tailwind v4 styles
│   ├── components/           # Reusable UI template functions
│   │   ├── button.ts         # Action button template
│   │   ├── matcher-row.ts    # Matcher row template (uses matcher-row.render.ts)
│   │   ├── header-row.ts     # Header row template (uses header-row.render.ts)
│   │   ├── avatar.ts         # Avatar component
│   │   └── checkbox-element.ts # Custom checkbox element
│   ├── lib/                  # Component classes and shared rendering
│   │   ├── component.ts      # Base Component class (lifecycle management)
│   │   ├── matcher-row.render.ts  # Shared buildMatcherRowHTML() function
│   │   ├── matcher-row.component.ts # MatcherRowComponent
│   │   ├── header-row.render.ts    # Shared buildHeaderRowHTML() function
│   │   ├── header-row.component.ts # HeaderRowComponent
│   │   ├── matcher-list-component.ts # MatcherListComponent
│   │   ├── header-list-component.ts  # HeaderListComponent
│   │   ├── profile-card-component.ts # ProfileCard
│   │   └── __tests__/        # Component tests
│   │       ├── component.test.ts
│   │       ├── matcher-row.component.test.ts
│   │       ├── header-row.component.test.ts
│   │       ├── matcher-list-component.test.ts
│   │       ├── header-list-component.test.ts
│   │       └── profile-card-component.test.ts
│   ├── __tests__/            # UI tests
│   │   ├── matcher-row.test.ts
│   │   ├── popup.ui.test.ts
│   │   └── controller.test.ts
│   └── stories/              # Storybook component stories
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── matcher.ts            # Matcher format parsing and validation
│   ├── dnr-rules.ts          # DNR rule generation
│   ├── storage.ts            # Chrome storage management
│   └── __tests__/            # Library tests
│       ├── matcher.test.ts   # 38 matcher format tests
│       ├── dnr-rules.test.ts # DNR rule tests
│       └── types.test.ts     # Type validation tests
└── icons/                    # Extension icons (16, 32, 128px PNGs)
```

### File Naming Convention

The codebase uses a consistent naming convention for UI components:

- **`{name}.render.ts`** - Shared HTML builder function (single source of truth)
  - Example: `matcher-row.render.ts` exports `buildMatcherRowHTML()`
  - Used by both template functions and component classes

- **`{name}.ts`** (in `components/`) - Template function for Storybook
  - Example: `components/matcher-row.ts` imports from `matcher-row.render.ts`
  - Delegates to the shared builder function

- **`{name}.component.ts`** (in `lib/`) - Interactive Component class
  - Example: `lib/matcher-row.component.ts` extends `Component` base class
  - Handles event listeners and lifecycle management

- **`{name}.component.test.ts`** - Component tests
  - Tests the interactive component behavior

## Implementation

### APIs Used

- `declarativeNetRequest` for header modification
- `chrome.storage.local` for profile persistence
- `chrome.runtime.sendMessage` for inter-process communication
- Service worker for background processing

### Code Structure

- **popup.ts**: UI event handling and DOM manipulation
- **controller.ts**: Business logic (no DOM dependencies, fully testable)
- **matcher.ts**: Matcher format parsing and validation
- **dnr-rules.ts**: Declarative rule generation
- **background.ts**: Service worker for rule management

### Language & Type Safety

- TypeScript with strict mode
- Zero `any` types
- Full Chrome API type definitions

## License

MIT
