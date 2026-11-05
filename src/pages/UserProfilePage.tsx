import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  DollarSign,
  Store,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface UserProfilePageProps {
  navigate: (path: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [preferredStores, setPreferredStores] = useState<string[]>(
    user?.preferredStores || ['store-amazon', 'store-flipkart']
  );
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const availableStores = [
    { id: 'store-amazon', name: 'Amazon India' },
    { id: 'store-flipkart', name: 'Flipkart' },
    { id: 'store-croma', name: 'Croma Retail' },
    { id: 'store-reliance', name: 'Reliance Digital' },
  ];

  const toggleStore = (storeId: string) => {
    if (preferredStores.includes(storeId)) {
      setPreferredStores(preferredStores.filter((s) => s !== storeId));
    } else {
      setPreferredStores([...preferredStores, storeId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        preferredStores,
        currency,
        emailNotifications,
      });
      showToast('Profile updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Shopper Profile & Preferences</h1>
          <p className="text-xs text-[#A0A8B8] mt-1">
            Manage your personal settings, currency preferences, and monitored stores.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Avatar preview */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#1C2230]">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FFD43B]"
            />
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-[#A0A8B8]">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD43B]/20 text-[#FFD43B] uppercase">
                {user?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-[#0B0D12]/50 border border-[#1C2230] rounded-xl px-4 py-2.5 text-xs text-[#64748B] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
            >
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A0A8B8] mb-2">Preferred Retail Stores</label>
            <div className="grid grid-cols-2 gap-2">
              {availableStores.map((s) => {
                const isSelected = preferredStores.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleStore(s.id)}
                    className={`p-3 rounded-xl text-xs font-semibold border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFD43B]/10 border-[#FFD43B] text-white'
                        : 'bg-[#0B0D12] border-[#283042] text-[#A0A8B8] hover:text-white'
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FFD43B]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1C2230]">
            <label className="flex items-center gap-3 text-xs text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-[#FFD43B] bg-[#0B0D12] border-[#283042]"
              />
              <span>Receive periodic price drop summaries and instant target match emails</span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
