import dotenv from "dotenv";
import axios from "axios";
import { JiraIssue, JQLResponse, JiraIssueCreateRequest, JiraSearchResponse } from "../models/jira.js";

// Ensure environment variables are loaded
dotenv.config();

// Initialize JIRA API URL and credentials from environment variables
const JIRA_API_URL = process.env.JIRA_API_URL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_USERNAME = process.env.JIRA_USERNAME || "shahidain@gmail.com"; // Default or from env

// Log configuration status at startup
if (!JIRA_API_TOKEN) {
  console.warn('WARNING: JIRA_API_TOKEN not found in environment variables. JIRA API calls may fail without authentication.');
} else if (!JIRA_USERNAME) {
  console.warn('WARNING: JIRA_USERNAME not found in environment variables. Using default username for authentication.');
} else {
  console.log(`JIRA API initialized with URL: ${JIRA_API_URL}`);
};

const createJiraClient = () => {
  const client = axios.create({
    baseURL: JIRA_API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  client.interceptors.request.use(
    (config) => {
      if (JIRA_API_TOKEN && JIRA_USERNAME) {
        const authToken = Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString('base64');
        config.headers = config.headers || {};
        config.headers.Authorization = `Basic ${authToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return client;
};

const jiraClient = createJiraClient();
export class JiraService {
  
  /**
   * Search JIRA issues using JQL
   */
  static async searchIssues(jql: string): Promise<JiraSearchResponse | undefined> {
    const url = `${JIRA_API_URL}/search`;
    console.log(`Searching JIRA issues with JQL: ${jql} with URL: ${url}`);
    const response = await jiraClient.get<JQLResponse>(url, {
      params: { jql }
    });
    const jiraSearchResponse = this.GetJiraIssueSearchResponse(response.data);
    return jiraSearchResponse;
  };

  /**
   * Create a new JIRA issue
   */
  static async createIssue(issueData: JiraIssueCreateRequest): Promise<JiraIssue> {
    const url = `${JIRA_API_URL}/issue`;
    const response = await jiraClient.post<JiraIssue>(url, issueData);
    return response.data;
  };

  private static GetJiraIssueSearchResponse = (jqlResponse: JQLResponse): JiraSearchResponse | undefined => {
    if (!jqlResponse || !jqlResponse.issues) {
      console.error('Invalid JQL response or no issues found');
      return undefined;
    }
    const jiraSearchResponse: JiraSearchResponse = {
      expand: jqlResponse.expand,
      startAt: jqlResponse.startAt,
      maxResults: jqlResponse.maxResults,
      total: jqlResponse.total,
      issues: jqlResponse.issues.map(issue => ({
        key: issue.key,
        fixVersions: issue.fields.fixVersions?.map(v => v.name) || [],
        type: issue.fields.issuetype.name,
        sprint: issue.fields.customfield_10020 && issue.fields.customfield_10020[0]
      ? `${issue.fields.customfield_10020[0]?.name} - ${issue.fields.customfield_10020[0]?.state || '-'}`
      : '',
        assignee: issue.fields.assignee?.displayName || '',
        status: issue.fields.status.name,
        storyPoints: issue.fields.customfield_10016 || '-',
        created: new Date(issue.fields.created),
        updated: issue.fields.updated ? new Date(issue.fields.updated) : undefined,
        summary: issue.fields.summary || '',
        parent: `${issue.fields.parent?.key || ''}  ${issue.fields.parent?.fields.issuetype.name || '-'}`,
        flagged: issue.fields.customfield_10021 && issue.fields.customfield_10021[0]?.value || null,
        subtasks: issue.fields.subtasks ? issue.fields.subtasks.length : 0
      }))
    };
    return jiraSearchResponse;
  };
};
