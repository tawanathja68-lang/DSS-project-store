# Prompt Portfolio Evidence — Phase 4: OLAP Analysis Layer
**Project:** Retail Insight DSS — QuickMart  
**Phase:** Phase 4 — Multi-dimensional OLAP Cube & Pre-aggregation  
**Date:** 2026-10-02  
**Author:** AI Agent (Antigravity) & Student Collaboration  

---

## 1. Requirement ที่ Prompt ขอ (Prompt Requirements)
1. **Multi-dimensional OLAP Layer:**
   * พัฒนาฟังก์ชันรองรับการวิเคราะห์ 4 รูปแบบ: `Slice`, `Dice`, `Drill-down`, `Roll-up` โดยดึงข้อมูลตรงจาก Data Warehouse (`data_warehouse/`).
2. **Dimension Hierarchies:**
   * Time: Day $\rightarrow$ Month $\rightarrow$ Quarter $\rightarrow$ Year
   * Product: SKU $\rightarrow$ SubCategory $\rightarrow$ Category
   * Location: Store $\rightarrow$ Province $\rightarrow$ Region
3. **Core Measures Calculation:**
   * Total Sales, Total Cost, Total Profit, Total Quantity, Distinct Transaction Count, Average Transaction Value (ATV), และ Overall Profit Margin.
   * **ข้อกำหนดเข้มงวด:** ห้ามหาค่าเฉลี่ย ProfitMargin รายแถวโดยตรง ต้องคำนวณแบบถ่วงน้ำหนัก:
     $$\text{Overall Profit Margin} = \frac{\sum \text{Profit}}{\sum \text{SalesAmount}} \times 100\%$$
4. **Semi-Additive Measure Handling (Inventory):**
   * บังคับใช้หลักการ Semi-additive กับ `EndingStock` (สามารถรวมข้าม Store/Product ในวันเดียวกันได้ แต่ห้ามบวกข้ามเวลา ให้ใช้ Average หรือ Snapshot วันสุดท้ายของช่วงเวลา).
5. **Dashboard-Ready Aggregation Output:**
   * สร้าง Pre-aggregated CSVs จำนวน 14 ตาราง (Sales 8 ตาราง, Inventory 6 ตาราง) เพื่อให้ Frontend แสดงผลได้ลื่นไหล ไม่ต้องโหลด 229,000+ แถวเข้าเบราว์เซอร์.
6. **Business Insights & Validation:**
   * แสดงตัวอย่าง Slice 4 ข้อ, Dice 4 ข้อ, Drill-down 3 ข้อ, Roll-up 3 ข้อ, และสรุป Business Insights จริง 10 ข้อ.

---

## 2. สิ่งที่ AI สร้าง (Deliverables Built)
1. **OLAP Python Engine (`quickmart-dss/olap/`)**:
   * `olap_engine.py`: โหลด Star Schema CSVs และผสานเป็น `sales_cube` และ `inventory_cube`.
   * `sales_olap.py`: โมดูลคำนวณเมทริกซ์การขาย รองรับ Slice, Dice, Drill-down, Roll-up.
   * `inventory_olap.py`: โมดูลคำนวณสต็อกตามหลัก Semi-Additive Measures.
   * `generate_aggregates.py`: สคริปต์ประมวลผลและส่งออก 14 Pre-aggregated CSVs.
   * `validate_olap.py`: สคริปต์ทวนสอบความถูกต้องทางคณิตศาสตร์และการกระทบยอด Grand Totals.
2. **Pre-Aggregated Output Datasets (`quickmart-dss/data/olap/`)**:
   * บรรจุไฟล์สรุป 14 ตาราง ขนาดกะทัดรัด (เช่น `sales_by_month.csv` 9 แถว, `sales_by_category.csv` 8 แถว).
3. **Comprehensive Report (`quickmart-dss/reports/phase4_olap_report.md`)**:
   * รายงานสถาปัตยกรรม OLAP, ตารางตัวอย่างการคำนวณจริง, ผลการพิสูจน์ Semi-additivity, และ Business Insights 10 ข้อ.

