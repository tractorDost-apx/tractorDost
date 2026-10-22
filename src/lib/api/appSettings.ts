import axios from 'axios';
import { apiClient } from './axios/axios';
import type { ApiResult } from '@/types/api/responses';
import type { AppSetting, AppSettingListMeta, AppSettingSummary } from '@/types/models/appSetting';

export interface AppSettingListData {
  appSettings: AppSetting[];
  meta: AppSettingListMeta;
}

export interface ListAppSettingsQuery {
  page: number;
  limit: number;
  search?: string;
}

/** Create body. Key is required and cannot change later. Description is omitted when blank. */
export interface CreateAppSettingInput {
  key: string;
  value: string;
  dataType: string;
  description?: string;
  isPublic: boolean;
}

/**
 * Update body. `value` and `dataType` must be sent together or not at all. `description` set to
 * null clears it.
 */
export interface UpdateAppSettingInput {
  value?: string;
  dataType?: string;
  description?: string | null;
  isPublic?: boolean;
}

export const appSettingAPI = {
  /** Paginated admin list with optional search on key and description. Values are decrypted. */
  getAll: async (query: ListAppSettingsQuery): Promise<ApiResult<AppSettingListData>> => {
    const response = await apiClient.get<ApiResult<AppSettingListData>>('/app-settings/getAll', {
      params: query,
    });
    return response.data;
  },

  /** Single setting by key. Admins receive the decrypted value. */
  getByKey: async (key: string): Promise<ApiResult<AppSetting>> => {
    const response = await apiClient.get<ApiResult<AppSetting>>(
      `/app-settings/get/${encodeURIComponent(key)}`
    );
    return response.data;
  },

  create: async (input: CreateAppSettingInput): Promise<ApiResult<AppSetting>> => {
    const response = await apiClient.post<ApiResult<AppSetting>>('/app-settings/create', input);
    return response.data;
  },

  /** Send only the fields that changed. The key is part of the URL and cannot be changed. */
  update: async (key: string, input: UpdateAppSettingInput): Promise<ApiResult<AppSetting>> => {
    const response = await apiClient.patch<ApiResult<AppSetting>>(
      `/app-settings/update/${encodeURIComponent(key)}`,
      input
    );
    return response.data;
  },

  delete: async (key: string): Promise<ApiResult<AppSettingSummary>> => {
    const response = await apiClient.delete<ApiResult<AppSettingSummary>>(
      `/app-settings/delete/${encodeURIComponent(key)}`
    );
    return response.data;
  },
};

/**
 * Readable message for an API error. Only the server's message is shown, never the request body,
 * so a setting value cannot leak into the UI through an error.
 */
export function getAppSettingErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data as { message?: string; error?: unknown } | undefined;
  const issues = getZodIssues(data?.error);
  if (issues.length > 0) return issues.map((issue) => issue.message).join(' ');
  return data?.message || fallback;
}

export interface ZodIssueLike {
  path?: Array<string | number>;
  message?: string;
}

function getZodIssues(error: unknown): ZodIssueLike[] {
  if (!Array.isArray(error)) return [];
  return (error as ZodIssueLike[]).filter((issue) => typeof issue?.message === 'string');
}

/**
 * Maps validation issues from a 422 response to form fields by their first path segment, so each
 * message can sit next to the input it refers to. Issues without a known field return under "form".
 */
export function getAppSettingFieldErrors(err: unknown): Record<string, string> {
  if (!axios.isAxiosError(err)) return {};
  const data = err.response?.data as { error?: unknown } | undefined;
  const errors: Record<string, string> = {};
  for (const issue of getZodIssues(data?.error)) {
    const field = String(issue.path?.[0] ?? 'form');
    errors[field] = errors[field] ? `${errors[field]} ${issue.message}` : (issue.message as string);
  }
  return errors;
}
