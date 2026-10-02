'use client';

import React, { useState, useMemo } from 'react';
import { ProductClusterRow } from '@/lib/types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/formatters';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ProductClusterTableProps {
  products?: ProductClusterRow[];
}

export const ProductClusterTable: React.FC<ProductClusterTableProps> = ({ products = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clusterFilter, setClusterFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t, language } = useLanguage();

  const safeProducts = products || [];

  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p) => {
      if (!p) return false;
      const matchSearch =
        (p.ProductName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.Category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.SubCategory || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCluster =
        clusterFilter === 'ALL' || String(p.Cluster) === clusterFilter;

      return matchSearch && matchCluster;
    });
  }, [safeProducts, searchTerm, clusterFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginated = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getClusterBadge = (cluster: number, defaultLabel: string) => {
    let label = defaultLabel;
    if (language === 'th') {
      if (cluster === 0) label = 'Cluster 0: สินค้าหลักรายได้สูง';
      else if (cluster === 2) label = 'Cluster 2: สินค้ากำไรสูง';
      else label = 'Cluster 1: สินค้า Long-Tail';
    } else {
      if (cluster === 0) label = 'Cluster 0: High Revenue Anchors';
      else if (cluster === 2) label = 'Cluster 2: High Margin Boosters';
      else label = 'Cluster 1: Long-Tail Assortment';
    }

    switch (cluster) {
      case 0:
        return (
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {label}
          </span>
        );
      case 2:
        return (
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            {label}
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-64"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: language === 'th' ? 'ทุกคลัสเตอร์ (65)' : 'All Clusters (65)' },
              { id: '0', label: language === 'th' ? 'Cluster 0 (11 รายการ)' : 'Cluster 0 (11 Anchors)' },
              { id: '1', label: language === 'th' ? 'Cluster 1 (43 รายการ)' : 'Cluster 1 (43 Long-Tail)' },
              { id: '2', label: language === 'th' ? 'Cluster 2 (11 รายการ)' : 'Cluster 2 (11 High-Margin)' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setClusterFilter(c.id);
                  setCurrentPage(1);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${
                  clusterFilter === c.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {t('common.showing')} <span className="font-semibold text-slate-800">{filteredProducts.length}</span> {t('common.skus')}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">{t('tables.productName')}</th>
              <th className="py-2.5 px-3">{t('tables.category')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.unitPrice')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.profitMargin')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.unitsSold')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.totalRevenue')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.totalProfit')}</th>
              <th className="py-2.5 px-3">{t('tables.assignedSegment')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? (
              paginated.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {p.ProductName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{p.Category}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    {formatCurrency(p.UnitPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {formatPercent(p.OverallProfitMargin)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                    {formatNumber(p.TotalQuantitySold)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-indigo-700">
                    {formatCurrency(p.TotalRevenue)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                    {formatCurrency(p.TotalProfit)}
                  </td>
                  <td className="py-2.5 px-3">
                    {getClusterBadge(p.Cluster, p.ClusterBusinessLabel)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  {t('tables.noRecords')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/40 text-xs">
          <span className="text-slate-500">
            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
