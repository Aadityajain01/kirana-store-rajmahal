'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Truck,
  BarChart3,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { SyncBadge } from '@/components/feedback/SyncBadge';
import { MobileNav } from './MobileNav';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

interface AppShellProps {
  children: React.ReactNode;
  shopName: string;
  userName: string;
  role: string;
}

export function AppShell({ children, shopName, userName, role }: AppShellProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', hindi: 'डैशबोर्ड', icon: LayoutDashboard },
    { href: '/khata/customers', label: 'Customers', hindi: 'ग्राहक खाता', icon: Users },
    { href: '/khata/suppliers', label: 'Suppliers', hindi: 'व्यापारी खाता', icon: Truck },
    { href: '/reports', label: 'Reports', hindi: 'रिपोर्ट्स', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header - Slate Neutral with Top Right Profile Dropdown */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-inner">
              <Store className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base leading-tight truncate max-w-[160px] sm:max-w-xs">
                  {shopName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                  <ShieldCheck className="w-2.5 h-2.5 text-slate-400" />
                  7-दिन सक्रिय
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">किराना प्रबंधन प्रणाली</p>
            </div>
          </Link>

          {/* Top Right Header Section - Includes Sync and Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <SyncBadge />
            </div>

            {/* Profile Dropdown at the top right corner as requested */}
            <ProfileDropdown
              initialShopName={shopName}
              initialUserName={userName}
            />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar for Desktop */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-5">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 shadow-subtle">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              नेविगेशन / Menu
            </div>
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-normal ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {item.hindi}
                  </span>
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-100">
              <div className="px-2.5 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-xs truncate max-w-[120px]">{userName}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{role.toLowerCase()}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
