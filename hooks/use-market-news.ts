import { useState, useEffect } from 'react';

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  image: string;
  source: string;
  tickers: string[];
  publishedAt: number;
  url: string;
}

interface NewsResponse {
  news: NewsItem[];
  timestamp: number;
}

interface UseMarketNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

export function useMarketNews(): UseMarketNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data: NewsResponse = await response.json();
        
        if (isMounted) {
          setNews(data.news);
          setLastUpdate(data.timestamp);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          console.error('[v0] Error fetching news:', errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    // Refresh every 2 minutes
    const interval = setInterval(fetchNews, 120000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { news, loading, error, lastUpdate };
}
