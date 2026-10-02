"""
Module: sales_olap.py
Project: Retail Insight DSS - QuickMart (Phase 4)
Handles Sales OLAP operations: Slice, Dice, Drill-down, Roll-up, and Metric Aggregations.
"""

import pandas as pd
from typing import Dict, List, Optional, Any, Union
from olap_engine import QuickMartOLAPEngine


class SalesOLAP:
    def __init__(self, engine: QuickMartOLAPEngine):
        self.engine = engine
        self.cube = engine.sales_cube

    def compute_measures(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculates standard business measures on any filtered slice or group."""
        if df.empty:
            return {
                "TotalSales": 0.0,
                "TotalCost": 0.0,
                "TotalProfit": 0.0,
                "TotalQuantity": 0,
                "TransactionCount": 0,
                "AverageTransactionValue": 0.0,
                "OverallProfitMargin": 0.0,
                "RowCount": 0
            }

        total_sales = round(float(df["SalesAmount"].sum()), 2)
        total_cost = round(float(df["CostAmount"].sum()), 2)
        total_profit = round(float(df["Profit"].sum()), 2)
        total_qty = int(df["Quantity"].sum())
        total_txns = int(df["TransactionID"].nunique())
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
            "RowCount": len(df)
        }

    def aggregate_by(self, group_cols: Union[str, List[str]], subset_df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
        """
        Aggregates measures across specified dimension column(s).
        Maintains distinct transaction counts and weighted profit margins.
        """
        df = subset_df if subset_df is not None else self.cube
        if isinstance(group_cols, str):
            group_cols = [group_cols]

        # Grouping aggregation
        agg_df = df.groupby(group_cols).agg(
            TotalSales=("SalesAmount", "sum"),
            TotalCost=("CostAmount", "sum"),
            TotalProfit=("Profit", "sum"),
            TotalQuantity=("Quantity", "sum"),
            TransactionCount=("TransactionID", "nunique"),
            LineItemCount=("SalesKey", "count")
        ).reset_index()

        agg_df["TotalSales"] = agg_df["TotalSales"].round(2)
        agg_df["TotalCost"] = agg_df["TotalCost"].round(2)
        agg_df["TotalProfit"] = agg_df["TotalProfit"].round(2)
        agg_df["AverageTransactionValue"] = (agg_df["TotalSales"] / agg_df["TransactionCount"]).round(2)
        agg_df["OverallProfitMargin"] = ((agg_df["TotalProfit"] / agg_df["TotalSales"]) * 100.0).round(2)

        return agg_df

    def slice_sales(self, dimension_col: str, filter_value: Any) -> Dict[str, Any]:
        """
        OLAP Slice Operation: Filters data along a SINGLE dimension axis.
        """
        filtered_df = self.engine.filter_cube(self.cube, {dimension_col: filter_value})
        measures = self.compute_measures(filtered_df)
        return {
            "Operation": "Slice",
            "Dimension": dimension_col,
            "FilterValue": filter_value,
            "Measures": measures,
            "DataFrame": filtered_df
        }

    def dice_sales(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        OLAP Dice Operation: Filters data across MULTIPLE dimension axes simultaneously.
        """
        filtered_df = self.engine.filter_cube(self.cube, filters)
        measures = self.compute_measures(filtered_df)
        return {
            "Operation": "Dice",
            "Filters": filters,
            "Measures": measures,
            "DataFrame": filtered_df
        }

    def drilldown_sales(self, hierarchy_type: str, current_level: str, next_level: str, parent_value: Any) -> pd.DataFrame:
        """
        OLAP Drill-down Operation: Navigates from higher summary level to finer detail level.
        Examples:
          - TIME: Quarter -> Month (e.g. Quarter=2 -> Months 4, 5, 6)
          - PRODUCT: Category -> SubCategory -> Product
          - LOCATION: Region -> Province -> Store
        """
        parent_filtered = self.cube[self.cube[current_level] == parent_value]
        group_levels = [current_level, next_level]
        result_df = self.aggregate_by(group_levels, subset_df=parent_filtered)
        return result_df.sort_values(by="TotalSales", ascending=False)

    def rollup_sales(self, hierarchy_type: str, from_level: str, to_level: str) -> pd.DataFrame:
        """
        OLAP Roll-up Operation: Aggregates finer granular data up to higher conceptual hierarchy.
        Examples:
          - TIME: Day -> Month -> Quarter
          - PRODUCT: Product -> SubCategory -> Category
          - LOCATION: Store -> Province -> Region
        """
        result_df = self.aggregate_by([to_level])
        return result_df.sort_values(by=to_level)
