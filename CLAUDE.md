# ChHeader - Development Guide

## Project Overview

ChHeader is a profile-based HTTP header editor Chrome extension with Manifest V3 using declarativeNetRequest. It provides three levels of URL matching (simple, wildcard, regex) with intelligent resource type filtering and header modification logic.

**Tech Stack:**

- Runtime: Chrome Extension Manifest V3
- Language: TypeScript (strict mode, zero `any`)
- Styling: Tailwind CSS v4
- Testing: Vitest with 86 tests (38 dedicated to matcher format)
- UI: Vanilla DOM manipulation with template functions
- Build: esbuild with watch mode

**Key Stats:**

- 106 tests passing (38 matcher, 20 matcher-row, 30 UI, 12 DNR, 6 types)
- Zero `any` types in codebase
- Fully typed Chrome API usage
- 21 Tailwind profile colors

## Quick Start

```bash
# Install dependencies
npm install

# Development with watch mode
npm run dev

# Run tests
npm run test

# Test UI mode
npm run test:ui

# Run Storybook
npm run storybook

# Build for production
npm run build

# Format and type check
npm run format
npm run typecheck
```

## Architecture

### Separation of Concerns

- **popup.ts**: Runtime event handling and DOM manipulation only
- **controller.ts**: Pure business logic with no DOM dependencies (fully testable)
- **popup-template.ts**: Reusable template functions for consistent UI
- **matcher.ts**: Matcher format parsing and validation
- **background.ts**: Service worker for DNR rule management

### Core Concepts

#### 1. Matcher Format System (Three Levels)

**Simple Format (Default)**

- User types: `localhost:3002`
- Automatically matches all paths on that domain
- Empty matcher means "all domains"

**Wildcard Format (Intermediate)**

- User types: `localhost:300*`
- Converts `*` to wildcard matching
- Examples: `*.api.example.com`, `example.com/api/*`

**Regex Format (Advanced)**

- User types: `regex:localhost:30(0[0-9])`
- Full regex support after `regex:` prefix
- Most powerful option for complex patterns

**Auto-Detection:**
The system automatically detects which format based on:

- Contains `regex:` prefix → Regex format
- Contains `*` → Wildcard format
- Otherwise → Simple format

#### 2. Resource Type Filtering

When creating matchers, users can filter by request type:

- All request types (default)
- XHR/Fetch (AJAX requests)
- Scripts (JavaScript files)
- Stylesheets (CSS)
- Images
- Fonts
- Documents (full page loads)
- Iframes

#### 3. Header Operations

Headers use intelligent set/replace logic:

- If header doesn't exist → add it (set operation)
- If header exists → replace value (replace operation)
- This keeps UI simple while handling both cases

#### 4. Smart Defaults

- Empty URL filter → applies to all domains
- Empty resource types → applies to all request types
- Checkbox to enable/disable headers individually

## File Structure

```
src/
├── manifest.json                  # Extension manifest V3
├── background.ts                  # Service worker
├── ui/
│   ├── popup.html                # Popup HTML
│   ├── popup.ts                  # Runtime event handling
│   ├── popup-template.ts         # Template functions (exports getPopupTemplate, profileListItem, customCheckbox)
│   ├── controller.ts             # Business logic (fully testable, no DOM)
│   ├── utils.ts                  # Utilities (escapeHtml, color helpers)
│   ├── styles.css                # Tailwind v4 styles
│   ├── components/               # Reusable UI components
│   │   ├── button.ts             # Action button with multiple variants
│   │   ├── matcher-row.ts        # Matcher row template
│   │   ├── header-row.ts         # Header row template
│   │   └── avatar.ts             # Avatar component
│   ├── __tests__/
│   │   ├── matcher-row.test.ts   # 20 component tests
│   │   └── popup.ui.test.ts      # 30 UI integration tests
│   └── stories/                  # Storybook stories
├── lib/
│   ├── types.ts                  # TypeScript definitions
│   ├── matcher.ts                # Matcher format system
│   ├── dnr-rules.ts              # DNR rule generation
│   ├── storage.ts                # Chrome storage API
│   └── __tests__/
│       ├── matcher.test.ts       # 38 matcher format tests
│       ├── dnr-rules.test.ts     # 12 DNR rule tests
│       └── types.test.ts         # 6 type tests
└── icons/                         # Extension icons (16, 32, 128px)
```

## Key Components

### PopupController (src/ui/controller.ts)

Business logic layer with no DOM dependencies. Handles:

- Profile CRUD operations
- Header management
- Matcher operations
- Profile selection and filtering
- State management

**Key Methods:**

- `onNewProfile()` - Create new profile
- `onAddHeader(isRequest)` - Add header to profile
- `onAddMatcher()` - Add URL matcher
- `onMatcherChange(id, field, value)` - Update matcher
- `onHeaderChange(id, isRequest, field, value)` - Update header
- `onProfileEnabledChange(checked)` - Enable/disable profile
- `onSearchChange(query)` - Filter profiles by search

### Popup Template (src/ui/popup-template.ts)

Reusable template functions for consistent UI:

```typescript
export function getPopupTemplate(): string        // Main extension UI
export function profileListItem(p, isActive): string  // Profile list items
export function customCheckbox(options): string   // Checkbox wrapper
```

**Component templates** (in src/ui/components/):
- `button.ts`: `actionButton()` - Flexible button with variants (primary, secondary, danger, delete)
- `matcher-row.ts`: `matcherRow()` - URL matcher row with resource type filter
- `header-row.ts`: `headerRow()` - Header name/value input row
- `avatar.ts`: `renderAvatar()` - Profile avatar display

