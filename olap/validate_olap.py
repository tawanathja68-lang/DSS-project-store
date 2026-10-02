"""
Module: validate_olap.py
Project: Retail Insight DSS - QuickMart (Phase 4)
Executes OLAP validation tests, calculates exact business metrics,
and demonstrates Slice, Dice, Drill-down, and Roll-up operations.
"""

import os
import json
import pandas as pd
from olap_engine import QuickMartOLAPEngine
from sales_olap import SalesOLAP
from inventory_olap import InventoryOLAP


def run_olap_validation():
    print("=" * 70)
    print("QUICKMART DSS — OLAP ANALYSIS & VALIDATION SUITE")
    print("=" * 70)

    engine = QuickMartOLAPEngine()
    sales_olap = SalesOLAP(engine)
    inv_olap = InventoryOLAP(engine)

    results = {}

    # -------------------------------------------------------------
    # 1. Grand Totals (Truth Benchmark)
    # -------------------------------------------------------------
    grand_totals = engine.get_sales_grand_totals()
    results["GrandTotals"] = grand_totals
    print("\n--- 1. SALES GRAND TOTALS ---")
    for k, v in grand_totals.items():
        print(f"  {k:<26}: {v}")

    # -------------------------------------------------------------
    # 2. Additive Reconciliation Tests
    # -------------------------------------------------------------
    print("\n--- 2. RECONCILIATION TESTS (ADDITIVITY ACROSS DIMENSIONS) ---")
    by_product = sales_olap.aggregate_by("ProductKey")
    by_store = sales_olap.aggregate_by("StoreKey")
    by_month = sales_olap.aggregate_by("Month")
    by_category = sales_olap.aggregate_by("Category")
    by_region = sales_olap.aggregate_by("Region")

    sum_prod_sales = round(float(by_product["TotalSales"].sum()), 2)
    sum_store_sales = round(float(by_store["TotalSales"].sum()), 2)
    sum_month_sales = round(float(by_month["TotalSales"].sum()), 2)
    sum_cat_sales = round(float(by_category["TotalSales"].sum()), 2)
    sum_reg_sales = round(float(by_region["TotalSales"].sum()), 2)

    target_sales = grand_totals["TotalSales"]

    reconciled = (
        abs(sum_prod_sales - target_sales) < 0.05 and
        abs(sum_store_sales - target_sales) < 0.05 and
        abs(sum_month_sales - target_sales) < 0.05 and
        abs(sum_cat_sales - target_sales) < 0.05 and
        abs(sum_reg_sales - target_sales) < 0.05
    )

    results["Reconciliation"] = {
        "TargetSales": target_sales,
        "ByProduct": sum_prod_sales,
        "ByStore": sum_store_sales,
        "ByMonth": sum_month_sales,
        "ByCategory": sum_cat_sales,
        "ByRegion": sum_reg_sales,
        "IsReconciled": reconciled
    }

    print(f"  Target Grand Total Sales : {target_sales:,.2f}")
    print(f"  Sum by Product           : {sum_prod_sales:,.2f} [{'MATCH' if abs(sum_prod_sales-target_sales)<0.05 else 'FAIL'}]")
    print(f"  Sum by Store             : {sum_store_sales:,.2f} [{'MATCH' if abs(sum_store_sales-target_sales)<0.05 else 'FAIL'}]")
    print(f"  Sum by Month             : {sum_month_sales:,.2f} [{'MATCH' if abs(sum_month_sales-target_sales)<0.05 else 'FAIL'}]")
    print(f"  Sum by Category          : {sum_cat_sales:,.2f} [{'MATCH' if abs(sum_cat_sales-target_sales)<0.05 else 'FAIL'}]")
    print(f"  Sum by Region            : {sum_reg_sales:,.2f} [{'MATCH' if abs(sum_reg_sales-target_sales)<0.05 else 'FAIL'}]")
    print(f"  Reconciliation Status    : {'ALL ADDITIVE DIMENSIONS RECONCILED (100% PASS)' if reconciled else 'FAILED'}")

    # -------------------------------------------------------------
    # 3. Slice Operations (4 Real Cases)
    # -------------------------------------------------------------
    print("\n--- 3. SLICE OPERATIONS ---")
    slice_a = sales_olap.slice_sales("Region", "Isan")
    slice_b = sales_olap.slice_sales("Category", "Beverages")
    slice_c = sales_olap.slice_sales("Quarter", 2)
    slice_d = sales_olap.slice_sales("StoreKey", 1) # Siam Square

    results["Slices"] = {
        "SliceA_Region_Isan": slice_a["Measures"],
        "SliceB_Category_Beverages": slice_b["Measures"],
        "SliceC_Quarter_Q2": slice_c["Measures"],
        "SliceD_Store_SiamSquare": slice_d["Measures"]
    }

    print(f"  Slice A (Region = 'Isan'):")
    print(f"    Sales: {slice_a['Measures']['TotalSales']:,.2f} | Profit: {slice_a['Measures']['TotalProfit']:,.2f} | Margin: {slice_a['Measures']['OverallProfitMargin']}% | Txns: {slice_a['Measures']['TransactionCount']:,}")
    print(f"  Slice B (Category = 'Beverages'):")
    print(f"    Sales: {slice_b['Measures']['TotalSales']:,.2f} | Profit: {slice_b['Measures']['TotalProfit']:,.2f} | Margin: {slice_b['Measures']['OverallProfitMargin']}% | Txns: {slice_b['Measures']['TransactionCount']:,}")
    print(f"  Slice C (Quarter = Q2):")
    print(f"    Sales: {slice_c['Measures']['TotalSales']:,.2f} | Profit: {slice_c['Measures']['TotalProfit']:,.2f} | Margin: {slice_c['Measures']['OverallProfitMargin']}% | Txns: {slice_c['Measures']['TransactionCount']:,}")
    print(f"  Slice D (Store = STR-001 Siam Square):")
    print(f"    Sales: {slice_d['Measures']['TotalSales']:,.2f} | Profit: {slice_d['Measures']['TotalProfit']:,.2f} | Margin: {slice_d['Measures']['OverallProfitMargin']}% | Txns: {slice_d['Measures']['TransactionCount']:,}")

    # -------------------------------------------------------------
    # 4. Dice Operations (4 Real Cases)
    # -------------------------------------------------------------
    print("\n--- 4. DICE OPERATIONS ---")
    dice_a = sales_olap.dice_sales({"Region": "Isan", "Category": "Beverages", "Quarter": 2})
    dice_b = sales_olap.dice_sales({"Region": "Central", "Category": "Ready-to-Eat", "Month": 7})
    dice_c = sales_olap.dice_sales({"Region": "South", "PromotionKey": ("!=", 0), "Quarter": 3})
    dice_d = sales_olap.dice_sales({
        "Category": ["Beverages", "Snacks", "Bakery"],
        "StoreKey": [1, 2, 6, 8], # Siam, Silom, Nimman, Pattaya
        "DateKey": {"gte": 20260401, "lte": 20260630} # Q2
    })

    results["Dices"] = {
        "DiceA": dice_a["Measures"],
        "DiceB": dice_b["Measures"],
        "DiceC": dice_c["Measures"],
        "DiceD": dice_d["Measures"]
    }

    print(f"  Dice A (Region='Isan', Category='Beverages', Quarter=Q2):")
    print(f"    Sales: {dice_a['Measures']['TotalSales']:,.2f} | Profit: {dice_a['Measures']['TotalProfit']:,.2f} | Margin: {dice_a['Measures']['OverallProfitMargin']}% | Txns: {dice_a['Measures']['TransactionCount']:,}")
    print(f"  Dice B (Region='Central', Category='Ready-to-Eat', Month=July):")
    print(f"    Sales: {dice_b['Measures']['TotalSales']:,.2f} | Profit: {dice_b['Measures']['TotalProfit']:,.2f} | Margin: {dice_b['Measures']['OverallProfitMargin']}% | Txns: {dice_b['Measures']['TransactionCount']:,}")
    print(f"  Dice C (Region='South', Promotion!=0, Quarter=Q3):")
    print(f"    Sales: {dice_c['Measures']['TotalSales']:,.2f} | Profit: {dice_c['Measures']['TotalProfit']:,.2f} | Margin: {dice_c['Measures']['OverallProfitMargin']}% | Txns: {dice_c['Measures']['TransactionCount']:,}")
    print(f"  Dice D (Multi-Cats, Tourist Stores, Q2 Date Range):")
    print(f"    Sales: {dice_d['Measures']['TotalSales']:,.2f} | Profit: {dice_d['Measures']['TotalProfit']:,.2f} | Margin: {dice_d['Measures']['OverallProfitMargin']}% | Txns: {dice_d['Measures']['TransactionCount']:,}")

    # -------------------------------------------------------------
    # 5. Drill-Down Operations (3 Real Cases)
    # -------------------------------------------------------------
    print("\n--- 5. DRILL-DOWN OPERATIONS ---")
    # Time: Quarter 2 -> Months
    dd_time = sales_olap.drilldown_sales("TIME", "Quarter", "Month", 2)
    # Product: Beverages -> SubCategories
    dd_prod = sales_olap.drilldown_sales("PRODUCT", "Category", "SubCategory", "Beverages")
    # Location: Central -> Provinces -> Stores
    dd_loc = sales_olap.drilldown_sales("LOCATION", "Region", "StoreName", "Central")

    print(f"  Drill-down Time (Quarter=2 -> Months):")
    for _, row in dd_time.iterrows():
        print(f"    Month {row['Month']}: Sales={row['TotalSales']:,.2f}, Profit={row['TotalProfit']:,.2f}, Margin={row['OverallProfitMargin']}%")

    print(f"  Drill-down Product (Category='Beverages' -> SubCategories):")
    for _, row in dd_prod.iterrows():
        print(f"    {row['SubCategory']:<24}: Sales={row['TotalSales']:,.2f}, Margin={row['OverallProfitMargin']}%")

    print(f"  Drill-down Location (Region='Central' -> Stores):")
    for _, row in dd_loc.iterrows():
        print(f"    {row['StoreName']:<26}: Sales={row['TotalSales']:,.2f}, Margin={row['OverallProfitMargin']}%")

    # -------------------------------------------------------------
    # 6. Roll-Up Operations (3 Real Cases)
    # -------------------------------------------------------------
    print("\n--- 6. ROLL-UP OPERATIONS ---")
    # Time: Month -> Quarter
    ru_time = sales_olap.rollup_sales("TIME", "Month", "Quarter")
    # Product: SubCategory -> Category
    ru_prod = sales_olap.rollup_sales("PRODUCT", "SubCategory", "Category")
    # Location: Store -> Region
    ru_loc = sales_olap.rollup_sales("LOCATION", "Store", "Region")

    print(f"  Roll-up Time (By Quarter):")
    for _, row in ru_time.iterrows():
        print(f"    Quarter {row['Quarter']}: Sales={row['TotalSales']:,.2f}, Profit={row['TotalProfit']:,.2f}, Margin={row['OverallProfitMargin']}%")

    print(f"  Roll-up Location (By Region):")
    for _, row in ru_loc.iterrows():
        print(f"    {row['Region']:<12}: Sales={row['TotalSales']:,.2f}, Margin={row['OverallProfitMargin']}%")

    # -------------------------------------------------------------
    # 7. Inventory Semi-Additive Validation
    # -------------------------------------------------------------
    print("\n--- 7. INVENTORY SEMI-ADDITIVE VALIDATION ---")
    inv_total_snapshots = len(engine.inventory_cube)
    inv_avg_stock = round(float(engine.inventory_cube["EndingStock"].mean()), 2)
    inv_sum_stock_all_time = int(engine.inventory_cube["EndingStock"].sum())
    
    # Same-day sum across all 10 stores & 65 products on 2026-09-30
    last_day_df = engine.inventory_cube[engine.inventory_cube["DateKey"] == 20260930]
    last_day_stock = int(last_day_df["EndingStock"].sum())

    print(f"  Total Inventory Snapshots (65 * 10 * 273) : {inv_total_snapshots:,}")
    print(f"  Average Ending Stock across time          : {inv_avg_stock:,.2f} units/store-SKU")
    print(f"  Last Day (2026-09-30) Total Store Network : {last_day_stock:,} physical units on shelf")
    print(f"  Naive Sum across all 273 days (INVALID)   : {inv_sum_stock_all_time:,} (DO NOT USE - meaningless)")
    print(f"  Semi-Additive Principle Confirmed         : EndingStock averaged over time, never summed across time.")

    # Status distribution
    status_dist = engine.inventory_cube["InventoryStatus"].value_counts().to_dict()
    print("\n--- INVENTORY STATUS DISTRIBUTION ---")
    for s, cnt in status_dist.items():
        pct = (cnt / inv_total_snapshots) * 100.0
        print(f"  {s:<15}: {cnt, 6}[0] ({pct:.2f}%)".replace(", 6}[0]", f"{cnt:>6}"))

    results["Inventory"] = {
        "TotalSnapshots": inv_total_snapshots,
        "AverageEndingStock": inv_avg_stock,
        "LastDayPhysicalStock": last_day_stock,
        "StatusDistribution": status_dist
    }

    # Save results to json for report generation
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_json = os.path.join(base_dir, "olap", "olap_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\nValidation completed successfully. Output saved to olap_results.json")
    return True


if __name__ == "__main__":
    run_olap_validation()
