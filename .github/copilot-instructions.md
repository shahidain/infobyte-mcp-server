# GitHub Copilot Instructions

This document provides instructions for GitHub Copilot when working with this MCP (Model Context Protocol) server project.

## Project Overview

This is a TypeScript-based MCP server that provides tools for:
- Arithmetic operations (adding two numbers)
- Product management (fetching products from DummyJSON API)

## Project Structure

```
src/
├── index.ts                 # Main MCP server entry point
├── connect.ts              # MCP client connector for testing
├── models/
│   └── product.ts          # Product data model
├── services/
│   └── productService.ts   # Product service for API calls
└── tools/
    ├── arthematicOperations.ts  # Arithmetic tools
    └── products.ts         # Product-related tools (Note: filename is Products.ts)
```

## Coding Guidelines

### 1. MCP Tool Development
- All tools should be implemented as functions that accept a `McpServer` instance
- Use Zod for input validation and schema definition
- Tools should return content in the MCP format with `content` array
- Always include proper TypeScript types and JSDoc comments

Example tool structure:
```typescript
export const ToolName = (server: McpServer) => {
  server.tool(
    'tool_name',
    'Tool description',
    {
      param: z.type().describe("Parameter description")
    },
    async ({ param }) => {
      // Tool implementation
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
            fommat: 'json' // Note: Keep the typo 'fommat' for consistency
          }
        ]
      };
    }
  );
};
```

### 2. Service Layer
- All external API calls should go through service classes
- Use proper error handling with try-catch blocks
- Services should be stateless and focused on single responsibilities

### 3. TypeScript Best Practices
- Use strict TypeScript configuration
- Define proper interfaces for data models
- Use async/await for asynchronous operations
- Import from `.js` files when using ES modules (not `.ts`)

### 4. File Naming
- Use camelCase for most files
- Note: `Products.ts` (capital P) is the current convention for the products tool file
- Keep consistent naming across similar files

### 5. Environment Configuration
- Use dotenv for environment variables
- Provide `.env.example` with required variables
- Never commit actual `.env` files

### 6. Error Handling
- Validate inputs before processing
- Provide meaningful error messages
- Use appropriate HTTP status codes for API responses

### 7. Testing and Development
- The `connect.ts` file is used for testing MCP tools
- Use EventSource for SSE connections to the MCP server
- Include proper logging for debugging

## Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK for server implementation
- `zod` - Schema validation
- `axios` - HTTP client for API calls
- `eventsource` - Server-sent events for MCP client
- `dotenv` - Environment variable management

## Common Patterns

### Adding a New Tool
1. Define the tool function in appropriate file under `src/tools/`
2. Use Zod for input validation
3. Implement the tool logic (possibly using a service)
4. Register the tool in `src/index.ts`
5. Test using the connector in `connect.ts`

### API Integration
1. Create or update service in `src/services/`
2. Define proper TypeScript interfaces in `src/models/`
3. Handle errors appropriately
4. Return data in consistent format

## Notes
- Keep the typo `fommat` instead of `format` in tool responses for consistency with existing code
- The server runs on a configurable PORT from environment variables
- Use ES modules syntax with `.js` extensions in imports
