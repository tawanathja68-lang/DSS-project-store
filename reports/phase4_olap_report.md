# QuickMart Retail Insight DSS — Phase 4: OLAP Analysis Report

## 1. OLAP Architecture & Engine Design
The OLAP (Online Analytical Processing) layer acts as the high-performance analytical engine of **Retail Insight DSS**, sitting directly between the **Data Warehouse** and the **Decision Support Presentation / Dashboard Layer**.

The architecture establishes two unified, multi-dimensional relational cubes in-memory:
1. **Sales Analytical Cube (`sales_cube`)**: Integrates `Fact_Sales` (51,551 line items) with Conformed Dimensions `Dim_Date`, `Dim_Product`, `Dim_Store`, and `Dim_Promotion`.
2. **Inventory Analytical Cube (`inventory_cube`)**: Integrates `Fact_Inventory` (177,450 daily snapshots) with Conformed Dimensions `Dim_Date`, `Dim_Product`, and `Dim_Store`.

```mermaid
flowchart TD
    subgraph DW["Data Warehouse Layer (Star Schema)"]
        FS[Fact_Sales]
        FI[Fact_Inventory]
        DD[Dim_Date]
        DP[Dim_Product]
        DS[Dim_Store]
        DPR[Dim_Promotion]
    end

    subgraph OLAP["OLAP Processing Engine"]
        SC[Sales Multi-dimensional Cube]
        IC[Inventory Multi-dimensional Cube]
        
        FS & DD & DP & DS & DPR --> SC
        FI & DD & DP & DS --> IC

        M_Sales["Sales Measures:<br/>• Total Sales (SUM)<br/>• Total Profit (SUM)<br/>• Distinct Txns (COUNT)<br/>• ATV & Weighted Margin"]
        M_Inv["Inventory Measures:<br/>• Avg Ending Stock (AVG)<br/>• Point-in-time Stock<br/>• Status Incident Counts"]
        
        SC --> M_Sales
        IC --> M_Inv
    end

    subgraph OPS["OLAP Multi-dimensional Operations"]
        O_Slice["Slice (1 Dimension Axis)"]
        O_Dice["Dice (Multi-Dimensional Box)"]
        O_DD["Drill-Down (Higher -> Finer Level)"]
        O_RU["Roll-Up (Finer -> Higher Level)"]
    end

    subgraph OUT["Pre-Aggregated Dashboard Data"]
        P1["8 Sales Aggregate CSVs"]
        P2["6 Inventory Aggregate CSVs"]
    end

    M_Sales & M_Inv --> OPS
    OPS --> OUT
```

---

## 2. Dimension Hierarchies
The engine defines three strict drill-down / roll-up hierarchies:

1. **Time Dimension Hierarchy**:
   $$\text{Day (FullDate)} \longrightarrow \text{Month} \longrightarrow \text{Quarter} \longrightarrow \text{Year (2026)}$$
2. **Product Dimension Hierarchy**:
   $$\text{Product / SKU (65 SKUs)} \longrightarrow \text{SubCategory (24 SubCats)} \longrightarrow \text{Category (8 Main Cats)}$$
3. **Location Dimension Hierarchy**:
   $$\text{Store (10 Branches)} \longrightarrow \text{Province (8 Provinces)} \longrightarrow \text{Region (5 Regions)}$$

---

## 3. Measures Definition & Mathematical Standards

### 3.1 Sales Measures
* **Total Sales**: $\sum \text{SalesAmount} = \mathbf{1,595,166.51\text{ THB}}$
* **Total Cost**: $\sum \text{CostAmount} = \mathbf{1,095,490.00\text{ THB}}$
* **Total Profit**: $\sum \text{Profit} = \mathbf{499,676.51\text{ THB}}$
* **Total Quantity Sold**: $\sum \text{Quantity} = \mathbf{71,885\text{ units}}$
* **Transaction Count**: $\text{COUNT DISTINCT(TransactionID)} = \mathbf{26,327\text{ baskets}}$
* **Average Transaction Value (ATV)**: $\frac{\text{Total Sales}}{\text{Transaction Count}} = \mathbf{60.59\text{ THB/basket}}$
* **Overall Profit Margin**: $\frac{\sum \text{Profit}}{\sum \text{SalesAmount}} \times 100\% = \mathbf{31.32\%}$  
  *(Enforced: NEVER average the ProfitMargin column across rows; weighted margin strictly applied).*

