"""
Module: run_etl.py
Project: Retail Insight DSS - QuickMart (Phase 3)
Master ETL Pipeline Orchestrator with complete audit logging and quality verification.
"""

import os
import sys
import time
from datetime import datetime

# Import sub-modules
from extract import extract_all
from transform import (
    transform_dim_date,
    transform_dim_product,
    transform_dim_store,
    transform_dim_promotion,
    transform_fact_sales,
    transform_fact_inventory
)
from validate import validate_referential_integrity
from load import load_all


def run_pipeline():
    start_time = datetime.now()
    start_ts = time.time()
    logger = []
    
    logger.append(f"QuickMart ETL Pipeline Execution")
    logger.append(f"Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.append("=" * 70)
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_dir = os.path.join(base_dir, "data", "source")
    warehouse_dir = os.path.join(base_dir, "data", "warehouse")
    logs_dir = os.path.join(base_dir, "logs")
    os.makedirs(logs_dir, exist_ok=True)
    
    logger.append(f"Source Directory:    {source_dir}")
    logger.append(f"Warehouse Directory: {warehouse_dir}")
    logger.append("-" * 70)
    
    # ---------------------------------------------------------
    # 1. EXTRACT
    # ---------------------------------------------------------
    raw_datasets, extract_meta = extract_all(source_dir, logger)
    
    # ---------------------------------------------------------
    # 2. TRANSFORM
    # ---------------------------------------------------------
    logger.append("=== TRANSFORM PHASE STARTED ===")
    transformed_datasets = {}
    transform_meta = {}
    
    date_t, meta_date = transform_dim_date(raw_datasets["dim_date"], logger)
    transformed_datasets["dim_date"] = date_t
    transform_meta["dim_date"] = meta_date
    
    prod_t, meta_prod = transform_dim_product(raw_datasets["dim_product"], logger)
    transformed_datasets["dim_product"] = prod_t
    transform_meta["dim_product"] = meta_prod
    
    store_t, meta_store = transform_dim_store(raw_datasets["dim_store"], logger)
    transformed_datasets["dim_store"] = store_t
    transform_meta["dim_store"] = meta_store
    
    promo_t, meta_promo = transform_dim_promotion(raw_datasets["dim_promotion"], logger)
    transformed_datasets["dim_promotion"] = promo_t
    transform_meta["dim_promotion"] = meta_promo
    
    sales_t, meta_sales = transform_fact_sales(raw_datasets["fact_sales"], logger)
    transformed_datasets["fact_sales"] = sales_t
    transform_meta["fact_sales"] = meta_sales
    
    inv_t, meta_inv = transform_fact_inventory(raw_datasets["fact_inventory"], logger)
    transformed_datasets["fact_inventory"] = inv_t
    transform_meta["fact_inventory"] = meta_inv
    logger.append("=== TRANSFORM PHASE COMPLETED ===")
    
    # ---------------------------------------------------------
    # 3. REFERENTIAL INTEGRITY VALIDATION
    # ---------------------------------------------------------
    ri_result = validate_referential_integrity(transformed_datasets, logger)
    
    # ---------------------------------------------------------
    # 4. LOAD
    # ---------------------------------------------------------
    loaded_files = load_all(warehouse_dir, transformed_datasets, logger)
    
    # ---------------------------------------------------------
    # 5. POST-LOAD AUDIT & METRICS
    # ---------------------------------------------------------
    end_time = datetime.now()
    duration = time.time() - start_ts
    
    total_source_rows = sum(m["row_count"] for m in extract_meta.values())
    total_loaded_rows = sum(len(d) for d in transformed_datasets.values())
    total_duplicates = sum(m["duplicate_pk_count"] for m in extract_meta.values())
    total_missing_values = sum(m["null_values"] for m in extract_meta.values())
    total_invalid_records = sum(m.get("invalid_records", 0) for m in transform_meta.values())
    total_corrected_records = sum(m.get("corrected_records", 0) for m in transform_meta.values())
    total_rejected_records = total_invalid_records
    
    chaining_errors = transform_meta["fact_inventory"].get("chaining_errors", 0)
    balance_errors = transform_meta["fact_inventory"].get("balance_errors", 0)
    
    is_success = (
        total_rejected_records == 0 and
        ri_result["total_orphans"] == 0 and
        chaining_errors == 0 and
        balance_errors == 0 and
        total_loaded_rows == total_source_rows
    )
    
    final_status = "SUCCESS" if is_success else "FAILED"
    
    # Construct Summary Table
    summary_table = []
    summary_table.append("| Table Name      | Source Rows | Loaded Rows | Rejected | Status |")
    summary_table.append("| :-------------- | ----------: | ----------: | -------: | :----: |")
    
    expected_rows = {
        "dim_date": 273,
        "dim_product": 65,
        "dim_store": 10,
        "dim_promotion": 7,
        "fact_sales": 51551,
        "fact_inventory": 177450
    }
    
    for tbl in ["dim_date", "dim_product", "dim_store", "dim_promotion", "fact_sales", "fact_inventory"]:
        src_n = extract_meta[tbl]["row_count"]
        ld_n = len(transformed_datasets[tbl])
        rej_n = transform_meta[tbl].get("invalid_records", 0)
        exp_n = expected_rows[tbl]
        st = "PASS" if (ld_n == exp_n and rej_n == 0) else "FAIL"
        summary_table.append(f"| {tbl:<15} | {src_n:>11,} | {ld_n:>11,} | {rej_n:>8} | {st:^6} |")
    
    summary_str = "\n".join(summary_table)
    
    report_lines = [
        "=" * 70,
        "QUICKMART DSS — ETL PIPELINE AUDIT REPORT",
        "=" * 70,
        f"Execution Start:             {start_time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"Execution End:               {end_time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"Elapsed Time:                {duration:.2f} seconds",
        f"Overall Pipeline Status:     {final_status}",
        "-" * 70,
        "METRIC TOTALS:",
        f"  Total Source Rows:         {total_source_rows:,}",
        f"  Total Loaded Rows:         {total_loaded_rows:,}",
        f"  Total Rejected Records:    {total_rejected_records:,}",
        f"  Total Corrected Records:   {total_corrected_records:,}",
        f"  Total Null/Missing Values: {total_missing_values:,}",
        f"  Total Duplicate PKs:       {total_duplicates:,}",
        f"  Orphan Foreign Keys:       {ri_result['total_orphans']:,}",
        f"  Formula Balance Errors:    {balance_errors:,}",
        f"  Inventory Chaining Errors: {chaining_errors:,}",
        "-" * 70,
        "TABLE RECONCILIATION SUMMARY:",
        summary_str,
        "-" * 70,
        "EXECUTION LOG STREAM:",
        *logger,
        "=" * 70
    ]
    
    report_content = "\n".join(report_lines)
    
    # Save Report
    report_file = os.path.join(logs_dir, "etl_validation_report.txt")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    print(report_content)
    return is_success


if __name__ == "__main__":
    success = run_pipeline()
    sys.exit(0 if success else 1)
