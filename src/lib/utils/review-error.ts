import { isAxiosError } from 'axios';

/** Pulls the backend's `message` out of an axios error, with a safe fallback. */
export function getReviewErrorMessage(err: unknown): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? err.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

/** True when the backend answered 404 (e.g. the user has not reviewed this target yet). */
export function isNotFoundError(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 404;
}
