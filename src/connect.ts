import { EventSource } from 'eventsource';
import axios from 'axios';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

class MCPConnector {
  private eventSource: EventSource;
  private sessionId: string | undefined = undefined;
  private mcpServerUrl: string;
  private connectionReady: Promise<string>;
  private resolveConnection!: (sessionId: string) => void;
  
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
      }
      if (data?.result?.content[0]?.fommat === 'json') {
        try {
          const content = JSON.parse(data.result.content[0].text);
          console.log('Received content:', JSON.stringify(content, null, 2));
        } catch (error) {
          console.error('Error parsing JSON content:', error);
        }
      }
      else 
        console.log('Received tool response:', data?.result?.content[0]?.text);
    };

    process.on('SIGINT', () => {
      this.close();
      process.exit(0);
    });
  };

  async invokeTool(toolName: string, args: any): Promise<void> {
    const messageId = randomUUID();
    const sessionId = await this.connectionReady;
    try {
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
  }

  public close(): void {
    console.log('Closing MCP connection...');
    this.eventSource.close();
  };

};

async function main() {
  const PORT = process.env.PORT;
  const mcpConnector = new MCPConnector(`http://localhost:${PORT}/`);
  await mcpConnector.invokeTool('add_two_numbers', { firstNumber: 25.6, secondNumber: 50 });
};

main();
