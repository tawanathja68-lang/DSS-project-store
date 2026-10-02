"""
Module: prepare_features.py
Project: Retail Insight DSS - QuickMart (Phase 5)
Extracts and engineers the Product Feature Matrix from Fact_Sales and Dim_Product.
Validates exact reconciliation against Phase 4 OLAP Grand Totals.
"""

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Dict, Any


def load_and_engineer_features() -> Tuple[pd.DataFrame, np.ndarray, StandardScaler, Dict[str, Any]]:
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    warehouse_dir = os.path.join(curr_dir, "..", "data", "warehouse")

    fact_sales_path = os.path.join(warehouse_dir, "fact_sales.csv")
    dim_product_path = os.path.join(warehouse_dir, "dim_product.csv")

    fact_sales = pd.read_csv(fact_sales_path)
    dim_product = pd.read_csv(dim_product_path)

    # 1. Feature Aggregation by ProductKey
    sales_agg = fact_sales.groupby("ProductKey").agg(
        TotalQuantitySold=("Quantity", "sum"),
        TotalRevenue=("SalesAmount", "sum"),
        TotalProfit=("Profit", "sum")
    ).reset_index()

    sales_agg["TotalQuantitySold"] = sales_agg["TotalQuantitySold"].astype(int)
    sales_agg["TotalRevenue"] = sales_agg["TotalRevenue"].round(2)
    sales_agg["TotalProfit"] = sales_agg["TotalProfit"].round(2)

    # Weighted Overall Profit Margin: SUM(Profit) / SUM(SalesAmount) * 100
    sales_agg["OverallProfitMargin"] = (
        (sales_agg["TotalProfit"] / sales_agg["TotalRevenue"]) * 100.0
    ).round(2)

    # 2. Merge with Dim_Product attributes
    feature_matrix = dim_product.merge(sales_agg, on="ProductKey", how="inner")

    # Select columns
    cols = [
        "ProductKey", "ProductID", "ProductName", "Category", "SubCategory", "Brand",
        "UnitCost", "UnitPrice", "ReorderPoint", "MaxStockLevel",
        "TotalQuantitySold", "TotalRevenue", "TotalProfit", "OverallProfitMargin"
    ]
    feature_matrix = feature_matrix[cols].sort_values(by="ProductKey").reset_index(drop=True)

    # 3. Cross-Check with Phase 4 OLAP Grand Totals
    total_qty = int(feature_matrix["TotalQuantitySold"].sum())
    total_rev = round(float(feature_matrix["TotalRevenue"].sum()), 2)
    total_prof = round(float(feature_matrix["TotalProfit"].sum()), 2)

    expected_qty = 71885
    expected_rev = 1595166.51
    expected_prof = 499676.51

    reconciled = (
        total_qty == expected_qty and
        abs(total_rev - expected_rev) < 0.05 and
        abs(total_prof - expected_prof) < 0.05
    )

    reconciliation_meta = {
        "TotalQuantity": total_qty,
        "TotalRevenue": total_rev,
        "TotalProfit": total_prof,
        "ExpectedQuantity": expected_qty,
        "ExpectedRevenue": expected_rev,
        "ExpectedProfit": expected_prof,
        "IsReconciled": reconciled,
        "ProductCount": len(feature_matrix)
    }

    if not reconciled:
        raise ValueError(f"OLAP Reconciliation Failed! Got Qty={total_qty}, Rev={total_rev}, Prof={total_prof}")

    # 4. Data Preprocessing & Validation Checks
    null_counts = int(feature_matrix.isnull().sum().sum())
    inf_counts = int(np.isinf(feature_matrix[["TotalQuantitySold", "TotalRevenue", "OverallProfitMargin"]]).sum().sum())
    duplicate_products = int(feature_matrix["ProductKey"].duplicated().sum())

    if null_counts > 0 or inf_counts > 0 or duplicate_products > 0 or len(feature_matrix) != 65:
        raise ValueError(f"Data Preprocessing check failed: Nulls={null_counts}, Infs={inf_counts}, Dups={duplicate_products}, Count={len(feature_matrix)}")

    # 5. Feature Scaling (StandardScaler)
    # Explain why scaling is essential:
    # TotalQuantitySold is on scale of 100 - 3,000 units
    # TotalRevenue is on scale of 5,000 - 80,000 THB
    # OverallProfitMargin is on scale of 20% - 60%
    # Without scaling, Euclidean distance in K-Means would be 99.9% dominated by TotalRevenue!
    feature_cols = ["TotalQuantitySold", "TotalRevenue", "OverallProfitMargin"]
    X = feature_matrix[feature_cols].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return feature_matrix, X_scaled, scaler, reconciliation_meta


if __name__ == "__main__":
    df, X_scaled, scaler, meta = load_and_engineer_features()
    print("Feature Engineering Success!")
    print(f"Products: {len(df)}")
    print(f"Reconciliation: {meta['IsReconciled']} (Qty: {meta['TotalQuantity']}, Rev: {meta['TotalRevenue']:,.2f}, Profit: {meta['TotalProfit']:,.2f})")
    print(f"Scaled Features Shape: {X_scaled.shape}")
