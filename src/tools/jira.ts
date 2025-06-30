import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { JiraService } from "../services/jiraService.js";


export const FetchJiraIssues = (server: McpServer) => {
  server.tool(
    'fetch_jira_issues',
    `Fetches Jira issues based on the provided JQL query. Parameter: 'jql' (type: string) - The JQL (Jira Query Language) query to filter and search for issues. Use JQL syntax to specify criteria such as project, status, assignee, etc. Examples: 'project = MYPROJ', 'status = "In Progress"', 'assignee = currentUser() AND status != Done'. Leave empty or use 'order by created DESC' for recent issues.`,
    {
      jql: z.string().describe("The JQL (Jira Query Language) query to filter and search for issues. Use JQL syntax to specify criteria such as project, status, assignee, etc. Examples: 'project = MYPROJ', 'status = \"In Progress\"', 'assignee = currentUser() AND status != Done'. Leave empty or use 'order by created DESC' for recent issues.")
    },
    async ({ jql }) => {
      const issues = await JiraService.searchIssues(jql);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(issues),
            fommat: 'json'
          }
        ],
        isError: false
      };
    }
  );
}