'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Truck, BarChart3 } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', hindi: 'होम', icon: LayoutDashboard },
    { href: '/khata/customers', label: 'Customers', hindi: 'ग्राहक', icon: Users },
    { href: '/khata/suppliers', label: 'Suppliers', hindi: 'व्यापारी', icon: Truck },
    { href: '/reports', label: 'Reports', hindi: 'रिपोर्ट्स', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-slate-100 text-slate-900' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] leading-tight mt-0.5">
                {item.hindi}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
