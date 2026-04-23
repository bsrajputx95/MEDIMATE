import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseApiOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Generic API Hook
// ============================================================================

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = {}
): ApiState<T> {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, fetchData, enabled]);

  return { data, isLoading, error, refetch: fetchData };
}

// ============================================================================
// Mutation Hook
// ============================================================================

interface MutationState<T, P> {
  mutate: (params: P) => Promise<T | null>;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<T, P>(
  mutator: (params: P) => Promise<T>,
  options: UseApiOptions = {}
): MutationState<T, P> {
  const { onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutator(params);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mutator, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, isLoading, error, reset };
}

// ============================================================================
// Optimistic Update Hook
// ============================================================================

interface OptimisticState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  update: (newData: T, rollback?: () => void) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useOptimisticUpdate<T>(
  fetcher: () => Promise<T>,
  updater: (data: T) => Promise<void>,
  options: UseApiOptions = {}
): OptimisticState<T> {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const update = useCallback(async (newData: T, rollback?: () => void) => {
    const previousData = data;
    setData(newData); // Optimistic update

    try {
      await updater(newData);
      onSuccess?.(newData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (rollback) {
        rollback();
      } else {
        setData(previousData); // Revert on error
      }
      onError?.(error);
    }
  }, [data, updater, onSuccess, onError]);

  return { data, isLoading, error, update, refetch: fetchData };
}

// ============================================================================
// Paginated Data Hook
// ============================================================================

interface PaginatedState<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePaginatedApi<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: { pageSize?: number; enabled?: boolean } = {}
): PaginatedState<T> {
  const { pageSize = 10, enabled = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum: number, append: boolean) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const result = await fetcher(pageNum, pageSize);
      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetcher, pageSize, enabled]);

  useEffect(() => {
    fetchData(1, false);
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      await fetchData(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(1, false);
  }, [fetchData]);

  return { data, isLoading, isLoadingMore, error, hasMore, loadMore, refresh };
}
