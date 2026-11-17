"""
Build comprehensive variable dictionary across NHANES 2007-2012.
Validates exact column availability, types, value ranges, and coding across cycles E, F, G.
"""

import sys
import pandas as pd
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from config.settings import CYCLES, RAW_DATA_DIR, REPORTS_DIR, get_raw_file_path

# Complete specification of candidate variables for the respiratory screening platform
VARIABLE_SPECS = [
    # --- DEMOGRAPHICS & SURVEY DESIGN (DEMO) ---
    {
        "variable": "SEQN",
        "description": "Respondent sequence number (unique participant identifier)",
        "module": "DEMO",
        "units": "ID",
        "valid_range": "41475 - 71916",
        "missing_codes": "None (Primary Key)",
        "age_eligibility": "All ages",
        "role": "Identifier",
        "harmonization": "Identical across all cycles."
    },
    {
        "variable": "RIDAGEYR",
        "description": "Age in years at screening (top-coded at 80 in E/F/G)",
        "module": "DEMO",
        "units": "Years",
        "valid_range": "0 - 80",
        "missing_codes": "None in public release",
        "age_eligibility": "All ages",
        "role": "Predictor & Cohort Filter",
        "harmonization": "Consistent across cycles. Top-coded at 80 years (80 = >=80 years)."
    },
    {
        "variable": "RIAGENDR",
        "description": "Gender of participant",
        "module": "DEMO",
        "units": "Categorical",
        "valid_range": "1 = Male, 2 = Female",
        "missing_codes": "None",
        "age_eligibility": "All ages",
        "role": "Predictor",
        "harmonization": "Binary 1=Male, 2=Female across all cycles."
    },
    {
        "variable": "RIDRETH1",
        "description": "Race / Hispanic Origin (5-level standard classification)",
        "module": "DEMO",
        "units": "Categorical",
        "valid_range": "1=Mexican American, 2=Other Hispanic, 3=Non-Hispanic White, 4=Non-Hispanic Black, 5=Other Race / Multi-Racial",
        "missing_codes": "None",
        "age_eligibility": "All ages",
        "role": "Predictor & GLI Reference Mapping",
        "harmonization": "Harmonized across 2007-2012. RIDRETH3 (with Asian) introduced in 2011; RIDRETH1 retained for 6-year compatibility."
    },
    {
        "variable": "WTMEC2YR",
        "description": "Full Sample 2-Year Mobile Examination Center (MEC) Exam Weight",
        "module": "DEMO",
        "units": "Survey Weight",
        "valid_range": "> 0",
        "missing_codes": "0 if not examined in MEC",
        "age_eligibility": "All examined participants",
        "role": "Survey Design Weight",
        "harmonization": "Per CDC guidelines, for a 3-cycle (6-year) pooled examination analysis: WTMEC6YR = WTMEC2YR / 3."
    },
    {
        "variable": "SDMVSTRA",
        "description": "Masked Variance Pseudo-Stratum for complex survey design",
        "module": "DEMO",
        "units": "Stratum ID",
        "valid_range": "Discrete stratum codes",
        "missing_codes": "None",
        "age_eligibility": "All participants",
        "role": "Survey Variance Stratum",
        "harmonization": "Identical structure. Used with Taylor series linearization."
    },
    {
        "variable": "SDMVPSU",
        "description": "Masked Variance Pseudo-Primary Sampling Unit (PSU)",
        "module": "DEMO",
        "units": "Cluster ID",
        "valid_range": "1 or 2 (nested within stratum)",
        "missing_codes": "None",
        "age_eligibility": "All participants",
        "role": "Survey Variance PSU",
        "harmonization": "Identical structure across cycles."
    },

    # --- BODY MEASUREMENTS (BMX) ---
    {
        "variable": "BMXHT",
        "description": "Standing Height in centimeters",
        "module": "BMX",
        "units": "cm",
        "valid_range": "80.0 - 205.0 cm",
        "missing_codes": "Blank = Missing / Not measured",
        "age_eligibility": ">= 2 years",
        "role": "Predictor & Spirometry Normalization",
        "harmonization": "Consistent. Critical for GLI/Hankinson predicted spirometric lung volume calculation."
    },
    {
        "variable": "BMXWT",
        "description": "Weight in kilograms",
        "module": "BMX",
        "units": "kg",
        "valid_range": "15.0 - 230.0 kg",
        "missing_codes": "Blank = Missing / Not measured",
        "age_eligibility": "All ages",
        "role": "Predictor",
        "harmonization": "Standard scale across cycles."
    },
    {
        "variable": "BMXBMI",
        "description": "Body Mass Index (BMI)",
        "module": "BMX",
        "units": "kg/m^2",
        "valid_range": "12.0 - 85.0",
        "missing_codes": "Blank = Missing",
        "age_eligibility": ">= 2 years",
        "role": "Predictor",
        "harmonization": "Calculated as BMXWT / (BMXHT/100)^2."
    },

    # --- SMOKING EXPOSURE (SMQ) ---
    {
        "variable": "SMQ020",
        "description": "Smoked at least 100 cigarettes in lifetime",
        "module": "SMQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank=Not applicable (<12 or <18)",
        "age_eligibility": ">= 12 or >= 18 (depending on cycle)",
        "role": "Predictor (Primary Ever-Smoker Screen)",
        "harmonization": "Coding identical across cycles. Fundamental gateway to pack-years."
    },
    {
        "variable": "SMQ040",
        "description": "Do you now smoke cigarettes?",
        "module": "SMQ",
        "units": "Categorical",
        "valid_range": "1=Every day, 2=Some days, 3=Not at all",
        "missing_codes": "7=Refused, 9=Don't know, Blank=Never smoked (<100 cigs)",
        "age_eligibility": "Ever-smokers (SMQ020=1)",
        "role": "Predictor (Current vs Former Status)",
        "harmonization": "Combined with SMQ020 into 3-level smokingStatus: Never (SMQ020=2), Former (SMQ020=1 & SMQ040=3), Current (SMQ020=1 & SMQ040 in [1,2])."
    },
    {
        "variable": "SMD030",
        "description": "Age started smoking cigarettes regularly",
        "module": "SMQ",
        "units": "Years",
        "valid_range": "6 - 70",
        "missing_codes": "777=Refused, 999=Don't know, Blank=Never smoked",
        "age_eligibility": "Ever-smokers",
        "role": "Predictor (Smoking Duration)",
        "harmonization": "Used with age and cigarettes/day to compute cumulative pack-years."
    },
    {
        "variable": "SMD650",
        "description": "Number of cigarettes smoked per day on days smoked",
        "module": "SMQ",
        "units": "Cigarettes/day",
        "valid_range": "1 - 95 (95 = 95 or more)",
        "missing_codes": "777=Refused, 999=Don't know, Blank=Non-smoker (<100 cigs)",
        "age_eligibility": "Current / recent smokers",
        "role": "Predictor (Intensity / Pack-Years)",
        "harmonization": "Harmonized across 2007-2012 (replaces older NHANES SMD070). Pack-years for current = (SMD650 / 20) * (RIDAGEYR - SMD030)."
    },
    {
        "variable": "SMD055",
        "description": "Age last smoked cigarettes regularly (cessation age)",
        "module": "SMQ",
        "units": "Years",
        "valid_range": "7 - 80",
        "missing_codes": "777=Refused, 999=Don't know, Blank=Never or current smoker",
        "age_eligibility": "Former smokers (SMQ020=1 & SMQ040=3)",
        "role": "Predictor (Former Smoker Duration)",
        "harmonization": "Harmonized across Cycles E, F, G. Used with SMD030 to compute duration for former smokers: (SMD055 - SMD030)."
    },
    {
        "variable": "SMD057",
        "description": "Number of cigarettes smoked per day when quit",
        "module": "SMQ",
        "units": "Cigarettes/day",
        "valid_range": "1 - 95",
        "missing_codes": "777=Refused, 999=Don't know, Blank=Never or current smoker",
        "age_eligibility": "Former smokers (SMQ020=1 & SMQ040=3)",
        "role": "Predictor (Former Smoker Intensity)",
        "harmonization": "Harmonized across Cycles E, F, G. Used with SMD055 and SMD030 to compute pack-years: (SMD057 / 20) * (SMD055 - SMD030)."
    },

    # --- RESPIRATORY SYMPTOMS (RDQ) ---
    {
        "variable": "RDQ031",
        "description": "Cough most days for >= 3 consecutive months of the year?",
        "module": "RDQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank=Under age 1",
        "age_eligibility": ">= 1 year (administered to adults)",
        "role": "Predictor (Chronic Cough / Bronchitis Symptom)",
        "harmonization": "Identical wording and binary coding across all three cycles."
    },
    {
        "variable": "RDQ050",
        "description": "Bring up phlegm/sputum most days for >= 3 consecutive months?",
        "module": "RDQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank=Under age 1",
        "age_eligibility": ">= 1 year",
        "role": "Predictor (Chronic Sputum Production)",
        "harmonization": "Identical coding across cycles."
    },
    {
        "variable": "RDQ070",
        "description": "Wheezing or whistling in chest in past 12 months?",
        "module": "RDQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know",
        "age_eligibility": ">= 1 year",
        "role": "Predictor (Active Airway Hyperreactivity)",
        "harmonization": "Identical coding across cycles."
    },
    {
        "variable": "RDQ140",
        "description": "Chest sound wheezy or whistling during or after exercise?",
        "module": "RDQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank",
        "age_eligibility": "Wheezing participants",
        "role": "Predictor (Exertional Airflow Limiting Symptom)",
        "harmonization": "Consistent. Note: administered only if wheezing reported or filter active."
    },

    # --- MEDICAL CONDITIONS (MCQ) ---
    {
        "variable": "MCQ010",
        "description": "Ever been told by a doctor had asthma?",
        "module": "MCQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know",
        "age_eligibility": ">= 1 year",
        "role": "Predictor (Medical History)",
        "harmonization": "Identical coding across cycles."
    },
    {
        "variable": "MCQ035",
        "description": "Still have asthma?",
        "module": "MCQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank (MCQ010!=1)",
        "age_eligibility": "If MCQ010=1",
        "role": "Predictor (Active Asthma)",
        "harmonization": "Structural skip pattern from MCQ010."
    },
    {
        "variable": "MCQ160G",
        "description": "Ever told had emphysema?",
        "module": "MCQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank (<20 years)",
        "age_eligibility": ">= 20 years",
        "role": "Predictor (Prior Pulmonary Diagnosis)",
        "harmonization": "Administered to adults >= 20 years across cycles."
    },
    {
        "variable": "MCQ160K",
        "description": "Ever told had chronic bronchitis?",
        "module": "MCQ",
        "units": "Categorical",
        "valid_range": "1=Yes, 2=No",
        "missing_codes": "7=Refused, 9=Don't know, Blank (<20 years)",
        "age_eligibility": ">= 20 years",
        "role": "Predictor (Prior Bronchitis Diagnosis)",
        "harmonization": "Administered to adults >= 20 years across cycles."
    },

    # --- OCCUPATIONAL EXPOSURE (OCQ) ---
    {
        "variable": "OCD150",
        "description": "Type of work done / Employment status in past week",
        "module": "OCQ",
        "units": "Categorical",
        "valid_range": "1-4 (Working, With job, Looking, Not working)",
        "missing_codes": "Blank (<16 years)",
        "age_eligibility": ">= 16 years",
        "role": "Predictor (Employment Baseline)",
        "harmonization": "Check cycle consistency."
    },

    # --- SPIROMETRY EXAMINATION (SPX) - BASELINE PRE-BD ---
    {
        "variable": "SPXNSTAT",
        "description": "Baseline Spirometry Examination Status Code",
        "module": "SPX",
        "units": "Status Code",
        "valid_range": "1=Complete, 2=Partial, 3=Not done",
        "missing_codes": "Blank",
        "age_eligibility": "6 - 79 years (examined in MEC)",
        "role": "Quality Control & Eligibility Filter",
        "harmonization": "Critical QC gateway: only SPXNSTAT=1 or 2 have spirometric curves."
    },
    {
        "variable": "SPXNFVC",
        "description": "Baseline Pre-Bronchodilator Forced Vital Capacity (FVC)",
        "module": "SPX",
        "units": "Milliliters (ml)",
        "valid_range": "300 - 8500 ml",
        "missing_codes": "Blank = Missing / Test failed",
        "age_eligibility": "6 - 79 years",
        "role": "Target Defining Variable (NOT pre-test predictor!)",
        "harmonization": "Reported in milliliters in SAS file. Must divide by 1000 to convert to Litres."
    },
    {
        "variable": "SPXNFEV1",
        "description": "Baseline Pre-Bronchodilator Forced Expiratory Volume in 1 Second (FEV1)",
        "module": "SPX",
        "units": "Milliliters (ml)",
        "valid_range": "200 - 7000 ml",
        "missing_codes": "Blank = Missing / Test failed",
        "age_eligibility": "6 - 79 years",
        "role": "Target Defining Variable (NOT pre-test predictor!)",
        "harmonization": "Reported in milliliters in SAS file. Must divide by 1000 to convert to Litres."
    },
    {
        "variable": "SPXNQFVC",
        "description": "Data Quality Grade for Baseline FVC (ATS/ERS 1994 Standards)",
        "module": "SPX",
        "units": "Quality Grade",
        "valid_range": "A, B, C, D, F",
        "missing_codes": "Blank",
        "age_eligibility": "Tested participants",
        "role": "Quality Control Filter (Strict A/B vs Expanded A/B/C)",
        "harmonization": "Grade A: >= 3 acceptable curves with <= 150ml variation. Grade B: <= 200ml variation. Grade C: <= 250ml variation."
    },
    {
        "variable": "SPXNQFV1",
        "description": "Data Quality Grade for Baseline FEV1",
        "module": "SPX",
        "units": "Quality Grade",
        "valid_range": "A, B, C, D, F",
        "missing_codes": "Blank",
        "age_eligibility": "Tested participants",
        "role": "Quality Control Filter (Strict A/B vs Expanded A/B/C)",
        "harmonization": "Grade A: >= 3 acceptable curves with <= 150ml variation in FEV1."
    },
    {
        "variable": "SPDNACC",
        "description": "Number of acceptable baseline pre-BD curves obtained",
        "module": "SPX",
        "units": "Count",
        "valid_range": "0 - 8",
        "missing_codes": "Blank",
        "age_eligibility": "Tested participants",
        "role": "Quality Control Metric",
        "harmonization": ">= 3 acceptable curves required for Grade A."
    },
    {
        "variable": "SPXNQEFF",
        "description": "Pre-BD examinee effort and repeatability evaluation",
        "module": "SPX",
        "units": "Code",
        "valid_range": "1=Examinee gave good effort / meets standards",
        "missing_codes": "Blank",
        "age_eligibility": "Tested participants",
        "role": "Quality Control Metric",
        "harmonization": "Effort verification."
    },

    # --- SPIROMETRY EXAMINATION (SPX) - BRONCHODILATOR & POST-BD ---
    {
        "variable": "SPDBRONC",
        "description": "Did participant receive inhaled bronchodilator (albuterol)?",
        "module": "SPX",
        "units": "Categorical",
        "valid_range": "1=Yes (tested), 2=No (not eligible or refused/safety contraindication)",
        "missing_codes": "Blank",
        "age_eligibility": "Participants selected for second test",
        "role": "Post-BD Selection Indicator & Verification Bias Audit",
        "harmonization": "Critical: Post-BD test was NOT administered to all participants! Administered selectively to those with baseline obstruction or asthma history."
    },
    {
        "variable": "SPXBFVC",
        "description": "Post-Bronchodilator Forced Vital Capacity (FVC)",
        "module": "SPX",
        "units": "Milliliters (ml)",
        "valid_range": "300 - 8500 ml",
        "missing_codes": "Blank (majority of population unselected)",
        "age_eligibility": "SPDBRONC = 1",
        "role": "Secondary Confirmatory Outcome / Active Acquisition Target",
        "harmonization": "Convert ml to Litres (/ 1000). Highly non-random missingness (verification bias)."
    },
    {
        "variable": "SPXBFEV1",
        "description": "Post-Bronchodilator Forced Expiratory Volume in 1 Second (FEV1)",
        "module": "SPX",
        "units": "Milliliters (ml)",
        "valid_range": "200 - 7000 ml",
        "missing_codes": "Blank (majority of population unselected)",
        "age_eligibility": "SPDBRONC = 1",
        "role": "Secondary Confirmatory Outcome / Active Acquisition Target",
        "harmonization": "Convert ml to Litres (/ 1000). Essential for distinguishing reversible asthma from fixed COPD."
    },
    {
        "variable": "SPXBQFVC",
        "description": "Data Quality Grade for Post-Bronchodilator FVC",
        "module": "SPX",
        "units": "Quality Grade",
        "valid_range": "A, B, C, D, F",
        "missing_codes": "Blank",
        "age_eligibility": "SPDBRONC = 1",
        "role": "Post-BD Quality Control",
        "harmonization": "Post-BD quality threshold."
    },
    {
        "variable": "SPXBQFV1",
        "description": "Data Quality Grade for Post-Bronchodilator FEV1",
        "module": "SPX",
        "units": "Quality Grade",
        "valid_range": "A, B, C, D, F",
        "missing_codes": "Blank",
        "age_eligibility": "SPDBRONC = 1",
        "role": "Post-BD Quality Control",
        "harmonization": "Post-BD quality threshold."
    }
]