### 3.2 Inventory Measures (Semi-Additive Behavior)
* **Average Ending Stock**: $\text{AVG}(\text{EndingStock}) = \mathbf{45.44\text{ units/store-SKU}}$
* **Current Physical Network Stock (2026-09-30)**: $\mathbf{29,796\text{ units}}$
* **Total Stock In**: $\sum \text{StockIn} = \mathbf{108,790\text{ units}}$
* **Total Stock Out**: $\sum \text{StockOut} = \mathbf{71,885\text{ units}}$ (Matches Sales Quantity 100%)
* **Status Distribution**:
  * `NORMAL`: 171,507 snapshots ($96.65\%$)
  * `REORDER`: 3,581 snapshots ($2.02\%$)
  * `OVERSTOCK`: 2,239 snapshots ($1.26\%$)
  * `OUT OF STOCK`: 123 snapshots ($0.07\%$)

---

## 4. Slice Operations (4 Real Warehouse Cases)

| Slice ID | Filter Dimension & Value | Total Sales (THB) | Total Profit (THB) | Profit Margin | Txns | Business Context |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Slice A** | `Region = 'Isan'` | 424,934.58 | 133,108.08 | 31.32% | 6,966 | 3 stores in Northeastern region |
| **Slice B** | `Category = 'Beverages'` | 287,571.01 | 108,519.51 | **37.74%** | 13,430 | High-margin beverage portfolio |
| **Slice C** | `Quarter = 2` (Apr–Jun) | 544,304.94 | 170,091.44 | 31.25% | 8,918 | Peak sales quarter (Songkran festival) |
| **Slice D** | `StoreKey = 1` (Siam Square) | 191,969.79 | 60,532.79 | 31.53% | 3,196 | Flagship downtown commercial branch |

---

## 5. Dice Operations (4 Real Warehouse Cases)

| Dice ID | Multi-dimensional Filters | Total Sales (THB) | Total Profit (THB) | Margin | Txns | Business Context |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Dice A** | `Region = 'Isan'` AND `Category = 'Beverages'` AND `Quarter = 2` | 26,360.10 | 9,942.10 | **37.72%** | 1,213 | Beverage performance in summer across Isan |
| **Dice B** | `Region = 'Central'` AND `Category = 'Ready-to-Eat'` AND `Month = 7` | 7,530.95 | 2,319.45 | 30.80% | 162 | Chilled food performance in BKK offices in July |
| **Dice C** | `Region = 'South'` AND `Promotion != No Promotion` AND `Quarter = 3` | 73,765.00 | 25,787.50 | **34.96%** | 1,155 | Promotional responsiveness in southern tourist hubs |
| **Dice D** | `Category IN ('Beverages', 'Snacks', 'Bakery')` AND `Store IN (1, 2, 6, 8)` AND `Date BETWEEN 2026-04-01 AND 2026-06-30` | 123,329.89 | 40,516.89 | 32.85% | 2,984 | Grab-and-go snack items in prime tourist & commercial stores during Q2 |

---

## 6. Drill-Down Operations (3 Real Warehouse Cases)

### 6.1 Time Drill-Down: Quarter 2 $\longrightarrow$ Months
* **Quarter 2 Summary**: Sales = 544,304.94 THB | Profit = 170,091.44 THB | Margin = 31.25%
  * $\downarrow$ **Month 4 (April)**: Sales = 191,864.95 THB | Margin = 31.68% (Songkran festival surge)
  * $\downarrow$ **Month 5 (May)**: Sales = 183,314.79 THB | Margin = 31.39%
  * $\downarrow$ **Month 6 (June)**: Sales = 169,125.20 THB | Margin = 30.61%

### 6.2 Product Drill-Down: Category `Beverages` $\longrightarrow$ SubCategories
* **Beverages Category Summary**: Sales = 287,571.01 THB | Margin = 37.74%
  * $\downarrow$ **Canned Coffee**: Sales = 88,982.42 THB | Margin = 37.98%
  * $\downarrow$ **Carbonated Soft Drink**: Sales = 64,323.52 THB | Margin = 37.20%
  * $\downarrow$ **Ready-to-Drink Tea**: Sales = 56,664.00 THB | Margin = 36.89%
  * $\downarrow$ **Drinking Water**: Sales = 37,320.01 THB | Margin = 32.25%
  * $\downarrow$ **Mineral Water**: Sales = 30,990.72 THB | Margin = **47.28%**
  * $\downarrow$ **Energy Drink**: Sales = 5,131.54 THB | Margin = 35.03%
  * $\downarrow$ **Fruit Juice**: Sales = 4,158.80 THB | Margin = 33.88%

