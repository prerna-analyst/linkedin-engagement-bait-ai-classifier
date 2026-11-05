import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Search,
  ArrowRight,
  ShieldCheck,
  BellRing,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap,
  BarChart3,
  Clock,
  ExternalLink,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Tv,
  Gamepad2,
} from 'lucide-react';
import { Product, Category, PriceHistoryRecord } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { api } from '../services/api.ts';

interface LandingPageProps {
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate, onSetAlert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [recentDrops, setRecentDrops] = useState<PriceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category Icons map
  const categoryIconMap: Record<string, React.ReactNode> = {
    'Mobiles & Tablets': <Smartphone className="w-5 h-5 text-[#4F8CFF]" />,
    'Laptops & Computers': <Laptop className="w-5 h-5 text-[#FFD43B]" />,
    'Audio & Headphones': <Headphones className="w-5 h-5 text-[#22C55E]" />,
    'Wearables & Smartwatches': <Watch className="w-5 h-5 text-purple-400" />,
    'Home Appliances': <Tv className="w-5 h-5 text-orange-400" />,
    'Gaming Consoles': <Gamepad2 className="w-5 h-5 text-pink-400" />,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, dealsRes, prodRes] = await Promise.all([
          api.getCategories(),
          api.getDeals(),
          api.getProducts({ limit: 8 }),
        ]);

