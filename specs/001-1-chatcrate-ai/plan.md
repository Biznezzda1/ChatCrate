
# Implementation Plan: ChatCrate Browser Extension Setup

**Branch**: `001-1-chatcrate-ai` | **Date**: 2025-10-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-1-chatcrate-ai/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✓ Loaded successfully from spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✓ No NEEDS CLARIFICATION - all decisions made in clarifications
   → Detected Project Type: Browser Extension (single project with modular structure)
   → Set Structure Decision: WXT-based browser extension with React
3. Fill the Constitution Check section based on the content of the constitution document
   → ✓ Evaluated against ChatCrate Constitution v1.0.0
4. Evaluate Constitution Check section below
   → ✓ PASS with justified deviations documented
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✓ Creating research.md with WXT + React + Tailwind decisions
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent file
   → ✓ Creating design artifacts
7. Re-evaluate Constitution Check section
   → ✓ PASS - design aligns with constitution
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach
   → ✓ Task generation strategy documented
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Establish a minimal working browser extension development environment for ChatCrate that displays "Hello World" in a popup when the toolbar icon is clicked.

**Technical Approach**: Use WXT framework (modern browser extension framework) with React for UI, TypeScript for type safety, and Tailwind CSS for styling. The project will be structured with four core module directories (Extractor, Formatter, Exporter, UI) as placeholders for future functionality. This initial implementation focuses solely on infrastructure setup with a working popup displaying "Hello World" in Chrome (Manifest V3).

**Scope**: Infrastructure only - no business logic, no backend, no deployment pipeline. The goal is a loadable extension that validates the development environment is correctly configured.

## Technical Context

**Language/Version**: TypeScript (latest), Node.js ≥ 20 LTS  
**Primary Dependencies**: 
- WXT (browser extension framework)
- React 18+ (UI library)
- TailwindCSS (styling)
- pnpm (package manager)
- Jest + @testing-library/react (testing)
- ESLint + Prettier (code quality)
- Husky + lint-staged (git hooks)

**Storage**: N/A (no data persistence in initial setup)  
**Testing**: Jest with jsdom, React Testing Library, minimum 2 example tests  
**Target Platform**: Chrome browser v88+ (Manifest V3 support), Chromium-based browsers acceptable  
**Project Type**: Browser Extension (single project structure with module directories)  
**Performance Goals**: 
- Dev cold start < 60s (excluding initial pnpm install)
- Pre-commit hooks < 5s for small changes
- Build time reasonable for single-page popup

**Constraints**: 
- No external dependencies or build steps beyond standard npm scripts
- No custom icon files (use browser default)
- Local development only (no deployment)
- Manifest V3 only (no V2 compatibility)

**Scale/Scope**: 
- Minimal Hello World implementation
- 4 module directories (Extractor, Formatter, Exporter, UI) as empty placeholders
- ~2 example tests (1 component test, 1 utility test)
- Development environment validation

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Evaluation Against ChatCrate Constitution v1.0.0

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Library-First** | ⚠️ DEFERRED | Initial setup is infrastructure; future extractors/formatters/exporters will be libraries |
| **II. CLI Interface** | ⚠️ DEFERRED | Browser extension has popup UI; CLI tools deferred to future iterations |
| **III. Test-First (NON-NEGOTIABLE)** | ✅ COMPLIANT | Will create failing tests before implementation; 2 example tests required in Phase 1 |
| **IV. Integration Testing** | ✅ COMPLIANT | Example integration tests will be included for extension loading |
| **V. Observability** | ✅ COMPLIANT | Console logging for debugging; text-based manifest and config files |
| **V. Versioning** | ✅ COMPLIANT | manifest.json includes version field; will follow MAJOR.MINOR.BUILD |
| **V. Simplicity** | ✅ COMPLIANT | Minimal setup, YAGNI enforced, no unnecessary dependencies |
| **Technology Stack** | ⚠️ DEVIATION | Using TypeScript/React (not Bash) - justified for browser extension domain |
| **POSIX Compliance** | ⚠️ N/A | Not applicable to browser extension code |
| **Structured Logging** | ✅ COMPLIANT | Console-based logging for browser extensions |
| **Input Validation** | ✅ COMPLIANT | Manifest schema validation by browser |
| **Code Review** | ✅ COMPLIANT | Git hooks will enforce quality gates |
| **Testing Gates** | ✅ COMPLIANT | Husky pre-commit/pre-push hooks enforce test passing |

