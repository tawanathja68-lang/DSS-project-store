'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Sparkles, ShoppingBag, Info } from 'lucide-react';
import { formatPercent } from '@/lib/utils/formatters';

export const CrossSellingWidget: React.FC = () => {
  const { data } = useApp();
  const { t } = useLanguage();
  const rules = data?.associationRules || [];

  // Extract unique antecedent products
  const availableProducts = Array.from(
    new Set(rules.map((r) => r.AntecedentProducts).filter(Boolean))
  ).sort();

  const [selectedProduct, setSelectedProduct] = useState<string>(
    availableProducts[0] || 'CP Sausage Roll Pastry 80g'
  );

  // Find rules matching selected antecedent
  const matchedRules = rules
    .filter((r) => r.AntecedentProducts === selectedProduct)
    .sort((a, b) => b.lift - a.lift);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {t('mining.crossSellingTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('mining.crossSellingSub')}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          DSS Decision Support Tool
        </span>
      </div>

      {/* Product Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {t('mining.selectAnchor')}
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
        >
          {availableProducts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Associated Products Results */}
      {matchedRules.length > 0 ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>{t('mining.coPurchaseDiscovered')} ({matchedRules.length}):</span>
            <span className="text-[11px] text-indigo-600 font-normal">{t('mining.sortedByLift')}</span>
          </div>

          <div className="space-y-2.5">
            {matchedRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {rule.ConsequentProducts}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Frequently co-purchased item in customer baskets
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 block">
                      Lift: {rule.lift.toFixed(2)}x
                    </span>
                    <span className="text-[10px] text-slate-400">Baseline Multiplier</span>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-200/60 text-center">
                  <div className="bg-white p-1.5 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">{t('tables.support')}</span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatPercent(rule.support * 100)}
                    </span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">{t('tables.confidence')}</span>
                    <span className="text-xs font-bold text-indigo-600">
                      {formatPercent(rule.confidence * 100)}
                    </span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 block">{t('tables.conviction')}</span>
                    <span className="text-xs font-bold text-slate-800">
                      {rule.conviction.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* DSS Advisory Recommendation */}
                <div className="text-[11px] text-slate-600 bg-indigo-50/60 p-2 rounded border border-indigo-100/60 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold text-indigo-900">{t('mining.merchandisingSuggestion')} </span>
                    {t('mining.crossSellingAdvice')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">
            {t('tables.noRecords')}
          </p>
        </div>
      )}
    </div>
  );
};