        setCategories(catRes.categories || []);
        setBestDeals(dealsRes.bestDeals || []);
        setRecentDrops(dealsRes.recentDrops || []);
        setTrendingProducts(prodRes.products || []);
      } catch (err) {
        console.warn('Error loading landing page data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const faqs = [
    {
      q: 'How does PriceTrack verify prices across Amazon, Flipkart, Croma, and Reliance Digital?',
      a: 'PriceTrack uses direct store adapters and scheduled periodic tracking jobs. Each listing is marked as Verified Live Price or Demo Price so you always know the exact data source without ambiguity.',
    },
    {
      q: 'Will I be notified when the price reaches my target?',
      a: 'Yes! Whenever our background tracking engine detects that any store listing matches or drops below your target price, it instantly triggers an in-app notification and email notification.',
    },
    {
      q: 'Does PriceTrack predict prices using artificial intelligence?',
      a: 'No. In adherence to our deterministic standards, PriceTrack relies exclusively on real historical database records, mathematical averages, and verifiable store prices—never simulated AI hallucinations.',
    },
    {
      q: 'Is PriceTrack free for shoppers?',
      a: '100% free! You can search, compare, track unlimited products, and set customized price alerts without any fees.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-[#1C2230]">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FFD43B]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-[#4F8CFF]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141821] border border-[#FFD43B]/30 text-xs font-semibold text-[#FFD43B] mb-6 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Track Prices. Compare Smarter. Save More.</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            Never Overpay for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD43B] via-[#ffe066] to-[#4F8CFF]">
              Favourite Products.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#A0A8B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Compare prices across stores, track historical price movements, and receive instant alerts when your favourite products become affordable.
          </p>

          {/* Large Hero Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto bg-[#141821] border-2 border-[#283042] focus-within:border-[#FFD43B] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row gap-2 transition duration-200 mb-8"
          >
            <div className="flex-1 flex items-center px-3 gap-3">
              <Search className="w-5 h-5 text-[#FFD43B] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Paste product link or search iPhone, MacBook, Sony ANC..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-[#A0A8B8] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Compare Prices <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => navigate('/deals')}
              className="px-5 py-2.5 rounded-xl bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#FFD43B]" /> Explore Top Deals
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="px-5 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1C2230] text-[#A0A8B8] hover:text-white border border-[#283042] font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-[#4F8CFF]" /> Start Tracking
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="px-5 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1C2230] text-[#A0A8B8] hover:text-white border border-[#283042] font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#22C55E]" /> Multi-Store Matrix
            </button>
          </div>

          {/* Store logos badge line */}
          <div className="mt-14 pt-8 border-t border-[#1C2230]/70 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#A0A8B8]">
            <span className="font-semibold text-white">Actively Monitored Stores:</span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <span className="w-2 h-2 rounded-full bg-[#FF9900]" /> Amazon India
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <span className="w-2 h-2 rounded-full bg-[#2874F0]" /> Flipkart
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <span className="w-2 h-2 rounded-full bg-[#00E9BF]" /> Croma Retail
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <span className="w-2 h-2 rounded-full bg-[#E42529]" /> Reliance Digital
            </span>
          </div>
        </div>
      </section>

      {/* 2. HOW PRICETRACK WORKS */}
      <section className="py-20 bg-[#0B0D12] border-b border-[#1C2230]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#FFD43B] mb-2">
              Simple 3-Step Process
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              How PriceTrack Guarantees the Lowest Price
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6 relative group hover:border-[#FFD43B]/40 transition">
              <div className="w-12 h-12 rounded-xl bg-[#FFD43B]/10 border border-[#FFD43B]/30 flex items-center justify-center text-[#FFD43B] font-black text-lg mb-4">
                01
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Search or Paste Any Product</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                Enter any gadget, phone, laptop, or appliance. Our system matches identical SKU listings across 4 top Indian e-commerce retailers simultaneously.
              </p>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6 relative group hover:border-[#4F8CFF]/40 transition">
              <div className="w-12 h-12 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 flex items-center justify-center text-[#4F8CFF] font-black text-lg mb-4">
                02
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Compare Verified Store Prices</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                See instant side-by-side prices, shipping times, warranty differences, and historical average price trends before spending a single rupee.
              </p>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6 relative group hover:border-[#22C55E]/40 transition">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] font-black text-lg mb-4">
                03
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Set Target Price Drop Alerts</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                Define your desired budget. The moment prices drop during festival sales or flash deals, get alerted in-app and via email before stock runs out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="py-16 bg-[#141821]/40 border-b border-[#1C2230]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Popular Shopping Categories</h3>
              <p className="text-xs text-[#A0A8B8]">Explore verified tech and lifestyle deals</p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs text-[#FFD43B] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              Browse All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.name)}`)}
                className="bg-[#141821] hover:bg-[#1C2230] border border-[#1C2230] hover:border-[#FFD43B]/40 rounded-2xl p-4 text-center transition group cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0B0D12] flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  {categoryIconMap[cat.name] || <Sparkles className="w-5 h-5 text-[#FFD43B]" />}
                </div>
                <h4 className="font-semibold text-xs text-white group-hover:text-[#FFD43B] transition truncate w-full">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-[#A0A8B8] mt-1">
                  {cat.productCount ? `${cat.productCount} products` : 'Verified Deals'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST CURRENT DEALS (Smart Deal Finder) */}
      <section className="py-20 bg-[#0B0D12] border-b border-[#1C2230]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs font-bold text-[#22C55E] mb-2">
                <Zap className="w-3.5 h-3.5" /> Rule-Based Smart Deal Finder
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Best Current Verified Deals
              </h3>
              <p className="text-xs text-[#A0A8B8]">
                Products with highest discounts against official manufacturer MSRP.
              </p>
            </div>
            <button
              onClick={() => navigate('/deals')}
              className="px-4 py-2 rounded-xl bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              View All Deals <ArrowRight className="w-3.5 h-3.5 text-[#FFD43B]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(id) => navigate(`/products/${id}`)}
                onCompare={(id) => navigate(`/compare?product=${id}`)}
                onSetAlert={onSetAlert}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRENDING PRODUCTS */}
      <section className="py-20 bg-[#141821]/30 border-b border-[#1C2230]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Trending Electronics & Gadgets
              </h3>
              <p className="text-xs text-[#A0A8B8]">
                Most tracked devices by shoppers this week
              </p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-xs text-[#FFD43B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              Explore Catalog <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(id) => navigate(`/products/${id}`)}
                onCompare={(id) => navigate(`/compare?product=${id}`)}
                onSetAlert={onSetAlert}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. RECENTLY UPDATED PRICES (Audit Feed) */}
      <section className="py-16 bg-[#0B0D12] border-b border-[#1C2230]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 flex items-center justify-center text-[#4F8CFF]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Recent Price Movements</h3>
                <p className="text-xs text-[#A0A8B8]">Live audit feed logged to MySQL price_history table</p>
              </div>
            </div>
            <span className="text-xs text-[#22C55E] font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" /> Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div
                key={drop.id}
                onClick={() => navigate(`/products/${drop.productId}`)}
                className="bg-[#141821] hover:bg-[#1C2230] border border-[#1C2230] rounded-2xl p-4 transition flex items-center justify-between gap-4 cursor-pointer"
              >
                <div>
                  <span className="text-[10px] text-[#FFD43B] font-bold uppercase">{drop.storeName}</span>
                  <h4 className="text-xs font-semibold text-white mt-0.5">{drop.notes || 'Price Updated'}</h4>
                  <span className="text-[10px] text-[#A0A8B8]">
                    {new Date(drop.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#22C55E]">
                    ₹{drop.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#A0A8B8] block">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE PRICETRACK */}
      <section className="py-20 bg-[#141821]/40 border-b border-[#1C2230]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#FFD43B] mb-2">
              ENGINEERED FOR SHOPPERS
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Savvy Shoppers Rely on PriceTrack
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-[#0B0D12] border border-[#1C2230] rounded-2xl p-6">
              <ShieldCheck className="w-8 h-8 text-[#22C55E] mx-auto mb-4" />
              <h4 className="font-bold text-sm text-white mb-2">Zero Fake Discounts</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                We compare prices against genuine multi-month historical records, unmasking inflated launch prices and deceptive sale tags.
              </p>
            </div>

            <div className="bg-[#0B0D12] border border-[#1C2230] rounded-2xl p-6">
              <BarChart3 className="w-8 h-8 text-[#FFD43B] mx-auto mb-4" />
              <h4 className="font-bold text-sm text-white mb-2">Granular 1-Year History</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                View detailed daily price graphs powered by Chart.js with 7D, 30D, 90D, and 1-Year range timelines across each individual merchant.
              </p>
            </div>

            <div className="bg-[#0B0D12] border border-[#1C2230] rounded-2xl p-6">
              <BellRing className="w-8 h-8 text-[#4F8CFF] mx-auto mb-4" />
              <h4 className="font-bold text-sm text-white mb-2">Instant Trigger Alerts</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                Define your ideal budget threshold. Our periodic scheduler evaluates active alerts every check cycle and notifies you in real time.
              </p>
            </div>

            <div className="bg-[#0B0D12] border border-[#1C2230] rounded-2xl p-6">
              <CheckCircle2 className="w-8 h-8 text-pink-400 mx-auto mb-4" />
              <h4 className="font-bold text-sm text-white mb-2">Direct Official Stores</h4>
              <p className="text-xs text-[#A0A8B8] leading-relaxed">
                Direct authorized links to Amazon, Flipkart, Croma, and Reliance Digital. No middleman markups or affiliate spoofing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-[#0B0D12]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#FFD43B] mb-2">FAQ</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6"
              >
                <h4 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center justify-between">
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-[#A0A8B8] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 bg-gradient-to-r from-[#141821] via-[#1C2230] to-[#141821] border border-[#FFD43B]/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Stop Overpaying?
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A8B8] max-w-lg mx-auto mb-8">
              Join thousands of smart shoppers monitoring prices across India's top retailers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black transition shadow-lg cursor-pointer"
              >
                Browse All Products
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#0B0D12] hover:bg-[#1C2230] text-white border border-[#283042] transition cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
