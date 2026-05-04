'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Edit2, Lock, Unlock } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  status: 'active' | 'frozen';
  joinDate: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [note, setNote] = useState('');

  const users: User[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', balance: 5000, status: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'Alice Johnson', email: 'alice@example.com', balance: 12500, status: 'active', joinDate: '2024-02-20' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', balance: 8750, status: 'active', joinDate: '2024-01-30' },
    { id: '4', name: 'Sarah Davis', email: 'sarah@example.com', balance: 15000, status: 'frozen', joinDate: '2024-03-05' },
    { id: '5', name: 'Mike Brown', email: 'mike@example.com', balance: 3200, status: 'active', joinDate: '2024-03-10' },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustment = () => {
    if (selectedUser && adjustmentAmount) {
      const amount = parseFloat(adjustmentAmount);
      const newBalance = adjustmentType === 'credit' 
        ? selectedUser.balance + amount 
        : selectedUser.balance - amount;
      
      console.log(`[v0] Adjusting ${selectedUser.name}'s balance: ${adjustmentType} ${amount} (New: ${newBalance}), Note: ${note}`);
      setSelectedUser(null);
      setAdjustmentAmount('');
      setNote('');
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Page Title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage user accounts and balances</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={staggerItem} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 text-sm"
        />
      </motion.div>

      {/* Users Table */}
      <motion.div variants={staggerItem} className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Balance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-foreground font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-white/70">{user.email}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">${user.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.status === 'active' 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Frozen'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70 text-xs">{user.joinDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-1.5 hover:bg-accent/20 rounded transition-colors text-accent"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Balance Adjustment Modal */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground mb-1">Adjust Balance</h2>
            <p className="text-xs text-white/60 mb-4">{selectedUser.name}</p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Current Balance</label>
                <p className="text-xl font-bold text-accent">${selectedUser.balance.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Adjustment Type</label>
                <div className="flex gap-2">
                  {['credit', 'debit'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAdjustmentType(type as 'credit' | 'debit')}
                      className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                        adjustmentType === type
                          ? type === 'credit' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {type === 'credit' ? 'Credit (+)' : 'Debit (-)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Note / Reason</label>
                <textarea
                  placeholder="Add a note for this adjustment..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm resize-none h-20"
                />
              </div>

              {adjustmentAmount && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-white/70">New Balance</p>
                  <p className="text-lg font-bold text-foreground">
                    ${(adjustmentType === 'credit' 
                      ? selectedUser.balance + parseFloat(adjustmentAmount) 
                      : selectedUser.balance - parseFloat(adjustmentAmount)
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-foreground rounded-lg hover:bg-white/10 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustment}
                disabled={!adjustmentAmount}
                className="flex-1 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
