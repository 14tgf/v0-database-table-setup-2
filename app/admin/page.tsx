'use client';

import { motion } from 'framer-motion';
import { Users, Clock, CreditCard, CheckCircle2, Activity, TrendingUp } from 'lucide-react';

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

export default function AdminDashboard() {
  const stats = [
    { icon: Users, label: 'Total Users', value: '1,284', color: 'text-accent' },
    { icon: Clock, label: 'Pending KYC', value: '42', color: 'text-yellow-400' },
    { icon: CreditCard, label: 'Pending Payments', value: '18', color: 'text-orange-400' },
    { icon: CheckCircle2, label: 'Active Members', value: '856', color: 'text-green-400' },
  ];

  const recentActivity = [
    { type: 'signup', user: 'John Smith', action: 'New user signup', time: '5 mins ago' },
    { type: 'kyc', user: 'Alice Johnson', action: 'KYC submitted', time: '12 mins ago' },
    { type: 'payment', user: 'Bob Wilson', action: 'Membership payment submitted', time: '28 mins ago' },
    { type: 'approval', user: 'Sarah Davis', action: 'KYC approved', time: '1 hour ago' },
    { type: 'signup', user: 'Mike Brown', action: 'New user signup', time: '2 hours ago' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor key metrics and recent activity</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/60 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Section */}
        <motion.div
          variants={staggerItem}
          className="lg:col-span-2 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Analytics</h2>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-white/70">User Registrations (This Week)</span>
                <span className="text-xs font-semibold text-accent">+12</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-full w-3/4 bg-gradient-to-r from-accent to-blue-500 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-white/70">KYC Approvals (This Week)</span>
                <span className="text-xs font-semibold text-green-400">+8</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-full w-1/2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-white/70">Membership Approvals (This Week)</span>
                <span className="text-xs font-semibold text-yellow-400">+5</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-full w-1/3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Status */}
        <motion.div
          variants={staggerItem}
          className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
        >
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Status
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70">System</span>
              <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded font-semibold">Online</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70">API</span>
              <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded font-semibold">Operational</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70">Database</span>
              <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded font-semibold">Connected</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
      >
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Activity</h2>
        
        <div className="space-y-2">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded transition-colors">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {activity.user} <span className="text-white/60 font-normal">{activity.action}</span>
                </p>
                <p className="text-xs text-white/50 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
