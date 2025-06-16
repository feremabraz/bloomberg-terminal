"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { isDarkModeAtom, rmiTimeRangeAtom } from "../atoms";
import { bloombergColors } from "../lib/theme-config";
import type { MarketItem } from "../types";

interface RmiChartProps {
  marketItem: MarketItem;
  benchmarkItem?: MarketItem;
  width?: number;
  height?: number;
}

interface RmiDataPoint {
  time: string;
  rmi: number;
  value: number;
  benchmark?: number;
}

export function RmiChart({ marketItem, benchmarkItem, width = 600, height = 300 }: RmiChartProps) {
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [timeRange] = useAtom(rmiTimeRangeAtom);
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;
  const [hoveredData, setHoveredData] = useState<RmiDataPoint | null>(null);

  // This would fetch historical data based on the timeRange
  // We'll generate sample data based on the sparkline data
  const generateRmiData = (): RmiDataPoint[] => {
    // We use sparkline data if available, otherwise generate sample data
    const marketValues = marketItem.sparkline1 || [
      marketItem.value * 0.95,
      marketItem.value * 0.97,
      marketItem.value * 0.96,
      marketItem.value * 0.98,
      marketItem.value * 0.99,
      marketItem.value,
    ];

    const benchmarkValues = benchmarkItem?.sparkline1 || [100, 101, 99, 102, 103, 104];

    // Generate dates for the last N days based on timeRange
    const days = marketValues.length;
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    // Calculate RMI values (normalized to 100 at the start)
    const baseMarket = marketValues[0];
    const baseBenchmark = benchmarkValues[0];

    return marketValues.map((value, i) => {
      // RMI calculation: (security / base_security) / (benchmark / base_benchmark) * 100
      const normalizedSecurity = value / baseMarket;
      const normalizedBenchmark = benchmarkValues[i] / baseBenchmark;
      const rmi = (normalizedSecurity / normalizedBenchmark) * 100;

      return {
        time: dates[i],
        value: value,
        benchmark: benchmarkValues[i],
        rmi: Number.parseFloat(rmi.toFixed(2)),
      };
    });
  };

  const data = generateRmiData();

  // Determine if RMI is trending up or down
  const rmiTrend = data[data.length - 1].rmi > data[0].rmi;
  const rmiColor = rmiTrend ? colors.positive : colors.negative;

  // Custom tooltip to show both RMI and actual values
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="p-2 rounded-sm shadow-md"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <p className="text-xs font-bold">{data.time}</p>
          <p className="text-xs" style={{ color: rmiColor }}>
            RMI: {data.rmi.toFixed(2)}
          </p>
          <p className="text-xs">
            {marketItem.id}: {data.value.toFixed(2)}
          </p>
          {benchmarkItem && (
            <p className="text-xs">
              {benchmarkItem.id}: {data.benchmark?.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="p-4 border rounded-sm"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold">{marketItem.id} Relative Market Index</h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            vs {benchmarkItem?.id || "S&P 500"}
          </p>
        </div>
        <div className="flex gap-2">
          {["1D", "1W", "1M", "3M", "YTD", "1Y"].map((range) => (
            <button
              type="button"
              key={range}
              className={`text-xs px-2 py-1 rounded-sm ${timeRange === range ? "font-bold" : ""}`}
              style={{
                backgroundColor: timeRange === range ? colors.accent : "transparent",
                color: timeRange === range ? "#fff" : colors.text,
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: rmiColor }}>
            {data[data.length - 1].rmi.toFixed(2)}
          </span>
          <span className="text-xs" style={{ color: rmiColor }}>
            {rmiTrend ? "▲" : "▼"}
            {Math.abs(data[data.length - 1].rmi - data[0].rmi).toFixed(2)}(
            {((data[data.length - 1].rmi / data[0].rmi - 1) * 100).toFixed(2)}%)
          </span>
        </div>
        <div className="text-xs" style={{ color: colors.textSecondary }}>
          Base: 100.00
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          onMouseMove={(data) => {
            if (data.activePayload) {
              setHoveredData(data.activePayload[0].payload);
            }
          }}
          onMouseLeave={() => setHoveredData(null)}
        >
          <defs>
            <linearGradient id="rmiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={rmiColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={rmiColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: colors.text }}
            tickLine={{ stroke: colors.border }}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.text }}
            tickLine={{ stroke: colors.border }}
            axisLine={{ stroke: colors.border }}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="rmi"
            stroke={rmiColor}
            fillOpacity={1}
            fill="url(#rmiGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
        Last updated: {marketItem.lastUpdated || new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
