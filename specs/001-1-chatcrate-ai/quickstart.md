# Quickstart Guide: ChatCrate Browser Extension

**Purpose**: Validate the ChatCrate browser extension development environment is correctly set up and functional.

**Target**: Developers setting up the project for the first time

**Expected Time**: 5-10 minutes (excluding initial dependency installation)

**Prerequisites**:
- Node.js ≥ 20 LTS installed
- pnpm package manager installed (`npm install -g pnpm`)
- Chrome browser installed (version 88+)
- Git repository cloned

---

## Phase 1: Installation

### Step 1.1: Install Dependencies

```bash
cd ChatCrate
pnpm install
```

**Expected Output**:
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded X, added XXX
Done in Xs
```

**Validation**:
- ✅ No peer dependency warnings
- ✅ pnpm-lock.yaml file created/updated
- ✅ node_modules/ directory populated

**Troubleshooting**:
- If `pnpm` command not found: Install pnpm globally with `npm install -g pnpm`
- If peer dependency conflicts: Check Node.js version is >= 20

---

### Step 1.2: Verify Project Structure

```bash
ls -la
```

**Expected Files/Directories**:
```
├── .husky/                 # Git hooks
├── node_modules/           # Dependencies
├── public/                 # Static assets (empty for now)
├── src/                    # Source code
│   ├── entrypoints/       # Extension entry points
│   │   ├── popup/         # Popup UI
│   │   └── background.ts  # Background script
│   ├── components/        # React components
│   │   └── HelloWorld.tsx
│   ├── modules/           # Business logic modules (empty)
│   │   ├── extractor/
│   │   ├── formatter/
│   │   ├── exporter/
│   │   └── ui/
│   └── utils/             # Utility functions
├── tests/                  # Test files
│   ├── unit/
│   └── integration/
├── wxt.config.ts           # WXT configuration
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
├── postcss.config.cjs      # PostCSS config
├── jest.config.js          # Jest config
├── package.json            # Project metadata
└── README.md               # Main documentation
```

**Validation**: All listed directories and config files exist

---

## Phase 2: Development

### Step 2.1: Start Development Server

```bash
pnpm dev
```

**Expected Output**:
```
WXT X.X.X starting development server...
Building for chrome-mv3...
✓ Built in XXXms

Extension loaded:
- Popup: http://localhost:XXXX/popup.html
- Background: ...

Watching for changes...
```

**Validation**:
- ✅ WXT server starts without errors
- ✅ Build completes successfully
- ✅ File watcher is active
- ✅ `.output/chrome-mv3/` directory created

**Troubleshooting**:
- If port already in use: WXT will automatically use next available port
- If build fails: Check TypeScript/ESLint errors in console

---

### Step 2.2: Load Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" toggle (top right)
4. Click "Load unpacked" button
5. Navigate to project directory
6. Select `.output/chrome-mv3/` folder
7. Click "Select"

**Expected Result**:
```
ChatCrate extension appears in extension list:
- Name: ChatCrate
- Version: 0.0.1
- Status: Enabled
- ID: [random extension ID]
- Icon: Default browser extension icon (puzzle piece)
```

**Validation**:
- ✅ Extension loads without errors
- ✅ Extension appears in toolbar (pin if needed)
- ✅ No error messages in extension list

**Troubleshooting**:
- If "manifest.json not found": Make sure you selected `.output/chrome-mv3/` directory
- If manifest errors: Check WXT build completed successfully
- If extension doesn't appear: Refresh the extensions page

---

### Step 2.3: Test Popup Functionality

**Action**: Click the ChatCrate extension icon in Chrome toolbar

**Expected Result**:
- Popup window opens (approximately 300x200px)
- Displays "Hello World" text
- Text is styled (large, blue, centered)
- Background is light gray
- No console errors

**Validation Steps**:

1. **Visual Check**:
   - ✅ Popup opens immediately after click
   - ✅ "Hello World" text is visible
   - ✅ Text is centered and styled
   - ✅ No blank or broken UI

2. **Developer Console Check**:
   - Right-click popup → "Inspect"
   - Open Console tab
   - ✅ No red error messages
   - ✅ No yellow warning messages (except known library warnings)

3. **Interaction Check**:
   - ✅ Popup closes when clicking outside
   - ✅ Popup closes when pressing ESC key
   - ✅ Popup reopens when clicking icon again

**Success Screenshot** (for documentation):
```
┌─────────────────────────┐
│     ChatCrate Popup     │
├─────────────────────────┤
│                         │
│     Hello World         │
│   (centered, styled)    │
│                         │
└─────────────────────────┘
```

---

## Phase 3: Testing

### Step 3.1: Run Unit Tests

```bash
pnpm test
```

**Expected Output**:
```
PASS  tests/unit/utils/example.test.ts
  ✓ example utility function works (Xms)

