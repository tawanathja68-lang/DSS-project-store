'use client';

import React, { useState, useMemo } from 'react';
import { AssociationRuleRow } from '@/lib/types';
import { Search, HelpCircle, ArrowRight } from 'lucide-react';
import { formatPercent } from '@/lib/utils/formatters';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AssociationRulesTableProps {
  rules?: AssociationRuleRow[];
}

export const AssociationRulesTable: React.FC<AssociationRulesTableProps> = ({ rules = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minSupport, setMinSupport] = useState<number>(0.02);
  const [minConfidence, setMinConfidence] = useState<number>(0.30);
  const [minLift, setMinLift] = useState<number>(1.00);
  const { t } = useLanguage();

  const safeRules = rules || [];

  const filteredRules = useMemo(() => {
    return safeRules.filter((r) => {
      if (!r) return false;
      const matchSearch =
        (r.AntecedentProducts || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.ConsequentProducts || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchSupport = r.support >= minSupport;
      const matchConf = r.confidence >= minConfidence;
      const matchLift = r.lift >= minLift;

      return matchSearch && matchSupport && matchConf && matchLift;
    });
  }, [safeRules, searchTerm, minSupport, minConfidence, minLift]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
      {/* Educational Info Box (Section 18) */}
      <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5 shrink-0">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-indigo-950 flex items-center gap-2">
            <span>{t('mining.ruleInfoTitle')}</span>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {t('mining.ruleInfoWarning')}
            </span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            {t('mining.ruleInfoDesc')}
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="px-4 pb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Min Support:</span>
            <select
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium"
            >
              <option value={0.01}>&ge; 1.0%</option>
              <option value={0.02}>&ge; 2.0%</option>
              <option value={0.03}>&ge; 3.0%</option>
              <option value={0.035}>&ge; 3.5%</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Min Confidence:</span>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium"
            >
              <option value={0.20}>&ge; 20%</option>
              <option value={0.30}>&ge; 30%</option>
              <option value={0.45}>&ge; 45%</option>
              <option value={0.60}>&ge; 60%</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Min Lift:</span>
            <select
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 font-medium"
            >
              <option value={1.0}>&gt; 1.0x</option>
              <option value={3.0}>&gt; 3.0x</option>
              <option value={5.0}>&gt; 5.0x</option>
              <option value={8.0}>&gt; 8.0x</option>
            </select>
          </div>

          <span className="text-slate-400 font-medium">
            ({filteredRules.length} {t('common.rules')})
          </span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-y border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">{t('tables.antecedent')}</th>
              <th className="py-2.5 px-1"></th>
              <th className="py-2.5 px-3">{t('tables.consequent')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.support')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.confidence')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.lift')}</th>
              <th className="py-2.5 px-3 text-right">{t('tables.conviction')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRules.length > 0 ? (
              filteredRules.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {r.AntecedentProducts}
                  </td>
                  <td className="py-2 px-1 text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {r.ConsequentProducts}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {formatPercent(r.support * 100)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-indigo-600">
                    {formatPercent(r.confidence * 100)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600">
                    {r.lift.toFixed(2)}x
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {r.conviction.toFixed(2)}
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
    </div>
  );
};
