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

interface FinnhubProfile {
  name: string;
  logo: string;
  ticker: string;
}

interface StockData {
  symbol: string;
  name: string;
  logo: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const SYMBOLS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'UBER', 'AMD'];

// Cache to store recent data and prevent excessive API calls
const cache: Map<string, { data: StockData; timestamp: number }> = new Map();
const profileCache: Map<string, { data: FinnhubProfile; timestamp: number }> = new Map();
const CACHE_DURATION = 5000; // 5 seconds
const PROFILE_CACHE_DURATION = 86400000; // 24 hours for company profiles

async function fetchCompanyProfile(symbol: string): Promise<FinnhubProfile | null> {
  try {
    // Check profile cache first
    const cached = profileCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_DURATION) {
      return cached.data;
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error(`[v0] Company profile API error for ${symbol}:`, response.status);
      return null;
    }

    const profile: FinnhubProfile = await response.json();
    profileCache.set(symbol, { data: profile, timestamp: Date.now() });
    return profile;
  } catch (error) {
    console.error(`[v0] Error fetching profile for ${symbol}:`, error);
    return null;
  }
}

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

    // Validate quote data - ensure all required fields exist
    if (!quote || typeof quote.c !== 'number' || typeof quote.pc !== 'number') {
      console.error(`[v0] Invalid quote data for ${symbol}:`, quote);
      return null;
    }

    // Fetch company profile for name and logo
    const profile = await fetchCompanyProfile(symbol);

    const change = quote.c - quote.pc;
    const changePercent = (change / quote.pc) * 100;

    const data: StockData = {
      symbol,
      name: profile?.name || symbol,
      logo: profile?.logo || '',
      price: parseFloat(quote.c.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((quote.h || 0).toFixed(2)),
      low: parseFloat((quote.l || 0).toFixed(2)),
      open: parseFloat((quote.o || 0).toFixed(2)),
      timestamp: quote.t || Date.now(),
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
    const userId = searchParams.get('userId');

    if (symbol) {
      // Fetch single stock
      const data = await fetchStockData(symbol.toUpperCase());
      if (!data) {
        return NextResponse.json(
          { error: `Failed to fetch data for ${symbol}` },
          { status: 500 }
        );
      }
      
      // Check if user owns this stock
      let isOwned = false;
      if (userId) {
        const { sql } = await import('@/lib/db');
        const db = sql();
        const owned = (await db`
          SELECT id FROM user_portfolio_stocks 
          WHERE user_id = ${userId} 
          AND company_id IN (SELECT id FROM companies WHERE symbol = ${symbol.toUpperCase()})
          AND status = 'active'
        `) as any[];
        isOwned = owned.length > 0;
      }
      
      return NextResponse.json({ ...data, isOwned });
    }

    // Fetch all symbols
    const stocksData = await Promise.all(
      SYMBOLS.map((sym) => fetchStockData(sym))
    );

    const validData = stocksData.filter((data) => data !== null) as StockData[];
    
    // Check ownership for each stock if userId provided
    if (userId) {
      const { sql } = await import('@/lib/db');
      const db = sql();
      
      const ownedStocks = (await db`
        SELECT DISTINCT c.symbol FROM user_portfolio_stocks ups
        JOIN companies c ON ups.company_id = c.id
        WHERE ups.user_id = ${userId} AND ups.status = 'active'
      `) as any[];
      
      const ownedSymbols = new Set(ownedStocks.map(s => s.symbol));
      
      return NextResponse.json({
        stocks: validData.map(stock => ({
          ...stock,
          isOwned: ownedSymbols.has(stock.symbol)
        })),
        timestamp: Date.now(),
      });
    }

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
