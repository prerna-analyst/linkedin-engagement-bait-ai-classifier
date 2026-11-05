import React, { useState } from 'react';
import {
  TrendingDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back to PriceTrack!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@pricetrack.com');
      setPassword('admin123');
    } else {
      setEmail('customer@pricetrack.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FFD43B]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1C2230] border border-[#FFD43B]/40 items-center justify-center mb-3 shadow-lg">
            <TrendingDown className="w-6 h-6 text-[#FFD43B]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to PriceTrack</h2>
          <p className="text-xs text-[#A0A8B8] mt-1">Access your tracked products and price drop alerts</p>
        </div>

        {/* Demo Account Fill Banner */}
        <div className="p-3 rounded-2xl bg-[#0B0D12] border border-[#283042] mb-6">
          <span className="text-[11px] font-bold text-[#FFD43B] uppercase tracking-wider block mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('customer')}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-[#4F8CFF] border border-[#283042] flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <UserCheck className="w-3.5 h-3.5" /> Customer Mode
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-[#FFD43B] border border-[#283042] flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Admin Mode
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] mb-4">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A8B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FFD43B]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#A0A8B8]">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-[#4F8CFF] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A8B8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FFD43B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0A8B8] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A0A8B8] pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#FFD43B] bg-[#0B0D12] border-[#283042]"
              />
              <span>Remember this browser</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#A0A8B8] mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#FFD43B] hover:underline font-bold cursor-pointer"
          >
            Create free account
          </button>
        </p>
      </div>
    </div>
  );
};
