# Contract: Popup UI Behavior

**Feature**: ChatCrate Browser Extension Popup  
**Date**: 2025-10-04  
**Type**: UI Contract (Manifest V3 Action Popup)

## Contract Overview

This contract defines the expected behavior of the ChatCrate extension popup. The popup is the primary user interface, activated by clicking the extension icon in the Chrome toolbar.

## Behavior Contract

### Trigger
**User Action**: Click extension icon in Chrome toolbar

**Expected Result**: Popup window opens displaying "Hello World" text

### Popup Specifications

**Window Properties**:
- **Type**: Browser action popup (Manifest V3 `action`)
- **Dimensions**: Auto-sized based on content (default ~300x200px)
- **Position**: Below toolbar icon (browser-managed)
- **Lifecycle**: Opens on click, closes on outside click or ESC key

**Content Requirements**:
- Display text "Hello World" prominently
- Use React component for rendering
- Style with TailwindCSS
- Render without errors

### Technical Contract

**Manifest V3 Configuration**:
```json
{
  "action": {
    "default_popup": "popup.html"
  }
}
```

**Entry Point**: `src/entrypoints/popup/index.html`  
**React Root**: `src/entrypoints/popup/App.tsx`  
**Main Component**: `src/components/HelloWorld.tsx`

---

## Test Specifications

### Test 1: Popup Renders "Hello World" Text

**File**: `tests/integration/components/HelloWorld.test.tsx`

**Setup**:
```typescript
import { render, screen } from '@testing-library/react';
import HelloWorld from '@/components/HelloWorld';
```

**Test Case**:
```typescript
test('renders Hello World text', () => {
  render(<HelloWorld />);
  const textElement = screen.getByText(/hello world/i);
  expect(textElement).toBeInTheDocument();
});
```

**Expected Behavior**:
- Component renders without errors
- Text "Hello World" (case-insensitive) is present in the DOM
- Text is visible to users (not hidden)

**Status**: ❌ MUST FAIL initially (no implementation yet)

---

### Test 2: HelloWorld Component Accepts Custom Message

**File**: `tests/integration/components/HelloWorld.test.tsx`

**Test Case**:
```typescript
test('renders custom message when provided', () => {
  const customMessage = 'ChatCrate Extension';
  render(<HelloWorld message={customMessage} />);
  const textElement = screen.getByText(customMessage);
  expect(textElement).toBeInTheDocument();
});
```

**Expected Behavior**:
- Component accepts optional `message` prop
- Custom message is rendered instead of default "Hello World"
- Demonstrates component flexibility for future enhancements

**Status**: ❌ MUST FAIL initially (no implementation yet)

---

### Test 3: Popup HTML Entry Point Exists

**File**: `tests/unit/entrypoints/popup.test.ts` (or validation script)

**Test Case**:
```typescript
test('popup HTML file exists and is valid', () => {
  // Verify file exists at expected path
  // Verify HTML structure includes root div for React
  // Verify script tag loads React app
});
```

**Expected Behavior**:
- `src/entrypoints/popup/index.html` exists
- Contains `<div id="root"></div>` for React mounting
- Includes script reference to main.tsx
- Valid HTML5 structure

**Status**: ❌ MUST FAIL initially (no files yet)

---

### Test 4: Extension Loads Without Errors (Manual Validation)

**Test Type**: Manual validation (documented in quickstart.md)

**Steps**:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `.output/chrome-mv3` directory (after build)
5. Click extension icon in toolbar

**Expected Behavior**:
- Extension appears in extension list with "ChatCrate" name
- No errors in Chrome DevTools console
- Clicking icon opens popup
- Popup displays "Hello World" text
- No visual glitches or styling issues

**Success Criteria**:
- ✅ Extension loads without errors
- ✅ Popup opens when icon clicked
- ✅ "Hello World" text visible and styled
- ✅ Popup closes on outside click

---

## Component Interface Contract

### HelloWorld Component API

