'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, CheckCircle2, AlertCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface MigrationResult {
  file: string;
  status: string;
  error?: string;
}

interface SetupResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  migrations?: MigrationResult[];
  admin?: {
    created: boolean;
    alreadyExisted: boolean;
    email: string;
    usedEnvCredentials: boolean;
    password?: string;
  };
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyReady, setAlreadyReady] = useState(false);
  const [result, setResult] = useState<SetupResponse | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/setup/init', { method: 'GET' });
        const data = await res.json();
        setAlreadyReady(Boolean(data.ready));
      } catch {
        setAlreadyReady(false);
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, []);

  const runSetup = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/setup/init', { method: 'POST' });
      const data: SetupResponse = await res.json();
      setResult(data);
      if (data.success) setAlreadyReady(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 mb-4">
            <Database className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
            Database Setup
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Run the database migrations and create the initial admin login in one step.
          </p>
        </div>

        {checking ? (
          <div className="flex items-center justify-center gap-2 text-white/60 py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking current status...
          </div>
        ) : (
          <>
            {alreadyReady && !result && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300 font-medium">
                    This database is already set up.
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    You can run setup again safely, it will not duplicate data or overwrite the
                    existing admin.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Create all tables</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    Runs every migration in order. Existing tables are left untouched.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Create admin login</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    Uses your ADMIN_EMAIL / ADMIN_PASSWORD env vars if set, otherwise a default
                    account.
                  </p>
                </div>
              </div>

              <button
                onClick={runSetup}
                disabled={loading}
                className="w-full mt-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Run Setup
                  </>
                )}
              </button>
            </div>

            {result && (
              <div className="mt-6 space-y-4">
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

                {result.admin && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm font-semibold text-foreground mb-2">Admin Login</p>
                    <dl className="space-y-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-white/50">Email</dt>
                        <dd className="text-white/90 font-mono">{result.admin.email}</dd>
                      </div>
                      {result.admin.password && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-white/50">Password</dt>
                          <dd className="text-white/90 font-mono">{result.admin.password}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-4">
                        <dt className="text-white/50">Status</dt>
                        <dd className="text-white/90">
                          {result.admin.alreadyExisted ? 'Already existed' : 'Newly created'}
                        </dd>
                      </div>
                    </dl>
                    {!result.admin.usedEnvCredentials && result.admin.password && (
                      <p className="text-xs text-yellow-400/90 mt-3">
                        These are default credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars
                        and change the password after first login.
                      </p>
                    )}
                    <Link
                      href="/admin/login"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                      Go to admin login
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {result.migrations && result.migrations.length > 0 && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm font-semibold text-foreground mb-2">Migrations</p>
                    <ul className="space-y-1">
                      {result.migrations.map((m) => (
                        <li key={m.file} className="flex items-center justify-between gap-4 text-xs">
                          <span className="text-white/70 font-mono truncate">{m.file}</span>
                          <span
                            className={
                              m.status === 'completed' ? 'text-green-400' : 'text-red-400'
                            }
                          >
                            {m.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-white/40 text-center mt-8">
          This is a one-time setup utility. Restrict access once your database is configured.
        </p>
      </div>
    </div>
  );
}
