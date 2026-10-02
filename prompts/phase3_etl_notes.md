# Prompt Portfolio Evidence — Phase 3: ETL Pipeline & Data Warehouse
**Project:** Retail Insight DSS — QuickMart  
**Phase:** Phase 3 — ETL Pipeline & Star Schema Data Warehouse Implementation  
**Date:** 2026-10-02  
**Author:** AI Agent (Antigravity) & Student Collaboration  

---

## 1. Requirement ที่ Prompt ขอ (Prompt Requirements)
1. **End-to-End ETL Pipeline Architecture:**
   * สถาปัตยกรรมข้อมูล 6 ขั้นตอน: `Extract` $\rightarrow$ `Data Quality Validation` $\rightarrow$ `Transform & Normalize` $\rightarrow$ `Referential Integrity Check` $\rightarrow$ `Load` $\rightarrow$ `Post-load Audit`.
2. **Standard Dimensional Modeling:**
   * นำข้อมูลจาก Source Staging (`quickmart_mock_dataset`) เข้าสู่ Data Warehouse (`data_warehouse/` และ `quickmart-dss/data/warehouse/`) ในรูปแบบ Star Schema / Fact Constellation.
3. **Data Quality & Business Rules Verification:**
   * **Dim_Date**: ตรวจสอบความต่อเนื่องของเวลา 273 วัน (2026-01-01 ถึง 2026-09-30) ไม่มีวันซ้ำและไม่มีวันหาย.
   * **Dim_Product**: 65 SKUs, Normalize 8 Categories, $UnitPrice > UnitCost > 0$, $MaxStockLevel > ReorderPoint > 0$.
   * **Dim_Store**: 10 สาขา ครบ 5 ภูมิภาค (Central, Isan, North, East, South).
   * **Dim_Promotion**: ตรวจสอบการมีอยู่ของ `PromotionKey = 0` (No Promotion, 0.00% discount) และส่วนลดอยู่ในช่วง [0, 100].
   * **Fact_Sales**: รักษา Grain (1 Line Item per Transaction), ตรวจสอบสูตร $SalesAmount, CostAmount, Profit, ProfitMargin$ แบบ $100\%$ Exact Reconciliation.
   * **Fact_Inventory**: รักษา Grain (1 SKU $\times$ 1 Store $\times$ 1 Day), ตรวจสอบ Composite Key Uniqueness, ตรวจสอบสมการสมดุลสต็อก $EndingStock = BeginningStock + StockIn - StockOut$, และตรวจสอบ Daily Chaining $BeginningStock_{t+1} = EndingStock_t$.
   * **Inventory Status**: คำนวณใหม่ตามกฎ 4 เงื่อนไข (`OUT OF STOCK`, `REORDER`, `OVERSTOCK`, `NORMAL`).
   * **Referential Integrity**: Zero orphan foreign keys.
4. **ETL Log & Audit Trail:**
   * สร้างรายงานบันทึกผลการทำงานแบบ Real-time ลงใน `logs/etl_validation_report.txt`.

---

## 2. สิ่งที่ AI สร้าง (Deliverables Built)
1. **Modular ETL Engine (`quickmart-dss/etl/`)**:
   * `extract.py`: ตรวจสอบไฟล์, อ่านข้อมูล CSV, ตรวจสอบโครงสร้างคอลัมน์, เช็ค Nulls และ Duplicate Primary Keys.
   * `transform.py`: ล้างข้อมูล, Normalize ค่า, คำนวณสูตรทางการเงินและสถานะสต็อกใหม่, ตรวจสอบสมการคงคลังและความต่อเนื่องข้ามวัน.
   * `validate.py`: ตรวจสอบ Referential Integrity ข้ามตาราง และตรวจหา Orphan Foreign Keys.
   * `load.py`: เขียนข้อมูลลงสู่ Data Warehouse ทั้งโฟลเดอร์ `quickmart-dss/data/warehouse/` และ Mirror ไปยัง `d:\Project-DSS-Store\data_warehouse/`.
   * `run_etl.py`: ตัวขับเคลื่อนหลัก (Master Orchestrator) รันแบบ End-to-End วัดเวลาทำงานและสร้างรายงานสรุป.
2. **Audit Report (`quickmart-dss/logs/etl_validation_report.txt`)**:
   * รายงานผลสรุปจำนวนแถวทุกตาราง, เมทริกซ์ความถูกต้อง, และสถานะการตรวจสอบครบถ้วน.
3. **Data Warehouse CSV Datasets**:
   * บรรจุไฟล์ทั้ง 6 ตารางที่มีความสะอาด รัดกุม และพร้อมสำหรับสร้าง OLAP Cube ใน Phase 4.

---