### 6.3 Location Drill-Down: Region `Central` $\longrightarrow$ Individual Stores
* **Central Region Summary**: Sales = 370,630.09 THB | Margin = 31.42%
  * $\downarrow$ **STR-001 (QuickMart Siam Square)**: Sales = 191,969.79 THB | Margin = 31.53%
  * $\downarrow$ **STR-002 (QuickMart Silom Complex)**: Sales = 178,660.30 THB | Margin = 31.30%

---

## 7. Roll-Up Operations (3 Real Warehouse Cases)

### 7.1 Time Roll-Up: Month $\longrightarrow$ Quarter
* **Quarter 1 (Jan–Mar)**: Sales = 522,847.63 THB | Profit = 164,391.13 THB | Margin = 31.44%
* **Quarter 2 (Apr–Jun)**: Sales = 544,304.94 THB | Profit = 170,091.44 THB | Margin = 31.25%
* **Quarter 3 (Jul–Sep)**: Sales = 528,013.94 THB | Profit = 165,193.94 THB | Margin = 31.29%
* $\mathbf{\sum \text{Quarters}} = \mathbf{1,595,166.51\text{ THB}}$ (Exact match with Grand Total)

### 7.2 Location Roll-Up: Store $\longrightarrow$ Region
* **Isan (3 Stores)**: Sales = 424,934.58 THB (26.6%) | Margin = 31.32%
* **Central (2 Stores)**: Sales = 370,630.09 THB (23.2%) | Margin = 31.42%
* **South (2 Stores)**: Sales = 320,434.10 THB (20.1%) | Margin = 31.31%
* **North (2 Stores)**: Sales = 298,762.89 THB (18.7%) | Margin = 31.23%
* **East (1 Store)**: Sales = 180,404.85 THB (11.3%) | Margin = 31.31%
* $\mathbf{\sum \text{Regions}} = \mathbf{1,595,166.51\text{ THB}}$ (Exact match with Grand Total)

### 7.3 Product Roll-Up: SubCategory $\longrightarrow$ Category
* **Beverages**: Sales = 287,571.01 THB | Margin = 37.74%
* **Ready-to-Eat**: Sales = 276,432.18 THB | Margin = 33.15%
* **Dairy**: Sales = 246,128.84 THB | Margin = 31.54%
* **Snacks**: Sales = 239,944.30 THB | Margin = 32.70%
* **Bakery**: Sales = 221,418.90 THB | Margin = 32.48%
* **Instant Food**: Sales = 166,419.48 THB | Margin = 29.85%
* **Personal Care**: Sales = 89,956.10 THB | Margin = **41.20%**
* **Household**: Sales = 67,295.70 THB | Margin = 36.42%
* $\mathbf{\sum \text{Categories}} = \mathbf{1,595,166.51\text{ THB}}$ (Exact match with Grand Total)

---

## 8. Additive & Semi-Additive Validation Results

| Test Description | Expected Value | Computed Value | Status |
| :--- | :---: | :---: | :---: |
| **Sum Sales by Product == Grand Total** | 1,595,166.51 THB | 1,595,166.51 THB |  **PASS** |
| **Sum Sales by Store == Grand Total** | 1,595,166.51 THB | 1,595,166.51 THB |  **PASS** |
| **Sum Sales by Month == Grand Total** | 1,595,166.51 THB | 1,595,166.51 THB |  **PASS** |
| **Sum Sales by Category == Grand Total** | 1,595,166.51 THB | 1,595,166.51 THB |  **PASS** |
| **Sum Sales by Region == Grand Total** | 1,595,166.51 THB | 1,595,166.51 THB |  **PASS** |
| **Total Transaction Count (Distinct TxnID)** | 26,327 | 26,327 |  **PASS** |
| **Overall Weighted Margin Calculation** | 31.32% | 31.32% |  **PASS** |
| **Inventory Semi-Additivity Enforcement** | Average / Last-Day | 45.44 avg / 29,796 end |  **PASS** |

---

## 9. Key Business Insights from Data Warehouse (10 Actionable Insights)

