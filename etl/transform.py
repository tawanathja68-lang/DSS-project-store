"""
Module: transform.py
Project: Retail Insight DSS - QuickMart (Phase 3)
Transforms, normalizes, validates domain rules, and recalculates metric fields for Star Schema.
"""

from typing import Dict, List, Tuple, Any
from datetime import datetime, date

VALID_CATEGORIES = {
    "Beverages", "Snacks", "Instant Food", "Ready-to-Eat",
    "Bakery", "Dairy", "Personal Care", "Household"
}

VALID_REGIONS = {"Central", "Isan", "North", "East", "South"}


def transform_dim_date(rows: List[Dict[str, str]], logger: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    transformed = []
    seen_datekeys = set()
    seen_fulldates = set()
    invalid_records = 0

    for r in rows:
        dk = int(r["DateKey"])
        fd_str = r["FullDate"].strip()
        fd = datetime.strptime(fd_str, "%Y-%m-%d").date()

        if dk in seen_datekeys or fd_str in seen_fulldates:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Dim_Date duplicate: DateKey={dk}, FullDate={fd_str}")
        seen_datekeys.add(dk)
        seen_fulldates.add(fd_str)

        row_t = {
            "DateKey": dk,
            "FullDate": fd_str,
            "Day": int(r["Day"]),
            "Month": int(r["Month"]),
            "MonthName": r["MonthName"].strip(),
            "Quarter": int(r["Quarter"]),
            "Year": int(r["Year"]),
            "WeekOfYear": int(r["WeekOfYear"]),
            "DayOfWeek": int(r["DayOfWeek"]),
            "DayName": r["DayName"].strip(),
            "IsWeekend": r["IsWeekend"].strip().upper()
        }
        transformed.append(row_t)

    transformed.sort(key=lambda x: x["DateKey"])
    expected_days = 273
    start_d = date(2026, 1, 1)
    end_d = date(2026, 9, 30)

    # Check date range and continuity
    actual_start = datetime.strptime(transformed[0]["FullDate"], "%Y-%m-%d").date()
    actual_end = datetime.strptime(transformed[-1]["FullDate"], "%Y-%m-%d").date()

    if actual_start != start_d or actual_end != end_d or len(transformed) != expected_days:
        logger.append(f"[TRANSFORM_ERROR] Dim_Date range mismatch: {actual_start} to {actual_end}, count={len(transformed)}")
    else:
        logger.append(f"[TRANSFORM] Dim_Date validated: exactly 273 contiguous days ({start_d} to {end_d}).")

    return transformed, {"table": "dim_date", "transformed_rows": len(transformed), "invalid_records": invalid_records}


def transform_dim_product(rows: List[Dict[str, str]], logger: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    transformed = []
    seen_pk = set()
    seen_pid = set()
    invalid_records = 0

    for r in rows:
        pk = int(r["ProductKey"])
        pid = r["ProductID"].strip()
        cat = r["Category"].strip()
        u_cost = float(r["UnitCost"])
        u_price = float(r["UnitPrice"])
        rop = int(r["ReorderPoint"])
        max_s = int(r["MaxStockLevel"])

        if pk in seen_pk or pid in seen_pid:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Dim_Product duplicate key: ProductKey={pk}, ProductID={pid}")
        seen_pk.add(pk)
        seen_pid.add(pid)

        if cat not in VALID_CATEGORIES:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Invalid category '{cat}' for product {pid}")

        if not (u_price > u_cost > 0):
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Price/Cost invalid for product {pid}: price={u_price}, cost={u_cost}")

        if not (max_s > rop > 0):
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Stock policy invalid for product {pid}: max={max_s}, rop={rop}")

        row_t = {
            "ProductKey": pk,
            "ProductID": pid,
            "ProductName": r["ProductName"].strip(),
            "Category": cat,
            "SubCategory": r["SubCategory"].strip(),
            "Brand": r["Brand"].strip(),
            "UnitCost": f"{u_cost:.2f}",
            "UnitPrice": f"{u_price:.2f}",
            "ReorderPoint": rop,
            "MaxStockLevel": max_s,
            "Supplier": r["Supplier"].strip(),
            "IsActive": r["IsActive"].strip().upper()
        }
        transformed.append(row_t)

    logger.append(f"[TRANSFORM] Dim_Product validated: {len(transformed)} SKUs across 8 categories.")
    return transformed, {"table": "dim_product", "transformed_rows": len(transformed), "invalid_records": invalid_records}


def transform_dim_store(rows: List[Dict[str, str]], logger: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    transformed = []
    seen_sk = set()
    seen_sid = set()
    regions_found = set()
    invalid_records = 0

    for r in rows:
        sk = int(r["StoreKey"])
        sid = r["StoreID"].strip()
        reg = r["Region"].strip()

        if sk in seen_sk or sid in seen_sid:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Dim_Store duplicate key: StoreKey={sk}, StoreID={sid}")
        seen_sk.add(sk)
        seen_sid.add(sid)

        if reg not in VALID_REGIONS:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Invalid region '{reg}' for store {sid}")
        regions_found.add(reg)

        row_t = {
            "StoreKey": sk,
            "StoreID": sid,
            "StoreName": r["StoreName"].strip(),
            "Region": reg,
            "Province": r["Province"].strip(),
            "StoreType": r["StoreType"].strip(),
            "OpenDate": r["OpenDate"].strip(),
            "IsActive": r["IsActive"].strip().upper()
        }
        transformed.append(row_t)

    if regions_found != VALID_REGIONS or len(transformed) != 10:
        logger.append(f"[TRANSFORM_ERROR] Dim_Store count or regions mismatch. Count={len(transformed)}, Regions={regions_found}")
    else:
        logger.append(f"[TRANSFORM] Dim_Store validated: 10 stores across all 5 regions.")

    return transformed, {"table": "dim_store", "transformed_rows": len(transformed), "invalid_records": invalid_records}


def transform_dim_promotion(rows: List[Dict[str, str]], logger: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    transformed = []
    seen_prm_k = set()
    has_key_0 = False
    invalid_records = 0

    for r in rows:
        prm_k = int(r["PromotionKey"])
        prm_id = r["PromotionID"].strip()
        disc = float(r["DiscountPercent"])

        if prm_k in seen_prm_k:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Dim_Promotion duplicate key: PromotionKey={prm_k}")
        seen_prm_k.add(prm_k)

        if prm_k == 0:
            has_key_0 = True
            if disc != 0.0 or prm_id != "PRM-NONE":
                logger.append(f"[TRANSFORM_ERROR] PromotionKey=0 definition inconsistent: {r}")

        if not (0.0 <= disc <= 100.0):
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] DiscountPercent out of bounds: {disc} in promotion {prm_id}")

        row_t = {
            "PromotionKey": prm_k,
            "PromotionID": prm_id,
            "PromotionName": r["PromotionName"].strip(),
            "PromotionType": r["PromotionType"].strip(),
            "DiscountPercent": f"{disc:.2f}",
            "StartDate": r["StartDate"].strip(),
            "EndDate": r["EndDate"].strip(),
            "IsActive": r["IsActive"].strip().upper()
        }
        transformed.append(row_t)

    if not has_key_0:
        logger.append("[TRANSFORM_ERROR] Dim_Promotion is missing mandatory PromotionKey=0 (No Promotion)!")
    else:
        logger.append(f"[TRANSFORM] Dim_Promotion validated: {len(transformed)} campaigns including PromotionKey=0.")

    return transformed, {"table": "dim_promotion", "transformed_rows": len(transformed), "invalid_records": invalid_records}


def transform_fact_sales(rows: List[Dict[str, str]], logger: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    transformed = []
    seen_sales_keys = set()
    corrected_records = 0
    invalid_records = 0

    for r in rows:
        s_key = int(r["SalesKey"])
        txn_id = r["TransactionID"].strip()
        d_key = int(r["DateKey"])
        p_key = int(r["ProductKey"])
        st_key = int(r["StoreKey"])
        prm_key = int(r["PromotionKey"])

        if s_key in seen_sales_keys:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Fact_Sales duplicate SalesKey={s_key}")
        seen_sales_keys.add(s_key)

        qty = int(r["Quantity"])
        u_price = float(r["UnitPrice"])
        u_cost = float(r["UnitCost"])
        disc = float(r["Discount"])

        if qty <= 0 or u_price < 0 or u_cost < 0 or disc < 0:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Fact_Sales non-positive quantity or negative values on SalesKey={s_key}")

        # Recalculate financial fields strictly according to specs
        calc_gross = qty * u_price
        calc_sales_amt = round(calc_gross - disc, 2)
        calc_cost_amt = round(qty * u_cost, 2)
        calc_profit = round(calc_sales_amt - calc_cost_amt, 2)
        calc_margin = round((calc_profit / calc_sales_amt) * 100.0, 2) if calc_sales_amt > 0 else 0.0

        src_sales_amt = float(r["SalesAmount"])
        src_cost_amt = float(r["CostAmount"])
        src_profit = float(r["Profit"])
        src_margin = float(r["ProfitMargin"])

        # Compare and auto-correct if discrepancy found
        if (abs(calc_sales_amt - src_sales_amt) > 0.02 or
            abs(calc_cost_amt - src_cost_amt) > 0.02 or
            abs(calc_profit - src_profit) > 0.02 or
            abs(calc_margin - src_margin) > 0.05):
            corrected_records += 1
            # logger.append(f"[TRANSFORM_CORRECTION] SalesKey={s_key} recalculated: SalesAmt={calc_sales_amt}, CostAmt={calc_cost_amt}, Profit={calc_profit}")

        row_t = {
            "SalesKey": s_key,
            "TransactionID": txn_id,
            "DateKey": d_key,
            "ProductKey": p_key,
            "StoreKey": st_key,
            "PromotionKey": prm_key,
            "Quantity": qty,
            "UnitPrice": f"{u_price:.2f}",
            "Discount": f"{disc:.2f}",
            "SalesAmount": f"{calc_sales_amt:.2f}",
            "UnitCost": f"{u_cost:.2f}",
            "CostAmount": f"{calc_cost_amt:.2f}",
            "Profit": f"{calc_profit:.2f}",
            "ProfitMargin": f"{calc_margin:.2f}"
        }
        transformed.append(row_t)

    logger.append(f"[TRANSFORM] Fact_Sales validated: {len(transformed)} rows, Corrected: {corrected_records}, Invalid: {invalid_records}")
    return transformed, {
        "table": "fact_sales",
        "transformed_rows": len(transformed),
        "corrected_records": corrected_records,
        "invalid_records": invalid_records
    }


def transform_fact_inventory(rows: List[Dict[str, str]], logger: List[str]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    transformed = []
    seen_composite_keys = set()
    corrected_status_count = 0
    balance_equation_errors = 0
    chaining_errors = 0
    invalid_records = 0

    # Sort rows by ProductKey, StoreKey, DateKey to ensure sequential processing
    rows_sorted = sorted(rows, key=lambda x: (int(x["ProductKey"]), int(x["StoreKey"]), int(x["DateKey"])))

    prev_ending_stock: Dict[Tuple[int, int], int] = {}

    for r in rows_sorted:
        i_key = int(r["InventoryKey"])
        d_key = int(r["DateKey"])
        p_key = int(r["ProductKey"])
        s_key = int(r["StoreKey"])

        comp_key = (d_key, p_key, s_key)
        if comp_key in seen_composite_keys:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Fact_Inventory duplicate composite key: {comp_key}")
        seen_composite_keys.add(comp_key)

        beg = int(r["BeginningStock"])
        stk_in = int(r["StockIn"])
        stk_out = int(r["StockOut"])
        ending = int(r["EndingStock"])
        rop = int(r["ReorderPoint"])
        max_s = int(r["MaxStockLevel"])
        src_status = r["InventoryStatus"].strip().upper()

        if beg < 0 or stk_in < 0 or stk_out < 0 or ending < 0:
            invalid_records += 1
            logger.append(f"[TRANSFORM_ERROR] Negative inventory quantity on key {comp_key}")

        # Check balance equation
        calc_ending = beg + stk_in - stk_out
        if calc_ending != ending:
            balance_equation_errors += 1
            ending = calc_ending  # Enforce reconciliation

        # Check daily chaining
        pair_key = (p_key, s_key)
        if pair_key in prev_ending_stock:
            if beg != prev_ending_stock[pair_key]:
                chaining_errors += 1
        prev_ending_stock[pair_key] = ending

        # Recalculate status from business logic
        if ending == 0:
            calc_status = "OUT OF STOCK"
        elif ending <= rop:
            calc_status = "REORDER"
        elif ending > max_s:
            calc_status = "OVERSTOCK"
        else:
            calc_status = "NORMAL"

        if src_status != calc_status:
            corrected_status_count += 1

        row_t = {
            "InventoryKey": i_key,
            "DateKey": d_key,
            "ProductKey": p_key,
            "StoreKey": s_key,
            "BeginningStock": beg,
            "StockIn": stk_in,
            "StockOut": stk_out,
            "EndingStock": ending,
            "ReorderPoint": rop,
            "MaxStockLevel": max_s,
            "InventoryStatus": calc_status
        }
        transformed.append(row_t)

    logger.append(f"[TRANSFORM] Fact_Inventory validated: {len(transformed)} rows, Status Corrections: {corrected_status_count}, Chaining Errors: {chaining_errors}, Balance Errors: {balance_equation_errors}")
    return transformed, {
        "table": "fact_inventory",
        "transformed_rows": len(transformed),
        "corrected_records": corrected_status_count,
        "chaining_errors": chaining_errors,
        "balance_errors": balance_equation_errors,
        "invalid_records": invalid_records
    }
