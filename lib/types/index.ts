export interface FilterState {
  dateRange: [string, string] | null;
  month: string;
  quarter: string;
  region: string;
  province: string;
  store: string;
  category: string;
  subCategory: string;
  product: string;
  promotion: string;
}

export interface KPIData {
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
  transactionCount: number;
  unitsSold: number;
  averageTransactionValue: number;
  currentStock: number;
  reorderAlerts: number;
}

export interface SalesByMonthRow {
  YearMonth: string;
  Year: number;
  Month: number;
  MonthName: string;
  SalesAmount: number;
  CostAmount: number;
  ProfitAmount: number;
  Quantity: number;
  DistinctTransactions: number;
  AverageTransactionValue: number;
  OverallProfitMargin: number;
}

export interface SalesByCategoryRow {
  Category: string;
  SalesAmount: number;
  CostAmount: number;
  ProfitAmount: number;
  Quantity: number;
  DistinctTransactions: number;
  AverageTransactionValue: number;
  OverallProfitMargin: number;
}

export interface SalesByRegionRow {
  Region: string;
  SalesAmount: number;
  CostAmount: number;
  ProfitAmount: number;
  Quantity: number;
  DistinctTransactions: number;
  AverageTransactionValue: number;
  OverallProfitMargin: number;
  StoreCount?: number;
  AverageSalesPerStore?: number;
}

export interface SalesByStoreRow {
  StoreKey: number;
  StoreID: string;
  StoreName: string;
  Region: string;
  Province: string;
  StoreType: string;
  SalesAmount: number;
  CostAmount: number;
  ProfitAmount: number;
  Quantity: number;
  DistinctTransactions: number;
  AverageTransactionValue: number;
  OverallProfitMargin: number;
}

export interface SalesByProductRow {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category: string;
  SubCategory: string;
  Brand: string;
  UnitPrice: number;
  SalesAmount: number;
  CostAmount: number;
  ProfitAmount: number;
  Quantity: number;
  DistinctTransactions: number;
  AverageTransactionValue: number;
  OverallProfitMargin: number;
}

export interface SalesByPromotionRow {
  PromotionKey: number;
  PromotionName: string;
  DiscountType: string;
  DiscountRate: number;
  SalesAmount: number;
  CostAmount: number;
  ProfitAmount: number;
  Quantity: number;
  DistinctTransactions: number;
  AverageTransactionValue: number;
  OverallProfitMargin: number;
}

export interface InventoryStatusRow {
  InventoryStatus: string;
  SnapshotCount: number;
  AverageStock: number;
  TotalStockIn: number;
  TotalStockOut: number;
  Percentage: number;
}

export interface InventorySnapshotItem {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category: string;
  SubCategory: string;
  StoreKey: number;
  StoreID: string;
  StoreName: string;
  Region: string;
  Province: string;
  EndingStock: number;
  ReorderPoint: number;
  MaxStockLevel: number;
  InventoryStatus: 'NORMAL' | 'REORDER' | 'OVERSTOCK' | 'OUT OF STOCK';
  Cluster: number;
  ClusterBusinessLabel: string;
  SuggestedReviewPriority: string;
}

export interface ProductClusterRow {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category: string;
  SubCategory: string;
  Brand: string;
  UnitPrice: number;
  UnitCost: number;
  ReorderPoint: number;
  MaxStockLevel: number;
  TotalQuantitySold: number;
  TotalRevenue: number;
  TotalProfit: number;
  OverallProfitMargin: number;
  Cluster: number;
  ClusterBusinessLabel: string;
}

export interface ClusterSummaryRow {
  Cluster: number;
  ProductCount: number;
  AverageQuantity: number;
  AverageRevenue: number;
  AverageProfitMargin: number;
  BusinessLabel: string;
  BusinessInterpretation: string;
}

export interface AssociationRuleRow {
  AntecedentProducts: string;
  ConsequentProducts: string;
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number;
}

export interface DSSInsight {
  title: string;
  evidence: string;
  interpretation: string;
  suggestedAction: string;
  evidenceType: 'Descriptive / OLAP' | 'Clustering' | 'Association Rule';
  severity: 'info' | 'warning' | 'success' | 'alert';
}
