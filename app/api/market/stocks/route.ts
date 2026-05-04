import { getAllStocks } from '@/lib/finnhub';

export async function GET() {
  try {
    const stocks = await getAllStocks();

    return Response.json(stocks, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API] Error fetching stocks:', error);
    return Response.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
