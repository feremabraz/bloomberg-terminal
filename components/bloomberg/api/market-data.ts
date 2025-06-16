// API functions for fetching market data

/**
 * Fetches market data from the API
 */
export async function fetchMarketData() {
  const response = await fetch("/api/market-data");

  if (!response.ok) {
    throw new Error(`Failed to fetch market data: ${response.status}`);
  }

  return response.json();
}

import type { MarketData, MarketItem } from "../types";

/**
 * Simulates market data updates on the client side
 * @param currentData The current market data
 */
export async function simulateMarketUpdate(currentData: MarketData) {
  // This function will be called client-side to simulate updates
  // without making additional API calls
  if (!currentData) return null;

  // Create a deep copy of the data to avoid mutating the original
  const updatedData = JSON.parse(JSON.stringify(currentData));

  // Simulate random changes to market values
  const regions = ["americas", "emea", "asiaPacific"];

  for (const region of regions) {
    if (!updatedData[region]) continue;

    for (const item of updatedData[region]) {
      // Randomly decide if this item should be updated (20% chance)
      if (Math.random() < 0.2) {
        // Generate a small random change
        const changeDirection = Math.random() > 0.5 ? 1 : -1;
        const changeAmount = Math.random() * 0.5; // Max 0.5% change

        // Update the value
        const oldValue = item.value;
        const newValue = oldValue * (1 + (changeAmount * changeDirection) / 100);

        // Update the item
        item.value = Number(newValue.toFixed(2));
        item.change = Number((newValue - oldValue).toFixed(2));
        item.pctChange = Number(((newValue / oldValue - 1) * 100).toFixed(2));

        // Update timestamp
        item.time = new Date().toLocaleTimeString();
      }
    }
  }

  return updatedData;
}
