"""
Module: olap_engine.py
Project: Retail Insight DSS - QuickMart (Phase 4)
Core OLAP Engine that loads the Data Warehouse into unified Multi-dimensional Cubes
and provides low-level Slicing, Dicing, Roll-up, and Drill-down capabilities.
"""

import os
import pandas as pd
from typing import Dict, List, Optional, Union, Any


class QuickMartOLAPEngine:
    def __init__(self, warehouse_dir: Optional[str] = None):
        if warehouse_dir is None:
            # Default to quickmart-dss/data/warehouse or data_warehouse
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            cand1 = os.path.join(curr_dir, "..", "data", "warehouse")
            cand2 = os.path.join(curr_dir, "..", "..", "data_warehouse")
            if os.path.exists(cand1):
                self.warehouse_dir = os.path.abspath(cand1)
            elif os.path.exists(cand2):
                self.warehouse_dir = os.path.abspath(cand2)
            else:
                raise FileNotFoundError("Data Warehouse directory not found.")
        else:
            self.warehouse_dir = warehouse_dir

        self.dim_date: pd.DataFrame = None
        self.dim_product: pd.DataFrame = None
        self.dim_store: pd.DataFrame = None
        self.dim_promotion: pd.DataFrame = None
        self.fact_sales: pd.DataFrame = None
        self.fact_inventory: pd.DataFrame = None

        self.sales_cube: pd.DataFrame = None
        self.inventory_cube: pd.DataFrame = None

        self._load_data()
        self._build_cubes()

    def _load_data(self):
        """Loads all Star Schema CSV tables into DataFrames with proper datatypes."""
        self.dim_date = pd.read_csv(os.path.join(self.warehouse_dir, "dim_date.csv"))
        self.dim_product = pd.read_csv(os.path.join(self.warehouse_dir, "dim_product.csv"))
        self.dim_store = pd.read_csv(os.path.join(self.warehouse_dir, "dim_store.csv"))
        self.dim_promotion = pd.read_csv(os.path.join(self.warehouse_dir, "dim_promotion.csv"))
        self.fact_sales = pd.read_csv(os.path.join(self.warehouse_dir, "fact_sales.csv"))
        self.fact_inventory = pd.read_csv(os.path.join(self.warehouse_dir, "fact_inventory.csv"))

        # Explicit type conversions for accuracy
        self.fact_sales["Quantity"] = self.fact_sales["Quantity"].astype(int)
        self.fact_sales["UnitPrice"] = self.fact_sales["UnitPrice"].astype(float)
        self.fact_sales["Discount"] = self.fact_sales["Discount"].astype(float)
        self.fact_sales["SalesAmount"] = self.fact_sales["SalesAmount"].astype(float)
        self.fact_sales["UnitCost"] = self.fact_sales["UnitCost"].astype(float)
        self.fact_sales["CostAmount"] = self.fact_sales["CostAmount"].astype(float)
        self.fact_sales["Profit"] = self.fact_sales["Profit"].astype(float)
        self.fact_sales["ProfitMargin"] = self.fact_sales["ProfitMargin"].astype(float)

        self.fact_inventory["BeginningStock"] = self.fact_inventory["BeginningStock"].astype(int)
        self.fact_inventory["StockIn"] = self.fact_inventory["StockIn"].astype(int)
        self.fact_inventory["StockOut"] = self.fact_inventory["StockOut"].astype(int)
        self.fact_inventory["EndingStock"] = self.fact_inventory["EndingStock"].astype(int)
        self.fact_inventory["ReorderPoint"] = self.fact_inventory["ReorderPoint"].astype(int)
        self.fact_inventory["MaxStockLevel"] = self.fact_inventory["MaxStockLevel"].astype(int)

    def _build_cubes(self):
        """
        Builds joined dimensional cubes for Sales and Inventory.
        Maintains granular Fact grain with all Conformed Dimension attributes attached.
        """
        # 1. Sales Multi-dimensional Cube
        sales = self.fact_sales.merge(self.dim_date, on="DateKey", how="inner")
        sales = sales.merge(self.dim_product, on="ProductKey", how="inner", suffixes=("", "_prod"))
        sales = sales.merge(self.dim_store, on="StoreKey", how="inner", suffixes=("", "_store"))
        sales = sales.merge(self.dim_promotion, on="PromotionKey", how="inner", suffixes=("", "_promo"))
        self.sales_cube = sales

        # 2. Inventory Multi-dimensional Cube
        inv = self.fact_inventory.merge(self.dim_date, on="DateKey", how="inner")
        inv = inv.merge(self.dim_product, on="ProductKey", how="inner", suffixes=("", "_prod"))
        inv = inv.merge(self.dim_store, on="StoreKey", how="inner", suffixes=("", "_store"))
        self.inventory_cube = inv

    def get_sales_grand_totals(self) -> Dict[str, Any]:
        """Calculates true Grand Totals for Sales Cube."""
        total_sales = round(float(self.sales_cube["SalesAmount"].sum()), 2)
        total_cost = round(float(self.sales_cube["CostAmount"].sum()), 2)
        total_profit = round(float(self.sales_cube["Profit"].sum()), 2)
        total_qty = int(self.sales_cube["Quantity"].sum())
        total_txns = int(self.sales_cube["TransactionID"].nunique())
        atv = round(total_sales / total_txns, 2) if total_txns > 0 else 0.0
        # Weighted Overall Profit Margin
        overall_margin = round((total_profit / total_sales) * 100.0, 2) if total_sales > 0 else 0.0

        return {
            "TotalSales": total_sales,
            "TotalCost": total_cost,
            "TotalProfit": total_profit,
            "TotalQuantity": total_qty,
            "TransactionCount": total_txns,
            "AverageTransactionValue": atv,
            "OverallProfitMargin": overall_margin,
            "RowCount": len(self.sales_cube)
        }

    def filter_cube(self, cube: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
        """Applies equality, containment (in), or range filters to a cube."""
        df = cube.copy()
        for col, val in filters.items():
            if col not in df.columns:
                continue
            if isinstance(val, (list, set, tuple)):
                df = df[df[col].isin(val)]
            elif isinstance(val, dict) and ("gte" in val or "lte" in val):
                if "gte" in val:
                    df = df[df[col] >= val["gte"]]
                if "lte" in val:
                    df = df[df[col] <= val["lte"]]
            elif isinstance(val, tuple) and len(val) == 2 and val[0] == "!=":
                df = df[df[col] != val[1]]
            else:
                df = df[df[col] == val]
        return df
