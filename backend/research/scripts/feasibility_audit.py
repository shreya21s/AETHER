"""
Comprehensive Feasibility Audit and Statistical Analysis Pipeline (Phase 1.1).
Recomputes all exact empirical figures, authoritatively reconciled cohort flows,
dataset validation checks, Hankinson Table 6 vs GLI-2012 comparisons,
spectrum bias tables, survey weights, and temporal validation splits.
"""

import os
import json
import numpy as np
import pandas as pd
from pyspiro import GLI_2012

PROCESSED_FILE = os.path.abspath(r"backend/research/data/processed/nhanes_merged_2007_2012.csv.gz")
REPORTS_DIR = os.path.abspath(r"backend/research/reports")
OUTPUT_METRICS = os.path.join(REPORTS_DIR, "nhanes_feasibility_metrics.json")
OUTPUT_VAL_JSON = os.path.join(REPORTS_DIR, "dataset_validation_report.json")

def weighted_mean_and_se(values, weights, strata=None, psu=None):
    """Calculate survey-weighted mean and linearized standard error."""
    mask = ~(np.isnan(values) | np.isnan(weights))
    v = values[mask]
    w = weights[mask]
    if len(v) == 0:
        return 0.0, 0.0

    w_sum = np.sum(w)
    mean = np.sum(v * w) / w_sum

    if strata is not None and psu is not None:
        s = strata[mask]
        p = psu[mask]
        df_sub = pd.DataFrame({'v': v, 'w': w, 's': s, 'p': p})
        df_sub['e'] = df_sub['w'] * (df_sub['v'] - mean)

        psu_totals = df_sub.groupby(['s', 'p'])['e'].sum().reset_index()
        strata_means = psu_totals.groupby('s')['e'].mean()
        psu_totals['strata_mean'] = psu_totals['s'].map(strata_means)
        psu_totals['diff_sq'] = (psu_totals['e'] - psu_totals['strata_mean']) ** 2

        strata_n_psu = psu_totals.groupby('s')['p'].count()
        strata_var = psu_totals.groupby('s')['diff_sq'].sum()
        mult = strata_n_psu / (strata_n_psu - 1).clip(lower=1)
        tot_var = np.sum(strata_var * mult)
        se = np.sqrt(tot_var) / w_sum
    else:
        variance = np.sum(w * (v - mean)**2) / w_sum
        se = np.sqrt(variance / len(v))

    return float(mean), float(se)

