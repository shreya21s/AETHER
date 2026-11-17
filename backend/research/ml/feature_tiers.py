"""
Feature Tier Definitions, Acquisition Costs, and Zero-Leakage Guardrails
for AETHER Clinical Risk Screening.

Tier 1: Zero-Cost Baseline Demographics & Anthropometrics (Intake)
Tier 2: Low-Cost Detailed Smoking History, Respiratory Symptoms & Clinical History
Tier 3: Point-of-Care Handheld Peak Expiratory Flow (PEF) Screening Measurement
"""

from typing import List, Dict, Set

# Tier 1: Always available at primary triage (Demographics + Body Measures + Basic Smoking)
TIER_1_FEATURES: List[str] = [
    "RIDAGEYR",        # Age in years (40-79)
    "RIAGENDR",        # Biological sex (1=Male, 2=Female)
    "RIDRETH1",        # Race / Ethnicity (5-level standard classification)
    "BMXHT",           # Standing height (cm)
    "BMXWT",           # Weight (kg)
    "BMXBMI",          # Body Mass Index (kg/m^2)
    "SMOKING_STATUS",  # Categorical 3-level: Never, Former, Current
    "SMQ020",          # Smoked >= 100 cigarettes in life (1=Yes, 2=No)
]

# Tier 2: Detailed Smoking Exposure, Symptoms, Occupational, Medical History
TIER_2_FEATURES: List[str] = [
    # Quantitative Smoking History
    "PACK_YEARS",      # Cumulative lifetime pack-years
    "SMD030",          # Age started smoking regularly (years)
    "SMD650",          # Number of cigarettes smoked per day on smoking days
    # Respiratory Symptoms (RDQ)
    "RDQ031",          # Chronic cough >= 3 consecutive months (1=Yes, 2=No)
    "RDQ050",          # Chronic phlegm/sputum >= 3 consecutive months (1=Yes, 2=No)
    "RDQ070",          # Wheezing or whistling in chest past 12 months (1=Yes, 2=No)
    "RDQ140",          # Wheezing with exercise past 12 months (1=Yes, 2=No)
    # Occupational Exposure (OCQ)
    "OCD150",          # Employment / job activity category
    # Medical History (MCQ) - Prior Diagnoses
    "MCQ010",          # Ever diagnosed with asthma (1=Yes, 2=No)
    "MCQ035",          # Still have asthma (1=Yes, 2=No)
    "MCQ160G",         # Ever diagnosed with emphysema (1=Yes, 2=No)
    "MCQ160K",         # Ever diagnosed with chronic bronchitis (1=Yes, 2=No)
]

# Tier 3: Point-of-Care Handheld Mechanical Peak Flow (PEF)
# Pre-bronchodilator handheld peak flow meter check (~$15 device, 2-minute bedside maneuver)
TIER_3_FEATURES: List[str] = [
    "PEF_L_MIN",       # Peak Expiratory Flow in Litres/minute (SPXNPEF * 0.06)
    "PEF_HEIGHT_RATIO",# PEF normalized by height (PEF_L_MIN / BMXHT)
]

# Clinical Acquisition Costs in standardized effort/time units (minutes of clinical encounter)
FEATURE_COSTS: Dict[str, float] = {
    # Tier 1 (Intake - total ~2 min)
    "RIDAGEYR": 0.1,
    "RIAGENDR": 0.1,
    "RIDRETH1": 0.1,
    "BMXHT": 0.5,
    "BMXWT": 0.5,
    "BMXBMI": 0.1,
    "SMOKING_STATUS": 0.3,
    "SMQ020": 0.3,
    # Tier 2 (Detailed History & Questionnaire - total ~5 min)
    "PACK_YEARS": 1.0,
    "SMD030": 0.5,
    "SMD650": 0.5,
    "RDQ031": 0.5,
    "RDQ050": 0.5,
    "RDQ070": 0.5,
    "RDQ140": 0.5,
    "OCD150": 0.5,
    "MCQ010": 0.3,
    "MCQ035": 0.3,
    "MCQ160G": 0.3,
    "MCQ160K": 0.3,
    # Tier 3 (Handheld Maneuver - total ~3 min)
    "PEF_L_MIN": 2.5,
    "PEF_HEIGHT_RATIO": 0.5,
}

