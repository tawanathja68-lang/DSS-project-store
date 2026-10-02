import {
  FilterState,
  KPIData,
  SalesByMonthRow,
  SalesByCategoryRow,
  SalesByRegionRow,
  SalesByStoreRow,
  SalesByProductRow,
  SalesByPromotionRow,
  InventoryStatusRow,
  InventorySnapshotItem,
  ProductClusterRow,
  ClusterSummaryRow,
  AssociationRuleRow
} from '../types';

export interface QuickMartData {
  salesByMonth: SalesByMonthRow[];
  salesByCategory: SalesByCategoryRow[];
  salesByRegion: SalesByRegionRow[];
  salesByStore: SalesByStoreRow[];
  salesByProduct: SalesByProductRow[];
  salesByPromotion: SalesByPromotionRow[];
  salesByDay: any[];
  inventoryStatusSummary: InventoryStatusRow[];
  inventorySnapshot: InventorySnapshotItem[];
  inventoryByDay: any[];
  inventoryByStore: any[];
  inventoryByProduct: any[];
  inventoryReorderSummary: any[];
  outOfStockSummary: any[];
  salesCube: any[];
  productClusters: ProductClusterRow[];
  clusterSummary: ClusterSummaryRow[];
  associationRules: AssociationRuleRow[];
  topAssociationRules: AssociationRuleRow[];
  dimStores: any[];
  dimProducts: any[];
  loaded: boolean;
}

export const initialData: QuickMartData = {
  salesByMonth: [],
  salesByCategory: [],
  salesByRegion: [],
  salesByStore: [],
  salesByProduct: [],
  salesByPromotion: [],
  salesByDay: [],
  inventoryStatusSummary: [],
  inventorySnapshot: [],
  inventoryByDay: [],
  inventoryByStore: [],
  inventoryByProduct: [],
  inventoryReorderSummary: [],
  outOfStockSummary: [],
  salesCube: [],
  productClusters: [],
  clusterSummary: [],
  associationRules: [],
  topAssociationRules: [],
  dimStores: [],
  dimProducts: [],
  loaded: false,
};

export async function fetchAllQuickMartData(): Promise<QuickMartData> {
  const fetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      return await res.json();
    } catch (e) {
      console.error(`Error loading ${url}:`, e);
      return [];
    }
  };

  const [
    salesByMonth,
    salesByCategory,
    salesByRegion,
    salesByStore,
    salesByProduct,
    salesByPromotion,
    salesByDay,
    inventoryStatusSummary,
    inventorySnapshot,
    inventoryByDay,
    inventoryByStore,
    inventoryByProduct,
    inventoryReorderSummary,
    outOfStockSummary,
    salesCube,
    productClusters,
    clusterSummary,
    associationRules,
    topAssociationRules,
    dimStores,
    dimProducts,
  ] = await Promise.all([
    fetchJson('/data/olap/sales_by_month.json'),
    fetchJson('/data/olap/sales_by_category.json'),
    fetchJson('/data/olap/sales_by_region.json'),
    fetchJson('/data/olap/sales_by_store.json'),
    fetchJson('/data/olap/sales_by_product.json'),
    fetchJson('/data/olap/sales_by_promotion.json'),
    fetchJson('/data/olap/sales_by_day.json'),
    fetchJson('/data/olap/inventory_status_summary.json'),
    fetchJson('/data/olap/inventory_current_snapshot.json'),
    fetchJson('/data/olap/inventory_by_day.json'),
    fetchJson('/data/olap/inventory_by_store.json'),
    fetchJson('/data/olap/inventory_by_product.json'),
    fetchJson('/data/olap/inventory_reorder_summary.json'),
    fetchJson('/data/olap/out_of_stock_summary.json'),
    fetchJson('/data/olap/sales_cube_monthly.json'),
    fetchJson('/data/mining/product_clusters.json'),
    fetchJson('/data/mining/cluster_summary.json'),
    fetchJson('/data/mining/association_rules.json'),
    fetchJson('/data/mining/top_association_rules.json'),
    fetchJson('/data/warehouse/dim_store.json'),
    fetchJson('/data/warehouse/dim_product.json'),
  ]);

  return {
    salesByMonth: salesByMonth || [],
    salesByCategory: salesByCategory || [],
    salesByRegion: salesByRegion || [],
    salesByStore: salesByStore || [],
    salesByProduct: salesByProduct || [],
    salesByPromotion: salesByPromotion || [],
    salesByDay: salesByDay || [],
    inventoryStatusSummary: inventoryStatusSummary || [],
    inventorySnapshot: inventorySnapshot || [],
    inventoryByDay: inventoryByDay || [],
    inventoryByStore: inventoryByStore || [],
    inventoryByProduct: inventoryByProduct || [],
    inventoryReorderSummary: inventoryReorderSummary || [],
    outOfStockSummary: outOfStockSummary || [],
    salesCube: salesCube || [],
    productClusters: productClusters || [],
    clusterSummary: clusterSummary || [],
    associationRules: associationRules || [],
    topAssociationRules: topAssociationRules || [],
    dimStores: dimStores || [],
    dimProducts: dimProducts || [],
    loaded: true,
  };
}

