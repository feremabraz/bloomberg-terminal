import type { MarketData, MarketItem } from "../types";

/**
 * Fetches all market data from the API
 */
export async function fetchAllMarketData(): Promise<MarketData> {
  const response = await fetch("/api/market-data");

  if (!response.ok) {
    throw new Error(`Failed to fetch market data: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches market data for a specific region
 * @param region The region to fetch data for (americas, emea, asiaPacific)
 */
export async function fetchRegionMarketData(region: string): Promise<MarketItem[]> {
  const allData = await fetchAllMarketData();
  return allData[region] as MarketItem[] || [];
}

/**
 * Fetches market data for a specific market item by ID
 * @param id The ID of the market item to fetch
 */
export async function fetchMarketItemById(id: string): Promise<MarketItem | null> {
  const allData = await fetchAllMarketData();
  
  // Search through all regions for the item with matching ID
  for (const region of ["americas", "emea", "asiaPacific"]) {
    const items = allData[region] as MarketItem[];
    if (!items) continue;
    
    const item = items.find(item => item.id === id);
    if (item) return item;
  }
  
  return null;
}

/**
 * Fetches market movers (items with significant price changes)
 */
export async function fetchMarketMovers(): Promise<MarketItem[]> {
  const allData = await fetchAllMarketData();
  const movers: MarketItem[] = [];
  
  // Collect items with significant price changes from all regions
  for (const region of ["americas", "emea", "asiaPacific"]) {
    const items = allData[region] as MarketItem[];
    if (!items) continue;
    
    // Consider an item a "mover" if its percentage change is significant
    const significantMovers = items.filter(
      item => Math.abs(item.pctChange) > 1.0 // More than 1% change
    );
    
    movers.push(...significantMovers);
  }
  
  // Sort by absolute percentage change (descending)
  return movers.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));
}

/**
 * Fetches market items with high volatility
 */
export async function fetchVolatileMarkets(): Promise<MarketItem[]> {
  const allData = await fetchAllMarketData();
  const volatileItems: MarketItem[] = [];
  
  // Collect items with high volatility from all regions
  for (const region of ["americas", "emea", "asiaPacific"]) {
    const items = allData[region] as MarketItem[];
    if (!items) continue;
    
    // Use avat (Average Trading Volume) as a proxy for volatility
    const highVolatilityItems = items.filter(item => item.avat > 1.5);
    volatileItems.push(...highVolatilityItems);
  }
  
  // Sort by volatility (descending)
  return volatileItems.sort((a, b) => b.avat - a.avat);
}

/**
 * Triggers a manual refresh of the market data
 */
export async function refreshMarketData(): Promise<{ success: boolean }> {
  const response = await fetch("/api/market-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "update" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh market data: ${response.status}`);
  }

  return response.json();
}
