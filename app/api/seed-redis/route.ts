import { marketData as fallbackData } from "@/components/bloomberg/lib/marketData";
import { fetchAllMarketData, generateRandomSparkline } from "@/lib/alpha-vantage";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import type { MarketData, MarketItem } from "@/components/bloomberg/types";

export async function GET() {
  try {
    console.log("Seeding Redis with market data...");

    // Try to fetch data from Alpha Vantage
    let marketData: MarketData;
    try {
      marketData = await fetchAllMarketData();

      // Check if we got enough data
      const totalIndices =
        marketData.americas.length + marketData.emea.length + marketData.asiaPacific.length;
      if (totalIndices < 5) {
        throw new Error("Not enough data received from Alpha Vantage");
      }
    } catch (error) {
      console.warn("Error fetching from Alpha Vantage, using fallback data:", error);

      // Use fallback data with sparklines
      marketData = Object.keys(fallbackData).reduce(
        (acc: MarketData, key: string) => {
          if (key === "americas" || key === "emea" || key === "asiaPacific") {
            acc[key] = fallbackData[key].map((item) => ({
              id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
              num: item.num || "",
              rmi: item.rmi || "",
              value: item.value || 0,
              change: item.change || 0,
              pctChange: item.pctChange || 0,
              avat: item.avat || 0,
              time: item.time || new Date().toLocaleTimeString(),
              ytd: item.ytd || 0,
              ytdCur: item.ytdCur || 0,
              sparkline1: generateRandomSparkline(),
              sparkline2: generateRandomSparkline(),
            }));
          }
          return acc;
        },
        { ...fallbackData } as MarketData
      );
    }

    // Add timestamp to data
    const dataWithTimestamp = {
      ...marketData,
      lastUpdated: new Date().toISOString(),
    };

    // Try to store data in Redis
    try {
      await redis.set("market_data", dataWithTimestamp, { ex: 3600 });
      console.log("Data successfully stored in Redis");
    } catch (redisError) {
      console.error("Error storing data in Redis:", redisError);
      // Continue execution even if Redis fails - we'll return the data anyway
    }

    return NextResponse.json({
      success: true,
      message: "Market data processed successfully!",
      timestamp: new Date().toISOString(),
      source: marketData.dataSource || "fallback",
    });
  } catch (error) {
    console.error("Error in seed-redis route:", error);
    // Return a valid response even on error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process market data",
        details: String(error),
        fallbackUsed: true,
      },
      { status: 200 }
    ); // Using 200 instead of 500 to prevent crashing the client
  }
}
