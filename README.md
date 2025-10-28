# ChHeader

A profile-based HTTP header editor Chrome extension with Manifest V3 using declarativeNetRequest and advanced matcher format support.

## Features

- **Profile Management**: Create and manage multiple header profiles with custom colors
- **Advanced URL Matchers**: Three levels of matching complexity:
  - **Simple**: Just type a domain (e.g., `localhost:3002`)
  - **Wildcard**: Use `*` for flexible patterns (e.g., `localhost:300*`)
  - **Regex**: Full regex support with `regex:` prefix (e.g., `regex:localhost:30(0[0-9])`)
- **Resource Type Filtering**: Apply headers to specific request types (XHR/Fetch, Scripts, Stylesheets, Images, Fonts, Documents, Iframes)
- **Request & Response Headers**: Modify both request and response headers with intelligent set/replace logic
- **Beautiful UI**: Modern interface with search, profile switching, and quick identification via colors
- **Live Rules**: Changes apply instantly using Chrome's declarativeNetRequest API
- **Smart Defaults**: Empty matcher applies to all domains and request types

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

1. Click **New** to create a new profile
2. Enter a profile name, select a color (21 Tailwind colors available for quick identification), and optional notes
3. Add matchers to specify which sites the headers apply to
4. Add request and/or response headers
5. Toggle **Enable this profile** and click **Apply** to activate

### URL Matchers - Three Levels

#### Level 1: Simple (Default)

Perfect for most users. Just type a domain and it automatically matches all paths:

```
localhost:3002         → Matches localhost:3002 and all paths
api.example.com        → Matches api.example.com and all paths
```

Leave empty to match **all domains**.

#### Level 2: Wildcard (Intermediate)

Use `*` to match any characters:

```
localhost:300*         → Matches localhost:3000-3009
*.api.example.com      → Matches all subdomains of api.example.com
example.com/api/*      → Matches only /api/* paths
```

#### Level 3: Regex (Advanced)

Use `regex:` prefix for full regex support:

```
regex:localhost:30(0[0-9])           → Matches localhost:3000-3009
regex:(staging|prod)\.example\.com   → Matches staging or prod
regex:^https://.*\.example\.com/api  → Protocol and path specific
```

### Resource Type Filtering

Control which types of requests are affected:

- **All request types** (default)
- **XHR/Fetch** - AJAX requests
- **Scripts** - JavaScript files
- **Stylesheets** - CSS files
- **Images** - Image requests
- **Fonts** - Font files
- **Documents** - Full page loads
- **Iframes** - Embedded frames

### Header Operations

Headers use intelligent set/replace logic:

- If the header doesn't exist, it's added (set)
- If the header exists, it's replaced with the new value
- This keeps the UI simple while handling both cases automatically

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
│   ├── components/           # Reusable UI components
│   │   ├── button.ts         # Action button component
│   │   ├── matcher-row.ts    # Matcher row template
│   │   ├── header-row.ts     # Header row template
│   │   ├── avatar.ts         # Avatar component
│   │   └── checkbox-element.ts
│   ├── __tests__/            # UI component tests
│   │   ├── matcher-row.test.ts
│   │   └── popup.ui.test.ts
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

### Key Files

- **background.ts**: Service worker that manages declarativeNetRequest rules and enforces matcher format validation
- **popup.ts**: Runtime event handling and DOM manipulation
- **controller.ts**: Business logic for profile and header management (fully testable, no DOM dependencies)
- **matcher.ts**: Matcher format parsing and validation with three levels (simple/wildcard/regex)
- **popup-template.ts**: Reusable template functions for building the UI consistently
- **styles.css**: Tailwind v4 with custom theme colors (blue-500 primary, stone secondary)

## Technical Details

### Manifest V3 Features

- Uses `declarativeNetRequest` API for header modification with FNV-1a hash-based rule IDs
- Service worker for background processing
- `chrome.storage.local` for persistent profile storage
- `chrome.runtime.sendMessage` for popup-to-background communication

### Type Safety

- Full TypeScript implementation with strict mode (`strict: true`)
- `@types/chrome` for Chrome API types
- Zero `any` types - fully typed codebase
- Generic types for reusable components

### Matcher Format System

The matcher system provides three levels of complexity to balance user-friendliness with power:

1. **Format Auto-Detection**: The system automatically detects which format you're using
2. **Validation**: Invalid patterns are caught before creating DNR rules
3. **Testing**: Comprehensive test suite with 38 dedicated matcher tests
4. **Documentation**: Includes testing guides and quick reference

### Architecture

- **Separation of Concerns**: UI (popup.ts) is separate from business logic (controller.ts)
- **Testability**: Controller has no DOM dependencies, making it fully unit-testable
- **Composability**: Template functions create consistent UI components
- **State Management**: Central state object with clear structure

## License

MIT
