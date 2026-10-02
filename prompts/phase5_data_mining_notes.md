# Prompt Portfolio Evidence — Phase 5: Data Mining
**Project:** Retail Insight DSS — QuickMart  
**Phase:** Phase 5 — Unsupervised Machine Learning (K-Means Clustering & Association Rule Mining)  
**Date:** 2026-10-02  
**Author:** AI Agent (Antigravity) & Student Collaboration  

---

## 1. Requirement ที่ Prompt ขอ (Prompt Requirements)

1. **Input Data Constraints:**
   * ใช้ข้อมูลจาก Data Warehouse (`data/warehouse/fact_sales.csv` และ `dim_product.csv`) ที่ผ่าน ETL และ OLAP แล้วเท่านั้น
   * ห้ามสร้าง Mock Data ชุดใหม่ และต้องกระทบยอดตัวเลข Grand Totals ให้ตรงกับ Phase 4 OLAP 100.0%
2. **Part A: K-Means Clustering (Product Segmentation):**
   * กำหนด Features ทางธุรกิจ 3 ตัว: `TotalQuantitySold`, `TotalRevenue`, `OverallProfitMargin`
   * ต้องให้เหตุผลเรื่อง Feature Scaling ด้วย `StandardScaler` อย่างชัดเจน
   * ทำ Hyperparameter Exploration สำหรับค่า $K \in \{2, 3, 4, 5, 6\}$ พร้อมวัดผลด้วย **Inertia (Elbow Method)** และ **Silhouette Score**
   * ล็อกโมเดล Production ที่ $K=3$ และตั้งชื่อกลุ่มเชิงธุรกิจ (Business Labels) ที่ผู้จัดการร้านเข้าใจและนำไปใช้งานได้จริง
   * บันทึกรูปภาพการวิเคราะห์อย่างน้อย 4-6 ภาพลงใน `reports/figures/`
3. **Part B: Market Basket Analysis (Association Rule Mining):**
   * จัดโครงสร้างข้อมูลในระดับ `TransactionID` (Market Basket Matrix)
   * กรองแยก Single-item vs Multi-item baskets อย่างโปร่งใส
   * รันอัลกอริทึม Apriori ด้วยเกณฑ์ขั้นต่ำ: $\text{Support} \ge 0.02$, $\text{Confidence} \ge 0.30$, $\text{Lift} > 1.00$
   * แสดงตาราง Association Rules และทวนสอบความถูกต้องทางคณิตศาสตร์ (Support, Confidence, Lift, Leverage, Conviction) เทียบกับบิลจริง
4. **Validation & Deliverables:**
   * สร้างสคริปต์ตรวจสอบอัตโนมัติ 10 ข้อ (ครอบคลุมทั้ง Clustering และ Association Rules)
   * จัดทำรายงานฉบับสมบูรณ์ `reports/phase5_data_mining_report.md`
   * สรุป 10 Business Insights (5 จาก K-Means, 5 จาก Association Rules) พร้อมข้อเสนอแนะเชิงระบบสนับสนุนการตัดสินใจ (DSS)

---

## 2. สิ่งที่ AI สร้าง (Deliverables Built)

1. **Data Mining Python Modules (`quickmart-dss/mining/`)**:
   * `prepare_features.py`: รวมรวมยอดขายและคำนวณ 3 เมทริกซ์หลักต่อ SKU พร้อมกระทบยอด OLAP
   * `kmeans_analysis.py`: โมเดล K-Means ทดสอบ $K=2..6$, เทรน $K=3$, บันทึกพิกัด Centroids และสร้างกราฟ 6 ภาพ
   * `association_rules.py`: สร้าง Transaction Basket Matrix, รัน Apriori และ Association Rules Mining
   * `validate_mining.py`: สคริปต์ Unit Test & Mathematical Audit ตรวจสอบ 10 ด่าน
   * `run_mining.py`: Master Pipeline Runner รันทุกกระบวนการแบบอัตโนมัติ End-to-End
2. **Data Mining Output Datasets (`quickmart-dss/data/mining/`)**:
   * `product_clusters.csv`: ผลลัพธ์การจัดกลุ่ม 65 SKUs พร้อมคอลัมน์ Cluster และ Business Label
   * `cluster_summary.csv`: ค่าเฉลี่ยและสัดส่วนของแต่ละ Cluster
   * `frequent_itemsets.csv`: รายการ 34 Itemsets ที่ผ่านเกณฑ์ Min Support 2%
   * `association_rules.csv` & `top_association_rules.csv`: กฎความสัมพันธ์ 20 กฎ เรียงตามค่า Lift
