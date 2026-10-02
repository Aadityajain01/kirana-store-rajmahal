import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-6">
      <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
      <h3 className="text-base font-bold text-red-900">Something went wrong / त्रुटि हुई</h3>
      <p className="text-xs text-red-700 mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry / पुनः प्रयास करें</span>
        </button>
      )}
    </div>
  );
}
