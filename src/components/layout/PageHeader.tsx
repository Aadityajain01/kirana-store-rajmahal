import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  hindiTitle?: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, hindiTitle, description, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {hindiTitle && (
              <span className="text-sm sm:text-base font-medium text-emerald-700">({hindiTitle})</span>
            )}
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