# Human-Readable Clinical Labels for Explainability and Reporting
FEATURE_LABELS: Dict[str, str] = {
    "RIDAGEYR": "Age (Years)",
    "RIAGENDR": "Biological Sex",
    "RIDRETH1": "Race / Ethnicity",
    "BMXHT": "Standing Height (cm)",
    "BMXWT": "Body Weight (kg)",
    "BMXBMI": "Body Mass Index (kg/m²)",
    "SMOKING_STATUS": "Smoking Status (Never/Former/Current)",
    "SMQ020": "Smoked >= 100 Cigarettes in Lifetime",
    "PACK_YEARS": "Cumulative Smoking Pack-Years",
    "SMD030": "Age Started Smoking Regularly",
    "SMD650": "Cigarettes Per Day (Smoking Days)",
    "RDQ031": "Chronic Cough (>= 3 Months/Year)",
    "RDQ050": "Chronic Phlegm / Sputum Production",
    "RDQ070": "Wheezing / Whistling in Chest (Past 12m)",
    "RDQ140": "Exercise-Induced Wheezing",
    "OCD150": "Employment / Occupational Activity",
    "MCQ010": "Prior Physician-Diagnosed Asthma",
    "MCQ035": "Active Current Asthma",
    "MCQ160G": "Prior Physician-Diagnosed Emphysema",
    "MCQ160K": "Prior Physician-Diagnosed Chronic Bronchitis",
    "PEF_L_MIN": "Handheld Peak Expiratory Flow (L/min)",
    "PEF_HEIGHT_RATIO": "PEF-to-Height Ratio (L/min per cm)",
}

# CRITICAL ZERO-LEAKAGE GUARDRAIL:
# Any column derived from or defining the target, spirometric volumes, or survey administration
FORBIDDEN_LEAKAGE_COLUMNS: Set[str] = {
    # Baseline Spirometry Volumes & Derived Ratios (These define the ground truth)
    "SPXNFEV1",
    "SPXNFVC",
    "FEV1_L",
    "FVC_L",
    "FEV1_FVC_RATIO",
    # Reference Equations & Target Cutoffs
    "PREDICTED_RATIO_HANKINSON",
    "LLN_RATIO_HANKINSON",
    # Target Ground Truth Labels
    "OBSTRUCTION_LLN",
    "OBSTRUCTION_FIXED_070",
    "OBSTRUCTION_POST_BD_FIXED",
    # Post-Bronchodilator Spirometry (Extreme Verification Bias)
    "SPDBRONC",
    "SPXBSTAT",
    "SPXBCMT",
    "SPXBFVC",
    "SPXBFEV1",
    "SPXBQFVC",
    "SPXBQFV1",
    "POST_BD_FEV1_L",
    "POST_BD_FVC_L",
    "POST_BD_RATIO",
    # Quality Grades and Procedural Metadata
    "SPXNSTAT",
    "SPXNCMT",
    "SPXNQFVC",
    "SPXNQFV1",
    "SPDNACC",
    "SPXNQEFF",
    "QC_STRICT_AB",
    "QC_EXPANDED_ABC",
    # Identifiers and Raw Survey Weights (must not be fed as predictor columns in X)
    "SEQN",
    "SDDSRVYR",
    "CYCLE",
    "YEARS",
    "WTMEC2YR",
    "WTINT2YR",
    "WTMEC6YR",
    "SDMVSTRA",
    "SDMVPSU",
}

def assert_no_target_leakage(feature_names: List[str]) -> None:
    """
    Automated zero-target-leakage assertion guard.
    Raises ValueError immediately if any forbidden spirometric outcome or target column enters X.
    """
    leaking_features = set(feature_names) & FORBIDDEN_LEAKAGE_COLUMNS
    if leaking_features:
        raise ValueError(
            f"[FATAL TARGET LEAKAGE DETECTED] Feature set contains forbidden columns: {sorted(list(leaking_features))}. "
            "These variables define the diagnostic ground-truth label or introduce post-test verification bias. "
            "Execution halted to preserve scientific integrity."
        )

def get_feature_tier_columns(tier_level: str) -> List[str]:
    """
    Returns the cumulative list of features for the requested clinical tier level:
    - 'Tier_1_Only': Tier 1 features only
    - 'Tier_1_Plus_Tier_2': Tier 1 + Tier 2 features (Clinical Only)
    - 'Tier_1_2_3_Full': Tier 1 + Tier 2 + Tier 3 features (Clinical + Handheld PEF)
    """
    if tier_level == "Tier_1_Only":
        cols = list(TIER_1_FEATURES)
    elif tier_level == "Tier_1_Plus_Tier_2":
        cols = list(TIER_1_FEATURES + TIER_2_FEATURES)
    elif tier_level in ("Tier_1_2_3_Full", "Clinical_Plus_PEF"):
        cols = list(TIER_1_FEATURES + TIER_2_FEATURES + TIER_3_FEATURES)
    else:
        raise ValueError(f"Unknown tier level: {tier_level}")
    
    assert_no_target_leakage(cols)
    return cols