**Initial Constitution Check**: ⚠️ PASS WITH JUSTIFIED DEVIATIONS (see Complexity Tracking)

## Project Structure

### Documentation (this feature)
```
specs/001-1-chatcrate-ai/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   └── popup.contract.md  # Popup behavior contract
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
ChatCrate/
├── .wxt/                      # WXT framework build cache (gitignored)
├── .output/                   # WXT build output (gitignored)
├── node_modules/              # Dependencies (gitignored)
├── public/                    # Static assets
│   └── (no custom icons - using browser defaults)
├── src/                       # Extension source code
│   ├── entrypoints/          # WXT entrypoints
│   │   ├── popup/            # Popup UI (main entry)
│   │   │   ├── index.html    # Popup HTML
│   │   │   ├── App.tsx       # Root React component
│   │   │   └── main.tsx      # React mount point
│   │   └── background.ts     # Background script (minimal)
│   ├── modules/              # Core business logic modules (empty placeholders)
│   │   ├── extractor/        # Chat content extraction (future)
│   │   ├── formatter/        # Content formatting (future)
│   │   ├── exporter/         # Export to platforms (future)
│   │   └── ui/               # Shared UI components (future)
│   ├── components/           # React components
│   │   └── HelloWorld.tsx    # Example component
│   └── utils/                # Utility functions
│       └── example.ts        # Example utility for testing
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   │   └── utils/
│   │       └── example.test.ts
│   └── integration/          # Integration tests
│       └── components/
│           └── HelloWorld.test.tsx
├── .husky/                   # Git hooks
│   ├── pre-commit            # Format + lint + quick tests
│   └── pre-push              # Typecheck + full test suite
├── wxt.config.ts             # WXT framework configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.cjs        # PostCSS configuration
├── jest.config.js            # Jest test configuration
├── .eslintrc.cjs             # ESLint configuration
├── .prettierrc               # Prettier configuration
├── .prettierignore           # Prettier ignore patterns
├── package.json              # Project metadata and scripts
├── pnpm-lock.yaml            # Dependency lock file
└── README.md                 # Setup and usage instructions
```

**Structure Decision**: Browser Extension with WXT Framework

This is a browser extension project using WXT (a modern framework that simplifies extension development). WXT handles Manifest V3 complexity and provides hot-reload during development. The structure follows WXT conventions with:
- `src/entrypoints/` for extension pages (popup, background, content scripts)
- `src/modules/` for four core business logic modules (empty placeholders documenting future architecture)
- `src/components/` for React components
- Standard test directories with unit and integration separation

The 4 module directories (extractor, formatter, exporter, ui) are created as documentation of the intended architecture but contain only README files describing their future purpose - no implementation in this phase.

## Phase 0: Outline & Research

Since the user provided a comprehensive task plan with specific technology choices, there are no major unknowns. However, we need to document the research rationale for the chosen stack.

### Research Topics

1. **WXT Framework Selection**
   - Task: Research WXT framework capabilities for Manifest V3 extensions
   - Rationale: Modern framework that abstracts Manifest V3 complexity

2. **React + Tailwind Integration**
   - Task: Research best practices for React + Tailwind in browser extensions
   - Rationale: Popular stack with good DX and component reusability

3. **Testing Strategy**
   - Task: Research Jest + React Testing Library setup for extensions
   - Rationale: Industry standard testing tools

4. **Content Script Permissions**
   - Task: Research `activeTab` + `scripting` permissions vs `host_permissions`
   - Rationale: User specified this approach for better privacy/permissions model

