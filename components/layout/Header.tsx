'use client';

import React from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Calendar, CheckCircle2, RotateCcw, Filter, AlertCircle, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { filters, resetFilters, validationCheck } = useApp();
  const { language, setLanguage, t } = useLanguage();

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
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('common.operationalWindow')}</span>
        </div>

        {validationCheck.passed ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('common.reconciledBadge')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('common.auditDiffBadge')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {isFilterActive && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md font-semibold">
              <Filter className="w-3 h-3 text-indigo-600" />
              {t('common.activeSliceDice')}
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-md font-medium transition"
              title="Reset all filters to full network baseline"
            >
              <RotateCcw className="w-3 h-3 text-slate-600" />
              {t('common.resetFilters')}
            </button>
          </div>
        )}

        {/* Bilingual Language Switcher (Section E, F, H, L) */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <div className="px-1.5 text-slate-400">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <button
            onClick={() => setLanguage('en')}
            aria-label="Change language to English"
            className={`px-2 py-1 text-xs font-bold rounded-md transition ${
              language === 'en'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('th')}
            aria-label="Change language to Thai"
            className={`px-2 py-1 text-xs font-bold rounded-md transition ${
              language === 'th'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            TH
          </button>
        </div>

        <div className="text-right pl-2 border-l border-slate-200 hidden sm:block">
          <span className="text-[10px] text-slate-400 block">{t('common.systemMode')}</span>
          <span className="text-xs font-semibold text-slate-700">{t('common.localhostMode')}</span>
        </div>
      </div>
    </header>
  );
};
