"use client";

import {
  AlertTriangle,
  BarChart2,
  Database,
  HelpCircle,
  Moon,
  Newspaper,
  RefreshCw,
  Sun,
  TrendingUp,
  Wifi,
  Activity,
} from "lucide-react";
import { BloombergButton } from "../core/bloomberg-button";
import { useMarketDataQuery } from "../hooks";
import { bloombergColors } from "../lib/theme-config";

type TerminalHeaderProps = {
  isDarkMode: boolean;
  onCancelClick: () => void;
  onNewClick: () => void;
  onBlancClick: () => void;
  onNewsClick: () => void;
  onMoversClick: () => void;
  onVolatilityClick: () => void;
  onRmiClick: () => void;
  onHelpClick: () => void;
  onThemeToggle: () => void;
};

export function TerminalHeader({
  isDarkMode,
  onCancelClick,
  onNewClick,
  onBlancClick,
  onNewsClick,
  onMoversClick,
  onVolatilityClick,
  onRmiClick,
  onHelpClick,
  onThemeToggle,
}: TerminalHeaderProps) {
  const {
    isLoading,
    isRealTimeEnabled,
    isFromRedis,
    dataSource,
    lastUpdated,
    refreshData,
    toggleRealTimeUpdates,
  } = useMarketDataQuery();

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Calculate how fresh the data is
  const getDataFreshnessIndicator = () => {
    if (!lastUpdated) return null;

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    let color = "bg-green-500"; // Fresh data (< 10 seconds)
    let pulseClass = "animate-pulse";

    if (diffSeconds > 60) {
      color = "bg-red-500"; // Stale data (> 60 seconds)
      pulseClass = "";
    } else if (diffSeconds > 30) {
      color = "bg-yellow-500"; // Aging data (30-60 seconds)
      pulseClass = "animate-pulse";
    } else if (diffSeconds > 10) {
      color = "bg-green-500"; // Slightly aged data (10-30 seconds)
      pulseClass = "";
    }

    return (
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${color} ${pulseClass}`} />
        <span className="text-xs">{diffSeconds}s</span>
      </div>
    );
  };

  return (
    <div className={`flex flex-wrap gap-1 bg-[${colors.surface}] px-2 py-1`}>
      <BloombergButton color="red" onClick={onCancelClick}>
        CANCL
      </BloombergButton>
      <BloombergButton color="green" onClick={onNewClick}>
        NEW
      </BloombergButton>
      <BloombergButton color="green" onClick={onBlancClick}>
        BLANC
      </BloombergButton>
      <BloombergButton color="green" onClick={onNewsClick}>
        <Newspaper className="h-3 w-3 mr-1" />
        NEWS
      </BloombergButton>
      <BloombergButton color="green" onClick={onMoversClick}>
        <TrendingUp className="h-3 w-3 mr-1" />
        GMOV
      </BloombergButton>
      <BloombergButton color="green" onClick={onVolatilityClick}>
        <BarChart2 className="h-3 w-3 mr-1" />
        GVOL
      </BloombergButton>
      <BloombergButton color="green" onClick={onRmiClick}>
        <Activity className="h-3 w-3 mr-1" />
        RMI
      </BloombergButton>
      <BloombergButton color="green">RATC</BloombergButton>

      <BloombergButton color="accent" onClick={onHelpClick}>
        <HelpCircle className="h-3 w-3 mr-1" />
        HELP
      </BloombergButton>

      <BloombergButton color="accent" onClick={onThemeToggle}>
        {isDarkMode ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
        {isDarkMode ? "LIGHT" : "DARK"}
      </BloombergButton>

      {/* Redis Control Buttons */}
      <div className="ml-auto flex items-center gap-2">
        <BloombergButton color="accent" onClick={refreshData} disabled={isLoading}>
          REFR
        </BloombergButton>
        <BloombergButton
          color={isRealTimeEnabled ? "red" : "green"}
          onClick={toggleRealTimeUpdates}
          disabled={isLoading}
        >
          {isRealTimeEnabled ? "STOP" : "LIVE"}
        </BloombergButton>

        {/* Data Status */}
        <div className="flex items-center gap-2 text-xs">
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : isRealTimeEnabled ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : isFromRedis ? (
            <Database className="h-3 w-3 text-green-500" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
          )}
          <span className={isFromRedis ? "text-green-500" : "text-yellow-500"}>
            {dataSource === "alpha-vantage" ? "API" : isFromRedis ? "Redis" : "Local"}
          </span>
          {getDataFreshnessIndicator()}
          {lastUpdated && <span className="text-gray-400">{lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}
