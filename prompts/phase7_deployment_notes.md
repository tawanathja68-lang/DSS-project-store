# Prompt Portfolio Evidence — Phase 7: Vercel Deployment & GitHub Documentation

**Project:** Retail Insight DSS — QuickMart  
**Phase:** Phase 7 — Production Readiness, Vercel Deployment & Technical Documentation  
**Date:** 2026-10-02  
**Author:** AI Agent (Antigravity) & Student Collaboration  
**Portfolio Weight:** 35% Assessment Artifact  

---

## 1. Requirement ที่ Prompt ขอ (Phase 7 Requirements)

1. **Production-Ready Application Audit**:
   - ตรวจสอบความพร้อมของ Next.js 14 Web Application สำหรับ Production
   - ตรวจสอบว่าไม่มี Hardcoded Local Path (เช่น `D:\...` หรือ `file:///...`) หรือ Credential/Secret หลงเหลือในโค้ด
   - ตรวจสอบว่า Assets, OLAP Pre-aggregates และ Mining Rules เรียกผ่าน Relative Paths (`/data/...`) ที่สมบูรณ์
   - ตรวจสอบว่าไม่มี Console Error หรือ Build Warning ร้ายแรง
2. **Repository Structuring & Organization**:
   - จัดหมวดหมู่โฟลเดอร์ให้เป็นระเบียบตามโครงสร้างสากล:
     - `etl/` (Python ETL Pipeline)
     - `olap/` (Python OLAP Aggregation Engine)
     - `mining/` (Python K-Means & Apriori Machine Learning)
     - `app/`, `components/`, `lib/` (Next.js Application Layer)
     - `public/data/` (Production Static Data Feeds)
     - `reports/` (Analytical Reports จาก Phase 4, 5, 6)
     - `prompts/` (Prompt Portfolio Notes สำหรับการประเมิน 35%)
     - `docs/` (Comprehensive Technical Documentation)
3. **Technical Documentation Suite (`docs/`)**:
   - จัดทำเอกสารเชิงลึก 6 ฉบับ:
     - `docs/data_dictionary.md`
     - `docs/star_schema.md`
     - `docs/etl_pipeline.md`
     - `docs/olap_analysis.md`
     - `docs/data_mining.md`
     - `docs/dashboard_guide.md`
     - `docs/screenshots/README.md`
4. **Master README.md**:
   - จัดทำ Master README.md ฉบับสมบูรณ์ ครอบคลุม 12 หัวข้อหลัก (Executive Overview, Ground Truth Baseline, End-to-End Workflow, Star Schema Data Model, ETL Pipeline, OLAP Analysis & Regional Fairness, K-Means & Apriori Mining, Interactive Dashboard Pages, Bilingual System, Tech Stack, Step-by-Step Run Instructions, Vercel Deployment, Limitations & Roadmap)
5. **Vercel Deployment & Strict Truthfulness Policy**:
   - ตรวจสอบการ Build สำหรับ Vercel (`next build`)
   - จัดทำไฟล์ Configuration: `vercel.json`, `.vercelignore`, `.gitignore`, `.env.example`
   - ทดสอบ Vercel CLI (`npx vercel`)
   - **กฎเหล็กด้านความซื่อสัตย์ทางวิชาการ (Anti-Fabrication Rule)**: *ห้ามสร้าง URL ปลอม (Fake Production URL) โดยเด็ดขาด* หากสภาพแวดล้อมติด Authentication (เช่น ต้องเปิดบราวเซอร์เพื่อล็อกอินบัญชี Vercel ส่วนบุคคล) ให้ประกาศสถานะ **DEPLOY-READY** พร้อมคำแนะนำและคำสั่งสำหรับผู้ใช้ในการกด Deploy ต่อได้ทันที 100%

---

## 2. สิ่งที่ AI ดำเนินการและส่งมอบ (Deliverables Built)

### 2.1 Technical Documentation Suite (`docs/`)
1. **`docs/data_dictionary.md`**:
   - รายละเอียด Data Dictionary แบบสมบูรณ์ของทั้ง 4 Dimension (`dim_date`, `dim_store`, `dim_product`, `dim_promotion`) และ 2 Fact Tables (`fact_sales`, `fact_inventory_daily`)
   - ระบุชนิดข้อมูล, Constraints, คำอธิบายธุรกิจ และ Additivity Type
   - ระบุกฎ Semi-Additive ของสต็อกสินค้าอย่างชัดเจน
