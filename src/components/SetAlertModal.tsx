import React, { useState } from 'react';
import { X, BellRing, Sparkles, Check, ShieldCheck, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types/index.ts';
import { useAlerts } from '../context/AlertContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface SetAlertModalProps {
  product: Product;
  onClose: () => void;
}

export const SetAlertModal: React.FC<SetAlertModalProps> = ({ product, onClose }) => {
  const { createAlert, getAlertForProduct } = useAlerts();
  const { showToast } = useNotifications();

  const currentPrice = product.lowestPrice || 0;

  // Input field is completely empty when user opens the form
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [emailAlert, setEmailAlert] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePercentageClick = (pct: number) => {
    if (currentPrice > 0) {
      const discounted = Math.round((currentPrice * (100 - pct)) / 100);
      setTargetPrice(String(discounted));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStr = targetPrice.trim();
    const numericTarget = parseFloat(cleanStr);

    if (!cleanStr || isNaN(numericTarget) || numericTarget <= 0) {
      showToast('Please enter a valid target price', 'warning');
      return;
    }

    if (currentPrice > 0 && numericTarget >= currentPrice) {
      showToast('Target price should be lower than current verified price', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAlert(product.id, numericTarget);

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD43B', '#4F8CFF', '#22C55E'],
      });

      showToast(`Target price alert set for ₹${numericTarget.toLocaleString('en-IN')}!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to set price alert', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericTarget = parseFloat(targetPrice) || 0;
  const savings = currentPrice > 0 && numericTarget > 0 ? Math.max(0, currentPrice - numericTarget) : 0;
  const savingsPct = currentPrice > 0 && savings > 0 ? Math.round((savings / currentPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141821] border border-[#283042] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#FFD43B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD43B]/10 border border-[#FFD43B]/30 flex items-center justify-center text-[#FFD43B]">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Target Price Alert</h3>
              <p className="text-xs text-[#A0A8B8]">We'll notify you the instant the price drops.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A0A8B8] hover:text-white hover:bg-[#1C2230] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product brief */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#0B0D12] border border-[#1C2230] mb-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-contain rounded-xl bg-[#141821] p-1.5 border border-[#283042]"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-[#4F8CFF] font-bold uppercase">{product.brand}</span>
            <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-[#FFD43B]">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-[#A0A8B8]">
                Lowest at {product.cheapestStore || 'Amazon'}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white mb-2">
              Your Desired Target Price (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#FFD43B]">
                ₹
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                min="1"
                step="any"
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-[#FFD43B] transition"
                placeholder="Enter target price"
                required
              />
            </div>
          </div>

          {/* Quick Percentage Chips */}
          <div>
            <label className="block text-[11px] text-[#A0A8B8] mb-2 font-medium">
              Quick Target Discounts from Current Price:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => handlePercentageClick(pct)}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] hover:border-[#FFD43B]/50 transition cursor-pointer"
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Savings Calculation preview */}
          {savings > 0 && (
            <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-xs text-[#22C55E] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Potential Savings:
              </span>
              <span className="font-bold">
                Save ₹{savings.toLocaleString('en-IN')} ({savingsPct}%)
              </span>
            </div>
          )}

          {/* Channels */}
          <div className="space-y-2 pt-2 border-t border-[#1C2230]">
            <label className="flex items-center gap-3 text-xs text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 rounded text-[#FFD43B] bg-[#0B0D12] border-[#283042]"
              />
              <span>In-App Real-time Notification Center (Instant)</span>
            </label>

            <label className="flex items-center gap-3 text-xs text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailAlert}
                onChange={(e) => setEmailAlert(e.target.checked)}
                className="w-4 h-4 rounded text-[#FFD43B] bg-[#0B0D12] border-[#283042]"
              />
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#4F8CFF]" /> Send Email Alert via SMTP Server
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C2230]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A0A8B8] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <BellRing className="w-4 h-4" />
              {isSubmitting ? 'Configuring Alert...' : 'Activate Price Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
