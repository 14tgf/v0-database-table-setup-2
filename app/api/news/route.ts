import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  image: string;
  source: string;
  tickers: string[];
  publishedAt: number;
  url: string;
}

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const newsCache: Map<string, { data: NewsItem[]; timestamp: number }> = new Map();
const CACHE_DURATION = 60000; // 60 seconds for news

async function fetchFinancialNews(): Promise<NewsItem[]> {
  try {
    const cached = newsCache.get('financial-news');
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[v0] Returning cached news');
      return cached.data;
    }

    if (!FINNHUB_API_KEY) {
      console.error('[v0] FINNHUB_API_KEY is not configured');
      return [];
    }

    // Fetch news related to Tesla ecosystem (TSLA, AAPL, NVDA, MSFT, AMZN, GOOGL)
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=technology&token=${FINNHUB_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error(`[v0] Finnhub News API error:`, response.status);
      return [];
    }

    const finnhubNews: FinnhubNews[] = await response.json();

    // Transform and filter news
    const newsItems: NewsItem[] = finnhubNews
      .slice(0, 12) // Limit to 12 news items
      .map((item) => {
        // Parse tickers from related field (comma-separated)
        const tickers = item.related
          ? item.related.split(',').map((t) => t.trim()).filter(t => t.length > 0)
          : [];

        return {
          id: item.id,
          headline: item.headline,
          summary: item.summary || 'No summary available',
          image: item.image || '/news-placeholder.jpg',
          source: item.source || 'Financial News',
          tickers,
          publishedAt: item.datetime * 1000, // Convert to milliseconds
          url: item.url,
        };
      });

    // Cache the results
    newsCache.set('financial-news', { data: newsItems, timestamp: Date.now() });
    console.log('[v0] Fetched', newsItems.length, 'news items from Finnhub');

    return newsItems;
  } catch (error) {
    console.error('[v0] Error fetching news:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const news = await fetchFinancialNews();
    
    return NextResponse.json({
      news,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[v0] News API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', news: [] },
      { status: 500 }
    );
  }
}
