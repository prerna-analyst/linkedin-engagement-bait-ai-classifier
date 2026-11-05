import React, { useState, useEffect } from 'react';
import { Zap, TrendingDown, Sparkles, ShieldCheck, Clock, Flame, ArrowRight } from 'lucide-react';
import { Product, PriceHistoryRecord } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../services/api.ts';

interface DealsPageProps {
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({ navigate, onSetAlert }) => {
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [recentDrops, setRecentDrops] = useState<PriceHistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'huge_discounts' | 'recent_drops'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      setIsLoading(true);
      try {
        const res = await api.getDeals();
        setBestDeals(res.bestDeals || []);
        setTrending(res.trending || []);
        setRecentDrops(res.recentDrops || []);
      } catch (err) {
        console.warn('Error loading deals:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-[#141821] via-[#1C2230] to-[#141821] border border-[#FFD43B]/30 rounded-3xl p-8 sm:p-10 mb-10 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD43B]/10 border border-[#FFD43B]/30 text-xs font-bold text-[#FFD43B] mb-3">
              <Zap className="w-3.5 h-3.5" /> Rule-Based Smart Deal Finder
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Today's Highest Verified Discounts
            </h1>
            <p className="text-xs sm:text-sm text-[#A0A8B8] leading-relaxed">
              Every deal displayed here is mathematically ranked based on true manufacturer MSRP, verified live store prices, and multi-week historical averages.
            </p>
          </div>

          <div className="absolute right-6 -bottom-10 opacity-10 sm:opacity-20 pointer-events-none">
            <Flame className="w-64 h-64 text-[#FFD43B]" />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-8 bg-[#141821] p-1.5 rounded-2xl border border-[#1C2230] w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#FFD43B] text-black shadow-md'
                : 'text-[#A0A8B8] hover:text-white'
            }`}
          >
            All Verified Deals ({bestDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('huge_discounts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'huge_discounts'
                ? 'bg-[#FFD43B] text-black shadow-md'
                : 'text-[#A0A8B8] hover:text-white'
            }`}
          >
            Big Discounts (&gt;20%)
          </button>
          <button
            onClick={() => setActiveTab('recent_drops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'recent_drops'
                ? 'bg-[#FFD43B] text-black shadow-md'
                : 'text-[#A0A8B8] hover:text-white'
            }`}
          >
            Recently Dropped
          </button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-[#FFD43B] flex items-center justify-center gap-3 text-sm">
            <Clock className="w-5 h-5 animate-spin" /> Scanning deal algorithms...
          </div>
        ) : activeTab === 'recent_drops' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDrops.map((drop) => (
              <div
                key={drop.id}
                onClick={() => navigate(`/products/${drop.productId}`)}
                className="bg-[#141821] hover:bg-[#1C2230] border border-[#1C2230] hover:border-[#FFD43B]/40 rounded-2xl p-5 transition flex flex-col justify-between cursor-pointer shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9900]">
                      {drop.storeName}
                    </span>
                    <span className="text-[10px] text-[#A0A8B8]">
                      {new Date(drop.recordedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{drop.notes || 'Price Drop Event'}</h4>
                  <span className="text-xs text-[#22C55E] flex items-center gap-1 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" /> Price reached ₹{drop.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1C2230] flex items-center justify-between text-xs">
                  <span className="text-[#A0A8B8]">Verified Record</span>
                  <span className="text-[#FFD43B] font-bold flex items-center gap-1">
                    Inspect Product →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeTab === 'huge_discounts'
              ? bestDeals.filter((p) => (p.discountPercentage || 0) >= 20)
              : bestDeals
            ).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(id) => navigate(`/products/${id}`)}
                onCompare={(id) => navigate(`/compare?product=${id}`)}
                onSetAlert={onSetAlert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
