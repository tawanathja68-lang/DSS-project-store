# QuickMart Data Dictionary

**Project**: Retail Insight Decision Support System (DSS) — QuickMart  
**Scope**: 10 Branch Convenience Chain (Thailand), 65 SKUs across 8 Categories  
**Date Range**: January 1, 2026 – September 30, 2026 (273 Days)  
**Schema Architecture**: Star Schema / Fact Constellation (2 Fact Tables, 4 Dimension Tables)

---

## 1. Dimension Tables

### 1.1 `dim_date`
Represents the temporal dimension at daily granularity across the entire analysis window.

| Column Name | Data Type | Constraint | Description | Example / Range |
| :--- | :--- | :--- | :--- | :--- |
| `DateKey` | INTEGER | PRIMARY KEY | Unique date surrogate key (YYYYMMDD) | `20260101` – `20260930` |
| `FullDate` | DATE | NOT NULL | Calendar date in ISO format | `2026-01-01` |
| `DayOfWeek` | INTEGER | NOT NULL | Day of week integer (1=Sunday, 7=Saturday) | `1` to `7` |
| `DayName` | VARCHAR(10) | NOT NULL | Full English day name | `Thursday` |
| `Month` | INTEGER | NOT NULL | Calendar month integer | `1` to `9` |
| `MonthName` | VARCHAR(15) | NOT NULL | Full English month name | `January`, `September` |
| `Quarter` | VARCHAR(2) | NOT NULL | Calendar quarter identifier | `Q1`, `Q2`, `Q3` |
| `Year` | INTEGER | NOT NULL | Calendar year | `2026` |
| `IsWeekend` | BOOLEAN | NOT NULL | Flag indicating Saturday or Sunday | `TRUE`, `FALSE` |
| `IsHoliday` | BOOLEAN | NOT NULL | Flag indicating Thai statutory public holidays | `TRUE`, `FALSE` |
| `Season` | VARCHAR(15) | NOT NULL | Thailand seasonal classification | `Cool`, `Hot`, `Rainy` |

---

### 1.2 `dim_store`
Represents the 10 QuickMart branches situated across diverse regions in Thailand.

| Column Name | Data Type | Constraint | Description | Example / Range |
| :--- | :--- | :--- | :--- | :--- |
| `StoreID` | VARCHAR(10) | PRIMARY KEY | Unique store identifier | `ST001` to `ST010` |
| `StoreName` | VARCHAR(100) | NOT NULL | Branch commercial designation | `Silom Express`, `Nimman Road` |
| `Region` | VARCHAR(20) | NOT NULL | Geographic macro-region | `Central`, `North`, `Northeast`, `South`, `East` |
| `Province` | VARCHAR(50) | NOT NULL | Province location | `Bangkok`, `Chiang Mai`, `Phuket` |
| `StoreType` | VARCHAR(30) | NOT NULL | Operational store format | `CBD`, `Residential`, `Tourist`, `Transit` |
| `SizeCategory` | VARCHAR(10) | NOT NULL | Floor area classification | `Small` (<80 m²), `Medium` (80–140 m²), `Large` (>140 m²) |
| `FloorAreaSqM` | DECIMAL(6,2)| NOT NULL | Total sales floor area in square meters | `65.00` to `160.00` |
| `TargetCustomer`| VARCHAR(50) | NOT NULL | Primary target demographic segment | `Office Workers`, `Tourists`, `Students` |
| `OpenDate` | DATE | NOT NULL | Store commissioning date | `2021-03-15` |

---

### 1.3 `dim_product`
Contains the catalog of 65 product SKUs mapped into 8 merchandise categories.

| Column Name | Data Type | Constraint | Description | Example / Range |
| :--- | :--- | :--- | :--- | :--- |
| `ProductID` | VARCHAR(10) | PRIMARY KEY | Unique product identifier | `PRD001` to `PRD065` |
| `SKU` | VARCHAR(20) | UNIQUE, NOT NULL | Stock Keeping Unit code | `SKU-BEV-001`, `SKU-SNK-010` |
| `ProductName` | VARCHAR(100) | NOT NULL | Full commercial trade name | `Singha Soda 325ml`, `Lay's Classic 50g` |
| `Category` | VARCHAR(50) | NOT NULL | High-level merchandise category (8 total) | `Beverages`, `Snacks`, `Instant Food`, `Ready-to-Eat`, `Bakery`, `Dairy & Chilled`, `Personal Care`, `Household` |
| `SubCategory` | VARCHAR(50) | NOT NULL | Granular product sub-classification | `Carbonated`, `Potato Chips`, `Cup Noodles` |
| `Brand` | VARCHAR(50) | NOT NULL | Manufacturer or brand owner | `Singha`, `Lay's`, `CP`, `Mama` |
| `UnitCost` | DECIMAL(8,2)| NOT NULL | Standard procurement cost per unit (THB) | `฿7.00` to `฿85.00` |
| `BasePrice` | DECIMAL(8,2)| NOT NULL | Manufacturer suggested retail price (THB) | `฿10.00` to `฿120.00` |
| `MarginPercent`| DECIMAL(5,2)| NOT NULL | Nominal gross margin percentage | `18.5%` to `42.0%` |
| `ShelfLifeDays`| INTEGER | NOT NULL | Expiry threshold from delivery date | `3` (Bakery) to `365` (Household) |
| `IsPromoEligible`| BOOLEAN | NOT NULL | Flag permitting inclusion in marketing promos| `TRUE`, `FALSE` |
| `Status` | VARCHAR(15) | NOT NULL | Active listing status in catalog | `Active`, `Discontinued` |

