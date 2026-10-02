# QuickMart DSS Dashboard Screenshots Guide

This directory holds visual screenshots and captures of the QuickMart Decision Support System for technical documentation and portfolio presentations.

---

## Recommended Screenshot Catalog

| File Name | View / Page | Key Visual Highlights |
| :--- | :--- | :--- |
| `01_executive_overview.png` | Executive Overview (`/`) | 8 KPI cards, Revenue trend, Category sales, Top SKUs, Donut chart, DSS Insight Panel |
| `02_sales_olap.png` | Sales & OLAP Analytics (`/sales`) | Multi-dimensional filters, Monthly margin trend, Regional Fairness toggle, Branch ranking |
| `03_inventory_monitor.png` | Inventory & Replenishment (`/inventory`) | Semi-additive metrics, Reorder alert tabs, Reorder/Stockout badges |
| `04_data_mining.png` | Data Mining & Bundling (`/mining`) | K-Means scatter plot, Apriori rules table, Interactive Cross-Selling Advisor widget |
| `05_bilingual_th.png` | Thai Localization View | Dashboard interface rendered in Thai (`ภาษาไทย`) |

---

## How to Capture

1. Start the local server:
   ```bash
   cd quickmart-dss
   npm run start
   ```
2. Open `http://localhost:3000` in a full-HD browser window (1920x1080 recommended).
3. Capture full-page or viewport screenshots of each of the 4 routes (`/`, `/sales`, `/inventory`, `/mining`).
4. Save the images into this directory (`docs/screenshots/`) using PNG format.
