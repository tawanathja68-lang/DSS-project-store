'use client';

import React from 'react';
import { DSSInsight } from '@/lib/types';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Cpu,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DSSInsightCardProps {
  insight: DSSInsight;
}

export const DSSInsightCard: React.FC<DSSInsightCardProps> = ({ insight }) => {
  const { t, language } = useLanguage();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'warning':
        return {
          bg: 'bg-amber-50/70 border-amber-200',
          iconColor: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          Icon: AlertTriangle,
        };
      case 'alert':
        return {
          bg: 'bg-rose-50/70 border-rose-200',
          iconColor: 'text-rose-600',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          Icon: AlertTriangle,
        };
      case 'success':
        return {
          bg: 'bg-emerald-50/70 border-emerald-200',
          iconColor: 'text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          Icon: CheckCircle2,
        };
      default:
        return {
          bg: 'bg-indigo-50/70 border-indigo-200',
          iconColor: 'text-indigo-600',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          Icon: Lightbulb,
        };
    }
  };

  const getEvidenceTypeBadge = (type: string) => {
    switch (type) {
      case 'Clustering':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md">
            <Cpu className="w-2.5 h-2.5" />
            {language === 'th' ? 'โมเดล K-Means' : 'Clustering Model'}
          </span>
        );
      case 'Association Rule':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-2.5 h-2.5" />
            {language === 'th' ? 'กฎความสัมพันธ์ Apriori' : 'Market Basket Mining'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
            <Layers className="w-2.5 h-2.5" />
            {language === 'th' ? 'ข้อมูลสรุป OLAP' : 'Descriptive / OLAP'}
          </span>
        );
    }
  };

  const style = getSeverityStyle(insight.severity);
  const IconComponent = style.Icon;

  return (
    <div className={`p-4 rounded-xl border ${style.bg} shadow-xs transition-all hover:shadow-md space-y-2.5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-white shadow-xs ${style.iconColor}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">{insight.title}</h4>
        </div>
        {getEvidenceTypeBadge(insight.evidenceType)}
      </div>

      {/* Evidence */}
      <div className="text-xs bg-white/80 rounded-lg p-2.5 border border-slate-200/80 text-slate-700">
        <span className="font-semibold text-slate-900 block mb-0.5">{t('dss.empiricalEvidence')}</span>
        <p className="text-slate-600 leading-relaxed">{insight.evidence}</p>
      </div>

      {/* Interpretation */}
      <div className="text-xs text-slate-600">
        <span className="font-semibold text-slate-800">{t('dss.interpretation')} </span>
        <span>{insight.interpretation}</span>
      </div>

      {/* Suggested Action (DSS Advisory Language) */}
      <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-xs text-indigo-900 font-medium bg-indigo-50/50 p-2 rounded-lg">
        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-700">{t('dss.advisoryAction')} </span>
          <span>{insight.suggestedAction}</span>
        </div>
      </div>
    </div>
  );
};
