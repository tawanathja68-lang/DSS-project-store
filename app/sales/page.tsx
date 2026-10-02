'use client';

import React from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { KPICard } from '@/components/charts/KPICard';
import { SalesCharts } from '@/components/charts/SalesCharts';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Boxes,
  ShoppingCart,
  Layers,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/formatters';

export default function SalesPage() {
  const { filteredMetrics, filters, updateFilter, resetFilters, loading } = useApp();
  const { t } = useLanguage();
  const { kpi, salesByMonth, salesByCategory, salesByRegion, salesByStore, salesByProduct, salesByPromotion, isEmpty } =
    filteredMetrics || {};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">{t('common.noDataTitle')}</h3>
        <p className="text-xs text-slate-500">{t('common.noDataDesc')}</p>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t('common.resetFilters')}
        </button>
      </div>
    );
  }

  const handleDrillCategory = (category: string) => {
    updateFilter('category', category);
  };

  const handleDrillRegion = (region: string) => {
    updateFilter('region', region);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with OLAP Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('sales.pageTitle')}</h2>
          <p className="text-xs text-slate-500">
            {t('sales.pageSubtitle')}
          </p>
        </div>

        {/* OLAP Breadcrumb Navigation */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-700">{t('sales.hierarchy')}</span>
          <span className="text-slate-500">
            {filters.region !== 'all' ? `${t('filters.region')}: ${filters.region}` : t('sales.allRegions')}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-500">
            {filters.category !== 'all' ? `${t('filters.category')}: ${filters.category}` : t('sales.allCategories')}
          </span>
          {(filters.region !== 'all' || filters.category !== 'all') && (
            <button
              onClick={() => {
                updateFilter('region', 'all');
                updateFilter('category', 'all');
              }}
              className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1"
              title="Roll-up to full network"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              {t('sales.rollUp')}
            </button>
          )}
        </div>
      </div>

      {/* Sales KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <KPICard
          title={t('kpi.totalSales')}
          value={formatCurrency(kpi?.totalSales || 0)}
          subtitle={t('kpi.salesSubtitle')}
          icon={DollarSign}
          color="indigo"
        />
        <KPICard
          title={t('kpi.totalProfit')}
          value={formatCurrency(kpi?.totalProfit || 0)}
          subtitle={t('kpi.profitSubtitle')}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title={t('kpi.profitMargin')}
          value={formatPercent(kpi?.profitMargin || 0)}
          subtitle={t('kpi.marginSubtitle')}
          icon={Percent}
          color="amber"
        />
        <KPICard
          title={t('kpi.atv')}
          value={formatCurrency(kpi?.averageTransactionValue || 0)}
          subtitle={`${formatNumber(kpi?.transactionCount || 0)} ${t('kpi.transactions')}`}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title={t('kpi.unitsSold')}
          value={formatNumber(kpi?.unitsSold || 0)}
          subtitle={t('kpi.unitsSubtitle')}
          icon={Boxes}
          color="purple"
        />
        <KPICard
          title={t('kpi.transactions')}
          value={formatNumber(kpi?.transactionCount || 0)}
          subtitle={t('kpi.txnsSubtitle')}
          icon={Receipt}
          color="indigo"
        />
      </div>

      {/* Visualizations (Section 6, 7, 8, 9) */}
      <SalesCharts
        salesByMonth={salesByMonth || []}
        salesByCategory={salesByCategory || []}
        salesByRegion={salesByRegion || []}
        salesByStore={salesByStore || []}
        salesByProduct={salesByProduct || []}
        salesByPromotion={salesByPromotion || []}
        onDrillCategory={handleDrillCategory}
        onDrillRegion={handleDrillRegion}
      />
    </div>
  );
}
