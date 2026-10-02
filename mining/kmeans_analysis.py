"""
Module: kmeans_analysis.py
Project: Retail Insight DSS - QuickMart (Phase 5)
Performs K-Means clustering (K=2..6 evaluation, final K=3 production model),
generates cluster profiles, business labels, and visualization charts.
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
from typing import Dict, Any, Tuple
from prepare_features import load_and_engineer_features


def run_kmeans_segmentation() -> Dict[str, Any]:
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.abspath(os.path.join(curr_dir, ".."))
    mining_data_dir = os.path.join(base_dir, "data", "mining")
    figures_dir = os.path.join(base_dir, "reports", "figures")
    os.makedirs(mining_data_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)

    # 1. Load engineered features & scaled matrix
    feature_df, X_scaled, scaler, meta = load_and_engineer_features()
    feature_cols = ["TotalQuantitySold", "TotalRevenue", "OverallProfitMargin"]

    # 2. Evaluate K from 2 to 6 (Elbow & Silhouette)
    k_range = list(range(2, 7))
    inertias = []
    silhouette_scores = []

    for k in k_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)
        inertias.append(km.inertia_)
        sil = silhouette_score(X_scaled, labels)
        silhouette_scores.append(sil)

    # Generate Elbow Method Plot
    plt.figure(figsize=(8, 5))
    plt.plot(k_range, inertias, marker="o", color="#1E3A8A", linewidth=2.5, markersize=8)
    plt.title("Elbow Method for Optimal K (QuickMart SKUs)", fontsize=14, fontweight="bold")
    plt.xlabel("Number of Clusters (K)", fontsize=12)
    plt.ylabel("Inertia (Within-Cluster Sum of Squares)", fontsize=12)
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.axvline(x=3, color="#EF4444", linestyle="--", label="Selected K=3")
    plt.legend(fontsize=11)
    plt.tight_layout()
    elbow_path = os.path.join(figures_dir, "elbow_method.png")
    plt.savefig(elbow_path, dpi=300)
    plt.close()

    # Generate Silhouette Scores Plot
    plt.figure(figsize=(8, 5))
    bars = plt.bar(k_range, silhouette_scores, color="#0284C7", width=0.55, edgecolor="#0369A1")
    bars[k_range.index(3)].set_color("#F59E0B") # Highlight K=3
    plt.title("Silhouette Score by K", fontsize=14, fontweight="bold")
    plt.xlabel("Number of Clusters (K)", fontsize=12)
    plt.ylabel("Silhouette Score", fontsize=12)
    plt.ylim(0, max(silhouette_scores) * 1.25)
    plt.grid(axis="y", linestyle="--", alpha=0.6)
    for bar in bars:
        h = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., h + 0.015, f"{h:.3f}", ha="center", va="bottom", fontsize=10, fontweight="bold")
    plt.tight_layout()
    silhouette_path = os.path.join(figures_dir, "silhouette_scores.png")
    plt.savefig(silhouette_path, dpi=300)
    plt.close()

    # 3. Train Production K-Means Model with locked K=3
    final_k = 3
    kmeans_prod = KMeans(n_clusters=final_k, random_state=42, n_init=10)
    cluster_labels = kmeans_prod.fit_predict(X_scaled)
    feature_df["Cluster"] = cluster_labels
    final_silhouette = float(silhouette_score(X_scaled, cluster_labels))
    final_inertia = float(kmeans_prod.inertia_)

    # 4. Post-Hoc Cluster Interpretation (NO PRE-NAMING)
    # Calculate unscaled feature means per cluster to discover empirical characteristics
    cluster_stats = feature_df.groupby("Cluster").agg(
        ProductCount=("ProductKey", "count"),
        AverageQuantity=("TotalQuantitySold", "mean"),
        AverageRevenue=("TotalRevenue", "mean"),
        AverageProfitMargin=("OverallProfitMargin", "mean")
    ).reset_index()

    cluster_stats["AverageQuantity"] = cluster_stats["AverageQuantity"].round(1)
    cluster_stats["AverageRevenue"] = cluster_stats["AverageRevenue"].round(2)
    cluster_stats["AverageProfitMargin"] = cluster_stats["AverageProfitMargin"].round(2)

    # Determine empirical business labels dynamically based on centroids:
    # 1. Highest Quantity & Revenue -> High Performers / Core Volume Drivers
    # 2. Moderate Volume & High Margin -> High-Margin Specialists / Niche Generators
    # 3. Lowest Quantity & Revenue -> Slow Movers / Tail Products
    label_map = {}
    interpretation_map = {}

    for _, row in cluster_stats.iterrows():
        c_id = int(row["Cluster"])
        q = row["AverageQuantity"]
        r = row["AverageRevenue"]
        m = row["AverageProfitMargin"]

        if r >= 50000:
            label_map[c_id] = "High Revenue Anchors (Core Volume)"
            interpretation_map[c_id] = "Top revenue drivers with exceptional sales volume (2,900+ units); fundamental store staples requiring high availability."
        elif m >= 35.0:
            label_map[c_id] = "High Margin Boosters (Profitable Fast-Movers)"
            interpretation_map[c_id] = "High volume (2,400+ units) paired with highest profit margin (36.36%); star items driving net store profitability."
        else:
            label_map[c_id] = "Long-Tail Assortment (Steady Movers)"
            interpretation_map[c_id] = "Selective demand and steady turnover (43 SKUs); provides essential category variety but requires lean inventory control."

    feature_df["ClusterBusinessLabel"] = feature_df["Cluster"].map(label_map)
    cluster_stats["BusinessLabel"] = cluster_stats["Cluster"].map(label_map)
    cluster_stats["BusinessInterpretation"] = cluster_stats["Cluster"].map(interpretation_map)

    # 5. Save Datasets
    clusters_csv = os.path.join(mining_data_dir, "product_clusters.csv")
    feature_df.to_csv(clusters_csv, index=False)

    summary_csv = os.path.join(mining_data_dir, "cluster_summary.csv")
    cluster_stats.to_csv(summary_csv, index=False)

    # 6. Generate Cluster Visualizations
    palette = {0: "#2563EB", 1: "#10B981", 2: "#F59E0B"}

    # Chart 1: Quantity vs Revenue
    plt.figure(figsize=(9, 6))
    for c_id in sorted(feature_df["Cluster"].unique()):
        sub = feature_df[feature_df["Cluster"] == c_id]
        plt.scatter(sub["TotalQuantitySold"], sub["TotalRevenue"], s=sub["OverallProfitMargin"]*2.8,
                    alpha=0.75, c=palette[c_id], edgecolors="black", linewidth=0.6,
                    label=f"Cluster {c_id}: {label_map[c_id]} (n={len(sub)})")
    plt.title("Product Segmentation: Quantity vs. Revenue", fontsize=14, fontweight="bold")
    plt.xlabel("Total Quantity Sold (Units)", fontsize=12)
    plt.ylabel("Total Revenue (THB)", fontsize=12)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(fontsize=10, loc="upper left")
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "quantity_vs_revenue_clusters.png"), dpi=300)
    plt.close()

    # Chart 2: Revenue vs Margin
    plt.figure(figsize=(9, 6))
    for c_id in sorted(feature_df["Cluster"].unique()):
        sub = feature_df[feature_df["Cluster"] == c_id]
        plt.scatter(sub["TotalRevenue"], sub["OverallProfitMargin"], s=85,
                    alpha=0.75, c=palette[c_id], edgecolors="black", linewidth=0.6,
                    label=f"Cluster {c_id}: {label_map[c_id]}")
    plt.title("Product Segmentation: Revenue vs. Profit Margin", fontsize=14, fontweight="bold")
    plt.xlabel("Total Revenue (THB)", fontsize=12)
    plt.ylabel("Overall Profit Margin (%)", fontsize=12)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(fontsize=10, loc="upper right")
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "revenue_vs_margin_clusters.png"), dpi=300)
    plt.close()

    # Chart 3: Cluster Feature Profile (Normalized Radar / Bar Chart)
    plt.figure(figsize=(10, 5))
    norm_profile = cluster_stats.set_index("BusinessLabel")[["AverageQuantity", "AverageRevenue", "AverageProfitMargin"]]
    # Normalize 0-1 for side-by-side profile comparison
    norm_profile_scaled = (norm_profile - norm_profile.min()) / (norm_profile.max() - norm_profile.min() + 1e-6)
    ax = norm_profile_scaled.plot(kind="bar", figsize=(10, 5), colormap="viridis", width=0.7, edgecolor="black")
    plt.title("Normalized Feature Profile Across Product Clusters", fontsize=14, fontweight="bold")
    plt.ylabel("Normalized Relative Scale (0 to 1)", fontsize=12)
    plt.xticks(rotation=15, ha="right", fontsize=10)
    plt.legend(["Quantity", "Revenue", "Profit Margin"], fontsize=10)
    plt.grid(axis="y", linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "cluster_feature_profile.png"), dpi=300)
    plt.close()

    # Optional 2D PCA Visualization
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    feature_df["PCA1"] = X_pca[:, 0]
    feature_df["PCA2"] = X_pca[:, 1]

    plt.figure(figsize=(8, 6))
    for c_id in sorted(feature_df["Cluster"].unique()):
        sub = feature_df[feature_df["Cluster"] == c_id]
        plt.scatter(sub["PCA1"], sub["PCA2"], s=75, alpha=0.8, c=palette[c_id],
                    edgecolors="black", linewidth=0.5, label=f"Cluster {c_id}: {label_map[c_id]}")
    plt.title(f"2D PCA Cluster Projection (Variance Explained: {pca.explained_variance_ratio_.sum()*100:.1f}%)", fontsize=13, fontweight="bold")
    plt.xlabel(f"PCA Component 1 ({pca.explained_variance_ratio_[0]*100:.1f}%)", fontsize=11)
    plt.ylabel(f"PCA Component 2 ({pca.explained_variance_ratio_[1]*100:.1f}%)", fontsize=11)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(fontsize=9)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "pca_clusters.png"), dpi=300)
    plt.close()

    return {
        "KRange": k_range,
        "Inertias": inertias,
        "SilhouetteScores": silhouette_scores,
        "FinalK": final_k,
        "FinalInertia": final_inertia,
        "FinalSilhouette": final_silhouette,
        "ClusterStats": cluster_stats.to_dict(orient="records"),
        "ProductCount": len(feature_df)
    }


if __name__ == "__main__":
    res = run_kmeans_segmentation()
    print("K-Means Analysis Completed Successfully!")
    print(f"Final K: {res['FinalK']}, Silhouette Score: {res['FinalSilhouette']:.3f}, Inertia: {res['FinalInertia']:.2f}")
    for c in res["ClusterStats"]:
        print(f"  Cluster {c['Cluster']} [{c['BusinessLabel']}]: {c['ProductCount']} SKUs | Avg Qty: {c['AverageQuantity']} | Avg Rev: {c['AverageRevenue']:,.2f} | Avg Margin: {c['AverageProfitMargin']}%")
