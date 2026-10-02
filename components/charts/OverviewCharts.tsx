'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface OverviewChartsProps {
  salesByMonth?: any[];
  salesByCategory?: any[];
  salesByRegion?: any[];
  salesByProduct?: any[];
  inventorySnapshot?: any[];
}

const INVENTORY_COLORS: Record<string, string> = {
  NORMAL: '#10b981',
  REORDER: '#f59e0b',
  OVERSTOCK: '#3b82f6',
  'OUT OF STOCK': '#ef4444',
};

const CATEGORY_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
];

export const OverviewCharts: React.FC<OverviewChartsProps> = ({
  salesByMonth = [],
  salesByCategory = [],
  salesByProduct = [],
  inventorySnapshot = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>;
  }

  const safeMonth = salesByMonth || [];
  const safeCategory = salesByCategory || [];
  const safeProduct = salesByProduct || [];
  const safeSnapshot = inventorySnapshot || [];

  // Calculate Inventory Status breakdown from snapshot
  const invCounts: Record<string, number> = {
    NORMAL: 0,
    REORDER: 0,
    OVERSTOCK: 0,
    'OUT OF STOCK': 0,
  };
  safeSnapshot.forEach((i) => {
    if (i && invCounts[i.InventoryStatus] !== undefined) {
      invCounts[i.InventoryStatus]++;
    }
  });

  const inventoryPieData = Object.entries(invCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // Top 8 Products
  const topProducts = [...safeProduct]
    .sort((a, b) => b.SalesAmount - a.SalesAmount)
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart A: Sales & Profit Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('overview.salesTrendTitle')}</h3>
            <p className="text-xs text-slate-500">{t('overview.salesTrendSub')}</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
            {t('overview.olapRollupBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="MonthName" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="SalesAmount"
                name={t('kpi.totalSales')}
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="ProfitAmount"
                name={t('kpi.totalProfit')}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart B: Sales by Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('overview.categorySalesTitle')}</h3>
            <p className="text-xs text-slate-500">{t('overview.categorySalesSub')}</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
            {t('overview.categoryDimBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={safeCategory}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                dataKey="Category"
                type="category"
                tick={{ fontSize: 11 }}
                width={85}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="SalesAmount" name={t('kpi.totalSales')} radius={[0, 4, 4, 0]}>
                {safeCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart C: Top 8 SKUs by Revenue */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('overview.topSkusTitle')}</h3>
            <p className="text-xs text-slate-500">{t('overview.topSkusSub')}</p>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-medium">
            {t('overview.coreAnchorsBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                dataKey="ProductName"
                type="category"
                tick={{ fontSize: 10 }}
                width={120}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="SalesAmount" name={t('kpi.totalSales')} fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart D: Inventory Status Donut */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('overview.invStatusTitle')}</h3>
            <p className="text-xs text-slate-500">
              {t('overview.invStatusSub')}
            </p>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            {t('kpi.semiAdditiveBadge')}
          </span>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={inventoryPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {inventoryPieData.map((entry, index) => (
                  <Cell
                    key={`inv-cell-${index}`}
                    fill={INVENTORY_COLORS[entry.name] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} ${t('common.records')}`, 'Count']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