---

## 3. กฎทางธุรกิจและการคำนวณ (Business Rules & Formulas)
* **Sales Additivity:**
  $$\sum_{\text{Product}} \text{Sales} = \sum_{\text{Store}} \text{Sales} = \sum_{\text{Month}} \text{Sales} = \text{Grand Total Sales } (1,595,166.51\text{ THB})$$
* **Basket Uniqueness:** นับจำนวนใบเสร็จด้วย `nunique(TransactionID)` ไม่ใช่การนับแถว Line Items.
* **Inventory Balance Verification:**
  $$\sum \text{StockOut} = 71,885\text{ units} \equiv \sum \text{Fact\_Sales Quantity} = 71,885\text{ units}$$

---

## 4. ปัญหาที่พบและการปรับปรุงแก้ไข (AI Error & Refinement Cases)

### กรณีศึกษาที่ 1: การคำนวณอัตรากำไรเฉลี่ยผิดหลักสถิติ (Simpson's Paradox Avoidance)
* **ปัญหาที่อาจเกิดขึ้น:** หาก AI เขียนโค้ด `df['ProfitMargin'].mean()` ผลลัพธ์ที่ได้จะผิดเพี้ยนทันที เพราะบิลสินค้าชิ้นเล็กกำไร $50\%$ จะมีน้ำหนักเท่ากับบิลสินค้าชิ้นใหญ่ 500 บาทกำไร $20\%$
* **การแก้ไข (Prompt & Code Refinement):** กำหนดฟังก์ชันคำนวณ `compute_measures` ให้คำนวณ Margin จากผลรวมกำไรหารด้วยผลรวมยอดขายจริงเสมอ:
  ```python
  overall_margin = round((total_profit / total_sales) * 100.0, 2) if total_sales > 0 else 0.0
  ```
  ทำให้ได้ค่า Margin เครือข่ายที่แท้จริงคือ **31.32%** ตรงตามหลักการบัญชีบริหาร.

### กรณีศึกษาที่ 2: ความผิดพลาดในการรวมค่าคงคลังข้ามเวลา (Semi-Additive Trap)
* **ปัญหาที่อาจเกิดขึ้น:** การใช้คำสั่ง `df['EndingStock'].sum()` ในระดับสรุปรายเดือนหรือรายไตรมาส จะได้ตัวเลขสต็อกสูงถึง **8,063,461 ชิ้น** ซึ่งไม่มีความหมายในทางกายภาพ (เป็นการนำสินค้าขวดเดิมมาบวกซ้ำกันทุกวันตลอด 273 วัน).
* **การแก้ไข (Prompt & Code Refinement):** แยก Measure ทางสต็อกออกเป็น 2 ค่าที่ถูกต้อง:
  1. `Average Ending Stock` = สต็อกเฉลี่ยต่อวันตลอดช่วงเวลา (**45.44 ชิ้น/SKU-สาขา**)
  2. `Current / Last-day Ending Stock` = สต็อกคงเหลือจริง ณ วันสิ้นสุดช่วงเวลา (**29,796 ชิ้น** ทั่วทั้ง 10 สาขา ณ วันที่ 30 ก.ย. 2026).

---

## 5. สมมติฐานทางเทคนิค (Technical Assumptions)
1. **Pre-aggregation Strategy:** จัดเก็บข้อมูล Pre-aggregate เป็น CSV ในโฟลเดอร์ `data/olap/` เพื่อเป็นเสมือน Materialized Views สำหรับ Frontend Dashboard ในอนาคต ช่วยลดเวลาในการโหลดหน้าจอจาก 3-5 วินาที เหลือต่ำกว่า 50 มิลลิวินาที.
2. **Hierarchy Navigation:** การ Drill-down สามารถกระทำข้ามมิติได้โดยไม่สูญเสียความแม่นยำของตัวเลขยอดขายรวม.
3. **Data Completeness:** ข้อมูลไม่มี Missing Dates ในทั้ง 273 วัน ทำให้ Time Series การวิเคราะห์แนวโน้มมีความต่อเนื่องสมบูรณ์.
