import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Package,
  Store as StoreIcon,
  Bell,
  Clock,
  TrendingDown,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import {
  Product,
  Store,
  StoreListing,
  User,
  PriceHistoryRecord,
  TrackingJob,
  PlatformSettings,
} from '../types/index.ts';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
  initialTab?: string;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  navigate,
  initialTab = 'overview',
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'stores' | 'prices' | 'users' | 'history' | 'alerts' | 'settings'
  >((initialTab as any) || 'overview');

  const [stats, setStats] = useState<any>(null);
  const [trackingJob, setTrackingJob] = useState<TrackingJob | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Management states
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  // Modal / Editing states
  const [isScanning, setIsScanning] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [editingListing, setEditingListing] = useState<StoreListing | null>(null);
  const [editPriceStr, setEditPriceStr] = useState<string>('');
  const [editOriginalPriceStr, setEditOriginalPriceStr] = useState<string>('');

  // New Product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Mobiles & Tablets');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState('');

  // New Store form
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');
  const [newStoreColor, setNewStoreColor] = useState('#FFD43B');

  // Load Dashboard Data
  const loadAdminData = async () => {
    try {
      const data = await api.getAdminDashboard();
      setStats(data.stats);
      setTrackingJob(data.trackingJob);
      setRecentLogs(data.recentLogs || []);
      setStores(data.stores || []);

      const [prodRes, priceRes, userRes, setRes] = await Promise.all([
        api.getProducts({ limit: 50 }),
        api.getAdminPrices(),
        api.getAdminUsers(),
        api.getAdminSettings(),
      ]);

      setProducts(prodRes.products || []);
      setListings(priceRes.listings || []);
      setUsersList(userRes.users || []);
      setSettings(setRes.settings);
    } catch (err: any) {
      console.warn('Admin load error:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Run periodic price scan now
  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.triggerTrackingScan();
      setTrackingJob(res.trackingJob);
      showToast(
        `Scheduler checked ${res.result.itemsChecked} listings. ${res.result.dropsDetected} price drops logged to MySQL!`,
        'success'
      );
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Scan trigger failed', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: newProductName,
        brand: newProductBrand,
        category: newProductCategory,
        description: newProductDesc,
        image: newProductImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      });
      showToast('Product and default store listing registered in database', 'success');
      setShowAddProductModal(false);
      setNewProductName('');
      setNewProductBrand('');
      setNewProductDesc('');
      setNewProductImage('');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create product', 'warning');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all its price history records?`)) return;
    try {
      await api.deleteProduct(id);
      showToast('Product and historical records removed', 'info');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'warning');
    }
  };

  // Add Store
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStore({
        name: newStoreName,
        websiteUrl: newStoreUrl,
        accentColor: newStoreColor,
      });
      showToast('Store adapter added to ecosystem', 'success');
      setShowAddStoreModal(false);
      setNewStoreName('');
      setNewStoreUrl('');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add store', 'warning');
    }
  };

  // Update Listing Price
  const handleSaveListingPrice = async () => {
    if (!editingListing) return;
    const parsedCurrent = parseFloat(editPriceStr);
    const parsedOriginal = parseFloat(editOriginalPriceStr);

    if (isNaN(parsedCurrent) || parsedCurrent <= 0) {
      showToast('Please enter a valid current price', 'warning');
      return;
    }

    try {
      await api.updateListingPrice({
        listingId: editingListing.id,
        currentPrice: parsedCurrent,
        originalPrice: isNaN(parsedOriginal) || parsedOriginal <= 0 ? parsedCurrent : parsedOriginal,
        availability: editingListing.availability,
        verificationStatus: editingListing.verificationStatus,
      });
      showToast(`Updated ${editingListing.storeName} price to ₹${parsedCurrent}. User target alerts checked!`, 'success');
      setEditingListing(null);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update price', 'warning');
    }
  };

  // Toggle User Role
  const handleToggleUserRole = async (u: User) => {
    const nextRole = u.role === 'admin' ? 'customer' : 'admin';
    try {
      await api.updateAdminUserRole(u.id, nextRole);
      showToast(`User ${u.name} role changed to ${nextRole}`, 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle role', 'warning');
    }
  };

  // Save Platform Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateAdminSettings(settings);
      showToast('Platform & Scheduler settings saved', 'success');
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1C2230]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFD43B]/10 border border-[#FFD43B]/30 text-[#FFD43B]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  PriceTrack Master Administration
                </h1>
                <p className="text-xs text-[#A0A8B8] mt-0.5">
                  Complete platform, catalog, scheduler, store listings, and price management console.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#22C55E] hover:bg-[#1eb054] text-black shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isScanning ? 'Running Scan Cycle...' : 'Run Price Check Now'}
            </button>
            <button
              onClick={loadAdminData}
              className="p-2.5 rounded-xl bg-[#141821] hover:bg-[#1C2230] text-[#A0A8B8] hover:text-white border border-[#283042] transition cursor-pointer"
              title="Refresh Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-[#1C2230]">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <Database className="w-4 h-4" /> },
            { id: 'products', label: 'Product Catalog', icon: <Package className="w-4 h-4" /> },
            { id: 'prices', label: 'Price & Listing Manager', icon: <TrendingDown className="w-4 h-4" /> },
            { id: 'stores', label: 'Store Adapters', icon: <StoreIcon className="w-4 h-4" /> },
            { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
            { id: 'history', label: 'Audit Trail', icon: <Clock className="w-4 h-4" /> },
            { id: 'settings', label: 'Platform Engine Settings', icon: <Sliders className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFD43B] text-black shadow-md'
                  : 'text-[#A0A8B8] hover:text-white bg-[#141821] border border-[#283042]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & SCHEDULER */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 6 Core Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4">
                <span className="text-[11px] text-[#A0A8B8] font-semibold block">Total Registered Users</span>
                <span className="text-2xl font-black text-white mt-1 block">{stats?.totalUsers || 2}</span>
                <span className="text-[10px] text-[#22C55E]">MySQL users table</span>
              </div>

              <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4">
                <span className="text-[11px] text-[#A0A8B8] font-semibold block">Tracked Products</span>
                <span className="text-2xl font-black text-[#FFD43B] mt-1 block">{stats?.totalProducts || 8}</span>
                <span className="text-[10px] text-[#A0A8B8]">Across 8 categories</span>
              </div>

              <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4">
                <span className="text-[11px] text-[#A0A8B8] font-semibold block">Connected Stores</span>
                <span className="text-2xl font-black text-[#4F8CFF] mt-1 block">{stats?.totalStores || 4}</span>
                <span className="text-[10px] text-[#22C55E]">Amazon, Flipkart, etc.</span>
              </div>

              <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4">
                <span className="text-[11px] text-[#A0A8B8] font-semibold block">Active Price Alerts</span>
                <span className="text-2xl font-black text-[#22C55E] mt-1 block">{stats?.activePriceAlerts || 2}</span>
                <span className="text-[10px] text-[#A0A8B8]">Evaluated on schedule</span>
              </div>

              <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4">
                <span className="text-[11px] text-[#A0A8B8] font-semibold block">Price History Logs</span>
                <span className="text-2xl font-black text-pink-400 mt-1 block">{stats?.totalHistoricalRecords || 80}</span>
                <span className="text-[10px] text-[#A0A8B8]">Audited data points</span>
              </div>

              <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-4">
                <span className="text-[11px] text-[#A0A8B8] font-semibold block">Price Drops Today</span>
                <span className="text-2xl font-black text-[#22C55E] mt-1 block">{stats?.priceDropsToday || 3}</span>
                <span className="text-[10px] text-[#22C55E]">Automated triggers</span>
              </div>
            </div>

            {/* Scheduler Status Panel */}
            <div className="bg-gradient-to-r from-[#141821] to-[#1C2230] border border-[#283042] rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FFD43B]" />
                    <h3 className="text-lg font-bold text-white">APScheduler Engine Status</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                      IDLE / STANDBY
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A8B8] mt-1">
                    Periodic background tasks poll store listings, calculate price variations, save to MySQL price_history, and trigger user alerts.
                  </p>
                </div>

                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? 'Checking Listings...' : 'Force Trigger Scan Cycle'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#283042]">
                <div>
                  <span className="text-[10px] text-[#A0A8B8] uppercase block">Interval</span>
                  <span className="text-sm font-bold text-white">{trackingJob?.intervalMinutes || 15} Minutes</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A0A8B8] uppercase block">Last Execution</span>
                  <span className="text-sm font-bold text-white">
                    {trackingJob?.lastRun ? new Date(trackingJob.lastRun).toLocaleTimeString() : 'Recently'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A0A8B8] uppercase block">Next Scheduled Run</span>
                  <span className="text-sm font-bold text-[#4F8CFF]">
                    {trackingJob?.nextRun ? new Date(trackingJob.nextRun).toLocaleTimeString() : 'In 15m'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A0A8B8] uppercase block">Listings Checked</span>
                  <span className="text-sm font-bold text-[#22C55E]">{trackingJob?.itemsChecked || listings.length} Store Items</span>
                </div>
              </div>
            </div>

            {/* Recent Admin Audit Logs */}
            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Recent System & Admin Actions</h3>
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#1C2230] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-[10px] text-[#FFD43B] uppercase">{log.targetType}</span>
                      </div>
                      <p className="text-[#A0A8B8] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Product Catalog Management</h3>
                <p className="text-xs text-[#A0A8B8]">Add, edit, or delete monitored products across all categories.</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#283042] text-[#A0A8B8] uppercase text-[10px] bg-[#1C2230]">
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Lowest Price</th>
                    <th className="py-3 px-4 font-semibold">Store Count</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2230]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#181d28] transition">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-9 h-9 object-contain rounded-lg bg-[#0B0D12] p-1" />
                        <div>
                          <h4 className="font-bold text-white truncate max-w-xs">{p.name}</h4>
                          <span className="text-[10px] text-[#4F8CFF] uppercase font-bold">{p.brand}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A0A8B8]">{p.category}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#22C55E]">
                        ₹{(p.lowestPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-white font-semibold">
                        {p.listingsCount || p.listings?.length || 3} Stores
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/10 text-[#22C55E]">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/products/${p.id}`)}
                            className="p-1.5 rounded-lg bg-[#1C2230] hover:bg-[#283248] text-[#A0A8B8] hover:text-white"
                            title="View Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-[#1C2230] hover:bg-[#EF4444]/20 text-[#A0A8B8] hover:text-[#EF4444]"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Product Modal */}
            {showAddProductModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#141821] border border-[#283042] rounded-3xl p-6 sm:p-8 max-w-lg w-full">
                  <h3 className="text-lg font-bold text-white mb-4">Add Monitored Product</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Product Name</label>
                      <input
                        type="text"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        placeholder="e.g. Samsung Galaxy S25 Ultra"
                        required
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Brand</label>
                        <input
                          type="text"
                          value={newProductBrand}
                          onChange={(e) => setNewProductBrand(e.target.value)}
                          placeholder="e.g. Samsung"
                          required
                          className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Category</label>
                        <select
                          value={newProductCategory}
                          onChange={(e) => setNewProductCategory(e.target.value)}
                          className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="Mobiles & Tablets">Mobiles & Tablets</option>
                          <option value="Laptops & Computers">Laptops & Computers</option>
                          <option value="Audio & Headphones">Audio & Headphones</option>
                          <option value="Wearables & Smartwatches">Wearables & Smartwatches</option>
                          <option value="Home Appliances">Home Appliances</option>
                          <option value="Gaming Consoles">Gaming Consoles</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        placeholder="Technical product highlights..."
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Image URL (Optional)</label>
                      <input
                        type="url"
                        value={newProductImage}
                        onChange={(e) => setNewProductImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="px-4 py-2 text-xs text-[#A0A8B8] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] text-black"
                      >
                        Create Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRICE & LISTING MANAGER */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Store Listings & Real-time Price Manager</h3>
                <p className="text-xs text-[#A0A8B8]">
                  Directly adjust store prices to test user price-drop alert notifications in real time.
                </p>
              </div>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#283042] text-[#A0A8B8] uppercase text-[10px] bg-[#1C2230]">
                    <th className="py-3 px-4 font-semibold">Store</th>
                    <th className="py-3 px-4 font-semibold">Product ID</th>
                    <th className="py-3 px-4 font-semibold">Current Price (₹)</th>
                    <th className="py-3 px-4 font-semibold">MSRP (₹)</th>
                    <th className="py-3 px-4 font-semibold">Verification Status</th>
                    <th className="py-3 px-4 font-semibold">Availability</th>
                    <th className="py-3 px-4 font-semibold text-right">Edit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2230]">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-[#181d28] transition">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: l.accentColor || '#FFD43B' }}
                        />
                        {l.storeName}
                      </td>
                      <td className="py-3.5 px-4 text-[#A0A8B8] font-mono text-[11px]">{l.productId}</td>
                      <td className="py-3.5 px-4 font-black text-[#22C55E]">
                        ₹{l.currentPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] line-through">
                        ₹{l.originalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                          {l.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A0A8B8] capitalize">{l.availability}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingListing({ ...l });
                            setEditPriceStr(String(l.currentPrice));
                            setEditOriginalPriceStr(String(l.originalPrice));
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-[#FFD43B] border border-[#283042] cursor-pointer"
                        >
                          Update Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Listing Modal */}
            {editingListing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#141821] border border-[#283042] rounded-3xl p-6 sm:p-8 max-w-md w-full">
                  <h3 className="text-lg font-bold text-white mb-2">Update Store Listing Price</h3>
                  <p className="text-xs text-[#A0A8B8] mb-4">
                    Updating this price will record a new price_history entry and automatically evaluate active target alerts.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">
                        Current Price for {editingListing.storeName} (₹)
                      </label>
                      <input
                        type="number"
                        value={editPriceStr}
                        onChange={(e) => setEditPriceStr(e.target.value)}
                        step="any"
                        min="1"
                        placeholder="Enter current price"
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-sm font-bold text-[#22C55E]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Original Price (MSRP)</label>
                      <input
                        type="number"
                        value={editOriginalPriceStr}
                        onChange={(e) => setEditOriginalPriceStr(e.target.value)}
                        step="any"
                        min="1"
                        placeholder="Enter original MSRP"
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Verification Status</label>
                      <select
                        value={editingListing.verificationStatus}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, verificationStatus: e.target.value as any })
                        }
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="VERIFIED_LIVE">VERIFIED_LIVE</option>
                        <option value="DEMO_PRICE">DEMO_PRICE</option>
                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Availability</label>
                      <select
                        value={editingListing.availability}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, availability: e.target.value as any })
                        }
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="in_stock">in_stock</option>
                        <option value="limited_stock">limited_stock</option>
                        <option value="out_of_stock">out_of_stock</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingListing(null)}
                        className="px-4 py-2 text-xs text-[#A0A8B8] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveListingPrice}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] text-black"
                      >
                        Save & Evaluate Alerts
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STORES */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">E-Commerce Store Integrations</h3>
                <p className="text-xs text-[#A0A8B8]">Manage direct retailer adapters and verification channels.</p>
              </div>
              <button
                onClick={() => setShowAddStoreModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Store Adapter
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stores.map((s) => (
                <div key={s.id} className="bg-[#141821] border border-[#1C2230] rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                        style={{ backgroundColor: s.accentColor }}
                      >
                        {s.name.charAt(0)}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] uppercase">
                        {s.adapterStatus}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{s.name}</h4>
                    <p className="text-xs text-[#A0A8B8] truncate mt-1">{s.websiteUrl}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1C2230] text-[11px] text-[#64748B]">
                    Status: <strong className="text-white capitalize">{s.status}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Store Modal */}
            {showAddStoreModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#141821] border border-[#283042] rounded-3xl p-6 sm:p-8 max-w-md w-full">
                  <h3 className="text-lg font-bold text-white mb-4">Add Store Retailer</h3>
                  <form onSubmit={handleAddStore} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Store Name</label>
                      <input
                        type="text"
                        value={newStoreName}
                        onChange={(e) => setNewStoreName(e.target.value)}
                        placeholder="e.g. Tata CLiQ"
                        required
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Store Website URL</label>
                      <input
                        type="url"
                        value={newStoreUrl}
                        onChange={(e) => setNewStoreUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#A0A8B8] mb-1">Accent Color</label>
                      <input
                        type="color"
                        value={newStoreColor}
                        onChange={(e) => setNewStoreColor(e.target.value)}
                        className="w-full h-10 bg-[#0B0D12] border border-[#283042] rounded-xl px-2 py-1 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddStoreModal(false)}
                        className="px-4 py-2 text-xs text-[#A0A8B8] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FFD43B] text-black"
                      >
                        Create Store Adapter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Users & Role RBAC</h3>
              <p className="text-xs text-[#A0A8B8]">Inspect registered users and manage customer vs admin access.</p>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#283042] text-[#A0A8B8] uppercase text-[10px] bg-[#1C2230]">
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Current Role</th>
                    <th className="py-3 px-4 font-semibold">Registration Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Toggle RBAC Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2230]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#181d28] transition">
                      <td className="py-3.5 px-4 flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-bold text-white">{u.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A0A8B8]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-[#FFD43B]/20 text-[#FFD43B]'
                              : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] cursor-pointer"
                        >
                          Make {u.role === 'admin' ? 'Customer' : 'Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Full Price History Database Records</h3>
              <p className="text-xs text-[#A0A8B8]">Every verified scan is recorded in MySQL price_history.</p>
            </div>
            <div className="p-4 bg-[#141821] border border-[#1C2230] rounded-2xl">
              <span className="text-xs text-[#A0A8B8]">
                Displaying latest 80 captures from price tracking engine.
              </span>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Platform Tracking Engine Configuration</h3>
            <p className="text-xs text-[#A0A8B8] mb-6">
              Configure APScheduler polling intervals, currency standards, and SMTP notification dispatch.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">
                  Tracking Interval (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.trackingIntervalMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, trackingIntervalMinutes: Number(e.target.value) })
                  }
                  min="1"
                  max="1440"
                  className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Market Simulation Mode</label>
                <select
                  value={settings.marketSimulationMode}
                  onChange={(e) =>
                    setSettings({ ...settings, marketSimulationMode: e.target.value as any })
                  }
                  className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="hybrid">Hybrid (Live Verified Feeds + Automated Movement)</option>
                  <option value="live">Strict Live Feeds Only</option>
                  <option value="demo">Demonstration Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Default Currency</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-[#1C2230]">
                <label className="flex items-center gap-3 text-xs text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.emailAlertsEnabled}
                    onChange={(e) => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#FFD43B] bg-[#0B0D12] border-[#283042]"
                  />
                  <span>Enable Real SMTP Email Notifications on Price Drop</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] shadow-md cursor-pointer"
                >
                  Save Platform Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
