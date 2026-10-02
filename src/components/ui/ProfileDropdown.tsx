'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Store,
  Settings,
  LogOut,
  RefreshCw,
  Edit3,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react';
import { searchCache } from '@/lib/cache/searchCache';

interface ProfileDropdownProps {
  initialShopName?: string;
  initialUserName?: string;
  initialMobile?: string;
}

export function ProfileDropdown({
  initialShopName = 'किराना स्टोर',
  initialUserName = 'संचालक',
  initialMobile = '',
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [shopName, setShopName] = useState(initialShopName);
  const [userName, setUserName] = useState(initialUserName);
  const [mobile, setMobile] = useState(initialMobile);
  const [address, setAddress] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cacheRefreshed, setCacheRefreshed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Fetch fresh shop details on mount
  useEffect(() => {
    fetch('/api/shop/details')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.shop?.name) setShopName(data.shop.name);
          if (data.user?.name) setUserName(data.user.name);
          if (data.shop?.mobile || data.user?.mobile) {
            setMobile(data.shop?.mobile || data.user?.mobile);
          }
          if (data.shop?.address) setAddress(data.shop.address);
        }
      })
      .catch(() => {});
  }, []);

  const handleRefreshCache = async () => {
    await searchCache.getCustomers(true);
    await searchCache.getProducts(true);
    await searchCache.getSuppliers(true);
    setCacheRefreshed(true);
    setTimeout(() => setCacheRefreshed(false), 2000);
    setIsOpen(false);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/shop/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          ownerName: userName,
          mobile,
          address,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setShowEditModal(false);
        }, 1200);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kirana_device_token');
      localStorage.removeItem('kirana_user');
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Profile Trigger Button - Touch optimized for mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
        aria-label="Profile and Settings Menu"
      >
        <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200 uppercase">
          {userName ? userName.charAt(0) : 'U'}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{userName}</span>
          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{shopName}</span>
        </div>
      </button>

      {/* Customized Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 text-xs overflow-hidden">
          {/* Header Info */}
          <div className="p-3 bg-slate-800/80 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs truncate">{shopName}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-700 text-slate-300 font-medium">
                7-दिन सक्रिय
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{userName} {mobile ? `• ${mobile}` : ''}</p>
          </div>

          {/* Action List */}
          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors text-left"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>दुकान विवरण बदलें (Edit Profile)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSettingsModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors text-left"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>सेटिंग्स व पासवर्ड (Settings)</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshCache}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors text-left"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>डेटा तुरंत सिंक करें (Sync Cache)</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="p-1 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors text-left font-medium"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>लॉगआउट (Logout)</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-400" />
                दुकान विवरण (Shop Details)
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>विवरण सफलतापूर्वक अपडेट हुआ!</span>
              </div>
            )}

            <form onSubmit={handleSaveDetails} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  दुकान का नाम (Shop Name)
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  दुकानदार का नाम (Owner Name)
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  मोबाइल नंबर (Mobile)
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  दुकान का पता (Address - Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold transition-colors"
                >
                  {saving ? 'सहेज रहे हैं...' : 'सहेजें (Save)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                सेटिंग्स व सुरक्षा (Settings & Security)
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>दुकान पासवर्ड (Store Password)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  वर्तमान में पासवर्ड <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200 font-mono">kirana123</code> निर्धारित है। पर्यावरण चर (.env) से नियंत्रित होता है।
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-slate-200 font-semibold block">7-दिन डिवाइस मान्यता</span>
                <p className="text-[11px] text-slate-400">
                  यह डिवाइस अगले 7 दिनों तक बिना पासवर्ड पूछे लॉगिन रहेगा, ताकि फोन में बार-बार टैब बंद करने पर असुविधा न हो।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
