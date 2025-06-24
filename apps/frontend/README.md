# Expertmind Chatbox

Expertmind chatbox

## Quick Start

```bash
cd frontend
yarn install
yarn dev:local
```

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Electron 34.5.8
- **Storage**: localStorage (browser)
- **Styling**: CSS custom properties

## Scripts

```bash
yarn dev              # Dev mode (React + Electron)
yarn build            # Production build
yarn build:electron   # Package for distribution

```

## Configuration Files

### `package.json`
- **Main entry**: `dist/electron/main.js`
- **Build config**: `electron-builder` with multi-platform targets
- **Scripts**: Concurrent React/Electron development

### `vite.config.ts`
- **Base path**: `./` for Electron compatibility
- **Build output**: `dist/react`
- **Dev server**: Port 5173
- **Aliases**: `@` → `./src`

### `tsconfig.*.json`
- `tsconfig.json`: React app compilation
- `tsconfig.electron.json`: Electron main process
- `tsconfig.node.json`: Node.js utilities

## Architecture

```
src/
├── components/         # React UI components
├── types/             # TypeScript definitions
├── utils/             # Storage, API, file utilities
├── App.tsx            # Main React component
└── main.tsx           # React entry point

electron/              # Electron main process
dist/                  # Build outputs
```

## Development Notes

- **Electron main**: Built with `tsc` to `dist/electron/`
- **React app**: Built with Vite to `dist/react/`
- **Storage**: localStorage for conversations and settings
- **API**: Configurable OpenAI-compatible endpoint
- **File uploads**: Handled via Electron file dialogs

## Build Process

1. **Development**: `concurrently` runs React dev server + Electron
2. **Production**: Separate builds for React app and Electron main
3. **Distribution**: `electron-builder` packages for Windows/macOS/Linux

## Environment

- **Node.js**: 18+
- **Yarn**: Preferred package manager
- **Development**: Hot reload for React, Electron restart on main process changes
