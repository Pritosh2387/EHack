import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
  inline?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading analytics data...',
  description,
  className = '',
  inline = false,
}) => {
  if (inline) {
    return (
      <div className={`inline-flex items-center gap-2 text-sm text-[#0F766E] ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white border border-[#E1E8E1] ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin mb-3" />
      <h3 className="text-sm font-semibold text-[#17211B]">{message}</h3>
      {description && <p className="text-xs text-[#66736A] mt-1 max-w-sm">{description}</p>}
    </div>
  );
};
