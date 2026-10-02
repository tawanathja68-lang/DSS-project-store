"""
Module: load.py
Project: Retail Insight DSS - QuickMart (Phase 3)
Loads transformed and validated datasets into the Data Warehouse directory.
"""

import os
import csv
import shutil
from typing import Dict, List, Any

TABLE_COLUMNS = {
    "dim_date": ["DateKey", "FullDate", "Day", "Month", "MonthName", "Quarter", "Year", "WeekOfYear", "DayOfWeek", "DayName", "IsWeekend"],
    "dim_product": ["ProductKey", "ProductID", "ProductName", "Category", "SubCategory", "Brand", "UnitCost", "UnitPrice", "ReorderPoint", "MaxStockLevel", "Supplier", "IsActive"],
    "dim_store": ["StoreKey", "StoreID", "StoreName", "Region", "Province", "StoreType", "OpenDate", "IsActive"],
    "dim_promotion": ["PromotionKey", "PromotionID", "PromotionName", "PromotionType", "DiscountPercent", "StartDate", "EndDate", "IsActive"],
    "fact_sales": ["SalesKey", "TransactionID", "DateKey", "ProductKey", "StoreKey", "PromotionKey", "Quantity", "UnitPrice", "Discount", "SalesAmount", "UnitCost", "CostAmount", "Profit", "ProfitMargin"],
    "fact_inventory": ["InventoryKey", "DateKey", "ProductKey", "StoreKey", "BeginningStock", "StockIn", "StockOut", "EndingStock", "ReorderPoint", "MaxStockLevel", "InventoryStatus"]
}


def load_table(target_dir: str, table_name: str, rows: List[Dict[str, Any]], logger: List[str]) -> str:
    """
    Writes records to a CSV file in target Data Warehouse directory.
    """
    os.makedirs(target_dir, exist_ok=True)
    file_path = os.path.join(target_dir, f"{table_name}.csv")
    columns = TABLE_COLUMNS[table_name]
    
    with open(file_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
        
    logger.append(f"[LOAD] Successfully loaded {len(rows)} rows into {file_path}")
    return file_path


def load_all(warehouse_dir: str, datasets: Dict[str, List[Dict[str, Any]]], logger: List[str]) -> Dict[str, str]:
    """
    Loads all 6 tables into Data Warehouse directory.
    Also syncs to root data_warehouse/ for convenience.
    """
    logger.append("=== LOAD PHASE STARTED ===")
    loaded_files = {}
    for table_name, rows in datasets.items():
        fp = load_table(warehouse_dir, table_name, rows, logger)
        loaded_files[table_name] = fp
        
    # Also mirror to root data_warehouse/
    root_dw_dir = os.path.abspath(os.path.join(warehouse_dir, "..", "..", "..", "data_warehouse"))
    os.makedirs(root_dw_dir, exist_ok=True)
    for table_name in datasets:
        src_f = os.path.join(warehouse_dir, f"{table_name}.csv")
        dst_f = os.path.join(root_dw_dir, f"{table_name}.csv")
        shutil.copyfile(src_f, dst_f)
    logger.append(f"[LOAD] Mirrored Data Warehouse tables to: {root_dw_dir}")
    
    logger.append("=== LOAD PHASE COMPLETED ===")
    return loaded_files