2. **`docs/star_schema.md`**:
   - แผนภาพสถาปัตยกรรม Fact Constellation (Galaxy Schema) ในรูปแบบ Mermaid ER Diagram
   - รายละเอียด Cardinality ตรงตาม Ground Truth (273 วัน, 10 สาขา, 65 SKUs, 7 แคมเปญใน `dim_promotion`, 51,551 line items ใน `fact_sales` แทนยอดขายจริง 71,885 ชิ้น, 177,450 สถานะสต็อก)
   - นิยาม Hierarchies สำหรับการ Drill-down และ Roll-up
3. **`docs/etl_pipeline.md`**:
   - ลำดับขั้นตอน Extract $\rightarrow$ Transform $\rightarrow$ Validate $\rightarrow$ Load
   - กฎการตรวจสอบคุณภาพข้อมูล 6 ข้อ (Uniqueness, Referential Integrity, No Nulls, Financial Balance, Flow Conservation, Non-negativity)
4. **`docs/olap_analysis.md`**:
   - นิยามทางเทคนิคและตัวอย่างการใช้งานจริงของ Slice, Dice, Drill-down, Roll-up
   - นิยามตัวชี้วัดความเป็นธรรมของสาขาในระดับภูมิภาค (Regional Fairness: Total vs. Average Revenue per Store)
   - กฎการคำนวณ Semi-Additive Inventory (Snapshot vs. Period Average)
5. **`docs/data_mining.md`**:
   - การแบ่งกลุ่มสินค้าด้วย K-Means ($K=3$) พร้อมการแปลงมาตรฐาน `StandardScaler` (11 Anchors, 43 Long-Tail, 11 Boosters)
   - การวิเคราะห์ตะกร้าสินค้าด้วย Apriori Algorithm (Minimum Support $\ge 0.02$, Minimum Confidence $\ge 0.30$, Lift $> 1.00$)
   - รายละเอียดความสัมพันธ์ของสินค้าคู่เด่น (Lift สูงสุด 10.74) และการเชื่อมต่อสู่ Cross-Selling Advisor
6. **`docs/dashboard_guide.md`**:
   - คู่มือการใช้งาน Dashboard 4 หน้า สำหรับผู้จัดการร้านและผู้บริหาร
   - ระบบสองภาษา (ไทย/อังกฤษ) และแนวทางการใช้ภาษาเชิงข้อเสนอแนะ (Advisory Language)
7. **`docs/screenshots/README.md`**:
   - แคตตาล็อกและคำแนะนำในการบันทึกภาพหน้าจอระบบสำหรับ Portfolio

### 2.2 Configuration & Deployment Assets
- **`README.md`**: อัปเดตเนื้อหาครอบคลุมทุกกระบวนการของโครงการ พร้อม Mermaid Flowchart และ Badges
- **`.gitignore`**: ป้องกันการ Commit ไฟล์ขนาดใหญ่, `node_modules/`, `.next/`, ไฟล์แคช Python และ Logs
- **`.vercelignore`**: ปรับแต่งให้ Vercel Upload เฉพาะไฟล์ Source code และ Static assets ที่จำเป็น
- **`vercel.json`**: กำหนดค่า Build command (`npm run build`) และ Install command (`npm install`)
- **`.env.example`**: ระบุตัวอย่างตัวแปรสภาพแวดล้อมที่จำเป็น

### 2.3 Verification & Build Audit
- รันการคอมไพล์ Production ด้วย `next build` ผ่าน 100% (Zero Lint/Type Errors, 7 Routes ผ่านเกณฑ์)
- รัน Production Server `npm run start` บน `http://localhost:3000` และทดสอบ HTTP Response Status 200 ครบทุก Route

---

## 3. ปัญหาที่พบและการปรับปรุงแก้ไข (AI Error & Refinement Cases)

