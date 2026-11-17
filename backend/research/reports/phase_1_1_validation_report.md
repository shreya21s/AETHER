# Phase 1.1: Research Audit Validation, Numerical Reconciliation & Dataset Freeze Report

**Project:** Offline-First, Uncertainty-Aware Adaptive Cloud–Edge AI for Clinical Risk Screening in Low-Connectivity Healthcare Environments (**AETHER**)  
**Audit Stage:** Phase 1.1 — Rigorous Quality Audit & Numerical Reconciliation  
**Date of Audit:** November 18, 2026  
**Investigator:** Antigravity Bio-Tech & Distributed Clinical Systems Team  
**Dataset Analyzed:** CDC NHANES Cycles E (2007–2008), F (2009–2010), and G (2011–2012)  
**Primary Master Dataset:** [`nhanes_merged_2007_2012.csv.gz`](file:///c:/Users/shrey/OneDrive/Desktop/MajorProject/backend/research/data/processed/nhanes_merged_2007_2012.csv.gz) (Frozen, 30,442 rows × 61 variables)

---

## Executive Summary of Validation

Phase 1.1 was conducted to audit, verify, and reconcile all numerical counts, equations, and clinical terminology established in Phase 1 before any machine learning modeling is initiated. Every numerical value in this report was computed directly from participant-level NHANES records using reproducible pipelines.

### High-Level Summary of Findings
1. **Numerical Discrepancies Reconciled:** The preliminary pipeline's apparent discrepancy between $N = 7,144$ (Strict QC adults aged $\ge 40$) and $N = 7,114$ (Valid LLN) was traced to an unnecessary standing height filter. In the official Hankinson (1999) Table 6 specification, $FEV_1/FVC$ ratio LLN depends solely on age, sex, and race—not height. Removing this erroneous check preserves all **$N = 7,144$** strict QC participants with valid LLN.
2. **Complete-Case Attrition Confirmed:** Of the $7,144$ strict QC subjects, exactly **40** are missing BMI (`BMXBMI`) and **3** are missing chronic symptoms (`RDQ031`/`RDQ050`), yielding a frozen complete-case cohort of **$N = 7,101$** (**$99.40\%$ retention**).
3. **Temporal Split Perfectly Balanced:** The frozen $7,101$ cohort partitions chronologically into Training ($N = 4,908$, Cycles E+F) and Prospective Holdout ($N = 2,193$, Cycle G), with $4,908 + 2,193 = \mathbf{7,101}$ reconciling to the single participant.
4. **LLN Equation Verified:** Independent verification of Hankinson (1999) Table 6 confirmed exact concordance with published regression constants and demonstrated **$97.96\%$ diagnostic agreement** against GLI-2012 multi-ethnic continuous splines ($145$ disagreements out of $7,114$).
5. **Clinical Positioning Corrected:** The platform is explicitly framed as **Risk- and Symptom-Informed Respiratory Screening Triage**, targeting pre-bronchodilator airflow limitation. It is not universal screening of asymptomatic adults, and the primary target is never labeled confirmed COPD.
6. **Severe Verification Bias Proved in Post-BD:** Participant-level flow demonstrated that **$17,543$ participants ($74.86\%$)** with normal baseline spirometry were never administered albuterol. Post-BD status cannot serve as general screening ground truth without catastrophic work-up bias.

---

## 1. Discrepancy Investigation & Authoritative Numerical Reconciliation

### Investigation of Preliminary Audit Discrepancies

| Preliminary Discrepancy | Apparent Value | Authoritative Reconciled Value | Underlying Cause Identified in Data |
| :--- | :---: | :---: | :--- |
| **Strict QC Adults $\ge 40$ vs. Valid LLN** | $7,144$ vs. $7,114$ ($\Delta = 30$) | **$7,144$ = $7,144$** ($\Delta = 0$) | Preliminary script required `BMXHT` (height) to calculate LLN. In Hankinson (1999) Table 6, $FEV_1/FVC$ ratio equations have no height term ($b_3 = 0.0$). The 30 subjects were missing height measurement in the MEC but had valid spirometry and valid demographics. |
| **Complete-Case Retention Percentage** | Reported as $99.8\%$ | **$99.40\%$** | The preliminary report calculated $7,101 / 7,114 = 99.82\%$, using the height-restricted denominator ($7,114$) instead of the true strict QC cohort ($7,144$). $7,101 / 7,144 = \mathbf{99.398\%} \approx 99.40\%$. |
| **Temporal Split Sum vs. Complete Cohort** | $4,931 + 2,213 = 7,144$ vs. $7,101$ ($\Delta = 43$) | **$4,908 + 2,193 = 7,101$** ($\Delta = 0$) | Preliminary temporal split was executed on the $7,144$ strict QC cohort before predictor completeness filtering. In Phase 1.1, the temporal split is executed on the finalized $N = 7,101$ complete-case cohort. |
| **Missing Pack-Years in Former Smokers** | $2,096$ missing ($29.3\%$) | **$114$ missing ($5.5\%$)** | Preliminary script derived pack-years using `SMD650` (cigs/day past 30 days), which is structurally missing for former smokers. Adding `SMD055` (age quit) and `SMD057` (cigs/day when quit) increased former smoker pack-years coverage from $0\%$ to **$94.5\%$** ($1,942 / 2,056$). |

---

## 2. Authoritative Single Cohort Flow Table

Every stage was recomputed from participant-level data across Cycles E, F, and G:

| Step | Cohort Flow Stage | Adults Aged ≥ 18 | Step Retention (%) | Adults Aged ≥ 40 | Step Retention (%) | Clinical & Protocol Rule |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | Total Original Enrolled (DEMO E, F, G) | 30,442 | 100.0% | 30,442 | 100.0% | Complete civilian non-institutionalized sample |
| **2** | Target Age-Eligible Cohort | 18,619 | 61.16% | 11,763 | 38.64% | Age filter applied (`RIDAGEYR >= min_age`) |
| **3** | Examined in Mobile Examination Center | 18,619 | 100.0% | 11,763 | 100.0% | `WTMEC2YR > 0` (All sampled adults were examined in MEC) |
| **4** | Assigned to Spirometry Protocol | 16,859 | 90.55% | 10,219 | 86.87% | Protocol age range 6–79 years (Age ≥ 80 excluded by CDC) |
| **5** | Spirometry Attempted (Complete/Partial) | 14,348 | 85.11% | 8,481 | 83.00% | `SPXNSTAT in [1, 2]` (Excludes safety exclusions & refusals) |
| **6** | Strict ATS/ERS Grade A/B Quality | **12,301** | **85.73%** | **7,144** | **84.24%** | `QFVC in [A, B]` and `QFV1 in [A, B]` (repeatable within 150 mL) |
| **7** | Valid Spirometric Targets Available | **12,301** | **100.0%** | **7,144** | **100.0%** | Valid $FEV_1/FVC$ ratio and Hankinson Table 6 LLN computed |
| **8** | Pre-Test Predictor Complete-Case Cohort | **7,101** | **57.73%** | **7,101** | **99.40%** | Non-missing Tier 1 features (Age, Sex, Race, BMI, Smoking, Symptoms) |
| **9** | **Final Frozen Model-Eligible Cohort** | — | — | **7,101** | **99.40%** | Primary modeling population for clinical risk screening |
| **10a**| **Training Partition (Cycles E + F)** | — | — | **4,908** | **69.12%** | Chronological training set (2007–2010) |
| **10b**| **Prospective Holdout Test (Cycle G)** | — | — | **2,193** | **30.88%** | Chronological prospective evaluation benchmark (2011–2012) |

*Note on Adults Aged 18–39:* Chronic respiratory symptom questions (`RDQ031`, `RDQ050` regarding cough/phlegm $\ge 3$ months) were administered strictly to participants aged $\ge 40$ in NHANES 2007–2012. Because Tier 1 predictors include these core symptoms, complete-case analysis on the broad adult cohort (Age $\ge 18$) naturally collapses to participants aged $\ge 40$ ($N = 7,101$). Adults aged 18–39 can only be modeled if symptoms are excluded or analyzed as a secondary symptom-free demographic subset.

---

## 3. Master Dataset Integrity Validation

Validation was conducted on `nhanes_merged_2007_2012.csv.gz` ($30,442$ rows $\times$ $61$ variables):
- **Participant Inclusivity:** All $30,442$ rows represent the complete civilian non-institutionalized sample enrolled in NHANES DEMO files (Cycle E: $10,149$; Cycle F: $10,537$; Cycle G: $9,756$). Zero participants were silently dropped during ingestion.
- **Identifier Integrity:** `SEQN` is $100\%$ unique ($30,442$ unique values) with zero nulls.
- **Distinguishable Spirometry Missingness:** Participants without spirometry are clearly differentiated from normal results:
  * Ineligible / Age $< 6$ or $\ge 80$: $N = 7,009$
  * Protocol not done / Refused: $N = 1,779$
  * Safety exclusion / Contraindication: $N = 1,342$
  * Attempted spirometry: $N = 20,312$
  * Missing ground-truth target: Stored strictly as `NaN`, never filled with negative zeros.

Machine-readable validation audit: [`dataset_validation_report.json`](file:///c:/Users/shrey/OneDrive/Desktop/MajorProject/backend/research/reports/dataset_validation_report.json)

---

## 4. LLN Calculation Verification: Hankinson Table 6 vs. GLI-2012

### Hankinson et al. (1999) Mathematical Verification
The primary ground-truth target is computed using the official published equations from **Hankinson et al. (1999) Table 6** (*Am J Respir Crit Care Med*, 159:179–187):
$$\text{Predicted } FEV_1/FVC\% = a0\_pred + a1\_age \times \text{Age}$$
$$\text{LLN } FEV_1/FVC\% = a0\_lln + a1\_age \times \text{Age}$$
$$\text{Obstruction Criterion: } \frac{FEV_1}{FVC} < \frac{\text{LLN } FEV_1/FVC\%}{100.0}$$

### Official Published Coefficients Verified:
- **Caucasian Males:** $a0\_pred = 88.066$, $a0\_lln = 78.388$, $a1\_age = -0.2066$
- **African-American Males:** $a0\_pred = 89.239$, $a0\_lln = 78.822$, $a1\_age = -0.1828$
- **Mexican-American Males:** $a0\_pred = 90.024$, $a0\_lln = 80.925$, $a1\_age = -0.2186$
- **Caucasian Females:** $a0\_pred = 90.809$, $a0\_lln = 81.015$, $a1\_age = -0.2125$
- **African-American Females:** $a0\_pred = 91.655$, $a0\_lln = 80.978$, $a1\_age = -0.2039$
- **Mexican-American Females:** $a0\_pred = 92.360$, $a0\_lln = 83.044$, $a1\_age = -0.2248$

### Comparison with GLI-2012 (Global Lung Function Initiative):
Across all $N = 7,114$ adults aged $\ge 40$ with strict QC and height:
- **Hankinson Table 6 Obstruction Prevalence:** **$13.13\%$** ($N = 934$)
- **GLI-2012 Obstruction Prevalence:** **$11.74\%$** ($N = 835$)
- **Diagnostic Agreement:** **$97.96\%$** ($6,969 / 7,114$)
- **Classification Disagreements:** **$2.04\%$** ($N = 145$)
  * Hankinson positive / GLI negative: $122$ ($1.71\%$)
  * Hankinson negative / GLI positive: $23$ ($0.32\%$)
- **Mean Absolute Difference in LLN Ratio:** **$0.0092$ ($0.92\%$ ratio points)**
- **Max Absolute Difference in LLN Ratio:** **$0.0342$ ($3.42\%$ ratio points)**

### Historical Limitations of Race-Specific Equations:
Hankinson equations rely on discrete historical racial classifications (Caucasian, African-American, Mexican-American), which can oversimplify ancestral admixture and social determinants of lung health. In 2023, ATS/ERS recommended moving toward race-neutral reference equations (such as GLI Global). However, because CDC NHANES analytic tools historically utilized Hankinson NHANES III reference standards, we retain Hankinson Table 6 as our baseline, while submitting GLI-2012 as an open decision point for researcher approval.

---

## 5. Corrected Clinical Terminology & Target Discordance

### Standardized Research Definitions:
1. **Primary Research Target:** Pre-bronchodilator, spirometry-defined airflow obstruction using the selected Lower Limit of Normal (LLN) criterion ($FEV_1/FVC < \text{LLN}$).
2. **Secondary Sensitivity Target:** Pre-bronchodilator fixed ratio ($FEV_1/FVC < 0.70$) for sensitivity comparison against GOLD criteria.
3. **Confirmed COPD:** Requires formal diagnostic spirometry demonstrating post-bronchodilator persistent limitation ($FEV_{1,\text{post}}/FVC_{\text{post}} < 0.70$) in conjunction with appropriate clinical exposure history (tobacco or biomass smoke) and chronic respiratory symptoms. The primary screening outcome is NEVER termed confirmed COPD.
4. **Clinical Framing:** The project is positioned strictly as **Risk- and Symptom-Informed Respiratory Clinical Triage in Low-Connectivity Healthcare Environments**, prioritizing high-risk individuals for diagnostic referral. It is NOT universal screening of asymptomatic adults.

### Age-Decade Discordance in Final Model Cohort ($N = 7,101$):

| Age Decade | Cohort $N$ | Fixed Ratio Prev. | Hankinson LLN Prev. | Fixed+ / LLN- (Elderly Overdiagnosis) | Fixed- / LLN+ (Young Underdiagnosis) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **40–49** | 2,183 | $9.25\%$ ($N = 202$) | $10.86\%$ ($N = 237$) | 12 ($0.55\%$) | **47 ($2.15\%$)** |
| **50–59** | 1,995 | $15.59\%$ ($N = 311$) | $12.73\%$ ($N = 254$) | 60 ($3.01\%$) | 3 ($0.15\%$) |
| **60–69** | 1,840 | $23.53\%$ ($N = 433$) | $13.37\%$ ($N = 246$) | **187 ($10.16\%$)** | 0 ($0.0\%$) |
| **70–79** | 1,083 | **$34.81\%$** ($N = 377$) | **$18.19\%$** ($N = 197$) | **180 ($16.62\%$)** | 0 ($0.0\%$) |

In adults aged **70–79**, the fixed ratio classifies **$34.81\%$** as obstructed vs. **$18.19\%$** by LLN. Exactly **180 older adults ($16.62\%$)** are classified as obstructed solely due to natural senescent loss of lung elastic recoil.

---

## 6. Post-Bronchodilator Selection Analysis & Severe Verification Bias

### Complete Participant-Level Post-BD Flow
- **Total NHANES Cohort:** $N = 30,442$
- **Examined for Spirometry:** $N = 23,433$
- **Not Selected for Second Test (`SPDBRONC == 2`):** **$N = 17,543$ ($74.86\%$)**  
  *(Normal baseline spirometry without asthma; protocol dictated NO bronchodilator)*
- **Selected for Bronchodilator Protocol (`SPDBRONC == 1`):** **$N = 2,769$ ($11.82\%$)**
  * Contraindicated / Safety Exclusion (`SPXBSTAT == 4`): **$N = 608$ ($22.0\%$)**
  * Refused / Test Not Done (`SPXBSTAT == 3`): **$N = 597$ ($21.6\%$)**
  * Albuterol Administered & Test Attempted (`SPXBSTAT \in [1, 2]`): **$N = 1,564$ ($56.5\%$)**
  * Usable FEV1 and FVC Curves: **$N = 1,564$**
  * Expanded A/B/C QC: **$N = 1,555$**
  * Strict A/B QC: **$N = 1,430$**
    - **Persistent Post-BD Obstruction ($FEV_{1,\text{post}}/FVC_{\text{post}} < 0.70$):** **$N = 520$ ($36.36\%$)**
    - **Reversible Airflow Limitation ($FEV_{1,\text{post}}/FVC_{\text{post}} \ge 0.70$):** **$N = 910$ ($63.64\%$)**

### Mathematical Demonstration of Verification Bias:
In NHANES, $P(V = 1 \mid Y_{\text{pre}} = \text{Normal} \land \text{No Asthma}) = 0$. Exactly **$17,543$ participants** were never administered bronchodilators. Training an ML model only on verified subjects ($N = 1,430$) models a specialty clinic referral population rather than a community screening cohort. Post-BD data is strictly restricted to secondary reversibility analysis.

---

## 7. Smoking & Pack-Years Derivation Audit

Pack-years were derived using exact cycle-specific variables for initiation, cessation, and intensity:
- **Current Smokers:** $\text{Pack-Years} = \frac{\text{SMD650}}{20.0} \times (\text{RIDAGEYR} - \text{SMD030})$
- **Former Smokers:** $\text{Pack-Years} = \frac{\text{SMD057}}{20.0} \times (\text{SMD055} - \text{SMD030})$
- **Never Smokers:** $\text{Pack-Years} = 0.0$ (structural zero)

### Empirical Pack-Years Availability in Adults Aged $\ge 40$ ($N = 7,101$):
- **Current Smokers ($N = 1,406$):** $1,386$ ($98.58\%$) valid pack-years (mean = $24.89$)
- **Former Smokers ($N = 2,056$):** $1,942$ ($94.46\%$) valid pack-years (mean = $27.57$)
- **Never Smokers ($N = 3,635$):** $3,635$ ($100.0\%$) valid pack-years ($0.0$)
- **Unknown Smoking ($N = 4$):** $0$ valid pack-years (missing)

Unsupported former smokers missing quit age/intensity are retained with valid smoking status but missing pack-years, avoiding arbitrary median imputation.

---

## 8. Questionnaire Eligibility & Coding Audit

| Variable | Official Questionnaire Text | Target Age Range | Valid Response Codes | Missingness Nature |
| :--- | :--- | :---: | :--- | :--- |
| `RDQ031` | Cough on most days for 3 consecutive months or more? | **40–80 years** | 1=Yes, 2=No, 7=Refused, 9=Don't know | Administered strictly to Age ≥ 40 |
| `RDQ050` | Bring up phlegm on most days for 3 consecutive months or more? | **40–80 years** | 1=Yes, 2=No, 7=Refused, 9=Don't know | Administered strictly to Age ≥ 40 |
| `RDQ070` | Wheezing or whistling in chest past 12 months? | 1–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Complete population inquiry |
| `RDQ140` | Shortness of breath hurrying on level ground or slight hill? | 1–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Complete population inquiry |
| `MCQ010` | Ever told by doctor had asthma? | 1–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Complete population inquiry |
| `MCQ035` | Still have active asthma? | 1–80 years | 1=Yes, 2=No, 9=Don't know | **Structural Skip** (Asked only if MCQ010=1) |
| `MCQ160G`| Ever told by doctor had emphysema? | 20–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Adult inquiry |
| `MCQ160K`| Ever told by doctor had chronic bronchitis? | 20–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Adult inquiry |

Refused (`7`) and Don't Know (`9`) codes are strictly distinguished from negative responses. Structural skips are preserved.

---

## 9. Spirometry QC & Spectrum Bias Analysis

| Clinical Characteristic | Strict QC (A/B) | Expanded QC (A/B/C) | Attempted Failed Strict QC | Assigned Not Tested (3/4) | Age ≥ 80 Protocol Ineligible |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Sample Size ($N$)** | **$7,144$** | **$8,002$** | **$1,337$** | **$1,738$** | **$1,544$** |
| **Mean Age (years)** | $56.65$ | $56.93$ | $59.60$ | $60.26$ | $75.84$ |
| **Female Gender (%)** | $51.67\%$ | $50.41\%$ | $44.65\%$ | $52.65\%$ | $53.24\%$ |
| **Mean BMI ($kg/m^2$)** | $29.57$ | $29.53$ | $29.49$ | $29.76$ | $26.72$ |
| **Current Smoker (%)** | $19.82\%$ | $20.19\%$ | $22.51\%$ | $21.40\%$ | $6.61\%$ |
| **Wheezing Past 12m (%)** | $13.40\%$ | $13.40\%$ | $14.06\%$ | **$21.58\%$** | $9.84\%$ |
| **Chronic Cough (%)** | $9.69\%$ | $9.90\%$ | $10.85\%$ | **$15.54\%$** | $10.43\%$ |
| **Hankinson LLN Prev.** | $13.13\%$ | $13.38\%$ | $14.47\%$ | — | — |
| **Fixed (< 0.70) Prev.** | $18.65\%$ | $18.96\%$ | $20.48\%$ | — | — |

**Spectrum Bias Finding:** Participants assigned but not tested (refusals/contraindications) have significantly higher wheezing ($21.58\%$ vs. $13.40\%$) and chronic cough ($15.54\%$ vs. $9.69\%$). Strict QC eliminates measurement noise for training, but clinical deployment models must remain robust when evaluating patients who struggle with forced expiratory maneuvers.

---

## 10. Complex Survey Design Validation

1. **Weight Formula:** Confirmed official CDC multi-cycle pooling formula: $WTMEC6YR = \frac{WTMEC2YR}{3.0}$.
2. **Design Variables:** Preserved pseudo-strata (`SDMVSTRA`), primary sampling units (`SDMVPSU`), and cycle year (`SDDSRVYR`).
3. **Population vs. ML Metrics:** Survey-weighted prevalence for LLN obstruction is **$13.82\%$** ($\pm 0.54\%$) vs. unweighted sample prevalence of **$13.15\%$**. Machine learning models will optimize unweighted loss for individual risk discrimination, with post-hoc probability calibration evaluated against survey weights.

---

## 11. Final Frozen Temporal Validation Split

The prospective temporal split is constructed strictly from the finalized $N = 7,101$ complete-case cohort:
- **Training / Internal Tuning Set:** Cycles E (2007–2008) + F (2009–2010) $\implies$ **$N = 4,908$**
- **Prospective Temporal Holdout:** Cycle G (2011–2012) $\implies$ **$N = 2,193$**

### Partition Class Balance & Covariate Stability

| Parameter | Training Partition (Cycles E+F) | Temporal Holdout (Cycle G) | Temporal Shift ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **Sample Size ($N$)** | **$4,908$** | **$2,193$** | — |
| **Mean Age (years)** | $56.82$ | $56.24$ | $-0.58$ years |
| **Female Gender (%)** | $51.63\%$ | $51.76\%$ | $+0.13\%$ |
| **Mean BMI ($kg/m^2$)** | $29.62$ | $29.45$ | $-0.18\,kg/m^2$ |
| **Current Smoker (%)** | $19.95\%$ | $19.47\%$ | $-0.48\%$ |
| **Primary Target (Hankinson LLN +)** | **$679$ ($13.83\%$)** | **$255$ ($11.63\%$)** | **$-2.21\%$** |
| **Primary Target (Hankinson LLN -)** | **$4,229$ ($86.17\%$)** | **$1,938$ ($88.37\%$)** | $+2.21\%$ |
| **Secondary Target (Fixed < 0.70 +)** | **$942$ ($19.19\%$)** | **$381$ ($17.37\%$)** | **$-1.82\%$** |
| **Secondary Target (Fixed < 0.70 -)** | **$3,966$ ($80.81\%$)** | **$1,812$ ($82.63\%$)** | $+1.82\%$ |

### Strict ML Protocol Safeguards:
1. **Preprocessing Isolation:** All imputers, standardizers, encoders, and feature selectors will be fitted solely on Training data (Cycles E+F).
2. **No Data Snooping:** Hyperparameter optimization, probability threshold tuning, and conformal calibration partitions will be established strictly within Cycles E+F (e.g. 80% train / 20% internal calibration).
3. **Untouched Benchmark:** Cycle G will be evaluated only once as the final prospective holdout benchmark.

---

## 12. Corrected AETHER Feature Architecture

The feature architecture enforces three strictly bounded clinical tiers:
- **Tier 1 (Initial Non-Invasive Screening):** Demographics (age, sex, race/ethnicity), anthropometry (height, weight, BMI), exposure history (smoking status, pack-years), chronic symptoms (cough, phlegm, wheezing, exertional dyspnea), and medical conditions (asthma, bronchitis, emphysema). Entered via clinical questionnaire intake.
- **Tier 2 (Additional Clinically Justified Edge Telemetry):** Handheld peak expiratory flow (PEF), resting pulse oximetry ($SpO_2$), and resting heart rate entered manually or captured when edge measurement equipment is available. NO mandatory IoT hardware, Raspberry Pi, or Arduino required.
- **Tier 3 (Retrospective Reference Standards):** Laboratory-grade spirometric values ($FEV_1$, $FVC$, $FEV_1/FVC$, Hankinson LLN, Fixed 0.70) used exclusively for retrospective model training, loss computation, and ground-truth validation. Zero leakage into Tier 1 predictors.

---

## 13. Remaining Limitations & Open Decisions Requiring Approval

### Limitations:
1. **Pre-Bronchodilator Triage:** Ground-truth targets reflect pre-bronchodilator airflow limitation. Confirmatory post-BD COPD diagnosis cannot be determined for the general population due to 100% verification bias in unselected subjects.
2. **Historical Reference Equations:** Hankinson (1999) reference equations use discrete racial groupings, whereas GLI-2012 provides multi-ethnic splines.
3. **Symptom Recall:** Respiratory symptoms are self-reported via standardized questionnaires and subject to subjective recall variation.

### Decisions Submitted for Researcher Approval Before Phase 2:
1. **Approve Primary Target:** Confirm Hankinson (1999) Table 6 LLN ($FEV_1/FVC < \text{LLN}$) as the primary clinical screening target, with Fixed Ratio (< 0.70) as secondary sensitivity comparator.
2. **Approve Reference Standard:** Confirm retention of Hankinson (1999) vs. adopting GLI-2012 (which exhibits $97.96\%$ diagnostic agreement).
3. **Approve Final Model Cohort:** Confirm the frozen $N = 7,101$ complete-case cohort aged $\ge 40$ years, partitioned into Train ($N = 4,908$) and Test ($N = 2,193$).
4. **Approve Phase 2 Commencement:** Authorize initiation of baseline machine learning model development and uncertainty calibration.
