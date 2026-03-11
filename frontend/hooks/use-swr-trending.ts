import useSWR, { type SWRConfiguration, mutate as globalMutate } from "swr"
import type { Product } from "@/types"
import { productService } from "@/services/product"
import { cloudinaryService } from "@/services/cloudinary-service"

// In-memory cache for instant display
let trendingCache: Product[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STALE_TIME = 30 * 1000 // 30 seconds

// Process product images
const processProducts = (products: Product[]): Product[] => {
  return products.map((product) => ({
    ...product,
    image_urls: (product.image_urls || []).map((url) => {
      if (typeof url === "string" && !url.startsWith("http")) {
        return cloudinaryService.generateOptimizedUrl(url)
      }
      return url
    }),
  }))
}

// Fetcher function with instant cache return
const trendingFetcher = async (): Promise<Product[]> => {
  try {
    const products = await productService.getProducts({
      limit: 12,
      trending: true,
    })

    if (products && products.length > 0) {
      const processed = processProducts(products).slice(0, 12)
      trendingCache = processed
      lastFetchTime = Date.now()
      return processed
    }

    // Fallback to popular products
    const fallbackProducts = await productService.getProducts({
      limit: 12,
      sort_by: "view_count",
      sort_order: "desc",
    })
    const processed = processProducts(fallbackProducts)
    trendingCache = processed
    lastFetchTime = Date.now()
    return processed
  } catch (error) {
    console.error("Error fetching trending:", error)
    if (trendingCache) {
      return trendingCache
    }
    throw error
  }
}

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  focusThrottleInterval: 300000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  revalidateIfStale: true,
  keepPreviousData: true,
  refreshInterval: 0,
  shouldRetryOnError: true,
}

export function useTrending(config?: SWRConfiguration) {
  const isCacheFresh = trendingCache && Date.now() - lastFetchTime < CACHE_DURATION

  const { data, error, isLoading, isValidating, mutate } = useSWR<Product[]>("trending", trendingFetcher, {
    ...defaultConfig,
    fallbackData: isCacheFresh ? trendingCache : undefined,
    ...config,
  })

  return {
    trending: data || trendingCache || [],
    isLoading: isLoading && !trendingCache,
    isValidating,
    isError: error,
    mutate,
    hasCachedData: !!trendingCache || !!data,
  }
}

export async function prefetchTrending(): Promise<void> {
  if (trendingCache && Date.now() - lastFetchTime < CACHE_DURATION) {
    return
  }

  try {
    const data = await trendingFetcher()
    await globalMutate("trending", data, false)
  } catch (error) {
    console.warn("Failed to prefetch trending:", error)
  }
}

export async function invalidateTrending(): Promise<void> {
  trendingCache = null
  lastFetchTime = 0
  await globalMutate("trending")
}

export function getCachedTrending(): Product[] | null {
  return trendingCache
}

export default useTrending
