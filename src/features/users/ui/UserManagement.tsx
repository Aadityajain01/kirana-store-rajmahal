'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Shield, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface UserManagementProps {
  members: any[];
  userRole: string;
}

export function UserManagement({ members, userRole }: UserManagementProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'ACCOUNTANT' | 'OWNER'>('EMPLOYEE');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isOwner = userRole === 'OWNER';

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, role }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Member added successfully! / कर्मचारी जोड़ा गया।' });
        setName('');
        setMobile('');
        router.refresh();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error?.message || 'Failed to add member' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User & Staff Roles</h1>
          <span className="text-xs text-emerald-700 font-semibold">कर्मचारी व भूमिका प्रबंधन</span>
        </div>
      </div>

      {/* Add Staff Form (Owner only) */}
      {isOwner && (
        <form
          onSubmit={handleAddMember}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Add New Staff Member / नया कर्मचारी जोड़ें</span>
          </h2>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name / कर्मचारी का नाम
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile / फ़ोन नंबर
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / भूमिका
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-600 bg-white"
              >
                <option value="EMPLOYEE">Employee (कर्मचारी - एंट्री व बिल)</option>
                <option value="ACCOUNTANT">Accountant (मुनीम - केवल रिपोर्ट)</option>
                <option value="OWNER">Co-Owner (मालिक)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              {submitting ? 'Adding...' : 'Add Member / जोड़ें'}
            </button>
          </div>
        </form>
      )}

      {/* Member List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Current Shop Members ({members.length})</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((m: any) => (
            <div key={m.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  {m.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{m.user.name}</p>
                  <p className="text-xs font-mono text-slate-400">{m.user.mobile}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    m.role === 'OWNER'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : m.role === 'ACCOUNTANT'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {m.role}
                </span>
                <span className="text-xs text-slate-400">({m.status.toLowerCase()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
