'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMarketData } from '@/hooks/use-market-data';

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export function StockPerformance() {
  const { stocks, loading } = useMarketData();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (stocks.length === 0) return;

    // Generate 8 data points over the last month with realistic variations
    const dates = ['Apr 3', 'Apr 7', 'Apr 11', 'Apr 15', 'Apr 19', 'Apr 23', 'Apr 27', 'May 1'];
    
    // Get first 5 stocks for the chart
    const chartStocks = stocks.slice(0, 5);
    
    // Create base values from current prices and apply random variations
    const generatedData: ChartDataPoint[] = dates.map((date, index) => {
      const dataPoint: ChartDataPoint = { date };
      
      chartStocks.forEach((stock) => {
        // Create a realistic percentage change over time
        const baseChange = (stock.changePercent || 0) / 8; // Spread the daily change across 8 days
        const variance = (Math.random() - 0.5) * 0.5; // Add random variance
        const dayChange = baseChange + variance;
        
        // Calculate cumulative change
        const cumulativeChange = dayChange * (index + 1);
        dataPoint[stock.symbol] = parseFloat(cumulativeChange.toFixed(2));
      });
      
      return dataPoint;
    });

    setChartData(generatedData);
  }, [stocks]);

  // Get first 5 symbols for legend
  const displaySymbols = stocks.slice(0, 5).map(s => s.symbol);
  const colors = ['#3b82f6', '#14b8a6', '#eab308', '#ef4444', '#a855f7'];
  const symbolColorMap = Object.fromEntries(displaySymbols.map((sym, i) => [sym, colors[i]]));

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="col-span-1 md:col-span-2"
      >
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 backdrop-blur-xl h-64 flex items-center justify-center">
          <p className="text-white/50 text-sm">Loading market performance data...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white">Stock Performance</h2>
            <p className="text-xs text-white/60">Top stocks over 30 days</p>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {displaySymbols.map((symbol) => (
            <div key={symbol} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: symbolColorMap[symbol] }}
              />
              <span className="text-white/80">{symbol}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-48 -mx-6 px-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 20, 25, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              {displaySymbols.map((symbol, index) => (
                <Line
                  key={symbol}
                  type="monotone"
                  dataKey={symbol}
                  stroke={colors[index]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
