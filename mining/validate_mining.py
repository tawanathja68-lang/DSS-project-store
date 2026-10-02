"""
Module: validate_mining.py
Project: Retail Insight DSS - QuickMart (Phase 5)
Conducts comprehensive quality validation and mathematical reconciliation
for K-Means Clustering and Association Rule Mining.
"""

from typing import Dict, Any


def validate_all_mining(kmeans_res: Dict[str, Any], assoc_res: Dict[str, Any], olap_meta: Dict[str, Any]) -> Dict[str, Any]:
    checks = {}

    # 1. OLAP Cross-Check
    checks["OLAP_Reconciliation_Quantity"] = (olap_meta["TotalQuantity"] == 71885)
    checks["OLAP_Reconciliation_Revenue"] = (abs(olap_meta["TotalRevenue"] - 1595166.51) < 0.05)
    checks["OLAP_Reconciliation_Profit"] = (abs(olap_meta["TotalProfit"] - 499676.51) < 0.05)

    # 2. K-Means Validation
    checks["KMeans_ProductCount"] = (kmeans_res["ProductCount"] == 65)
    checks["KMeans_ClusterCount"] = (kmeans_res["FinalK"] == 3)
    checks["KMeans_SilhouettePositive"] = (kmeans_res["FinalSilhouette"] > 0.30)
    checks["KMeans_NoEmptyClusters"] = all(c["ProductCount"] > 0 for c in kmeans_res["ClusterStats"])

    # 3. Association Rules Validation
    checks["Assoc_TotalTxns"] = (assoc_res["TotalTransactions"] == 26327)
    checks["Assoc_MultiItemBaskets"] = (assoc_res["MultiItemTransactions"] > 10000)
    checks["Assoc_RulesCount"] = (assoc_res["AssociationRulesCount"] > 0)
    checks["Assoc_AllRulesMeetThresholds"] = all(
        r["support"] >= 0.02 and r["confidence"] >= 0.30 and r["lift"] > 1.00
        for r in assoc_res["TopRules"]
    )
    checks["Assoc_EmpiricalVerification"] = all(
        v["IsVerified"] for v in assoc_res["RuleVerifications"]
    )
    checks["Assoc_CrossStoreIntegrity"] = (assoc_res["CrossStoreTransactions"] == 0)

    all_passed = all(checks.values())
    return {
        "Checks": checks,
        "AllPassed": all_passed,
        "TotalChecks": len(checks)
    }
