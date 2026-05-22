'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GIFTCARD_BRANDS } from '@/lib/payments';

interface GiftCardFormProps {
  onSubmit: (data: any) => void;
}

export function GiftCardForm({ onSubmit }: GiftCardFormProps) {
  const [cardType, setCardType] = useState<'physical' | 'egiftcard'>('physical');
  const [brand, setBrand] = useState('');
  const [amount, setAmount] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [ePin, setEPin] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardType === 'physical') {
      if (!frontImage || !backImage) {
        alert('Please upload both front and back images');
        return;
      }
      // Use frontImage as the primary proof image for the API
      onSubmit({ 
        type: 'physical', 
        brand, 
        amount: parseFloat(amount), 
        proofImage: frontImage, // Send as proofImage for consistent API handling
        additionalImages: { backImage }, // Store back image separately if needed
        notes 
      });
    } else {
      onSubmit({ 
        type: 'egiftcard', 
        brand, 
        amount: parseFloat(amount), 
        ePin, 
        notes 
      });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Card Type Toggle */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Card Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCardType('physical')}
            className={`p-2 rounded-lg border-2 transition-all text-xs font-semibold ${
              cardType === 'physical'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-white/10 bg-white/5 text-foreground'
            }`}
          >
            Physical Card
          </button>
          <button
            type="button"
            onClick={() => setCardType('egiftcard')}
            className={`p-2 rounded-lg border-2 transition-all text-xs font-semibold ${
              cardType === 'egiftcard'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-white/10 bg-white/5 text-foreground'
            }`}
          >
            E-Gift Card
          </button>
        </div>
      </div>

      {/* Brand Selection */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Gift Card Brand</label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs focus:outline-none focus:border-accent/50"
          required
        >
          <option value="">Select a brand...</option>
          {GIFTCARD_BRANDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Card Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {cardType === 'physical' ? (
        <>
          {/* Front Image */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Card Front Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-accent file:text-background file:text-xs file:font-semibold"
              required
            />
          </div>

          {/* Back Image */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Card Back Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-accent file:text-background file:text-xs file:font-semibold"
              required
            />
          </div>
        </>
      ) : (
        <>
          {/* E-PIN */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">E-PIN / Code</label>
            <input
              type="password"
              value={ePin}
              onChange={(e) => setEPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
              required
            />
          </div>
        </>
      )}

      {/* Additional Notes */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information..."
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 min-h-20"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
      >
        Submit Gift Card Deposit
      </button>
    </motion.form>
  );
}
