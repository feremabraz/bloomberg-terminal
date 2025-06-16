"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { useAtom } from "jotai";
import { SparklineCell } from ".";
import {
  currentViewAtom,
  filtersAtom,
  rmiBenchmarkIndexAtom,
  rmiSelectedRegionAtom,
  rmiSelectedSecurityAtom,
  show10DAtom,
  showAvatAtom,
  showCADAtom,
  showFuturesAtom,
  showMoversAtom,
  showRatiosAtom,
  showVolatilityAtom,
  showYTDAtom,
} from "../atoms";
import { convertToCAD, formatCurrency } from "../lib/currency-utils";
import { bloombergColors, cn } from "../lib/theme-config";
import type { MarketItem } from "../types";

type MarketRowProps = {
  item: MarketItem;
  region: string;
  isDarkMode: boolean;
  updatedCells: Record<string, boolean>;
  updatedSparklines: Record<string, boolean>;
};

export function MarketRow({
  item,
  region,
  isDarkMode,
  updatedCells,
  updatedSparklines,
}: MarketRowProps) {
  // Jotai atoms for filter state
  const [filters] = useAtom(filtersAtom);
  const [showCAD] = useAtom(showCADAtom);
  const [showYTD] = useAtom(showYTDAtom);
  const [showAvat] = useAtom(showAvatAtom);
  const [show10D] = useAtom(show10DAtom);
  const [showMovers] = useAtom(showMoversAtom);
  const [showVolatility] = useAtom(showVolatilityAtom);
  const [showRatios] = useAtom(showRatiosAtom);
  const [showFutures] = useAtom(showFuturesAtom);
  // Jotai atoms for navigation
  const [, setCurrentView] = useAtom(currentViewAtom);
  const [, setSelectedRegion] = useAtom(rmiSelectedRegionAtom);
  const [, setSelectedSecurity] = useAtom(rmiSelectedSecurityAtom);
  const [, setBenchmarkIndex] = useAtom(rmiBenchmarkIndexAtom);

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;
  const fixedColumnClass = "w-[120px] sm:w-[140px] whitespace-nowrap overflow-hidden text-ellipsis";

  // Handle RMI cell click to navigate to RMI view
  const handleRmiClick = () => {
    // Set the region based on the current row's region
    if (region === "americas") {
      setSelectedRegion("americas");
    } else if (region === "emea") {
      setSelectedRegion("emea");
    } else if (region === "asiapacific") {
      setSelectedRegion("asiaPacific");
    }
    // Set the selected security and default benchmark
    setSelectedSecurity(item.id);
    setBenchmarkIndex("SPX:IND"); // Default benchmark
    // Navigate to RMI view
    setCurrentView("rmi");
  };

  return (
    <TableRow className={`border-b border-[${colors.border}]`}>
      <TableCell
        className={cn(`sticky left-0 bg-[${colors.background}] px-2 py-1`, fixedColumnClass)}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[${colors.textSecondary}] text-xs`}>{item.num}</span>
          <span className={`text-[${colors.accent}] text-xs`}>{item.id}</span>
        </div>
      </TableCell>
      <TableCell
        className="px-2 py-1 text-center text-xs cursor-pointer hover:underline"
        style={{ color: colors.accent }}
        onClick={handleRmiClick}
        title="Click to view RMI analysis"
      >
        {item.rmi || "—"}
      </TableCell>

      <SparklineCell
        item={item}
        region={region}
        isDarkMode={isDarkMode}
        isHighlighted={updatedSparklines[`${region}-${item.id}-sparkline`]}
      />

      <TableCell
        className={cn(
          `px-2 py-1 text-right text-[${isDarkMode ? "#f5f5b8" : "#8b7500"}] text-xs`,
          updatedCells[`${region}-${item.id}-value`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {typeof item.value === "number" ? (
          showCAD ? (
            <span title={`USD: ${item.value.toFixed(2)}`}>
              {formatCurrency(convertToCAD(item.value), "CAD")}
            </span>
          ) : (
            formatCurrency(item.value, "USD")
          )
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell
        className={cn(
          "px-2 py-1 text-right text-xs",
          showYTD
            ? item.ytd > 0
              ? `text-[${colors.positive}]`
              : `text-[${colors.negative}]`
            : item.change > 0
              ? `text-[${colors.positive}]`
              : `text-[${colors.negative}]`,
          updatedCells[`${region}-${item.id}-change`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {showYTD ? (
          <span title={`Daily change: ${item.change > 0 ? "+" : ""}${item.change.toFixed(2)}`}>
            {item.ytd > 0 ? "+" : ""}
            {item.ytd.toFixed(2)}%
          </span>
        ) : typeof item.change === "number" ? (
          (item.change > 0 ? "+" : "") + item.change.toFixed(2)
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell
        className={cn(
          `px-2 py-1 text-right text-xs ${item.pctChange > 0 ? `text-[${colors.positive}]` : `text-[${colors.negative}]`}`,
          updatedCells[`${region}-${item.id}-pctChange`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {typeof item.pctChange === "number"
          ? `${item.pctChange > 0 ? "+" : ""}${item.pctChange.toFixed(2)}%`
          : "N/A"}
      </TableCell>
      <TableCell
        className={cn(
          `px-2 py-1 text-right text-xs ${item.avat > 0 ? `text-[${colors.positive}]` : `text-[${colors.negative}]`} ${showAvat ? "sm:table-cell" : "hidden"}`,
          updatedCells[`${region}-${item.id}-avat`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {typeof item.avat === "number" ? `${item.avat.toFixed(2)}%` : "N/A"}
      </TableCell>
      <TableCell
        className={cn(
          `px-2 py-1 text-right text-[${isDarkMode ? "#f5f5b8" : "#8b7500"}] text-xs hidden sm:table-cell`,
          updatedCells[`${region}-${item.id}-time`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {item.time || "N/A"}
      </TableCell>
      <TableCell
        className={cn(
          `px-2 py-1 text-right text-xs ${item.ytd > 0 ? `text-[${colors.positive}]` : `text-[${colors.negative}]`} hidden md:table-cell`,
          updatedCells[`${region}-${item.id}-ytd`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {typeof item.ytd === "number" ? `${item.ytd.toFixed(2)}%` : "N/A"}
      </TableCell>
      <TableCell
        className={cn(
          `px-2 py-1 text-right text-xs ${item.ytdCur > 0 ? `text-[${colors.positive}]` : `text-[${colors.negative}]`} hidden md:table-cell`,
          updatedCells[`${region}-${item.id}-ytdCur`] &&
            "bg-yellow-300 dark:bg-yellow-900 transition-colors duration-500"
        )}
      >
        {typeof item.ytdCur === "number" ? `${item.ytdCur.toFixed(2)}%` : "N/A"}
      </TableCell>
    </TableRow>
  );
}
