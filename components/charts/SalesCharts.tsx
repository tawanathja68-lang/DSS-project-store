'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Layers } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SalesChartsProps {
  salesByMonth?: any[];
  salesByCategory?: any[];
  salesByRegion?: any[];
  salesByStore?: any[];
  salesByProduct?: any[];
  salesByPromotion?: any[];
  onDrillCategory?: (category: string) => void;
  onDrillRegion?: (region: string) => void;
}

export const SalesCharts: React.FC<SalesChartsProps> = ({
  salesByMonth = [],
  salesByCategory = [],
  salesByRegion = [],
  salesByStore = [],
  salesByPromotion = [],
  onDrillCategory,
  onDrillRegion,
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
  const safeRegion = salesByRegion || [];
  const safeStore = salesByStore || [];
  const safePromo = salesByPromotion || [];

  // Region fairness calculation: Average Sales per Store
  const regionFairnessData = safeRegion.map((r) => {
    const storeCount =
      r.StoreCount ||
      (r.Region === 'Central'
        ? 3
        : r.Region === 'North'
        ? 2
        : r.Region === 'Isan'
        ? 2
        : r.Region === 'South'
        ? 2
        : 1);
    const avgPerStore = r.AverageSalesPerStore || r.SalesAmount / storeCount;
    return {
      Region: r.Region,
      TotalSales: r.SalesAmount,
      StoreCount: storeCount,
      AvgSalesPerStore: avgPerStore,
      Margin: r.OverallProfitMargin,
    };
  });

  return (
    <div className="space-y-6">
      {/* Row 1: Category Comparison & Monthly Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Profit by Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('sales.salesVsProfitTitle')}</h3>
              <p className="text-xs text-slate-500">{t('sales.salesVsProfitSub')}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-medium">
              <Layers className="w-3 h-3" />
              <span>{t('sales.clickToDrill')}</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeCategory}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
                onClick={(e) => {
                  if (e && e.activeLabel && onDrillCategory) {
                    onDrillCategory(e.activeLabel);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="Category"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Bar dataKey="SalesAmount" name={t('kpi.totalSales')} fill="#4f46e5" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="ProfitAmount" name={t('kpi.totalProfit')} fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue & Margin Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('sales.monthlyMarginTitle')}</h3>
              <p className="text-xs text-slate-500">{t('sales.monthlyMarginSub')}</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
              {t('overview.olapRollupBadge')}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={safeMonth} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="MonthName" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[25, 35]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any, name: string) =>
                    name.includes('Margin') || name.includes('อัตรากำไร') ? formatPercent(Number(val)) : formatCurrency(Number(val))
                  }
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="SalesAmount" name={t('kpi.totalSales')} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="OverallProfitMargin"
                  name={t('kpi.profitMargin')}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Region Fairness & Store Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Comparison Fairness (Section 8) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {t('sales.regionFairnessTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('sales.regionFairnessSub')}
              </p>
            </div>
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
              {t('sales.fairnessBadge')}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionFairnessData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activeLabel && onDrillRegion) {
                    onDrillRegion(e.activeLabel);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="Region" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="TotalSales" name={t('kpi.totalSales')} fill="#94a3b8" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar
                  dataKey="AvgSalesPerStore"
                  name={`${t('kpi.totalSales')} / สาขา (Normalized)`}
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Store */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('sales.branchRankingTitle')}</h3>
              <p className="text-xs text-slate-500">{t('sales.branchRankingSub')}</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
              {t('sales.storeDimBadge')}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={safeStore}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 75, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  dataKey="StoreName"
                  type="category"
                  tickFormatter={(name) => (name ? name.replace('QuickMart ', '') : '')}
                  tick={{ fontSize: 10 }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="SalesAmount" name={t('kpi.totalSales')} fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Promotion Performance (Section 9) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {t('sales.promoTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('sales.promoSub')}
            </p>
          </div>
          <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded font-medium">
            {t('sales.campaignDimBadge')}
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safePromo} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="PromotionName"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val))}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="SalesAmount" name={t('kpi.totalSales')} fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ProfitAmount" name={t('kpi.totalProfit')} fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
