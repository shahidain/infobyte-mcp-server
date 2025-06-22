import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { JiraService } from "../services/jiraService.js";


export const FetchJiraIssues = (server: McpServer) => {
  server.tool(
    'fetch_jira_issues',
    'Fetches Jira issues based on the provided JQL query.',
    {
      jql: z.string().describe("The JQL query to filter issues.")
    },
    async ({ jql }) => {
      const issues = await JiraService.searchIssues(jql);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(issues),
            format: 'json'
          }
        ],
        isError: false
      };
    }
  );
}