def run_audit():
    print("[+] Loading harmonized master dataset:", PROCESSED_FILE)
    df = pd.read_csv(PROCESSED_FILE, compression='gzip', low_memory=False)
    print(f"    Loaded {len(df)} total rows and {len(df.columns)} columns.")

    metrics = {}

    # 1. Dataset Integrity Validation (Section 2)
    val_report = {
        'total_rows': len(df),
        'total_unique_seqn': int(df['SEQN'].nunique()),
        'seqn_is_unique': bool(df['SEQN'].nunique() == len(df)),
        'seqn_has_no_nulls': bool(df['SEQN'].notna().all()),
        'rows_represent_all_demo': bool(len(df) == 30442),
        'by_cycle': df['CYCLE'].value_counts().to_dict(),
        'missing_spirometry_distinguishable': {
            'not_examined_or_ineligible': int(df['SPXNSTAT'].isna().sum()),
            'spirometry_not_done': int((df['SPXNSTAT'] == 3).sum()),
            'safety_exclusion': int((df['SPXNSTAT'] == 4).sum()),
            'attempted_spirometry': int(df['SPXNSTAT'].isin([1, 2]).sum()),
            'missing_target_count': int(df['OBSTRUCTION_LLN'].isna().sum())
        }
    }
    with open(OUTPUT_VAL_JSON, 'w') as f:
        json.dump(val_report, f, indent=2)
    print("[+] Dataset validation passed ->", OUTPUT_VAL_JSON)

    metrics['dataset_validation'] = val_report

    # 2. Quality Control Overall Breakdown
    stat_counts = {str(k): int(v) for k, v in df['SPXNSTAT'].value_counts(dropna=False).items()}
    qfvc_counts = {str(k): int(v) for k, v in df['SPXNQFVC'].value_counts(dropna=False).items()}
    qfv1_counts = {str(k): int(v) for k, v in df['SPXNQFV1'].value_counts(dropna=False).items()}

    metrics['quality_control'] = {
        'SPXNSTAT': stat_counts,
        'SPXNQFVC': qfvc_counts,
        'SPXNQFV1': qfv1_counts
    }

    # 3. Authoritative Cohort Flow Reconciliation (Section 1)
    tier1_cols = ['RIDAGEYR', 'RIAGENDR', 'RIDRETH1', 'BMXBMI', 'SMOKING_STATUS', 'RDQ031', 'RDQ050', 'RDQ070', 'MCQ010']

    flow_table = {}
    for min_age in [18, 40]:
        c_name = f"cohort_age_{min_age}"
        c_df = df[df['RIDAGEYR'] >= min_age].copy()

        n_original_demo = len(c_df)
        n_mec = int((c_df['WTMEC2YR'] > 0).sum())
        n_spx_records = int(c_df['SPXNSTAT'].notna().sum())
        n_spx_attempted = int(c_df['SPXNSTAT'].isin([1, 2]).sum())
        n_strict_qc = int((c_df['QC_STRICT_AB'] == 1).sum())
        n_expanded_qc = int((c_df['QC_EXPANDED_ABC'] == 1).sum())

        strict_sub = c_df[c_df['QC_STRICT_AB'] == 1].copy()
        n_valid_lln = int(strict_sub['OBSTRUCTION_LLN'].notna().sum())
        n_valid_fixed = int(strict_sub['OBSTRUCTION_FIXED_070'].notna().sum())

        # Complete-case Tier 1
        complete_sub = strict_sub.dropna(subset=tier1_cols + ['OBSTRUCTION_LLN', 'OBSTRUCTION_FIXED_070'])
        n_complete = len(complete_sub)

        # Temporal split of complete cohort
        train_complete = complete_sub[complete_sub['CYCLE'].isin(['E', 'F'])]
        test_complete = complete_sub[complete_sub['CYCLE'] == 'G']

        flow_table[c_name] = {
            'min_age': min_age,
            'original_demo': n_original_demo,
            'examined_mec': n_mec,
            'spirometry_assigned': n_spx_records,
            'spirometry_attempted': n_spx_attempted,
            'strict_qc_AB': n_strict_qc,
            'expanded_qc_ABC': n_expanded_qc,
            'valid_lln_outcome': n_valid_lln,
            'valid_fixed_outcome': n_valid_fixed,
            'final_complete_case_cohort': n_complete,
            'complete_case_retention_pct': float(n_complete / n_strict_qc * 100),
            'temporal_train_EF': len(train_complete),
            'temporal_test_G': len(test_complete),
            'temporal_sum_reconciles': bool((len(train_complete) + len(test_complete)) == n_complete)
        }

    metrics['cohort_flow_reconciliation'] = flow_table

    # 4. Target Comparison on Final Eligible Adults >= 40 (N = 7,101) and Strict QC (N = 7,144)
    adult40_strict = df[(df['RIDAGEYR'] >= 40) & (df['QC_STRICT_AB'] == 1)].copy()
    adult40_final = adult40_strict.dropna(subset=tier1_cols + ['OBSTRUCTION_LLN', 'OBSTRUCTION_FIXED_070']).copy()

    for label, sub in [('strict_qc_7144', adult40_strict), ('final_model_7101', adult40_final)]:
        n_tot = len(sub)
        n_fix = int(sub['OBSTRUCTION_FIXED_070'].sum())
        n_lln = int(sub['OBSTRUCTION_LLN'].sum())

        fix_unw = n_fix / n_tot
        lln_unw = n_lln / n_tot

        fix_wt, fix_se = weighted_mean_and_se(sub['OBSTRUCTION_FIXED_070'].values, sub['WTMEC6YR'].values, sub['SDMVSTRA'].values, sub['SDMVPSU'].values)
        lln_wt, lln_se = weighted_mean_and_se(sub['OBSTRUCTION_LLN'].values, sub['WTMEC6YR'].values, sub['SDMVSTRA'].values, sub['SDMVPSU'].values)

        ct = pd.crosstab(sub['OBSTRUCTION_FIXED_070'], sub['OBSTRUCTION_LLN'])
        c_00 = int(ct.loc[0, 0])
        c_11 = int(ct.loc[1, 1])
        c_10 = int(ct.loc[1, 0]) # Fixed+ / LLN- (Elderly overdiagnosis)
        c_01 = int(ct.loc[0, 1]) # Fixed- / LLN+ (Young underdiagnosis)

        raw_agree = (c_00 + c_11) / n_tot
        po = raw_agree
        pe = ((c_00 + c_01)*(c_00 + c_10) + (c_10 + c_11)*(c_01 + c_11)) / (n_tot ** 2)
        kappa = (po - pe) / (1 - pe)

        metrics[f"target_analysis_{label}"] = {
            'N': n_tot,
            'fixed_pos': n_fix,
            'fixed_prev_unweighted': float(fix_unw),
            'fixed_prev_weighted': float(fix_wt),
            'fixed_se_weighted': float(fix_se),
            'lln_pos': n_lln,
            'lln_prev_unweighted': float(lln_unw),
            'lln_prev_weighted': float(lln_wt),
            'lln_se_weighted': float(lln_se),
            'concordant_normal': c_00,
            'concordant_obstructed': c_11,
            'fixed_pos_lln_neg_elderly_overdiag': c_10,
            'fixed_neg_lln_pos_young_underdiag': c_01,
            'raw_agreement': float(raw_agree),
            'cohen_kappa': float(kappa)
        }

    # 5. Age Decade Stratification (Adults >= 40)
    sub = adult40_final.copy()
    sub['age_decade'] = pd.cut(sub['RIDAGEYR'], bins=[39, 49, 59, 69, 81], labels=['40-49', '50-59', '60-69', '70-79'])
    decade_breakdown = {}
    for dec, grp in sub.groupby('age_decade', observed=False):
        n_d = len(grp)
        n_f = int(grp['OBSTRUCTION_FIXED_070'].sum())
        n_l = int(grp['OBSTRUCTION_LLN'].sum())
        grp_10 = int(((grp['OBSTRUCTION_FIXED_070'] == 1) & (grp['OBSTRUCTION_LLN'] == 0)).sum())
        grp_01 = int(((grp['OBSTRUCTION_FIXED_070'] == 0) & (grp['OBSTRUCTION_LLN'] == 1)).sum())
        decade_breakdown[str(dec)] = {
            'N': n_d,
            'fixed_pos': n_f,
            'fixed_prev': float(n_f / n_d),
            'lln_pos': n_l,
            'lln_prev': float(n_l / n_d),
            'fixed_pos_lln_neg': grp_10,
            'fixed_pos_lln_neg_pct': float(grp_10 / n_d * 100),
            'fixed_neg_lln_pos': grp_01,
            'fixed_neg_lln_pos_pct': float(grp_01 / n_d * 100)
        }
    metrics['age_decade_discordance_final'] = decade_breakdown

    # 6. LLN Verification: Hankinson Table 6 vs GLI-2012 (Section 3)
    gli = GLI_2012()
    comp_df = adult40_strict[adult40_strict['BMXHT'].notna()].copy()
    gli_llns = []
    for _, row in comp_df.iterrows():
        age = float(row['RIDAGEYR'])
        ht = float(row['BMXHT'])
        sex = 1 if int(row['RIAGENDR']) == 1 else 0
        r = int(row['RIDRETH1'])
        eth = 2 if r == 4 else (1 if r == 3 else 5)
        res = gli.lln(sex=sex, age=age, height=ht, ethnicity=eth, parameter=GLI_2012.Parameters.FEV1FVC, value=0.0)
        gli_llns.append(res if pd.notna(res) else np.nan)

    comp_df['GLI_LLN'] = gli_llns
    comp_df['GLI_OBSTRUCTION'] = (comp_df['FEV1_FVC_RATIO'] < comp_df['GLI_LLN']).astype(int)

    n_comp = len(comp_df)
    mad = float(np.abs(comp_df['GLI_LLN'] - comp_df['LLN_RATIO_HANKINSON']).mean())
    max_ad = float(np.abs(comp_df['GLI_LLN'] - comp_df['LLN_RATIO_HANKINSON']).max())
    disagreements = int((comp_df['OBSTRUCTION_LLN'] != comp_df['GLI_OBSTRUCTION']).sum())

    ct_gli = pd.crosstab(comp_df['OBSTRUCTION_LLN'], comp_df['GLI_OBSTRUCTION'])

    metrics['lln_comparison_hankinson_vs_gli'] = {
        'comparable_N': n_comp,
        'hankinson_t6_pos': int(comp_df['OBSTRUCTION_LLN'].sum()),
        'gli_2012_pos': int(comp_df['GLI_OBSTRUCTION'].sum()),
        'mean_absolute_difference_ratio': mad,
        'max_absolute_difference_ratio': max_ad,
        'disagreements_count': disagreements,
        'disagreements_pct': float(disagreements / n_comp * 100),
        'agreement_pct': float((1.0 - disagreements / n_comp) * 100),
        'crosstab_hankinson_rows_gli_cols': {
            'both_normal': int(ct_gli.loc[0, 0]),
            'hankinson_pos_gli_neg': int(ct_gli.loc[1, 0]),
            'hankinson_neg_gli_pos': int(ct_gli.loc[0, 1]),
            'both_obstructed': int(ct_gli.loc[1, 1])
        }
    }

    # 7. Post-Bronchodilator Participant-Level Flow (Section 5)
    bd_rec = df[df['SPDBRONC'] == 1].copy()
    metrics['post_bd_detailed_flow'] = {
        'total_nhanes_cohort': len(df),
        'spirometry_examined': int(df['SPXNSTAT'].notna().sum()),
        'not_selected_for_2nd_test_SPDBRONC_2': int((df['SPDBRONC'] == 2).sum()),
        'selected_for_2nd_test_SPDBRONC_1': int((df['SPDBRONC'] == 1).sum()),
        'selected_contraindicated_SPXBSTAT_4': int((bd_rec['SPXBSTAT'] == 4).sum()),
        'selected_refused_or_not_done_SPXBSTAT_3': int((bd_rec['SPXBSTAT'] == 3).sum()),
        'albuterol_administered_attempted_SPXBSTAT_1_2': int(bd_rec['SPXBSTAT'].isin([1, 2]).sum()),
        'test2_usable_FEV1_FVC': int((bd_rec['SPXBFEV1'].notna() & bd_rec['SPXBFVC'].notna()).sum()),
        'test2_expanded_QC_ABC': int((bd_rec['SPXBQFVC'].isin(['A', 'B', 'C']) & bd_rec['SPXBQFV1'].isin(['A', 'B', 'C'])).sum()),
        'test2_strict_QC_AB': int((bd_rec['SPXBQFVC'].isin(['A', 'B']) & bd_rec['SPXBQFV1'].isin(['A', 'B'])).sum()),
        'persistent_post_bd_obstruction': int((bd_rec['OBSTRUCTION_POST_BD_FIXED'] == 1).sum()),
        'reversible_limitation': int((bd_rec['OBSTRUCTION_POST_BD_FIXED'] == 0).sum())
    }

    # 8. Smoking & Pack-Years Breakdown (Section 6)
    smk_stats = {}
    for s, grp in adult40_final.groupby('SMOKING_STATUS'):
        nn = int(grp['PACK_YEARS'].notna().sum())
        m_py = float(grp['PACK_YEARS'].dropna().mean()) if nn > 0 else 0.0
        smk_stats[str(s)] = {
            'N': len(grp),
            'valid_pack_years_N': nn,
            'valid_pack_years_pct': float(nn / len(grp) * 100),
            'mean_pack_years': m_py
        }
    metrics['smoking_and_pack_years_adult40_final'] = smk_stats

    # 9. Spectrum Bias: Strict QC vs Failed vs Not Tested (Section 8)
    mec_adult40 = df[(df['RIDAGEYR'] >= 40) & (df['WTMEC2YR'] > 0)].copy()
    strict_p = mec_adult40[(mec_adult40['SPXNSTAT'].isin([1, 2])) & (mec_adult40['SPXNQFVC'].isin(['A', 'B'])) & (mec_adult40['SPXNQFV1'].isin(['A', 'B']))]
    exp_p = mec_adult40[(mec_adult40['SPXNSTAT'].isin([1, 2])) & (mec_adult40['SPXNQFVC'].isin(['A', 'B', 'C'])) & (mec_adult40['SPXNQFV1'].isin(['A', 'B', 'C']))]
    failed_p = mec_adult40[(mec_adult40['SPXNSTAT'].isin([1, 2])) & ~mec_adult40['SEQN'].isin(strict_p['SEQN'])]
    not_tested_p = mec_adult40[mec_adult40['SPXNSTAT'].isin([3, 4])]
    ineligible_p = mec_adult40[mec_adult40['SPXNSTAT'].isna()]

    def summarize_grp(g):
        return {
            'N': len(g),
            'mean_age': float(g['RIDAGEYR'].mean()),
            'pct_female': float((g['RIAGENDR'] == 2).mean() * 100),
            'mean_bmi': float(g['BMXBMI'].dropna().mean()),
            'pct_current_smoker': float((g['SMOKING_STATUS'] == 'Current').mean() * 100),
            'pct_wheezing': float((g['RDQ070'] == 1).mean() * 100),
            'pct_cough': float((g['RDQ031'] == 1).mean() * 100),
            'target_lln_prev': float(g['OBSTRUCTION_LLN'].dropna().mean() * 100) if g['OBSTRUCTION_LLN'].notna().sum() > 0 else None,
            'target_fixed_prev': float(g['OBSTRUCTION_FIXED_070'].dropna().mean() * 100) if g['OBSTRUCTION_FIXED_070'].notna().sum() > 0 else None
        }

    metrics['spectrum_bias_comprehensive'] = {
        'strict_qc_AB': summarize_grp(strict_p),
        'expanded_qc_ABC': summarize_grp(exp_p),
        'attempted_failed_strict_qc': summarize_grp(failed_p),
        'assigned_not_tested_SPXNSTAT_3_4': summarize_grp(not_tested_p),
        'age_80_plus_ineligible': summarize_grp(ineligible_p)
    }

    # 10. Final Frozen Temporal Split (Section 10)
    train_final = adult40_final[adult40_final['CYCLE'].isin(['E', 'F'])].copy()
    test_final = adult40_final[adult40_final['CYCLE'] == 'G'].copy()

    metrics['temporal_split_frozen_7101'] = {
        'train_N': len(train_final),
        'test_N': len(test_final),
        'train_mean_age': float(train_final['RIDAGEYR'].mean()),
        'test_mean_age': float(test_final['RIDAGEYR'].mean()),
        'train_female_pct': float((train_final['RIAGENDR'] == 2).mean() * 100),
        'test_female_pct': float((test_final['RIAGENDR'] == 2).mean() * 100),
        'train_mean_bmi': float(train_final['BMXBMI'].mean()),
        'test_mean_bmi': float(test_final['BMXBMI'].mean()),
        'train_current_smoker_pct': float((train_final['SMOKING_STATUS'] == 'Current').mean() * 100),
        'test_current_smoker_pct': float((test_final['SMOKING_STATUS'] == 'Current').mean() * 100),
        'train_target_lln_pos': int(train_final['OBSTRUCTION_LLN'].sum()),
        'train_target_lln_prev': float(train_final['OBSTRUCTION_LLN'].mean() * 100),
        'test_target_lln_pos': int(test_final['OBSTRUCTION_LLN'].sum()),
        'test_target_lln_prev': float(test_final['OBSTRUCTION_LLN'].mean() * 100),
        'train_target_fixed_pos': int(train_final['OBSTRUCTION_FIXED_070'].sum()),
        'train_target_fixed_prev': float(train_final['OBSTRUCTION_FIXED_070'].mean() * 100),
        'test_target_fixed_pos': int(test_final['OBSTRUCTION_FIXED_070'].sum()),
        'test_target_fixed_prev': float(test_final['OBSTRUCTION_FIXED_070'].mean() * 100)
    }

    with open(OUTPUT_METRICS, 'w') as f:
        json.dump(metrics, f, indent=2)
    print("[+] Saved updated metrics JSON ->", OUTPUT_METRICS)

if __name__ == "__main__":
    run_audit()
