import type { Product } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mizizzi-ecommerce-1.onrender.com";

// Safely extract a product list from diverse response shapes
function extractProducts(payload: any): Product[] {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getProductsServer(params: {
  page?: number;
  limit?: number;
  category_slug?: string;
  query?: Record<string, string | number | boolean | undefined>;
} = {}): Promise<Product[]> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;

  const url = new URL(`${API_BASE_URL}/api/products/`); // trailing slash avoids 308

  // backend uses per_page
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(limit));
  if (params.category_slug) url.searchParams.set("category_slug", params.category_slug);

  // Additional query params (feature flags like flash_sale, trending, new_arrival, etc.)
  if (params.query) {
    for (const [k, v] of Object.entries(params.query)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    // Cache on the Next.js server so the first paint isn't blocked by repeat calls.
    // Adjust as needed if products change more frequently.
    next: { revalidate: 60 },
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    // Don't throw hard on home page; allow the UI to render and client-side fetch to recover.
    console.error("[server-api] getProductsServer failed", res.status, res.statusText);
    return [];
  }

  const json = await res.json();
  return extractProducts(json);
}


export async function getFlashSalesServer(limit = 12): Promise<Product[]> {
  return getProductsServer({ page: 1, limit, query: { flash_sale: true, is_flash_sale: true, limit } });
}

export async function getTrendingServer(limit = 12): Promise<Product[]> {
  return getProductsServer({ page: 1, limit, query: { trending: true, is_trending: true, limit } });
}

export async function getNewArrivalsServer(limit = 12): Promise<Product[]> {
  return getProductsServer({ page: 1, limit, query: { new_arrival: true, is_new_arrival: true, limit } });
}


export async function getLuxuryDealsServer(limit = 12): Promise<Product[]> {
  return getProductsServer({ page: 1, limit, query: { luxury_deal: true, is_luxury_deal: true, limit } });
}

export async function getTopPicksServer(limit = 12): Promise<Product[]> {
  return getProductsServer({ page: 1, limit, query: { top_pick: true, is_top_pick: true, limit } });
}

export async function getDailyFindsServer(limit = 12): Promise<Product[]> {
  return getProductsServer({ page: 1, limit, query: { daily_find: true, is_daily_find: true, limit } });
}
