"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { useAtom } from "jotai";
import { MarketRow } from ".";
import { bloombergColors, cn } from "../lib/theme-config";
import { 
  showMoversAtom, 
  showVolatilityAtom, 
  showRatiosAtom, 
  showFuturesAtom 
} from "../atoms";
import type { FilterState, MarketItem } from "../types";

type MarketSectionProps = {
  title: string;
  items: MarketItem[];
  sectionNum: string;
  isDarkMode: boolean;
  updatedCells: Record<string, boolean>;
  updatedSparklines: Record<string, boolean>;
};

export function MarketSection({
  title,
  items,
  sectionNum,
  isDarkMode,
  updatedCells,
  updatedSparklines,
}: MarketSectionProps) {
  // Use Jotai atoms for filter state
  const [showMovers] = useAtom(showMoversAtom);
  const [showVolatility] = useAtom(showVolatilityAtom);
  const [showRatios] = useAtom(showRatiosAtom);
  const [showFutures] = useAtom(showFuturesAtom);
  
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;
  const fixedColumnClass = "w-[120px] sm:w-[140px] whitespace-nowrap overflow-hidden text-ellipsis";
  const region = title.toLowerCase().replace("/", "");
  
  // Apply section-level filters
  let filteredItems = [...items];
  
  // Only show movers if the filter is active
  // Consider an item a "mover" if its percentage change is significant (> 1% or < -1%)
  if (showMovers) {
    filteredItems = filteredItems.filter(item => 
      Math.abs(item.pctChange) > 1.0
    );
  }
  
  // Only show items with significant volatility if the filter is active
  // Consider an item volatile if its AVAT value is high (> 10 or < -10)
  if (showVolatility) {
    filteredItems = filteredItems.filter(item => 
      Math.abs(item.avat) > 10.0
    );
  }
  
  // Only show ratio items if the filter is active
  // For this demo, let's consider specific market indices as "ratio" items
  if (showRatios) {
    filteredItems = filteredItems.filter(item => 
      // Consider major indices as ratio items for demonstration purposes
      ["S&P", "DOW", "NASDAQ", "FTSE"].some(term => item.id.includes(term)) ||
      // Items with specific P/E ratio characteristics (using ytd as a proxy)
      Math.abs(item.ytd) > 10.0
    );
  }
  
  // Only show futures if the filter is active
  // For this demo, let's consider specific market items as "futures"
  if (showFutures) {
    filteredItems = filteredItems.filter(item => 
      // Consider these specific indices as futures-related for demonstration
      ["DAX", "CAC", "IBEX", "NIKKEI", "HANG SENG"].some(term => item.id.includes(term)) ||
      // Items with specific characteristics (using avat as a proxy)
      Math.abs(item.avat) > 20.0
    );
  }

  // Handle case where items is undefined or not an array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={10} className="text-center py-4">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>No data available for {title}</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  
  // Handle case where all items are filtered out
  if (filteredItems.length === 0) {
    return (
      <>
        <TableRow className={`bg-[${colors.surface}]`}>
          <TableCell
            className={cn(
              `sticky left-0 bg-[${colors.surface}] px-2 py-1 text-left font-bold`,
              fixedColumnClass
            )}
            colSpan={1}
          >
            {sectionNum} {title}
          </TableCell>
          <TableCell colSpan={9} />
        </TableRow>
        <TableRow>
          <TableCell colSpan={10} className="text-center py-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>No matching items with current filters</span>
            </div>
          </TableCell>
        </TableRow>
      </>
    );
  }

  return (
    <>
      <TableRow className={`bg-[${colors.surface}]`}>
        <TableCell
          className={cn(
            `sticky left-0 bg-[${colors.surface}] px-2 py-1 text-left font-bold`,
            fixedColumnClass
          )}
          colSpan={1}
        >
          {sectionNum} {title}
        </TableCell>
        <TableCell colSpan={9} />
      </TableRow>

      {filteredItems.map((item, index) => (
        <MarketRow
          key={`${item.id}-${index}`}
          item={item}
          region={region}
          isDarkMode={isDarkMode}
          updatedCells={updatedCells}
          updatedSparklines={updatedSparklines}
        />
      ))}
    </>
  );
}
