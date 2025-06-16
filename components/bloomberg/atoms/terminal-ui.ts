import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import type { FilterState } from "../types";
import {
  show10DAtom,
  showAvatAtom,
  showCADAtom,
  showFuturesAtom,
  showMoversAtom,
  showRatiosAtom,
  showVolatilityAtom,
  showYTDAtom,
} from "./index";

// Modal state atoms
export const isConfirmModalOpenAtom = atom(false);
export const confirmModalPropsAtom = atom({
  title: "",
  message: "",
  onConfirm: () => {},
});

// Writable filters atom
export const writableFiltersAtom = atom(
  // Get function - read from individual atoms
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
    }) as FilterState,
  // Set function - update individual atoms
  (get, set, newFilters: FilterState) => {
    set(showMoversAtom, newFilters.showMovers);
    set(showVolatilityAtom, newFilters.showVolatility);
    set(showRatiosAtom, newFilters.showRatios);
    set(showFuturesAtom, newFilters.showFutures);
    set(showAvatAtom, newFilters.showAvat);
    set(show10DAtom, newFilters.show10D);
    set(showYTDAtom, newFilters.showYTD);
    set(showCADAtom, newFilters.showCAD);
  }
);

// Default filters for reset
export const defaultFilters: FilterState = {
  showMovers: false,
  showVolatility: false,
  showRatios: false,
  showFutures: false,
  showAvat: true,
  show10D: false,
  showYTD: true,
  showCAD: false,
};

// Reset filters atom
export const resetFiltersAtom = atom(null, (get, set) => {
  set(writableFiltersAtom, defaultFilters);
});

// Watchlist state atoms
export const isWatchlistOpenAtom = atom(false);
export const watchlistsAtom = atom<Array<{ name: string; indices: string[] }>>([]);
export const activeWatchlistAtom = atom<string | null>(null);

// Derived atoms for watchlist operations
export const addWatchlistAtom = atom(
  (get) => get(watchlistsAtom),
  (get, set, newWatchlist: { name: string; indices: string[] }) => {
    set(watchlistsAtom, [...get(watchlistsAtom), newWatchlist]);
    set(activeWatchlistAtom, newWatchlist.name);
  }
);

// Confirmation modal actions
export const openConfirmModalAtom = atom(
  (get) => get(isConfirmModalOpenAtom),
  (get, set, props: { title: string; message: string; onConfirm: () => void }) => {
    set(confirmModalPropsAtom, props);
    set(isConfirmModalOpenAtom, true);
  }
);

export const closeConfirmModalAtom = atom(
  (get) => get(isConfirmModalOpenAtom),
  (get, set) => {
    set(isConfirmModalOpenAtom, false);
  }
);

export const confirmAndCloseModalAtom = atom(
  (get) => get(isConfirmModalOpenAtom),
  (get, set) => {
    const props = get(confirmModalPropsAtom);
    props.onConfirm();
    set(isConfirmModalOpenAtom, false);
  }
);
