"use client";

import { useAtom } from "jotai";
import { useCallback } from "react";
import {
  activeWatchlistAtom,
  addWatchlistAtom,
  closeConfirmModalAtom,
  confirmAndCloseModalAtom,
  confirmModalPropsAtom,
  isConfirmModalOpenAtom,
  isWatchlistOpenAtom,
  openConfirmModalAtom,
  watchlistsAtom,
} from "../atoms/terminal-ui";
import { defaultFilters, resetFiltersAtom, writableFiltersAtom } from "../atoms/terminal-ui";
import { ConfirmationModal } from "../core/confirmation-modal";
import { ShortcutsHelp } from "../core/keyboard-shortcuts";
import { Watchlist } from "../core/watchlist";
import { useTerminalUI } from "../hooks";
import { useMarketDataQuery } from "../hooks";
import { TerminalFilterBar } from "../layout/terminal-filter-bar";
import { TerminalHeader } from "../layout/terminal-header";
import { TerminalLayout } from "../layout/terminal-layout";
import type { FilterState, MarketItem } from "../types";
import MarketMoversView from "../views/market-movers-view";
import { MarketView } from "../views/market-view";
import NewsView from "../views/news-view";
import { RmiView } from "../views/rmi-view";
import VolatilityView from "../views/volatility-view";