1. **Top Revenue Driver:** **Beverages** generates the highest sales revenue (**287,571.01 THB**, 18.0% of total network sales), led by Canned Coffee and Carbonated Soft Drinks.
2. **Highest Margin Category:** **Personal Care** yields the highest gross profit margin (**41.20%**), followed closely by **Beverages (37.74%)** and **Household (36.42%)**.
3. **High Volume but Low Margin:** **Instant Food** contributes 166,419.48 THB in sales but operates at the lowest profit margin (**29.85%**) due to tight staple pricing.
4. **Seasonal Peak in Q2:** Quarter 2 generated **544,304.94 THB** (highest among all quarters), with **April (Month 4) hitting peak monthly sales of 191,864.95 THB** driven by Songkran holiday travel.
5. **Highest Performing Store:** **STR-001 (Siam Square)** generated the highest store revenue (**191,969.79 THB** across 3,196 transactions), closely followed by **STR-008 (Pattaya Beach: 180,404.85 THB)**.
6. **Regional Revenue Leader:** **Isan region** leads total network revenue (**424,934.58 THB**, 26.6%) due to its 3 active locations (Khon Kaen, Korat, Ubon).
7. **Promotion Effectiveness:** Promotional campaigns drove **35.2% of total transactions**, delivering a healthy **33.1% profit margin**, proving that promotions stimulate basket volume without eroding profitability.
8. **Stable Stockout Rate:** Out-of-stock events occurred in only **123 out of 177,450 daily snapshots (0.07%)**, confirming reliable supplier replenishment pipelines.
9. **Reorder Threshold Pressure:** Exactly **3,581 snapshots (2.02%)** reached `REORDER` status, predominantly in fast-moving beverage and fresh bakery SKUs, signaling high inventory turnover.
10. **Overstock Containment:** `OVERSTOCK` represents **1.26% of inventory snapshots (2,239 rows)**, primarily occurring in non-perishable Household and Personal Care SKUs after promotional bulk shipments.

---

## 10. Dashboard-Ready Aggregation Output Files

All 14 pre-aggregated CSV datasets have been generated and saved in `quickmart-dss/data/olap/`:

| File Name | Dimension Grouping | Rows | Primary Purpose |
| :--- | :--- | :---: | :--- |
| `sales_by_day.csv` | DateKey, FullDate, DayOfWeek, IsWeekend | 273 | Daily sales trendline chart & weekend comparison |
| `sales_by_month.csv` | Year, Month, MonthName, Quarter | 9 | Monthly executive sales & profit performance |
| `sales_by_quarter.csv` | Year, Quarter | 3 | Quarterly strategic review |
| `sales_by_product.csv` | ProductKey, ProductID, Category, Brand | 65 | SKU ranking table, Pareto analysis & pricing optimization |
| `sales_by_category.csv` | Category | 8 | Category market share donut & bar charts |
| `sales_by_store.csv` | StoreKey, StoreName, Region, Province | 10 | Branch comparison & regional benchmarking |
| `sales_by_region.csv` | Region | 5 | Geographic performance map & regional distribution |
| `sales_by_promotion.csv` | PromotionKey, PromotionName, Discount% | 7 | Campaign ROI & promotional effectiveness |
| `inventory_by_day.csv` | DateKey, FullDate, IsWeekend | 273 | Network stock availability & stock movement trends |
| `inventory_by_product.csv` | ProductKey, ProductID, Category | 65 | SKU stock health, reorder rate, and stockout frequency |
| `inventory_by_store.csv` | StoreKey, StoreName, Region | 10 | Store-level stockout & replenishment risk audit |
| `inventory_status_summary.csv` | InventoryStatus | 4 | Executive stock status breakdown pie/donut chart |
| `inventory_reorder_summary.csv` | ProductKey, StoreKey, Category | 439 | Actionable alert list for store replenishment managers |
| `out_of_stock_summary.csv` | ProductKey, StoreKey, Category | 21 | Critical stockout incident analysis |

---

## 11. OLAP vs. Data Mining: Conceptual Distinction

* **OLAP (Online Analytical Processing)**:
  * *Nature*: **Verification-driven / Deductive Analysis**.
  * *Purpose*: Answers **pre-formulated business questions** across known dimension coordinates (Who, What, Where, When).
  * *Example*: *"What was the total revenue and profit margin of Beverages in the Isan region during Q2 2026?"*
* **Data Mining**:
  * *Nature*: **Discovery-driven / Inductive Machine Learning**.
  * *Purpose*: Uncovers **hidden patterns, clusters, and associations** that humans did not hypothesize or know in advance.
  * *Example*: *"Which distinct behavioral clusters (K-Means) characterize our 65 SKUs based on volume, revenue, and margin?"* and *"What frequent itemsets (Association Rules) appear together in customer shopping baskets (e.g. Coffee + Pastry) with Lift > 1.2?"*

---

## 12. Final Phase Status
* **Phase 4 Status: READY (100% Complete)**
* All mathematical aggregations match Grand Totals to the cent ($0.00$ variance).
* Pre-aggregated tables ready to serve the Next.js Frontend with zero browser lag.
* The system is fully primed to proceed to **Phase 5: Data Mining (K-Means & Association Rule Mining)**.
