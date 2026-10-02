# Phase 6 DSS Dashboard Development Report: Retail Insight DSS (QuickMart)
**Project:** Retail Insight DSS — QuickMart  
**Application Type:** Interactive Decision Support System (DSS) Web Application  
**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons  
**Dataset Timeframe:** January 1, 2026 – September 30, 2026 (273 Days)  
**Store Network:** 10 Convenience Store Branches across Bangkok & Greater Bangkok  
**Product Assortment:** 65 SKUs across 8 Retail Categories  
**Execution Date:** October 2, 2026  
**Status:** APPROVED & VALIDATED (Production Build & Local Server Ready)

---

## 1. Dashboard Objective & Business Purpose

The **Retail Insight DSS — QuickMart** dashboard is an enterprise-grade Decision Support System engineered specifically for convenience store management (Store Managers, Retail Managers, Inventory Managers, and Category Managers). It synthesizes the full descriptive analytics pipeline:

$$\text{ETL} \longrightarrow \text{Star Schema Data Warehouse} \longrightarrow \text{OLAP Cube Layer} \longrightarrow \text{Data Mining (K-Means \& Apriori)} \longrightarrow \text{Interactive DSS Dashboard}$$

### Core Operating Philosophy: Decision Support, Not Coercion
In accordance with DSS design principles, the application **assists users in making informed managerial decisions** rather than prescribing rigid commands. 
- **Advisory Language Enforced:** "May consider", "Could review", "Suggested for review", "Data indicates", "Pattern suggests".
- **Strictly Avoided Prescriptive Language:** "Must", "Always", "Definitely", "Guaranteed", "Proves", "Will cause".

---

## 2. Architecture & Technology Stack

The dashboard is built on a modern, decoupled web architecture optimized for sub-second interaction and fast edge deployment on Vercel:

| Layer | Technology | Role & Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14.2.35 (App Router)** | High-performance React framework supporting static pre-rendering, route-based code splitting, and zero client layout shift. |
| **UI Library** | **React 18.3.1 + TypeScript** | Strongly-typed component architecture ensuring strict compile-time safety across measures and dimensions. |
| **Styling** | **Tailwind CSS 3.4.14** | Utility-first responsive design following modern SaaS analytics aesthetics (Clean, Minimal, Professional). |
| **Visualizations** | **Recharts 2.13.0** | Declarative SVG charting library with fluid animations, custom tooltips, and interactive chart element events. |
| **Icons** | **Lucide React** | Consistent, modern icon set providing accessible visual cues for status badges, KPI cards, and navigation. |
| **State Management** | **React Context (`AppContext.tsx`)** | Centralized in-memory reactive state managing global filters, OLAP slice/dice transformations, and baseline audits. |

---

## 3. Pages & Layout Structure

The application features a 3-tier layout:
1. **Left Navigation Sidebar:** Fixed branding, QuickMart logo, navigation items, and live DSS engine status widget.
2. **Top Sticky Bar:** Operational window indicator (`Jan 1 – Sep 30, 2026`), 100% reconciliation badge, and active filter reset shortcut.
3. **Global Filter Bar:** Comprehensive multi-dimensional filtering across Quarter, Month, Region, Province, Store, Category, SubCategory, and Promotion.
4. **Scrollable Analytics Canvas:** Hosting the 4 core views:

```
quickmart-dss/
├── app/
│   ├── page.tsx          # Page 1: Executive Overview (KPIs, Trends, DSS Insight Panel)
│   ├── sales/page.tsx    # Page 2: Sales & Profit (OLAP Slice/Dice, Drill-down, Region Fairness)
│   ├── inventory/page.tsx# Page 3: Inventory (Semi-Additive Stock, Reorder Alerts Table)
│   └── mining/page.tsx   # Page 4: Data Mining (K-Means K=3 & Apriori Market Basket Analysis)
```

---

## 4. KPI Definitions & Exact Reconciliation with Phase 4 Baseline

All analytical metrics are dynamically computed from verified OLAP and Mining datasets (`public/data/olap/` and `public/data/mining/`). **Zero hardcoded analytical numbers** exist in the user interface.

