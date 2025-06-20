import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export const ArithmeticOperations = (server: McpServer) => {
  server.tool(
    'Add Two Numbers',
    'Adds two numbers together. This tool accepts any two numeric values (integers or decimals) from the user and returns their sum.',
    {
      firstNumber: z.number().describe("The first number to add."),
      secondNumber: z.number().describe("The second number to add."),
    },
    async({ firstNumber, secondNumber }) => {
      if (typeof firstNumber !== 'number' || typeof secondNumber !== 'number') {
        throw new McpError(500, 'Both parameters must be numbers.');
      }
      const sum = firstNumber + secondNumber;
      return { 
        content:[
          {
            type: 'text',
            text: `The sum of ${firstNumber} and ${secondNumber} is ${sum}`
          }
        ]
      };
    }
  );
}