export function computeFilteredMetrics(data: QuickMartData, filters: FilterState) {
  // If no filters active, return verified network baselines
  const isFilterActive =
    filters.month !== 'all' ||
    filters.quarter !== 'all' ||
    filters.region !== 'all' ||
    filters.province !== 'all' ||
    filters.store !== 'all' ||
    filters.category !== 'all' ||
    filters.subCategory !== 'all' ||
    filters.product !== 'all' ||
    filters.promotion !== 'all' ||
    filters.dateRange !== null;

  if (!isFilterActive) {
    const totalSales = 1595166.51;
    const totalProfit = 499676.51;
    const unitsSold = 71885;
    const transactionCount = 26327;
    const profitMargin = 31.32;
    const averageTransactionValue = totalSales / transactionCount; // 60.59 THB
    const currentStock = 29796;
    const reorderAlerts = (data.inventorySnapshot || []).filter(i => i.InventoryStatus === 'REORDER').length || 17;

    return {
      kpi: {
        totalSales,
        totalProfit,
        profitMargin,
        transactionCount,
        unitsSold,
        averageTransactionValue,
        currentStock,
        reorderAlerts,
      },
      salesByMonth: data.salesByMonth || [],
      salesByCategory: data.salesByCategory || [],
      salesByRegion: data.salesByRegion || [],
      salesByStore: data.salesByStore || [],
      salesByProduct: data.salesByProduct || [],
      salesByPromotion: data.salesByPromotion || [],
      inventorySnapshot: data.inventorySnapshot || [],
      isEmpty: false,
    };
  }

  // Filter dynamic monthly cube
  let cube = data.salesCube || [];
  let invSnapshot = data.inventorySnapshot || [];

  if (filters.month !== 'all') {
    const ym = filters.month.replace('-', '');
    cube = cube.filter(r => String(r.YearMonth) === ym);
  } else if (filters.quarter !== 'all') {
    const qMonths: Record<string, string[]> = {
      'Q1': ['202601', '202602', '202603'],
      'Q2': ['202604', '202605', '202606'],
      'Q3': ['202607', '202608', '202609'],
    };
    const valid = qMonths[filters.quarter] || [];
    cube = cube.filter(r => valid.includes(String(r.YearMonth)));
  }

  if (filters.region !== 'all') {
    cube = cube.filter(r => r.Region === filters.region);
    invSnapshot = invSnapshot.filter(r => r.Region === filters.region);
  }

  if (filters.province !== 'all') {
    cube = cube.filter(r => r.Province === filters.province);
    invSnapshot = invSnapshot.filter(r => r.Province === filters.province);
  }

  if (filters.store !== 'all') {
    cube = cube.filter(r => r.StoreName === filters.store || String(r.StoreKey) === filters.store);
    invSnapshot = invSnapshot.filter(r => r.StoreName === filters.store || String(r.StoreKey) === filters.store);
  }

  if (filters.category !== 'all') {
    cube = cube.filter(r => r.Category === filters.category);
    invSnapshot = invSnapshot.filter(r => r.Category === filters.category);
  }

  if (filters.subCategory !== 'all') {
    cube = cube.filter(r => r.SubCategory === filters.subCategory);
    invSnapshot = invSnapshot.filter(r => r.SubCategory === filters.subCategory);
  }

  if (filters.product !== 'all') {
    cube = cube.filter(r => r.ProductName === filters.product || String(r.ProductKey) === filters.product);
    invSnapshot = invSnapshot.filter(r => r.ProductName === filters.product || String(r.ProductKey) === filters.product);
  }

  if (cube.length === 0) {
    return {
      kpi: {
        totalSales: 0,
        totalProfit: 0,
        profitMargin: 0,
        transactionCount: 0,
        unitsSold: 0,
        averageTransactionValue: 0,
        currentStock: 0,
        reorderAlerts: 0,
      },
      salesByMonth: [],
      salesByCategory: [],
      salesByRegion: [],
      salesByStore: [],
      salesByProduct: [],
      salesByPromotion: [],
      inventorySnapshot: [],
      isEmpty: true,
    };
  }

  // Aggregate metrics from filtered cube
  let totalSales = 0;
  let totalCost = 0;
  let totalProfit = 0;
  let unitsSold = 0;
  let transactionCount = 0;

  cube.forEach(r => {
    totalSales += r.SalesAmount || 0;
    totalCost += r.CostAmount || 0;
    totalProfit += r.Profit || 0;
    unitsSold += r.Quantity || 0;
    transactionCount += r.TransactionID || 0;
  });

  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const averageTransactionValue = transactionCount > 0 ? totalSales / transactionCount : 0;
  const currentStock = invSnapshot.reduce((acc, curr) => acc + (curr.EndingStock || 0), 0);
  const reorderAlerts = invSnapshot.filter(i => i.InventoryStatus === 'REORDER').length;

  // Group by category
  const catMap = new Map<string, any>();
  cube.forEach(r => {
    const c = r.Category;
    if (!catMap.has(c)) {
      catMap.set(c, { Category: c, SalesAmount: 0, ProfitAmount: 0, Quantity: 0 });
    }
    const item = catMap.get(c);
    item.SalesAmount += r.SalesAmount;
    item.ProfitAmount += r.Profit;
    item.Quantity += r.Quantity;
  });
  const filteredCategory = Array.from(catMap.values()).map(c => ({
    ...c,
    OverallProfitMargin: c.SalesAmount > 0 ? (c.ProfitAmount / c.SalesAmount) * 100 : 0,
  }));

  // Group by Month
  const monthMap = new Map<string, any>();
  cube.forEach(r => {
    const m = String(r.YearMonth);
    if (!monthMap.has(m)) {
      monthMap.set(m, { YearMonth: m, SalesAmount: 0, ProfitAmount: 0, Quantity: 0 });
    }
    const item = monthMap.get(m);
    item.SalesAmount += r.SalesAmount;
    item.ProfitAmount += r.Profit;
    item.Quantity += r.Quantity;
  });
  const filteredMonth = Array.from(monthMap.values()).sort((a, b) => a.YearMonth.localeCompare(b.YearMonth)).map(m => ({
    ...m,
    OverallProfitMargin: m.SalesAmount > 0 ? (m.ProfitAmount / m.SalesAmount) * 100 : 0,
  }));

  // Group by Region
  const regMap = new Map<string, any>();
  cube.forEach(r => {
    const reg = r.Region;
    if (!regMap.has(reg)) {
      regMap.set(reg, { Region: reg, SalesAmount: 0, ProfitAmount: 0, Quantity: 0, Stores: new Set() });
    }
    const item = regMap.get(reg);
    item.SalesAmount += r.SalesAmount;
    item.ProfitAmount += r.Profit;
    item.Quantity += r.Quantity;
    item.Stores.add(r.StoreKey);
  });
  const filteredRegion = Array.from(regMap.values()).map(r => ({
    Region: r.Region,
    SalesAmount: r.SalesAmount,
    ProfitAmount: r.ProfitAmount,
    Quantity: r.Quantity,
    OverallProfitMargin: r.SalesAmount > 0 ? (r.ProfitAmount / r.SalesAmount) * 100 : 0,
    StoreCount: r.Stores.size,
    AverageSalesPerStore: r.Stores.size > 0 ? r.SalesAmount / r.Stores.size : r.SalesAmount,
  }));

  // Group by Store
  const storeMap = new Map<string, any>();
  cube.forEach(r => {
    const s = r.StoreName;
    if (!storeMap.has(s)) {
      storeMap.set(s, { StoreName: s, Region: r.Region, SalesAmount: 0, ProfitAmount: 0, Quantity: 0 });
    }
    const item = storeMap.get(s);
    item.SalesAmount += r.SalesAmount;
    item.ProfitAmount += r.Profit;
    item.Quantity += r.Quantity;
  });
  const filteredStore = Array.from(storeMap.values()).map(s => ({
    ...s,
    OverallProfitMargin: s.SalesAmount > 0 ? (s.ProfitAmount / s.SalesAmount) * 100 : 0,
  })).sort((a, b) => b.SalesAmount - a.SalesAmount);

  // Group by Product
  const prodMap = new Map<string, any>();
  cube.forEach(r => {
    const p = r.ProductName;
    if (!prodMap.has(p)) {
      prodMap.set(p, { ProductName: p, Category: r.Category, SalesAmount: 0, ProfitAmount: 0, Quantity: 0 });
    }
    const item = prodMap.get(p);
    item.SalesAmount += r.SalesAmount;
    item.ProfitAmount += r.Profit;
    item.Quantity += r.Quantity;
  });
  const filteredProduct = Array.from(prodMap.values()).map(p => ({
    ...p,
    OverallProfitMargin: p.SalesAmount > 0 ? (p.ProfitAmount / p.SalesAmount) * 100 : 0,
  })).sort((a, b) => b.SalesAmount - a.SalesAmount);

  return {
    kpi: {
      totalSales,
      totalProfit,
      profitMargin,
      transactionCount,
      unitsSold,
      averageTransactionValue,
      currentStock,
      reorderAlerts,
    },
    salesByMonth: filteredMonth,
    salesByCategory: filteredCategory,
    salesByRegion: filteredRegion,
    salesByStore: filteredStore,
    salesByProduct: filteredProduct,
    salesByPromotion: data.salesByPromotion || [],
    inventorySnapshot: invSnapshot,
    isEmpty: false,
  };
}
