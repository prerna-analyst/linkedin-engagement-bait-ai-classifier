import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronDown,
  Layers,
  Truck,
  Star,
  Info,
} from 'lucide-react';
import { Product, StoreListing } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ProductComparisonPageProps {
  initialProductId?: string;
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const ProductComparisonPage: React.FC<ProductComparisonPageProps> = ({
  initialProductId = '',
  navigate,
  onSetAlert,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [comparisonData, setComparisonData] = useState<{
    product: Product;
    listings: StoreListing[];
    cheapestListing: StoreListing;
    maxSavings: number;
    comparisonCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllProducts() {
      try {
        const res = await api.getProducts({ limit: 50 });
        setAllProducts(res.products || []);
        if (!selectedProductId && res.products.length > 0) {
          setSelectedProductId(res.products[0].id);
        }
      } catch (err) {
        console.warn('Error fetching products for comparison:', err);
      }
    }
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;

    let isMounted = true;
    async function runComparison() {
      setIsLoading(true);
      try {
        const data = await api.compareProduct(selectedProductId);
        if (isMounted) {
          setComparisonData(data);
        }
      } catch (err) {
        console.warn('Error running comparison:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    runComparison();
    return () => {
      isMounted = false;
    };
  }, [selectedProductId]);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-xs font-bold text-[#4F8CFF] mb-2">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Deterministic Store Comparison Algorithm
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Multi-Store Price Comparison Matrix
              </h1>
              <p className="text-xs text-[#A0A8B8] mt-1">
                Comparing verified prices across Amazon, Flipkart, Croma, and Reliance Digital.
              </p>
            </div>

            {/* Product Selector Dropdown */}
            <div className="w-full sm:w-80">
              <label className="block text-[11px] text-[#A0A8B8] font-semibold mb-1">
                Select Product to Compare:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#141821] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B] cursor-pointer"
              >
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading || !comparisonData ? (
          <div className="p-16 text-center text-[#FFD43B] flex items-center justify-center gap-3 text-sm">
            <Clock className="w-5 h-5 animate-spin" /> Evaluating latest store listing records...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Savings & Best Store Banner */}
            <div className="bg-gradient-to-r from-[#141821] via-[#1C2230] to-[#141821] border border-[#22C55E]/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-5">
                <img
                  src={comparisonData.product.image}
                  alt={comparisonData.product.name}
                  className="w-20 h-20 object-contain rounded-2xl bg-[#0B0D12] p-2 border border-[#283042]"
                />
                <div>
                  <span className="text-xs font-bold text-[#4F8CFF] uppercase">
                    {comparisonData.product.brand}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {comparisonData.product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#A0A8B8]">Best Store:</span>
                    <span className="text-xs font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                      {comparisonData.cheapestListing?.storeName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0 bg-[#0B0D12]/70 p-4 rounded-2xl border border-[#283042]">
                <span className="text-[11px] text-[#A0A8B8] block">Maximum Potential Savings</span>
                <span className="text-2xl sm:text-3xl font-black text-[#22C55E] block">
                  ₹{comparisonData.maxSavings.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#A0A8B8]">
                  Comparing cheapest vs highest store
                </span>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-[#1C2230] border-b border-[#283042] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Store Listing Breakdown
                </span>
                <span className="text-xs text-[#A0A8B8]">
                  Sorted by Lowest Available Price
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#283042] text-[#A0A8B8] uppercase text-[10px]">
                      <th className="py-3.5 px-4 font-semibold">Store</th>
                      <th className="py-3.5 px-4 font-semibold">Verification Status</th>
                      <th className="py-3.5 px-4 font-semibold">Current Price</th>
                      <th className="py-3.5 px-4 font-semibold">Original (MRP)</th>
                      <th className="py-3.5 px-4 font-semibold">Discount</th>
                      <th className="py-3.5 px-4 font-semibold">Delivery & Rating</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2230]">
                    {comparisonData.listings.map((l, index) => {
                      const isCheapest = l.id === comparisonData.cheapestListing?.id;
                      return (
                        <tr
                          key={l.id}
                          className={`hover:bg-[#181d28] transition ${
                            isCheapest ? 'bg-[#22C55E]/5' : ''
                          }`}
                        >
                          <td className="py-4 px-4 font-semibold text-white flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ backgroundColor: l.accentColor || '#1C2230' }}
                            >
                              {l.storeName.charAt(0)}
                            </div>
                            <span>{l.storeName}</span>
                            {isCheapest && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#22C55E] text-black">
                                LOWEST
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                l.verificationStatus === 'VERIFIED_LIVE'
                                  ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                                  : 'bg-[#FFD43B]/10 text-[#FFD43B] border border-[#FFD43B]/20'
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {l.verificationStatus === 'VERIFIED_LIVE' ? 'Verified Live Price' : 'Demo Price'}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`text-sm font-extrabold ${
                                isCheapest ? 'text-[#22C55E]' : 'text-white'
                              }`}
                            >
                              ₹{l.currentPrice.toLocaleString('en-IN')}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-[#64748B] line-through">
                            ₹{l.originalPrice.toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-[#FFD43B]">
                              {l.discountPercentage}% OFF
                            </span>
                          </td>

                          <td className="py-4 px-4 text-[#A0A8B8]">
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-white">
                                <Truck className="w-3 h-3 text-[#4F8CFF]" /> {l.deliveryInfo}
                              </span>
                              <span className="text-[10px] text-[#A0A8B8]">
                                ★ {l.rating} ({l.reviewsCount} verified reviews)
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <a
                              href={l.storeProductUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                                isCheapest
                                  ? 'bg-[#22C55E] hover:bg-[#1eb054] text-black shadow-md'
                                  : 'bg-[#1C2230] hover:bg-[#283042] text-white border border-[#283042]'
                              }`}
                            >
                              Buy Deal <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-[#141821] border border-[#1C2230] rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-white">Want to wait for an even deeper price drop?</h4>
                <p className="text-xs text-[#A0A8B8]">Set an automated alert for this product across all 4 retailers.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSetAlert(comparisonData.product)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-md cursor-pointer"
                >
                  Create Target Price Alert
                </button>
                <button
                  onClick={() => navigate(`/products/${comparisonData.product.id}`)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] cursor-pointer"
                >
                  View Historical Graphs →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
