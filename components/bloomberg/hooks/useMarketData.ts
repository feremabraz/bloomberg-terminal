"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  fetchAllMarketData,
  fetchMarketItemById,
  fetchMarketMovers,
  fetchRegionMarketData,
  fetchVolatileMarkets,
  refreshMarketData,
} from "../api/market-data-api";
import { queryKeys } from "../api/query-keys";
import {
  dataSourceAtom,
  isFromRedisAtom,
  isRealTimeEnabledAtom,
  lastUpdatedAtom,
  updatedCellsAtom,
  updatedSparklinesAtom,
} from "../atoms";
import type { MarketData, MarketItem } from "../types";

/**
 * Hook for fetching all market data
 */
export function useAllMarketData() {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useAtom(isRealTimeEnabledAtom);
  const [, setLastUpdated] = useAtom(lastUpdatedAtom);
  const [, setDataSource] = useAtom(dataSourceAtom);
  const [, setIsFromRedis] = useAtom(isFromRedisAtom);

  const queryClient = useQueryClient();

  // Main query for all market data
  const marketDataQuery = useQuery({
    queryKey: queryKeys.marketData.list(),
    queryFn: fetchAllMarketData,
    refetchInterval: isRealTimeEnabled ? 30000 : 300000, // 30 seconds in real-time mode, 5 minutes otherwise
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: false,
    gcTime: 3600000, // 1 hour
  });

  // Update atoms when data changes
  useEffect(() => {
    if (marketDataQuery.data) {
      // Update Jotai atoms with metadata
      setLastUpdated(new Date());

      if (marketDataQuery.data.source) {
        setDataSource(marketDataQuery.data.source as string);
      }

      if (marketDataQuery.data.fromRedis !== undefined) {
        setIsFromRedis(marketDataQuery.data.fromRedis as boolean);
      }
    }
  }, [marketDataQuery.data, setLastUpdated, setDataSource, setIsFromRedis]);

  // Mutation for manually refreshing data
  const refreshMutation = useMutation({
    mutationFn: refreshMarketData,
    onSuccess: () => {
      // Invalidate and refetch all market data related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketData.all,
      });
      // Also invalidate derived queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.marketMovers.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.volatility.all,
      });
    },
  });

  // Toggle real-time updates
  const toggleRealTimeUpdates = useCallback(() => {
    setIsRealTimeEnabled((prev: boolean) => !prev);
    // No need to manually refetch here, as changing isRealTimeEnabled
    // will automatically adjust the refetchInterval in the query
  }, [setIsRealTimeEnabled]);

  // Force a manual refresh
  const refreshData = useCallback(() => {
    return refreshMutation.mutate();
  }, [refreshMutation]);

  // Create a selector for specific market data regions
  const getRegionData = useCallback(
    (region: string) => {
      if (!marketDataQuery.data) return [];
      return (marketDataQuery.data[region] as MarketItem[]) || [];
    },
    [marketDataQuery.data]
  );

  return {
    marketData: marketDataQuery.data,
    isLoading: marketDataQuery.isPending,
    isRefetching: marketDataQuery.isRefetching,
    error: marketDataQuery.error,
    dataUpdatedAt: marketDataQuery.dataUpdatedAt
      ? new Date(marketDataQuery.dataUpdatedAt)
      : new Date(),
    isRealTimeEnabled,
    toggleRealTimeUpdates,
    refreshData,
    getRegionData,
  };
}

/**
 * Hook for fetching market data by region
 */