export default function BloombergTerminal() {
  // Use our custom hooks for state management
  const {
    isDarkMode,
    error,
    setError,
    currentView,
    setCurrentView,
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
    handleThemeToggle,
    handleMarketView,
    handleNewsView,
    handleMoversView,
    handleVolatilityView,
    handleRmiView,
    handleCancelClick,
    handleNewClick,
    handleBlancClick,
    handleHelpClick,
  } = useTerminalUI();

  // Use Jotai atoms for state management
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useAtom(isConfirmModalOpenAtom);
  const [confirmModalProps, setConfirmModalProps] = useAtom(confirmModalPropsAtom);
  const [isWatchlistOpen, setIsWatchlistOpen] = useAtom(isWatchlistOpenAtom);
  const [watchlists, setWatchlists] = useAtom(watchlistsAtom);
  const [activeWatchlist, setActiveWatchlist] = useAtom(activeWatchlistAtom);
  const [filters, setFilters] = useAtom(writableFiltersAtom);
  const [, resetFilters] = useAtom(resetFiltersAtom);

  // Action atoms
  const [, openConfirmModal] = useAtom(openConfirmModalAtom);
  const [, closeConfirmModal] = useAtom(closeConfirmModalAtom);
  const [, confirmAndCloseModal] = useAtom(confirmAndCloseModalAtom);
  const [, addWatchlist] = useAtom(addWatchlistAtom);

  // Use our React Query hook for market data
  const { marketData: data, refreshData, toggleRealTimeUpdates, isLoading } = useMarketDataQuery();

  // Get all market indices for watchlist
  const allMarketIndices = useCallback(() => {
    const indices: string[] = [];
    if (data?.americas) {
      data.americas.forEach((item: MarketItem) => indices.push(item.id));
    }
    if (data?.emea) {
      data.emea.forEach((item: MarketItem) => indices.push(item.id));
    }
    if (data?.asiaPacific) {
      data.asiaPacific.forEach((item: MarketItem) => indices.push(item.id));
    }
    return indices;
  }, [data]);

  // Handle CANCL button with confirmation modal
  const handleCancelWithConfirm = () => {
    openConfirmModal({
      title: "Confirm Action",
      message: "Are you sure you want to cancel the current operation?",
      onConfirm: () => {
        // Reset any pending changes or operations
        console.log("Operation cancelled");
      },
    });
  };

  // Handle NEW button for watchlist
  const handleNewWatchlist = () => {
    setIsWatchlistOpen(true);
  };

  // Handle BLANC button with confirmation modal
  const handleBlancWithConfirm = () => {
    openConfirmModal({
      title: "Clear All Filters",
      message: "Are you sure you want to reset all filters to default?",
      onConfirm: () => {
        // Reset filters to default using the resetFiltersAtom
        resetFilters();
        console.log("Filters reset to default");
      },
    });
  };

  // Handle back from specialized views
  const handleBackFromView = () => {
    setCurrentView("market");
  };

  // Handle watchlist save
  const handleWatchlistSave = (watchlist: { name: string; indices: string[] }) => {
    addWatchlist(watchlist);
  };

  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: "n",
      ctrlKey: true,
      action: handleNewWatchlist,
      description: "Create new watchlist",
    },
    {
      key: "b",
      ctrlKey: true,
      action: handleBlancWithConfirm,
      description: "Reset all filters",
    },
    {
      key: "Escape",
      action: handleCancelWithConfirm,
      description: "Cancel current operation",
    },
    {
      key: "r",
      ctrlKey: true,
      action: refreshData,
      description: "Refresh data",
    },
    {
      key: "l",
      ctrlKey: true,
      action: toggleRealTimeUpdates,
      description: "Toggle live updates",
    },
    {
      key: "1",
      action: handleMarketView,
      description: "Show market view",
    },
    {
      key: "2",
      action: handleNewsView,
      description: "Show news view",
    },
    {
      key: "3",
      action: handleMoversView,
      description: "Show market movers",
    },
    {
      key: "4",
      action: handleVolatilityView,
      description: "Show volatility view",
    },
    {
      key: "?",
      action: handleHelpClick,
      description: "Show keyboard shortcuts",
    },
  ];

  // Render the appropriate view based on currentView state
  if (currentView === "news") {
    return (
      <TerminalLayout shortcuts={shortcuts}>
        <NewsView isDarkMode={isDarkMode} onBack={handleBackFromView} />
      </TerminalLayout>
    );
  }

  // Add the condition for the movers view
  if (currentView === "movers") {
    return (
      <TerminalLayout shortcuts={shortcuts}>
        <MarketMoversView
          isDarkMode={isDarkMode}
          onBack={handleBackFromView}
          marketData={data}
          onRefresh={refreshData}
          isLoading={isLoading}
        />
      </TerminalLayout>
    );
  }

  // Add the condition for the volatility view
  if (currentView === "volatility") {
    return (
      <TerminalLayout shortcuts={shortcuts}>
        <VolatilityView
          isDarkMode={isDarkMode}
          onBack={handleBackFromView}
          marketData={data}
          onRefresh={refreshData}
          isLoading={isLoading}
        />
      </TerminalLayout>
    );
  }

  // Add the condition for the RMI view
  if (currentView === "rmi") {
    return (
      <TerminalLayout shortcuts={shortcuts}>
        <RmiView />
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout shortcuts={shortcuts}>
      <TerminalHeader
        isDarkMode={isDarkMode}
        onCancelClick={handleCancelWithConfirm}
        onNewClick={handleNewWatchlist}
        onBlancClick={handleBlancWithConfirm}
        onNewsClick={handleNewsView}
        onMoversClick={handleMoversView}
        onVolatilityClick={handleVolatilityView}
        onRmiClick={handleRmiView}
        onHelpClick={handleHelpClick}
        onThemeToggle={handleThemeToggle}
      />

      <TerminalFilterBar isDarkMode={isDarkMode} watchlists={watchlists} />

      <MarketView isDarkMode={isDarkMode} />

      {/* Modals */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmAndCloseModal}
        title={confirmModalProps.title}
        message={confirmModalProps.message}
        isDarkMode={isDarkMode}
      />

      <Watchlist
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        isDarkMode={isDarkMode}
        marketIndices={allMarketIndices()}
        onSave={handleWatchlistSave}
      />

      <ShortcutsHelp
        shortcuts={shortcuts}
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
        isDarkMode={isDarkMode}
      />
    </TerminalLayout>
  );
}
