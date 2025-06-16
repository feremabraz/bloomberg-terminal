"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAtom } from "jotai";
import { MarketSection } from ".";
import { filtersAtom, show10DAtom, showAvatAtom } from "../atoms";
import { useMarketDataQuery } from "../hooks";
import { bloombergColors, cn } from "../lib/theme-config";
import type { FilterState, MarketData } from "../types";

const fixedColumnClass = "w-[120px] sm:w-[140px] whitespace-nowrap overflow-hidden text-ellipsis";

type MarketTableProps = {
  data: MarketData;
  isDarkMode: boolean;
};

export function MarketTable({ data, isDarkMode }: MarketTableProps) {
  const { updatedCells, updatedSparklines } = useMarketDataQuery();
  const [filters] = useAtom(filtersAtom);
  const [showAvat] = useAtom(showAvatAtom);
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Safety check for data
  if (!data) {
    return (
      <div className="p-4 text-center">
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <Table className="w-full border-separate border-spacing-0">
      <TableHeader>
        <TableRow className={`bg-[${colors.surface}]`}>
          <TableHead
            className={cn(
              `sticky left-0 bg-[${colors.surface}] px-2 py-1 text-left font-bold`,
              fixedColumnClass
            )}
          >
            Market
          </TableHead>
          <TableHead className="px-2 py-1 text-center">RMI</TableHead>
          <TableHead className={`px-2 py-1 text-center bg-[${colors.surface}]`}>2Day</TableHead>
          <TableHead className="px-2 py-1 text-right">Value</TableHead>
          <TableHead className="px-2 py-1 text-right">Net Chg</TableHead>
          <TableHead className="px-2 py-1 text-right">%Chg</TableHead>
          <TableHead className={`px-2 py-1 text-right ${showAvat ? "sm:table-cell" : "hidden"}`}>
            Δ AVAT
          </TableHead>
          <TableHead className="px-2 py-1 text-right hidden sm:table-cell">Time</TableHead>
          <TableHead className="px-2 py-1 text-right hidden md:table-cell">%Ytd</TableHead>
          <TableHead className="px-2 py-1 text-right hidden md:table-cell">%YtdCur</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <MarketSection
          title="Americas"
          items={data.americas || []}
          sectionNum="1)"
          isDarkMode={isDarkMode}
          updatedCells={updatedCells}
          updatedSparklines={updatedSparklines}
        />
        <MarketSection
          title="EMEA"
          items={data.emea || []}
          sectionNum="2)"
          isDarkMode={isDarkMode}
          updatedCells={updatedCells}
          updatedSparklines={updatedSparklines}
        />
        <MarketSection
          title="Asia/Pacific"
          items={data.asiaPacific || []}
          sectionNum="3)"
          isDarkMode={isDarkMode}
          updatedCells={updatedCells}
          updatedSparklines={updatedSparklines}
        />
      </TableBody>
    </Table>
  );
}
