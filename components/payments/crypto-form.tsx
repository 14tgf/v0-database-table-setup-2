'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { CryptoType, CRYPTO_NETWORKS } from '@/lib/payments';

interface CryptoFormProps {
  type: 'deposit' | 'withdraw';
  onSubmit: (data: any) => void;
}

export function CryptoForm({ type, onSubmit }: CryptoFormProps) {
  const [selected, setSelected] = useState<CryptoType>('BTC');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('mainnet');
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const network_info = CRYPTO_NETWORKS[selected];

  // Fetch payment methods from database
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        console.log('[v0] CRYPTO FORM - Fetching payment methods from database');
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/payments/fetch', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('[v0] CRYPTO FORM - API response status:', response.status);

        if (!response.ok) {
          console.warn('[v0] CRYPTO FORM - Failed to fetch payment methods:', response.status);
          setError('Unable to load payment methods');
          return;
        }

        const result = await response.json();
        console.log('[v0] CRYPTO FORM - Fetched payment methods:', result);

        if (result.success && result.data) {
          setPaymentMethods(result.data.crypto);
          console.log('[v0] CRYPTO FORM - Payment methods loaded:', result.data.crypto);
        } else {
          console.warn('[v0] CRYPTO FORM - Invalid response format');
          setError('Invalid payment data format');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[v0] CRYPTO FORM - Error fetching payment methods:', errorMsg);
        setError('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    if (type === 'deposit') {
      fetchPaymentMethods();
    }
  }, [type]);

  // Get the wallet address for the selected crypto type
  const getWalletAddress = () => {
    if (!paymentMethods) return '';

    const cryptoKey = selected === 'BTC' ? 'btc_address' : 
                      selected === 'ETH' ? 'eth_address' :
                      selected === 'USDT' ? 'usdt_erc20' : '';

    return paymentMethods[cryptoKey] || '';
  };

  const displayAddress = type === 'deposit' ? getWalletAddress() : walletAddress;

  const handleCopy = () => {
    const addressToCopy = getWalletAddress();
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'deposit' && !displayAddress) {
      alert('Payment address not available. Please try again later.');
      return;
    }
    if (type === 'deposit' && !walletAddress && !file) {
      alert('Please provide wallet proof or transaction ID');
      return;
    }
    if (type === 'withdraw' && !walletAddress) {
      alert('Please provide destination wallet address');
      return;
    }
    onSubmit({ cryptoType: selected, amount: parseFloat(amount), walletAddress, network, proofImage: file });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Crypto Type Selection */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Cryptocurrency</label>
        <div className="grid grid-cols-3 gap-2">
          {(['BTC', 'USDT', 'ETH'] as CryptoType[]).map((crypto) => (
            <button
              key={crypto}
              type="button"
              onClick={() => setSelected(crypto)}
              className={`p-2 rounded-lg border-2 transition-all text-xs font-semibold ${
                selected === crypto
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/10 bg-white/5 text-foreground hover:border-accent/50'
              }`}
            >
              {crypto}
            </button>
          ))}
        </div>
      </div>

      {/* Network Info */}
      <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Confirmation Time</p>
            <p className="text-xs font-semibold text-foreground">{network_info.confirmTime}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Minimum Deposit</p>
            <p className="text-xs font-semibold text-foreground">{network_info.minDeposit} {selected}</p>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount ({selected})</label>
        <input
          type="number"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {type === 'deposit' && (
        <>
          {/* Error Message if Payment Methods Failed to Load */}
          {error && (
            <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-400">{error}</p>
                <p className="text-xs text-red-400/80 mt-1">Please refresh the page or contact support.</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg">
              <p className="text-xs text-blue-400">Loading payment addresses...</p>
            </div>
          )}

          {/* Wallet Address Display for Deposit */}
          {!loading && !error && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Send To Wallet Address</label>
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-accent break-all">{displayAddress || 'Address loading...'}</code>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!displayAddress}
                  className="p-1.5 hover:bg-accent/20 rounded transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-accent" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Payment Proof Upload */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Upload Payment Proof or TX ID (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-accent file:text-background file:text-xs file:font-semibold"
            />
          </div>
        </>
      )}

      {type === 'withdraw' && (
        <>
          {/* Destination Wallet Address */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Destination Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your wallet address"
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
              required
            />
          </div>

          {/* Network Selection */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs focus:outline-none focus:border-accent/50"
            >
              <option value="mainnet">Mainnet</option>
              <option value="testnet">Testnet</option>
            </select>
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
      >
        {type === 'deposit' ? 'Submit Deposit Request' : 'Submit Withdrawal Request'}
      </button>
    </motion.form>
  );
}
