import React, { useState } from 'react';
import {
  Layers,
  BellRing,
  Heart,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlerts } from '../context/AlertContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Product } from '../types/index.ts';
import { exportCombinedCSV, exportAlertsCSV, exportWishlistCSV } from '../utils/csvExport.ts';

interface UserDashboardPageProps {
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ navigate, onSetAlert }) => {
  const { user } = useAuth();
  const { alerts } = useAlerts();
  const { wishlist } = useWishlist();
  const { notifications, unreadCount } = useNotifications();
  const { showToast } = useNotifications();

  const [showExportMenu, setShowExportMenu] = useState(false);

  const activeAlertsCount = alerts.filter((a) => a.isActive).length;
  const triggeredAlertsCount = alerts.filter((a) => a.isTriggered).length;

  // Calculate potential user savings across active alerts
  const totalPotentialSavings = alerts.reduce((acc, a) => {
    if (a.product && a.product.lowestPrice) {
      return acc + Math.max(0, a.currentPriceAtCreation - a.targetPrice);
    }
    return acc;
  }, 0);

  const handleExportAll = () => {
    if (alerts.length === 0 && wishlist.length === 0) {
      showToast('No tracking data or wishlist items to export yet', 'warning');
      return;
    }
    exportCombinedCSV(alerts, wishlist, user?.name);
    showToast('Exported complete tracking dataset (.csv) for Excel & Sheets!', 'success');
    setShowExportMenu(false);
  };

  const handleExportAlerts = () => {
    if (alerts.length === 0) {
      showToast('No price alerts set yet to export', 'warning');
      return;
    }
    exportAlertsCSV(alerts);
    showToast(`Exported ${alerts.length} price alerts to CSV!`, 'success');
    setShowExportMenu(false);
  };

  const handleExportWishlist = () => {
    if (wishlist.length === 0) {
      showToast('Your wishlist is empty', 'warning');
      return;
    }
    exportWishlistCSV(wishlist);
    showToast(`Exported ${wishlist.length} wishlist items to CSV!`, 'success');
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#141821] via-[#1C2230] to-[#141821] border border-[#283042] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD43B]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, {user?.name || 'Shopper'}!
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD43B]/20 text-[#FFD43B] uppercase">
                  {user?.role || 'Customer'}
                </span>
              </div>
              <p className="text-xs text-[#A0A8B8] mt-1">
                Your personal price-tracking dashboard and target alert monitor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Export CSV Dropdown in Header */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-[#FFD43B] border border-[#FFD43B]/30 flex items-center gap-2 shadow-md cursor-pointer transition"
              >
                <Download className="w-4 h-4" /> Export CSV <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#141821] border border-[#283042] rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-[#283042] mb-1">
                    <p className="font-semibold text-white">Export Personal Tracking Data</p>
                    <p className="text-[10px] text-[#A0A8B8]">UTF-8 formatted for Excel & Sheets</p>
                  </div>
                  <button
                    onClick={handleExportAll}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#FFD43B]" /> All Data (Combined)
                    </span>
                    <span className="text-[10px] text-[#A0A8B8] bg-[#0B0D12] px-1.5 py-0.5 rounded">
                      {alerts.length + wishlist.length} items
                    </span>
                  </button>
                  <button
                    onClick={handleExportAlerts}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-[#4F8CFF]" /> Price Alerts Only
                    </span>
                    <span className="text-[10px] text-[#A0A8B8] bg-[#0B0D12] px-1.5 py-0.5 rounded">
                      {alerts.length}
                    </span>
                  </button>
                  <button
                    onClick={handleExportWishlist}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" /> Wishlist Only
                    </span>
                    <span className="text-[10px] text-[#A0A8B8] bg-[#0B0D12] px-1.5 py-0.5 rounded">
                      {wishlist.length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-md cursor-pointer transition"
            >
              Track More Products
            </button>
          </div>
        </div>

        {/* 4 Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => navigate('/alerts')}
            className="bg-[#141821] border border-[#1C2230] hover:border-[#FFD43B]/40 rounded-2xl p-5 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#A0A8B8]">Active Price Alerts</span>
              <BellRing className="w-5 h-5 text-[#FFD43B]" />
            </div>
            <div className="text-3xl font-extrabold text-white">{activeAlertsCount}</div>
            <span className="text-[11px] text-[#22C55E] block mt-1">
              {triggeredAlertsCount} targets reached!
            </span>
          </div>

          <div
            onClick={() => navigate('/wishlist')}
            className="bg-[#141821] border border-[#1C2230] hover:border-pink-500/40 rounded-2xl p-5 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#A0A8B8]">Saved Wishlist</span>
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{wishlist.length}</div>
            <span className="text-[11px] text-[#A0A8B8] block mt-1">
              Monitored across 4 stores
            </span>
          </div>

          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#A0A8B8]">Potential Savings</span>
              <TrendingDown className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div className="text-3xl font-extrabold text-[#22C55E]">
              ₹{totalPotentialSavings.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#A0A8B8] block mt-1">
              Calculated from your targets
            </span>
          </div>

          <div
            onClick={() => navigate('/notifications')}
            className="bg-[#141821] border border-[#1C2230] hover:border-[#4F8CFF]/40 rounded-2xl p-5 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#A0A8B8]">Unread Notifications</span>
              <Sparkles className="w-5 h-5 text-[#4F8CFF]" />
            </div>
            <div className="text-3xl font-extrabold text-white">{unreadCount}</div>
            <span className="text-[11px] text-[#A0A8B8] block mt-1">
              Real-time drop alerts
            </span>
          </div>
        </div>

        {/* Dedicated CSV Export Feature Section */}
        <div className="bg-[#141821] border border-[#283042] rounded-3xl p-6 sm:p-7 mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD43B]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFD43B]/10 border border-[#FFD43B]/25 text-[11px] font-bold text-[#FFD43B] mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Personal Data Export
              </div>
              <h3 className="text-lg font-bold text-white">
                Export Tracking & Wishlist Data as CSV
              </h3>
              <p className="text-xs text-[#A0A8B8] max-w-xl mt-1 leading-relaxed">
                Download your custom price targets, current lowest store prices, difference calculations, and saved wishlist items in Microsoft Excel and Google Sheets compatible CSV format.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1 text-[#22C55E]">
                  <Check className="w-3.5 h-3.5" /> UTF-8 BOM Encoding
                </span>
                <span>•</span>
                <span className="text-white">
                  <strong>{alerts.length}</strong> Alerts &amp; <strong>{wishlist.length}</strong> Wishlist Items Available
                </span>
                <span>•</span>
                <span>Includes INR pricing &amp; store retailer links</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleExportAll}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Combined CSV
              </button>
              <button
                onClick={handleExportAlerts}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center gap-1.5 transition cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-[#FFD43B]" /> Alerts CSV
              </button>
              <button
                onClick={handleExportWishlist}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-pink-400" /> Wishlist CSV
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Price Alerts Preview */}
          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#FFD43B]" />
                <h3 className="text-sm font-bold text-white">Your Target Price Alerts</h3>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-[#FFD43B] hover:underline font-semibold cursor-pointer"
              >
                Manage All →
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A0A8B8] bg-[#0B0D12] rounded-xl border border-dashed border-[#283042]">
                No price alerts set yet. Browse items and click "Track Price" to set a target!
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/products/${a.productId}`)}
                    className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#1C2230] hover:border-[#283042] flex items-center justify-between gap-4 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      {a.product?.image && (
                        <img
                          src={a.product.image}
                          alt={a.product.name}
                          className="w-10 h-10 object-contain rounded-lg bg-[#141821] p-1"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">
                          {a.product?.name || 'Product'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#A0A8B8] mt-0.5">
                          <span>Target: <strong className="text-[#FFD43B]">₹{a.targetPrice.toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span>Now: <strong className="text-white">₹{(a.product?.lowestPrice || 0).toLocaleString('en-IN')}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {a.isTriggered ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                          TARGET MET 🎉
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1C2230] text-[#A0A8B8]">
                          Monitoring
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">Saved Wishlist Items</h3>
              </div>
              <button
                onClick={() => navigate('/wishlist')}
                className="text-xs text-pink-400 hover:underline font-semibold cursor-pointer"
              >
                View Wishlist →
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A0A8B8] bg-[#0B0D12] rounded-xl border border-dashed border-[#283042]">
                Your wishlist is empty. Save products to track price fluctuations over time!
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`/products/${w.productId}`)}
                    className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#1C2230] hover:border-[#283042] flex items-center justify-between gap-4 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      {w.product?.image && (
                        <img
                          src={w.product.image}
                          alt={w.product.name}
                          className="w-10 h-10 object-contain rounded-lg bg-[#141821] p-1"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">
                          {w.product?.name || 'Product'}
                        </h4>
                        <span className="text-[11px] text-[#A0A8B8]">
                          Lowest: ₹{(w.product?.lowestPrice || 0).toLocaleString('en-IN')} on {w.product?.cheapestStore || 'Amazon'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (w.product) onSetAlert(w.product);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] transition cursor-pointer"
                    >
                      Set Alert
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