PASS  tests/integration/components/HelloWorld.test.tsx
  ✓ renders Hello World text (XXms)
  ✓ renders custom message when provided (Xms)

Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        X.XXXs
```

**Validation**:
- ✅ All tests pass
- ✅ No test failures
- ✅ Test execution completes in reasonable time (< 10s)

**Troubleshooting**:
- If tests fail: Check implementation matches test expectations
- If Jest config errors: Verify jest.config.js is present

---

### Step 3.2: Run Linter

```bash
pnpm lint
```

**Expected Output**:
```
✔ No ESLint warnings or errors found
```

**Validation**:
- ✅ Zero errors
- ✅ Zero warnings (or ≤ 10 acceptable warnings)

---

### Step 3.3: Run Type Checker

```bash
pnpm typecheck
```

**Expected Output**:
```
tsc --noEmit
[No output = success]
```

**Validation**:
- ✅ No TypeScript errors
- ✅ All types compile successfully

---

### Step 3.4: Format Check

```bash
pnpm format
```

**Expected Output**:
```
Checking formatting...
All files are formatted correctly ✓
```

**Validation**:
- ✅ All files pass Prettier formatting
- ✅ No formatting issues

---

## Phase 4: Build

### Step 4.1: Production Build

```bash
pnpm build
```

**Expected Output**:
```
WXT X.X.X building for production...
Building for chrome-mv3...
✓ Built in XXXms

Output:
  .output/chrome-mv3/
    - manifest.json
    - popup.html
    - assets/...
```

**Validation**:
- ✅ Build completes without errors
- ✅ `.output/chrome-mv3/` directory contains all assets
- ✅ manifest.json is valid JSON
- ✅ File sizes are reasonable

**Check Build Output**:
```bash
ls -lh .output/chrome-mv3/
```

**Expected Files**:
- `manifest.json` (Manifest V3 format)
- `popup.html` (Compiled popup page)
- `assets/` directory (JS/CSS bundles)
- `chunks/` directory (Code-split chunks)

---

### Step 4.2: Load Production Build

1. Go to `chrome://extensions/`
2. Remove the development extension (if loaded)
3. Click "Load unpacked"
4. Select `.output/chrome-mv3/` directory again
5. Test popup functionality

**Expected Result**:
- Production build loads successfully
- Popup works identically to dev mode
- Performance may be slightly better (optimized bundle)

**Validation**:
- ✅ Extension loads
- ✅ Popup displays "Hello World"
- ✅ No console errors

---

## Phase 5: Git Hooks Validation

### Step 5.1: Test Pre-commit Hook

```bash
# Make a trivial change
echo "// test comment" >> src/utils/example.ts

# Stage and commit
git add .
git commit -m "test: validate pre-commit hook"
```

**Expected Output**:
```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
  ✔ Running format check...
  ✔ Running ESLint...
  ✔ Running tests...
✔ Applying modifications...
✔ Cleaning up...
[branch XXXXXX] test: validate pre-commit hook
```

**Validation**:
- ✅ Pre-commit hook runs automatically
- ✅ Format, lint, and quick tests execute
- ✅ Commit succeeds if all checks pass
- ✅ Process takes < 5 seconds

**Troubleshooting**:
- If hook doesn't run: Check `.husky/pre-commit` file exists and is executable
- If checks fail: Fix the issues before committing

---

### Step 5.2: Test Pre-push Hook

```bash
# Attempt to push (to local branch)
git push origin [branch-name]
```

**Expected Output**:
```
Running pre-push hook...
✔ Running typecheck...
✔ Running full test suite...
```

**Validation**:
- ✅ Pre-push hook runs before push
- ✅ Typecheck executes
- ✅ Full test suite runs
- ✅ Push proceeds if all checks pass

---

## Phase 6: Documentation Validation

### Step 6.1: Review README

```bash
cat README.md
```

**Expected Content**:
- Project overview
- Installation instructions
- Development commands
- Build instructions
- Extension loading guide
- Testing guide
- Troubleshooting section

**Validation**:
- ✅ README exists
- ✅ Instructions are clear and accurate
- ✅ All commands work as documented

---

## Success Criteria Summary

✅ **Installation**:
- Dependencies installed successfully
- Project structure is correct

✅ **Development**:
- Dev server starts without errors
- Extension loads in Chrome
- Popup displays "Hello World"
- No console errors

✅ **Testing**:
- All tests pass
- Linter reports zero errors
- TypeScript compiles successfully
- Code is properly formatted

✅ **Build**:
- Production build succeeds
- Build output is valid and loadable

✅ **Git Hooks**:
- Pre-commit hook enforces quality gates
- Pre-push hook runs full validation

✅ **Documentation**:
- README provides clear instructions

---

## Next Steps After Quickstart

Once all validation steps pass, the development environment is confirmed working. You can proceed to:

1. **Run `/tasks` command**: Generate detailed implementation tasks
2. **Implement Features**: Follow TDD approach from tasks.md
3. **Add Modules**: Implement extractor, formatter, exporter modules
4. **Expand UI**: Build configuration and export interfaces

---

## Rollback / Cleanup

If you need to start fresh:

```bash
# Remove build outputs and dependencies
rm -rf node_modules .output .wxt
rm pnpm-lock.yaml

# Reinstall from scratch
pnpm install

# Rebuild
pnpm dev
```

---

## Common Issues

### Issue: Extension won't load
**Solution**: Ensure you're selecting `.output/chrome-mv3/` directory, not project root

### Issue: Popup is blank
**Solution**: Check browser console for React errors; verify `HelloWorld` component exists

### Issue: Tests fail
**Solution**: Ensure all dependencies installed; check Jest configuration

### Issue: Husky hooks don't run
**Solution**: Run `pnpm prepare` to reinstall git hooks

### Issue: TypeScript errors
**Solution**: Check `tsconfig.json` is configured correctly; run `pnpm typecheck` for details

---

**Quickstart Version**: 1.0.0  
**Last Updated**: 2025-10-04  
**Status**: ✅ Ready for Validation

