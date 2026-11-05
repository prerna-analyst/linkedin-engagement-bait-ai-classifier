import React, { useState } from 'react';
import { TrendingDown, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const { showToast } = useNotifications();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    showToast('Password reset link sent to your registered email', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1C2230] border border-[#FFD43B]/40 items-center justify-center mb-3 shadow-lg">
            <TrendingDown className="w-6 h-6 text-[#FFD43B]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-[#A0A8B8] mt-1">Enter your account email to receive recovery instructions</p>
        </div>

        {isSent ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto" />
            <h3 className="text-base font-bold text-white">Recovery Email Dispatched</h3>
            <p className="text-xs text-[#A0A8B8] leading-relaxed">
              If an account with <span className="text-white font-semibold">{email}</span> exists, password reset instructions have been transmitted.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] transition cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              Send Reset Instructions <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2 text-xs text-[#A0A8B8] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
