"""
Module: inventory_olap.py
Project: Retail Insight DSS - QuickMart (Phase 4)
Handles Inventory OLAP operations and enforces Semi-Additive Measure principles.
"""

import pandas as pd
from typing import Dict, List, Optional, Any, Union
from olap_engine import QuickMartOLAPEngine


class InventoryOLAP:
    def __init__(self, engine: QuickMartOLAPEngine):
        self.engine = engine
        self.cube = engine.inventory_cube

    def compute_measures(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates inventory metrics respecting Semi-Additive rules.
        - StockIn and StockOut are fully additive.
        - EndingStock is semi-additive (averaged over time, not summed).
        - Current Ending Stock is the snapshot of the latest available DateKey in the slice.
        """
        if df.empty:
            return {
                "AverageEndingStock": 0.0,
                "CurrentEndingStock": 0,
                "TotalStockIn": 0,
                "TotalStockOut": 0,
                "OutOfStockCount": 0,
                "ReorderCount": 0,
                "OverstockCount": 0,
                "NormalCount": 0,
                "TotalSnapshots": 0
            }

        avg_ending_stock = round(float(df["EndingStock"].mean()), 2)
        total_stock_in = int(df["StockIn"].sum())
        total_stock_out = int(df["StockOut"].sum())

        # Point-in-time Ending Stock on latest date in selection
        max_date = df["DateKey"].max()
        latest_slice = df[df["DateKey"] == max_date]
        current_ending_stock = int(latest_slice["EndingStock"].sum())

        status_counts = df["InventoryStatus"].value_counts().to_dict()

        return {
            "AverageEndingStock": avg_ending_stock,
            "CurrentEndingStock": current_ending_stock,
            "LatestDateKey": int(max_date),
            "TotalStockIn": total_stock_in,
            "TotalStockOut": total_stock_out,
            "OutOfStockCount": int(status_counts.get("OUT OF STOCK", 0)),
            "ReorderCount": int(status_counts.get("REORDER", 0)),
            "OverstockCount": int(status_counts.get("OVERSTOCK", 0)),
            "NormalCount": int(status_counts.get("NORMAL", 0)),
            "TotalSnapshots": len(df)
        }

    def aggregate_by(self, group_cols: Union[str, List[str]], subset_df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
        """
        Aggregates inventory measures by specified dimension columns.
        Averages EndingStock over time, sums StockIn/StockOut, and tallies status counts.
        """
        df = subset_df if subset_df is not None else self.cube
        if isinstance(group_cols, str):
            group_cols = [group_cols]

        # Calculate base aggregations
        agg_df = df.groupby(group_cols).agg(
            AverageEndingStock=("EndingStock", "mean"),
            TotalStockIn=("StockIn", "sum"),
            TotalStockOut=("StockOut", "sum"),
            SnapshotCount=("InventoryKey", "count")
        ).reset_index()

        agg_df["AverageEndingStock"] = agg_df["AverageEndingStock"].round(2)

        # Count specific statuses
        status_pivot = df.pivot_table(
            index=group_cols,
            columns="InventoryStatus",
            values="InventoryKey",
            aggfunc="count",
            fill_value=0
        ).reset_index()

        for s in ["NORMAL", "REORDER", "OVERSTOCK", "OUT OF STOCK"]:
            if s not in status_pivot.columns:
                status_pivot[s] = 0

        # Merge status counts
        merged = agg_df.merge(status_pivot, on=group_cols, how="left")
        merged.rename(columns={
            "NORMAL": "NormalCount",
            "REORDER": "ReorderCount",
            "OVERSTOCK": "OverstockCount",
            "OUT OF STOCK": "OutOfStockCount"
        }, inplace=True)

        return merged

    def slice_inventory(self, dimension_col: str, filter_value: Any) -> Dict[str, Any]:
        """OLAP Slice Operation for Inventory Cube."""
        filtered_df = self.engine.filter_cube(self.cube, {dimension_col: filter_value})
        measures = self.compute_measures(filtered_df)
        return {
            "Operation": "Slice",
            "Dimension": dimension_col,
            "FilterValue": filter_value,
            "Measures": measures,
            "DataFrame": filtered_df
        }

    def dice_inventory(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """OLAP Dice Operation for Inventory Cube."""
        filtered_df = self.engine.filter_cube(self.cube, filters)
        measures = self.compute_measures(filtered_df)
        return {
            "Operation": "Dice",
            "Filters": filters,
            "Measures": measures,
            "DataFrame": filtered_df
        }

    def drilldown_inventory(self, current_level: str, next_level: str, parent_value: Any) -> pd.DataFrame:
        """OLAP Drill-down Operation for Inventory."""
        parent_filtered = self.cube[self.cube[current_level] == parent_value]
        group_levels = [current_level, next_level]
        result_df = self.aggregate_by(group_levels, subset_df=parent_filtered)
        return result_df.sort_values(by="TotalStockOut", ascending=False)

    def rollup_inventory(self, from_level: str, to_level: str) -> pd.DataFrame:
        """OLAP Roll-up Operation for Inventory."""
        result_df = self.aggregate_by([to_level])
        return result_df.sort_values(by=to_level)