### กรณีศึกษาที่ 1: การจัดการ PowerShell Script Execution Policy ใน Windows Environment
* **ปัญหาที่พบ:** เมื่อพยายามรันคำสั่ง `npx --yes vercel --version` ในสภาพแวดล้อม Windows PowerShell ระบบแจ้งเตือน Security Error ว่า `npx.ps1 cannot be loaded because running scripts is disabled on this system (PSSecurityException)`.
* **สาเหตุ:** ค่าเริ่มต้นของ Windows ExecutionPolicy ไม่อนุญาตให้รันไฟล์ `.ps1` ที่ดาวน์โหลดมาโดยไม่ได้ Sign Certificate
* **การแก้ไข (Refinement):** เปลี่ยนการเรียกคำสั่งให้เจาะจงไปที่ Batch Execution Wrapper ของ Node.js โดยตรง:
  `& "C:\Program Files\nodejs\npx.cmd" --yes vercel --version`
  ผลลัพธ์: คำสั่งทำงานได้ราบรื่น 100% รายงานเวอร์ชัน `Vercel CLI 62.1.0` โดยไม่ต้องลดทอนความปลอดภัยของระบบปฏิบัติการ

### กรณีศึกษาที่ 2: การหลีกเลี่ยงการสร้าง URL ปลอม (Strict Integrity & Anti-Fabrication)
* **ปัญหาที่อาจเกิดขึ้นใน Agentic AI:** ในสถานการณ์ที่ต้อง Deploy ขึ้น Cloud แพลตฟอร์มอย่าง Vercel บ่อยครั้งที่ AI อาจ "สมมุติ" URL ขึ้นมา เช่น `https://quickmart-dss.vercel.app` เพื่อตอบให้งานดูเหมือนเสร็จสิ้น ซึ่งผิดหลักวิชาการและไม่สามารถเข้าใช้งานได้จริง
* **การแก้ไขและการตรวจสอบจริง:** 
  1. AI ได้ทดลองรันคำสั่ง `vercel whoami` และ `vercel deploy --temporary --yes` พบว่า Vercel CLI ส่งคำขอ Device OAuth:
     `Visit https://vercel.com/oauth/device?user_code=... Waiting for authentication...`
  2. เนื่องจากเป็น Non-interactive session ที่ระบบไม่สามารถล็อกอินแทนผู้ใช้ได้ AI จึงปฏิบัติตามข้อกำหนดอย่างเคร่งครัด:
     - ยุติโปรเซสที่รอ Authentication เพื่อไม่ให้ระบบค้าง
     - ประกาศสถานะระบบเป็น **DEPLOY-READY (100% พร้อมขึ้นระบบ)**
     - จัดเตรียมโค้ด, Build Artifacts, `vercel.json`, `.vercelignore` ไว้อย่างสมบูรณ์
     - ระบุขั้นตอนและคำสั่งให้ผู้ใช้สามารถนำขึ้น Vercel ได้ใน 1-2 คลิกผ่านทั้ง Web Dashboard และ Vercel CLI

---

## 4. ผลการตรวจสอบความถูกต้องของข้อมูล (Reconciliation Audit)

ทุกตัวเลขในระบบและเอกสาร Phase 7 สอดคล้องตรงกับ Baseline Ground Truth จาก Phase 2–5 แบบ 100.0%:

$$\text{Dim\_Date} = 273\text{ rows}$$
$$\text{Dim\_Product} = 65\text{ SKUs}$$
$$\text{Dim\_Store} = 10\text{ branches}$$
$$\text{Dim\_Promotion} = 7\text{ rows (PRM000 to PRM006)}$$
$$\text{Fact\_Sales} = 51,551\text{ line items}$$
$$\text{Fact\_Inventory} = 177,450\text{ snapshots}$$
$$\sum \text{UnitSold} = 71,885\text{ units}$$
$$\text{Total Transactions} = 26,327\text{ baskets}$$
$$\sum \text{NetSales} = \text{฿1,595,166.51}$$
$$\sum \text{NetProfit} = \text{฿499,676.51}$$
$$\text{Gross Margin} = 31.32\%$$
$$\text{Current Physical Stock} = 29,796\text{ units (as of 2026-09-30)}$$
$$\text{Average Daily Stock} = 45.44\text{ units/item/day}$$

---

## 5. สรุปความพร้อมของโครงการ (Phase 7 Status)

โครงการ **Retail Insight DSS — QuickMart** ได้ดำเนินการครบถ้วนทุก Phase (Phase 1 ถึง Phase 7) โดยมีโครงสร้างไฟล์ ข้อมูล Star Schema โมเดล Data Mining แดชบอร์ด Next.js ระบบสองภาษา และชุดเอกสารทางเทคนิคที่พร้อมสำหรับการนำเสนอ Portfolio การประเมินผลสัมฤทธิ์ทางการศึกษา และการใช้งานจริงในระดับองค์กร
