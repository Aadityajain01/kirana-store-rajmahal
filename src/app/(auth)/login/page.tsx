'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('कृपया दुकान का पासवर्ड दर्ज करें (Please enter store password)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save token and session into localStorage for 7-day device continuity
        if (typeof window !== 'undefined') {
          localStorage.setItem('kirana_device_token', data.token || 'logged_in');
          localStorage.setItem('kirana_device_login_time', Date.now().toString());
          if (data.user) {
            localStorage.setItem('kirana_user', JSON.stringify(data.user));
          }
        }
        window.location.href = '/dashboard';
      } else {
        setError(data.error?.message || 'गलत पासवर्ड (Incorrect password)');
      }
    } catch {
      setError('सर्वर से संपर्क नहीं हो पाया (Connection error). कृपया दोबारा प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setPassword('kirana123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-slate-900 text-slate-100">
      <div className="max-w-sm w-full bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-700/80 space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-slate-700 border border-slate-600 text-slate-100 flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-6 h-6 text-slate-200" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Kirana Khata Pro</h1>
          <p className="text-xs text-slate-400">
            ग्रामीण किराना दुकान खाता बही प्रबंधन
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                दुकान पासवर्ड (Store Password)
              </label>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                डिफ़ॉल्ट भरें
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें..."
                className="w-full pl-9 pr-10 py-2.5 text-sm font-medium bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>{loading ? 'सत्यापित हो रहा है...' : 'दुकान में प्रवेश करें (Login)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-700/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>7-दिन डिवाइस मान्यता (7-Day Persistent Device)</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            बार-बार टैब बंद करने या खोलने पर लॉगआउट नहीं होगा। यह फोन 7 दिनों तक सक्रिय रहेगा।
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>सुरक्षित ऑफलाइन-कैश एवं रियलटाइम बैकअप</span>
        </div>
      </div>
    </div>
  );
}
