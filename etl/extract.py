"""
Module: extract.py
Project: Retail Insight DSS - QuickMart (Phase 3)
Extracts source CSV files and performs initial schema and data quality validations.
"""

import os
import csv
from typing import Dict, List, Tuple, Any

EXPECTED_TABLES = {
    "dim_date": {
        "file": "dim_date.csv",
        "pk": "DateKey",
        "columns": ["DateKey", "FullDate", "Day", "Month", "MonthName", "Quarter", "Year", "WeekOfYear", "DayOfWeek", "DayName", "IsWeekend"]
    },
    "dim_product": {
        "file": "dim_product.csv",
        "pk": "ProductKey",
        "columns": ["ProductKey", "ProductID", "ProductName", "Category", "SubCategory", "Brand", "UnitCost", "UnitPrice", "ReorderPoint", "MaxStockLevel", "Supplier", "IsActive"]
    },
    "dim_store": {
        "file": "dim_store.csv",
        "pk": "StoreKey",
        "columns": ["StoreKey", "StoreID", "StoreName", "Region", "Province", "StoreType", "OpenDate", "IsActive"]
    },
    "dim_promotion": {
        "file": "dim_promotion.csv",
        "pk": "PromotionKey",
        "columns": ["PromotionKey", "PromotionID", "PromotionName", "PromotionType", "DiscountPercent", "StartDate", "EndDate", "IsActive"]
    },
    "fact_sales": {
        "file": "fact_sales.csv",
        "pk": "SalesKey",
        "columns": ["SalesKey", "TransactionID", "DateKey", "ProductKey", "StoreKey", "PromotionKey", "Quantity", "UnitPrice", "Discount", "SalesAmount", "UnitCost", "CostAmount", "Profit", "ProfitMargin"]
    },
    "fact_inventory": {
        "file": "fact_inventory.csv",
        "pk": "InventoryKey",
        "columns": ["InventoryKey", "DateKey", "ProductKey", "StoreKey", "BeginningStock", "StockIn", "StockOut", "EndingStock", "ReorderPoint", "MaxStockLevel", "InventoryStatus"]
    }
}


def extract_table(source_dir: str, table_name: str, logger: List[str]) -> Tuple[List[Dict[str, str]], Dict[str, Any]]:
    """
    Extracts a CSV file, verifies existence, checks columns, checks duplicates and nulls.
    """
    config = EXPECTED_TABLES[table_name]
    file_path = os.path.join(source_dir, config["file"])
    
    if not os.path.exists(file_path):
        err = f"[ERROR] Source file missing: {file_path}"
        logger.append(err)
        raise FileNotFoundError(err)
    
    rows = []
    seen_pk = set()
    null_counts = 0
    duplicate_pk_count = 0
    pk_col = config["pk"]
    expected_cols = config["columns"]
    
    with open(file_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        actual_cols = reader.fieldnames
        
        # Verify columns match
        if actual_cols != expected_cols:
            diff = set(expected_cols).symmetric_difference(set(actual_cols or []))
            logger.append(f"[WARNING] Column mismatch in {table_name}: diff={diff}")
        
        for idx, row in enumerate(reader):
            rows.append(row)
            pk_val = row.get(pk_col)
            
            # Check nulls
            for k, v in row.items():
                if v is None or v.strip() == "":
                    null_counts += 1
            
            # Check PK uniqueness
            if pk_val in seen_pk:
                duplicate_pk_count += 1
            else:
                seen_pk.add(pk_val)
                
    meta = {
        "table": table_name,
        "row_count": len(rows),
        "column_count": len(expected_cols),
        "null_values": null_counts,
        "duplicate_pk_count": duplicate_pk_count,
        "pk_name": pk_col
    }
    
    msg = f"[EXTRACT] {table_name}: {len(rows)} rows, {len(expected_cols)} cols, Nulls: {null_counts}, Duplicate PKs: {duplicate_pk_count}"
    logger.append(msg)
    return rows, meta


def extract_all(source_dir: str, logger: List[str]) -> Tuple[Dict[str, List[Dict[str, str]]], Dict[str, Dict[str, Any]]]:
    """
    Extracts all 6 tables from source directory.
    """
    datasets = {}
    metadata = {}
    logger.append("=== EXTRACT PHASE STARTED ===")
    for table_name in EXPECTED_TABLES:
        rows, meta = extract_table(source_dir, table_name, logger)
        datasets[table_name] = rows
        metadata[table_name] = meta
    logger.append("=== EXTRACT PHASE COMPLETED ===")
    return datasets, metadata
