# INFOBYTE-MCP

A TypeScript npm project initialized with modern development tools.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository (if using git)
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- **`npm run dev`** - Start development server with hot reload using nodemon and ts-node
- **`npm run build`** - Compile TypeScript to JavaScript in the `dist` folder
- **`npm start`** - Run the compiled JavaScript application
- **`npm test`** - Run tests (not implemented yet)

## 📁 Project Structure

```
├── src/              # TypeScript source files
│   └── index.ts      # Main entry point
├── dist/             # Compiled JavaScript output
├── node_modules/     # Dependencies
├── package.json      # Project configuration
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## 🛠️ Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Make changes to files in the `src/` directory

3. The application will automatically restart when you save changes

## 🔧 Building for Production

1. Compile TypeScript to JavaScript:
   ```bash
   npm run build
   ```

2. Run the compiled application:
   ```bash
   npm start
   ```

## 📦 Dependencies

### Development Dependencies

- **TypeScript** - TypeScript compiler
- **@types/node** - Node.js type definitions
- **ts-node** - Run TypeScript directly
- **nodemon** - Auto-restart on file changes

## 📝 License

ISC
