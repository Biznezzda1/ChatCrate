# ChatCrate

Browser extension for exporting AI chat conversations to note-taking apps.

## Prerequisites

- Node.js >= 20 LTS
- pnpm package manager

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Then load the extension from `.output/chrome-mv3/` in Chrome Developer Mode.

## Building

```bash
pnpm build
```

## Testing

```bash
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

## Code Quality

```bash
pnpm lint              # Check lint
pnpm format            # Format code  
pnpm typecheck         # Type check
```

## Loading in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `.output/chrome-mv3/` directory
5. Click extension icon to see "Hello World"

## Project Structure

- `src/entrypoints/` - Extension entry points (popup, background)
- `src/components/` - React components
- `src/modules/` - Core business logic (future)
- `tests/` - Unit and integration tests

## License

ISC

