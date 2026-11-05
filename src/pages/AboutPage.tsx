import React from 'react';
import {
  TrendingDown,
  ShieldCheck,
  Database,
  Clock,
  Sparkles,
  Server,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#141821] border border-[#FFD43B]/40 items-center justify-center mb-4">
            <TrendingDown className="w-6 h-6 text-[#FFD43B]" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            About PriceTrack
          </h1>
          <p className="text-base text-[#A0A8B8] max-w-xl mx-auto">
            The deterministic price comparison and tracking platform engineered for transparent, fair e-commerce.
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-8 mb-10 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD43B]" /> Our Mission
          </h2>
          <p className="text-xs sm:text-sm text-[#A0A8B8] leading-relaxed">
            Online shoppers frequently purchase gadgets, electronics, and home appliances without knowing if the current list price is genuinely competitive. Retailers routinely manipulate MSRP strike-through tags, disguise discounts, and fluctuate pricing multiple times each week.
          </p>
          <p className="text-xs sm:text-sm text-[#A0A8B8] leading-relaxed">
            PriceTrack changes the paradigm. We empower consumers with factual, verifiable price history, automated target alerts, and instant cross-store comparison across Amazon, Flipkart, Croma, and Reliance Digital.
          </p>
        </div>

        {/* Technical Architecture Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
            <Database className="w-8 h-8 text-[#FFD43B] mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Relational Architecture</h3>
            <p className="text-xs text-[#A0A8B8] leading-relaxed">
              Built on a normalized 12-table relational schema with primary keys, foreign key constraints, and transactional consistency. Every price fluctuation is permanently archived into historical records for auditing.
            </p>
          </div>

          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
            <Clock className="w-8 h-8 text-[#4F8CFF] mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Periodic Tracking Engine</h3>
            <p className="text-xs text-[#A0A8B8] leading-relaxed">
              Powered by APScheduler / cron interval execution. The engine fetches updated prices, evaluates active user target thresholds, and fires instant in-app alerts and SMTP notifications without unnecessary duplicate messages.
            </p>
          </div>

          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
            <ShieldCheck className="w-8 h-8 text-[#22C55E] mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Verified Store Listings</h3>
            <p className="text-xs text-[#A0A8B8] leading-relaxed">
              Every listing explicitly displays its data source and verification status (Verified Live Price, Demo Price, or Unavailable Price). We never mislead consumers with unverified estimations.
            </p>
          </div>

          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
            <Server className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Zero AI Hallucinations</h3>
            <p className="text-xs text-[#A0A8B8] leading-relaxed">
              In strict adherence to engineering standards, PriceTrack utilizes traditional deterministic algorithms, mathematical moving averages, and relational SQL queries rather than opaque generative AI models.
            </p>
          </div>
        </div>

        {/* Verification standards */}
        <div id="verification" className="bg-[#0B0D12] border border-[#283042] rounded-3xl p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Store Verification Guarantee</h3>
          <p className="text-xs text-[#A0A8B8] max-w-lg mx-auto mb-6">
            We partner with official catalog APIs, authorized affiliate feeds, and automated crawlers to ensure data fidelity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-xl bg-[#141821] text-white border border-[#283042]">Amazon India</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141821] text-white border border-[#283042]">Flipkart</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141821] text-white border border-[#283042]">Croma Retail</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141821] text-white border border-[#283042]">Reliance Digital</span>
          </div>
        </div>
      </div>
    </div>
  );
};
