import { NextResponse } from "next/server"
import {
  getProductsServer,
  getFlashSalesServer,
  getLuxuryDealsServer,
  getTopPicksServer,
  getNewArrivalsServer,
  getTrendingServer,
  getDailyFindsServer,
} from "@/lib/server-api"

export async function GET() {
  // Single server endpoint to reduce client-side API bursts.
  // Uses server-api fetch caching (revalidate) for speed and stability.
  const [
    products,
    flashSales,
    luxuryDeals,
    topPicks,
    newArrivals,
    trending,
    dailyFinds,
  ] = await Promise.all([
    getProductsServer({ limit: 12, page: 1 }),
    getFlashSalesServer(12),
    getLuxuryDealsServer(12),
    getTopPicksServer(12),
    getNewArrivalsServer(12),
    getTrendingServer(12),
    getDailyFindsServer(12),
  ])

  return NextResponse.json(
    {
      products,
      flashSales,
      luxuryDeals,
      topPicks,
      newArrivals,
      trending,
      dailyFinds,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        // Let CDNs cache too (still safe because server-api already revalidates).
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  )
}
