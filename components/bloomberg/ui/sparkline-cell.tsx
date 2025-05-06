"use client";

import { TableCell } from "@/components/ui/table";
import { useAtom } from "jotai";
import { bloombergColors, cn } from "../lib/theme-config";
import { generateHistoricalData } from "../lib/time-utils";
import { Sparkline } from "./sparkline";
import { show10DAtom } from "../atoms";
import type { MarketItem } from "../types";

type SparklineCellProps = {
  item: MarketItem;
  region: string;
  isDarkMode: boolean;
  isHighlighted: boolean;
};

export function SparklineCell({ item, region, isDarkMode, isHighlighted }: SparklineCellProps) {
  // Use Jotai atom for 10D filter state
  const [show10D] = useAtom(show10DAtom);
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Generate 10-day historical data if needed and not already available
  const tenDayData = item.historicalData10D || generateHistoricalData(10, item.value, 0.02);
  
  // Determine which data to display based on 10D filter state
  const displayData1 = show10D 
    ? tenDayData 
    : (item.sparkline1 || [0.5, 0.6, 0.4, 0.7, 0.5, 0.8, 0.6, 0.7]);
    
  const displayData2 = show10D 
    ? tenDayData.map((val, i) => val * (1 + (i % 3 === 0 ? 0.05 : -0.03))) // Create slight variation for second line
    : (item.sparkline2 || [0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 1.0, 0.8]);

  return (
    <TableCell
      className={cn(
        `px-2 py-1 w-[100px] bg-[${colors.surface}]`,
        isHighlighted && "bg-blue-300 dark:bg-blue-900 transition-colors duration-500"
      )}
    >
      <div className="flex justify-center">
        <Sparkline
          data1={displayData1}
          data2={displayData2}
          width={80}
          height={20}
          color1={colors.sparklineGray}
          color2={item.change > 0 ? colors.positive : colors.negative}
          isRealData={!!item.sparklineUpdated || show10D}
        />
        {show10D && (
          <div className="absolute top-0 right-0 text-[8px] text-gray-500">10D</div>
        )}
      </div>
    </TableCell>
  );
}
