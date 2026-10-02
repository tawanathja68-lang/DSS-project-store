"""
Module: run_mining.py
Project: Retail Insight DSS - QuickMart (Phase 5)
Master Orchestrator for Data Mining Pipeline:
Executes K-Means Clustering, Association Rule Mining, and Quality Validation.
"""

import sys
import json
from prepare_features import load_and_engineer_features
from kmeans_analysis import run_kmeans_segmentation
from association_rules import run_market_basket_analysis
from validate_mining import validate_all_mining


def main():
    print("=" * 70)
    print("QUICKMART DSS — PHASE 5: DATA MINING PIPELINE")
    print("=" * 70)

    # 1. Feature Engineering & OLAP Reconciliation Check
    print("\n[STEP 1] Preparing Features & Reconciling with Phase 4 OLAP...")
    feature_df, X_scaled, scaler, olap_meta = load_and_engineer_features()
    print(f"  Grand Total Quantity : {olap_meta['TotalQuantity']:,} (Expected: 71,885) [{'MATCH' if olap_meta['TotalQuantity']==71885 else 'FAIL'}]")
    print(f"  Grand Total Revenue  : {olap_meta['TotalRevenue']:,.2f} THB (Expected: 1,595,166.51) [{'MATCH' if abs(olap_meta['TotalRevenue']-1595166.51)<0.05 else 'FAIL'}]")
    print(f"  Grand Total Profit   : {olap_meta['TotalProfit']:,.2f} THB (Expected: 499,676.51) [{'MATCH' if abs(olap_meta['TotalProfit']-499676.51)<0.05 else 'FAIL'}]")
    print(f"  Product Count        : {olap_meta['ProductCount']} SKUs")

    # 2. Run K-Means Product Segmentation
    print("\n[STEP 2] Running K-Means Clustering (Evaluating K=2..6, Training Production K=3)...")
    kmeans_res = run_kmeans_segmentation()
    print(f"  Final K              : {kmeans_res['FinalK']}")
    print(f"  Inertia              : {kmeans_res['FinalInertia']:.2f}")
    print(f"  Silhouette Score     : {kmeans_res['FinalSilhouette']:.3f}")
    print("  Cluster Summaries:")
    for c in kmeans_res["ClusterStats"]:
        print(f"    - Cluster {c['Cluster']} ({c['ProductCount']} SKUs) [{c['BusinessLabel']}]:")
        print(f"        Avg Qty: {c['AverageQuantity']:,} units | Avg Rev: {c['AverageRevenue']:,.2f} THB | Avg Margin: {c['AverageProfitMargin']}%")

    # 3. Run Market Basket Analysis / Association Rules
    print("\n[STEP 3] Running Association Rule Mining (Support >= 0.02, Conf >= 0.30, Lift > 1.00)...")
    assoc_res = run_market_basket_analysis(min_support=0.02, min_confidence=0.30, min_lift=1.00)
    print(f"  Total Transactions   : {assoc_res['TotalTransactions']:,}")
    print(f"  Single-Item Baskets  : {assoc_res['SingleItemTransactions']:,}")
    print(f"  Multi-Item Baskets   : {assoc_res['MultiItemTransactions']:,} ({assoc_res['MultiItemPercentage']}%)")
    print(f"  Frequent Itemsets    : {assoc_res['FrequentItemsetsCount']}")
    print(f"  Filtered Rules (Lift>1): {assoc_res['AssociationRulesCount']}")
    print("  Top 5 Association Rules:")
    for i, r in enumerate(assoc_res["TopRules"][:5], 1):
        print(f"    {i}. {r['AntecedentProducts']}  ==>  {r['ConsequentProducts']}")
        print(f"       Support: {r['support']*100:.2f}%, Confidence: {r['confidence']*100:.2f}%, Lift: {r['lift']:.3f}")

    # 4. Validation & Cross-Checking
    print("\n[STEP 4] Performing Comprehensive Quality Validation...")
    val_res = validate_all_mining(kmeans_res, assoc_res, olap_meta)
    for check_name, status in val_res["Checks"].items():
        print(f"  {check_name:<36}: {'PASS' if status else 'FAIL'}")

    all_passed = val_res["AllPassed"]
    print("\n" + "=" * 70)
    if all_passed:
        print("OVERALL DATA MINING STATUS: SUCCESS (ALL 10 CHECKS PASSED 100%)")
    else:
        print("OVERALL DATA MINING STATUS: FAILED (SOME CHECKS DID NOT PASS)")
    print("=" * 70)

    # Save complete JSON result for reporting
    full_output = {
        "OLAPReconciliation": olap_meta,
        "KMeans": kmeans_res,
        "AssociationRules": assoc_res,
        "Validation": val_res
    }
    with open("mining_execution_summary.json", "w", encoding="utf-8") as f:
        json.dump(full_output, f, indent=2)

    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
