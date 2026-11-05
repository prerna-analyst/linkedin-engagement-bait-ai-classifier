import React, { useState } from 'react';
import {
  BellRing,
  Trash2,
  PauseCircle,
  PlayCircle,
  Edit2,
  Sparkles,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useAlerts } from '../context/AlertContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Product } from '../types/index.ts';
import { exportAlertsCSV } from '../utils/csvExport.ts';

interface PriceAlertsPageProps {
  navigate: (path: string) => void;
  onSetAlert: (product: Product) => void;
}

export const PriceAlertsPage: React.FC<PriceAlertsPageProps> = ({ navigate, onSetAlert }) => {
  const { alerts, updateAlert, deleteAlert } = useAlerts();
  const { showToast } = useNotifications();

  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [newTargetPrice, setNewTargetPrice] = useState<string>('');

  const handleToggleActive = async (alertId: string, currentStatus: boolean) => {
    try {
      await updateAlert(alertId, { isActive: !currentStatus });
      showToast(
        currentStatus ? 'Price alert paused' : 'Price alert resumed and active!',
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update alert status', 'warning');
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await deleteAlert(alertId);
      showToast('Price alert deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete alert', 'warning');
    }
  };

  const startEdit = (alertId: string, currentTarget: number) => {
    setEditingAlertId(alertId);
    setNewTargetPrice(String(currentTarget));
  };

  const saveEdit = async (alertId: string) => {
    const numericTarget = parseFloat(newTargetPrice);
    if (!newTargetPrice.trim() || isNaN(numericTarget) || numericTarget <= 0) {
      showToast('Please enter a valid target price', 'warning');
      return;
    }
    try {
      await updateAlert(alertId, { targetPrice: numericTarget });
      setEditingAlertId(null);
      showToast(`Target price updated to ₹${numericTarget.toLocaleString('en-IN')}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update target', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="w-6 h-6 text-[#FFD43B]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Target-Price Alerts Center
              </h1>
            </div>
            <p className="text-xs text-[#A0A8B8] mt-1">
              Active alerts are periodically monitored across Amazon, Flipkart, Croma, and Reliance Digital.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (alerts.length === 0) {
                  showToast('No alerts to export', 'warning');
                  return;
                }
                exportAlertsCSV(alerts);
                showToast(`Exported ${alerts.length} price alerts as CSV`, 'success');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] flex items-center gap-1.5 cursor-pointer transition"
            >
              <Download className="w-4 h-4 text-[#FFD43B]" /> Export Alerts (CSV)
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] shadow-md cursor-pointer"
            >
              + Set New Price Alert
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-12 text-center max-w-lg mx-auto">
            <BellRing className="w-12 h-12 text-[#A0A8B8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Price Alerts Configured</h3>
            <p className="text-xs text-[#A0A8B8] mb-6">
              Pick any product from the catalog, specify your ideal buying price, and we'll notify you the moment it matches.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((a) => {
              const product = a.product;
              const currentPrice = product?.lowestPrice || a.currentPriceAtCreation;
              const isTargetMet = a.isTriggered || currentPrice <= a.targetPrice;

              return (
                <div
                  key={a.id}
                  className={`bg-[#141821] border rounded-2xl p-5 transition shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isTargetMet
                      ? 'border-[#22C55E]/40 bg-gradient-to-r from-[#141821] to-[#122218]'
                      : a.isActive
                      ? 'border-[#1C2230] hover:border-[#283042]'
                      : 'border-[#1C2230] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {product?.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-contain rounded-xl bg-[#0B0D12] p-2 border border-[#283042]"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#4F8CFF] uppercase">
                          {product?.brand || 'Brand'}
                        </span>
                        {isTargetMet ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#22C55E] text-black flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> TARGET REACHED!
                          </span>
                        ) : a.isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD43B]/20 text-[#FFD43B]">
                            Active Tracker
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2230] text-[#A0A8B8]">
                            Paused
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => product && navigate(`/products/${product.id}`)}
                        className="text-sm font-semibold text-white hover:text-[#FFD43B] transition cursor-pointer"
                      >
                        {product?.name || 'Tracked Product'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#A0A8B8] mt-1.5">
                        <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Store: <strong className="text-white">{product?.cheapestStore || 'Amazon'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Comparison Stats */}
                  <div className="flex items-center gap-6 self-start md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-[#A0A8B8] block">Your Target</span>
                      {editingAlertId === a.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            value={newTargetPrice}
                            onChange={(e) => setNewTargetPrice(e.target.value)}
                            step="any"
                            min="1"
                            className="w-24 bg-[#0B0D12] border border-[#FFD43B] rounded-lg px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => saveEdit(a.id)}
                            className="px-2 py-1 rounded bg-[#FFD43B] text-black text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-base font-extrabold text-[#FFD43B]">
                            ₹{a.targetPrice.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => startEdit(a.id, a.targetPrice)}
                            className="text-[#A0A8B8] hover:text-white"
                            title="Edit target price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right border-l border-[#283042] pl-6">
                      <span className="text-[10px] text-[#A0A8B8] block">Current Verified Price</span>
                      <span className="text-base font-extrabold text-white">
                        ₹{currentPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#22C55E] block">
                        {currentPrice <= a.targetPrice
                          ? `₹${(a.targetPrice - currentPrice).toLocaleString('en-IN')} below target!`
                          : `₹${(currentPrice - a.targetPrice).toLocaleString('en-IN')} away`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pl-4">
                      <button
                        onClick={() => handleToggleActive(a.id, a.isActive)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          a.isActive
                            ? 'bg-[#1C2230] text-[#FFD43B] hover:bg-[#283248] border-[#283042]'
                            : 'bg-[#1C2230] text-[#A0A8B8] hover:text-white border-[#283042]'
                        }`}
                        title={a.isActive ? 'Pause price tracking' : 'Resume price tracking'}
                      >
                        {a.isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 rounded-xl bg-[#1C2230] hover:bg-[#EF4444]/20 text-[#A0A8B8] hover:text-[#EF4444] border border-[#283042] transition cursor-pointer"
                        title="Delete price alert"
                      >
                        <Trash2 className="w-4 h-4" />
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
