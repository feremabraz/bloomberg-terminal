"use client";

import { fetchFinancialNews } from "@/lib/alpha-vantage";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BloombergButton } from "../core/bloomberg-button";
import { bloombergColors } from "../lib/theme-config";

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  time_published: string;
  authors?: string[];
  banner_image?: string;
  source: string;
  category_within_source?: string;
  source_domain: string;
  topics?: Array<{ topic: string; relevance_score: string }>;
}

interface NewsViewProps {
  isDarkMode: boolean;
  onBack: () => void;
}

export default function NewsView({ isDarkMode, onBack }: NewsViewProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("market");

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  const fetchNews = useCallback(
    async (query = searchTerm) => {
      try {
        setIsLoading(true);
        setError(null);
        const newsData = await fetchFinancialNews(query);
        if (newsData) {
          setNews(newsData);
        } else {
          setError("Could not fetch real news data. Showing sample news.");
        }
      } catch (err) {
        setError("Failed to fetch news");
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm]
  );

  const formatPublishedTime = (timeString: string) => {
    // The Alpha Vantage API returns dates in YYYYMMDDTHHMMSS format.
    // We need to parse this custom format, as new Date() cannot handle it directly.
    const alphaVantageFormat = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/;
    const match = timeString.match(alphaVantageFormat);
    let date: Date;
    if (match) {
      // If it matches the Alpha Vantage format, parse it manually.
      const [, year, month, day, hour, minute, second] = match;
      // Note: The month is 0-indexed in the JavaScript Date constructor (0-11).
      date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );
    } else {
      // Otherwise, assume it's a standard format.
      date = new Date(timeString);
    }
    // Check if the resulting date is valid before formatting.
    if (Number.isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString();
  };

  // Initial news fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className={`min-h-screen font-mono bg-[${colors.background}] text-[${colors.text}]`}>
      {/* Header */}
      <div className={`flex items-center gap-2 bg-[${colors.surface}] px-2 py-1`}>
        <BloombergButton color="default" onClick={onBack}>
          <ArrowLeft className="h-3 w-3 mr-1" />
          BACK
        </BloombergButton>
        <span className="text-sm font-bold">NEWS</span>
        <div className="ml-auto flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-2 py-1 text-xs bg-[${colors.background}] border border-[${colors.border}] rounded-none`}
            placeholder="Search news..."
          />
          <BloombergButton color="accent" onClick={() => fetchNews()} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : "SEARCH"}
          </BloombergButton>
        </div>
      </div>

      {/* News Content */}
      <div className="p-2">
        {error && (
          <div className={`mb-4 p-2 bg-[${colors.negative}] text-white text-xs`}>{error}</div>
        )}
        {news.length === 0 && !isLoading ? (
          <div className="text-center py-8">No news articles found</div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div
                key={item.title + item.url}
                className={`p-3 border border-[${colors.border}] bg-[${colors.surface}]`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-sm font-bold text-[${colors.accent}]`}>{item.title}</h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs mb-2">{item.summary}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>{formatPublishedTime(item.time_published)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
