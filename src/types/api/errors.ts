export interface ServerIssue {
  code: string;
  path: (string | number)[];
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: ServerIssue[] | string | Record<string, unknown>;
  statusCode?: number;
}

export class ApiClientError extends Error {
  statusCode?: number;
  issues?: ServerIssue[];

  constructor(message: string, statusCode?: number, issues?: ServerIssue[]) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.issues = issues;
  }
}
