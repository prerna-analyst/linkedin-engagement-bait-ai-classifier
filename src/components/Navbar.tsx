import React, { useState } from 'react';
import {
  TrendingDown,
  Search,
  Bell,
  Heart,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout, switchDemoUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { wishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Products', path: '/explore' },
    { label: 'Smart Compare', path: '/compare' },
    { label: 'Best Deals', path: '/deals' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0D12]/90 backdrop-blur-md border-b border-[#1C2230]">
      {/* Top micro-announcement bar for demo convenience */}
      <div className="bg-[#141821] border-b border-[#1C2230]/60 px-4 py-1 text-xs text-[#A0A8B8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
            <ShieldCheck className="w-3 h-3 mr-1" /> LIVE ENGINE
          </span>
          <span className="hidden sm:inline">Tracking 4 Verified Stores: Amazon, Flipkart, Croma & Reliance Digital</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#A0A8B8]">1-Click Demo Accounts:</span>
          <button
            onClick={() => switchDemoUser('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === 'admin'
                ? 'bg-[#FFD43B] text-black font-bold'
                : 'bg-[#1C2230] text-[#FFD43B] hover:bg-[#252C3D]'
            }`}
            title="Log in as Administrator"
          >
            Admin Mode
          </button>
          <button
            onClick={() => switchDemoUser('customer')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === 'customer'
                ? 'bg-[#4F8CFF] text-white font-bold'
                : 'bg-[#1C2230] text-[#4F8CFF] hover:bg-[#252C3D]'
            }`}
            title="Log in as Customer"
          >
            Customer Mode
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1C2230] to-[#283248] border border-[#FFD43B]/40 flex items-center justify-center shadow-md group-hover:border-[#FFD43B] transition">
            <TrendingDown className="w-5 h-5 text-[#FFD43B]" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4F8CFF]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">Price</span>
              <span className="text-xl font-extrabold tracking-tight text-[#FFD43B]">Track</span>
            </div>
            <p className="text-[10px] text-[#A0A8B8] -mt-1 hidden sm:block tracking-wide">
              Compare Smarter. Save More.
            </p>
          </div>
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A8B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phones, laptops, headphones, deals..."
            className="w-full bg-[#141821] border border-[#283042] rounded-xl pl-10 pr-20 py-2 text-sm text-white placeholder-[#A0A8B8] focus:outline-none focus:border-[#FFD43B] transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1C2230] hover:bg-[#283248] text-[#FFD43B] transition"
          >
            Find Deals
          </button>
        </form>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`transition cursor-pointer ${
                currentPath === link.path
                  ? 'text-[#FFD43B] font-semibold'
                  : 'text-[#A0A8B8] hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentPath.startsWith('/admin')
                  ? 'bg-[#FFD43B] text-black shadow-sm'
                  : 'bg-[#FFD43B]/10 text-[#FFD43B] hover:bg-[#FFD43B]/20 border border-[#FFD43B]/30'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
            </button>
          )}
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Wishlist Icon */}
          <button
            onClick={() => navigate(user ? '/wishlist' : '/login')}
            className="relative p-2 rounded-xl bg-[#141821] hover:bg-[#1C2230] text-[#A0A8B8] hover:text-white border border-[#283042] transition cursor-pointer"
            title="My Saved Products"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-[#141821] hover:bg-[#1C2230] text-[#A0A8B8] hover:text-[#FFD43B] border border-[#283042] transition cursor-pointer"
              title="Price Drop Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFD43B] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141821] border border-[#283042] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 bg-[#1C2230] border-b border-[#283042] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFD43B]/20 text-[#FFD43B]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#4F8CFF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#1C2230]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#A0A8B8]">
                      No notifications yet. Set a price alert to be notified when prices drop!
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          markAsRead(item.id);
                          if (item.link) navigate(item.link);
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-xs transition cursor-pointer ${
                          item.isRead ? 'bg-transparent text-[#A0A8B8]' : 'bg-[#1C2230]/70 text-white'
                        } hover:bg-[#1C2230]`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-white">{item.title}</p>
                          <span className="text-[10px] text-[#A0A8B8] shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2">{item.message}</p>
                        {item.priceDifference && (
                          <div className="mt-1.5 text-[11px] text-[#22C55E] font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Saved ₹{item.priceDifference.toLocaleString('en-IN')} below target!
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-[#1C2230] border-t border-[#283042] text-center">
                  <button
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-[#FFD43B] hover:underline font-medium cursor-pointer"
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-[#141821] hover:bg-[#1C2230] border border-[#283042] transition cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128'}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-[#FFD43B]/30"
                />
                <span className="hidden sm:block text-xs font-semibold text-white max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#A0A8B8]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#141821] border border-[#283042] rounded-2xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#283042] mb-1">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#A0A8B8] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFD43B]/20 text-[#FFD43B] uppercase">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-[#FFD43B]" /> User Dashboard
                  </button>

                  <button
                    onClick={() => {
                      navigate('/alerts');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#4F8CFF]" /> Target Price Alerts
                  </button>

                  <button
                    onClick={() => {
                      navigate('/wishlist');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-pink-400" /> My Saved Products
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-[#1C2230] flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#A0A8B8]" /> Account Settings
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[#FFD43B] hover:bg-[#FFD43B]/10 flex items-center gap-2 font-medium border-t border-[#283042] mt-1 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" /> Admin Console
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2 border-t border-[#283042] mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:bg-[#1C2230] transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFD43B] text-black hover:bg-[#ffe066] transition shadow-md cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
