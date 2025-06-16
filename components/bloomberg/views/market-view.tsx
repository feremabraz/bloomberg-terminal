"use client";

import { useMarketDataQuery } from "../hooks";
import { bloombergColors } from "../lib/theme-config";
import { MarketTable } from "../ui";
import { GeneralMarketAnalysis } from "../ui/general-market-analysis";

type MarketViewProps = {
  isDarkMode: boolean;
};

export function MarketView({ isDarkMode }: MarketViewProps) {
  const { marketData: data, isLoading, error } = useMarketDataQuery();
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-pulse text-center">
          <p className="text-lg font-mono">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-mono">Error loading market data</p>
        <p className="text-sm mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <MarketTable data={data} isDarkMode={isDarkMode} />
      </div>

      {/* AI Market Analysis for general market data */}
      <div className="px-4 pb-6">
        <GeneralMarketAnalysis marketData={data} colors={colors} />
      </div>
    </div>
  );
}