export function useRegionMarketData(regions: string[] = ["americas", "emea", "asiaPacific"]) {
  const [isRealTimeEnabled] = useAtom(isRealTimeEnabledAtom);

  // Use useQueries for multiple related queries
  const regionsQueries = useQueries({
    queries: regions.map((region) => ({
      queryKey: queryKeys.marketData.region(region),
      queryFn: () => fetchRegionMarketData(region),
      refetchInterval: isRealTimeEnabled ? 30000 : 300000,
      staleTime: 10000,
      refetchOnWindowFocus: false,
      gcTime: 3600000,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
        isError: results.some((result) => result.isError),
        error: results.find((result) => result.error)?.error,
      };
    },
  });

  // Combine the results into a single object
  const combinedData = useMemo(() => {
    const result: Partial<MarketData> = {};

    // Access the data array from the combined results
    const dataArray = regionsQueries.data;

    regions.forEach((region, index) => {
      if (dataArray?.[index]) {
        result[region] = dataArray[index];
      }
    });

    return result as MarketData;
  }, [regions, regionsQueries]);

  const isLoading = regionsQueries.pending;
  const isError = regionsQueries.isError;
  const error = regionsQueries.error;

  return {
    marketData: combinedData,
    isLoading,
    isError,
    error,
    queries: regionsQueries,
  };
}

/**
 * Hook for fetching market movers
 */
export function useMarketMovers() {
  const [isRealTimeEnabled] = useAtom(isRealTimeEnabledAtom);
  const queryClient = useQueryClient();

  // First check if we already have market data in the cache
  const marketDataQuery = useQuery({
    queryKey: queryKeys.marketMovers.list(),
    queryFn: fetchMarketMovers,
    refetchInterval: isRealTimeEnabled ? 30000 : 300000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
    gcTime: 3600000,
  });

  return marketDataQuery;
}

/**
 * Hook for fetching volatile markets
 */
export function useVolatileMarkets() {
  const [isRealTimeEnabled] = useAtom(isRealTimeEnabledAtom);
  const queryClient = useQueryClient();

  const volatilityQuery = useQuery({
    queryKey: queryKeys.volatility.list(),
    queryFn: fetchVolatileMarkets,
    refetchInterval: isRealTimeEnabled ? 30000 : 300000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
    gcTime: 3600000,
  });

  return volatilityQuery;
}

/**
 * Hook for fetching a specific market item by ID
 */
export function useMarketItem(id: string) {
  const [isRealTimeEnabled] = useAtom(isRealTimeEnabledAtom);

  const itemQuery = useQuery({
    queryKey: queryKeys.marketData.detail(id),
    queryFn: () => fetchMarketItemById(id),
    refetchInterval: isRealTimeEnabled ? 30000 : 300000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
    gcTime: 3600000,
    // Only fetch if we have an ID
    enabled: !!id,
  });

  return itemQuery;
}

/**
 * Hook for tracking updated cells and sparklines
 * This is a selector that derives state from the market data
 */
export function useMarketDataUpdates() {
  const queryClient = useQueryClient();
  const [updatedCells, setUpdatedCells] = useAtom(updatedCellsAtom);
  const [updatedSparklines, setUpdatedSparklines] = useAtom(updatedSparklinesAtom);

  // Get the current market data from the query cache
  const currentData = queryClient.getQueryData<MarketData>(queryKeys.marketData.list());

  // Track previous data with a ref
  const previousDataRef = useRef<MarketData | undefined>(undefined);

  // Update previous data ref when current data changes
  useEffect(() => {
    if (currentData && currentData !== previousDataRef.current) {
      previousDataRef.current = structuredClone(currentData);
    }
  }, [currentData]);

  const previousData = previousDataRef.current;

  // Calculate updates whenever the data changes
  useMemo(() => {
    if (!currentData || !previousData || currentData === previousData) {
      return;
    }

    const newUpdatedCells: Record<string, boolean> = {};
    const newUpdatedSparklines: Record<string, boolean> = {};

    // Compare with previous data to highlight changes
    for (const region of ["americas", "emea", "asiaPacific"]) {
      if (!previousData || !currentData) continue;

      const prevRegionData = previousData[region] as MarketItem[] | undefined;
      const currRegionData = currentData[region] as MarketItem[] | undefined;

      if (
        !prevRegionData ||
        !currRegionData ||
        !Array.isArray(prevRegionData) ||
        !Array.isArray(currRegionData)
      )
        continue;

      for (const [index, oldItem] of prevRegionData.entries()) {
        const newItem = currRegionData[index];
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
  }, [currentData, previousData, setUpdatedCells, setUpdatedSparklines]);

  return {
    updatedCells,
    updatedSparklines,
  };
}

/**
 * Wrapper hook that contains all the market data hooks
 * This is used to provide a single hook for all market data
 */
export function useMarketDataQuery() {
  const {
    marketData,
    isLoading,
    error,
    dataUpdatedAt,
    isRealTimeEnabled,
    toggleRealTimeUpdates,
    refreshData,
    getRegionData,
  } = useAllMarketData();

  const { updatedCells, updatedSparklines } = useMarketDataUpdates();
  const [lastUpdated] = useAtom(lastUpdatedAtom);
  const [dataSource] = useAtom(dataSourceAtom);
  const [isFromRedis] = useAtom(isFromRedisAtom);

  // Create selectors for specific data views
  const getAmericasData = useCallback(() => getRegionData("americas"), [getRegionData]);
  const getEmeaData = useCallback(() => getRegionData("emea"), [getRegionData]);
  const getAsiaPacificData = useCallback(() => getRegionData("asiaPacific"), [getRegionData]);

  return {
    marketData,
    isLoading,
    error,
    lastUpdated,
    dataUpdatedAt,
    updatedCells,
    updatedSparklines,
    isRealTimeEnabled,
    dataSource,
    isFromRedis,
    toggleRealTimeUpdates,
    refreshData,
    // Selectors for derived state
    getAmericasData,
    getEmeaData,
    getAsiaPacificData,
    getRegionData,
  };
}