---

### 1.4 `dim_promotion`
Encapsulates marketing campaigns, price markdowns, and bundled offers.

| Column Name | Data Type | Constraint | Description | Example / Range |
| :--- | :--- | :--- | :--- | :--- |
| `PromotionID` | VARCHAR(10) | PRIMARY KEY | Unique promotional campaign code | `PRM000` (None), `PRM001` to `PRM006` |
| `PromoCode` | VARCHAR(20) | NOT NULL | POS promotion trigger voucher code | `NOPROMO`, `SUMMER_BEV`, `BOGO_SNK` |
| `PromotionName`| VARCHAR(100) | NOT NULL | Marketing campaign title | `Standard Price (No Promo)`, `Summer Cooler 15% Off` |
| `DiscountType` | VARCHAR(20) | NOT NULL | Discount calculation mechanism | `None`, `Percentage`, `FixedAmount`, `Bundle` |
| `DiscountValue`| DECIMAL(8,2)| NOT NULL | Numeric discount factor or monetary amount | `0.00`, `0.15` (15%), `10.00` (10 THB) |
| `MinSpend` | DECIMAL(8,2)| NOT NULL | Minimum basket spend to unlock discount | `0.00`, `150.00` |
| `StartDate` | DATE | NOT NULL | Campaign effective start date | `2026-01-01` |
| `EndDate` | DATE | NOT NULL | Campaign expiry date | `2026-09-30` |
| `IsActive` | BOOLEAN | NOT NULL | Campaign operational status | `TRUE`, `FALSE` |

---

## 2. Fact Tables

### 2.1 `fact_sales`
Captures every line-item retail sale transaction recorded across all POS registers.

* **Grain**: 1 row per product SKU per basket transaction per store per date.
* **Volume**: **51,551 line items** across 26,327 customer checkout baskets (representing **71,885 total physical units sold**).

| Column Name | Data Type | Foreign Key / Constraint | Description | Additivity |
| :--- | :--- | :--- | :--- | :--- |
| `TransactionID` | VARCHAR(20) | NOT NULL | Unique basket checkout identifier | Non-additive |
| `DateKey` | INTEGER | FK -> `dim_date.DateKey` | Date surrogate key of transaction | Non-additive |
| `StoreID` | VARCHAR(10) | FK -> `dim_store.StoreID` | Store location identifier | Non-additive |
| `ProductID` | VARCHAR(10) | FK -> `dim_product.ProductID` | Product sold identifier | Non-additive |
| `PromotionID` | VARCHAR(10) | FK -> `dim_promotion.PromotionID`| Applied promotional campaign | Non-additive |
| `UnitSold` | INTEGER | NOT NULL, > 0 | Quantity of SKU units purchased | Fully Additive |
| `UnitCost` | DECIMAL(8,2)| NOT NULL | Procurement unit cost at transaction | Non-additive |
| `UnitPrice` | DECIMAL(8,2)| NOT NULL | Base selling price per unit before promo | Non-additive |
| `DiscountAmount`| DECIMAL(8,2)| NOT NULL, >= 0 | Total discount applied to this line item | Fully Additive |
| `GrossSales` | DECIMAL(10,2)| `UnitSold * UnitPrice` | Total retail value before discounts | Fully Additive |
| `NetSales` | DECIMAL(10,2)| `GrossSales - DiscountAmount` | Net revenue collected from customer | Fully Additive |
| `CostOfGoodsSold`| DECIMAL(10,2)| `UnitSold * UnitCost` | Total direct cost for inventory sold | Fully Additive |
| `NetProfit` | DECIMAL(10,2)| `NetSales - CostOfGoodsSold` | Net margin contribution in THB | Fully Additive |
| `PaymentMethod` | VARCHAR(20) | NOT NULL | Customer payment tender | Non-additive (`Cash`, `PromptPay`, `CreditCard`, `TrueMoney`) |
| `TimeOfDay` | VARCHAR(15) | NOT NULL | Daypart of checkout | Non-additive (`Morning`, `Afternoon`, `Evening`, `LateNight`) |
| `MemberFlag` | BOOLEAN | NOT NULL | Customer loyalty membership status | Non-additive (`TRUE`, `FALSE`) |

