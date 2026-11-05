import React, { useState, useEffect } from 'react';
import {
  Heart,
  ArrowRightLeft,
  BellRing,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Share2,
  AlertCircle,
  Truck,
  Star,
} from 'lucide-react';
import { Product, StoreListing } from '../types/index.ts';
import { PriceHistoryChart } from '../components/PriceHistoryChart.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';

interface ProductDetailsPageProps {
  productId: string;
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  navigate,
  onSetAlert,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const { isWishlisted, addToWishlist, removeFromWishlist, wishlist } = useWishlist();
  const { showToast } = useNotifications();

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setIsLoading(true);
      try {
        const res = await api.getProduct(productId);
        if (isMounted) {
          setProduct(res.product);
          setStatistics(res.statistics);
          setSelectedImage(res.product.image);
        }
      } catch (err) {
        console.warn('Failed to load product details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center p-6 text-white">
        <div className="flex items-center gap-3 text-sm text-[#FFD43B]">
          <Clock className="w-5 h-5 animate-spin" /> Loading product details and verified store matrix...
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleWishlistToggle = async () => {
    try {
      if (wishlisted) {
        const item = wishlist.find((w) => w.productId === product.id);
        if (item) {
          await removeFromWishlist(item.id);
          showToast('Removed from saved wishlist', 'info');
        }
      } else {
        await addToWishlist(product.id, product.lowestPrice);
        showToast('Saved to wishlist with active price monitoring!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Please log in to manage wishlist', 'warning');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const lowestPrice = product.lowestPrice || 0;
  const listings = product.listings || [];
  const cheapestListing = listings.find((l) => l.currentPrice === lowestPrice) || listings[0];

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#A0A8B8] mb-6">
          <button onClick={() => navigate('/')} className="hover:text-white">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate('/explore')} className="hover:text-white">Explore</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#4F8CFF]">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Gallery Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#141821] border border-[#1C2230] p-6 flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />

              {product.discountPercentage && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-black bg-[#FFD43B] text-black shadow-lg flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" /> {product.discountPercentage}% OFF
                </div>
              )}

              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-[#0B0D12]/80 hover:bg-[#1C2230] text-[#A0A8B8] hover:text-white border border-[#283042] transition cursor-pointer"
                title="Share product link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex items-center gap-3">
                {product.galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl bg-[#141821] border p-1 transition cursor-pointer overflow-hidden ${
                      selectedImage === img
                        ? 'border-[#FFD43B] ring-2 ring-[#FFD43B]/30'
                        : 'border-[#1C2230] hover:border-[#283042]'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Live Stores Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Brand & Category badges */}
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#4F8CFF]/10 text-[#4F8CFF] border border-[#4F8CFF]/20 uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs text-[#A0A8B8]">{product.category}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#22C55E]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Catalog
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#A0A8B8] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Pricing Hero Box */}
              <div className="bg-[#141821] border border-[#FFD43B]/30 rounded-2xl p-5 mb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs text-[#A0A8B8] block mb-0.5">Lowest Verified Price</span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-white">
                        ₹{lowestPrice.toLocaleString('en-IN')}
                      </span>
                      {cheapestListing?.originalPrice > lowestPrice && (
                        <span className="text-sm text-[#64748B] line-through">
                          ₹{cheapestListing.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded">
                        Save ₹{Math.max(0, (cheapestListing?.originalPrice || 0) - lowestPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#A0A8B8] block mb-0.5">Best Retailer</span>
                    <span className="text-sm font-bold text-[#FFD43B]">
                      {cheapestListing?.storeName || 'Amazon India'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#A0A8B8] pt-2 border-t border-[#283042]">
                  <Truck className="w-3.5 h-3.5 text-[#4F8CFF]" />
                  <span>{cheapestListing?.deliveryInfo || 'Fast Free Shipping Available'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                  onClick={() => onSetAlert(product)}
                  className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <BellRing className="w-4 h-4" /> Set Target Price Alert
                </button>

                <button
                  onClick={() => navigate(`/compare?product=${product.id}`)}
                  className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-[#4F8CFF]" /> Side-by-Side Comparison
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    wishlisted
                      ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                      : 'bg-[#141821] text-[#A0A8B8] hover:text-white border-[#283042]'
                  }`}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Available Stores Comparison List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A0A8B8]">
                Store Availability & Verified Prices ({listings.length} Stores)
              </h3>

              <div className="divide-y divide-[#1C2230] bg-[#141821] border border-[#1C2230] rounded-2xl overflow-hidden">
                {listings.map((l) => {
                  const isLowest = l.currentPrice === lowestPrice;
                  return (
                    <div
                      key={l.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#181e2b] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: l.accentColor || '#1C2230' }}
                        >
                          {l.storeName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-white">{l.storeName}</h4>
                            {isLowest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                                LOWEST PRICE
                              </span>
                            )}
                            <span className="text-[10px] text-[#A0A8B8] hidden sm:inline">
                              {l.verificationStatus === 'VERIFIED_LIVE' ? '• Verified Live' : '• Demo Price'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A0A8B8] flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-[#FFD43B] fill-current" /> {l.rating} ({l.reviewsCount} reviews) • {l.deliveryInfo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-white">
                            ₹{l.currentPrice.toLocaleString('en-IN')}
                          </span>
                          {l.originalPrice > l.currentPrice && (
                            <span className="text-xs text-[#64748B] line-through block">
                              ₹{l.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <a
                          href={l.storeProductUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center gap-1.5 hover:border-[#FFD43B] transition"
                        >
                          Visit Store <ExternalLink className="w-3.5 h-3.5 text-[#FFD43B]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. PRICE HISTORY ANALYTICS GRAPH */}
        <div className="mb-12">
          <PriceHistoryChart productId={product.id} currentLowestPrice={lowestPrice} />
        </div>

        {/* 3. TECHNICAL SPECIFICATIONS TABLE */}
        <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-4">Detailed Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.specifications &&
              Object.entries(product.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-[#0B0D12] border border-[#1C2230] flex flex-col justify-between"
                >
                  <span className="text-[11px] font-semibold text-[#A0A8B8] uppercase">{key}</span>
                  <span className="text-xs sm:text-sm font-medium text-white mt-1">{value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
