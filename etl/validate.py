"""
Module: validate.py
Project: Retail Insight DSS - QuickMart (Phase 3)
Performs cross-table Referential Integrity checks and domain constraint validations.
"""

from typing import Dict, List, Any


def validate_referential_integrity(datasets: Dict[str, List[Dict[str, Any]]], logger: List[str]) -> Dict[str, Any]:
    """
    Validates Foreign Keys between Fact and Dimension tables.
    Returns audit counts of orphan records.
    """
    logger.append("=== REFERENTIAL INTEGRITY VALIDATION STARTED ===")
    
    date_keys = {r["DateKey"] for r in datasets["dim_date"]}
    product_keys = {r["ProductKey"] for r in datasets["dim_product"]}
    store_keys = {r["StoreKey"] for r in datasets["dim_store"]}
    promo_keys = {r["PromotionKey"] for r in datasets["dim_promotion"]}
    
    orphan_sales_date = 0
    orphan_sales_product = 0
    orphan_sales_store = 0
    orphan_sales_promo = 0
    
    for r in datasets["fact_sales"]:
        if r["DateKey"] not in date_keys:
            orphan_sales_date += 1
        if r["ProductKey"] not in product_keys:
            orphan_sales_product += 1
        if r["StoreKey"] not in store_keys:
            orphan_sales_store += 1
        if r["PromotionKey"] not in promo_keys:
            orphan_sales_promo += 1
            
    orphan_inv_date = 0
    orphan_inv_product = 0
    orphan_inv_store = 0
    
    for r in datasets["fact_inventory"]:
        if r["DateKey"] not in date_keys:
            orphan_inv_date += 1
        if r["ProductKey"] not in product_keys:
            orphan_inv_product += 1
        if r["StoreKey"] not in store_keys:
            orphan_inv_store += 1
            
    total_orphans = (
        orphan_sales_date + orphan_sales_product + orphan_sales_store + orphan_sales_promo +
        orphan_inv_date + orphan_inv_product + orphan_inv_store
    )
    
    result = {
        "orphan_sales_date": orphan_sales_date,
        "orphan_sales_product": orphan_sales_product,
        "orphan_sales_store": orphan_sales_store,
        "orphan_sales_promo": orphan_sales_promo,
        "orphan_inv_date": orphan_inv_date,
        "orphan_inv_product": orphan_inv_product,
        "orphan_inv_store": orphan_inv_store,
        "total_orphans": total_orphans,
        "is_valid": (total_orphans == 0)
    }
    
    if total_orphans == 0:
        logger.append("[REFERENTIAL_INTEGRITY] PASS: Zero orphan Foreign Keys found across all Fact tables.")
    else:
        logger.append(f"[REFERENTIAL_INTEGRITY] FAIL: Found {total_orphans} orphan records.")
        
    logger.append("=== REFERENTIAL INTEGRITY VALIDATION COMPLETED ===")
    return result
