import React from 'react';
import Link from 'next/link';
import { Store, Users, Database, Shield, Globe, ChevronRight } from 'lucide-react';

export default function SettingsMenuPage() {
  const settingsItems = [
    {
      title: 'Shop Profile',
      hindi: 'दुकान की जानकारी',
      description: 'Store name, owner mobile, location address, and timezone.',
      href: '/settings/shop',
      icon: Store,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Users & Roles',
      hindi: 'कर्मचारी व भूमिकाएँ',
      description: 'Manage staff access, roles (Owner, Employee, Accountant).',
      href: '/settings/users',
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Data Backup',
      hindi: 'डेटा बैकअप व सुरक्षा',
      description: 'Export and download complete shop ledger database snapshot.',
      href: '/settings/backup',
      icon: Database,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Security & PIN',
      hindi: 'सुरक्षा व पिन लॉक',
      description: 'Device lock PIN, active devices, and session controls.',
      href: '/settings/security',
      icon: Shield,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Preferences',
      hindi: 'भाषा व सेटिंग्स',
      description: 'Bilingual display (Hindi + English), large touch targets.',
      href: '/settings/preferences',
      icon: Globe,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure shop profile, team permissions, backups, and display preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-subtle">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${item.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h2>
                    <span className="text-xs font-semibold text-emerald-800">
                      ({item.hindi})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
