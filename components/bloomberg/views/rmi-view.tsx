"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import {
  currentViewAtom,
  isDarkModeAtom,
  rmiBenchmarkIndexAtom,
  rmiSelectedRegionAtom,
  rmiSelectedSecurityAtom,
  rmiTimeRangeAtom,
} from "../atoms";
import { BloombergButton } from "../core/bloomberg-button";
import { useMarketDataQuery } from "../hooks/useMarketDataQuery";
import { bloombergColors } from "../lib/theme-config";
import type { MarketItem } from "../types";
import { AiMarketAnalysis } from "../ui/ai-market-analysis";
import { RmiChart } from "../ui/rmi-chart";

export function RmiView() {
  // Global state
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [, setCurrentView] = useAtom(currentViewAtom);
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;
  const { marketData, isLoading, error } = useMarketDataQuery();

  // RMI-specific state
  const [selectedRegion, setSelectedRegion] = useAtom(rmiSelectedRegionAtom);
  const [selectedSecurity, setSelectedSecurity] = useAtom(rmiSelectedSecurityAtom);
  const [benchmarkIndex, setBenchmarkIndex] = useAtom(rmiBenchmarkIndexAtom);
  const [timeRange, setTimeRange] = useAtom(rmiTimeRangeAtom);

  // Handle back button click
  const handleBack = () => {
    setCurrentView("market");
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-4" style={{ backgroundColor: colors.background }}>
        <h2 className="text-lg font-bold mb-4">Relative Market Index</h2>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Handle error state
  if (error || !marketData) {
    return (
      <div className="p-4" style={{ backgroundColor: colors.background, color: colors.text }}>
        <h2 className="text-lg font-bold mb-4">Relative Market Index</h2>
        <div className="p-4 border rounded-sm" style={{ borderColor: colors.border }}>
          <p>Error loading market data. Please try again later.</p>
          <BloombergButton color="accent" className="mt-4">
            RETRY
          </BloombergButton>
        </div>
      </div>
    );
  }

  // Get all available securities for the selected region
  const securities: MarketItem[] = marketData[selectedRegion] || [];

  // If no security is selected yet, select the first one
  if (!selectedSecurity && securities.length > 0) {
    setSelectedSecurity(securities[0].id);
  }

  // Find the selected security and benchmark
  const selectedSecurityData = securities.find((item: MarketItem) => item.id === selectedSecurity);
  const benchmarkData =
    securities.find((item: MarketItem) => item.id === benchmarkIndex) ||
    // Default to S&P 500 or first item if not found
    securities.find((item: MarketItem) => item.id === "SPX:IND") ||
    securities[0];

  return (
    <div className="p-4" style={{ backgroundColor: colors.background, color: colors.text }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <BloombergButton color="red" onClick={handleBack} className="flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            BACK
          </BloombergButton>
          <h2 className="text-lg font-bold">Relative Market Index</h2>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="region-select" className="block text-xs mb-1">
              Region
            </label>
            <Select
              value={selectedRegion}
              onValueChange={(value) =>
                setSelectedRegion(value as "americas" | "emea" | "asiaPacific")
              }
            >
              <SelectTrigger
                id="region-select"
                className="w-[180px] h-8 text-xs font-mono rounded-none border focus:ring-0 focus:ring-offset-0"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent
                className="rounded-none border font-mono text-xs"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <SelectItem
                  value="americas"
                  className="rounded-none focus:bg-[#333333] focus:text-white"
                >
                  AMERICAS
                </SelectItem>
                <SelectItem
                  value="emea"
                  className="rounded-none focus:bg-[#333333] focus:text-white"
                >
                  EMEA
                </SelectItem>
                <SelectItem
                  value="asiaPacific"
                  className="rounded-none focus:bg-[#333333] focus:text-white"
                >
                  ASIA PACIFIC
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="security-select" className="block text-xs mb-1">
              Security
            </label>
            <Select value={selectedSecurity} onValueChange={setSelectedSecurity}>
              <SelectTrigger
                id="security-select"
                className="w-[180px] h-8 text-xs font-mono rounded-none border focus:ring-0 focus:ring-offset-0"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <SelectValue placeholder="Select security" />
              </SelectTrigger>
              <SelectContent
                className="rounded-none border font-mono text-xs max-h-[200px]"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {securities.map((item: MarketItem) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className="rounded-none focus:bg-[#333333] focus:text-white"
                  >
                    {item.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="benchmark-select" className="block text-xs mb-1">
              Benchmark
            </label>
            <Select value={benchmarkIndex} onValueChange={setBenchmarkIndex}>
              <SelectTrigger
                id="benchmark-select"
                className="w-[180px] h-8 text-xs font-mono rounded-none border focus:ring-0 focus:ring-offset-0"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <SelectValue placeholder="Select benchmark" />
              </SelectTrigger>
              <SelectContent
                className="rounded-none border font-mono text-xs max-h-[200px]"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {securities.map((item: MarketItem) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className="rounded-none focus:bg-[#333333] focus:text-white"
                  >
                    {item.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList
          className="mb-4 w-full flex h-8 rounded-none border-b border-[#333333] bg-transparent p-0 font-mono text-xs"
          style={{ borderColor: colors.border }}
        >
          <TabsTrigger
            value="chart"
            className="flex-1 rounded-none border-r data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-[#ff9900] data-[state=active]:shadow-none px-3 py-1 h-full ring-offset-0"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          >
            CHART
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="flex-1 rounded-none border-r data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-[#ff9900] data-[state=active]:shadow-none px-3 py-1 h-full ring-offset-0"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          >
            TABLE
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="flex-1 rounded-none data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-[#ff9900] data-[state=active]:shadow-none px-3 py-1 h-full ring-offset-0"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          >
            ANALYSIS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          {selectedSecurityData && (
            <RmiChart
              marketItem={selectedSecurityData}
              benchmarkItem={benchmarkData}
              height={400}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 border rounded-sm"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <h3 className="text-sm font-bold mb-2">Security Details</h3>
              {selectedSecurityData && (
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium">ID:</td>
                      <td>{selectedSecurityData.id}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Value:</td>
                      <td>{selectedSecurityData.value.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Change:</td>
                      <td
                        style={{
                          color:
                            selectedSecurityData.change >= 0 ? colors.positive : colors.negative,
                        }}
                      >
                        {selectedSecurityData.change.toFixed(2)} (
                        {selectedSecurityData.pctChange.toFixed(2)}%)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">YTD:</td>
                      <td>{selectedSecurityData.ytd.toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">RMI:</td>
                      <td>{selectedSecurityData.rmi}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div
              className="p-4 border rounded-sm"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <h3 className="text-sm font-bold mb-2">Benchmark Details</h3>
              {benchmarkData && (
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium">ID:</td>
                      <td>{benchmarkData.id}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Value:</td>
                      <td>{benchmarkData.value.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Change:</td>
                      <td
                        style={{
                          color: benchmarkData.change >= 0 ? colors.positive : colors.negative,
                        }}
                      >
                        {benchmarkData.change.toFixed(2)} ({benchmarkData.pctChange.toFixed(2)}%)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">YTD:</td>
                      <td>{benchmarkData.ytd.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <div
            className="p-4 border rounded-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <h3 className="text-sm font-bold mb-2">RMI Historical Data</h3>
            <p className="text-xs mb-4">
              Historical RMI values comparing {selectedSecurityData?.id} to {benchmarkData?.id}
            </p>

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: colors.border }}>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-right">{selectedSecurityData?.id}</th>
                  <th className="py-2 text-right">{benchmarkData?.id}</th>
                  <th className="py-2 text-right">RMI</th>
                  <th className="py-2 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {/* Sample data - in a real app, this would come from an API */}
                {Array.from({ length: 10 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  // Generate some sample values
                  const secValue = selectedSecurityData
                    ? (selectedSecurityData.value * (1 - i * 0.005)).toFixed(2)
                    : "0.00";
                  const benchValue = benchmarkData
                    ? (benchmarkData.value * (1 - i * 0.003)).toFixed(2)
                    : "0.00";
                  const rmi = (100 * (1 + i * 0.002)).toFixed(2);
                  const change = (
                    i === 0
                      ? 0
                      : Number.parseFloat(rmi) -
                        Number.parseFloat((100 * (1 + (i - 1) * 0.002)).toFixed(2))
                  ).toFixed(2);
                  const isPositive = Number.parseFloat(change) >= 0;

                  // Create a unique key using the date timestamp and index
                  const uniqueKey = `${date.getTime()}-${selectedSecurity}-${i}`;

                  return (
                    <tr key={uniqueKey} className="border-b" style={{ borderColor: colors.border }}>
                      <td className="py-2">{formattedDate}</td>
                      <td className="py-2 text-right">{secValue}</td>
                      <td className="py-2 text-right">{benchValue}</td>
                      <td className="py-2 text-right">{rmi}</td>
                      <td
                        className="py-2 text-right"
                        style={{ color: isPositive ? colors.positive : colors.negative }}
                      >
                        {isPositive ? "+" : ""}
                        {change}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div
            className="p-4 border rounded-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <h3 className="text-sm font-bold mb-2">RMI Analysis</h3>
            <p className="text-xs mb-4">
              The Relative Market Index (RMI) measures the performance of {selectedSecurityData?.id}{" "}
              relative to {benchmarkData?.id}.
            </p>

            <h4 className="text-xs font-bold mt-4 mb-2">Key Insights</h4>
            <ul className="list-disc pl-5 text-xs space-y-2">
              <li>
                Current RMI value is <span className="font-bold">{selectedSecurityData?.rmi}</span>,
                indicating
                {Number.parseFloat(selectedSecurityData?.rmi || "100") > 100
                  ? " outperformance compared to the benchmark."
                  : " underperformance compared to the benchmark."}
              </li>
              <li>
                {selectedSecurityData?.id} has{" "}
                {Math.abs(selectedSecurityData?.pctChange || 0) >
                Math.abs(benchmarkData?.pctChange || 0)
                  ? "higher"
                  : "lower"}{" "}
                volatility than the benchmark index.
              </li>
              <li>
                Year-to-date performance shows{" "}
                {selectedSecurityData?.ytd || 0 > benchmarkData?.ytd || 0
                  ? "stronger returns"
                  : "weaker returns"}{" "}
                compared to the benchmark.
              </li>
            </ul>

            <h4 className="text-xs font-bold mt-4 mb-2">Correlation Analysis</h4>
            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "65%",
                  backgroundColor: colors.accent,
                }}
              />
            </div>
            <p className="text-xs mt-1">Correlation: 0.65 (Moderate)</p>

            <h4 className="text-xs font-bold mt-4 mb-2">Recommendations</h4>
            <p className="text-xs">
              Based on the current RMI trend, consider{" "}
              {Number.parseFloat(selectedSecurityData?.rmi || "100") > 100
                ? "maintaining exposure to take advantage of continued outperformance."
                : "reducing exposure if underperformance continues."}
            </p>
          </div>

          {/* AI Market Analysis */}
          <AiMarketAnalysis
            selectedSecurity={selectedSecurityData}
            benchmarkSecurity={benchmarkData}
            colors={colors}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
