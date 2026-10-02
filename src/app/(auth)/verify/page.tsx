'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get('mobile') || '';
  const devCode = searchParams.get('devCode') || '123456';

  const [otp, setOtp] = useState(devCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP received');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setError(data.error?.message || 'Verification failed');
      }
    } catch {
      setError('Verification network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-emerald-50/60 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-slate-200/80 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-semibold text-slate-400">Step 2 of 2</span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Enter Verification Code</h1>
          <p className="text-xs text-slate-500">
            Sent to mobile: <span className="font-mono font-bold text-slate-800">+91 {mobile}</span>
          </p>
        </div>

        {devCode && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-medium">
            Demo Test OTP is: <span className="font-mono font-black text-sm">{devCode}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              6-Digit OTP / ओ.टी.पी भरें
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full py-3.5 text-center text-3xl font-mono font-black tracking-widest text-slate-900 border border-slate-300 rounded-2xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Open Store / खाता खोलें'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