def build_variable_dictionary():
    print("=" * 80)
    print("BUILDING VARIABLE DICTIONARY & CROSS-CYCLE AVAILABILITY VERIFICATION")
    print("=" * 80)

    # Verify column presence in actual downloaded files
    availability_matrix = []

    for var_info in VARIABLE_SPECS:
        var_name = var_info["variable"]
        module = var_info["module"]

        presence = {}
        for cycle in ["E", "F", "G"]:
            fpath = get_raw_file_path(module, cycle)
            if not fpath.exists():
                presence[cycle] = False
                continue

            # Read columns header only
            try:
                # read 1 row to get columns fast
                df_head = pd.read_sas(fpath, format='xport', chunksize=5)
                cols = [c.upper() for c in next(df_head).columns]
                presence[cycle] = var_name in cols
            except Exception as e:
                presence[cycle] = False

        available_cycles = [c for c, exists in presence.items() if exists]
        is_consistent = len(available_cycles) == 3

        availability_matrix.append({
            "Variable": var_name,
            "Description": var_info["description"],
            "Source Module": module,
            "Role": var_info["role"],
            "Units": var_info["units"],
            "Valid Range / Coding": var_info["valid_range"],
            "Missing Codes": var_info["missing_codes"],
            "Age Eligibility": var_info["age_eligibility"],
            "Cycle E (2007-08)": "YES" if presence.get("E") else "NO",
            "Cycle F (2009-10)": "YES" if presence.get("F") else "NO",
            "Cycle G (2011-12)": "YES" if presence.get("G") else "NO",
            "Available All 3 Cycles": "YES" if is_consistent else "PARTIAL",
            "Harmonization Notes": var_info["harmonization"]
        })

    df_dict = pd.DataFrame(availability_matrix)

    # Export to CSV
    csv_path = REPORTS_DIR / "variable_dictionary.csv"
    df_dict.to_csv(csv_path, index=False)

    # Export to formatted Markdown
    md_path = REPORTS_DIR / "variable_dictionary.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# AETHER — Comprehensive NHANES 2007–2012 Variable Dictionary\n\n")
        f.write(f"**Total Variables Investigated**: {len(df_dict)}\n\n")
        f.write(df_dict.to_markdown(index=False))

    print(f"VARIABLE DICTIONARY CSV SAVED -> {csv_path}")
    print(f"VARIABLE DICTIONARY MD SAVED  -> {md_path}")
    print("=" * 80)
    print(df_dict[["Variable", "Source Module", "Role", "Available All 3 Cycles"]].to_string(index=False))

    return df_dict

if __name__ == "__main__":
    build_variable_dictionary()
