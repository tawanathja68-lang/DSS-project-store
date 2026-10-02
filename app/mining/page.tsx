'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MiningCharts } from '@/components/charts/MiningCharts';
import { ProductClusterTable } from '@/components/tables/ProductClusterTable';
import { AssociationRulesTable } from '@/components/tables/AssociationRulesTable';
import { CrossSellingWidget } from '@/components/dss/CrossSellingWidget';
import {
  Cpu,
  ShoppingBag,
  Info
} from 'lucide-react';

export default function MiningPage() {
  const { data, loading } = useApp();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'kmeans' | 'basket'>('kmeans');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('mining.pageTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('mining.pageSubtitle')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('kmeans')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'kmeans'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            {t('mining.tabKmeans')}
          </button>
          <button
            onClick={() => setActiveTab('basket')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'basket'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('mining.tabBasket')}
          </button>
        </div>
      </div>

      {/* Educational Data Mining Disclaimer (Section 20) */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {t('mining.disclaimer')}
        </span>
        <span className="font-semibold text-slate-500 hidden sm:inline">{t('mining.productionBadge')}</span>
      </div>

      {/* Tab Content */}
      {activeTab === 'kmeans' ? (
        <div className="space-y-6">
          {/* K-Means Visualizations */}
          <MiningCharts
            products={data?.productClusters || []}
            summary={data?.clusterSummary || []}
          />

          {/* Interactive Product Cluster Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {t('mining.clusterTableTitle')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('mining.clusterTableSub')}
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                65 {t('common.skus')}
              </span>
            </div>

            <ProductClusterTable products={data?.productClusters || []} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Cross-Selling Widget (Section 19) */}
          <CrossSellingWidget />

          {/* Top Association Rules Table (Section 17 & 18) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {t('mining.rulesTitle')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('mining.rulesSub')}
                </p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                {(data?.associationRules || []).length} {t('common.rules')}
              </span>
            </div>

            <AssociationRulesTable rules={data?.associationRules || []} />
          </div>
        </div>
      )}
    </div>
  );
}
