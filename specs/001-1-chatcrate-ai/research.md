# Research Document: ChatCrate Browser Extension Technology Stack

**Feature**: ChatCrate Browser Extension Development Environment Setup  
**Date**: 2025-10-04  
**Status**: Complete

## Overview

This document consolidates research findings for technology choices in the ChatCrate browser extension project. The goal is to establish a modern, maintainable development environment for a Manifest V3 Chrome extension with React UI.

## Research Topics

### 1. WXT Framework for Browser Extensions

**Decision**: Use WXT (Web Extension Tools) as the build framework

**Rationale**:
- **Manifest V3 Support**: WXT has first-class support for Manifest V3, handling the complexity of the new service worker model and permissions system
- **Hot Module Replacement**: Provides HMR during development, significantly improving developer experience
- **Framework Agnostic**: Supports React, Vue, Svelte, or vanilla JS - we can use React as specified
- **TypeScript Native**: Built-in TypeScript support without additional configuration
- **Auto Reload**: Automatically reloads extension during development when files change
- **Production Optimization**: Handles code splitting, tree shaking, and minification
- **Convention over Configuration**: Sensible defaults with `entrypoints/` directory structure

**Alternatives Considered**:
- **Manual Webpack/Vite Setup**: Too complex, requires deep knowledge of extension bundling
- **Plasmo**: Similar features but less mature, smaller community
- **CRXJS**: Vite-based but more opinionated, less flexible

**References**:
- WXT Documentation: https://wxt.dev/
- Manifest V3 Migration: https://developer.chrome.com/docs/extensions/migrating/

---

### 2. React + TailwindCSS Integration

**Decision**: Use React 18+ with TailwindCSS v3+ for UI development

**Rationale**:
- **React**: Industry standard for component-based UI, excellent ecosystem, strong typing with TypeScript
- **TailwindCSS**: Utility-first CSS framework, excellent for rapid prototyping, tree-shakeable for small bundle sizes
- **Developer Experience**: Both have excellent VS Code support and debugging tools
- **Extension Compatibility**: Both work well in browser extension context with proper configuration
- **Component Reusability**: React components can be easily shared across popup, options page, and future content scripts

**Integration Approach**:
- Use PostCSS with Tailwind plugin for processing
- Configure Tailwind to scan `src/**/*.{ts,tsx}` for class usage
- Use `@apply` sparingly to keep utility-first philosophy
- Include Tailwind's typography plugin if needed for formatted content display

**Alternatives Considered**:
- **Vue + TailwindCSS**: Smaller bundle but less familiar to most developers
- **Vanilla JS + CSS Modules**: More performant but slower development
- **Styled Components**: Runtime overhead not ideal for extensions

**References**:
- React Documentation: https://react.dev/
- TailwindCSS Documentation: https://tailwindcss.com/docs

---

### 3. Testing Strategy with Jest + React Testing Library

**Decision**: Use Jest with jsdom and React Testing Library for unit and integration tests

**Rationale**:
- **Jest**: Industry standard JavaScript testing framework, excellent mocking capabilities
- **jsdom**: Simulates browser environment for testing React components without real browser
- **React Testing Library**: Encourages testing from user perspective, better practices than Enzyme
- **Fast Feedback**: Unit tests run quickly in Node environment
- **Coverage Reports**: Built-in coverage reporting with Istanbul

**Test Structure**:
```
tests/
├── unit/           # Fast unit tests for utilities and logic
└── integration/    # Component integration tests with RTL
```

**Test Requirements**:
- All tests must fail first (TDD principle from constitution)
- Minimum 2 example tests: 1 component test, 1 utility test
- Coverage collection enabled but no thresholds initially
- Tests run in Husky pre-commit (fast subset) and pre-push (full suite)

**Alternatives Considered**:
- **Vitest**: Faster but newer, less ecosystem support
- **Playwright**: Better for E2E but overkill for unit tests
- **Testing Library only**: Need test runner like Jest

**References**:
- Jest Documentation: https://jestjs.io/
- React Testing Library: https://testing-library.com/react

---

### 4. Content Script Permissions Strategy

**Decision**: Use `permissions: ["activeTab", "scripting"]` instead of `host_permissions`

**Rationale**:
- **User Privacy**: `activeTab` only grants access when user explicitly interacts with extension
- **Chrome Web Store**: Extensions with `activeTab` get faster review approval
- **User Trust**: Users more likely to install extensions with minimal permissions
- **Dynamic Injection**: `scripting` API allows programmatic content script injection on-demand
- **Future Proof**: Google's recommended approach for Manifest V3

