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

  const fetchNews = useCallback(async (query = searchTerm) => {
    try {
      setIsLoading(true);
      setError(null);

      const newsData = await fetchFinancialNews(query);

      if (newsData) {
        setNews(newsData);
      } else {
        // If no data, use fallback
        setNews(generateFallbackNews());
        setError("Could not fetch real news data. Showing sample news.");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to fetch news");
      setNews(generateFallbackNews());
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Generate fallback news data
  const generateFallbackNews = (): NewsItem[] => {
    return [
      {
        title: "Markets React to Federal Reserve Decision",
        summary:
          "Global markets showed mixed reactions to the Federal Reserve's latest interest rate decision, with tech stocks leading gains while financial sector shares declined.",
        url: "#",
        time_published: new Date().toISOString(),
        source: "Financial Times",
        source_domain: "ft.com",
      },
      {
        title: "S&P 500 Reaches New All-Time High",
        summary:
          "The S&P 500 index reached a new record high today, driven by strong earnings reports from major technology companies and positive economic data.",
        url: "#",
        time_published: new Date(Date.now() - 3600000).toISOString(),
        source: "Wall Street Journal",
        source_domain: "wsj.com",
      },
      {
        title: "Oil Prices Fall on Supply Concerns",
        summary:
          "Crude oil prices dropped by 2% following reports of increased production from major oil-producing countries, raising concerns about oversupply in the global market.",
        url: "#",
        time_published: new Date(Date.now() - 7200000).toISOString(),
        source: "Bloomberg",
        source_domain: "bloomberg.com",
      },
      {
        title: "Tech Sector Leads Market Rally",
        summary:
          "Technology stocks led a broad market rally as investors responded positively to better-than-expected earnings reports from several major tech companies.",
        url: "#",
        time_published: new Date(Date.now() - 10800000).toISOString(),
        source: "CNBC",
        source_domain: "cnbc.com",
      },
      {
        title: "European Markets Close Higher on Economic Data",
        summary:
          "European stock indices closed higher following the release of positive economic indicators, suggesting a stronger-than-expected recovery in the eurozone.",
        url: "#",
        time_published: new Date(Date.now() - 14400000).toISOString(),
        source: "Reuters",
        source_domain: "reuters.com",
      },
    ];
  };

  // Format the published time
  const formatPublishedTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString();
    } catch (e) {
      return timeString;
    }
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