---

### 2.2 `fact_inventory_daily`
Captures daily inventory position, stock flows, and replenishment status per store per SKU.

* **Grain**: 1 row per product SKU per store per calendar day.
* **Volume**: 177,450 rows (65 SKUs * 10 Stores * 273 Days).
* **Semi-Additive Measure Rule**: Stock balance measures (`EndingStock`, `BeginningStock`) are **Semi-Additive**. They can be summed across `dim_store` and `dim_product`, but **NEVER summed across `dim_date`**. For time aggregation, use Point-in-Time snapshot (latest date) or Period Average (`AVG(EndingStock)`).

| Column Name | Data Type | Foreign Key / Constraint | Description | Additivity |
| :--- | :--- | :--- | :--- | :--- |
| `InventorySnapshotID`| VARCHAR(25)| PRIMARY KEY | Unique snapshot surrogate ID | Non-additive |
| `DateKey` | INTEGER | FK -> `dim_date.DateKey` | Calendar date surrogate key | Non-additive |
| `StoreID` | VARCHAR(10) | FK -> `dim_store.StoreID` | Store location identifier | Non-additive |
| `ProductID` | VARCHAR(10) | FK -> `dim_product.ProductID` | Product catalog identifier | Non-additive |
| `BeginningStock` | INTEGER | NOT NULL, >= 0 | Opening stock on hand at 00:00 | **Semi-Additive** |
| `ReceivedStock` | INTEGER | NOT NULL, >= 0 | Inbound shipment units received from DC | Fully Additive |
| `UnitsSold` | INTEGER | NOT NULL, >= 0 | Total units sold during the day | Fully Additive |
| `WasteStock` | INTEGER | NOT NULL, >= 0 | Damaged, expired, or spoiled units | Fully Additive |
| `EndingStock` | INTEGER | `Beginning + Received - Sold - Waste`| Closing physical stock on hand at 23:59 | **Semi-Additive** |
| `SafetyStock` | INTEGER | NOT NULL, > 0 | Buffer stock threshold | Non-additive |
| `ReorderPoint` | INTEGER | `SafetyStock + (LeadTime * AvgDailyDemand)` | Reorder trigger threshold | Non-additive |
| `ReorderStatus` | VARCHAR(20) | NOT NULL | Replenishment priority status | Non-additive (`NORMAL`, `REORDER`, `OUT_OF_STOCK`, `OVERSTOCK`) |
| `DaysOnHand` | DECIMAL(5,1)| `EndingStock / (AvgDailySales + 0.01)` | Estimated days of inventory remaining | Non-additive |

---

## 3. Reconciliation Baseline & Ground Truth

All pipeline, analytical queries, and UI components must reconcile against these exact validated numbers:

| Metric | Validated Baseline Ground Truth | Source of Truth |
| :--- | :--- | :--- |
| **Dim_Date Rows** | **273 rows** | Daily calendar entries (2026-01-01 to 2026-09-30) |
| **Dim_Product SKUs** | **65 SKUs** | Commercial catalog across 8 categories |
| **Dim_Store Branches** | **10 branches** | 10 stores across Thailand |
| **Dim_Promotion Rows** | **7 rows** | `PRM000` to `PRM006` |
| **Fact_Sales Line Items** | **51,551 line items** | Line item sales rows (baskets $\times$ SKUs) |
| **Fact_Inventory Snapshots**| **177,450 snapshots**| $65 \text{ SKUs} \times 10 \text{ Stores} \times 273 \text{ Days}$ |
| **Total Units Sold** | **71,885 units** | `SUM(fact_sales.UnitSold)` across all line items |
| **Total Transactions** | **26,327 baskets** | `COUNT(DISTINCT fact_sales.TransactionID)` |
| **Average Basket Size** | **2.73 units/basket** | `Total Units Sold / Total Transactions` |
| **Average Basket Value**| **฿60.59 / basket** | `Total Net Sales / Total Transactions` |
| **Total Net Sales** | **฿1,595,166.51** | `SUM(fact_sales.NetSales)` |
| **Total Net Profit** | **฿499,676.51** | `SUM(fact_sales.NetProfit)` |
| **Gross Profit Margin** | **31.32%** | `(NetProfit / NetSales) * 100` |
| **Final Stock On-Hand** | **29,796 units** | `SUM(EndingStock)` on `DateKey = 20260930` |
| **Average Daily Stock** | **45.44 units/item/day** | `AVG(EndingStock)` over 273 days across all store-SKU pairs |
