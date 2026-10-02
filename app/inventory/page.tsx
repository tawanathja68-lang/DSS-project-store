'use client';

import React from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { KPICard } from '@/components/charts/KPICard';
import { InventoryCharts } from '@/components/charts/InventoryCharts';
import { ReorderAlertTable } from '@/components/tables/ReorderAlertTable';
import {
  Warehouse,
  AlertTriangle,
  AlertCircle,
  PackageCheck,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

export default function InventoryPage() {
  const { data, filteredMetrics, loading } = useApp();
  const { t } = useLanguage();
  const { inventorySnapshot = [], isEmpty } = filteredMetrics || {};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">{t('common.loading')}</p>
      </div>
    );
  }

  const safeSnapshot = inventorySnapshot || [];

  // Calculate semi-additive inventory metrics from current snapshot
  const currentPhysicalStock = safeSnapshot.reduce(
    (acc, curr) => acc + (curr?.EndingStock || 0),
    0
  );
  const reorderCount = safeSnapshot.filter((i) => i?.InventoryStatus === 'REORDER').length;
  const outOfStockCount = safeSnapshot.filter((i) => i?.InventoryStatus === 'OUT OF STOCK').length;
  const overstockCount = safeSnapshot.filter((i) => i?.InventoryStatus === 'OVERSTOCK').length;
  const averageEndingStock = 45.44; // From Phase 4 OLAP verified daily mean

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('inventory.pageTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('inventory.pageSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            {t('inventory.snapshotBadge')}
          </span>
        </div>
      </div>

      {/* Semi-Additive Measure Rule Notice (Section 10) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950 block">
            {t('inventory.semiAdditiveTitle')}
          </span>
          <p className="text-amber-800 leading-relaxed mt-0.5">
            {t('inventory.semiAdditiveDesc')}
          </p>
        </div>
      </div>

      {/* Inventory KPI Cards (Section 10) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard
          title={t('kpi.currentStock')}
          value={`${formatNumber(currentPhysicalStock)} units`}
          subtitle={t('kpi.currentStockSubtitle')}
          icon={Warehouse}
          color="indigo"
          badge={t('kpi.pointInTimeBadge')}
        />
        <KPICard
          title={t('kpi.reorderAlerts')}
          value={`${reorderCount} items`}
          subtitle={t('kpi.reorderSubtitle')}
          icon={AlertTriangle}
          color={reorderCount > 0 ? 'amber' : 'emerald'}
          badge={reorderCount > 0 ? t('kpi.reviewNeededBadge') : t('kpi.nominalBadge')}
        />
        <KPICard
          title={t('kpi.outOfStock')}
          value={`${outOfStockCount} items`}
          subtitle={t('kpi.outOfStockSubtitle')}
          icon={AlertCircle}
          color={outOfStockCount > 0 ? 'rose' : 'emerald'}
          badge={t('kpi.zeroBadge')}
        />
        <KPICard
          title={t('kpi.overstock')}
          value={`${overstockCount} items`}
          subtitle={t('kpi.overstockSubtitle')}
          icon={PackageCheck}
          color="blue"
          badge={t('kpi.capitalBadge')}
        />
        <KPICard
          title={t('kpi.avgEndingStock')}
          value={`${averageEndingStock} units`}
          subtitle={t('kpi.avgStockSubtitle')}
          icon={TrendingDown}
          color="purple"
          badge={t('kpi.semiAdditiveBadge')}
        />
      </div>

      {/* Visualizations (Section 12) */}
      <InventoryCharts
        inventorySnapshot={safeSnapshot}
        inventoryByDay={data?.inventoryByDay || []}
        inventoryByStore={data?.inventoryByStore || []}
      />

      {/* Actionable Reorder Alert Table (Section 13) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {t('inventory.auditTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('inventory.auditSub')}
            </p>
          </div>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
            Searchable & Filterable
          </span>
        </div>

        <ReorderAlertTable items={safeSnapshot} />
      </div>
    </div>
  );
}
