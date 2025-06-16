// Market data utilities for Bloomberg Terminal clone
import type { MarketItem } from "../types";

/**
 * Check if a security is considered a "mover" based on percentage change
 * @param item Market item to check
 * @param threshold Percentage change threshold (default: 1.5%)
 * @returns Boolean indicating if the security is a significant mover
 */
export function isSignificantMover(item: MarketItem, threshold = 1.5): boolean {
  return Math.abs(item.change) >= threshold;
}

/**
 * Check if a security has high volatility
 * @param item Market item to check
 * @param volatilityData Volatility data for the security (if available)
 * @param threshold Volatility threshold (default: 2.0)
 * @returns Boolean indicating if the security has high volatility
 */
export function hasHighVolatility(
  item: MarketItem,
  volatilityData: Record<string, number> = {},
  threshold = 2.0
): boolean {
  // If we have volatility data for this security, use it
  if (volatilityData[item.id]) {
    return volatilityData[item.id] >= threshold;
  }

  // Otherwise, use a simple heuristic based on price change
  // This is a simplified approach - real systems would use standard deviation of returns
  return Math.abs(item.change) >= threshold;
}

/**
 * Sort market items by absolute percentage change (for movers view)
 * @param items Array of market items
 * @returns Sorted array with biggest movers first
 */
export function sortByAbsoluteChange(items: MarketItem[]): MarketItem[] {
  return [...items].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/**
 * Filter market items to show only significant movers
 * @param items Array of market items
 * @param threshold Percentage change threshold
 * @returns Filtered array with only significant movers
 */
export function filterSignificantMovers(items: MarketItem[], threshold = 1.5): MarketItem[] {
  return items.filter((item) => isSignificantMover(item, threshold));
}

/**
 * Calculate the 10-day average value for a market item
 * @param historicalData 10-day historical data array
 * @returns Average value over the 10-day period
 */
export function calculate10DayAverage(historicalData: number[]): number {
  if (!historicalData || historicalData.length === 0) return 0;
  const sum = historicalData.reduce((acc, val) => acc + val, 0);
  return sum / historicalData.length;
}
