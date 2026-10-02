'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'blue' | 'amber' | 'rose' | 'purple';
  badge?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  badge,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      pill: 'bg-indigo-100 text-indigo-800',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      pill: 'bg-emerald-100 text-emerald-800',
    },
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-100',
      pill: 'bg-blue-100 text-blue-800',
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'border-amber-100',
      pill: 'bg-amber-100 text-amber-800',
    },
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-600',
      border: 'border-rose-100',
      pill: 'bg-rose-100 text-rose-800',
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'border-purple-100',
      pill: 'bg-purple-100 text-purple-800',
    },
  };

  const scheme = colorMap[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${scheme.bg} ${scheme.border} border ${scheme.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-xl font-bold text-slate-900 tracking-tight">{value}</div>
        {subtitle && (
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
            <span>{subtitle}</span>
            {badge && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${scheme.pill}`}>
                {badge}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
