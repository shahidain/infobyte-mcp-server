import 'dotenv/config';
import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ArithmeticOperations } from "./tools/arithmeticOperations.js";
import { FetchProduct, FetchAllProducts, FetchProductsByCategory } from './tools/products.js';
import { FetchJiraIssues } from './tools/jira.js';
import dotenv from 'dotenv';

dotenv.config();
const transports: { [sessionId: string]: SSEServerTransport } = {};

const server = new McpServer(
 { name: "Infobyte MCP Server", version: "1.0.0" },
 { capabilities: { tools: {}}}
);

// Register tools with the MCP server
ArithmeticOperations(server);
FetchProduct(server);
FetchAllProducts(server);
FetchProductsByCategory(server);
FetchJiraIssues(server);

const app = express();
app.use(express.json());

app.get("/sse", async (req: Request, res: Response) => {
  const sseTransport = new SSEServerTransport("/messages", res);
  const sessionId = sseTransport.sessionId;
  transports[sessionId] = sseTransport;
  res.on("close", () => {
    console.log(`SSE connection closed for sessionId: ${sessionId}`);
    delete transports[sessionId];
  });
  await server.connect(sseTransport).then(async () => {
    sseTransport.send({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "tool-name-to-invoke",
        arguments: {},
        sessionId: sessionId
      },
      id: "your-message-unique-id"  
    });
  });
});

app.post("/messages", async (req: Request, res: Response) => {
  
  const receivedMessage = req.body; 
  console.log("Received message:", receivedMessage);
  const sessionId = receivedMessage?.params?.sessionId;
  const transport = transports[sessionId];
  
  if (!transport) {
    console.error(`SSE transport session id not found: ${sessionId}`);
    return res.status(404).json({ error: "SSE transport session id not found" });
  };
  
  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling SSE message:', error);
    res.status(500).json({ error: 'Internal server error' });
  };

});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    server: "Infobyte MCP Server",
    version: "1.0.0",
    uptime: process.uptime(),
    activeConnections: Object.keys(transports).length
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint available at http://localhost:${PORT}/sse`);
});
