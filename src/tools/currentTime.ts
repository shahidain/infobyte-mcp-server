import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export const GetCurrentTime = (server: McpServer) => {
  server.tool(
    'get_current_time',
    'Returns the current date and time. This tool provides the current timestamp in various formats including ISO string, local time, and Unix timestamp.',
    {
      format: z.enum(['iso', 'local', 'unix', 'detailed']).optional().describe("The format for the time output. Options: 'iso' (ISO 8601), 'local' (local string), 'unix' (Unix timestamp), 'detailed' (comprehensive format). Defaults to 'detailed'."),
    },
    async({ format = 'detailed' }) => {
      try {
        const now = new Date();
        let timeString = '';

        switch (format) {
          case 'iso':
            timeString = now.toISOString();
            break;
          case 'local':
            timeString = now.toLocaleString();
            break;
          case 'unix':
            timeString = Math.floor(now.getTime() / 1000).toString();
            break;
          case 'detailed':
          default:
            timeString = JSON.stringify({
              iso: now.toISOString(),
              local: now.toLocaleString(),
              unix: Math.floor(now.getTime() / 1000),
              utc: now.toUTCString(),
              date: now.toDateString(),
              time: now.toTimeString()
            }, null, 2);
            break;
        }

        return { 
          content:[
            {
              type: 'text',
              text: timeString,
              fommat: format === 'detailed' ? 'json' : 'text'
            }
          ],
          isError: false,
        };
      } catch (error) {
        throw new McpError(500, `Failed to get current time: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}