'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface SetupStep {
  id: 'schema' | 'seed';
  title: string;
  description: string;
  icon: any;
  endpoint: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function VIPSetupPage() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'schema',
      title: 'Initialize VIP Schema',
      description: 'Create the VIP plans and membership tables in the database',
      icon: Database,
      endpoint: '/api/admin/init-vip-schema',
      status: 'idle',
    },
    {
      id: 'seed',
      title: 'Seed VIP Plans',
      description: 'Populate the database with the 4 VIP membership tiers (Bronze, Silver, Private Access, Platinum)',
      icon: Zap,
      endpoint: '/api/admin/seed-vip-plans',
      status: 'idle',
    },
  ]);

  const [setupComplete, setSetupComplete] = useState(false);

  const runStep = async (stepId: 'schema' | 'seed') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    // Update status to loading
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[stepIndex].status = 'loading';
      newSteps[stepIndex].message = undefined;
      return newSteps;
    });

    try {
      console.log(`[v0] Running VIP setup step: ${stepId}`);
      const response = await fetch(steps[stepIndex].endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetail = data.details || data.message || data.error || 'Step failed';
        throw new Error(errorDetail);
      }

      // If this is the seed step, verify the plans were actually inserted
      if (stepId === 'seed') {
        console.log('[v0] Verifying VIP plans were inserted...');
        const verifyResponse = await fetch('/api/vip/plans');
        const plans = await verifyResponse.json();
        console.log('[v0] Plans verification result:', { count: plans.length, plans });

        if (!Array.isArray(plans) || plans.length === 0) {
          throw new Error('Seed reported success but no plans found in database. This may indicate a database connection issue.');
        }

        // Update message with verified count
        setSteps(prev => {
          const newSteps = [...prev];
          newSteps[stepIndex].status = 'success';
          newSteps[stepIndex].message = `✓ Verified: ${plans.length} VIP plans successfully inserted and readable from database`;
          return newSteps;
        });

        console.log(`[v0] VIP plans verification passed: ${plans.length} plans found`);
      } else {
        // Update status to success
        setSteps(prev => {
          const newSteps = [...prev];
          newSteps[stepIndex].status = 'success';
          newSteps[stepIndex].message = data.message || 'Step completed successfully';
          return newSteps;
        });

        console.log(`[v0] VIP setup step ${stepId} completed:`, data);
      }

      // Check if all steps are complete
      const allStepsAfter = [...steps];
      allStepsAfter[stepIndex].status = 'success';
      if (allStepsAfter.every(s => s.status === 'success')) {
        setSetupComplete(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[v0] VIP setup step ${stepId} failed:`, errorMessage);

      // Update status to error
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[stepIndex].status = 'error';
        newSteps[stepIndex].message = errorMessage;
        return newSteps;
      });
    }
  };

  const runAllSteps = async () => {
    setSetupComplete(false);
    setSteps(prev => prev.map(s => ({ ...s, status: 'idle', message: undefined })));

    // Run schema step first
    console.log('[v0] Running all VIP setup steps...');
    await runStep('schema');

    // Then run seed step
    setTimeout(() => {
      runStep('seed');
    }, 500);
  };

  const allStepsComplete = steps.every(s => s.status === 'success');
  const anyStepRunning = steps.some(s => s.status === 'loading');
  const anyStepFailed = steps.some(s => s.status === 'error');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">VIP Membership Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">Initialize and configure the VIP membership system</p>
      </motion.div>

      {/* Status Overview */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Setup Status</h2>
          <div className="flex items-center gap-2">
            {allStepsComplete ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Ready</span>
              </>
            ) : anyStepFailed ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Failed</span>
              </>
            ) : anyStepRunning ? (
              <>
                <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
                <span className="text-sm font-semibold text-yellow-400">In Progress</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">Pending</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-white/70">Initialization Progress</span>
              <span className="text-xs font-semibold text-accent">
                {steps.filter(s => s.status === 'success').length}/{steps.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(steps.filter(s => s.status === 'success').length / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {allStepsComplete && (
          <div className="mt-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
            <p className="text-sm text-green-400">
              ✓ VIP membership system is fully initialized! Users can now access the VIP membership page.
            </p>
          </div>
        )}

        {anyStepFailed && (
          <div className="mt-4 p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
            <p className="text-sm text-red-400">
              ✗ Setup encountered an error. Please review the step details below and try again.
            </p>
          </div>
        )}
      </motion.div>

      {/* Setup Steps */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = step.status === 'success';
          const isError = step.status === 'error';
          const isLoading = step.status === 'loading';

          return (
            <motion.div
              key={step.id}
              variants={staggerItem}
              className={`border rounded-lg p-6 transition-all duration-300 ${
                isComplete
                  ? 'bg-green-400/5 border-green-400/30'
                  : isError
                  ? 'bg-red-400/5 border-red-400/30'
                  : 'bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`mt-1 p-2.5 rounded-lg ${
                      isComplete
                        ? 'bg-green-400/20'
                        : isError
                        ? 'bg-red-400/20'
                        : 'bg-accent/20'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isError ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : isLoading ? (
                      <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>

                {step.status !== 'idle' && (
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        isComplete
                          ? 'bg-green-400/20 text-green-400'
                          : isError
                          ? 'bg-red-400/20 text-red-400'
                          : isLoading
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : ''
                      }`}
                    >
                      {isComplete ? 'Complete' : isError ? 'Failed' : isLoading ? 'Running' : 'Idle'}
                    </span>
                  </div>
                )}
              </div>

              {step.message && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className={`text-xs font-mono ${isError ? 'text-red-400' : isComplete ? 'text-green-400' : 'text-white/60'}`}>
                    {step.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!isComplete && (
                  <button
                    onClick={() => runStep(step.id)}
                    disabled={isLoading || anyStepRunning}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isError
                        ? 'bg-orange-400/20 text-orange-400 hover:bg-orange-400/30 disabled:opacity-50'
                        : 'bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Running...
                      </span>
                    ) : isError ? (
                      'Retry'
                    ) : (
                      'Run Step'
                    )}
                  </button>
                )}

                {isComplete && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Run All Button */}
      <motion.div variants={staggerItem}>
        <button
          onClick={runAllSteps}
          disabled={anyStepRunning || allStepsComplete}
          className={`w-full px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
            allStepsComplete
              ? 'bg-green-400/20 text-green-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-accent to-blue-500 text-white hover:from-accent/90 hover:to-blue-500/90 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {anyStepRunning ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Setting up...
            </span>
          ) : allStepsComplete ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Setup Complete!
            </span>
          ) : (
            'Run All Setup Steps'
          )}
        </button>
      </motion.div>

      {/* Information Box */}
      <motion.div
        variants={staggerItem}
        className="bg-blue-400/5 border border-blue-400/30 rounded-lg p-4"
      >
        <h3 className="text-sm font-semibold text-blue-400 mb-2">What This Does</h3>
        <ul className="text-xs text-white/70 space-y-1">
          <li>• <strong>Schema Step:</strong> Creates the vip_plans and user_vip_memberships tables in your Neon database</li>
          <li>• <strong>Seed Step:</strong> Populates the database with 4 VIP tiers: Bronze ($99), Silver ($249), Private Access ($5000), and Platinum ($999)</li>
          <li>• Once complete, users can purchase VIP memberships from the /vip-membership page</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
