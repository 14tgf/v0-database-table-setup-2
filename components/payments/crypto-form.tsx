'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { CryptoType, CRYPTO_NETWORKS } from '@/lib/payments';

interface CryptoFormProps {
  type: 'deposit' | 'withdraw';
  onSubmit: (data: any) => void;
  autoAmount?: number;
}

export function CryptoForm({ type, onSubmit, autoAmount }: CryptoFormProps) {
  const [selected, setSelected] = useState<CryptoType>('BTC');
  const [amount, setAmount] = useState(autoAmount ? String(autoAmount) : '');
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
        setLoading(true);
        setError(null);

        const response = await fetch('/api/payments/methods', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          setError('Unable to load payment methods');
          return;
        }

        const result = await response.json();
        if (result.success && result.data?.crypto) {
          setPaymentMethods(result.data.crypto);
          // Set first available address
          const config = result.data.crypto.config as any;
          if (config.btc_address) {
            setWalletAddress(config.btc_address);
          }
        } else {
          setError('Invalid payment data format');
        }
      } catch (err) {
        setError('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    if (type === 'deposit') {
      fetchPaymentMethods();
    }
  }, [type]);

  // Get address and network for selected crypto
  const getAddressAndNetwork = () => {
    if (!paymentMethods?.config) return { address: '', network: '' };
    
    const config = paymentMethods.config as any;
    if (selected === 'BTC') {
      return { address: config.btc_address || '', network: config.btc_network || 'BTC' };
    } else if (selected === 'ETH') {
      return { address: config.eth_address || '', network: config.eth_network || 'ETH' };
    } else if (selected === 'USDT-ERC20') {
      return { address: config.usdt_erc20 || '', network: config.usdt_erc20_network || 'USDT ERC-20' };
    } else if (selected === 'USDT-TRC20') {
      return { address: config.usdt_trc20 || '', network: config.usdt_trc20_network || 'USDT TRC-20' };
    }
    return { address: '', network: '' };
  };

  const { address: displayAddress, network: displayNetwork } = getAddressAndNetwork();

  const handleCopy = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
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
    if (type === 'deposit' && !file) {
      alert('Please provide payment proof');
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['BTC', 'ETH', 'USDT-ERC20', 'USDT-TRC20'] as CryptoType[]).map((crypto) => (
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
              {crypto === 'USDT-ERC20' ? 'USDT (ERC-20)' : crypto === 'USDT-TRC20' ? 'USDT (TRC-20)' : crypto}
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
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount (USD)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={!!autoAmount}
          className={`w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 ${autoAmount ? 'opacity-60 cursor-not-allowed' : ''}`}
          required
        />
      </div>

      {type === 'deposit' && (
        <>
          {/* Error Message */}
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

          {/* Network Badge */}
          {!loading && !error && displayNetwork && (
            <div className="mb-2 px-2 py-1 bg-accent/10 border border-accent/30 rounded inline-block">
              <p className="text-xs text-accent font-semibold">{displayNetwork}</p>
            </div>
          )}

          {/* Wallet Address Display */}
          {!loading && !error && displayAddress && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Send To This Address</label>
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-accent break-all">{displayAddress}</code>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!displayAddress}
                  className="p-1.5 hover:bg-accent/20 rounded transition-colors flex-shrink-0 disabled:opacity-50"
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
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Upload Payment Proof</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-accent file:text-background file:text-xs file:font-semibold"
              required
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
