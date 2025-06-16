import { atom } from "jotai";
import { marketData as fallbackData } from "../lib/marketData";
import type { FilterState, MarketData } from "../types";

// Global state to prevent multiple API calls across component instances
const GlobalState = {
  lastFetchTime: 0,
  updateTimer: null as NodeJS.Timeout | null,
  isUpdating: false,
  activeInstances: 0,
  minTimeBetweenUpdates: 60000, // 60 seconds minimum between updates
};

// UI state atoms
export const isDarkModeAtom = atom(false);
export const errorAtom = atom<string | null>(null);
export const isShortcutsHelpOpenAtom = atom(false);

// View state atoms
export const currentViewAtom = atom<"market" | "news" | "movers" | "volatility" | "rmi">("market");

// RMI view state atoms
export const rmiSelectedRegionAtom = atom<"americas" | "emea" | "asiaPacific">("americas");
export const rmiSelectedSecurityAtom = atom<string>("");
export const rmiBenchmarkIndexAtom = atom<string | undefined>("SPX:IND");
export const rmiTimeRangeAtom = atom<"1D" | "1W" | "1M" | "3M" | "YTD" | "1Y">("1M");

// Filter state atoms
export const showMoversAtom = atom(false);
export const showVolatilityAtom = atom(false);
export const showRatiosAtom = atom(false);
export const showFuturesAtom = atom(false);
export const showAvatAtom = atom(true);
export const show10DAtom = atom(false);
export const showYTDAtom = atom(true);
export const showCADAtom = atom(false);

// Composite filter state atom for convenience
export const filtersAtom = atom(
  (get) =>
    ({
      showMovers: get(showMoversAtom),
      showVolatility: get(showVolatilityAtom),
      showRatios: get(showRatiosAtom),
      showFutures: get(showFuturesAtom),
      showAvat: get(showAvatAtom),
      show10D: get(show10DAtom),
      showYTD: get(showYTDAtom),
      showCAD: get(showCADAtom),
    }) as FilterState
);

// Market data atoms
export const marketDataAtom = atom<MarketData>(fallbackData);
export const isLoadingAtom = atom(false);
export const lastUpdatedAtom = atom<Date | null>(null);
export const lastServerFetchAtom = atom<Date | null>(null);
export const dataSourceAtom = atom<string>("local");
export const isFromRedisAtom = atom(false);
export const isRealTimeEnabledAtom = atom(false);
export const lastSparklineUpdateAtom = atom<Date | null>(null);
export const updatedCellsAtom = atom<Record<string, boolean>>({});
export const updatedSparklinesAtom = atom<Record<string, boolean>>({});

// Derived atoms
export const themeClassAtom = atom((get) => (get(isDarkModeAtom) ? "dark" : "light"));

// Global state atoms (for internal use)
export const globalStateAtom = atom(GlobalState);