3. **Analytical Figures (`quickmart-dss/reports/figures/`)**:
   * `elbow_method.png`: กราฟ Elbow Curve แสดงค่า Inertia ลดลงที่ $K=3$
   * `silhouette_scores.png`: กราฟแท่งเปรียบเทียบ Silhouette Score ของแต่ละค่า $K$
   * `quantity_vs_revenue_clusters.png`: Scatter Plot จำแนก Cluster ตามปริมาณและยอดขาย
   * `revenue_vs_margin_clusters.png`: Scatter Plot แสดงความสัมพันธ์ระหว่างรายได้และอัตรากำไร
   * `cluster_feature_profile.png`: Radar Chart / Feature Profile ของ 3 คลัสเตอร์
   * `pca_clusters.png`: PCA 2D Dimensionality Reduction แสดงการกระจายตัวของคลัสเตอร์
4. **Comprehensive Documentation**:
   * `reports/phase5_data_mining_report.md`: รายงานวิเคราะห์เชิงลึกสำหรับผู้บริหาร
   * `prompts/phase5_data_mining_notes.md`: บันทึกหลักฐาน Prompt Engineering และการแก้ไขข้อผิดพลาด

---

## 3. ทฤษฎีและสูตรคณิตศาสตร์ที่ใช้ (Theoretical Foundations & Mathematical Formulas)

### 3.1 K-Means Clustering
* **Within-Cluster Sum of Squares (Inertia):**
  $$\text{WCSS} = \sum_{k=1}^K \sum_{x_i \in C_k} \| x_i - \mu_k \|^2$$
* **StandardScaler Z-Score Transformation:**
  $$z = \frac{x - \mu}{\sigma}$$
* **Silhouette Coefficient:**
  $$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$
  โดยที่ $a(i)$ คือระยะห่างเฉลี่ยภายในคลัสเตอร์เดียวกัน และ $b(i)$ คือระยะห่างเฉลี่ยไปยังคลัสเตอร์ที่ใกล้ที่สุด

### 3.2 Association Rule Mining (Apriori)
* **Support:**
  $$\text{Support}(A \rightarrow B) = P(A \cup B) = \frac{\text{Count}(A \cap B)}{N}$$
* **Confidence:**
  $$\text{Confidence}(A \rightarrow B) = P(B \mid A) = \frac{\text{Support}(A \cup B)}{\text{Support}(A)}$$
* **Lift:**
  $$\text{Lift}(A \rightarrow B) = \frac{\text{Confidence}(A \rightarrow B)}{P(B)} = \frac{P(A \cup B)}{P(A) \times P(B)}$$
* **Leverage:**
  $$\text{Leverage}(A \rightarrow B) = P(A \cup B) - [P(A) \times P(B)]$$
* **Conviction:**
  $$\text{Conviction}(A \rightarrow B) = \frac{1 - P(B)}{1 - \text{Confidence}(A \rightarrow B)}$$

---

## 4. ปัญหาที่พบและการปรับปรุงแก้ไข (AI Error & Refinement Cases)

### กรณีศึกษาที่ 1: การครอบงำมิติข้อมูลใน K-Means (Feature Scaling Distortion Trap)
* **ปัญหาที่พบ:** หากนำฟีเจอร์ `TotalRevenue` (สเกลหลัก 1,000 ถึง 120,000 THB) เข้าโมเดลร่วมกับ `OverallProfitMargin` (สเกล 24% ถึง 47%) โดยไม่ทำ Standardize ตัวแปรยอดขายจะข่มตัวแปรกำไรมากกว่า $1,000\times$ ส่งผลให้ K-Means จัดกลุ่มตาม "ยอดขายอย่างเดียว" โดยละเลยความแตกต่างของมาร์จิ้น
* **การแก้ไข (Prompt & Algorithmic Refinement):** บังคับใช้ `StandardScaler` ก่อนป้อนเข้า `KMeans(n_clusters=3, random_state=42)` ทำให้ทั้ง 3 ตัวแปรมีน้ำหนักสมดุล ($\mu=0, \sigma=1$) จึงแยกกลุ่มสินค้า **Cluster 2: High Margin Boosters** ออกมาได้อย่างแม่นยำ

