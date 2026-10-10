import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Request Failed',
  message = 'Unable to complete this request. The analytics service could not process the query.',
  onRetry,
  className = '',
}) => {
  // Sanitize message: strip internal paths or python traceback if any
  const cleanMessage = message.includes('Traceback')
    ? 'An unexpected error occurred in the analytics engine.'
    : message;

  return (
    <div
      className={`p-6 rounded-xl bg-red-50/70 border border-red-200 text-red-900 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          <p className="text-xs text-red-700 mt-1">{cleanMessage}</p>

          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-700 text-white hover:bg-red-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Request</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
