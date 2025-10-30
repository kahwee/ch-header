# ChHeader: Specific Examples of Inconsistencies

## Example 1: Menu Items - Hardcoded vs Component Approach

### Current Implementation (Hardcoded - popup-template.ts lines 160-165)

```html
<button
  type="button"
  data-action="importHeaders"
  class="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-hidden"
  title="Import headers from JSON"
>
  Import headers
</button>
<button
  type="button"
  data-action="importProfile"
  class="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-hidden"
  title="Import entire profile from JSON"
>
  Import profile
</button>
<button
  type="button"
  data-action="duplicate"
  class="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-hidden"
>
  Duplicate
</button>
<button
  type="button"
  data-action="delete"
  class="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300 focus:bg-white/5 focus:text-white focus:outline-hidden"
>
  Delete
</button>
```

**Problems:**

- 44 lines of repetitive HTML
- 4 identical buttons with different text and action
- Delete button has special red styling but no pattern abstraction
- No reusability - pattern would need to be copied for other menus

**Story Gap:** No MenuItem.stories.ts to document this pattern

### Ideal Component Implementation

**File: src/ui/components/menu-item.ts**

```typescript
export interface MenuItemOptions {
  label: string
  action: string
  title?: string
  variant?: 'default' | 'delete'
}

export function menuItem(opts: MenuItemOptions): string {
  const variantClasses =
    opts.variant === 'delete' ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'

  const titleAttr = opts.title ? `title="${opts.title}"` : ''

  return `
    <button 
      type="button" 
      data-action="${opts.action}" 
      ${titleAttr}
      class="block w-full px-4 py-2 text-left text-sm ${variantClasses} hover:bg-white/5 focus:bg-white/5 focus:outline-hidden"
    >
      ${opts.label}
    </button>
  `
}
```

**Usage in popup-template.ts:**

```typescript
<div class="py-1">
  ${menuItem({ label: 'Import headers', action: 'importHeaders', title: 'Import headers from JSON' })}
  ${menuItem({ label: 'Import profile', action: 'importProfile', title: 'Import entire profile from JSON' })}
  ${menuItem({ label: 'Duplicate', action: 'duplicate' })}
  ${menuItem({ label: 'Delete', action: 'delete', variant: 'delete' })}
</div>
```

**Story: src/ui/stories/MenuItem.stories.ts**

```typescript
export const Default: Story = {
  args: {
    label: 'Export',
    action: 'export',
  },
}

export const DeleteVariant: Story = {
  args: {
    label: 'Delete',
    action: 'delete',
    variant: 'delete',
  },
}

export const WithTitle: Story = {
  args: {
    label: 'Import headers',
    action: 'importHeaders',
    title: 'Import headers from JSON',
  },
}
```

---

## Example 2: Avatar Button - Multiple Issues

### Current Implementation (popup-template.ts lines 145-147)

```html
<button
  id="profileAvatarBtn"
  type="button"
  popovertarget="colorPickerPopover"
  class="flex shrink-0 items-center justify-center w-8 h-8 rounded-md font-semibold text-white text-sm font-mono focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer transition-all border border-white/10 hover:border-white/20 group"
  style="background-color: #7e22ce;"
  title="Click to choose color"
>
  <span id="profileAvatarInitials" style="text-shadow: 0 1px 3px rgba(0,0,0,0.5);">P</span>
</button>
```

**Problems:**

1. Not using solidButton() component
2. 18 Tailwind classes hardcoded
3. Uses inline `style` for background color (could use CSS variables)
4. Uses inline `style` for text-shadow (inconsistent with renderAvatar approach)
5. No isolated story showing just this button
6. Duplicates styling patterns from renderAvatar()

### Compare to renderAvatar (src/ui/components/avatar.ts)

```typescript
export function renderAvatar(character: string, backgroundColor: string): string {
  return `<div class="flex size-8 flex-none items-center justify-center rounded-md font-semibold text-white text-sm font-mono" style="background-color: ${backgroundColor}">
    <span style="text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${escapeHtml(character)}</span>
  </div>`
}
```

**Inconsistencies:**

- Avatar button adds 8 extra classes for focus/hover/border
- Avatar button has `popovertarget` attribute
- renderAvatar uses `size-8` but button uses `w-8 h-8`
- Same text-shadow applied both ways but inconsistent code organization

### Ideal Component Implementation

**File: src/ui/components/avatar-button.ts**

