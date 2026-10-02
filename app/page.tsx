'use client';

import React from 'react';
import { useApp } from '@/lib/data/AppContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { KPICard } from '@/components/charts/KPICard';
import { OverviewCharts } from '@/components/charts/OverviewCharts';
import { DSSInsightCard } from '@/components/dss/DSSInsightCard';
import { DSSInsight } from '@/lib/types';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Boxes,
  ShoppingCart,
  Warehouse,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/formatters';

export default function OverviewPage() {
  const { filteredMetrics, loading } = useApp();
  const { t, language } = useLanguage();
  const { kpi, salesByMonth, salesByCategory, salesByRegion, salesByProduct, inventorySnapshot, isEmpty } =
    filteredMetrics || {};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">{t('common.noDataTitle')}</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {t('common.noDataDesc')}
        </p>
      </div>
    );
  }

  // Pre-configured DSS Insights with strict advisory language (Bilingual EN/TH)
  const dssInsights: DSSInsight[] = language === 'th' ? [
    {
      title: 'ความสอดคล้องด้านปริมาณและอัตรากำไรของหมวดเครื่องดื่ม',
      evidence:
        'หมวดเครื่องดื่มสร้างยอดขาย ฿247,489 (15.5% ของยอดขายทั้งเครือข่าย) ควบคู่กับอัตรากำไรขั้นต้นสูงถึง 35.8% จาก 12 SKUs',
      interpretation:
        'สินค้าเครื่องดื่มดับกระหายและกาแฟกระป๋องทำหน้าที่เป็นทั้งตัวขับเคลื่อนปริมาณขายและตัวเร่งกำไรโดยไม่ต้องอาศัยการลดราคาลึก',
      suggestedAction:
        'ผู้จัดการสาขาควรพิจารณาและตรวจสอบความพร้อมจำหน่ายในตู้แช่อย่างต่อเนื่องในกลุ่มสินค้าหมุนเวียนเร็ว (เช่น น้ำดื่มสิงห์, กาแฟเบอร์ดี้)',
      evidenceType: 'Descriptive / OLAP',
      severity: 'info',
    },
    {
      title: 'แรงกดดันจุดสั่งซื้อซ้ำในกลุ่มสินค้าหลัก (Core Anchors)',
      evidence:
        'มี 17 รายการสินค้า-สาขาที่สต็อกลดลงถึงจุดสั่งซื้อซ้ำ โดย 6 รายการจัดอยู่ใน Cluster 0 (สินค้าหลัก Core Volume Anchors)',
      interpretation:
        'สินค้าจำเป็นยอดนิยม (ขนมปังแผ่นฟาร์มเฮ้าส์, ข้าวกะเพราหมู) ถูกซื้อรวดเร็วใกล้ช่วงสุดสัปดาห์ เสี่ยงต่อสินค้าขาดสต็อกในสาขาทราฟฟิกสูง',
      suggestedAction:
        'ผู้จัดการหมวดหมู่สินค้าอาจพิจารณาทบทวนรอบระยะเวลาสั่งซื้อกับผู้ผลิต (Supplier Lead Time) เพื่อรักษาปริมาณสต็อกสำรอง',
      evidenceType: 'Clustering',
      severity: 'warning',
    },
    {
      title: 'รูปแบบการซื้อชุดอาหารเช้าในตะกร้าสินค้าของลูกค้า',
      evidence:
        'พายไส้กรอก CP มีความเชื่อมโยงในการซื้อคู่กับ กาแฟเนสกาแฟเอสเปรสโซ ด้วยค่าความเชื่อมั่นสูงถึง 84.3% (ค่า Lift = 10.74)',
      interpretation:
        'ตะกร้าสินค้าของกลุ่มคนทำงานช่วงเช้ามีความสัมพันธ์ระหว่างเบเกอรี่อุ่นร้อนกับกาแฟกระป๋องแช่เย็นในกว่า 970 ใบเสร็จที่บันทึก',
      suggestedAction:
        'ผู้จัดการร้านควรพิจารณาและทดสอบจัดวางตู้กาแฟแช่เย็นให้อยู่ใกล้กับตู้เบเกอรี่อุ่นร้อน หรือทดสอบทำป้ายแนะนำ ณ จุดจำหน่าย',
      evidenceType: 'Association Rule',
      severity: 'success',
    },
    {
      title: 'การบริหารเงินทุนหมุนเวียนในกลุ่มสินค้า Long-Tail',
      evidence:
        'สินค้า 43 SKUs ใน Cluster 1 สร้างสัดส่วนยอดขาย 25.0% ของเครือข่าย แต่มียอดขายเฉลี่ยเพียง ~1.1 ชิ้นต่อวันต่อสาขา',
      interpretation:
        'สินค้าของใช้ส่วนตัวและของใช้ในบ้านสร้างความครบครันของร้าน แต่ส่งผลให้เงินทุนหมุนเวียนและพื้นที่เชลฟ์จมอยู่กับสต็อกที่เคลื่อนไหวช้า',
      suggestedAction:
        'ผู้จัดการฝ่ายค้าปลีกอาจพิจารณาปรับลดระดับสต็อกสำรอง (Safety Stock) ในสินค้ากลุ่มท้ายตาราง เพื่อลดต้นทุนการถือครองสต็อก',
      evidenceType: 'Clustering',
      severity: 'info',
    },
  ] : [
    {
      title: 'Beverage Category Volume & Margin Synergy',
      evidence:
        'Beverages contributes ฿247,489 (15.5% of network sales) while sustaining a high 35.8% gross profit margin across 12 SKUs.',
      interpretation:
        'Hydration and canned coffees serve as dual volume drivers and margin engines without requiring deep promotional discounting.',
      suggestedAction:
        'Store managers may consider maintaining continuous cooler availability on high-velocity SKUs (e.g. Singha Water, Birdy Coffee).',
      evidenceType: 'Descriptive / OLAP',
      severity: 'info',
    },
    {
      title: 'Selective Reorder Pressure on Core Anchors',
      evidence:
        '17 SKU-branch physical balances currently meet reorder thresholds, with 6 originating in Cluster 0 (Core Volume Anchors).',
      interpretation:
        'Fast-moving staples (White Bread, Basil Pork Rice) deplete rapidly near week-end peaks, risking stockout in high-traffic branches.',
      suggestedAction:
        'Category managers could review replenishment lead times with suppliers to ensure buffer stock on top revenue items.',
      evidenceType: 'Clustering',
      severity: 'warning',
    },
    {
      title: 'Breakfast Co-Purchase Routine in Market Baskets',
      evidence:
        'CP Sausage Roll Pastry demonstrates an 84.3% conditional confidence of pairing with Nescafe Espresso Roast (Lift = 10.74).',
      interpretation:
        'Morning commuter baskets strongly link savory warm bakery with chilled canned coffee in over 970 recorded transactions.',
      suggestedAction:
        'Store teams might evaluate testing adjacent display placement between the warm bakery case and grab-and-go coffee coolers.',
      evidenceType: 'Association Rule',
      severity: 'success',
    },
    {
      title: 'Long-Tail Assortment Working Capital Review',
      evidence:
        '43 SKUs in Cluster 1 generate 25.0% of network revenue but average only ~1.1 units sold per day per store location.',
      interpretation:
        'Slower moving personal care and household items provide essential category breadth but lock up shelf space and inventory capital.',
      suggestedAction:
        'Retail managers could review safety stock buffers on bottom-quartile SKUs to minimize carrying costs without degrading variety.',
      evidenceType: 'Clustering',
      severity: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('overview.pageTitle')}</h2>
          <p className="text-xs text-slate-500">{t('overview.pageSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('overview.reconciledStatus')}
          </span>
        </div>
      </div>

      {/* 8 Primary KPI Cards (Section 3) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title={t('kpi.totalSales')}
          value={formatCurrency(kpi?.totalSales || 0)}
          subtitle={t('kpi.salesSubtitle')}
          icon={DollarSign}
          color="indigo"
          badge={t('kpi.networkTotalBadge')}
        />
        <KPICard
          title={t('kpi.totalProfit')}
          value={formatCurrency(kpi?.totalProfit || 0)}
          subtitle={t('kpi.profitSubtitle')}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title={t('kpi.profitMargin')}
          value={formatPercent(kpi?.profitMargin || 0)}
          subtitle={t('kpi.marginSubtitle')}
          icon={Percent}
          color="amber"
          badge={t('kpi.targetMarginBadge')}
        />
        <KPICard
          title={t('kpi.transactions')}
          value={formatNumber(kpi?.transactionCount || 0)}
          subtitle={t('kpi.txnsSubtitle')}
          icon={Receipt}
          color="blue"
        />
        <KPICard
          title={t('kpi.unitsSold')}
          value={formatNumber(kpi?.unitsSold || 0)}
          subtitle={t('kpi.unitsSubtitle')}
          icon={Boxes}
          color="purple"
        />
        <KPICard
          title={t('kpi.atv')}
          value={formatCurrency(kpi?.averageTransactionValue || 0)}
          subtitle={t('kpi.atvSubtitle')}
          icon={ShoppingCart}
          color="indigo"
        />
        <KPICard
          title={t('kpi.currentStock')}
          value={`${formatNumber(kpi?.currentStock || 0)} units`}
          subtitle={t('kpi.currentStockSubtitle')}
          icon={Warehouse}
          color="emerald"
          badge={t('kpi.semiAdditiveBadge')}
        />
        <KPICard
          title={t('kpi.reorderAlerts')}
          value={`${kpi?.reorderAlerts || 0} items`}
          subtitle={t('kpi.reorderSubtitle')}
          icon={AlertTriangle}
          color={(kpi?.reorderAlerts || 0) > 0 ? 'amber' : 'emerald'}
          badge={(kpi?.reorderAlerts || 0) > 0 ? t('kpi.reviewNeededBadge') : t('kpi.nominalBadge')}
        />
      </div>

      {/* Overview Charts (Section 4) */}
      <OverviewCharts
        salesByMonth={salesByMonth || []}
        salesByCategory={salesByCategory || []}
        salesByRegion={salesByRegion || []}
        salesByProduct={salesByProduct || []}
        inventorySnapshot={inventorySnapshot || []}
      />

      {/* Decision Support Insights Panel (Section 5) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {t('overview.dssInsightsTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('overview.dssInsightsSub')}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            {t('overview.advisoryAssistanceBadge')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dssInsights.map((insight, idx) => (
            <DSSInsightCard key={idx} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
