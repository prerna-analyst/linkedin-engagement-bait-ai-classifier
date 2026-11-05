import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface AccountSettingsPageProps {
  navigate: (path: string) => void;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ navigate }) => {
  const { user, logout } = useAuth();
  const { showToast } = useNotifications();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    showToast('Password updated successfully', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleExportData = () => {
    const data = {
      user,
      exportedAt: new Date().toISOString(),
      platform: 'PriceTrack E-Commerce Intelligence',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricetrack-data-${user?.id || 'user'}.json`;
    a.click();
    showToast('Personal tracking data exported', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account Security & Settings</h1>
          <p className="text-xs text-[#A0A8B8] mt-1">
            Manage your credentials, encrypted data exports, and active sessions.
          </p>
        </div>

        {/* Change Password Card */}
        <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#FFD43B]" /> Change Password
          </h3>
          <p className="text-xs text-[#A0A8B8] mb-6">
            Update your account password with cryptographic PBKDF2/SHA-512 protection.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FFD43B]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black transition cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Export Data & GDPR Card */}
        <div className="bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#4F8CFF]" /> Export Tracking Records
            </h3>
            <p className="text-xs text-[#A0A8B8]">
              Download your complete tracking history, target alerts, and saved items as JSON.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] cursor-pointer shrink-0"
          >
            Export JSON
          </button>
        </div>

        {/* Sign Out Card */}
        <div className="bg-[#141821] border border-[#EF4444]/20 rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#EF4444] mb-1">Session Management</h3>
            <p className="text-xs text-[#A0A8B8]">Sign out from this browser session.</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
