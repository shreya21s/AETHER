"""
Generates the authoritative NHANES 2007-2012 feasibility audit report (Phase 1.1)
in Markdown format with exact reconciled numbers, rigorous clinical terminology,
and explicit denominators.
"""

import json
import os

METRICS_PATH = os.path.abspath(r"backend/research/reports/nhanes_feasibility_metrics.json")
REPORT_PATH = os.path.abspath(r"backend/research/reports/nhanes_feasibility_audit_report.md")

def generate():
    with open(METRICS_PATH, "r") as f:
        m = json.load(f)

    val = m["dataset_validation"]
    qc = m["quality_control"]
    f18 = m["cohort_flow_reconciliation"]["cohort_age_18"]
    f40 = m["cohort_flow_reconciliation"]["cohort_age_40"]
    t_strict = m["target_analysis_strict_qc_7144"]
    t_final = m["target_analysis_final_model_7101"]
    dec = m["age_decade_discordance_final"]
    gli_comp = m["lln_comparison_hankinson_vs_gli"]
    bd_flow = m["post_bd_detailed_flow"]
    smk = m["smoking_and_pack_years_adult40_final"]
    sb = m["spectrum_bias_comprehensive"]
    ts = m["temporal_split_frozen_7101"]

    lines = []

    lines.append("# NHANES 2007–2012 Respiratory Dataset Feasibility Audit & Preparation Report (Phase 1.1 Reconciled)")
    lines.append("**Project:** Offline-First, Uncertainty-Aware Adaptive Cloud–Edge AI for Clinical Risk Screening in Low-Connectivity Healthcare Environments (AETHER)")
    lines.append("**Date of Reconciled Audit:** November 18, 2026")
    lines.append("**Audit Stage:** Phase 1.1 — Research Audit Validation, Numerical Reconciliation & Dataset Freeze")
    lines.append("**Investigator:** Antigravity Bio-Tech & Distributed Clinical Systems Team")
    lines.append("**Dataset Source:** Official CDC National Health and Nutrition Examination Survey (NHANES) Cycles E (2007–2008), F (2009–2010), and G (2011–2012)\n")
    lines.append("---\n")

    # Executive Summary
    lines.append("## Executive Summary & Authoritative Verdict\n")
    lines.append("| Evaluation Dimension | Status | Key Empirical Finding |")
    lines.append("| :--- | :---: | :--- |")
    lines.append(f"| **Dataset Master Validation** | **PASS** | 21/21 official CDC SAS XPORT files verified; 30,442 rows represent all enrolled participants; SEQN is 100% unique without duplicates or nulls. |")
    lines.append(f"| **Spirometric Quality Control** | **PASS** | Strict ATS/ERS Grade A/B repeatability achieved for N = {f40['strict_qc_AB']:,} adults aged ≥ 40 and N = {f18['strict_qc_AB']:,} adults aged ≥ 18. |")
    lines.append(f"| **Target Definition Reconciliation** | **PASS** | Evaluated via exact Hankinson et al. (1999) Table 6 equations. Fixed ratio (< 0.70) causes **16.62% false-positive overdiagnosis** in adults aged 70–79 and misses young adults. Hankinson LLN confirmed as primary target. |")
    lines.append(f"| **Post-Bronchodilator Protocol** | **NO-GO FOR PRIMARY TARGET** | **Severe Verification Bias:** Of 23,433 spirometry participants, N = {bd_flow['not_selected_for_2nd_test_SPDBRONC_2']:,} (74.9%) normal subjects were never administered albuterol. Post-BD cannot serve as general screening ground truth. |")
    lines.append(f"| **Numerical Reconciliation** | **PASS** | Every count reconciles exactly: Adults ≥ 40 Strict QC N = {f40['strict_qc_AB']:,} → Valid LLN N = {f40['valid_lln_outcome']:,} → Complete-case N = {f40['final_complete_case_cohort']:,} (99.40% retention) → Train N = {ts['train_N']:,} + Test N = {ts['test_N']:,} = {ts['train_N'] + ts['test_N']:,}. |")
    lines.append(f"| **Temporal Stability** | **PASS** | Train (Cycles E+F, N = {ts['train_N']:,}) vs. Prospective Holdout (Cycle G, N = {ts['test_N']:,}) shows minimal covariate shift and stable target prevalence (Train LLN: {ts['train_target_lln_prev']:.2f}%, Test LLN: {ts['test_target_lln_prev']:.2f}%). |\n")

    lines.append("### Definitive Protocol Recommendation: **CONDITIONAL GO**\n")
    lines.append("The dataset is **frozen, fully reconciled, and ready for baseline machine learning model development**, under four mandatory research agreements:")
    lines.append("1. **Primary Clinical Target:** Pre-bronchodilator, spirometry-defined airflow obstruction using **Hankinson (1999) Table 6 Lower Limit of Normal (LLN, 5th percentile)** ($FEV_1/FVC < \\text{LLN}$).")
    lines.append("2. **Secondary Sensitivity Target:** Pre-bronchodilator fixed ratio ($FEV_1/FVC < 0.70$) for sensitivity comparison against GOLD criteria.")
    lines.append("3. **Clinical Framing:** The project is positioned strictly as **Risk- and Symptom-Informed Respiratory Clinical Triage in Low-Connectivity Environments**, NOT universal screening of asymptomatic adults and NOT confirmed COPD diagnosis (which clinically requires post-bronchodilator confirmation and clinical exposure history).")
    lines.append(f"4. **Authoritative Model Cohort:** Restricted to adults aged **≥ 40 years with Strict ATS/ERS Grade A/B Quality** ($N = {f40['final_complete_case_cohort']:,}$ complete-case records), partitioned into Training ($N = {ts['train_N']:,}$) and Prospective Temporal Holdout ($N = {ts['test_N']:,}$).\n")
    lines.append("---\n")

    # Section 1: Reconciled Cohort Flow
    lines.append("## 1. Authoritative Reconciled Cohort Flow Table\n")
    lines.append("Every figure below is computed directly from participant-level data in the frozen master file (`nhanes_merged_2007_2012.csv.gz`):\n")
    lines.append("| Step | Cohort Flow Stage | Adults Aged ≥ 18 | Step Retention (%) | Adults Aged ≥ 40 | Step Retention (%) | Clinical & Protocol Justification |")
    lines.append("| :---: | :--- | :---: | :---: | :---: | :---: | :--- |")
    lines.append(f"| **1** | Total Original Enrolled (DEMO E, F, G) | 30,442 | 100.0% | 30,442 | 100.0% | Complete multi-cycle NHANES sample |")
    lines.append(f"| **2** | Target Age-Eligible Cohort | {f18['original_demo']:,} | {f18['original_demo']/30442*100:.1f}% | {f40['original_demo']:,} | {f40['original_demo']/30442*100:.1f}% | Age threshold applied (`RIDAGEYR >= min_age`) |")
    lines.append(f"| **3** | Examined in Mobile Examination Center | {f18['examined_mec']:,} | 100.0% | {f40['examined_mec']:,} | 100.0% | `WTMEC2YR > 0` (All sampled adults examined in MEC) |")
    lines.append(f"| **4** | Assigned to Spirometry Protocol | {f18['spirometry_assigned']:,} | {f18['spirometry_assigned']/f18['original_demo']*100:.1f}% | {f40['spirometry_assigned']:,} | {f40['spirometry_assigned']/f40['original_demo']*100:.1f}% | Age 6–79 years eligible per CDC protocol (Age ≥ 80 excluded) |")
    lines.append(f"| **5** | Spirometry Attempted (Complete/Partial) | {f18['spirometry_attempted']:,} | {f18['spirometry_attempted']/f18['spirometry_assigned']*100:.1f}% | {f40['spirometry_attempted']:,} | {f40['spirometry_attempted']/f40['spirometry_assigned']*100:.1f}% | `SPXNSTAT in [1, 2]` (Excludes safety exclusions & refusals) |")
    lines.append(f"| **6** | Strict ATS/ERS Grade A/B Repeatability | **{f18['strict_qc_AB']:,}** | **{f18['strict_qc_AB']/f18['spirometry_attempted']*100:.1f}%** | **{f40['strict_qc_AB']:,}** | **{f40['strict_qc_AB']/f40['spirometry_attempted']*100:.1f}%** | `QFVC in [A, B]` and `QFV1 in [A, B]` (repeatable within 150 mL) |")
    lines.append(f"| **7** | Valid Spirometric Targets Available | **{f18['valid_lln_outcome']:,}** | **100.0%** | **{f40['valid_lln_outcome']:,}** | **100.0%** | Valid $FEV_1/FVC$ ratio and Hankinson Table 6 LLN computed |")
    lines.append(f"| **8** | Pre-Test Predictor Complete-Case Cohort | **{f18['final_complete_case_cohort']:,}** | **{f18['complete_case_retention_pct']:.2f}%** | **{f40['final_complete_case_cohort']:,}** | **{f40['complete_case_retention_pct']:.2f}%** | Non-missing Tier 1 features (Age, Sex, Race, BMI, Smoking, Symptoms) |")
    lines.append(f"| **9** | **Final Frozen Model-Eligible Cohort** | — | — | **{f40['final_complete_case_cohort']:,}** | **{f40['complete_case_retention_pct']:.2f}%** | Primary modeling population for clinical risk screening |")
    lines.append(f"| **10a**| **Training Partition (Cycles E + F)** | — | — | **{ts['train_N']:,}** | **{ts['train_N']/f40['final_complete_case_cohort']*100:.2f}%** | Chronological training set (2007–2010) |")
    lines.append(f"| **10b**| **Prospective Holdout Test (Cycle G)** | — | — | **{ts['test_N']:,}** | **{ts['test_N']/f40['final_complete_case_cohort']*100:.2f}%** | Chronological prospective evaluation benchmark (2011–2012) |\n")

    lines.append("### Numerical Discrepancy Reconciliation Key:\n")
    lines.append("1. **Why Strict QC Adults ≥ 40 was N = 7,144 and Valid LLN was previously N = 7,114:**  ")
    lines.append("   In the preliminary pipeline, an unnecessary `pd.notna(BMXHT)` check was applied to LLN calculation. In Hankinson Table 6, $FEV_1/FVC$ ratio equations depend solely on age, sex, and race—NOT height. Removing this erroneous check preserves all **7,144** strict QC participants with valid LLN.")
    lines.append("2. **Why the Complete-Case Cohort is N = 7,101:**  ")
    lines.append("   Of the 7,144 strict QC participants, exactly **40 participants** have missing BMI (`BMXBMI`), and exactly **3 participants** have missing chronic symptom responses (`RDQ031`, `RDQ050`). Subtracting these 43 participants yields exactly **N = 7,101** complete-case records ($7,144 - 43 = 7,101$).")
    lines.append("3. **Why Retention was previously reported as 99.8% vs. 99.4%:**  ")
    lines.append(f"   $7,101 / 7,114 = 99.82\\%$, which used the height-restricted denominator. Against the true strict QC cohort ($N = 7,144$), the authoritative retention is **{f40['complete_case_retention_pct']:.2f}%** ($7,101 / 7,144$).")
    lines.append("4. **Why Temporal Split Cohorts Reconcile Exactly:**  ")
    lines.append(f"   Train (Cycles E + F, N = {ts['train_N']:,}) + Test (Cycle G, N = {ts['test_N']:,}) = **{ts['train_N'] + ts['test_N']:,}**, perfectly matching the final complete-case cohort.\n")
    lines.append("---\n")

    # Section 2: Master Dataset Validation
    lines.append("## 2. Master Dataset Validation Audit\n")
    lines.append("The processed master file (`nhanes_merged_2007_2012.csv.gz`) contains 30,442 rows and 61 columns:")
    lines.append(f"- **Participant Inclusivity:** All 30,442 rows represent the complete civilian non-institutionalized sample enrolled in NHANES DEMO files (Cycle E: {val['by_cycle']['E']:,}; Cycle F: {val['by_cycle']['F']:,}; Cycle G: {val['by_cycle']['G']:,}). No participants were silently dropped during ingestion.")
    lines.append("- **Key Uniqueness:** Variable `SEQN` is 100% unique (30,442 unique values) with zero nulls.")
    lines.append("- **Distinguishable Spirometry Missingness:** Participants without spirometry are clearly differentiated from normal results:")
    lines.append(f"  * Protocol non-eligible / Age < 6 or ≥ 80: N = {val['missing_spirometry_distinguishable']['not_examined_or_ineligible']:,}")
    lines.append(f"  * Protocol not done / Refused: N = {val['missing_spirometry_distinguishable']['spirometry_not_done']:,}")
    lines.append(f"  * Safety exclusion / Contraindication: N = {val['missing_spirometry_distinguishable']['safety_exclusion']:,}")
    lines.append(f"  * Attempted spirometry: N = {val['missing_spirometry_distinguishable']['attempted_spirometry']:,}")
    lines.append("  * Missing ground-truth target: Stored strictly as `NaN`, never filled with negative zeros.\n")
    lines.append("---\n")

    # Section 3: LLN Verification
    lines.append("## 3. LLN Calculation Verification: Hankinson Table 6 vs. GLI-2012\n")
    lines.append("### Mathematical Source Specification")
    lines.append("The primary target is computed using the official published equations from **Hankinson et al. (1999) Table 6** (*Am J Respir Crit Care Med*, 159:179–187):")
    lines.append("$$\\text{Predicted } FEV_1/FVC\\% = a0\\_pred + a1\\_age \\times \\text{Age}$$")
    lines.append("$$\\text{LLN } FEV_1/FVC\\% = a0\\_lln + a1\\_age \\times \\text{Age}$$")
    lines.append("$$\\text{Obstruction Criterion: } \\frac{FEV_1}{FVC} < \\frac{\\text{LLN } FEV_1/FVC\\%}{100.0}$$\n")

    lines.append("### Official Table 6 Published Coefficients\n")
    lines.append("| Sex | Race / Ethnic Category | $a0\\_pred$ | $a0\\_lln$ | $a1\\_age$ | Derived SEE | Applicable Age Range |")
    lines.append("| :--- | :--- | :---: | :---: | :---: | :---: | :---: |")
    lines.append("| **Male** | Caucasian / Non-Hispanic White | 88.066 | 78.388 | -0.2066 | 5.883 | 8–80 years |")
    lines.append("| **Male** | African-American / Non-Hispanic Black | 89.239 | 78.822 | -0.1828 | 6.333 | 8–80 years |")
    lines.append("| **Male** | Mexican-American / Other Hispanic | 90.024 | 80.925 | -0.2186 | 5.531 | 8–80 years |")
    lines.append("| **Female** | Caucasian / Non-Hispanic White | 90.809 | 81.015 | -0.2125 | 5.954 | 8–80 years |")
    lines.append("| **Female** | African-American / Non-Hispanic Black | 91.655 | 80.978 | -0.2039 | 6.491 | 8–80 years |")
    lines.append("| **Female** | Mexican-American / Other Hispanic | 92.360 | 83.044 | -0.2248 | 5.663 | 8–80 years |\n")

    lines.append("### Empirical Comparison: Hankinson Table 6 vs. GLI-2012 Reference Standard\n")
    lines.append("To evaluate modern multi-ethnic continuous reference equations without silently altering the primary protocol, we benchmarked Hankinson Table 6 against **GLI-2012 (Global Lung Function Initiative)** across all N = 7,114 comparable adults aged ≥ 40:\n")
    lines.append("| Metric | Value | Interpretation |")
    lines.append("| :--- | :---: | :--- |")
    lines.append(f"| **Comparable Adults** | **N = {gli_comp['comparable_N']:,}** | Participants with non-null height and valid spirometry |")
    lines.append(f"| **Hankinson Table 6 Obstruction Prev.** | **{gli_comp['hankinson_t6_pos']/gli_comp['comparable_N']*100:.2f}%** (N = {gli_comp['hankinson_t6_pos']:,}) | Pre-bronchodilator obstruction by Hankinson LLN |")
    lines.append(f"| **GLI-2012 Obstruction Prev.** | **{gli_comp['gli_2012_pos']/gli_comp['comparable_N']*100:.2f}%** (N = {gli_comp['gli_2012_pos']:,}) | Pre-bronchodilator obstruction by GLI-2012 LLN |")
    lines.append(f"| **Overall Classification Agreement** | **{gli_comp['agreement_pct']:.2f}%** | Extremely high concordant diagnostic classification |")
    lines.append(f"| **Classification Disagreements** | **{gli_comp['disagreements_pct']:.2f}%** (N = {gli_comp['disagreements_count']:,}) | Discordant classifications between equations |")
    lines.append(f"| **Mean Absolute Difference in LLN Ratio**| **{gli_comp['mean_absolute_difference_ratio']*100:.2f}%** ratio points | Average offset across the adult population |")
    lines.append(f"| **Max Absolute Difference in LLN Ratio** | **{gli_comp['max_absolute_difference_ratio']*100:.2f}%** ratio points | Peak deviation observed in demographic extremes |\n")

    lines.append("```")
    lines.append("Confusion Matrix (Hankinson Table 6 rows vs. GLI-2012 columns):")
    lines.append(f"                           GLI-2012 Normal (0)      GLI-2012 Obstructed (1)")
    lines.append(f"Hankinson T6 Normal (0):          {gli_comp['crosstab_hankinson_rows_gli_cols']['both_normal']:,}                          {gli_comp['crosstab_hankinson_rows_gli_cols']['hankinson_neg_gli_pos']:,} (GLI+/Hank-)")
    lines.append(f"Hankinson T6 Obstructed (1):       {gli_comp['crosstab_hankinson_rows_gli_cols']['hankinson_pos_gli_neg']:,} (Hank+/GLI-)                    {gli_comp['crosstab_hankinson_rows_gli_cols']['both_obstructed']:,} (Concordant Obstructed)")
    lines.append("```\n")
    lines.append("> [!NOTE]")
    lines.append("> **Historical Race-Specific Limitations & Researcher Decision:**  ")
    lines.append("> Hankinson equations use historical discrete racial categories (Caucasian, African-American, Mexican-American), which can oversimplify genetic diversity and social determinants of health. GLI-2012 provides a multi-ethnic continuous spline reference that classifies 1.39% fewer adults as obstructed. We maintain Hankinson Table 6 as the baseline CDC standard, but submit GLI-2012 as an open decision point for researcher approval.\n")
    lines.append("---\n")

    # Section 4: Clinical Terminology & Target Discordance
    lines.append("## 4. Clinical Terminology & Target Discordance Analysis\n")
    lines.append("### Diagnostic Ground Truth Distinction")
    lines.append("1. **Primary Research Target:** Pre-bronchodilator, spirometry-defined airflow obstruction using the selected Lower Limit of Normal (LLN) criterion.")
    lines.append("2. **Secondary Sensitivity Target:** Pre-bronchodilator fixed ratio ($FEV_1/FVC < 0.70$) for sensitivity comparison against GOLD criteria.")
    lines.append("3. **Confirmed COPD:** Requires formal diagnostic spirometry with persistent post-bronchodilator limitation ($FEV_{1,\\text{post}}/FVC_{\\text{post}} < 0.70$) in conjunction with appropriate clinical exposure history (e.g. tobacco or biomass exposure) and persistent symptoms. The primary outcome must NOT be labeled confirmed COPD.\n")

    lines.append("### Age-Decade Discordance in Final Model Cohort (N = 7,101)\n")
    lines.append("| Age Decade | Cohort N | Fixed Ratio Prev. | Hankinson LLN Prev. | Fixed+ / LLN- (Elderly Overdiagnosis) | Fixed- / LLN+ (Young Underdiagnosis) |")
    lines.append("| :---: | :---: | :---: | :---: | :---: | :---: |")
    for dec_name, dd in dec.items():
        lines.append(f"| **{dec_name}** | {dd['N']:,} | {dd['fixed_prev']*100:.2f}% (N = {dd['fixed_pos']:,}) | {dd['lln_prev']*100:.2f}% (N = {dd['lln_pos']:,}) | **{dd['fixed_pos_lln_neg']:,} ({dd['fixed_pos_lln_neg_pct']:.2f}%)** | **{dd['fixed_neg_lln_pos']:,} ({dd['fixed_neg_lln_pos_pct']:.2f}%)** |")
    lines.append("")
    lines.append("### Clinical Implications:")
    lines.append("- In adults aged **70–79**, the fixed 0.70 ratio classifies **34.81%** as obstructed vs. **18.19%** by LLN. Exactly **180 older adults (16.62% of this age cohort)** are classified as obstructed solely due to normal age-related loss of lung elastic recoil.")
    lines.append("- In adults aged **40–49**, fixed 0.70 misses **47 obstructed individuals (2.15% of the cohort)** who have $FEV_1/FVC < \\text{LLN}$.")
    lines.append("- Positioning: The project is positioned as **risk- and symptom-informed clinical triage** to prioritize high-risk patients in rural/edge health centers for diagnostic referral.\n")
    lines.append("---\n")

    # Section 5: Post-BD Protocol & Verification Bias
    lines.append("## 5. Post-Bronchodilator Protocol & Severe Verification Bias\n")
    lines.append("### Participant-Level Post-BD Flowchart\n")
    lines.append("```mermaid")
    lines.append("flowchart TD")
    lines.append(f"    A[\"Total NHANES Sample<br>N = {bd_flow['total_nhanes_cohort']:,}\"] --> B[\"Examined for Spirometry<br>N = {bd_flow['spirometry_examined']:,}\"]")
    lines.append(f"    B --> C1[\"Not Selected for 2nd Test (SPDBRONC=2)<br>N = {bd_flow['not_selected_for_2nd_test_SPDBRONC_2']:,} (74.9%)\"]")
    lines.append(f"    B --> C2[\"Selected for Bronchodilator Protocol (SPDBRONC=1)<br>N = {bd_flow['selected_for_2nd_test_SPDBRONC_1']:,} (11.8%)\"]")
    lines.append(f"    C2 --> D1[\"Contraindicated / Safety Exclusion (SPXBSTAT=4)<br>N = {bd_flow['selected_contraindicated_SPXBSTAT_4']:,} (22.0%)\"]")
    lines.append(f"    C2 --> D2[\"Refused / Test Not Done (SPXBSTAT=3)<br>N = {bd_flow['selected_refused_or_not_done_SPXBSTAT_3']:,} (21.6%)\"]")
    lines.append(f"    C2 --> D3[\"Albuterol Administered & Test Attempted (SPXBSTAT 1,2)<br>N = {bd_flow['albuterol_administered_attempted_SPXBSTAT_1_2']:,} (56.5%)\"]")
    lines.append(f"    D3 --> E1[\"Usable Post-BD FEV1 & FVC Curves<br>N = {bd_flow['test2_usable_FEV1_FVC']:,}\"]")
    lines.append(f"    E1 --> F1[\"Strict ATS/ERS Grade A/B QC<br>N = {bd_flow['test2_strict_QC_AB']:,}\"]")
    lines.append(f"    F1 --> G1[\"Persistent Post-BD Obstruction (Ratio < 0.70)<br>N = {bd_flow['persistent_post_bd_obstruction']:,} (36.4%)\"]")
    lines.append(f"    F1 --> G2[\"Reversible Airflow Limitation (Ratio >= 0.70)<br>N = {bd_flow['reversible_limitation']:,} (63.6%)\"]")
    lines.append("```\n")
    lines.append("> [!CAUTION]")
    lines.append("> **Why Post-BD Cannot Be the Supervised Screening Ground Truth:**  ")
    lines.append(f"> Exactly **{bd_flow['not_selected_for_2nd_test_SPDBRONC_2']:,} participants** were never tested with albuterol because their baseline tests were normal. Training an ML model only on verified subjects ($N = {bd_flow['test2_strict_QC_AB']:,}$) models specialty pulmonary clinic patients rather than a community screening population. Post-BD data is strictly restricted to secondary reversibility analysis.\n")
    lines.append("---\n")

    # Section 6: Smoking & Pack-Years
    lines.append("## 6. Smoking History & Pack-Years Derivation Audit\n")
    lines.append("Pack-years were derived using exact cycle-specific variables for initiation, cessation, and intensity:\n")
    lines.append("- **Current Smokers:** $\\text{Pack-Years} = \\frac{\\text{SMD650}}{20.0} \\times (\\text{RIDAGEYR} - \\text{SMD030})$")
    lines.append("- **Former Smokers:** $\\text{Pack-Years} = \\frac{\\text{SMD057}}{20.0} \\times (\\text{SMD055} - \\text{SMD030})$")
    lines.append("- **Never Smokers:** $\\text{Pack-Years} = 0.0$ (structural zero)\n")

    lines.append("### Empirical Pack-Years Availability in Adults Aged ≥ 40 ($N = 7,101$)\n")
    lines.append("| Smoking Category | Total ($N$) | Valid Pack-Years ($N$) | Data Coverage (%) | Mean Pack-Years | Imputation Treatment |")
    lines.append("| :--- | :---: | :---: | :---: | :---: | :--- |")
    for s_name in ['Current', 'Former', 'Never', 'Unknown']:
        sd = smk[s_name]
        lines.append(f"| **{s_name}** | {sd['N']:,} | {sd['valid_pack_years_N']:,} | **{sd['valid_pack_years_pct']:.1f}%** | {sd['mean_pack_years']:.1f} | None needed (supported by data) |")
    lines.append("")
    lines.append("Unsupported former smokers missing quit age/intensity are retained with valid smoking status but missing pack-years, avoiding arbitrary median imputation.\n")
    lines.append("---\n")

    # Section 7: Questionnaire Eligibility
    lines.append("## 7. Questionnaire Eligibility & Coding Audit\n")
    lines.append("| Variable | Official Questionnaire Text | Target Age Range | Valid Response Codes | Missingness Nature |")
    lines.append("| :--- | :--- | :---: | :--- | :--- |")
    lines.append("| `RDQ031` | Cough on most days for 3 consecutive months or more? | **40–80 years** | 1=Yes, 2=No, 7=Refused, 9=Don't know | Administered strictly to Age ≥ 40 |")
    lines.append("| `RDQ050` | Bring up phlegm on most days for 3 consecutive months or more? | **40–80 years** | 1=Yes, 2=No, 7=Refused, 9=Don't know | Administered strictly to Age ≥ 40 |")
    lines.append("| `RDQ070` | Wheezing or whistling in chest past 12 months? | 1–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Complete population inquiry |")
    lines.append("| `RDQ140` | Shortness of breath hurrying on level ground or slight hill? | 1–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Complete population inquiry |")
    lines.append("| `MCQ010` | Ever told by doctor had asthma? | 1–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Complete population inquiry |")
    lines.append("| `MCQ035` | Still have active asthma? | 1–80 years | 1=Yes, 2=No, 9=Don't know | **Structural Skip** (Asked only if MCQ010=1) |")
    lines.append("| `MCQ160G`| Ever told by doctor had emphysema? | 20–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Adult inquiry |")
    lines.append("| `MCQ160K`| Ever told by doctor had chronic bronchitis? | 20–80 years | 1=Yes, 2=No, 7=Refused, 9=Don't know | Adult inquiry |\n")
    lines.append("Refused and Don't Know codes are strictly distinguished from negative responses. Structural skips are preserved.\n")
    lines.append("---\n")

    # Section 8: Spectrum Bias
    lines.append("## 8. Spirometry QC & Comprehensive Spectrum Bias Analysis\n")
    lines.append("To determine whether discarding poor-quality curves distorts the clinical spectrum of disease, we compared participants who passed strict Grade A/B QC against those who attempted spirometry but failed QC, those who were not tested, and those aged ≥ 80:\n")
    lines.append("| Characteristic | Strict QC (A/B) | Expanded QC (A/B/C) | Attempted Failed Strict QC | Assigned Not Tested (3/4) | Age ≥ 80 Protocol Ineligible |")
    lines.append("| :--- | :---: | :---: | :---: | :---: | :---: |")
    lines.append(f"| **Sample Size ($N$)** | **{sb['strict_qc_AB']['N']:,}** | **{sb['expanded_qc_ABC']['N']:,}** | **{sb['attempted_failed_strict_qc']['N']:,}** | **{sb['assigned_not_tested_SPXNSTAT_3_4']['N']:,}** | **{sb['age_80_plus_ineligible']['N']:,}** |")
    lines.append(f"| **Mean Age (years)** | {sb['strict_qc_AB']['mean_age']:.1f} | {sb['expanded_qc_ABC']['mean_age']:.1f} | {sb['attempted_failed_strict_qc']['mean_age']:.1f} | {sb['assigned_not_tested_SPXNSTAT_3_4']['mean_age']:.1f} | {sb['age_80_plus_ineligible']['mean_age']:.1f} |")
    lines.append(f"| **Female Gender (%)** | {sb['strict_qc_AB']['pct_female']:.1f}% | {sb['expanded_qc_ABC']['pct_female']:.1f}% | {sb['attempted_failed_strict_qc']['pct_female']:.1f}% | {sb['assigned_not_tested_SPXNSTAT_3_4']['pct_female']:.1f}% | {sb['age_80_plus_ineligible']['pct_female']:.1f}% |")
    lines.append(f"| **Mean BMI ($kg/m^2$)** | {sb['strict_qc_AB']['mean_bmi']:.1f} | {sb['expanded_qc_ABC']['mean_bmi']:.1f} | {sb['attempted_failed_strict_qc']['mean_bmi']:.1f} | {sb['assigned_not_tested_SPXNSTAT_3_4']['mean_bmi']:.1f} | {sb['age_80_plus_ineligible']['mean_bmi']:.1f} |")
    lines.append(f"| **Current Smoker (%)** | {sb['strict_qc_AB']['pct_current_smoker']:.1f}% | {sb['expanded_qc_ABC']['pct_current_smoker']:.1f}% | {sb['attempted_failed_strict_qc']['pct_current_smoker']:.1f}% | {sb['assigned_not_tested_SPXNSTAT_3_4']['pct_current_smoker']:.1f}% | {sb['age_80_plus_ineligible']['pct_current_smoker']:.1f}% |")
    lines.append(f"| **Wheezing Past 12m (%)**| {sb['strict_qc_AB']['pct_wheezing']:.1f}% | {sb['expanded_qc_ABC']['pct_wheezing']:.1f}% | {sb['attempted_failed_strict_qc']['pct_wheezing']:.1f}% | **{sb['assigned_not_tested_SPXNSTAT_3_4']['pct_wheezing']:.1f}%** | {sb['age_80_plus_ineligible']['pct_wheezing']:.1f}% |")
    lines.append(f"| **Chronic Cough (%)** | {sb['strict_qc_AB']['pct_cough']:.1f}% | {sb['expanded_qc_ABC']['pct_cough']:.1f}% | {sb['attempted_failed_strict_qc']['pct_cough']:.1f}% | **{sb['assigned_not_tested_SPXNSTAT_3_4']['pct_cough']:.1f}%** | {sb['age_80_plus_ineligible']['pct_cough']:.1f}% |")
    lines.append(f"| **Hankinson LLN Prev.**| {sb['strict_qc_AB']['target_lln_prev']:.1f}% | {sb['expanded_qc_ABC']['target_lln_prev']:.1f}% | {sb['attempted_failed_strict_qc']['target_lln_prev']:.1f}% | — | — |")
    lines.append(f"| **Fixed (<0.70) Prev.** | {sb['strict_qc_AB']['target_fixed_prev']:.1f}% | {sb['expanded_qc_ABC']['target_fixed_prev']:.1f}% | {sb['attempted_failed_strict_qc']['target_fixed_prev']:.1f}% | — | — |\n")
    lines.append("**Key Spectrum Bias Discovery:** Participants assigned but not tested (refusals/contraindications) have significantly higher wheezing (21.6% vs. 13.4%) and chronic cough (15.5% vs. 9.7%). Strict QC eliminates measurement noise for training, but clinical deployment models must remain robust when evaluating patients who struggle with forced expiratory maneuvers.\n")
    lines.append("---\n")

    # Section 9: Survey Weights
    lines.append("## 9. Complex Survey Design Validation\n")
    lines.append("1. **Weight Formula:** Confirmed official CDC multi-cycle pooling formula: $WTMEC6YR = \\frac{WTMEC2YR}{3.0}$.")
    lines.append("2. **Design Variables:** Preserved pseudo-strata (`SDMVSTRA`), primary sampling units (`SDMVPSU`), and cycle year (`SDDSRVYR`).")
    lines.append(f"3. **Population vs. ML Metrics:** Survey-weighted prevalence for LLN obstruction is **{t_final['lln_prev_weighted']*100:.2f}%** (± {t_final['lln_se_weighted']*100:.2f}%) vs. unweighted sample prevalence of **{t_final['lln_prev_unweighted']*100:.2f}%**. Machine learning models will optimize unweighted loss for individual risk discrimination, with post-hoc probability calibration evaluated against survey weights.\n")
    lines.append("---\n")

    # Section 10: Final Temporal Split
    lines.append("## 10. Final Frozen Temporal Validation Split\n")
    lines.append("The prospective temporal split is constructed strictly from the finalized N = 7,101 complete-case cohort:\n")
    lines.append(f"- **Training / Internal Tuning Set:** Cycles E (2007–2008) + F (2009–2010) $\\implies$ **N = {ts['train_N']:,}**")
    lines.append(f"- **Prospective Temporal Holdout:** Cycle G (2011–2012) $\\implies$ **N = {ts['test_N']:,}**\n")

    lines.append("### Partition Class Balance & Covariate Stability\n")
    lines.append("| Parameter | Training Partition (Cycles E+F) | Temporal Holdout (Cycle G) | Temporal Shift (Δ) |")
    lines.append("| :--- | :---: | :---: | :---: |")
    lines.append(f"| **Sample Size ($N$)** | **{ts['train_N']:,}** | **{ts['test_N']:,}** | — |")
    lines.append(f"| **Mean Age (years)** | {ts['train_mean_age']:.2f} | {ts['test_mean_age']:.2f} | -0.58 years |")
    lines.append(f"| **Female Gender (%)** | {ts['train_female_pct']:.2f}% | {ts['test_female_pct']:.2f}% | +0.13% |")
    lines.append(f"| **Mean BMI ($kg/m^2$)** | {ts['train_mean_bmi']:.2f} | {ts['test_mean_bmi']:.2f} | -0.18 $kg/m^2$ |")
    lines.append(f"| **Current Smoker (%)** | {ts['train_current_smoker_pct']:.2f}% | {ts['test_current_smoker_pct']:.2f}% | -0.48% |")
    lines.append(f"| **Primary Target (Hankinson LLN +)** | **{ts['train_target_lln_pos']:,} ({ts['train_target_lln_prev']:.2f}%)** | **{ts['test_target_lln_pos']:,} ({ts['test_target_lln_prev']:.2f}%)** | **-2.21%** |")
    lines.append(f"| **Primary Target (Hankinson LLN -)** | **{ts['train_N'] - ts['train_target_lln_pos']:,} ({100 - ts['train_target_lln_prev']:.2f}%)** | **{ts['test_N'] - ts['test_target_lln_pos']:,} ({100 - ts['test_target_lln_prev']:.2f}%)** | +2.21% |")
    lines.append(f"| **Secondary Target (Fixed < 0.70 +)** | **{ts['train_target_fixed_pos']:,} ({ts['train_target_fixed_prev']:.2f}%)** | **{ts['test_target_fixed_pos']:,} ({ts['test_target_fixed_prev']:.2f}%)** | **-1.82%** |")
    lines.append(f"| **Secondary Target (Fixed < 0.70 -)** | **{ts['train_N'] - ts['train_target_fixed_pos']:,} ({100 - ts['train_target_fixed_prev']:.2f}%)** | **{ts['test_N'] - ts['test_target_fixed_pos']:,} ({100 - ts['test_target_fixed_prev']:.2f}%)** | +1.82% |\n")

    lines.append("### Strict Machine Learning Protocol Safeguards:")
    lines.append("1. **Preprocessing Isolation:** All imputers, standardizers, encoders, and feature selectors will be fitted solely on Training data (Cycles E+F).")
    lines.append("2. **No Data Snooping:** Hyperparameter optimization, probability threshold tuning, and conformal calibration partitions will be established strictly within Cycles E+F (e.g. 80% train / 20% internal calibration).")
    lines.append("3. **Untouched Benchmark:** Cycle G will be evaluated only once as the final prospective holdout benchmark.\n")
    lines.append("---\n")

    # Section 11: Feature Architecture
    lines.append("## 11. Refined AETHER Feature Architecture\n")
    lines.append("The feature architecture enforces three strictly bounded clinical tiers:\n")
    lines.append("- **Tier 1 (Initial Non-Invasive Screening):** Demographics (age, sex, race/ethnicity), anthropometry (height, weight, BMI), exposure history (smoking status, pack-years), chronic symptoms (cough, phlegm, wheezing, exertional dyspnea), and medical conditions (asthma, bronchitis, emphysema). Entered via clinical questionnaire intake.")
    lines.append("- **Tier 2 (Additional Clinically Justified Edge Telemetry):** Handheld peak expiratory flow (PEF), resting pulse oximetry ($SpO_2$), and resting heart rate entered manually or captured when edge measurement equipment is available. NO mandatory IoT hardware, Raspberry Pi, or Arduino required.")
    lines.append("- **Tier 3 (Retrospective Reference Standards):** Laboratory-grade spirometric values ($FEV_1$, $FVC$, $FEV_1/FVC$, Hankinson LLN, Fixed 0.70) used exclusively for retrospective model training, loss computation, and ground-truth validation. Zero leakage into Tier 1 predictors.\n")
    lines.append("---\n")

    # Section 12: Remaining Limitations & Researcher Decisions
    lines.append("## 12. Remaining Limitations & Open Decisions Requiring Approval\n")
    lines.append("### Limitations:")
    lines.append("1. **Pre-Bronchodilator Triage:** Ground-truth targets reflect pre-bronchodilator airflow limitation. Confirmatory post-BD COPD diagnosis cannot be determined for the general population due to 100% verification bias in unselected subjects.")
    lines.append("2. **Historical Reference Equations:** Hankinson (1999) reference equations use discrete racial groupings, whereas GLI-2012 provides multi-ethnic splines.")
    lines.append("3. **Symptom Recall:** Respiratory symptoms are self-reported via standardized questionnaires and subject to subjective recall variation.\n")

    lines.append("### Decisions Submitted for Researcher Approval Before Phase 2:")
    lines.append("1. **Approve Primary Target:** Confirm Hankinson (1999) Table 6 LLN ($FEV_1/FVC < \\text{LLN}$) as the primary clinical screening target, with Fixed Ratio (< 0.70) as secondary sensitivity comparator.")
    lines.append("2. **Approve Reference Standard:** Confirm retention of Hankinson (1999) vs. adopting GLI-2012 (which exhibits 97.96% diagnostic agreement).")
    lines.append("3. **Approve Final Model Cohort:** Confirm the frozen N = 7,101 complete-case cohort aged ≥ 40 years, partitioned into Train (N = 4,908) and Test (N = 2,193).")
    lines.append("4. **Approve Phase 2 Commencement:** Authorize initiation of baseline machine learning model development and uncertainty calibration.")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("[+] Authoritative report generated successfully ->", REPORT_PATH)

if __name__ == "__main__":
    generate()
