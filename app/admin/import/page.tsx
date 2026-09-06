'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DatabaseZap, AlertCircle, CheckCircle2, Loader2, ArrowDownToLine } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface TableResult {
  imported: number;
  status: string;
  error?: string;
}

interface ImportResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  totalImported?: number;
  tablesProcessed?: number;
  skippedMissing?: string[];
  results?: Record<string, TableResult>;
}

export default function AdminImportPage() {
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl }),
      });
      const data: ImportResponse = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        error: 'Request failed',
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const resultEntries = result?.results ? Object.entries(result.results) : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Import Database</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Copy all users, items and every other table from another database into this one.
        </p>
      </motion.div>

      <motion.form
        variants={staggerItem}
        onSubmit={handleImport}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-5 space-y-4"
      >
        <div className="flex items-start gap-3">
          <DatabaseZap className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Source database URL
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="postgresql://user:password@host/dbname"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all font-mono text-sm"
              required
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-white/50">
              The connection string of the old database to copy data from. It is used only for this
              import and is never stored.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              Start Import
            </>
          )}
        </button>
      </motion.form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div
            className={`p-4 rounded-lg border flex gap-3 ${
              result.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  result.success ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {result.message || result.error}
              </p>
              {result.details && (
                <p className="text-xs text-white/60 mt-1 break-words">{result.details}</p>
              )}
            </div>
          </div>

          {result.skippedMissing && result.skippedMissing.length > 0 && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-300">
                Skipped {result.skippedMissing.length} table(s) that do not exist in this database:{' '}
                <span className="font-mono">{result.skippedMissing.join(', ')}</span>
              </p>
            </div>
          )}

          {resultEntries.length > 0 && (
            <div className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Per-table results</p>
              <ul className="space-y-1.5">
                {resultEntries.map(([table, r]) => (
                  <li
                    key={table}
                    className="flex items-center justify-between gap-4 text-xs border-b border-white/5 pb-1.5 last:border-0"
                  >
                    <span className="text-white/80 font-mono truncate">{table}</span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white/50">{r.imported} rows</span>
                      <span
                        className={
                          r.status === 'failed'
                            ? 'text-red-400'
                            : r.status === 'empty'
                            ? 'text-white/40'
                            : 'text-green-400'
                        }
                      >
                        {r.status}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