### กรณีศึกษาที่ 2: การจัดการความหนาแน่นของ Transaction Basket (Memory & Grain Optimization)
* **ปัญหาที่พบ:** ตาราง `fact_sales.csv` มี 51,551 แถว การทำ One-Hot Matrix ระดับบิล หากทำผิดวิธีอาจรวม Quantity ซ้ำซ้อนลงในตารางตรรกศาสตร์ (Boolean) ทำให้ Support เพี้ยน
* **การแก้ไข (Prompt & Data Structuring Refinement):** ยึดโครงสร้างระดับบิล $26,327$ Baskets โดยแปลง Line Items ให้เป็น Unique Set of SKUs ต่อบิล (`groupby('TransactionID')['ProductName'].apply(list)`) จากนั้นใช้ `TransactionEncoder` ของ `mlxtend` สร้าง Sparse Matrix ที่ถูกต้อง 100%

### กรณีศึกษาที่ 3: ปัญหา UTF-8 BOM ใน Windows PowerShell Environment
* **ปัญหาที่พบ:** ในสภาพแวดล้อม Windows เมื่ออ่านไฟล์ CSV ที่เซฟด้วยสตรีมของ PowerShell หรือบางเครื่องมือ อาจมีไบต์พิเศษ `\ufeff` นำหน้าหัวตาราง ส่งผลให้เกิดข้อผิดพลาด `KeyError: 'DateKey'` หรือ `KeyError: 'ProductKey'` ใน Python
* **การแก้ไข (Engineering Defense):** กำหนดมาตรฐานในทุกโมดูล Python ของระบบให้เปิดไฟล์ CSV ด้วย `encoding='utf-8-sig'` เสมอ เพื่อ strip BOM ไบต์ทิ้งอย่างปลอดภัย 100%

### กรณีศึกษาที่ 4: การปรับชื่อ Cluster ให้เป็นคำสั่งทางธุรกิจ (Operational Labeling Refinement)
* **ปัญหาที่พบ:** ค่าเริ่มต้นของโมเดลจะให้ชื่อ "Cluster 0", "Cluster 1", "Cluster 2" ซึ่งไม่สามารถนำไปสร้างคุณค่าในการตัดสินใจ (DSS) ได้
* **การแก้ไข (Domain Semantic Enrichment):** ออกแบบฟังก์ชันแมปชื่อเชิงธุรกิจตาม Centroid Profile:
  - Cluster 0 $\rightarrow$ **High Revenue Anchors (Core Volume)**: 11 SKUs ขับเคลื่อนรายได้ 50.9%
  - Cluster 1 $\rightarrow$ **Long-Tail Assortment (Steady Movers)**: 43 SKUs สินค้าจำเป็นแต่ยอดขายหมุนเวียนช้า
  - Cluster 2 $\rightarrow$ **High Margin Boosters (Profitable Fast-Movers)**: 11 SKUs มาร์จิ้นสูงเฉลี่ย 36.36%

---

## 5. การเชื่อมโยงกับ Decision Support System (DSS) ใน Phase 6

ผลลัพธ์จาก Phase 5 จะถูกนำไปใช้ใน Phase 6 (Dashboard & UI) โดยตรง:
1. **Interactive Product Portfolio Map:** กราฟฟองสบู่ (Scatter Plot) แสดง 65 SKUs จำแนกสีตาม 3 คลัสเตอร์ ผู้จัดการร้านสามารถคลิกดู SKU เพื่อดูคำแนะนำด้านการสั่งซื้อ
2. **Dynamic Cross-Selling Engine:** เมื่อผู้จัดการร้านเลือกสินค้าชิ้นใด ระบบจะแสดงสินค้าที่มีค่า Lift สูงสุด เพื่อแนะนำการจัดโปรโมชันคู่ (Combo Promotion Widget)
3. **Inventory Reorder Alerts:** ผสานข้อมูล Cluster เข้ากับ Reorder Point เพื่อแจ้งเตือนสต็อกวิกฤต โดยให้น้ำหนักความเร่งด่วนกับ Cluster 0 สูงสุด
