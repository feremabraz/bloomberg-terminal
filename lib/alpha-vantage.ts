// Alpha Vantage API service
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const BASE_URL = "https://www.alphavantage.co/query"

// Map our market indices to Alpha Vantage symbols
const MARKET_INDICES = {
  "DOW JONES": "^DJI",
  "S&P 500": "^GSPC",
  NASDAQ: "^IXIC",
  "S&P/TSX Comp": "^GSPTSE",
  "S&P/BMV IPC": "^MXX",
  IBOVESPA: "^BVSP",
  "Euro Stoxx 50": "^STOXX50E",
  "FTSE 100": "^FTSE",
  "CAC 40": "^FCHI",
  DAX: "^GDAXI",
  "IBEX 35": "^IBEX",
  "FTSE MIB": "FTSEMIB.MI",
  "OMX STKH30": "^OMX",
  "SWISS MKT": "^SSMI",
  NIKKEI: "^N225",
  "HANG SENG": "^HSI",
  "CSI 300": "000300.SS",
  "S&P/ASX 200": "^AXJO",
}

// Helper function to generate random sparkline data
export function generateRandomSparkline(): number[] {
  return Array.from({ length: 8 }, () => Math.min(1, Math.max(0, Math.random())))
}

// Fetch global quote for a symbol
export async function fetchGlobalQuote(symbol: string) {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      console.warn(`Alpha Vantage API error for ${symbol}: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Check if we got valid data
    if (data["Global Quote"] && Object.keys(data["Global Quote"]).length > 0) {
      return data["Global Quote"]
    } else if (data.Note) {
      // API limit reached
      console.warn("Alpha Vantage API limit reached:", data.Note)
      return null
    } else {
      console.warn("Invalid data received for symbol:", symbol, data)
      return null
    }
  } catch (error) {
    console.error("Error fetching global quote:", error)
    return null
  }
}

// NEW: Fetch intraday data for the last 2 days
export async function fetchIntradayData(symbol: string) {
  try {
    // Using intraday data with 60min interval to get data for the last 2 days
    const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact&apikey=${API_KEY}`
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      console.warn(`Alpha Vantage API error for ${symbol} intraday data: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Check if we got valid data
    if (data["Time Series (60min)"]) {
      const timeSeriesData = data["Time Series (60min)"]
      const timestamps = Object.keys(timeSeriesData).sort()

      // Get the last 16 data points (approximately 2 trading days)
      const last2Days = timestamps.slice(0, 16).map((timestamp) => ({
        timestamp,
        close: Number.parseFloat(timeSeriesData[timestamp]["4. close"]),
      }))

      // Normalize the data for sparkline (values between 0 and 1)
      if (last2Days.length > 0) {
        const values = last2Days.map((item) => item.close)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const range = max - min || 1 // Avoid division by zero

        return {
          raw: last2Days,
          normalized: last2Days.map((item) => ({
            timestamp: item.timestamp,
            value: (item.close - min) / range,
          })),
          sparkline: last2Days.map((item) => (item.close - min) / range),
        }
      }
    } else if (data.Note) {
      // API limit reached
      console.warn("Alpha Vantage API limit reached:", data.Note)
    } else {
      console.warn("Invalid intraday data received for symbol:", symbol, data)
    }

    return null
  } catch (error) {
    console.error("Error fetching intraday data:", error)
    return null
  }
}

// Generate fallback data for a market index
export function generateFallbackData(indexName: string, region: string, index: number) {
  const value = 1000 + Math.random() * 10000
  const change = Math.random() * 100 - 50
  const pctChange = (change / value) * 100

  return {
    id: indexName,
    num: `${region === "americas" ? "1" : region === "emea" ? "2" : "3"}${index + 1})`,
    rmi: "□",
    value,
    change,
    pctChange,
    avat: Math.random() * 100 - 50,
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    ytd: Math.random() * 30 - 15,
    ytdCur: Math.random() * 30 - 10,
    sparkline1: generateRandomSparkline(),
    sparkline2: generateRandomSparkline(),
  }
}

// Fetch market data for all indices
export async function fetchAllMarketData() {
  const regions = {
    americas: ["DOW JONES", "S&P 500", "NASDAQ", "S&P/TSX Comp", "S&P/BMV IPC", "IBOVESPA"],
    emea: ["Euro Stoxx 50", "FTSE 100", "CAC 40", "DAX", "IBEX 35", "FTSE MIB", "OMX STKH30", "SWISS MKT"],
    asiaPacific: ["NIKKEI", "HANG SENG", "CSI 300", "S&P/ASX 200"],
  }

  const result: any = {
    americas: [],
    emea: [],
    asiaPacific: [],
    lastUpdated: new Date().toISOString(),
    dataSource: "alpha-vantage",
  }

  // Track API calls to respect limits
  let apiCalls = 0
  const MAX_API_CALLS = 5 // Reduced from 25 to avoid hitting limits too quickly

  // Process each region
  for (const [region, indices] of Object.entries(regions)) {
    for (let i = 0; i < indices.length; i++) {
      const indexName = indices[i]

      try {
        // Check if we've reached API limit
        if (apiCalls >= MAX_API_CALLS) {
          console.warn("API call limit reached, using fallback data for remaining indices")
          // Add fallback data
          result[region].push(generateFallbackData(indexName, region, i))
          continue
        }

        const symbol = MARKET_INDICES[indexName as keyof typeof MARKET_INDICES]

        // Fetch quote data from Alpha Vantage
        const quote = await fetchGlobalQuote(symbol)
        apiCalls++

        // Try to fetch intraday data for 2Day column if we haven't hit API limit
        let twoDayData = null
        if (apiCalls < MAX_API_CALLS) {
          twoDayData = await fetchIntradayData(symbol)
          apiCalls++
        }

        if (quote) {
          // Transform Alpha Vantage data to match our format
          const value = Number.parseFloat(quote["05. price"])
          const change = Number.parseFloat(quote["09. change"])
          const pctChange = Number.parseFloat(quote["10. change percent"].replace("%", ""))

          // Generate some random data for fields not provided by Alpha Vantage
          const avat = Math.random() * 100 - 50
          const ytd = Math.random() * 30 - 15
          const ytdCur = Math.random() * 30 - 10

          // Use real intraday data if available, otherwise fallback to random
          const sparkline1 = twoDayData ? twoDayData.sparkline.slice(0, 8) : generateRandomSparkline()
          const sparkline2 = twoDayData ? twoDayData.sparkline.slice(-8) : generateRandomSparkline()

          result[region].push({
            id: indexName,
            num: `${region === "americas" ? "1" : region === "emea" ? "2" : "3"}${i + 1})`,
            rmi: "□",
            value,
            change,
            pctChange,
            avat,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            ytd,
            ytdCur,
            sparkline1,
            sparkline2,
            // Store the raw data for potential use
            twoDayData: twoDayData ? twoDayData.raw : null,
          })
        } else {
          // Add fallback data if API call failed
          result[region].push(generateFallbackData(indexName, region, i))
        }
      } catch (error) {
        console.error(`Error processing ${indexName}:`, error)
        // Add fallback data on error
        result[region].push(generateFallbackData(indexName, region, i))
      }

      // Add a small delay between API calls to avoid rate limiting
      if (i < indices.length - 1 && apiCalls < MAX_API_CALLS) {
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
    }
  }

  return result
}

// NEW: Fetch financial news
export async function fetchFinancialNews(query = "market") {
  try {
    // Alpha Vantage News API
    const url = `${BASE_URL}?function=NEWS_SENTIMENT&topics=${query}&apikey=${API_KEY}`
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      console.warn(`Alpha Vantage News API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Check if we got valid data
    if (data.feed && Array.isArray(data.feed)) {
      return data.feed.slice(0, 20) // Return up to 20 news items
    } else if (data.Note) {
      // API limit reached
      console.warn("Alpha Vantage API limit reached:", data.Note)
      return null
    } else {
      console.warn("Invalid news data received:", data)
      return null
    }
  } catch (error) {
    console.error("Error fetching financial news:", error)
    return null
  }
}
