import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface FinnhubQuote {
  c: number; // current price
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // unix timestamp
}

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const SYMBOLS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL'];

// Cache to store recent data and prevent excessive API calls
const cache: Map<string, { data: StockData; timestamp: number }> = new Map();
const CACHE_DURATION = 5000; // 5 seconds

async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    // Check cache first
    const cached = cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error(`[v0] Finnhub API error for ${symbol}:`, response.status);
      return null;
    }

    const quote: FinnhubQuote = await response.json();

    const change = quote.c - quote.pc;
    const changePercent = (change / quote.pc) * 100;

    const data: StockData = {
      symbol,
      price: parseFloat(quote.c.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat(quote.h.toFixed(2)),
      low: parseFloat(quote.l.toFixed(2)),
      open: parseFloat(quote.o.toFixed(2)),
      timestamp: quote.t,
    };

    // Cache the result
    cache.set(symbol, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`[v0] Error fetching ${symbol}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!FINNHUB_API_KEY) {
      return NextResponse.json(
        { error: 'FINNHUB_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (symbol) {
      // Fetch single stock
      const data = await fetchStockData(symbol.toUpperCase());
      if (!data) {
        return NextResponse.json(
          { error: `Failed to fetch data for ${symbol}` },
          { status: 500 }
        );
      }
      return NextResponse.json(data);
    }

    // Fetch all symbols
    const stocksData = await Promise.all(
      SYMBOLS.map((sym) => fetchStockData(sym))
    );

    const validData = stocksData.filter((data) => data !== null) as StockData[];

    return NextResponse.json({
      stocks: validData,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[v0] Market API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
