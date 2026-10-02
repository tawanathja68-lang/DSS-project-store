'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Cpu,
  Store,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigationItems = [
    {
      name: t('nav.overview'),
      href: '/',
      icon: LayoutDashboard,
      desc: t('nav.overviewDesc'),
    },
    {
      name: t('nav.sales'),
      href: '/sales',
      icon: TrendingUp,
      desc: t('nav.salesDesc'),
    },
    {
      name: t('nav.inventory'),
      href: '/inventory',
      icon: Package,
      desc: t('nav.inventoryDesc'),
    },
    {
      name: t('nav.mining'),
      href: '/mining',
      icon: Cpu,
      desc: t('nav.miningDesc'),
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 shadow-xl min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              {t('nav.brand')}{' '}
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">
                {t('nav.dssBadge')}
              </span>
            </h1>
            <p className="text-xs text-slate-400">{t('nav.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {t('nav.analyticsEngine')}
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {item.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="rounded-lg p-3 bg-slate-800/60 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t('nav.engineStatus')}
            </span>
            <span className="text-emerald-400 font-medium">{t('nav.ready')}</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>{t('nav.stores')}</span>
              <span className="text-slate-200 font-semibold">{t('nav.storesValue')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('nav.catalog')}</span>
              <span className="text-slate-200 font-semibold">{t('nav.catalogValue')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('nav.dataset')}</span>
              <span className="text-slate-200 font-semibold">{t('nav.datasetValue')}</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{t('nav.advisoryNotice')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
