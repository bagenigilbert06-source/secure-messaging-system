/**
 * SWR Data Fetching Hooks
 * Efficient client-side data synchronization with automatic caching and revalidation
 */

'use client';

import { useCallback, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface SWRConfig {
  refreshInterval?: number; // ms between refreshes
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number; // ms to deduplicate requests
  focusThrottleInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

interface UseSWRReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T | Promise<T>) => Promise<T | undefined>;
  revalidate: () => Promise<T | undefined>;
}

/**
 * Custom SWR implementation for simplified data fetching
 * Real production apps should use the 'swr' npm package
 */
export function useSWR<T = unknown>(
  key: string | null,
  fetcher: () => Promise<T>,
  config: SWRConfig = {}
): UseSWRReturn<T> {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(!data && !error);
  const [isValidating, setIsValidating] = useState(false);

  const {
    refreshInterval = 0,
    revalidateOnFocus = true,
    errorRetryCount = 3,
    errorRetryInterval = 5000,
    onSuccess,
    onError,
  } = config;

  const mutate = useCallback(
    async (newData?: T | Promise<T>): Promise<T | undefined> => {
      if (newData !== undefined) {
        if (newData instanceof Promise) {
          setIsValidating(true);
          try {
            const resolved = await newData;
            setData(resolved);
            setError(undefined);
            onSuccess?.(resolved);
            return resolved;
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onError?.(error);
            throw error;
          } finally {
            setIsValidating(false);
          }
        } else {
          setData(newData);
          setError(undefined);
          onSuccess?.(newData);
          return newData;
        }
      }
      return data;
    },
    [data, onSuccess, onError]
  );

  const revalidate = useCallback(async (): Promise<T | undefined> => {
    if (!key) return;

    setIsValidating(true);
    let retries = 0;

    const attemptFetch = async (): Promise<T | undefined> => {
      try {
        const result = await fetcher();
        setData(result);
        setError(undefined);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (retries < errorRetryCount) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, errorRetryInterval));
          return attemptFetch();
        }

        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsValidating(false);
      }
    };

    return attemptFetch();
  }, [key, fetcher, errorRetryCount, errorRetryInterval, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (!key) return;

    setIsLoading(true);
    revalidate().catch(err => {
      console.error(`[useSWR] Error fetching ${key}:`, err);
    });
  }, [key, revalidate]);

  // Refresh interval
  useEffect(() => {
    if (!key || !refreshInterval) return;

    const interval = setInterval(() => {
      revalidate().catch(err => {
        console.error(`[useSWR] Error refreshing ${key}:`, err);
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [key, refreshInterval, revalidate]);

  // Revalidate on focus
  useEffect(() => {
    if (!key || !revalidateOnFocus) return;

    const handleFocus = () => {
      revalidate().catch(err => {
        console.error(`[useSWR] Error revalidating on focus ${key}:`, err);
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [key, revalidateOnFocus, revalidate]);

  return {
    data,
    error,
    isLoading: isLoading && !data,
    isValidating,
    mutate,
    revalidate,
  };
}

/**
 * Hook to fetch items list
 */
export function useFetchItems(
  page: number = 1,
  category?: string,
  searchQuery?: string,
  config: SWRConfig = {}
) {
  const endpoint = `/api/items?page=${page}${category ? `&category=${category}` : ''}${
    searchQuery ? `&search=${searchQuery}` : ''
  }`;

  return useSWR(
    endpoint,
    () => apiClient.get(endpoint),
    { refreshInterval: 5 * 60 * 1000, ...config } // Refresh every 5 minutes
  );
}

/**
 * Hook to fetch current user
 */
export function useFetchUser(config: SWRConfig = {}) {
  return useSWR(
    '/api/auth/me',
    () => apiClient.get('/api/auth/me'),
    { refreshInterval: 10 * 60 * 1000, ...config } // Refresh every 10 minutes
  );
}

/**
 * Hook to fetch user's reported items
 */
export function useMyItems(config: SWRConfig = {}) {
  return useSWR(
    '/api/items/my-items',
    () => apiClient.get('/api/items/my-items'),
    { refreshInterval: 2 * 60 * 1000, ...config } // Refresh every 2 minutes
  );
}

/**
 * Hook to fetch user's claims history
 */
export function useMyClaimsHistory(config: SWRConfig = {}) {
  return useSWR(
    '/api/items/my-claims',
    () => apiClient.get('/api/items/my-claims'),
    { refreshInterval: 2 * 60 * 1000, ...config } // Refresh every 2 minutes
  );
}

/**
 * Hook to search items in real-time
 */
export function useSearchItems(
  query: string,
  config: SWRConfig = {}
) {
  return useSWR(
    query ? `/api/items/search?q=${encodeURIComponent(query)}` : null,
    () => apiClient.get(`/api/items/search?q=${encodeURIComponent(query)}`),
    { refreshInterval: 3 * 60 * 1000, ...config } // Refresh every 3 minutes
  );
}

/**
 * Hook to fetch single item details
 */
export function useFetchItem(itemId: string, config: SWRConfig = {}) {
  return useSWR(
    itemId ? `/api/items/${itemId}` : null,
    () => apiClient.get(`/api/items/${itemId}`),
    { ...config }
  );
}

/**
 * Hook for notifications - lightweight polling
 */
export function useNotifications(config: SWRConfig = {}) {
  return useSWR(
    '/api/notifications',
    () => apiClient.get('/api/notifications'),
    { refreshInterval: 30 * 1000, ...config } // Refresh every 30 seconds
  );
}
