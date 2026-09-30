'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ApiResult } from '@/types/api/responses';

export interface ApiQueryState<T> {
  /** Last successful result; kept while a refetch is in flight */
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface Settled<T> {
  key: string | null;
  data: T | null;
  error: string | null;
}

/**
 * Run an API call returning the backend envelope and track loading/error.
 * Re-runs whenever `deps` change or `reload()` is called; stale responses are ignored.
 * `loading` is derived: it is true until a response for the current deps has settled.
 */
export function useApiQuery<T>(
  fetcher: () => Promise<ApiResult<T>>,
  deps: readonly unknown[]
): ApiQueryState<T> {
  const [version, setVersion] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ key: null, data: null, error: null });
  const key = JSON.stringify([...deps, version]);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((res) => {
      if (cancelled) return;
      setSettled((prev) =>
        res.success && res.data !== undefined
          ? { key, data: res.data, error: null }
          : { key, data: prev.data, error: res.message }
      );
    });
    return () => {
      cancelled = true;
    };
    // `key` captures deps + version; the fetcher closure is recreated each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return {
    data: settled.data,
    loading: settled.key !== key,
    error: settled.key === key ? settled.error : null,
    reload,
  };
}
