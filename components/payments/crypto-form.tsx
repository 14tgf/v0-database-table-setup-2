'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle } from 'lucide-react';
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

  const network_info = CRYPTO_NETWORKS[selected];
  const demo_address = '1A1z7agoat2JLLSQb7EL347F8D4hjrjxa';

  const handleCopy = () => {
    navigator.clipboard.writeText(demo_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'deposit' && !walletAddress) {
      alert('Please provide a wallet address or proof');
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
          {/* Wallet Address Display for Deposit */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Send To Wallet Address</label>
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-accent break-all">{demo_address}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 hover:bg-accent/20 rounded transition-colors flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-accent" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Proof Upload */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Upload Payment Proof (Optional)</label>
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
