/**
 * Market data refresh task
 * Fetches fresh data from Alpha Vantage and updates Redis
 */

import { fetchAllMarketData } from "./alpha-vantage";
import { redis } from "./redis";
import scheduler from "./scheduler";

// Function to refresh market data from Alpha Vantage and store in Redis
export async function refreshMarketData(): Promise<void> {
  try {
    console.log("Starting market data refresh from Alpha Vantage...");

    // Check if we already have data in Redis
    const existingData = await redis.get("market_data");

    // If we don't have data, or it's been more than 24 hours since last update
    if (!existingData || shouldRefreshData(existingData)) {
      // Fetch fresh data from Alpha Vantage
      const marketData = await fetchAllMarketData();

      // Check if we got enough data
      const totalIndices =
        marketData.americas.length + marketData.emea.length + marketData.asiaPacific.length;

      if (totalIndices < 5) {
        throw new Error("Not enough data received from Alpha Vantage");
      }

      // Add timestamp to data
      const dataWithTimestamp = {
        ...marketData,
        lastUpdated: new Date().toISOString(),
        lastFullRefresh: new Date().toISOString(),
      };

      // Store in Redis with 48-hour expiration (as backup in case scheduler fails)
      await redis.set("market_data", dataWithTimestamp, { ex: 48 * 60 * 60 });

      console.log("Market data successfully refreshed and stored in Redis");
      return;
    }

    console.log("Recent market data found in Redis, skipping refresh");
  } catch (error) {
    console.error("Error refreshing market data:", error);
    throw error;
  }
}

// Helper to determine if we should refresh the data
function shouldRefreshData(data: { lastFullRefresh?: string }): boolean {
  if (!data.lastFullRefresh) return true;

  const lastRefresh = new Date(data.lastFullRefresh).getTime();
  const now = Date.now();
  const hoursSinceLastRefresh = (now - lastRefresh) / (1000 * 60 * 60);

  // Refresh if it's been more than 23 hours
  return hoursSinceLastRefresh > 23;
}

// Register the task with the scheduler - refresh once every 24 hours
scheduler.register(
  "market-data-refresh",
  "Alpha Vantage Market Data Refresh",
  24, // Run every 24 hours
  refreshMarketData
);

export default refreshMarketData;
