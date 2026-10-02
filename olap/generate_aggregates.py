"""
Module: generate_aggregates.py
Project: Retail Insight DSS - QuickMart (Phase 4)
Generates 14 Pre-Aggregated OLAP tables ready for high-performance Dashboard serving.
"""

import os
import pandas as pd
from olap_engine import QuickMartOLAPEngine
from sales_olap import SalesOLAP
from inventory_olap import InventoryOLAP


def generate_all_aggregates():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    olap_dir = os.path.join(base_dir, "data", "olap")
    os.makedirs(olap_dir, exist_ok=True)

    print("Initializing OLAP Engine...")
    engine = QuickMartOLAPEngine()
    sales_olap = SalesOLAP(engine)
    inv_olap = InventoryOLAP(engine)

    print("Generating Sales Pre-Aggregated Tables...")

    # 1. sales_by_day.csv
    s_day = sales_olap.aggregate_by(["DateKey", "FullDate", "DayOfWeek", "DayName", "IsWeekend"])
    s_day.to_csv(os.path.join(olap_dir, "sales_by_day.csv"), index=False)
    print(f"  [OK] sales_by_day.csv ({len(s_day)} rows)")

    # 2. sales_by_month.csv
    s_month = sales_olap.aggregate_by(["Year", "Month", "MonthName", "Quarter"])
    s_month.sort_values(by=["Year", "Month"], inplace=True)
    s_month.to_csv(os.path.join(olap_dir, "sales_by_month.csv"), index=False)
    print(f"  [OK] sales_by_month.csv ({len(s_month)} rows)")

    # 3. sales_by_quarter.csv
    s_qtr = sales_olap.aggregate_by(["Year", "Quarter"])
    s_qtr.sort_values(by=["Year", "Quarter"], inplace=True)
    s_qtr.to_csv(os.path.join(olap_dir, "sales_by_quarter.csv"), index=False)
    print(f"  [OK] sales_by_quarter.csv ({len(s_qtr)} rows)")

    # 4. sales_by_product.csv
    s_prod = sales_olap.aggregate_by(["ProductKey", "ProductID", "ProductName", "Category", "SubCategory", "Brand"])
    s_prod.sort_values(by="TotalSales", ascending=False, inplace=True)
    s_prod.to_csv(os.path.join(olap_dir, "sales_by_product.csv"), index=False)
    print(f"  [OK] sales_by_product.csv ({len(s_prod)} rows)")

    # 5. sales_by_category.csv
    s_cat = sales_olap.aggregate_by(["Category"])
    s_cat.sort_values(by="TotalSales", ascending=False, inplace=True)
    s_cat.to_csv(os.path.join(olap_dir, "sales_by_category.csv"), index=False)
    print(f"  [OK] sales_by_category.csv ({len(s_cat)} rows)")

    # 6. sales_by_store.csv
    s_store = sales_olap.aggregate_by(["StoreKey", "StoreID", "StoreName", "Region", "Province", "StoreType"])
    s_store.sort_values(by="TotalSales", ascending=False, inplace=True)
    s_store.to_csv(os.path.join(olap_dir, "sales_by_store.csv"), index=False)
    print(f"  [OK] sales_by_store.csv ({len(s_store)} rows)")

    # 7. sales_by_region.csv
    s_reg = sales_olap.aggregate_by(["Region"])
    s_reg.sort_values(by="TotalSales", ascending=False, inplace=True)
    s_reg.to_csv(os.path.join(olap_dir, "sales_by_region.csv"), index=False)
    print(f"  [OK] sales_by_region.csv ({len(s_reg)} rows)")

    # 8. sales_by_promotion.csv
    s_prm = sales_olap.aggregate_by(["PromotionKey", "PromotionID", "PromotionName", "PromotionType", "DiscountPercent"])
    s_prm.sort_values(by="TotalSales", ascending=False, inplace=True)
    s_prm.to_csv(os.path.join(olap_dir, "sales_by_promotion.csv"), index=False)
    print(f"  [OK] sales_by_promotion.csv ({len(s_prm)} rows)")

    print("\nGenerating Inventory Pre-Aggregated Tables...")

    # 9. inventory_by_day.csv
    inv_day = inv_olap.aggregate_by(["DateKey", "FullDate", "IsWeekend"])
    inv_day.sort_values(by="DateKey", inplace=True)
    inv_day.to_csv(os.path.join(olap_dir, "inventory_by_day.csv"), index=False)
    print(f"  [OK] inventory_by_day.csv ({len(inv_day)} rows)")

    # 10. inventory_by_product.csv
    inv_prod = inv_olap.aggregate_by(["ProductKey", "ProductID", "ProductName", "Category", "SubCategory", "ReorderPoint", "MaxStockLevel"])
    inv_prod.sort_values(by="ReorderCount", ascending=False, inplace=True)
    inv_prod.to_csv(os.path.join(olap_dir, "inventory_by_product.csv"), index=False)
    print(f"  [OK] inventory_by_product.csv ({len(inv_prod)} rows)")

    # 11. inventory_by_store.csv
    inv_store = inv_olap.aggregate_by(["StoreKey", "StoreID", "StoreName", "Region", "Province"])
    inv_store.sort_values(by="OutOfStockCount", ascending=False, inplace=True)
    inv_store.to_csv(os.path.join(olap_dir, "inventory_by_store.csv"), index=False)
    print(f"  [OK] inventory_by_store.csv ({len(inv_store)} rows)")

    # 12. inventory_status_summary.csv
    status_summary = engine.inventory_cube.groupby("InventoryStatus").agg(
        SnapshotCount=("InventoryKey", "count"),
        AverageStock=("EndingStock", "mean"),
        TotalStockIn=("StockIn", "sum"),
        TotalStockOut=("StockOut", "sum")
    ).reset_index()
    status_summary["Percentage"] = ((status_summary["SnapshotCount"] / len(engine.inventory_cube)) * 100.0).round(2)
    status_summary["AverageStock"] = status_summary["AverageStock"].round(2)
    status_summary.to_csv(os.path.join(olap_dir, "inventory_status_summary.csv"), index=False)
    print(f"  [OK] inventory_status_summary.csv ({len(status_summary)} rows)")

    # 13. inventory_reorder_summary.csv (Aggregated per Product & Store where status was REORDER)
    reorder_df = engine.inventory_cube[engine.inventory_cube["InventoryStatus"] == "REORDER"]
    reorder_summary = reorder_df.groupby(["ProductKey", "ProductID", "ProductName", "Category", "StoreKey", "StoreName", "Region"]).agg(
        ReorderFrequency=("InventoryKey", "count"),
        AvgEndingStockDuringReorder=("EndingStock", "mean"),
        ReorderPoint=("ReorderPoint", "first"),
        MaxStockLevel=("MaxStockLevel", "first")
    ).reset_index()
    reorder_summary["AvgEndingStockDuringReorder"] = reorder_summary["AvgEndingStockDuringReorder"].round(2)
    reorder_summary.sort_values(by="ReorderFrequency", ascending=False, inplace=True)
    reorder_summary.to_csv(os.path.join(olap_dir, "inventory_reorder_summary.csv"), index=False)
    print(f"  [OK] inventory_reorder_summary.csv ({len(reorder_summary)} rows)")

    # 14. out_of_stock_summary.csv (Detailed incidents of stockouts)
    oos_df = engine.inventory_cube[engine.inventory_cube["InventoryStatus"] == "OUT OF STOCK"]
    oos_summary = oos_df.groupby(["ProductKey", "ProductID", "ProductName", "Category", "StoreKey", "StoreName", "Region"]).agg(
        OutOfStockDays=("InventoryKey", "count"),
        TotalStockOutLost=("StockOut", "sum")
    ).reset_index()
    oos_summary.sort_values(by="OutOfStockDays", ascending=False, inplace=True)
    oos_summary.to_csv(os.path.join(olap_dir, "out_of_stock_summary.csv"), index=False)
    print(f"  [OK] out_of_stock_summary.csv ({len(oos_summary)} rows)")

    print("\nAll 14 OLAP Pre-Aggregated tables generated successfully in:", olap_dir)


if __name__ == "__main__":
    generate_all_aggregates()
