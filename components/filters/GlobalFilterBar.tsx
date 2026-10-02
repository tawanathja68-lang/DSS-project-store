'use client';

import React from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Filter, X } from 'lucide-react';

export const GlobalFilterBar: React.FC = () => {
  const { data, filters, updateFilter, resetFilters } = useApp();
  const { t, language } = useLanguage();

  // Distinct options from dimensions
  const quarters = ['Q1', 'Q2', 'Q3'];
  const months = [
    { key: '2026-01', label: language === 'th' ? 'ม.ค. 2026' : 'Jan 2026' },
    { key: '2026-02', label: language === 'th' ? 'ก.พ. 2026' : 'Feb 2026' },
    { key: '2026-03', label: language === 'th' ? 'มี.ค. 2026' : 'Mar 2026' },
    { key: '2026-04', label: language === 'th' ? 'เม.ย. 2026' : 'Apr 2026' },
    { key: '2026-05', label: language === 'th' ? 'พ.ค. 2026' : 'May 2026' },
    { key: '2026-06', label: language === 'th' ? 'มิ.ย. 2026' : 'Jun 2026' },
    { key: '2026-07', label: language === 'th' ? 'ก.ค. 2026' : 'Jul 2026' },
    { key: '2026-08', label: language === 'th' ? 'ส.ค. 2026' : 'Aug 2026' },
    { key: '2026-09', label: language === 'th' ? 'ก.ย. 2026' : 'Sep 2026' },
  ];

  const regions = Array.from(new Set((data?.dimStores || []).map((s) => s.Region).filter(Boolean))).sort();
  const provinces = Array.from(
    new Set(
      (data?.dimStores || [])
        .filter((s) => filters.region === 'all' || s.Region === filters.region)
        .map((s) => s.Province)
        .filter(Boolean)
    )
  ).sort();

  const stores = (data?.dimStores || [])
    .filter(
      (s) =>
        (filters.region === 'all' || s.Region === filters.region) &&
        (filters.province === 'all' || s.Province === filters.province)
    )
    .sort((a, b) => (a.StoreName || '').localeCompare(b.StoreName || ''));

  const categories = Array.from(new Set((data?.dimProducts || []).map((p) => p.Category).filter(Boolean))).sort();
  const subCategories = Array.from(
    new Set(
      (data?.dimProducts || [])
        .filter((p) => filters.category === 'all' || p.Category === filters.category)
        .map((p) => p.SubCategory)
        .filter(Boolean)
    )
  ).sort();

  const promotions = (data?.salesByPromotion || []).map((pr) => pr.PromotionName).filter(Boolean);

  const isFilterActive =
    filters.month !== 'all' ||
    filters.quarter !== 'all' ||
    filters.region !== 'all' ||
    filters.province !== 'all' ||
    filters.store !== 'all' ||
    filters.category !== 'all' ||
    filters.subCategory !== 'all' ||
    filters.product !== 'all' ||
    filters.promotion !== 'all';

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('filters.barTitle')}</span>
          </div>
          <span className="text-xs text-slate-600">
            {t('filters.barSubtitle')}
          </span>
        </div>

        {isFilterActive && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md font-medium transition"
          >
            <X className="w-3 h-3" />
            {t('common.clearAllFilters')}
          </button>
        )}
      </div>

      {/* Filter Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Quarter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.quarter')}</label>
          <select
            value={filters.quarter}
            onChange={(e) => updateFilter('quarter', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allQuarters')}</option>
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q} (2026)
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.month')}</label>
          <select
            value={filters.month}
            onChange={(e) => updateFilter('month', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allMonths')}</option>
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.region')}</label>
          <select
            value={filters.region}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allRegions')}</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Province */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.province')}</label>
          <select
            value={filters.province}
            onChange={(e) => updateFilter('province', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allProvinces')}</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Store */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.store')}</label>
          <select
            value={filters.store}
            onChange={(e) => updateFilter('store', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allStores')}</option>
            {stores.map((s) => (
              <option key={s.StoreKey} value={s.StoreName}>
                {(s.StoreName || '').replace('QuickMart ', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.category')}</label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allCategories')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* SubCategory */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.subCategory')}</label>
          <select
            value={filters.subCategory}
            onChange={(e) => updateFilter('subCategory', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allSubCategories')}</option>
            {subCategories.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
        </div>

        {/* Promotion */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">{t('filters.promotion')}</label>
          <select
            value={filters.promotion}
            onChange={(e) => updateFilter('promotion', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">{t('filters.allPromotions')}</option>
            {promotions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {isFilterActive && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-600">{t('common.appliedDimensions')}</span>
          {filters.quarter !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.quarter')}: {filters.quarter}
              <button onClick={() => updateFilter('quarter', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-indigo-900" />
              </button>
            </span>
          )}
          {filters.month !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.month')}: {filters.month}
              <button onClick={() => updateFilter('month', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-indigo-900" />
              </button>
            </span>
          )}
          {filters.region !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.region')}: {filters.region}
              <button onClick={() => updateFilter('region', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-blue-900" />
              </button>
            </span>
          )}
          {filters.store !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.store')}: {filters.store.replace('QuickMart ', '')}
              <button onClick={() => updateFilter('store', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-blue-900" />
              </button>
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.category')}: {filters.category}
              <button onClick={() => updateFilter('category', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-emerald-900" />
              </button>
            </span>
          )}
          {filters.subCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.subCategory')}: {filters.subCategory}
              <button onClick={() => updateFilter('subCategory', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-emerald-900" />
              </button>
            </span>
          )}
          {filters.promotion !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
              {t('filters.promotion')}: {filters.promotion}
              <button onClick={() => updateFilter('promotion', 'all')}>
                <X className="w-2.5 h-2.5 hover:text-purple-900" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
