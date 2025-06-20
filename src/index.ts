import 'dotenv/config';
import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ArithmeticOperations } from './tools/ArthematicOperations.js';

const transports: { [sessionId: string]: SSEServerTransport } = {};

const server = new McpServer(
 { name: "Infobyte MCP Server", version: "1.0.0" },
 { capabilities: { tools: {}}}
);

ArithmeticOperations(server);

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
  const sessionId = receivedMessage?.params?.sessionId;
  const transport = transports[sessionId] ?? Object.values(transports)[0];
  
  if (!transport) {
    return res.status(404).json({ error: "SSE transport session id not found" });
  };
  
  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling SSE message:', error);
    res.status(500).json({ error: 'Internal server error' });
  };

});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint available at http://localhost:${PORT}/sse`);
});
