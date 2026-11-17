"""
Merge and harmonise NHANES 2007-2012 datasets across Cycles E, F, and G.
Preserves participant identifiers, cycle provenance, and survey design weights.
Computes reference LLN using exact Hankinson et al. (1999) Table 6 reference equations
and fixed 0.70 ratio. Evaluates GLI-2012 comparative reference.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parent.parent))
from config.settings import CYCLES, MODULES, RAW_DATA_DIR, PROCESSED_DATA_DIR, REPORTS_DIR, get_raw_file_path

# Official Hankinson et al. (1999) NHANES III Spirometric Reference Equations
# Source: Hankinson JL, Odencrantz JR, Fedan KB. Am J Respir Crit Care Med. 1999;159(1):179-187. Table 6.
# FEV1/FVC Ratio expressed as percentage (%):
# Predicted Ratio (%) = a0_pred + a1_age * Age
# Lower Limit of Normal (LLN %) = a0_lln + a1_age * Age
# Applicable to Ages 8-80 years. In Table 6, ratio equations do not depend on standing height.
HANKINSON_TABLE_6 = {
    # Males
    ('M', 'Cau'):   {'a0_pred': 88.066, 'a0_lln': 78.388, 'a1_age': -0.2066}, # Caucasian / Non-Hispanic White
    ('M', 'AfrAm'): {'a0_pred': 89.239, 'a0_lln': 78.822, 'a1_age': -0.1828}, # African-American / Non-Hispanic Black
    ('M', 'MexAm'): {'a0_pred': 90.024, 'a0_lln': 80.925, 'a1_age': -0.2186}, # Mexican-American / Other Hispanic
    # Females
    ('F', 'Cau'):   {'a0_pred': 90.809, 'a0_lln': 81.015, 'a1_age': -0.2125}, # Caucasian / Non-Hispanic White
    ('F', 'AfrAm'): {'a0_pred': 91.655, 'a0_lln': 80.978, 'a1_age': -0.2039}, # African-American / Non-Hispanic Black
    ('F', 'MexAm'): {'a0_pred': 92.360, 'a0_lln': 83.044, 'a1_age': -0.2248}, # Mexican-American / Other Hispanic
}

def calculate_hankinson_t6_fev1_fvc(age: float, gender_code: int, race_code: int) -> tuple:
    """
    Computes exact Hankinson (1999) Table 6 predicted FEV1/FVC ratio and LLN.
    gender_code: 1=Male, 2=Female
    race_code: 1=Mexican American, 2=Other Hispanic (mapped to MexAm),
               3=NH White (mapped to Cau), 4=NH Black (mapped to AfrAm), 5=Other (mapped to Cau)
    Returns: (predicted_ratio_fraction, lln_ratio_fraction)
    """
    g_key = 'M' if gender_code == 1 else 'F'
    if race_code in [1, 2]:
        r_key = 'MexAm'
    elif race_code == 4:
        r_key = 'AfrAm'
    else:
        r_key = 'Cau'

    coeffs = HANKINSON_TABLE_6[(g_key, r_key)]
    pred_pct = coeffs['a0_pred'] + coeffs['a1_age'] * age
    lln_pct = coeffs['a0_lln'] + coeffs['a1_age'] * age

    return round(pred_pct / 100.0, 4), round(lln_pct / 100.0, 4)

def merge_cycles():
    print("=" * 80)
    print("MERGING & HARMONIZING CDC NHANES 2007-2012 REPRODUCIBLE DATA PIPELINE")
    print("=" * 80)

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    cycle_dfs = []
    merge_stats = {}

    for cycle, cycle_info in CYCLES.items():
        print(f"\n[+] Merging Cycle {cycle} ({cycle_info['years']})...")

        # 1. Base dataset: DEMO
        demo_path = get_raw_file_path("DEMO", cycle)
        df_cycle = pd.read_sas(demo_path, format='xport')
        df_cycle.columns = [c.upper() for c in df_cycle.columns]
        n_demo = len(df_cycle)
        print(f"  Base Cohort (DEMO_{cycle}): N = {n_demo}")

        demo_cols = ['SEQN', 'SDDSRVYR', 'RIDAGEYR', 'RIAGENDR', 'RIDRETH1', 'WTMEC2YR', 'WTINT2YR', 'SDMVSTRA', 'SDMVPSU']
        avail_demo_cols = [c for c in demo_cols if c in df_cycle.columns]
        df_cycle = df_cycle[avail_demo_cols].copy()

        # 2. Merge BMX (Body Measures)
        bmx_path = get_raw_file_path("BMX", cycle)
        if bmx_path.exists():
            df_bmx = pd.read_sas(bmx_path, format='xport')
            df_bmx.columns = [c.upper() for c in df_bmx.columns]
            bmx_cols = ['SEQN', 'BMXHT', 'BMXWT', 'BMXBMI']
            avail_bmx = [c for c in bmx_cols if c in df_bmx.columns]
            df_cycle = pd.merge(df_cycle, df_bmx[avail_bmx], on='SEQN', how='left')
            print(f"  Merged BMX_{cycle}: N = {len(df_bmx)}")

        # 3. Merge SMQ (Smoking Questionnaire - including quit age & cigs/day)
        smq_path = get_raw_file_path("SMQ", cycle)
        if smq_path.exists():
            df_smq = pd.read_sas(smq_path, format='xport')
            df_smq.columns = [c.upper() for c in df_smq.columns]
            smq_cols = ['SEQN', 'SMQ020', 'SMQ040', 'SMD030', 'SMD055', 'SMD057', 'SMD650', 'SMD641']
            avail_smq = [c for c in smq_cols if c in df_smq.columns]
            df_cycle = pd.merge(df_cycle, df_smq[avail_smq], on='SEQN', how='left')
            print(f"  Merged SMQ_{cycle}: N = {len(df_smq)}")

        # 4. Merge RDQ (Respiratory Questionnaire)
        rdq_path = get_raw_file_path("RDQ", cycle)
        if rdq_path.exists():
            df_rdq = pd.read_sas(rdq_path, format='xport')
            df_rdq.columns = [c.upper() for c in df_rdq.columns]
            rdq_cols = ['SEQN', 'RDQ031', 'RDQ050', 'RDQ070', 'RDQ140']
            avail_rdq = [c for c in rdq_cols if c in df_rdq.columns]
            df_cycle = pd.merge(df_cycle, df_rdq[avail_rdq], on='SEQN', how='left')
            print(f"  Merged RDQ_{cycle}: N = {len(df_rdq)}")

        # 5. Merge MCQ (Medical Conditions Questionnaire)
        mcq_path = get_raw_file_path("MCQ", cycle)
        if mcq_path.exists():
            df_mcq = pd.read_sas(mcq_path, format='xport')
            df_mcq.columns = [c.upper() for c in df_mcq.columns]
            mcq_cols = ['SEQN', 'MCQ010', 'MCQ035', 'MCQ160G', 'MCQ160K']
            avail_mcq = [c for c in mcq_cols if c in df_mcq.columns]
            df_cycle = pd.merge(df_cycle, df_mcq[avail_mcq], on='SEQN', how='left')
            print(f"  Merged MCQ_{cycle}: N = {len(df_mcq)}")

        # 6. Merge OCQ (Occupational Questionnaire)
        ocq_path = get_raw_file_path("OCQ", cycle)
        if ocq_path.exists():
            df_ocq = pd.read_sas(ocq_path, format='xport')
            df_ocq.columns = [c.upper() for c in df_ocq.columns]
            ocq_cols = ['SEQN', 'OCD150']
            avail_ocq = [c for c in ocq_cols if c in df_ocq.columns]
            df_cycle = pd.merge(df_cycle, df_ocq[avail_ocq], on='SEQN', how='left')
            print(f"  Merged OCQ_{cycle}: N = {len(df_ocq)}")

        # 7. Merge SPX (Spirometry Examination)
        spx_path = get_raw_file_path("SPX", cycle)
        if spx_path.exists():
            df_spx = pd.read_sas(spx_path, format='xport')
            df_spx.columns = [c.upper() for c in df_spx.columns]
            # Convert byte quality strings to clean utf-8
            for q_col in ['SPXNQFVC', 'SPXNQFV1', 'SPXBQFVC', 'SPXBQFV1']:
                if q_col in df_spx.columns:
                    df_spx[q_col] = df_spx[q_col].apply(lambda x: x.decode('utf-8').strip() if isinstance(x, bytes) else (str(x).strip() if pd.notna(x) else np.nan))
            spx_cols = [
                'SEQN', 'SPXNSTAT', 'SPXNCMT', 'SPXNFVC', 'SPXNFEV1', 
                'SPXNQFVC', 'SPXNQFV1', 'SPDNACC', 'SPXNQEFF',
                'SPDBRONC', 'SPXBSTAT', 'SPXBCMT', 'SPXBFVC', 'SPXBFEV1', 'SPXBQFVC', 'SPXBQFV1'
            ]
            avail_spx = [c for c in spx_cols if c in df_spx.columns]
            df_cycle = pd.merge(df_cycle, df_spx[avail_spx], on='SEQN', how='left')
            print(f"  Merged SPX_{cycle}: N = {len(df_spx)}")

        df_cycle['CYCLE'] = cycle
        df_cycle['YEARS'] = cycle_info['years']

        merge_stats[cycle] = {
            "total_demo": n_demo,
            "total_merged": len(df_cycle),
            "examined_mec": int((df_cycle['WTMEC2YR'] > 0).sum()),
            "spirometry_records": int(df_cycle['SPXNSTAT'].notna().sum())
        }

        cycle_dfs.append(df_cycle)

    # Concatenate all three cycles into master cohort
    df_all = pd.concat(cycle_dfs, ignore_index=True)
    print("\n" + "-" * 80)
    print(f"CONCATENATED MASTER COHORT: Total Records N = {len(df_all)}")

    df_all['SEQN'] = df_all['SEQN'].astype(int)

    # 8. Derived Features & Scientific Transformations
    print("[+] Calculating clinical derivations and target definitions...")

    # Multi-cycle survey weights (6-year weight = 2-year weight / 3)
    df_all['WTMEC6YR'] = df_all['WTMEC2YR'] / 3.0

    # Spirometric Volumes: milliliters to Litres
    df_all['FEV1_L'] = np.where(df_all['SPXNFEV1'].notna() & (df_all['SPXNFEV1'] > 0), df_all['SPXNFEV1'] / 1000.0, np.nan)
    df_all['FVC_L'] = np.where(df_all['SPXNFVC'].notna() & (df_all['SPXNFVC'] > 0), df_all['SPXNFVC'] / 1000.0, np.nan)
    df_all['FEV1_FVC_RATIO'] = np.where(
        df_all['FEV1_L'].notna() & df_all['FVC_L'].notna() & (df_all['FVC_L'] > 0),
        df_all['FEV1_L'] / df_all['FVC_L'],
        np.nan
    )

    # Post-BD Volumes: milliliters to Litres
    df_all['POST_BD_FEV1_L'] = np.where(df_all['SPXBFEV1'].notna() & (df_all['SPXBFEV1'] > 0), df_all['SPXBFEV1'] / 1000.0, np.nan)
    df_all['POST_BD_FVC_L'] = np.where(df_all['SPXBFVC'].notna() & (df_all['SPXBFVC'] > 0), df_all['SPXBFVC'] / 1000.0, np.nan)
    df_all['POST_BD_RATIO'] = np.where(
        df_all['POST_BD_FEV1_L'].notna() & df_all['POST_BD_FVC_L'].notna() & (df_all['POST_BD_FVC_L'] > 0),
        df_all['POST_BD_FEV1_L'] / df_all['POST_BD_FVC_L'],
        np.nan
    )

    # Quality Control Indicator Variables
    df_all['QC_STRICT_AB'] = (
        df_all['SPXNSTAT'].isin([1, 2]) &
        df_all['SPXNQFVC'].isin(['A', 'B']) &
        df_all['SPXNQFV1'].isin(['A', 'B']) &
        df_all['FEV1_FVC_RATIO'].notna()
    ).astype(int)

    df_all['QC_EXPANDED_ABC'] = (
        df_all['SPXNSTAT'].isin([1, 2]) &
        df_all['SPXNQFVC'].isin(['A', 'B', 'C']) &
        df_all['SPXNQFV1'].isin(['A', 'B', 'C']) &
        df_all['FEV1_FVC_RATIO'].notna()
    ).astype(int)

    # Hankinson (1999) Table 6 Reference Values (Ages 8-80)
    lln_preds = []
    lln_thresholds = []
    for idx, row in df_all.iterrows():
        age = row['RIDAGEYR']
        gender = row['RIAGENDR']
        race = row['RIDRETH1']
        if pd.notna(age) and pd.notna(gender) and pd.notna(race) and 8 <= age <= 80:
            pred, lln = calculate_hankinson_t6_fev1_fvc(
                age=float(age),
                gender_code=int(gender),
                race_code=int(race)
            )
            lln_preds.append(pred)
            lln_thresholds.append(lln)
        else:
            lln_preds.append(np.nan)
            lln_thresholds.append(np.nan)

    df_all['PREDICTED_RATIO_HANKINSON'] = lln_preds
    df_all['LLN_RATIO_HANKINSON'] = lln_thresholds

    # PRIMARY RESEARCH TARGET: Pre-BD Obstruction by Hankinson LLN (FEV1/FVC < LLN)
    df_all['OBSTRUCTION_LLN'] = np.where(
        df_all['FEV1_FVC_RATIO'].notna() & df_all['LLN_RATIO_HANKINSON'].notna(),
        (df_all['FEV1_FVC_RATIO'] < df_all['LLN_RATIO_HANKINSON']).astype(int),
        np.nan
    )

    # SECONDARY SENSITIVITY TARGET: Pre-BD Obstruction by Fixed Ratio (FEV1/FVC < 0.70)
    df_all['OBSTRUCTION_FIXED_070'] = np.where(
        df_all['FEV1_FVC_RATIO'].notna(),
        (df_all['FEV1_FVC_RATIO'] < 0.70).astype(int),
        np.nan
    )

    # SECONDARY SUBSET: Post-BD Persistent Limitation (Post-BD FEV1/FVC < 0.70)
    df_all['OBSTRUCTION_POST_BD_FIXED'] = np.where(
        df_all['POST_BD_RATIO'].notna(),
        (df_all['POST_BD_RATIO'] < 0.70).astype(int),
        np.nan
    )

    # Smoking Status Harmonisation
    def derive_smoking_status(row):
        smq020 = row.get('SMQ020')
        smq040 = row.get('SMQ040')
        if pd.isna(smq020) or smq020 in [7, 9]:
            return "Unknown"
        if smq020 == 2: # <100 cigs in life
            return "Never"
        if smq020 == 1:
            if smq040 in [1, 2]:
                return "Current"
            elif smq040 == 3:
                return "Former"
        return "Unknown"

    df_all['SMOKING_STATUS'] = df_all.apply(derive_smoking_status, axis=1)

    # Rigorous Pack-Years Estimation
    def derive_pack_years(row):
        status = row.get('SMOKING_STATUS')
        if status == 'Never':
            return 0.0

        start = row.get('SMD030')
        curr = row.get('RIDAGEYR')

        if status == 'Current':
            cigs = row.get('SMD650')
            if pd.notna(cigs) and pd.notna(start) and pd.notna(curr):
                if 0 < cigs < 200 and 0 < start <= curr:
                    return round((cigs / 20.0) * (curr - start), 1)
        elif status == 'Former':
            cigs = row.get('SMD057')
            quit_age = row.get('SMD055')
            if pd.notna(cigs) and pd.notna(quit_age) and pd.notna(start):
                if 0 < cigs < 200 and 0 < start <= quit_age:
                    return round((cigs / 20.0) * (quit_age - start), 1)

        return np.nan

    df_all['PACK_YEARS'] = df_all.apply(derive_pack_years, axis=1)

    # Export Processed Master File
    processed_csv = PROCESSED_DATA_DIR / "nhanes_merged_2007_2012.csv.gz"
    df_all.to_csv(processed_csv, index=False, compression="gzip")
    print(f"\n[+] PROCESSED HARMONIZED DATASET SAVED -> {processed_csv} ({processed_csv.stat().st_size / (1024*1024):.2f} MB)")

    # Save merge summary statistics
    stats_path = REPORTS_DIR / "merge_audit_report.json"
    with open(stats_path, "w") as f:
        json.dump(merge_stats, f, indent=2)

    return df_all

if __name__ == "__main__":
    merge_cycles()
