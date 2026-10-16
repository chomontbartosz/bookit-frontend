import { useCallback, useEffect, useState } from 'react';

interface FetchState<T> {
  data?: T;
  error?: unknown;
  loading: boolean;
}

/**
 * Loads data with `loader` (must be memoized). `reload()` refetches and keeps the
 * previous data on screen meanwhile.
 */
export function useFetch<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T>>({ loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loader().then(
      (data) => !cancelled && setState({ data, loading: false }),
      (error: unknown) => !cancelled && setState((prev) => ({ data: prev.data, error, loading: false })),
    );
    return () => {
      cancelled = true;
    };
  }, [loader, attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ data: prev.data, loading: true }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}
