import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
  className = '',
}) => {
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211B]">{title}</h2>
          {badge && <div>{badge}</div>}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-[#66736A] mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="self-start sm:self-auto shrink-0">{action}</div>}
    </div>
  );
};
