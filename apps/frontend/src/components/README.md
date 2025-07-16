# 📁 Components Structure

This directory contains all React components for the ExpertMind frontend application.

## 🏗️ Organization

Each component is organized in its own directory with the following structure:

```
ComponentName/
├── ComponentName.tsx    # Main component file
├── index.ts            # Export file for cleaner imports
├── ComponentName.css   # Component styles (if needed)
└── README.md          # Component documentation (optional)
```

## 📦 Components

### Core Components

- **ChatArea** - Main chat interface containing message list and input
- **Sidebar** - Navigation sidebar with chat sessions list
- **ConfigPanel** - Configuration panel for API settings
- **ConfigPanelOllama** - Specialized config panel for Ollama integration

### Message Components

- **MessageList** - Container for displaying chat messages
- **MessageItem** - Individual message display component
- **MessageInput** - Text input area with file attachment support

## 💡 Usage

Components can be imported in two ways:

```typescript
// Import from component directory
import ChatArea from './components/ChatArea';

// Import from components index
import { ChatArea, Sidebar, MessageList } from './components';
```

## 🎨 Styling

Components use inline styles with CSS variables defined in the global styles.
This ensures consistency and makes theming easier.

## 🔧 Best Practices

1. Keep components focused and single-purpose
2. Use TypeScript interfaces for props
3. Include JSDoc comments for complex components
4. Test components in isolation when possible
5. Follow the established directory structure

## 📝 Notes

- The `_backup` directory contains the original component files before restructuring
- All components are written in TypeScript (.tsx)
- Components use React Hooks and functional components pattern
