"""
Export and prepare validated OLAP and Data Mining datasets for the Next.js frontend.
Places CSV and JSON files in quickmart-dss/public/data/
"""

import os
import shutil
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_DATA_DIR = os.path.join(BASE_DIR, "public", "data")

def main():
    print("Preparing Frontend Data Assets...")
    
    # 1. Target directories
    olap_target = os.path.join(PUBLIC_DATA_DIR, "olap")
    mining_target = os.path.join(PUBLIC_DATA_DIR, "mining")
    wh_target = os.path.join(PUBLIC_DATA_DIR, "warehouse")
    
    os.makedirs(olap_target, exist_ok=True)
    os.makedirs(mining_target, exist_ok=True)
    os.makedirs(wh_target, exist_ok=True)
    
    # 2. Copy OLAP CSVs and convert to JSON
    olap_src = os.path.join(DATA_DIR, "olap")
    for fname in os.listdir(olap_src):
        if fname.endswith(".csv"):
            src_path = os.path.join(olap_src, fname)
            dst_csv = os.path.join(olap_target, fname)
            shutil.copy2(src_path, dst_csv)
            
            # Convert to JSON for direct high-speed client import/fetch
            df = pd.read_csv(src_path, encoding='utf-8-sig')
            json_name = fname.replace(".csv", ".json")
            dst_json = os.path.join(olap_target, json_name)
            df.to_json(dst_json, orient="records", date_format="iso")
            print(f"  [OLAP] Copied {fname} & generated {json_name} ({len(df)} rows)")

    # 3. Copy Mining CSVs and convert to JSON
    mining_src = os.path.join(DATA_DIR, "mining")
    for fname in os.listdir(mining_src):
        if fname.endswith(".csv"):
            src_path = os.path.join(mining_src, fname)
            dst_csv = os.path.join(mining_target, fname)
            shutil.copy2(src_path, dst_csv)
            
            df = pd.read_csv(src_path, encoding='utf-8-sig')
            json_name = fname.replace(".csv", ".json")
            dst_json = os.path.join(mining_target, json_name)
            df.to_json(dst_json, orient="records", date_format="iso")
            print(f"  [MINING] Copied {fname} & generated {json_name} ({len(df)} rows)")

    # 4. Copy Dimensions from Warehouse
    wh_src = os.path.join(DATA_DIR, "warehouse")
    for dim_name in ["dim_product.csv", "dim_store.csv", "dim_date.csv", "dim_promotion.csv"]:
        src_path = os.path.join(wh_src, dim_name)
        if os.path.exists(src_path):
            df = pd.read_csv(src_path, encoding='utf-8-sig')
            json_name = dim_name.replace(".csv", ".json")
            dst_json = os.path.join(wh_target, json_name)
            df.to_json(dst_json, orient="records", date_format="iso")
            print(f"  [DIM] Exported {json_name} ({len(df)} rows)")

    # 5. Build Current Inventory Snapshot (Date: 2026-09-30) for Reorder Alert Table
    fact_inv_path = os.path.join(DATA_DIR, "warehouse", "fact_inventory.csv")
    dim_prod_path = os.path.join(DATA_DIR, "warehouse", "dim_product.csv")
    dim_store_path = os.path.join(DATA_DIR, "warehouse", "dim_store.csv")
    clusters_path = os.path.join(DATA_DIR, "mining", "product_clusters.csv")
    
    if os.path.exists(fact_inv_path) and os.path.exists(dim_prod_path):
        inv_df = pd.read_csv(fact_inv_path, encoding='utf-8-sig')
        prod_df = pd.read_csv(dim_prod_path, encoding='utf-8-sig')
        store_df = pd.read_csv(dim_store_path, encoding='utf-8-sig')
        cluster_df = pd.read_csv(clusters_path, encoding='utf-8-sig')
        
        # Last day is 20260930
        latest_date = inv_df['DateKey'].max()
        inv_latest = inv_df[inv_df['DateKey'] == latest_date].copy()
        
        # Merge product details
        inv_merged = inv_latest.merge(prod_df[['ProductKey', 'ProductID', 'ProductName', 'Category', 'SubCategory']], on='ProductKey', how='left')
        inv_merged = inv_merged.merge(store_df[['StoreKey', 'StoreID', 'StoreName', 'Region', 'Province']], on='StoreKey', how='left')
        inv_merged = inv_merged.merge(cluster_df[['ProductKey', 'Cluster', 'ClusterBusinessLabel']], on='ProductKey', how='left')
        
        # Calculate status according to locked business logic
        def get_status(row):
            if row['EndingStock'] == 0:
                return 'OUT OF STOCK'
            elif row['EndingStock'] <= row['ReorderPoint']:
                return 'REORDER'
            elif row['EndingStock'] > row['MaxStockLevel']:
                return 'OVERSTOCK'
            return 'NORMAL'
            
        inv_merged['InventoryStatus'] = inv_merged.apply(get_status, axis=1)
        
        # Calculate DSS Review Priority based on Cluster and Status
        def get_priority(row):
            status = row['InventoryStatus']
            cluster = row['Cluster']
            if status == 'OUT OF STOCK':
                return 'Urgent Priority'
            elif status == 'REORDER':
                if cluster == 0:
                    return 'High (Core Volume Anchor)'
                elif cluster == 2:
                    return 'Medium-High (Profit Booster)'
                else:
                    return 'Medium (Long-Tail Assortment)'
            elif status == 'OVERSTOCK':
                return 'Low (Holding Cost Review)'
            return 'Routine Monitoring'
            
        inv_merged['SuggestedReviewPriority'] = inv_merged.apply(get_priority, axis=1)
        
        inv_snapshot_file = os.path.join(olap_target, "inventory_current_snapshot.json")
        inv_merged.to_json(inv_snapshot_file, orient="records", date_format="iso")
        print(f"  [INVENTORY SNAPSHOT] Generated {inv_snapshot_file} ({len(inv_merged)} rows, Total Stock: {inv_merged['EndingStock'].sum()})")

    # 6. Build Multi-Dimensional Monthly Sales Cube for Dynamic Slicing/Dicing
    fact_sales_path = os.path.join(DATA_DIR, "warehouse", "fact_sales.csv")
    if os.path.exists(fact_sales_path):
        sales_df = pd.read_csv(fact_sales_path, encoding='utf-8-sig')
        sales_df['YearMonth'] = sales_df['DateKey'].astype(str).str[:6]
        cube_df = sales_df.groupby(['YearMonth', 'StoreKey', 'ProductKey']).agg({
            'Quantity': 'sum',
            'SalesAmount': 'sum',
            'CostAmount': 'sum',
            'Profit': 'sum',
            'TransactionID': 'nunique'
        }).reset_index()
        
        # Join product and store dimensions
        cube_df = cube_df.merge(prod_df[['ProductKey', 'ProductID', 'ProductName', 'Category', 'SubCategory']], on='ProductKey', how='left')
        cube_df = cube_df.merge(store_df[['StoreKey', 'StoreName', 'Region', 'Province']], on='StoreKey', how='left')
        cube_df = cube_df.merge(cluster_df[['ProductKey', 'Cluster', 'ClusterBusinessLabel']], on='ProductKey', how='left')
        
        cube_file = os.path.join(olap_target, "sales_cube_monthly.json")
        cube_df.to_json(cube_file, orient="records", date_format="iso")
        print(f"  [SALES CUBE] Generated {cube_file} ({len(cube_df)} rows, Total Sales: {cube_df['SalesAmount'].sum():.2f})")

    print("Frontend Data Assets Ready!")

if __name__ == "__main__":
    main()
