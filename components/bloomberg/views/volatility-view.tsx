"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowLeft, ArrowUp, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { BloombergButton } from "../core/bloomberg-button";
import { bloombergColors } from "../lib/theme-config";
import { Sparkline } from "../ui/sparkline";

interface MarketIndex {
  id: string;
  num: string;
  rmi: string;
  value: number;
  change: number;
  pctChange: number;
  avat: number;
  time: string;
  ytd: number;
  ytdCur: number;
  sparkline1?: number[];
  sparkline2?: number[];
  twoDayData?: { date: string; value: number }[];
  region?: string;
}

interface VolatilityData {
  id: string;
  region: string;
  historicalVol: number;
  impliedVol?: number;
  volRatio: number;
  volTrend: "up" | "down" | "stable";
  dailyRange: number;
  weeklyRange: number;
  rsi?: number;
  sparkline: number[];
  value: number;
  change: number;
  pctChange: number;
}

interface VolatilityViewProps {
  isDarkMode: boolean;
  onBack: () => void;
  marketData: {
    americas: MarketIndex[];
    emea: MarketIndex[];
    asiaPacific: MarketIndex[];
    lastUpdated?: string;
  };
  onRefresh: () => void;
  isLoading: boolean;
}

export default function VolatilityView({
  isDarkMode,
  onBack,
  marketData,
  onRefresh,
  isLoading,
}: VolatilityViewProps) {
  const [volatilityData, setVolatilityData] = useState<VolatilityData[]>([]);
  const [filterType, setFilterType] = useState<"all" | "high" | "low">("all");
  const [sortField, setSortField] = useState<"historicalVol" | "volRatio" | "dailyRange">(
    "historicalVol"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showRegions, setShowRegions] = useState<Record<string, boolean>>({
    americas: true,
    emea: true,
    asiaPacific: true,
  });

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Calculate volatility metrics from market data
  useEffect(() => {
    const calculateVolatilityData = () => {
      const result: VolatilityData[] = [];

      // Process Americas
      if (marketData.americas) {
        for (const index of marketData.americas) {
          // Generate realistic volatility metrics based on existing data
          const historicalVol = generateHistoricalVolatility(index);
          const impliedVol = historicalVol * (1 + (Math.random() * 0.4 - 0.2)); // IV is usually close to HV but can vary
          const volRatio = historicalVol / (10 + Math.random() * 5); // Compare to baseline volatility
          const volTrend = Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable";
          const dailyRange = Math.abs(index.pctChange) * (0.8 + Math.random() * 0.4); // Daily high-low range
          const weeklyRange = dailyRange * (2 + Math.random()); // Weekly range is larger than daily
          const rsi = 30 + Math.random() * 40; // RSI between 30 and 70 typically

          result.push({
            id: index.id,
            region: "Americas",
            historicalVol,
            impliedVol,
            volRatio,
            volTrend: volTrend as "up" | "down" | "stable",
            dailyRange,
            weeklyRange,
            rsi,
            sparkline: generateVolatilitySparkline(
              historicalVol,
              volTrend as "up" | "down" | "stable"
            ),
            value: index.value,
            change: index.change,
            pctChange: index.pctChange,
          });
        }
      }

      // Process EMEA
      if (marketData.emea) {
        for (const index of marketData.emea) {
          const historicalVol = generateHistoricalVolatility(index);
          const impliedVol = historicalVol * (1 + (Math.random() * 0.4 - 0.2));
          const volRatio = historicalVol / (10 + Math.random() * 5);
          const volTrend = Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable";
          const dailyRange = Math.abs(index.pctChange) * (0.8 + Math.random() * 0.4);
          const weeklyRange = dailyRange * (2 + Math.random());
          const rsi = 30 + Math.random() * 40;

          result.push({
            id: index.id,
            region: "EMEA",
            historicalVol,
            impliedVol,
            volRatio,
            volTrend: volTrend as "up" | "down" | "stable",
            dailyRange,
            weeklyRange,
            rsi,
            sparkline: generateVolatilitySparkline(
              historicalVol,
              volTrend as "up" | "down" | "stable"
            ),
            value: index.value,
            change: index.change,
            pctChange: index.pctChange,
          });
        }
      }

      // Process Asia/Pacific
      if (marketData.asiaPacific) {
        for (const index of marketData.asiaPacific) {
          const historicalVol = generateHistoricalVolatility(index);
          const impliedVol = historicalVol * (1 + (Math.random() * 0.4 - 0.2));
          const volRatio = historicalVol / (10 + Math.random() * 5);
          const volTrend = Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable";
          const dailyRange = Math.abs(index.pctChange) * (0.8 + Math.random() * 0.4);
          const weeklyRange = dailyRange * (2 + Math.random());
          const rsi = 30 + Math.random() * 40;

          result.push({
            id: index.id,
            region: "Asia/Pacific",
            historicalVol,
            impliedVol,
            volRatio,
            volTrend: volTrend as "up" | "down" | "stable",
            dailyRange,
            weeklyRange,
            rsi,
            sparkline: generateVolatilitySparkline(
              historicalVol,
              volTrend as "up" | "down" | "stable"
            ),
            value: index.value,
            change: index.change,
            pctChange: index.pctChange,
          });
        }
      }

      return result;
    };

    const data = calculateVolatilityData();
    setVolatilityData(data);
  }, [marketData]);

  // Generate realistic historical volatility based on market data
  const generateHistoricalVolatility = (index: MarketIndex): number => {
    // Base volatility on absolute percentage change and add some randomness
    const baseVol = Math.abs(index.pctChange) * (1.5 + Math.random());

    // Add some market-specific adjustments
    let adjustedVol = baseVol;

    // Emerging markets tend to be more volatile
    if (
      index.id.includes("IBOVESPA") ||
      index.id.includes("HANG SENG") ||
      index.id.includes("CSI 300")
    ) {
      adjustedVol *= 1.3;
    }

    // Major indices tend to be less volatile
    if (
      index.id.includes("S&P 500") ||
      index.id.includes("DOW JONES") ||
      index.id.includes("FTSE 100")
    ) {
      adjustedVol *= 0.8;
    }

    // Ensure volatility is within realistic bounds (5% to 35%)
    return Math.max(5, Math.min(35, adjustedVol));
  };

  // Generate volatility sparkline data
  const generateVolatilitySparkline = (
    baseVol: number,
    trend: "up" | "down" | "stable"
  ): number[] => {
    const result = [];
    let currentVol = baseVol * 0.8; // Start a bit lower than current

    for (let i = 0; i < 10; i++) {
      // Add some randomness
      const noise = (Math.random() - 0.5) * 2;

      // Apply trend
      if (trend === "up") {
        currentVol += baseVol * 0.05 + noise;
      } else if (trend === "down") {
        currentVol -= baseVol * 0.05 - noise;
      } else {
        currentVol += noise;
      }

      // Keep within bounds
      currentVol = Math.max(baseVol * 0.5, Math.min(baseVol * 1.5, currentVol));

      result.push(currentVol);
    }

    // Normalize to 0-1 range for sparkline
    const min = Math.min(...result);
    const max = Math.max(...result);
    const range = max - min || 1;

    return result.map((val) => (val - min) / range);
  };

  // Filter and sort volatility data
  const getFilteredAndSortedData = () => {
    return volatilityData
      .filter((item) => {
        // Filter by region
        if (!showRegions[item.region.toLowerCase()]) {
          return false;
        }

        // Filter by volatility level
        if (filterType === "high" && item.historicalVol < 15) {
          return false;
        }
        if (filterType === "low" && item.historicalVol >= 15) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortOrder === "asc") {
          return aValue - bValue;
        }
        return bValue - aValue;
      });
  };

  const handleFilterChange = (type: "all" | "high" | "low") => {
    setFilterType(type);
  };

  const handleSortFieldChange = (field: "historicalVol" | "volRatio" | "dailyRange") => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleRegionToggle = (region: string) => {
    setShowRegions((prev) => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  // Get color class based on volatility level
  const getVolatilityColorClass = (vol: number) => {
    if (vol >= 25) return `text-[${colors.negative}] font-bold`;
    if (vol >= 15) return `text-[${colors.negative}]`;
    if (vol >= 10) return `text-[${colors.accent}]`;
    return `text-[${colors.positive}]`;
  };

  // Get background class based on volatility level
  const getVolatilityBgClass = (vol: number) => {
    if (vol >= 25) return "bg-red-900/20";
    if (vol >= 15) return "bg-red-900/10";
    if (vol >= 10) return "bg-amber-900/10";
    return "bg-green-900/10";
  };

  // Get trend icon
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className={`h-3 w-3 text-[${colors.negative}]`} />;
    if (trend === "down") return <TrendingDown className={`h-3 w-3 text-[${colors.positive}]`} />;
    return <span className="text-gray-500">—</span>;
  };

  const filteredData = getFilteredAndSortedData();

  return (
    <div className={`min-h-screen font-mono bg-[${colors.background}] text-[${colors.text}]`}>
      {/* Header */}
      <div className={`flex items-center gap-2 bg-[${colors.surface}] px-2 py-1`}>
        <BloombergButton color="default" onClick={onBack}>
          <ArrowLeft className="h-3 w-3 mr-1" />
          BACK
        </BloombergButton>
        <span className="text-sm font-bold">GLOBAL VOLATILITY</span>
        <div className="ml-auto flex items-center gap-2">
          <BloombergButton
            color={filterType === "all" ? "accent" : "default"}
            onClick={() => handleFilterChange("all")}
          >
            ALL
          </BloombergButton>
          <BloombergButton
            color={filterType === "high" ? "red" : "default"}
            onClick={() => handleFilterChange("high")}
          >
            HIGH VOL
          </BloombergButton>
          <BloombergButton
            color={filterType === "low" ? "green" : "default"}
            onClick={() => handleFilterChange("low")}
          >
            LOW VOL
          </BloombergButton>
          <BloombergButton color="accent" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : "REFR"}
          </BloombergButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`flex flex-wrap items-center gap-2 bg-[${colors.surface}] px-2 py-1 text-[${colors.accent}] text-xs sm:text-sm`}
      >
        <span>Regions:</span>
        <div className="flex items-center gap-1">
          <Checkbox
            id="americas-vol"
            checked={showRegions.americas}
            onCheckedChange={() => handleRegionToggle("americas")}
            className="h-3 w-3 rounded-none border-gray-500 data-[state=checked]:bg-gray-500"
          />
          <label htmlFor="americas-vol">Americas</label>
        </div>
        <div className="flex items-center gap-1">
          <Checkbox
            id="emea-vol"
            checked={showRegions.emea}
            onCheckedChange={() => handleRegionToggle("emea")}
            className="h-3 w-3 rounded-none border-gray-500 data-[state=checked]:bg-gray-500"
          />
          <label htmlFor="emea-vol">EMEA</label>
        </div>
        <div className="flex items-center gap-1">
          <Checkbox
            id="asiaPacific-vol"
            checked={showRegions.asiaPacific}
            onCheckedChange={() => handleRegionToggle("asiaPacific")}
            className="h-3 w-3 rounded-none border-gray-500 data-[state=checked]:bg-gray-500"
          />
          <label htmlFor="asiaPacific-vol">Asia/Pacific</label>
        </div>

        <span className="ml-4">Sort By:</span>
        <BloombergButton
          color={sortField === "historicalVol" ? "accent" : "default"}
          onClick={() => handleSortFieldChange("historicalVol")}
          className="flex items-center gap-1"
        >
          HV
          {sortField === "historicalVol" &&
            (sortOrder === "desc" ? (
              <ArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <ArrowUp className="h-3 w-3 ml-1" />
            ))}
        </BloombergButton>
        <BloombergButton
          color={sortField === "volRatio" ? "accent" : "default"}
          onClick={() => handleSortFieldChange("volRatio")}
          className="flex items-center gap-1"
        >
          RATIO
          {sortField === "volRatio" &&
            (sortOrder === "desc" ? (
              <ArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <ArrowUp className="h-3 w-3 ml-1" />
            ))}
        </BloombergButton>
        <BloombergButton
          color={sortField === "dailyRange" ? "accent" : "default"}
          onClick={() => handleSortFieldChange("dailyRange")}
          className="flex items-center gap-1"
        >
          RANGE
          {sortField === "dailyRange" &&
            (sortOrder === "desc" ? (
              <ArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <ArrowUp className="h-3 w-3 ml-1" />
            ))}
        </BloombergButton>
      </div>

      {/* Main Content */}
      <div className="overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0">
          <TableHeader>
            <TableRow className={`bg-[${colors.surface}]`}>
              <TableHead className="px-2 py-1 text-left font-bold">Market</TableHead>
              <TableHead className="px-2 py-1 text-center">Region</TableHead>
              <TableHead className="px-2 py-1 text-right">Hist Vol</TableHead>
              <TableHead className="px-2 py-1 text-right">Impl Vol</TableHead>
              <TableHead className="px-2 py-1 text-center">Trend</TableHead>
              <TableHead className="px-2 py-1 text-right">Vol Ratio</TableHead>
              <TableHead className="px-2 py-1 text-right">Daily Range</TableHead>
              <TableHead className="px-2 py-1 text-right hidden sm:table-cell">
                Weekly Range
              </TableHead>
              <TableHead className="px-2 py-1 text-center hidden md:table-cell">
                Vol Chart
              </TableHead>
              <TableHead className="px-2 py-1 text-right hidden md:table-cell">RSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No indices match the current filter criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow
                  key={`${item.id}-${index}`}
                  className={`border-b border-[${colors.border}] ${getVolatilityBgClass(item.historicalVol)}`}
                >
                  <TableCell className="px-2 py-1">
                    <div className="flex flex-col">
                      <span className={`text-[${colors.accent}] text-xs`}>{item.id}</span>
                      <span className={`text-[${colors.textSecondary}] text-xs`}>
                        {item.value.toFixed(2)} ({item.pctChange > 0 ? "+" : ""}
                        {item.pctChange.toFixed(2)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-center text-xs">{item.region}</TableCell>
                  <TableCell
                    className={`px-2 py-1 text-right text-xs ${getVolatilityColorClass(item.historicalVol)}`}
                  >
                    {item.historicalVol.toFixed(2)}%
                  </TableCell>
                  <TableCell
                    className={`px-2 py-1 text-right text-xs ${getVolatilityColorClass(item.impliedVol || 0)}`}
                  >
                    {item.impliedVol?.toFixed(2)}%
                  </TableCell>
                  <TableCell className="px-2 py-1 text-center">
                    {getTrendIcon(item.volTrend)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-right text-xs">
                    {item.volRatio.toFixed(2)}x
                  </TableCell>
                  <TableCell className="px-2 py-1 text-right text-xs">
                    {item.dailyRange.toFixed(2)}%
                  </TableCell>
                  <TableCell className="px-2 py-1 text-right text-xs hidden sm:table-cell">
                    {item.weeklyRange.toFixed(2)}%
                  </TableCell>
                  <TableCell className="px-2 py-1 w-[100px] hidden md:table-cell">
                    <div className="flex justify-center">
                      <Sparkline
                        data1={[]}
                        data2={item.sparkline}
                        width={80}
                        height={20}
                        color1={colors.sparklineGray}
                        color2={item.historicalVol >= 15 ? colors.negative : colors.positive}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-right hidden md:table-cell">
                    <div className="w-16">
                      <Progress value={item.rsi} max={100} className="h-2" />
                      <div className="text-xs mt-1 text-right">{item.rsi?.toFixed(1)}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
