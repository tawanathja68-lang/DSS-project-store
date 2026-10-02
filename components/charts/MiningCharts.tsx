'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { ProductClusterRow, ClusterSummaryRow } from '@/lib/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/formatters';
import { Cpu } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MiningChartsProps {
  products?: ProductClusterRow[];
  summary?: ClusterSummaryRow[];
}

const CLUSTER_COLORS: Record<number, string> = {
  0: '#2563eb', // Blue: High Revenue Anchors
  1: '#64748b', // Slate: Long-Tail Assortment
  2: '#059669', // Emerald: High Margin Boosters
};

export const MiningCharts: React.FC<MiningChartsProps> = ({ products = [], summary = [] }) => {
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>;
  }

  const safeProducts = products || [];
  const safeSummary = summary || [];

  const getClusterLabel = (cluster: number, defaultLabel: string) => {
    if (language === 'th') {
      if (cluster === 0) return t('clusters.c0Name');
      if (cluster === 1) return t('clusters.c1Name');
      if (cluster === 2) return t('clusters.c2Name');
    }
    return defaultLabel;
  };

  const getClusterDesc = (cluster: number, defaultDesc: string) => {
    if (language === 'th') {
      if (cluster === 0) return t('clusters.c0Desc');
      if (cluster === 1) return t('clusters.c1Desc');
      if (cluster === 2) return t('clusters.c2Desc');
    }
    return defaultDesc;
  };

  return (
    <div className="space-y-6">
      {/* Cluster Summary Cards (Section 15) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {safeSummary.map((c) => {
          const color = CLUSTER_COLORS[c.Cluster] || '#6366f1';
          return (
            <div
              key={c.Cluster}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden space-y-2"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Cluster {c.Cluster}: {getClusterLabel(c.Cluster, c.BusinessLabel)}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {c.ProductCount} {t('common.skus')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {getClusterDesc(c.Cluster, c.BusinessInterpretation)}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('tables.unitsSold')}</span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatNumber(c.AverageQuantity)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('tables.totalRevenue')}</span>
                  <span className="text-xs font-bold text-indigo-600">
                    {formatCurrency(c.AverageRevenue)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('tables.profitMargin')}</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {formatPercent(c.AverageProfitMargin)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Selection Explanation Panel (Section 16) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5 shrink-0">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <span>{t('mining.modelJustificationTitle')}</span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              {t('mining.modelLockedBadge')}
            </span>
          </h4>
          <p className="leading-relaxed">
            {t('mining.modelJustificationDesc')}
          </p>
        </div>
      </div>

      {/* Scatter Plots Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter 1: Quantity vs Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('mining.scatter1Title')}</h3>
              <p className="text-xs text-slate-500">{t('mining.scatter1Sub')}</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
              {t('mining.featureSpaceBadge')}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="TotalQuantitySold"
                  name="Quantity Sold"
                  tick={{ fontSize: 11 }}
                  unit=" units"
                />
                <YAxis
                  type="number"
                  dataKey="TotalRevenue"
                  name="Total Revenue"
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const item = payload[0].payload as ProductClusterRow;
                    return (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-lg text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">{item.ProductName}</span>
                        <div className="text-slate-500">{t('tables.category')}: {item.Category}</div>
                        <div className="text-indigo-600 font-semibold">
                          {t('tables.totalRevenue')}: {formatCurrency(item.TotalRevenue)}
                        </div>
                        <div className="text-slate-700">{t('tables.unitsSold')}: {formatNumber(item.TotalQuantitySold)}</div>
                        <div className="text-emerald-600 font-semibold">{t('tables.profitMargin')}: {formatPercent(item.OverallProfitMargin)}</div>
                        <div className="text-[10px] font-bold text-slate-600 pt-1 border-t">
                          {getClusterLabel(item.Cluster, item.ClusterBusinessLabel)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Products" data={safeProducts}>
                  {safeProducts.map((entry, index) => (
                    <Cell
                      key={`scatter1-${index}`}
                      fill={CLUSTER_COLORS[entry.Cluster] || '#6366f1'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter 2: Revenue vs Margin */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('mining.scatter2Title')}</h3>
              <p className="text-xs text-slate-500">{t('mining.scatter2Sub')}</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
              {t('mining.frontierBadge')}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="TotalRevenue"
                  name="Total Revenue"
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="OverallProfitMargin"
                  name="Profit Margin"
                  tickFormatter={(val) => `${val.toFixed(0)}%`}
                  tick={{ fontSize: 11 }}
                  domain={[20, 50]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const item = payload[0].payload as ProductClusterRow;
                    return (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-lg text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">{item.ProductName}</span>
                        <div className="text-slate-500">{t('tables.category')}: {item.Category}</div>
                        <div className="text-indigo-600 font-semibold">
                          {t('tables.totalRevenue')}: {formatCurrency(item.TotalRevenue)}
                        </div>
                        <div className="text-emerald-600 font-bold">
                          {t('tables.profitMargin')}: {formatPercent(item.OverallProfitMargin)}
                        </div>
                        <div className="text-slate-700">{t('tables.unitsSold')}: {formatNumber(item.TotalQuantitySold)}</div>
                        <div className="text-[10px] font-bold text-slate-600 pt-1 border-t">
                          {getClusterLabel(item.Cluster, item.ClusterBusinessLabel)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Products" data={safeProducts}>
                  {safeProducts.map((entry, index) => (
                    <Cell
                      key={`scatter2-${index}`}
                      fill={CLUSTER_COLORS[entry.Cluster] || '#6366f1'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
