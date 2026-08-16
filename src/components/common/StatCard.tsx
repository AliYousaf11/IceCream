import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue',
}) => {
  const accentStyles = {
    blue: 'border-l-4 border-l-blue-900 bg-white',
    emerald: 'border-l-4 border-l-emerald-600 bg-white',
    amber: 'border-l-4 border-l-amber-500 bg-white',
    rose: 'border-l-4 border-l-rose-500 bg-white',
    purple: 'border-l-4 border-l-purple-600 bg-white',
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs ${accentStyles[accentColor]} transition-all hover:shadow-md flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {value}
          </div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-100/80 text-slate-700 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
