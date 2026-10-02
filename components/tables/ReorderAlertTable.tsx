'use client';

import React, { useState, useMemo } from 'react';
import { InventorySnapshotItem } from '@/lib/types';
import { Search, AlertTriangle, AlertCircle, CheckCircle, Info, ChevronLeft, ChevronRight, PackageCheck, Boxes } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ReorderAlertTableProps {
  items?: InventorySnapshotItem[];
}

export const ReorderAlertTable: React.FC<ReorderAlertTableProps> = ({ items = [] }) => {
  const { t, language } = useLanguage();
  const safeItems = items || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'REORDER' | 'OUT OF STOCK' | 'OVERSTOCK' | 'NORMAL' | 'ALL'>('REORDER');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Counts for each tab badge
  const counts = useMemo(() => {
    return {
      REORDER: safeItems.filter(i => i.InventoryStatus === 'REORDER').length,
      OUT_OF_STOCK: safeItems.filter(i => i.InventoryStatus === 'OUT OF STOCK').length,
      OVERSTOCK: safeItems.filter(i => i.InventoryStatus === 'OVERSTOCK').length,
      NORMAL: safeItems.filter(i => i.InventoryStatus === 'NORMAL').length,
      ALL: safeItems.length,
    };
  }, [safeItems]);

  const filteredItems = useMemo(() => {
    return safeItems.filter((item) => {
      if (!item) return false;
      const matchSearch =
        (item.ProductName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.StoreName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Category || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || item.InventoryStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [safeItems, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OUT OF STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            {t('status.outOfStock')}
          </span>
        );
      case 'REORDER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {t('status.reorder')}
          </span>
        );
      case 'OVERSTOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
            <Info className="w-3 h-3" />
            {t('status.overstock')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            {t('status.normal')}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (!priority) return null;
    let label = priority;
    if (language === 'th') {
      if (priority.includes('High (Core')) label = 'สูง (สินค้าหลัก Core Anchor)';
      else if (priority.includes('Medium-High')) label = 'ปานกลาง-สูง (สินค้ากำไรสูง)';
      else if (priority.includes('Medium (Long')) label = 'ปานกลาง (สินค้า Long-Tail)';
      else if (priority.includes('Low')) label = 'ต่ำ (ทบทวนต้นทุนสต็อก)';
      else label = 'ตรวจสอบตามรอบปกติ';
    }

    if (priority.includes('High (Core')) {
      return (
        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
          {label}
        </span>
      );
    }
    if (priority.includes('Medium-High')) {
      return (
        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
          {label}
        </span>
      );
    }
    if (priority.includes('Medium')) {
      return (
        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
          {label}
        </span>
      );
    }
    return (
      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls with Clear Section B Tabs */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setStatusFilter('REORDER');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'REORDER'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('inventory.tabReorder')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'REORDER' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {counts.REORDER}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('OUT OF STOCK');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'OUT OF STOCK'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t('inventory.tabOutOfStock')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'OUT OF STOCK' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
                {counts.OUT_OF_STOCK}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('OVERSTOCK');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'OVERSTOCK'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>{t('inventory.tabOverstock')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'OVERSTOCK' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'}`}>
                {counts.OVERSTOCK}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>{t('inventory.tabAll')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {counts.ALL}
              </span>
            </button>
          </div>

          {/* Search Box */}
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
        </div>

        <div className="text-xs text-slate-500">
          {t('common.showing')} <span className="font-semibold text-slate-800">{filteredItems.length}</span> {t('common.records')}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">{t('tables.productName')}</th>
              <th className="py-2.5 px-3">{t('tables.storeBranch')}</th>
              <th className="py-2.5 px-3">{t('tables.category')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.physicalStock')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.reorderPoint')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.maxStock')}</th>
              <th className="py-2.5 px-3 text-center">{t('tables.inventoryStatus')}</th>
              <th className="py-2.5 px-3">{t('tables.productSegment')}</th>
              <th className="py-2.5 px-3">{t('tables.reviewPriority')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {item.ProductName}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {(item.StoreName || '').replace('QuickMart ', '')}
                  </td>
                  <td className="py-2 px-3 text-slate-500">{item.Category}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    {formatNumber(item.EndingStock)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {item.ReorderPoint}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {item.MaxStockLevel}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {getStatusBadge(item.InventoryStatus)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.ClusterBusinessLabel || `Cluster ${item.Cluster}`}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {getPriorityBadge(item.SuggestedReviewPriority)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  {t('tables.noRecords')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/40 text-xs">
          <span className="text-slate-500">
            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
