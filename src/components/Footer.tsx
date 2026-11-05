import React from 'react';
import { TrendingDown, ShieldCheck, Database, Clock, ArrowUpRight, Heart, Bell } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#0B0D12] border-t border-[#1C2230] text-[#A0A8B8] text-xs pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1C2230] to-[#283248] border border-[#FFD43B]/40 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-[#FFD43B]" />
              </div>
              <span className="text-lg font-extrabold text-white">Price<span className="text-[#FFD43B]">Track</span></span>
            </div>
            <p className="text-sm text-[#A0A8B8] max-w-sm mb-4 leading-relaxed">
              Track Prices. Compare Smarter. Save More. Real-time e-commerce intelligence aggregating verified prices across Amazon, Flipkart, Croma, and Reliance Digital.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141821] border border-[#283042] text-[11px] text-white">
                <Database className="w-3.5 h-3.5 text-[#FFD43B]" /> MySQL Relational Store
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141821] border border-[#283042] text-[11px] text-white">
                <Clock className="w-3.5 h-3.5 text-[#4F8CFF]" /> APScheduler Sync
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/explore')} className="hover:text-white transition">All Products</button>
              </li>
              <li>
                <button onClick={() => navigate('/deals')} className="hover:text-white transition">Best Verified Deals</button>
              </li>
              <li>
                <button onClick={() => navigate('/compare')} className="hover:text-white transition">Multi-Store Comparison</button>
              </li>
              <li>
                <button onClick={() => navigate('/explore?category=Mobiles%20%26%20Tablets')} className="hover:text-white transition">Flagship Phones</button>
              </li>
              <li>
                <button onClick={() => navigate('/explore?category=Audio%20%26%20Headphones')} className="hover:text-white transition">Audio & ANC Gear</button>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">Shopper Tools</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/alerts')} className="hover:text-white transition">Target Price Alerts</button>
              </li>
              <li>
                <button onClick={() => navigate('/wishlist')} className="hover:text-white transition">Saved Wishlist</button>
              </li>
              <li>
                <button onClick={() => navigate('/history')} className="hover:text-white transition">Historical Market Trends</button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition">Savings Dashboard</button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-[#FFD43B] transition">Admin Control Center</button>
              </li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div>
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition">About PriceTrack</button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition">Contact & Support</button>
              </li>
              <li>
                <button onClick={() => navigate('/about#verification')} className="hover:text-white transition">Verification Policy</button>
              </li>
              <li>
                <span className="text-[#64748B]">Deterministic Rules Engine (Zero AI Hallucinations)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Store Verification Banner */}
        <div className="py-4 border-y border-[#1C2230] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Integrated Store Feeds:</span>
            <span className="px-2 py-0.5 rounded bg-[#141821] text-white border border-[#283042]">Amazon India</span>
            <span className="px-2 py-0.5 rounded bg-[#141821] text-white border border-[#283042]">Flipkart</span>
            <span className="px-2 py-0.5 rounded bg-[#141821] text-white border border-[#283042]">Croma</span>
            <span className="px-2 py-0.5 rounded bg-[#141821] text-white border border-[#283042]">Reliance Digital</span>
          </div>
          <div className="text-[11px] text-[#A0A8B8]">
            Prices verified directly via store listing adapters and scheduled audit checks.
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© 2026 PriceTrack Platform. Engineered for smart savings & fair commerce.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/about')} className="hover:text-[#A0A8B8]">Privacy & Cookies</button>
            <button onClick={() => navigate('/about')} className="hover:text-[#A0A8B8]">Terms of Service</button>
            <button onClick={() => navigate('/contact')} className="hover:text-[#A0A8B8]">API Status</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
