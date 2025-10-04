# ChatCrate

![License](https://img.shields.io/github/license/thomaszdxsn/ChatCrate)
![GitHub issues](https://img.shields.io/github/issues/thomaszdxsn/ChatCrate)
![GitHub stars](https://img.shields.io/github/stars/thomaszdxsn/ChatCrate)

> 🚀 A modern browser extension for exporting AI chat conversations to your favorite note-taking apps.

## ✨ Current Features

- 🎨 **Modern UI scaffold** built with React and TailwindCSS
- ⚡ **Fast and lightweight** powered by WXT framework
- 🧪 **Test setup** with initial coverage

## 🚧 Planned Features / Roadmap

- 🎯 **Extract conversations** from popular AI platforms (ChatGPT, Claude, Gemini, Perplexity)
- 📝 **Multiple export formats** (Markdown, JSON, Tana Paste, HTML)
- 🔌 **Integrations** with Notion, Obsidian, Readwise Reader, Tana
- 🧪 **Comprehensive test coverage**

## 📦 Project Status

This is the **initial setup** with a minimal "Hello World" implementation. The core extraction and export features are planned for future releases.

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

