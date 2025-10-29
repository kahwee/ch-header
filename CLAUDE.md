# ChHeader - Development Guide

## Project Overview

ChHeader is a profile-based HTTP header editor Chrome extension with Manifest V3 using declarativeNetRequest. It provides three levels of URL matching (simple, wildcard, regex) with intelligent resource type filtering and header modification logic.

**Tech Stack:**

- Runtime: Chrome Extension Manifest V3
- Language: TypeScript (strict mode, zero `any`)
- Styling: Tailwind CSS v4
- Testing: Vitest with 304 tests across 12 files
- UI: Component Pattern with vanilla DOM and template functions
- Build: esbuild with watch mode

**Key Stats:**

- 304 tests passing across 12 test files
- Zero `any` types in codebase
- Fully typed Chrome API usage
- 21 Tailwind profile colors
- Component Pattern architecture with lifecycle management

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

### File Naming Convention

The project uses a consistent naming convention across UI components to maintain clarity and DRY principles:

**Pattern:**
```
{name}.render.ts    = Shared HTML builder function (single source of truth)
{name}.ts           = Template function in components/ (delegates to .render)
{name}.component.ts = Interactive Component class (lifecycle management)
{name}.component.test.ts = Component tests
```

**Examples:**

- `matcher-row.render.ts` - Shared `buildMatcherRowHTML()` function (single source of truth)
  - Used by both the component class and template function
  - Handles HTML generation, escaping, and conditional rendering

- `src/ui/components/matcher-row.ts` - Template function
  - Imports from `matcher-row.render.ts`
  - Delegates to `buildMatcherRowHTML()` for HTML generation
  - Exported for use in Storybook stories

- `src/ui/lib/matcher-row.component.ts` - Interactive component class
  - Extends `Component` base class
  - Imports from `matcher-row.render.ts`
  - Handles event listeners and state management
  - Can be mounted to DOM with lifecycle management

- `src/ui/lib/__tests__/matcher-row.component.test.ts` - Component tests
  - Tests the interactive component class
  - Tests event handling, rendering, and updates

**Benefits:**
- Clear separation between shared rendering logic (`.render.ts`) and component implementations
- Both template functions and component classes use the same HTML builder
- Eliminates duplication of HTML markup
- Easy to identify file purposes at a glance
- `.component.ts` suffix clearly indicates a Component class with lifecycle management

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
│   ├── popup.ts                  # Runtime event handling and component management
│   ├── popup-template.ts         # Template functions (getPopupTemplate, profileListItem, customCheckbox)
│   ├── controller.ts             # Business logic (fully testable, no DOM)
│   ├── utils.ts                  # Utilities (escapeHtml, color helpers)
│   ├── styles.css                # Tailwind v4 styles
│   ├── components/               # Reusable UI template functions
│   │   ├── button.ts             # Action button with variants
│   │   ├── matcher-row.ts        # Matcher row template
│   │   ├── header-row.ts         # Header row template
│   │   ├── avatar.ts             # Avatar component
│   │   └── checkbox-element.ts   # Custom checkbox element
│   ├── lib/                      # Component classes (Component Pattern)
│   │   ├── component.ts          # Base Component class (lifecycle management)
│   │   ├── matcher-row.render.ts # Shared buildMatcherRowHTML() function
│   │   ├── matcher-row.component.ts     # MatcherRowComponent
│   │   ├── header-row.render.ts  # Shared buildHeaderRowHTML() function
│   │   ├── header-row.component.ts      # HeaderRowComponent
│   │   ├── matcher-table-component.ts   # MatcherTableComponent (manages multiple matchers)
│   │   ├── header-table-component.ts    # HeaderTableComponent (manages multiple headers)
│   │   ├── profile-card-component.ts    # ProfileCard (example component)
│   │   └── __tests__/
│   │       ├── component.test.ts        # 30 tests for base Component class
│   │       ├── matcher-row.component.test.ts    # 30 tests
│   │       ├── header-row.component.test.ts     # 37 tests
│   │       ├── matcher-table-component.test.ts  # 25 tests
│   │       ├── header-table-component.test.ts   # 23 tests
│   │       └── profile-card-component.test.ts   # 38 tests
│   ├── __tests__/
│   │   ├── matcher-row.test.ts   # 20 template function tests
│   │   ├── popup.ui.test.ts      # 30 UI integration tests
│   │   └── controller.test.ts     # 15 controller tests
│   └── stories/                  # Storybook component stories
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

## Component Pattern Architecture

The UI layer uses a lightweight Component Pattern for managing lifecycle, rendering, and event handling. This pattern eliminates scattered DOM manipulation and provides clear separation between data and presentation.

### Base Component Class (src/ui/lib/component.ts)

Abstract base class providing lifecycle management:

```typescript
abstract class Component {
  constructor(id: string)
  abstract render(): string
  protected abstract setupHandlers(): void
  mount(container: HTMLElement): void // Render and attach to DOM
  updateContent(html: string): void // Update without re-mounting
  unmount(): void // Cleanup and remove from DOM
  isMounted(): boolean
  getElement(): HTMLElement | null
  protected on(eventType: string, selector: string, handler: EventListener): void
}
```

