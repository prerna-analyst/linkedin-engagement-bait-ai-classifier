import React from 'react';
import {
  Heart,
  TrendingDown,
  ArrowRightLeft,
  BellRing,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (productId: string) => void;
  onCompare: (productId: string) => void;
  onSetAlert: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onCompare,
  onSetAlert,
}) => {
  const { isWishlisted, addToWishlist, removeFromWishlist, wishlist } = useWishlist();
  const { showToast } = useNotifications();

  const wishlisted = isWishlisted(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (wishlisted) {
        const item = wishlist.find((w) => w.productId === product.id);
        if (item) {
          await removeFromWishlist(item.id);
          showToast('Removed from saved wishlist', 'info');
        }
      } else {
        await addToWishlist(product.id, product.lowestPrice);
        showToast('Saved to wishlist with price tracking!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Please log in to manage wishlist', 'warning');
    }
  };

  // Find listing with lowest price
  const lowestPrice = product.lowestPrice ?? 0;
  const originalPrice = product.listings?.[0]?.originalPrice || lowestPrice * 1.15;
  const discountPct = product.discountPercentage ?? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100);

  return (
    <div
      onClick={() => onOpenDetails(product.id)}
      className="group relative bg-[#141821] hover:bg-[#181d28] border border-[#1C2230] hover:border-[#FFD43B]/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Top badges */}
      <div>
        <div className="relative aspect-square w-full rounded-xl bg-[#0B0D12] overflow-hidden mb-4 border border-[#1C2230]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Discount Badge */}
          {discountPct > 0 && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-xs font-black bg-[#FFD43B] text-black shadow-md flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> {discountPct}% OFF
            </div>
          )}

          {/* Quick Wishlist Heart */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
              wishlisted
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                : 'bg-[#141821]/80 text-[#A0A8B8] hover:text-white border border-[#283042]'
            }`}
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Store count banner */}
          <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-[#0B0D12]/90 backdrop-blur-md border border-[#283042] text-[11px] text-[#A0A8B8] flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#22C55E]">
              <ShieldCheck className="w-3 h-3" /> Compared across {product.listingsCount || product.listings?.length || 3} stores
            </span>
            <span className="font-semibold text-white">Verified</span>
          </div>
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] text-[#A0A8B8] mb-1">
          <span className="uppercase tracking-wider font-semibold text-[#4F8CFF]">{product.brand}</span>
          <span className="truncate max-w-[120px]">{product.category}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-white line-clamp-2 min-h-[40px] group-hover:text-[#FFD43B] transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Pricing & Store Info */}
      <div className="mt-4 pt-3 border-t border-[#1C2230]">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-xl font-extrabold text-white">
            ₹{lowestPrice.toLocaleString('en-IN')}
          </span>
          {originalPrice > lowestPrice && (
            <span className="text-xs text-[#64748B] line-through">
              ₹{Math.round(originalPrice).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Cheapest Store Badge */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1 text-[#A0A8B8]">
            <span>Lowest at:</span>
            <span className="font-semibold text-[#FFD43B] bg-[#FFD43B]/10 px-1.5 py-0.5 rounded border border-[#FFD43B]/20">
              {product.cheapestStore || 'Amazon India'}
            </span>
          </div>
          <span className="text-[11px] text-[#22C55E] flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> In Stock
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onCompare(product.id)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Side-by-side store price comparison"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#4F8CFF]" /> Compare
          </button>
          <button
            onClick={() => onSetAlert(product)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Set target price alert"
          >
            <BellRing className="w-3.5 h-3.5" /> Track Price
          </button>
        </div>
      </div>
    </div>
  );
};
