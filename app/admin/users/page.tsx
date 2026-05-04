'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Edit2, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';

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
  stockBalance: number;
  vehicleBalance: number;
  energyBalance: number;
  status: 'active' | 'frozen';
  joinDate: string;
}

type BalanceType = 'wallet' | 'stock' | 'vehicle' | 'energy';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceType, setBalanceType] = useState<BalanceType>('wallet');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [note, setNote] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; details?: string } | null>(null);

  // Fetch users on mount and when search changes
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const response = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (!response.ok) {
          const errorMsg = data.error || data.message || 'Failed to fetch users';
          throw new Error(errorMsg);
        }
        
        setUsers(data.users || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('[v0] Fetch users error:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load users',
          details: errorMessage
        });
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const filteredUsers = users;

  const handleAdjustment = async () => {
    if (!selectedUser || !adjustmentAmount) return;

    setIsAdjusting(true);
    try {
      const response = await fetch('/api/admin/users/adjust-balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(adjustmentAmount),
          type: adjustmentType,
          balanceType: balanceType,
          reason: note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to adjust balance';
        setMessage({ 
          type: 'error', 
          text: 'Failed to adjust balance',
          details: errorMsg
        });
        return;
      }

      setMessage({ type: 'success', text: `${balanceType} balance adjusted successfully for ${selectedUser.name}` });
      
      // Update local users list
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          const updatedUser = { ...u };
          const newValue = data.user.newBalance;
          
          switch(balanceType) {
            case 'stock':
              updatedUser.stockBalance = newValue;
              break;
            case 'vehicle':
              updatedUser.vehicleBalance = newValue;
              break;
            case 'energy':
              updatedUser.energyBalance = newValue;
              break;
            default:
              updatedUser.balance = newValue;
          }
          
          return updatedUser;
        }
        return u;
      });
      
      setUsers(updatedUsers);

      // Clear form
      setSelectedUser(null);
      setAdjustmentAmount('');
      setNote('');
      setAdjustmentType('credit');
      setBalanceType('wallet');

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Adjustment error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while adjusting balance',
        details: errorMessage
      });
    } finally {
      setIsAdjusting(false);
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

      {/* Notification Message */}
      {message && (
        <motion.div
          variants={staggerItem}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-400/10 border-green-400/30 text-green-400'
              : 'bg-red-400/10 border-red-400/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{message.text}</p>
            {message.details && (
              <p className="text-xs mt-1.5 opacity-90 break-words">{message.details}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div variants={staggerItem} className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-white/60">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-white/60">No users found</div>
          ) : (
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
                    <td className="px-4 py-3 text-foreground font-semibold">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
          )}
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
                <label className="block text-xs font-semibold text-white/70 mb-2">Balance Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'wallet' as BalanceType, label: 'Wallet' },
                    { value: 'stock' as BalanceType, label: 'Stocks' },
                    { value: 'vehicle' as BalanceType, label: 'Vehicles' },
                    { value: 'energy' as BalanceType, label: 'Energy' },
                  ].map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => setBalanceType(bt.value)}
                      className={`px-3 py-2 rounded text-xs font-semibold transition-colors ${
                        balanceType === bt.value
                          ? 'bg-accent/20 text-accent'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Current Balance</label>
                <p className="text-xl font-bold text-accent">
                  ${(balanceType === 'stock' ? selectedUser.stockBalance : 
                    balanceType === 'vehicle' ? selectedUser.vehicleBalance :
                    balanceType === 'energy' ? selectedUser.energyBalance :
                    selectedUser.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
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
                      ? (balanceType === 'stock' ? selectedUser.stockBalance : 
                         balanceType === 'vehicle' ? selectedUser.vehicleBalance :
                         balanceType === 'energy' ? selectedUser.energyBalance :
                         selectedUser.balance) + parseFloat(adjustmentAmount) 
                      : (balanceType === 'stock' ? selectedUser.stockBalance : 
                         balanceType === 'vehicle' ? selectedUser.vehicleBalance :
                         balanceType === 'energy' ? selectedUser.energyBalance :
                         selectedUser.balance) - parseFloat(adjustmentAmount)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={isAdjusting}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-foreground rounded-lg hover:bg-white/10 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustment}
                disabled={!adjustmentAmount || isAdjusting}
                className="flex-1 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdjusting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
