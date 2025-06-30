import { EventSource } from 'eventsource';
import axios from 'axios';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { date } from 'zod';
dotenv.config();

class MCPConnector {
  private eventSource: EventSource;
  private sessionId: string | undefined = undefined;
  private mcpServerUrl: string;
  private connectionReady: Promise<string>;
  private resolveConnection!: (sessionId: string) => void;
  private pendingCallbacks: Map<string, (data: any) => void> = new Map();
  
  constructor(serverUrl: string) {
    this.mcpServerUrl = serverUrl;
    this.connectionReady = new Promise((resolve) => {
      this.resolveConnection = resolve;
    });
    this.eventSource = new EventSource(`${this.mcpServerUrl}sse`);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    
    this.eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      this.eventSource.close();
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.params?.sessionId) {
        this.sessionId = data?.params?.sessionId || this.sessionId;
        this.resolveConnection(this.sessionId!);
        return;
      };

      const callback = this.pendingCallbacks.get(data?.id);
      if(callback === undefined)
        return console.warn(`No callback found for message ID: ${data?.id}`);
      callback?.(data);
      this.pendingCallbacks.delete(data?.id);
    };

    process.on('SIGINT', () => {
      this.close();
      process.exit(0);
    });
  };

  async invokeTool(toolName: string, args: any, messageId: string, callBack: (data: any) => void): Promise<void> {
    const sessionId = await this.connectionReady;
    try {
      this.pendingCallbacks.set(messageId, callBack);
      await axios.post(`${this.mcpServerUrl}messages`, {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
          sessionId: sessionId
        },
        id: messageId,
      }).then(response => {
        console.log(`Tool ${toolName} invoked successfully:`, response.data);
      }).catch(error => {
        console.error(`Error invoking tool ${toolName} using axios:`, error.response?.data || error.message);
      });
    } catch (error) {
      console.error(`Error invoking tool ${toolName}:`, error);
    }
  };

  async fetchTools(callBack: (data: any) => void): Promise<void> {
    const sessionId = await this.connectionReady;
    const messageId = randomUUID();
    this.pendingCallbacks.set(messageId, callBack);
    try {
      await axios.post(`${this.mcpServerUrl}messages`, {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: { sessionId },
        id: messageId,
      });
    } catch (error) {
      console.error('Error fetching tools:', (error as any).response?.data || (error as any).message);
    }
  };

  public close(): void {
    console.log('Closing MCP connection...');
    this.eventSource.close();
  };

};

async function main() {
  const PORT = process.env.PORT;
  const mcpConnector = new MCPConnector(`http://localhost:${PORT}/`);
  const messageId = randomUUID();
  await mcpConnector.fetchTools((data) => {
    console.log('Message Ids:', `Response - ${data?.id} - Request - ${messageId}`);
    console.log('Tools:', JSON.stringify(data?.result?.tools, null, 2));
  });
  
  /*await mcpConnector.invokeTool('fetch_product', { id: 25 });
  await mcpConnector.invokeTool('fetch_all_products', { skip: 0, limit: 5 });
  await mcpConnector.invokeTool('fetch_products_by_category', { category: 'fragrances', skip: 0, limit: 5 }); */

  await mcpConnector.invokeTool('fetch_jira_issues', { jql: 'project = SCRUM AND issuetype = Story AND status = Done' }, messageId, (data) => {
    console.log('Message Ids:', `Response - ${data?.id} - Request - ${messageId}`);
    console.log('Jira Issues:', JSON.stringify(data?.result?.content, null, 2));
  });
};

main();
