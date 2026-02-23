/**
 * Performance Cache System
 * Intelligent caching with TTL to prevent unnecessary API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class PerformanceCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private static instance: PerformanceCache;

  private constructor() {}

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache();
    }
    return PerformanceCache.instance;
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Get cache entry if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if entry exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear specific entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear entries matching pattern
   */
  clearPattern(pattern: RegExp): void {
    Array.from(this.cache.keys()).forEach((key) => {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
  } {
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((entry) => {
      const isExpired = Date.now() - entry.timestamp > entry.ttl;
      if (isExpired) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
    };
  }
}

/**
 * Fetch with automatic caching
 */
export async function cachedFetch<T>(
  url: string,
  options: {
    cacheTtl?: number; // Cache TTL in milliseconds, 0 to disable
    forceRefresh?: boolean;
    headers?: HeadersInit;
  } = {}
): Promise<T> {
  const cache = PerformanceCache.getInstance();
  const { cacheTtl = 5 * 60 * 1000, forceRefresh = false, headers } = options;

  // Check cache first
  if (!forceRefresh && cacheTtl > 0 && cache.has(url)) {
    console.log(`[v0] Cache hit: ${url}`);
    return cache.get<T>(url)!;
  }

  // Fetch from API
  console.log(`[v0] Cache miss, fetching: ${url}`);
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const data = await response.json() as T;

  // Cache result if TTL > 0
  if (cacheTtl > 0) {
    cache.set(url, data, cacheTtl);
  }

  return data;
}

/**
 * Debounced fetch to prevent multiple simultaneous requests
 */
export function createDebouncedFetch<T>(delayMs: number = 300) {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<T> | null = null;

  return async (
    url: string,
    options: {
      cacheTtl?: number;
      forceRefresh?: boolean;
      headers?: HeadersInit;
    } = {}
  ): Promise<T> => {
    // If already pending, return existing promise
    if (pendingPromise) {
      return pendingPromise;
    }

    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await cachedFetch<T>(url, options);
          resolve(result);
          pendingPromise = null;
        } catch (error) {
          reject(error);
          pendingPromise = null;
        }
      }, delayMs);

      pendingPromise = new Promise((res, rej) => {
        // Store the resolve/reject for later
      }) as Promise<T>;
    });
  };
}

/**
 * Get singleton cache instance
 */
export function getCache(): PerformanceCache {
  return PerformanceCache.getInstance();
}

/**
 * Clear cache on logout
 */
export function clearCacheOnLogout(): void {
  getCache().clear();
  console.log('[v0] Cache cleared on logout');
}

/**
 * Invalidate claim-related cache
 */
export function invalidateClaimsCache(): void {
  const cache = getCache();
  cache.clearPattern(/\/api\/claims/);
  cache.clearPattern(/\/api\/inquiries/);
  console.log('[v0] Claims cache invalidated');
}

/**
 * Invalidate user profile cache
 */
export function invalidateProfileCache(): void {
  const cache = getCache();
  cache.clearPattern(/\/api\/profile/);
  console.log('[v0] Profile cache invalidated');
}