| Metric | Phase 4 OLAP Ground Truth | Dashboard Computed Value | Reconciliation Status |
| :--- | :---: | :---: | :---: |
| **Total Gross Sales** | ฿1,595,166.51 | **฿1,595,166.51** | **100.0% MATCH** |
| **Total Gross Profit** | ฿499,676.51 | **฿499,676.51** | **100.0% MATCH** |
| **Overall Profit Margin** | 31.32% (Weighted) | **31.32%** | **100.0% MATCH** |
| **Checkout Transactions** | 26,327 baskets | **26,327 baskets** | **100.0% MATCH** |
| **Total Physical Units Sold** | 71,885 units | **71,885 units** | **100.0% MATCH** |
| **Average Transaction Value (ATV)**| ฿60.59 | **฿60.59** | **100.0% MATCH** |
| **Current Physical Stock (Sep 30)**| 29,796 units | **29,796 units** | **100.0% MATCH** |
| **Active Reorder Alerts (Sep 30)** | 17 items | **17 items** | **100.0% MATCH** |

---

## 5. Visualizations & Chart Catalog

### Page 1 — Executive Overview
1. **Sales & Profit Trend Line Chart:** Dual-axis monthly revenue and gross profit trajectories.
2. **Category Sales Bar Chart:** Horizontal distribution of revenue across all 8 retail categories.
3. **Top Revenue SKUs Bar Chart:** Ranking of top commercial anchor products.
4. **Inventory Health Donut Chart:** Current snapshot proportions of `NORMAL` (621), `REORDER` (17), `OVERSTOCK` (12), and `OUT OF STOCK` (0).
5. **DSS Insight Panel:** 4 advisory decision-support cards with empirical evidence, managerial interpretation, and advisory recommendations.

### Page 2 — Sales & Profitability Analytics
1. **Category Sales vs. Profit Grouped Bar Chart:** Direct comparison of revenue volume against gross profit margin contribution (supports click-to-drill).
2. **Monthly Composed Trend Chart:** Gross revenue bars paired with a weighted profit margin percentage trendline.
3. **Regional Fairness Bar Chart:** Dual bar comparison showing Total Regional Sales alongside **Average Sales per Store**, preventing population bias from unequal store counts (Central has 3 stores vs. East has 1 store).
4. **Store Performance Ranking Bar Chart:** Horizontal turnover ranking of all 10 network branches.
5. **Promotion Campaign Effectiveness Bar Chart:** Comparing campaign revenue contribution, unit movement, and margin preservation (strictly avoiding unverified "ROI" claims).

### Page 3 — Inventory Management & Stock Replenishment
1. **Operational Stock Health Donut:** Breakdown of physical balances on the current date.
2. **Semi-Additive Ending Stock Progression:** Daily network ending stock trend, respecting non-additivity across time.
3. **Ending Stock by Store Bar Chart:** Point-in-time physical inventory balances across the 10 branches.
4. **Ending Stock by Category Bar Chart:** Current on-hand unit volume distributed across product categories.
5. **Actionable Reorder Alert Table:** Interactive, searchable, paginated table detailing items below reorder points with **Suggested Review Priority** badges informed by K-Means product clusters.

### Page 4 — Data Mining & Advanced Machine Learning
1. **Cluster Centroid Summary Cards:** Key metrics for Cluster 0 (11 SKUs), Cluster 1 (43 SKUs), and Cluster 2 (11 SKUs).
2. **Model Selection Info Box:** Clear explanation of why $K=3$ was locked over $K=2$ for operational actionability.
3. **Quantity vs. Revenue Scatter Plot:** Visualizing sales volume against revenue across clusters.
4. **Revenue vs. Margin Scatter Plot:** Highlighting high-margin booster items on the profitability frontier.
5. **Interactive Product Cluster Table:** Searchable table filterable by assigned cluster.
6. **Interactive Cross-Selling & Bundle Advisor:** Dropdown selector to choose any anchor product and immediately view co-purchase affinities (Lift, Confidence, Support, Conviction) and merchandising suggestions.
7. **Association Rules Table:** Searchable rule table with interactive sliders/dropdowns for Min Support (&ge;2.0%), Min Confidence (&ge;30%), and Min Lift (&gt;1.0x).

---

## 6. Multi-Dimensional Filter Architecture (Slice & Dice)

