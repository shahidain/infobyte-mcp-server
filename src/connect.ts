import { EventSource } from 'eventsource';
import axios from 'axios';
import { randomUUID } from 'crypto';

const MCP_SERVER_URL = 'http://localhost:8000/';
let SSE_SESSION_ID: string | undefined = undefined;
const eventSource = new EventSource(`${MCP_SERVER_URL}sse`);

eventSource.onerror = (err) => {
  console.error("SSE error:", err);
  eventSource.close();
};

const handleInvokeArthematicOperationResponse = (data: any, messageId: string) => {
  if(data?.result && data?.id === messageId) {
    console.log(`Response for message ID ${messageId}:`, data.result.content[0].text);
  }
};


async function invokeArthematicOperation(firstNumber: number, secondNumber: number) {
  const messageId = randomUUID();

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleInvokeArthematicOperationResponse(data, messageId);
  };

  try {
    await axios.post(`${MCP_SERVER_URL}messages`, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'add_two_numbers',
        arguments: {
          firstNumber: firstNumber,
          secondNumber: secondNumber,
        },
        sessionId: SSE_SESSION_ID
      },
      id: messageId,
    }).then(response => {
      console.log('Tool invoked successfully:', response.data);
    }).catch(error => {
      console.error('Error invoking tool using axios:', error.response?.data || error.message);
    });
  } catch (error) {
    console.error('Error invoking tool:', error);
  }
};

process.on('SIGINT', () => {
  console.log('Closing SSE connection...');
  eventSource.close();
  process.exit(0);
});

invokeArthematicOperation(25.6, 50);