**Implementation Notes**:
- Content scripts will be injected programmatically via `chrome.scripting.executeScript()`
- No content scripts in manifest.json `content_scripts` field
- Each chat platform (ChatGPT, Claude, etc.) will have separate content scripts
- Scripts only injected when user activates extraction feature

**Alternatives Considered**:
- **host_permissions**: Broader access but requires justification, scary for users
- **Static content_scripts**: Always active, wastes resources, privacy concerns

**References**:
- activeTab Permission: https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/
- Scripting API: https://developer.chrome.com/docs/extensions/reference/scripting/

---

### 5. Module Architecture for Chat Extraction Pipeline

**Decision**: Four-module architecture: Extractor → Formatter → Exporter + UI

**Module Boundaries**:

**Extractor Module** (`src/modules/extractor/`):
- **Purpose**: Extract chat conversation content from various AI platforms
- **Responsibility**: Platform-specific DOM parsing, content collection
- **Future Implementations**: 
  - ChatGPT extractor
  - Claude extractor
  - Gemini extractor
  - Perplexity extractor
- **Interface**: `extract(document) → ConversationData`

**Formatter Module** (`src/modules/formatter/`):
- **Purpose**: Transform extracted content into various output formats
- **Responsibility**: Format conversion, structure preservation
- **Future Implementations**:
  - Markdown formatter
  - JSON formatter
  - Tana Paste formatter
  - HTML formatter
- **Interface**: `format(ConversationData) → FormattedOutput`

**Exporter Module** (`src/modules/exporter/`):
- **Purpose**: Send formatted content to target platforms
- **Responsibility**: API integration, authentication, error handling
- **Future Implementations**:
  - Obsidian exporter (local filesystem)
  - Notion exporter (API)
  - Readwise Reader exporter (API)
  - Tana exporter (API)
- **Interface**: `export(FormattedOutput, config) → ExportResult`

**UI Module** (`src/modules/ui/` + `src/components/`):
- **Purpose**: User interface for extension (popup, options)
- **Responsibility**: User interaction, configuration, status display
- **Components**:
  - Format selector
  - Export target selector
  - API key configuration
  - Export status/history

**Rationale**:
- **Separation of Concerns**: Each module has single responsibility
- **Testability**: Modules can be tested independently
- **Extensibility**: Easy to add new platforms, formats, or export targets
- **Reusability**: Formatters and exporters can be reused across different extractors
- **Constitution Alignment**: Each module can become a library in future iterations

**Data Flow**:
```
User activates extraction
  → Extractor identifies platform and extracts content
  → User selects format via UI
  → Formatter transforms content
  → User selects export target via UI
  → Exporter sends to target platform
  → UI displays success/error
```

**Alternatives Considered**:
- **Monolithic Architecture**: Simpler initially but hard to test and extend
- **Plugin System**: Overkill for initial implementation
- **Microservices**: Not applicable to browser extension context

---

## Technology Stack Summary

| Category | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| **Package Manager** | pnpm | Latest | Fast, disk efficient, strict peer dependencies |
| **Build Framework** | WXT | Latest | Manifest V3 native, HMR, auto-reload |
| **Language** | TypeScript | Latest | Type safety, better refactoring, IDE support |
| **UI Framework** | React | 18+ | Component model, large ecosystem |
| **Styling** | TailwindCSS | 3+ | Utility-first, small bundle, fast iteration |
| **Testing** | Jest + RTL | Latest | Industry standard, good DX |
| **Linting** | ESLint | Latest | typescript-eslint, react, react-hooks rules |
| **Formatting** | Prettier | Latest | Consistent style, Tailwind class sorting |
| **Git Hooks** | Husky | Latest | Enforce quality gates pre-commit/push |
| **Node Version** | >= 20 LTS | 20.x | Modern features, long-term support |
| **Target Browser** | Chrome | 88+ | Manifest V3 support |

## Open Questions / Future Research

1. **State Management**: Not needed for Hello World, but consider Zustand or Context API for future
2. **API Client**: Will need HTTP client (fetch API or axios) when implementing exporters
3. **Storage**: Consider chrome.storage API for persisting user preferences and API keys
4. **Internationalization**: May need i18n library if supporting multiple languages
5. **Analytics**: Consider privacy-preserving analytics for usage insights
6. **Auto-Update**: Extension auto-updates via Chrome Web Store, no custom logic needed

## Conclusion

The chosen technology stack balances modern developer experience with extension-specific requirements. WXT framework significantly reduces boilerplate while maintaining flexibility. The modular architecture aligns with constitution principles and sets up for future feature development.

All major technology choices are resolved. No NEEDS CLARIFICATION markers remain.

**Status**: ✅ Research Complete - Ready for Phase 1 Design