The `GlobalFilterBar` component enables instantaneous multi-dimensional OLAP analysis:
- **Slice:** Selecting a single dimension (e.g., `Region = Central` or `Category = Beverages`).
- **Dice:** Combining multiple dimensions simultaneously (e.g., `Region = Central` **AND** `Quarter = Q2` **AND** `Category = Snacks`).
- **Drill-Down:** Clicking on chart bars (e.g., Category bar) automatically drills into that slice and updates breadcrumbs.
- **Roll-Up:** Breadcrumb navigation and "Roll-up" buttons reset lower-level dimensions back to network aggregates.
- **Empty State Defense:** If an overly narrow filter combination yields zero records, the application gracefully renders an empty state banner with an explanation and a "Reset Filters" action.

---

## 7. Regional Comparison Fairness Principle

Because store distribution across Thailand is uneven (Central: 3 stores, North: 2 stores, Isan: 2 stores, South: 2 stores, East: 1 store), evaluating regions purely on total sales would produce a misleading bias favoring Central. 

To address this, the **Sales & Profit** page includes the **Average Sales per Store** metric:
$$\text{Average Sales per Store} = \frac{\text{Total Regional Sales}}{\text{Store Count in Region}}$$

This normalizes store performance and provides category managers with a fair basis for regional comparisons.

---

## 8. Semi-Additive Inventory Compliance

In strict adherence to dimensional modeling principles:
- **`EndingStock` is treated as a semi-additive measure.**
- Physical stock is summed across stores or products on a specific snapshot date (Sep 30: **29,796 units** across 650 records).
- The system **never sums stock across dates**. Time trends utilize Average Daily Ending Stock (**45.44 units/item**) or snapshot point-in-time balances.
- Prominent educational notices in the UI alert users to the semi-additive nature of inventory measures.

---

## 9. Data Mining Integration & Cross-Selling Advisor

The dashboard seamlessly bridges machine learning outputs with operational merchandising:
1. **Cluster 0 Anchors (`High Revenue Anchors`):** 11 SKUs driving 50.9% of store revenue. Reorder alerts for these items automatically receive **"High (Core Volume Anchor)"** review priority.
2. **Cluster 2 Boosters (`High Margin Boosters`):** 11 SKUs yielding 36.36% average margin. Reorder alerts receive **"Medium-High (Profit Booster)"** priority.
3. **Cross-Selling Widget:** Selecting `CP Sausage Roll Pastry` immediately displays its affinity with `Nescafe Espresso Roast` ($\text{Confidence} = 84.31\%, \text{Lift} = 10.74$), accompanied by advisory co-placement guidance.

---

## 10. Verification & Quality Checklist

| Test Case | Description | Verification Method | Status |
| :-: | :--- | :--- | :---: |
| **T1** | Production Build Compilation | `next build` executed with 0 errors | **PASS** |
| **T2** | Local Web Server Execution | `next start` on port 3000 responded in 622ms | **PASS** |
| **T3** | Route Accessibility | HTTP 200 on `/`, `/sales`, `/inventory`, `/mining` | **PASS** |
| **T4** | Static Data Endpoints | HTTP 200 on all JSON datasets in `/data/` | **PASS** |
| **T5** | Baseline KPI Reconciliation | Sales ฿1,595,166.51, Profit ฿499,676.51, Stock 29,796 | **PASS (100%)** |
| **T6** | Zero Hardcoded Data | All numbers computed dynamically from data files | **PASS** |
| **T7** | Advisory Phrasing Compliance | All DSS text uses "May consider", "Could review" | **PASS** |
| **T8** | Responsive Tables | Pagination and search verified on Reorder and Rules tables | **PASS** |
| **T9** | Semi-Additive Stock Rule | No cross-date stock summation; average & snapshot used | **PASS** |
| **T10**| Empty State Handling | Clear message rendered when filter returns 0 records | **PASS** |

---

## 11. Project File Structure