```typescript
export interface AvatarButtonOptions {
  id: string
  character: string
  backgroundColor: string
  popoverTarget: string
  title: string
}

export function avatarButton(opts: AvatarButtonOptions): string {
  return `
    <button 
      id="${opts.id}" 
      type="button" 
      popovertarget="${opts.popoverTarget}"
      class="flex shrink-0 items-center justify-center w-8 h-8 rounded-md font-semibold text-white text-sm font-mono focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer transition-all border border-white/10 hover:border-white/20"
      style="background-color: ${opts.backgroundColor};"
      title="${opts.title}"
    >
      <span style="text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${escapeHtml(opts.character)}</span>
    </button>
  `
}
```

**Story: src/ui/stories/AvatarButton.stories.ts**

```typescript
export const Default: Story = {
  args: {
    id: 'profileAvatarBtn',
    character: 'P',
    backgroundColor: '#7e22ce',
    popoverTarget: 'colorPickerPopover',
    title: 'Click to choose color',
  },
}

export const WithEmoji: Story = {
  args: {
    id: 'profileAvatarBtn',
    character: '😀',
    backgroundColor: '#3b82f6',
    popoverTarget: 'colorPickerPopover',
    title: 'Click to choose color',
  },
}
```

---

## Example 3: Options Menu Button - Missing Pattern

### Current Implementation (popup-template.ts lines 152-157)

```html
<button
  type="button"
  class="inline-flex items-center gap-x-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer transition-colors"
>
  Options
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    class="-mr-1 size-5 text-gray-400"
  >
    <path
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clip-rule="evenodd"
      fill-rule="evenodd"
    />
  </svg>
</button>
```

**Problems:**

1. Could be solidButton() variant but uses custom classes instead
2. No story showing menu toggle button pattern
3. SVG dropdown indicator duplicated (could be extracted)
4. Uses `el-dropdown` web component but pattern not documented

### Similar Pattern in solidButton vs This

**solidButton secondary variant (similar styling):**

```
bg-stone-700 text-text hover:bg-stone-600
```

**Menu button classes:**

```
bg-white/10 ... hover:bg-white/20 ... transition-colors
```

**Why different?** No documented reason - likely just wasn't extracted.

### Ideal Implementation

**File: src/ui/components/menu-button.ts**

```typescript
export interface MenuButtonOptions {
  text: string
  id?: string
  title?: string
}

export function menuButton(opts: MenuButtonOptions): string {
  const idAttr = opts.id ? `id="${opts.id}"` : ''
  const titleAttr = opts.title ? `title="${opts.title}"` : ''

  return `
    <button 
      type="button" 
      ${idAttr}
      ${titleAttr}
      class="inline-flex items-center gap-x-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer transition-colors"
    >
      ${opts.text}
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="-mr-1 size-5 text-gray-400">
        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
      </svg>
    </button>
  `
}
```

---

## Example 4: Layout Inconsistency - Table vs Flex

### Header Rows (Uses Table - header-row.render.ts lines 26-65)

```typescript
return `
  <tr class="hover:bg-white/3 transition-colors" data-hid="${h.id}" data-kind="${kind}">
    <td class="text-sm whitespace-nowrap sm:pl-0 w-8 items-center justify-center pb-px">
      <ch-checkbox ...></ch-checkbox>
    </td>
    <td class="text-sm pb-px">
      <div class="grid grid-cols-2">
        <div>
          <input class="..." ... />
        </div>
        <div>
          <input class="..." ... />
        </div>
      </div>
    </td>
    <td class="text-sm whitespace-nowrap sm:pr-0 w-10 text-right align-middle pl-0.5 pb-px">
      ${ghostButton(...)}
    </td>
  </tr>
`
```

### Matcher Rows (Uses Flex - matcher-row.render.ts lines 25-62)

```typescript
return `
  <div class="mt-2 flex items-center gap-2" data-mid="${m.id}">
    <div class="flex flex-1 items-center rounded-md bg-white/5 outline-1 -outline-offset-1 outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-blue-500">
      <input
        type="text"
        class="block min-w-0 flex-1 bg-white/5 py-1.5 pl-3 pr-3 text-sm text-text placeholder:text-gray-500 focus:outline-none"
      />
      <div class="grid shrink-0 grid-cols-1 focus-within:relative">
        <select class="..." />
        <svg ... />
      </div>
    </div>
    ${ghostButton(...)}
  </div>
`
```

### Issues:

1. **Inconsistent structure:**
   - Headers: `<tr>` with `<td>` cells
   - Matchers: `<div>` with flex layout

2. **Why the difference?**
   - Headers need checkbox, name, value, delete in a row
   - Matchers need URL filter, type selector dropdown, delete
   - No documented reason for layout choice difference

3. **Story doesn't call this out:**
   - Popup.stories.ts shows both (lines 308-314)
   - But doesn't explain the layout difference
   - No separate story for "table layout" vs "flex layout"