```typescript
// src/components/HelloWorld.tsx

interface HelloWorldProps {
  /**
   * Optional custom message to display
   * @default "Hello World"
   */
  message?: string;
}

/**
 * Simple component that displays a greeting message
 * Used to validate the development environment setup
 */
export default function HelloWorld(props: HelloWorldProps): JSX.Element;
```

**Props**:
- `message` (optional): String to display, defaults to "Hello World"

**Returns**: React element rendering the message

**Styling**: Uses TailwindCSS utility classes

**Example Usage**:
```tsx
// Default message
<HelloWorld />

// Custom message
<HelloWorld message="Welcome to ChatCrate" />
```

---

## Styling Contract

### TailwindCSS Classes

**Required Styles** (minimum for Hello World):
```tsx
<div className="flex items-center justify-center min-h-screen bg-gray-100">
  <h1 className="text-4xl font-bold text-blue-600">
    Hello World
  </h1>
</div>
```

**Style Requirements**:
- Text is centered both horizontally and vertically
- Text is large and readable (4xl size)
- Text has distinctive color (blue-600)
- Background provides contrast (gray-100)
- Minimum height ensures popup is not too small

**Responsive**: Not required for popup (fixed context)

**Dark Mode**: Not required in initial phase

---

## Error Handling Contract

### No Errors Allowed

**Console Error Check**:
```typescript
test('component renders without console errors', () => {
  const consoleSpy = jest.spyOn(console, 'error');
  render(<HelloWorld />);
  expect(consoleSpy).not.toHaveBeenCalled();
  consoleSpy.mockRestore();
});
```

**Expected Behavior**:
- No React errors
- No uncaught exceptions
- No console warnings (except known library warnings)
- No TypeScript errors

---

## Performance Contract

### Render Performance

**Requirement**: Popup opens in < 100ms after click

**Measurement**: Chrome DevTools Performance tab

**Optimization**:
- No heavy computations on mount
- No unnecessary re-renders
- Minimal bundle size (code splitting via WXT)

**Acceptance**: User perceives instant response

---

## Accessibility Contract

### Basic Accessibility

**Requirements**:
- Text has sufficient color contrast (WCAG AA)
- Semantic HTML elements used
- Screen reader compatible

**Future Enhancements**:
- Keyboard navigation
- ARIA labels for interactive elements
- Focus management

---

## Security Contract

### Content Security Policy

**Manifest V3 CSP**: WXT handles default CSP

**Requirements**:
- No inline scripts (enforced by Manifest V3)
- No eval() or new Function()
- All scripts loaded from extension bundle

---

## Integration Points

### With WXT Framework

**Entry Point Detection**: WXT automatically detects `src/entrypoints/popup/`

**Build Output**: `action.default_popup` set to compiled popup.html

**HMR**: Hot reload during development when popup files change

### With React

**Mount Point**: React app mounts to `#root` div in index.html

**StrictMode**: Enabled during development for better debugging

---

## Contract Validation Checklist

**Before Tests**:
- [ ] Project structure created
- [ ] WXT configured with Manifest V3
- [ ] React and Tailwind dependencies installed

**Test-First (TDD)**:
- [ ] `HelloWorld.test.tsx` written and FAILING
- [ ] Test verifies "Hello World" text present
- [ ] Test verifies custom message prop works

**After Implementation**:
- [ ] All tests PASSING
- [ ] HelloWorld component created
- [ ] Popup entry point created
- [ ] Extension loads in Chrome without errors
- [ ] Clicking icon shows "Hello World" popup

**Quality Gates**:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with zero errors
- [ ] Prettier formatting applied
- [ ] No console errors in browser DevTools

---

## Contract Version

**Version**: 1.0.0  
**Status**: ✅ Contract Defined - Ready for TDD Implementation  
**Next Step**: Write failing tests, then implement to pass tests

---

## Notes

This is a minimal contract for the Hello World phase. Future contracts will define:
- Extractor module contracts (chat content extraction)
- Formatter module contracts (format conversion)
- Exporter module contracts (platform integration)
- Options page contract (user configuration)
- Background script contract (event handling)

Each module will have its own contract document following TDD principles.

