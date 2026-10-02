import React from 'react';
import Link from 'next/link';
import { Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  hindiTitle?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  actionOnClick?: () => void;
}

export function EmptyState({
  title,
  hindiTitle,
  description,
  actionHref,
  actionLabel,
  actionOnClick,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800">
        {title} {hindiTitle && <span className="text-emerald-700">({hindiTitle})</span>}
      </h3>
      {description && <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}

      {(actionHref || actionOnClick) && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel || 'Create New / नया जोड़ें'}</span>
            </Link>
          ) : (
            <button
              onClick={actionOnClick}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel || 'Create New / नया जोड़ें'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
