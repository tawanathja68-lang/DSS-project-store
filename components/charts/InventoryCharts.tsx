'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatNumber } from '@/lib/utils/formatters';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface InventoryChartsProps {
  inventorySnapshot?: any[];
  inventoryByDay?: any[];
  inventoryByStore?: any[];
}

const STATUS_COLORS: Record<string, string> = {
  NORMAL: '#10b981',
  REORDER: '#f59e0b',
  OVERSTOCK: '#3b82f6',
  'OUT OF STOCK': '#ef4444',
};

export const InventoryCharts: React.FC<InventoryChartsProps> = ({
  inventorySnapshot = [],
  inventoryByDay = [],
  inventoryByStore = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>;
  }

  const safeSnapshot = inventorySnapshot || [];
  const safeByDay = inventoryByDay || [];
  const safeByStore = inventoryByStore || [];

  // Aggregate Status from snapshot
  const statusCounts: Record<string, number> = {
    NORMAL: 0,
    REORDER: 0,
    OVERSTOCK: 0,
    'OUT OF STOCK': 0,
  };
  safeSnapshot.forEach((i) => {
    if (i && statusCounts[i.InventoryStatus] !== undefined) {
      statusCounts[i.InventoryStatus]++;
    }
  });

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // Aggregate current stock by Category
  const catStockMap = new Map<string, number>();
  safeSnapshot.forEach((i) => {
    if (i && i.Category) {
      catStockMap.set(i.Category, (catStockMap.get(i.Category) || 0) + (i.EndingStock || 0));
    }
  });
  const catStockData = Array.from(catStockMap.entries())
    .map(([Category, EndingStock]) => ({
      Category,
      EndingStock,
    }))
    .sort((a, b) => b.EndingStock - a.EndingStock);

  // Sample inventory by day (every 5th day for smooth trend)
  const sampledTrend = safeByDay
    .filter((_, idx) => idx % 5 === 0)
    .map((d) => ({
      Date: d.Date || d.DateKey,
      AvgEndingStock: d.EndingStock || d.TotalEndingStock || d.AverageEndingStock || 0,
      TotalStockIn: d.StockIn || d.TotalStockIn || 0,
      TotalStockOut: d.StockOut || d.TotalStockOut || 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Inventory Status Donut */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('inventory.stockHealthTitle')}</h3>
            <p className="text-xs text-slate-500">{t('inventory.stockHealthSub')}</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
            2026-09-30
          </span>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
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
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
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

      {/* Chart 2: Daily Network Average Ending Stock Trend (Semi-Additive) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('inventory.stockTrendTitle')}</h3>
            <p className="text-xs text-slate-500">{t('inventory.stockTrendSub')}</p>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            {t('kpi.semiAdditiveBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampledTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="Date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [formatNumber(Number(val)), 'Units']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="AvgEndingStock"
                name={t('kpi.currentStock')}
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Physical Stock by Store Branch */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('inventory.stockByStoreTitle')}</h3>
            <p className="text-xs text-slate-500">{t('inventory.stockByStoreSub')}</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
            {t('kpi.pointInTimeBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={safeByStore}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 75, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="StoreName"
                type="category"
                tickFormatter={(name) => (name ? name.replace('QuickMart ', '') : '')}
                tick={{ fontSize: 10 }}
                width={110}
              />
              <Tooltip
                formatter={(val: any) => [`${formatNumber(Number(val))} units`, t('kpi.currentStock')]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="LastDayEndingStock" name={t('kpi.currentStock')} fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Physical Stock by Product Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('inventory.stockByCatTitle')}</h3>
            <p className="text-xs text-slate-500">{t('inventory.stockByCatSub')}</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
            {t('kpi.pointInTimeBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catStockData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="Category"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [`${formatNumber(Number(val))} units`, t('kpi.currentStock')]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="EndingStock" name={t('kpi.currentStock')} fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
