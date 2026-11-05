import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  Clock,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { PriceHistoryRecord } from '../types/index.ts';

interface PriceHistoryPageProps {
  navigate: (path: string) => void;
}

export const PriceHistoryPage: React.FC<PriceHistoryPageProps> = ({ navigate }) => {
  const [historyRecords, setHistoryRecords] = useState<PriceHistoryRecord[]>([]);
  const [filterStore, setFilterStore] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDealsAndHistory() {
      setIsLoading(true);
      try {
        const res = await api.getDeals();
        setHistoryRecords(res.recentDrops || []);
      } catch (err) {
        console.warn('Error loading history records:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDealsAndHistory();
  }, []);

  const filtered = historyRecords.filter((r) =>
    filterStore === 'all' ? true : r.storeName.toLowerCase().includes(filterStore.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#FFD43B]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Historical Price Analytics & Market Audit
              </h1>
            </div>
            <p className="text-xs text-[#A0A8B8] mt-1">
              Deterministic records logged to price_history table across scheduled periodic runs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A0A8B8]">Filter Store:</span>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="bg-[#141821] border border-[#283042] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD43B] cursor-pointer"
            >
              <option value="all">All Retailers</option>
              <option value="Amazon">Amazon India</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Croma">Croma Retail</option>
              <option value="Reliance">Reliance Digital</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#141821] border border-[#1C2230] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#1C2230] border-b border-[#283042] flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Price Fluctuation History ({filtered.length} recent captures)
            </span>
            <span className="text-[11px] text-[#22C55E] flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct Store Audit Trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#283042] text-[#A0A8B8] uppercase text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Retail Store</th>
                  <th className="py-3.5 px-4 font-semibold">Recorded Price</th>
                  <th className="py-3.5 px-4 font-semibold">Audit Classification</th>
                  <th className="py-3.5 px-4 font-semibold">Verification</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Product</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2230]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#181d28] transition">
                    <td className="py-3.5 px-4 text-[#A0A8B8] font-mono">
                      {new Date(item.recordedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.storeName}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#22C55E]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-[#A0A8B8]">
                      {item.notes || 'Automated Scheduler Capture'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                        {item.isVerified ? 'Verified Live' : 'Demo Capture'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/products/${item.productId}`)}
                        className="text-xs text-[#FFD43B] hover:underline font-semibold cursor-pointer"
                      >
                        Inspect Product →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