## 3. การตรวจสอบความถูกต้อง (Validation Performed)
* **Row Count Matching:** ตรวจสอบยอดรวม Source Rows (229,356 แถว) เท่ากับ Loaded Rows (229,356 แถว) พอดี โดยไม่มีระเบียนถูก Reject (0 records).
* **Primary Key & Composite Key Uniqueness:**
  * `Dim_Date`: DateKey 273 ค่าไม่ซ้ำกัน
  * `Dim_Product`: ProductKey 65 ค่าไม่ซ้ำกัน
  * `Dim_Store`: StoreKey 10 ค่าไม่ซ้ำกัน
  * `Dim_Promotion`: PromotionKey 7 ค่าไม่ซ้ำกัน
  * `Fact_Sales`: SalesKey 51,551 ค่าไม่ซ้ำกัน
  * `Fact_Inventory`: คู่ประกอบ `(DateKey, ProductKey, StoreKey)` 177,450 รายการไม่ซ้ำกัน
* **Referential Integrity Audit:** 
  * ตรวจสอบ Foreign Keys ทั้งหมด 7 ความสัมพันธ์ ไม่พบ Orphan Key แม้แต่รายการเดียว (Total Orphans = 0).
* **Inventory Balance & Continuity:**
  * ตรวจสอบสมการคงคลัง $Ending = Beginning + In - Out$ ถูกต้อง $100\%$.
  * ตรวจสอบความต่อเนื่องของสต็อกยกมาต้นวัน $Beginning_{t+1} = Ending_t$ ถูกต้อง $100\%$.

---

## 4. จุดที่พบและแก้ไขระหว่างกระบวนการ (AI Error & Refinement Cases)

### กรณีศึกษาที่ 1: การจัดการ UTF-8 BOM ระหว่าง PowerShell กับ Python
* **ปัญหาที่พบ:** ไฟล์ CSV ที่สร้างจาก PowerShell .NET StreamWriter มีการใส่ Byte Order Mark (`\ufeff`) ที่ต้นไฟล์ ทำให้เมื่อ Python `csv.DictReader` เปิดอ่านด้วย `encoding="utf-8"` ชื่อคอลัมน์แรกกลายเป็น `'\ufeffDateKey'` ส่งผลให้เกิด `KeyError: 'DateKey'`.
* **การแก้ไข (Prompt & Code Refinement):** ปรับแก้โค้ดใน `extract.py` ให้เปิดไฟล์ด้วย `encoding="utf-8-sig"` ซึ่ง Python จะทำการตรวจจับและตัด BOM อัตโนมัติ ทำให้การประมวลผลราบรื่นและรองรับทั้งไฟล์ที่มีและไม่มี BOM.

### กรณีศึกษาที่ 2: การรักษาความแม่นยำของทศนิยมทางการเงิน (Floating-Point Epsilon)
* **ปัญหาที่พบ:** การตรวจสอบสูตร $SalesAmount = (Quantity \times UnitPrice) - Discount$ และ $ProfitMargin = (Profit / SalesAmount) \times 100$ อาจเกิด Floating-point inaccuracy เล็กน้อยในระดับทศนิยมตำแหน่งที่ 3-4 (เช่น $0.000000000001$).
* **การแก้ไข (Prompt & Code Refinement):** ใช้ฟังก์ชัน `round(..., 2)` ในทุกขั้นตอนการคำนวณทางการเงิน และกำหนด Tolerance Epsilon ในการตรวจสอบไม่เกิน $0.02$ บาท ป้องกัน False Positive ในการแจ้งเตือน Error.

---

## 5. สมมติฐานทางธุรกิจและเทคนิค (Assumptions)
1. **Snapshot Frequency:** `Fact_Inventory` เป็น Daily Periodic Snapshot ที่บันทึกสถานะ ณ เวลาสิ้นสุดวันทำการ (End of Business Day).
2. **Transaction Grain:** `Fact_Sales` จัดเก็บในระดับ Line Item โดยสินค้าที่ซื้อพร้อมกันในตะกร้าเดียวกันจะมี `TransactionID` เดียวกัน เพื่อรองรับการทำ Market Basket Analysis (Association Rules) ใน Phase 5.
3. **Default Promotion:** รายการขายที่ไม่มีส่วนลดจะเชื่อมโยงกับ `PromotionKey = 0` (`PRM-NONE`) เสมอ เพื่อรักษามาตรฐานความสัมพันธ์ Referential Integrity โดยไม่ต้องพึ่งพาค่า NULL ใน Fact Table.
4. **Environment Portability:** รองรับการรันทั้งผ่าน Python 3.12 (`run_etl.py`) และสามารถนำไปเชื่อมต่อกับ Next.js / API ในอนาคตได้อย่างสมบูรณ์.
