/** Envelope returned by every BACKEND endpoint (see BACKEND/src/shared/types/appErrors.ts) */
export interface ApiResult<T> {
  success: boolean;
  message: string;
  data?: T;
  /** Zod issues on validation failures */
  error?: unknown;
  /** HTTP status code returned by the server */
  statusCode?: number;
}