**Key Features:**

- Event delegation for dynamic elements
- Automatic listener cleanup on unmount
- updateContent() preserves element reference for stateful inputs
- Fully testable without browser

### Component Hierarchy

**MatcherRowComponent** (src/ui/lib/matcher-row.component.ts)

- Renders single matcher row with URL filter and resource type filter
- Uses shared `buildMatcherRowHTML()` from `matcher-row.render.ts`
- Callbacks: onChange (urlFilter, types), onDelete
- Auto-converts empty string to "\*" for "all domains"

**MatcherTableComponent** (src/ui/lib/matcher-table-component.ts)

- Manages multiple MatcherRowComponent instances in a table
- Smart mounting/updating/unmounting based on data changes
- Preserves component instances across re-renders

**HeaderRowComponent** (src/ui/lib/header-row.component.ts)

- Renders single header row with name, value, enabled checkbox
- Uses shared `buildHeaderRowHTML()` from `header-row.render.ts`
- Tracks request vs response via isRequest parameter
- Callbacks: onChange (header, value, enabled), onDelete

**HeaderTableComponent** (src/ui/lib/header-table-component.ts)

- Manages multiple HeaderRowComponent instances in a table
- Separate instances for request and response headers
- Same smart lifecycle management as MatcherTableComponent

**ProfileCard** (src/ui/lib/profile-card-component.ts)

- Example component demonstrating pattern usage
- Interactive profile card with actions (select, duplicate, delete)

### Integration in popup.ts

Components are instantiated in load() function and re-rendered in update cycles:

```typescript
let matcherList: MatcherListComponent
let headerListReq: HeaderListComponent
let headerListRes: HeaderListComponent

// In load():
matcherList = new MatcherListComponent(el.matchers, {
  onChange: (id, field, value) => controller.onMatcherChange(id, field, value),
  onDelete: (id) => controller.onRemoveMatcher(id),
})

// In render cycle:
function renderMatchers(): void {
  if (matcherList) matcherList.render(state.current?.matchers || [])
}
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
export function getPopupTemplate(): string // Main extension UI
export function profileListItem(p, isActive): string // Profile list items
export function customCheckbox(options): string // Checkbox wrapper
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

**304 tests total across 12 test files:**

**Component Tests (183 tests):**

- **30 tests** - Component base class (lifecycle, mount/unmount, event delegation)
- **30 tests** - MatcherRowComponent (rendering, event handling, updates, edge cases)
- **37 tests** - HeaderRowComponent (checkbox, header/value fields, enabled state)
- **25 tests** - MatcherListComponent (smart mounting, updates, unmounting)
- **23 tests** - HeaderListComponent (request/response separation, list management)
- **38 tests** - ProfileCard component (example component, actions, state)

**UI & Controller Tests (65 tests):**

- **20 tests** - Template functions (matcher-row.test.ts)
- **30 tests** - UI integration (popup.ui.test.ts)
- **15 tests** - Controller business logic (controller.test.ts)

**Core Library Tests (56 tests):**

- **38 tests** - Matcher format system (simple/wildcard/regex)
- **12 tests** - DNR rule generation and validation
- **6 tests** - Type definitions validation

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

## Type Safety Guidelines

The codebase maintains **zero `any` types** through disciplined typing practices:

### Generic Components

Component classes use generics for flexible data types without relying on `any`:

```typescript
// ✅ Good - generic with constraint, reusable
abstract class Component<T extends { id: string }> {
  protected data: T
}

// ❌ Avoid - uses any
abstract class Component {
  protected data: any
}
```

### Callback Interfaces

All component callbacks are explicitly typed:

```typescript
// ✅ Good - callback types are clear
export interface MatcherRowCallbacks {
  onChange: (id: string, field: 'urlFilter' | 'types', value: string) => void
  onDelete: (id: string) => void
}

// ❌ Avoid - implicit parameter types
const onChange = (id, field, value) => { ... }
```

### Event Handler Types

Cast DOM events to specific types rather than leaving as `any`:

```typescript
// ✅ Good - specific type
this.on('change', '[data-role="enabled"]', (e) => {
  const checked = (e.target as HTMLInputElement).checked
})

// ❌ Avoid - implicit typing
this.on('change', '[data-role="enabled"]', (e: any) => {
  const checked = e.target.checked
})
```

### Union Types for Options

Use discriminated unions for complex options:

```typescript
// ✅ Good - type-safe variants
type ButtonVariant = 'primary' | 'secondary' | 'danger'
interface ButtonOptions {
  id: string
  variant: ButtonVariant
  text?: string
  icon?: string
}

// ❌ Avoid - object with any properties
interface ButtonOptions {
  [key: string]: any
}
```

### Null Safety

Always be explicit about nullable types:

```typescript
// ✅ Good - clear when something could be null
const component: MatcherRowComponent | undefined = this.matchers.get(id)
if (component) { ... }

// ❌ Avoid - implicit null
const component: any = this.matchers.get(id)
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