All functions return HTML strings for flexible rendering and testability.

### Matcher System (src/lib/matcher.ts)

Validates and parses matcher formats:

```typescript
function getMatcherFormat(pattern: string): MatcherFormat
function isValidMatcher(pattern: string): boolean
function matchesSimple(pattern: string, url: string): boolean
function matchesWildcard(pattern: string, url: string): boolean
function matchesRegex(pattern: string, url: string): boolean
```

## Testing

### Test Organization

**106 tests total across 5 test files:**

- **38 matcher tests** (`src/lib/__tests__/matcher.test.ts`)
  - 13 tests for simple format
  - 13 tests for wildcard format
  - 12 tests for regex format
- **20 matcher-row tests** (`src/ui/__tests__/matcher-row.test.ts`)
  - Basic rendering, URL filtering, resource types, styling, accessibility
- **30 UI tests** (`src/ui/__tests__/popup.ui.test.ts`)
  - Integration tests for popup functionality
- **12 DNR rule tests** (`src/lib/__tests__/dnr-rules.test.ts`)
  - Rule generation and validation
- **6 type tests** (`src/lib/__tests__/types.test.ts`)
  - Type definitions validation

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# UI mode
npm run test:ui

# Coverage report
npm run test -- --coverage
```

## Color Scheme

Primary color: **Blue-500** (`#3b82f6`)
Secondary color: **Stone** (for neutral elements)

Available profile colors (21 Tailwind colors):
Red, Orange, Amber, Yellow, Lime, Green, Emerald, Teal, Cyan, Sky, Blue, Indigo, Violet, Purple, Fuchsia, Pink, Rose, Gray, Zinc, Neutral, Stone

## Development Workflow

1. **Feature Development**

   ```bash
   npm run dev              # Start watch mode
   npm run test:ui          # Run tests in UI
   npm run storybook        # Preview components
   ```

2. **Before Commit**

   ```bash
   npm run typecheck        # Type safety
   npm run format           # Code formatting
   npm run test             # Full test suite
   ```

3. **Production Build**
   ```bash
   npm run build            # Creates dist/
   ```

## Chrome Extension Loading

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Key Implementation Details

### FNV-1a Hash for DNR Rule IDs

The extension generates unique rule IDs using FNV-1a hashing from profile data. This ensures:

- Consistent IDs across runs
- Collision-resistant IDs
- Deterministic rule generation

### Storage Format

Profiles stored in `chrome.storage.local`:

```typescript
interface Profile {
  id: string // UUID
  name: string
  color: string // Hex color
  enabled: boolean
  notes: string
  matchers: Array<{
    id: string
    urlFilter: string // Simple, wildcard, or regex format
    resourceTypes: string[] // Empty = all types
  }>
  requestHeaders: Array<{
    id: string
    header: string
    value: string
    enabled?: boolean
  }>
  responseHeaders: Array<{
    id: string
    header: string
    value: string
    enabled?: boolean
  }>
}
```

### State Structure (src/ui/controller.ts)

```typescript
interface State {
  profiles: Profile[] // All profiles
  filtered: Profile[] // Search-filtered profiles
  current: Profile | null // Selected profile
  activeId: string | null // Currently enabled profile
}
```

## Common Tasks

### Adding a New Matcher Format Level

1. Update `matcher.ts` with new format detection
2. Add validation logic
3. Create tests in `matcher.test.ts`
4. Update documentation
5. Test with real Chrome extension

### Adding a New Resource Type Option

1. Update `PopupElements` interface in `popup.ts` (if needed)
2. Add option to matcher row in `popup-template.ts`
3. Update controller logic in `controller.ts` if needed
4. Add tests in `matcher.test.ts`
5. Update README.md with new type description

### Styling Changes

All styles use Tailwind v4:

- Primary buttons: `bg-blue-500 hover:bg-blue-400`
- Secondary buttons: `bg-stone-700 hover:bg-stone-600`
- Inputs: `bg-white/5 outline-1 outline-gray-700 focus:outline-blue-500`
- Consistent gap and padding utilities

## Troubleshooting

### Tests Failing

```bash
# Clean rebuild
rm -rf dist node_modules
npm install
npm run build
npm run test
```

### Extension Not Loading

1. Ensure `npm run build` completed successfully
2. Check `dist/manifest.json` exists
3. Verify in `chrome://extensions/` that extension is loaded
4. Check browser console for errors

### Matcher Not Matching

1. Verify pattern format is correct:
   - Simple: just domain (no special chars unless intended as regex)
   - Wildcard: must contain `*` and no `regex:` prefix
   - Regex: must start with `regex:`
2. Test with `npm run test` - matcher tests validate patterns
3. Check Chrome DevTools Network tab to see actual request URLs

## Performance Considerations

- Matcher validation happens on profile save, not on every request
- DNR rules are static - no runtime pattern matching
- Template functions are efficient string building
- State updates are minimal and focused

## Future Improvements

- [ ] Pattern suggestions/autocomplete
- [ ] Visual pattern tester with real URLs
- [ ] Profile import/export
- [ ] Keyboard shortcuts for quick switching
- [ ] Dark/light theme toggle
- [ ] Matcher validation with helpful error messages

## References

- [Chrome Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Chrome Extension Types](https://www.npmjs.com/package/@types/chrome)

## License

MIT
