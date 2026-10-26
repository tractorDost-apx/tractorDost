import type { AxiosError, AxiosResponse } from 'axios';
import type { ApiResult } from '@/types/api/responses';

/** Normalise a successful axios response; 204 No Content has an empty body */
export function toResult<T>(response: AxiosResponse, fallbackMessage = 'Done'): ApiResult<T> {
  if (response.status === 204 || !response.data) {
    return { success: true, message: fallbackMessage, statusCode: response.status };
  }
  const data = response.data as ApiResult<T>;
  return {
    ...data,
    statusCode: response.status,
  };
}

/** Turn an axios error into the same envelope the backend sends */
export function toErrorResult<T>(error: unknown, fallbackMessage: string): ApiResult<T> {
  const err = error as AxiosError<{ message?: string; error?: unknown; statusCode?: number }>;
  const statusCode = err.response?.status || err.response?.data?.statusCode;
  return {
    success: false,
    message: err.response?.data?.message || fallbackMessage,
    error: err.response?.data?.error,
    statusCode,
  };
}