### Problem Demonstrated in popup-template.ts (lines 77-79):

```html
<table class="min-w-full">
  <tbody id="${containerId}"></tbody>
</table>
```

Only headers use this table. Matchers render into a `<div id="matchers">` without table structure.

---

## Example 5: Missing Button State Stories

### Current Buttons.stories.ts Coverage

✓ PrimaryText, PrimaryWithIcon, PrimarySmall
✓ SecondaryText, SecondaryWithIcon, SecondarySmall  
✓ WithAction, SubmitType

### Missing Stories

#### Disabled State

```typescript
export const PrimaryDisabled: Story = {
  args: {
    text: 'Apply',
    variant: 'primary',
    size: 'md',
    disabled: true, // ← Not in interface
  },
}
```

**Problem:** solidButton doesn't support `disabled` option

- Should add to SolidButtonOptions interface
- Should document disabled styling in component

#### Error State

```typescript
export const ErrorBorder: Story = {
  args: {
    text: 'Save',
    variant: 'primary',
    size: 'md',
    className: 'border-2 border-red-500', // ← Hacky workaround
  },
}
```

**Problem:** No error variant defined

- Should add variant type for 'error'
- Should show validation error styling

#### Loading State

```typescript
export const PrimaryLoading: Story = {
  args: {
    text: 'Applying...',
    variant: 'primary',
    size: 'md',
    disabled: true,
    showSpinner: true, // ← Not supported
  },
}
```

**Problem:** Loading state not supported

- No spinner icon support
- No disabled state combination

---

## Example 6: Color Grid Duplication

### In popup-template.ts (lines 173-187)

```typescript
<div class="grid grid-cols-7 gap-3">
  ${COLOR_PALETTE.map(
    (color) => `
    <button
      type="button"
      data-color="${color.tailwind}"
      data-hex="${color.hex}"
      class="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer color-option"
      style="background-color: ${color.hex}; border: 2px solid rgba(255,255,255,0.2)"
      title="${color.name}"
      popovertarget="colorPickerPopover"
      popovertargetaction="hide"
    ></button>
    `
  ).join('')}
</div>
```

### In ColorPicker.stories.ts (lines 60-103, 180-222, 324-366)

**DUPLICATED PATTERN - Shows up 3 times:**

1. Default story (lines 60-103)
2. WithCustomInitials story (lines 180-222)
3. FullProfileForm story (lines 324-366)

Each story rebuilds the exact same grid with:

```typescript
const colorGrid = document.createElement('div')
colorGrid.className = 'grid grid-cols-7 gap-3'

COLOR_PALETTE.forEach((color) => {
  const colorBtn = document.createElement('button')
  colorBtn.type = 'button'
  colorBtn.className =
    'w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer color-option'
  // ... more setup ...
  colorGrid.appendChild(colorBtn)
})
```

### Ideal Component Implementation

**File: src/ui/components/color-grid.ts**

```typescript
export interface ColorGridOption {
  name: string
  hex: string
  tailwind: string
}

export function colorGrid(
  colors: ColorGridOption[],
  onSelect?: (color: ColorGridOption) => void
): string {
  return `
    <div class="grid grid-cols-7 gap-3">
      ${colors
        .map(
          (color) => `
        <button
          type="button"
          data-color="${color.hex}"
          data-tailwind="${color.tailwind}"
          class="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer color-option"
          style="background-color: ${color.hex}; border: 2px solid rgba(255,255,255,0.2)"
          title="${color.name}"
        ></button>
      `
        )
        .join('')}
    </div>
  `
}
```

**Usage in popup-template.ts:**

```typescript
${colorGrid(COLOR_PALETTE)}
```

**Story: src/ui/stories/ColorGrid.stories.ts**

```typescript
export const Default: Story = {
  args: {
    colors: COLOR_PALETTE,
  },
}

export const WithSelection: Story = {
  args: {
    colors: COLOR_PALETTE,
    selectedColor: 'purple-700',
  },
}
```

---

## Summary of Examples

| Issue         | Current       | Ideal             | Impact                       |
| ------------- | ------------- | ----------------- | ---------------------------- |
| Menu items    | 4x hardcoded  | 1x component      | 44 lines → 4 lines, reusable |
| Avatar button | Hardcoded     | Component         | 18 classes → 1 function call |
| Menu button   | Hardcoded     | Component         | 10 lines → 1 function call   |
| Layout        | Table vs flex | Documented choice | Consistency                  |
| Button states | 8 stories     | 12+ stories       | Missing disabled/error       |
| Color grid    | Duplicated 3x | 1 component       | 270 lines → 1 function call  |

All examples use absolute line numbers from the current codebase.
