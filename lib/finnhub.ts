export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  percentChange: number;
  timestamp: number;
}

export interface CompanyProfile {
  ticker: string;
  name: string;
  logo: string;
  exchange: string;
}

export interface StockData extends StockQuote {
  companyName: string;
  logo: string;
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

if (!FINNHUB_API_KEY) {
  console.warn('[Finnhub] WARNING: FINNHUB_API_KEY is not set. Stock data will not be available.');
}

const STOCK_TICKERS = [
  'AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN',
  'GOOGL', 'META', 'NFLX', 'AMD', 'INTC',
  'BABA', 'ORCL', 'CRM', 'ADBE', 'UBER',
  'DIS', 'PYPL', 'KO', 'PEP', 'NKE'
];

export async function getStockQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error(`[Finnhub] Failed to fetch quote for ${ticker}`);
      return null;
    }

    const data = await response.json();
    
    return {
      ticker,
      price: data.c || 0,
      change: data.d || 0,
      percentChange: data.dp || 0,
      timestamp: data.t || Date.now() / 1000,
    };
  } catch (error) {
    console.error(`[Finnhub] Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

export async function getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error(`[Finnhub] Failed to fetch profile for ${ticker}`);
      return null;
    }

    const data = await response.json();
    
    return {
      ticker,
      name: data.name || ticker,
      logo: data.logo || '',
      exchange: data.exchange || '',
    };
  } catch (error) {
    console.error(`[Finnhub] Error fetching profile for ${ticker}:`, error);
    return null;
  }
}

export async function getAllStocks(): Promise<StockData[]> {
  try {
    const results: StockData[] = [];

    for (const ticker of STOCK_TICKERS) {
      const [quote, profile] = await Promise.all([
        getStockQuote(ticker),
        getCompanyProfile(ticker),
      ]);

      if (quote && profile) {
        results.push({
          ...quote,
          companyName: profile.name,
          logo: profile.logo,
        });
      }
    }

    return results.sort((a, b) => a.ticker.localeCompare(b.ticker));
  } catch (error) {
    console.error('[Finnhub] Error fetching all stocks:', error);
    return [];
  }
}

export function getTrendIndicator(change: number): 'up' | 'down' | 'flat' {
  if (change > 0.5) return 'up';
  if (change < -0.5) return 'down';
  return 'flat';
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}