5. **Module Architecture**
   - Task: Research separation of concerns for chat extraction pipeline
   - Rationale: Four modules (Extractor, Formatter, Exporter, UI) for future scalability

**Output**: Creating research.md with consolidated findings

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

### Design Artifacts to Generate

1. **data-model.md**: 
   - No complex data models in this phase (Hello World only)
   - Document placeholder module interfaces for future reference
   - Module boundaries: Extractor → Formatter → Exporter pipeline

2. **contracts/popup.contract.md**:
   - Popup behavior contract: Click icon → Popup opens → Shows "Hello World"
   - Test assertion: Popup HTML contains "Hello World" text
   - Test assertion: Extension loads without errors

3. **Contract tests** (fail first, TDD):
   - `tests/integration/components/HelloWorld.test.tsx`: Renders "Hello World" text
   - `tests/unit/utils/example.test.ts`: Example utility function test

4. **quickstart.md**:
   - Step-by-step validation of the development environment
   - Commands: install → dev → load extension → verify popup
   - Success criteria: Popup displays "Hello World" in Chrome

5. **Agent file** (.cursor/AGENTS.md or equivalent):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
   - Add tech stack: TypeScript, React, Tailwind, WXT, pnpm, Jest
   - Add recent changes: Browser extension setup, Manifest V3
   - Keep concise (<150 lines)

**Output**: All design artifacts created in specs/001-1-chatcrate-ai/

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

The /tasks command will load `.specify/templates/tasks-template.md` and generate tasks following this order:

1. **Project Initialization Tasks** (Phase 0 in task list):
   - Initialize pnpm workspace with lockfile
   - Initialize WXT project with React template
   - Configure TypeScript (strict mode)
   - Configure Tailwind CSS + PostCSS
   - Create basic project structure and module directories

2. **Testing Infrastructure Tasks** (Phase 1 in task list):
   - Configure Jest with jsdom and React Testing Library
   - Write failing test for HelloWorld component [P]
   - Write failing test for example utility [P]
   - Configure test scripts (test, test:watch)

3. **Implementation Tasks** (Phase 1 in task list):
   - Create HelloWorld component (make test pass)
   - Create example utility function (make test pass)
   - Create popup entry point with React
   - Configure WXT manifest (Manifest V3, action popup)

4. **Code Quality Tasks** (Phase 2 in task list):
   - Configure ESLint (typescript-eslint, react, react-hooks)
   - Configure Prettier with Tailwind plugin
   - Setup lint-staged configuration
   - Setup Husky hooks (pre-commit, pre-push)
   - Add lint/format/typecheck scripts

5. **Documentation & Validation Tasks** (Phase 2 in task list):
   - Write README with setup instructions
   - Create module README files (empty placeholders)
   - Validate: pnpm install succeeds
   - Validate: pnpm build produces loadable extension
   - Validate: pnpm test passes all tests
   - Validate: Extension loads in Chrome and shows "Hello World"

**Ordering Strategy**:
- Foundation first: pnpm + WXT + TypeScript + Tailwind
- TDD next: Tests before implementation
- Quality gates: Linting and hooks after core functionality
- Validation last: End-to-end verification

**Parallel Opportunities**:
- [P] Both test files can be written simultaneously
- [P] ESLint and Prettier config can be done in parallel
- [P] Module README files can be created in parallel

**Estimated Output**: 18-22 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| TypeScript/React stack (not Bash) | Browser extensions require JavaScript runtime in browser; UI requires component framework | Bash cannot run in browser context; extension APIs are JavaScript-only |
| Deferred CLI interface | Browser extensions are inherently GUI-driven via browser chrome | CLI doesn't fit browser extension interaction model; future CLI tools for extraction may be added |
| Deferred library-first | Initial phase is infrastructure setup; future extractors/formatters will be standalone libraries | Need working environment before extracting library boundaries |
| WXT framework dependency | Abstracts Manifest V3 complexity, provides HMR, handles build optimization | Manual Manifest V3 setup requires deep knowledge of Chrome APIs and webpack config; WXT is industry standard |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (with justified deviations)
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (via /clarify command)
- [x] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
