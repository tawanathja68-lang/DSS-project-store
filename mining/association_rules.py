"""
Module: association_rules.py
Project: Retail Insight DSS - QuickMart (Phase 5)
Extracts shopping baskets from Fact_Sales, mines frequent itemsets (Apriori/FP-Growth),
generates Association Rules (Support, Confidence, Lift), and performs empirical validation.
"""

import os
import pandas as pd
from typing import Dict, List, Tuple, Any
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules


def run_market_basket_analysis(min_support: float = 0.02, min_confidence: float = 0.30, min_lift: float = 1.00) -> Dict[str, Any]:
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.abspath(os.path.join(curr_dir, ".."))
    warehouse_dir = os.path.join(base_dir, "data", "warehouse")
    mining_data_dir = os.path.join(base_dir, "data", "mining")
    os.makedirs(mining_data_dir, exist_ok=True)

    fact_sales = pd.read_csv(os.path.join(warehouse_dir, "fact_sales.csv"))
    dim_product = pd.read_csv(os.path.join(warehouse_dir, "dim_product.csv"))

    # Map ProductKey to Clean Short ProductName for readability in rules
    prod_map = dict(zip(dim_product["ProductKey"], dim_product["ProductName"]))
    fact_sales["ProductName"] = fact_sales["ProductKey"].map(prod_map)

    # 1. Basket Construction: TransactionID -> Unique set of items
    # (Binary presence: quantity > 1 counted as 1)
    baskets_df = fact_sales.groupby("TransactionID")["ProductName"].apply(lambda s: sorted(list(set(s)))).reset_index()
    baskets = baskets_df["ProductName"].tolist()

    total_txns = len(baskets)
    basket_sizes = [len(b) for b in baskets]
    single_item_txns = sum(1 for s in basket_sizes if s == 1)
    multi_item_txns = sum(1 for s in basket_sizes if s >= 2)
    multi_item_pct = round((multi_item_txns / total_txns) * 100.0, 2)

    # Validate store consistency per TransactionID
    txn_stores = fact_sales.groupby("TransactionID")["StoreKey"].nunique()
    cross_store_txns = int((txn_stores > 1).sum())

    # 2. Transaction Encoding for Apriori
    te = TransactionEncoder()
    te_ary = te.fit(baskets).transform(baskets)
    df_encoded = pd.DataFrame(te_ary, columns=te.columns_)

    # 3. Frequent Itemsets Mining (Apriori)
    frequent_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
    frequent_itemsets["length"] = frequent_itemsets["itemsets"].apply(lambda x: len(x))
    frequent_itemsets = frequent_itemsets.sort_values(by="support", ascending=False).reset_index(drop=True)

    # Save Frequent Itemsets CSV
    fi_export = frequent_itemsets.copy()
    fi_export["itemsets"] = fi_export["itemsets"].apply(lambda x: ", ".join(sorted(list(x))))
    fi_csv_path = os.path.join(mining_data_dir, "frequent_itemsets.csv")
    fi_export.to_csv(fi_csv_path, index=False)

    # 4. Association Rules Generation
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)

    # Filter by Lift > 1.00 and eliminate any single-item / trivial self loops
    filtered_rules = rules[rules["lift"] > min_lift].copy()

    # Calculate additional metrics & round
    filtered_rules["support"] = filtered_rules["support"].round(4)
    filtered_rules["confidence"] = filtered_rules["confidence"].round(4)
    filtered_rules["lift"] = filtered_rules["lift"].round(4)
    filtered_rules["leverage"] = filtered_rules["leverage"].round(4)
    filtered_rules["conviction"] = filtered_rules["conviction"].apply(lambda x: round(float(x), 4) if x != float("inf") else 999.99)

    # Format Antecedents and Consequents as clean readable strings
    filtered_rules["AntecedentProducts"] = filtered_rules["antecedents"].apply(lambda x: " + ".join(sorted(list(x))))
    filtered_rules["ConsequentProducts"] = filtered_rules["consequents"].apply(lambda x: " + ".join(sorted(list(x))))

    # Sort rules: Primary Lift desc, Secondary Confidence desc, Tertiary Support desc
    filtered_rules = filtered_rules.sort_values(by=["lift", "confidence", "support"], ascending=[False, False, False]).reset_index(drop=True)

    # Select columns for output
    rule_cols = [
        "AntecedentProducts", "ConsequentProducts", "support", "confidence", "lift", "leverage", "conviction"
    ]
    rules_out = filtered_rules[rule_cols]

    # Save all valid rules
    rules_csv_path = os.path.join(mining_data_dir, "association_rules.csv")
    rules_out.to_csv(rules_csv_path, index=False)

    # Top rules for Dashboard
    top_rules = rules_out.head(15).copy()
    top_rules_path = os.path.join(mining_data_dir, "top_association_rules.csv")
    top_rules.to_csv(top_rules_path, index=False)

    # 5. Empirical Verification of at least 3 rules directly against raw basket transactions
    rule_verifications = []
    top_to_verify = rules_out.head(3).to_dict(orient="records")

    for r in top_to_verify:
        ant = set(r["AntecedentProducts"].split(" + "))
        con = set(r["ConsequentProducts"].split(" + "))
        both = ant.union(con)

        count_ant = sum(1 for b in baskets if ant.issubset(b))
        count_both = sum(1 for b in baskets if both.issubset(b))
        count_con = sum(1 for b in baskets if con.issubset(b))

        emp_support = round(count_both / total_txns, 4)
        emp_confidence = round(count_both / count_ant, 4) if count_ant > 0 else 0.0
        p_con = count_con / total_txns
        emp_lift = round(emp_confidence / p_con, 4) if p_con > 0 else 0.0

        is_verified = (
            abs(emp_support - r["support"]) < 0.001 and
            abs(emp_confidence - r["confidence"]) < 0.001 and
            abs(emp_lift - r["lift"]) < 0.005
        )

        rule_verifications.append({
            "Antecedent": r["AntecedentProducts"],
            "Consequent": r["ConsequentProducts"],
            "RuleSupport": r["support"],
            "EmpiricalSupport": emp_support,
            "RuleConfidence": r["confidence"],
            "EmpiricalConfidence": emp_confidence,
            "RuleLift": r["lift"],
            "EmpiricalLift": emp_lift,
            "IsVerified": is_verified
        })

    return {
        "TotalTransactions": total_txns,
        "SingleItemTransactions": single_item_txns,
        "MultiItemTransactions": multi_item_txns,
        "MultiItemPercentage": multi_item_pct,
        "CrossStoreTransactions": cross_store_txns,
        "FrequentItemsetsCount": len(frequent_itemsets),
        "AssociationRulesCount": len(rules_out),
        "TopRules": top_rules.to_dict(orient="records"),
        "RuleVerifications": rule_verifications
    }


if __name__ == "__main__":
    res = run_market_basket_analysis()
    print("Market Basket Analysis Completed Successfully!")
    print(f"Total Transactions: {res['TotalTransactions']:,}")
    print(f"Multi-item Baskets: {res['MultiItemTransactions']:,} ({res['MultiItemPercentage']}%)")
    print(f"Frequent Itemsets: {res['FrequentItemsetsCount']}, Association Rules: {res['AssociationRulesCount']}")
    print("\nTop 5 Association Rules:")
    for i, r in enumerate(res["TopRules"][:5], 1):
        print(f"  {i}. [{r['AntecedentProducts']}] => [{r['ConsequentProducts']}] (Supp: {r['support']*100:.1f}%, Conf: {r['confidence']*100:.1f}%, Lift: {r['lift']:.2f})")
    print("\nRule Verification against Raw Transactions:")
    for v in res["RuleVerifications"]:
        print(f"  Verified {v['Antecedent']} => {v['Consequent']}: Support {v['EmpiricalSupport']} [{v['IsVerified']}], Conf {v['EmpiricalConfidence']}, Lift {v['EmpiricalLift']}")
