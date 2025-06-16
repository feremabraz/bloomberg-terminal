"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { fetchMarketData, simulateMarketUpdate } from "../api/market-data";
import {
  dataSourceAtom,
  isFromRedisAtom,
  isRealTimeEnabledAtom,
  lastUpdatedAtom,
  updatedCellsAtom,
  updatedSparklinesAtom,
} from "../atoms";
import type { MarketData, MarketItem } from "../types";

// Query keys
export const MARKET_DATA_KEY = "marketData";

/**
 * Custom hook for fetching and managing market data using React Query
 * This is a simplified version that relies on React Query's polling
 */
export function useMarketDataQuery() {
  const [updatedCells, setUpdatedCells] = useAtom(updatedCellsAtom);
  const [updatedSparklines, setUpdatedSparklines] = useAtom(updatedSparklinesAtom);
  const [lastUpdated, setLastUpdated] = useAtom(lastUpdatedAtom);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useAtom(isRealTimeEnabledAtom);
  const [dataSource, setDataSource] = useAtom(dataSourceAtom);
  const [isFromRedis, setIsFromRedis] = useAtom(isFromRedisAtom);

  // Refs for tracking updates
  const prevDataRef = useRef<MarketData | null>(null);

  // Use React Query to fetch market data with appropriate polling
  const {
    data: marketData,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: [MARKET_DATA_KEY],
    queryFn: fetchMarketData,
    // Configure polling based on isRealTimeEnabled
    refetchInterval: isRealTimeEnabled ? 30000 : 300000, // 30 seconds in real-time mode, 5 minutes otherwise
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: false,
    gcTime: 3600000, // 1 hour
  });

  // Track changes between previous and current data
  useEffect(() => {
    // Skip if no data or no previous data
    if (!marketData || !prevDataRef.current) {
      prevDataRef.current = marketData;
      return;
    }

    // Skip if data hasn't changed
    if (marketData === prevDataRef.current) {
      return;
    }

    const oldData = prevDataRef.current;
    const newData = marketData;

    // Track which cells have been updated
    const newUpdatedCells: Record<string, boolean> = {};
    const newUpdatedSparklines: Record<string, boolean> = {};

    // Compare with previous data to highlight changes
    for (const region of ["americas", "emea", "asiaPacific"]) {
      if (
        !oldData[region] ||
        !newData[region] ||
        !Array.isArray(oldData[region]) ||
        !Array.isArray(newData[region])
      )
        continue;

      for (const [index, oldItem] of (oldData[region] as MarketItem[]).entries()) {
        const newItem = newData[region]?.[index];
        if (newItem && oldItem) {
          // Check all fields for changes
          const fieldsToCheck = ["value", "change", "pctChange", "avat", "time", "ytd", "ytdCur"];

          for (const field of fieldsToCheck) {
            if (oldItem[field as keyof MarketItem] !== newItem[field as keyof MarketItem]) {
              newUpdatedCells[`${region}-${newItem.id}-${field}`] = true;
            }
          }

          // Check if sparkline data has changed
          if (JSON.stringify(oldItem.sparkline1) !== JSON.stringify(newItem.sparkline1)) {
            newUpdatedSparklines[`${region}-${newItem.id}`] = true;
          }
        }
      }
    }

    // Only update atoms if there are actual changes
    if (Object.keys(newUpdatedCells).length > 0) {
      setUpdatedCells(newUpdatedCells);
    }

    if (Object.keys(newUpdatedSparklines).length > 0) {
      setUpdatedSparklines(newUpdatedSparklines);
    }

    // Update last updated time
    setLastUpdated(new Date());

    // Update data source info if it exists
    if (newData.source) {
      setDataSource(newData.source);
    }

    if (newData.fromRedis !== undefined) {
      setIsFromRedis(newData.fromRedis);
    }

    // Update the previous data ref
    prevDataRef.current = marketData;
  }, [
    marketData,
    setUpdatedCells,
    setUpdatedSparklines,
    setLastUpdated,
    setDataSource,
    setIsFromRedis,
  ]);

  // Toggle real-time updates
  const toggleRealTimeUpdates = useCallback(() => {
    setIsRealTimeEnabled((prev) => !prev);
  }, [setIsRealTimeEnabled]);

  // Force a manual refresh
  const refreshData = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    marketData,
    isLoading,
    error,
    lastUpdated,
    dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt) : new Date(),
    updatedCells,
    updatedSparklines,
    isRealTimeEnabled,
    dataSource,
    isFromRedis,
    toggleRealTimeUpdates,
    refreshData,
  };
}
