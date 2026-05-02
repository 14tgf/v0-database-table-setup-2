'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Apr 3', NVDA: 0, AAPL: 0, TSLA: 0, AMZN: 0, GOOGL: 0 },
  { date: 'Apr 7', NVDA: 0.5, AAPL: 0.3, TSLA: -0.2, AMZN: 0.1, GOOGL: 0.4 },
  { date: 'Apr 11', NVDA: 1.2, AAPL: 0.8, TSLA: 0.5, AMZN: 0.6, GOOGL: 0.9 },
  { date: 'Apr 15', NVDA: 0.9, AAPL: 1.1, TSLA: 0.8, AMZN: 1.2, GOOGL: 1.1 },
  { date: 'Apr 19', NVDA: 1.5, AAPL: 1.3, TSLA: 1.0, AMZN: 1.4, GOOGL: 1.2 },
  { date: 'Apr 23', NVDA: 1.8, AAPL: 1.6, TSLA: 1.3, AMZN: 1.7, GOOGL: 1.5 },
  { date: 'Apr 27', NVDA: 1.6, AAPL: 1.9, TSLA: 1.1, AMZN: 2.0, GOOGL: 1.8 },
  { date: 'May 1', NVDA: 2.1, AAPL: 2.2, TSLA: 1.5, AMZN: 2.3, GOOGL: 2.0 },
];

export function StockPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Stock Market Performance</h2>
            <p className="text-sm text-white/60">Top stocks over the last 30 days</p>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-white/80">NVDA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-white/80">AAPL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-white/80">TSLA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-white/80">AMZN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-white/80">GOOGL</span>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-80 -mx-6 px-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
              <Line type="monotone" dataKey="NVDA" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="AAPL" stroke="#14b8a6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="TSLA" stroke="#eab308" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="AMZN" stroke="#ef4444" dot={false} strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="GOOGL"
                stroke="#a855f7"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
