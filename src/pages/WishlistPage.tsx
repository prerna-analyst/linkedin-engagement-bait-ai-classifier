import React from 'react';
import {
  Heart,
  Trash2,
  BellRing,
  ArrowRightLeft,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Product } from '../types/index.ts';
import { exportWishlistCSV } from '../utils/csvExport.ts';

interface WishlistPageProps {
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate, onSetAlert }) => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const { showToast } = useNotifications();

  const handleRemove = async (id: string, name?: string) => {
    try {
      await removeFromWishlist(id);
      showToast(`Removed ${name || 'item'} from your wishlist`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-400 fill-current" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Saved Wishlist</h1>
            </div>
            <p className="text-xs text-[#A0A8B8] mt-1">
              {wishlist.length} products monitored across Amazon, Flipkart, Croma, and Reliance Digital.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (wishlist.length === 0) {
                  showToast('Your wishlist is empty', 'warning');
                  return;
                }
                exportWishlistCSV(wishlist);
                showToast(`Exported ${wishlist.length} wishlist items as CSV`, 'success');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center gap-1.5 cursor-pointer transition"
            >
              <Download className="w-4 h-4 text-pink-400" /> Export Wishlist (CSV)
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] cursor-pointer"
            >
              Explore More Products
            </button>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-12 text-center max-w-lg mx-auto">
            <Heart className="w-12 h-12 text-[#A0A8B8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Your Wishlist is Empty</h3>
            <p className="text-xs text-[#A0A8B8] mb-6">
              Save your favourite smartphones, laptops, audio gear, and gadgets to track their lowest available prices.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;
              const lowestPrice = product.lowestPrice || 0;

              return (
                <div
                  key={item.id}
                  className="bg-[#141821] border border-[#1C2230] hover:border-[#FFD43B]/40 rounded-2xl p-5 flex flex-col justify-between transition shadow-lg"
                >
                  <div>
                    <div className="relative aspect-video w-full rounded-xl bg-[#0B0D12] overflow-hidden mb-4 border border-[#283042] flex items-center justify-center p-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => handleRemove(item.id, product.name)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#141821]/80 hover:bg-[#EF4444]/20 text-[#A0A8B8] hover:text-[#EF4444] transition cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#A0A8B8] mb-1">
                      <span className="font-bold text-[#4F8CFF] uppercase">{product.brand}</span>
                      <span>Saved on {new Date(item.addedAt).toLocaleDateString()}</span>
                    </div>

                    <h3
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="text-sm font-semibold text-white line-clamp-2 hover:text-[#FFD43B] transition cursor-pointer mb-3"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-[#1C2230]">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-[#A0A8B8] block">Current Lowest Price</span>
                        <span className="text-lg font-black text-white">
                          ₹{lowestPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-xs text-[#FFD43B] font-semibold bg-[#FFD43B]/10 px-2 py-0.5 rounded">
                        {product.cheapestStore || 'Amazon India'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/compare?product=${product.id}`)}
                        className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#4F8CFF]" /> Compare
                      </button>
                      <button
                        onClick={() => onSetAlert(product)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <BellRing className="w-3.5 h-3.5" /> Set Alert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