```
d:\Project-DSS-Store\quickmart-dss\
├── app/
│   ├── globals.css                       # Global styles & custom scrollbars
│   ├── layout.tsx                        # Root layout with Sidebar, Header & FilterBar
│   ├── page.tsx                          # Page 1: Overview
│   ├── sales/
│   │   └── page.tsx                      # Page 2: Sales & Profit
│   ├── inventory/
│   │   └── page.tsx                      # Page 3: Inventory
│   └── mining/
│       └── page.tsx                      # Page 4: Data Mining
├── components/
│   ├── charts/
│   │   ├── KPICard.tsx                   # Reusable KPI card with status styling
│   │   ├── OverviewCharts.tsx            # Executive trend, category, product & stock charts
│   │   ├── SalesCharts.tsx               # Sales vs profit, monthly trend & fairness charts
│   │   ├── InventoryCharts.tsx           # Donut, daily stock trend & branch stock charts
│   │   └── MiningCharts.tsx              # Scatter plots & cluster centroid cards
│   ├── dss/
│   │   ├── DSSInsightCard.tsx            # Structured decision support advice card
│   │   └── CrossSellingWidget.tsx        # Interactive Apriori affinity recommendations
│   ├── filters/
│   │   └── GlobalFilterBar.tsx           # Multi-dimensional slice & dice selector
│   ├── layout/
│   │   ├── Header.tsx                    # Top bar with operational window & audit badge
│   │   └── Sidebar.tsx                   # Left navigation sidebar & DSS status widget
│   └── tables/
│       ├── ReorderAlertTable.tsx         # Searchable inventory snapshot & alert table
│       ├── ProductClusterTable.tsx       # K-Means product segmentation table
│       └── AssociationRulesTable.tsx     # Apriori association rules table with filters
├── lib/
│   ├── data/
│   │   ├── AppContext.tsx                # Central reactive application state provider
│   │   ├── dataProvider.ts               # Data fetcher & dynamic OLAP aggregation engine
│   │   └── export_frontend_data.py       # Python script generating frontend data assets
│   ├── i18n/
│   │   ├── LanguageContext.tsx           # Bilingual state provider with localStorage persistence
│   │   └── translations.ts               # Centralized English/Thai translation dictionary (200+ keys)
│   ├── types/
│   │   └── index.ts                      # Strict TypeScript interfaces
│   └── utils/
│       └── formatters.ts                 # Currency (THB), percentage & number formatters
├── public/
│   └── data/
│       ├── mining/                       # 5 validated JSON & CSV mining outputs
│       ├── olap/                         # 16 validated JSON & CSV OLAP cubes & snapshots
│       └── warehouse/                    # Exported dimension tables
├── package.json                          # Next.js 14, React 18, Recharts, Lucide dependencies
├── tailwind.config.ts                    # Modern analytics color palette
├── tsconfig.json                         # Strict TypeScript configuration
└── reports/
    └── phase6_dashboard_report.md        # Comprehensive technical report
```

---

## 12. Revision Enhancements (Post-Review Updates)

1. **Inventory Route & Component Stabilization:**
   - **Root Cause Identified:** `QuickMartData` interface and `dataProvider.ts` initially omitted `inventoryByDay` and `inventoryByStore` in the return object, causing `inventoryByDay.filter` to throw `TypeError: Cannot read properties of undefined (reading 'filter')`.
   - **Resolution:** Added all inventory feeds to data fetching, implemented defensive array guards `safeByDay = inventoryByDay || []`, and restructured `ReorderAlertTable` with dedicated tabs for `REORDER` (17), `OUT OF STOCK` (0), `OVERSTOCK` (12), and `ALL` (650).
   - **Verification:** `/inventory` route returns HTTP 200, renders instantly, and validates exact 29,796 baseline units.
2. **Centralized Bilingual Architecture (English / Thai):**
   - Implemented centralized dictionary `lib/i18n/translations.ts` with over 200 translation keys covering all UI elements.
   - Built `LanguageProvider` with `t('path.key')` helper, instant reactive switching, and `localStorage` persistence (`quickmart-language`).
   - Integrated `[ EN | TH ]` toggle in top-right navbar with accessible keyboard navigation (`aria-label="Change language"`).
   - Enforced strict Thai DSS advisory phrasing (*"ควรพิจารณา"*, *"อาจพิจารณา"*, *"ข้อมูลแสดงว่า"*) while eliminating coercive terms.

---

## 13. Local Execution Instructions

To run the QuickMart DSS Dashboard locally:

```powershell
cd d:\Project-DSS-Store\quickmart-dss
# Ensure Node.js is in PATH
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Start the optimized production server:
npm run start

# Alternatively, for active development with Hot Module Replacement (HMR):
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).

---

## 14. Phase 6 Final Status: READY

The Interactive Decision Support Dashboard for **Retail Insight DSS — QuickMart** is fully developed, bilingual (EN/TH), validated, and verified on localhost. It is completely prepared for **Phase 7: Vercel Deployment & GitHub Documentation**.

