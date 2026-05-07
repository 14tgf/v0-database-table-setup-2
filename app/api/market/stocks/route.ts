import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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
  ticker: string;
  companyName: string;
  logo: string;
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  isOwned?: boolean;
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'BRK', 'V'];

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

    // Validate quote data
    if (!quote || typeof quote.c !== 'number' || typeof quote.pc !== 'number') {
      console.error(`[v0] Invalid quote data for ${symbol}:`, quote);
      return null;
    }

    // Fetch company profile
    const profile = await fetchCompanyProfile(symbol);

    const change = quote.c - quote.pc;
    const changePercent = (change / quote.pc) * 100;

    const data: StockData = {
      ticker: symbol,
      companyName: profile?.name || symbol,
      logo: profile?.logo || '',
      price: parseFloat(quote.c.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      percentChange: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((quote.h || 0).toFixed(2)),
      low: parseFloat((quote.l || 0).toFixed(2)),
      open: parseFloat((quote.o || 0).toFixed(2)),
      timestamp: quote.t || Date.now(),
    };

    cache.set(symbol, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`[v0] Error fetching ${symbol}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Market API - Request started');
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    console.log('[v0] Market API - User ID:', userId);

    // If Finnhub API key is not available, use fallback mock data from database
    if (!FINNHUB_API_KEY) {
      console.log('[v0] Market API - FINNHUB_API_KEY not set, using mock data from database');
      try {
        const db = sql();
        
        console.log('[v0] Market API - Fetching companies from database');
        // Fetch companies and generate mock stock data
        const companies = (await db`
          SELECT id, symbol, name, logo FROM companies LIMIT 20
        `) as any[];

        console.log('[v0] Market API - Companies fetched:', companies.length);

        const mockStocks: StockData[] = companies.map((company) => {
          // Generate consistent mock data based on symbol hash
          const hash = company.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const basePrice = 100 + (hash % 300);
          const changePercent = ((hash % 20) - 10) / 10;
          const change = basePrice * changePercent;

          return {
            ticker: company.symbol,
            companyName: company.name,
            logo: company.logo || '',
            price: parseFloat(basePrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            percentChange: parseFloat(changePercent.toFixed(2)),
            high: parseFloat((basePrice * 1.05).toFixed(2)),
            low: parseFloat((basePrice * 0.95).toFixed(2)),
            open: parseFloat((basePrice * 0.98).toFixed(2)),
            timestamp: Date.now(),
          };
        });

        console.log('[v0] Market API - Mock stocks generated:', mockStocks.length);

        // Check ownership for each stock if userId provided
        if (userId) {
          console.log('[v0] Market API - Checking ownership for user:', userId);
          const db2 = sql();
          const ownedStocks = (await db2`
            SELECT DISTINCT c.symbol FROM user_portfolio_stocks ups
            JOIN companies c ON ups.company_id = c.id
            WHERE ups.user_id = ${userId} AND ups.shares > 0
          `) as any[];
          
          console.log('[v0] Market API - Owned stocks found:', ownedStocks.length);
          const ownedSymbols = new Set(ownedStocks.map(s => s.symbol));
          
          return NextResponse.json(
            mockStocks.map(stock => ({
              ...stock,
              isOwned: ownedSymbols.has(stock.ticker)
            })),
            {
              headers: {
                'Cache-Control': 'public, max-age=5',
              },
            }
          );
        }

        return NextResponse.json(mockStocks, {
          headers: {
            'Cache-Control': 'public, max-age=5',
          },
        });
      } catch (dbError) {
        console.error('[v0] Market API - Database error:', {
          error: dbError instanceof Error ? dbError.message : String(dbError),
          stack: dbError instanceof Error ? dbError.stack : '',
        });
        return NextResponse.json(
          { error: 'Failed to fetch stocks from database', details: dbError instanceof Error ? dbError.message : String(dbError) },
          { status: 500 }
        );
      }
    }

    console.log('[v0] Market API - Fetching from Finnhub API');
    // Fetch all symbols
    const stocksData = await Promise.all(
      SYMBOLS.map((sym) => fetchStockData(sym))
    );

    console.log('[v0] Market API - Finnhub data fetched, valid entries:', stocksData.filter(s => s !== null).length);

    const validData = stocksData.filter((data) => data !== null) as StockData[];
    
    // Check ownership for each stock if userId provided
    if (userId) {
      console.log('[v0] Market API - Checking ownership for user:', userId);
      const db = sql();
      
      const ownedStocks = (await db`
        SELECT DISTINCT c.symbol FROM user_portfolio_stocks ups
        JOIN companies c ON ups.company_id = c.id
        WHERE ups.user_id = ${userId} AND ups.shares > 0
      `) as any[];
      
      const ownedSymbols = new Set(ownedStocks.map(s => s.symbol));
      
      return NextResponse.json(
        validData.map(stock => ({
          ...stock,
          isOwned: ownedSymbols.has(stock.ticker)
        })),
        {
          headers: {
            'Cache-Control': 'public, max-age=5',
          },
        }
      );
    }

    return NextResponse.json(validData, {
      headers: {
        'Cache-Control': 'public, max-age=5',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[v0] Market Stocks API error:', {
      message: errorMessage,
      stack: errorStack,
      error: JSON.stringify(error),
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage,
        stack: errorStack 
      },
      { status: 500 }
    );
  }
}
