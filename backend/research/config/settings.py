"""
Configuration and constants for CDC NHANES 2007-2012 Respiratory Dataset Audit.
Covers cycles:
  - 2007-2008 (Cycle E)
  - 2009-2010 (Cycle F)
  - 2011-2012 (Cycle G)
"""

from pathlib import Path

# Directory paths
RESEARCH_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = RESEARCH_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
REPORTS_DIR = RESEARCH_ROOT / "reports"
SCRIPTS_DIR = RESEARCH_ROOT / "scripts"

# Official CDC NHANES File Mapping
CYCLES = {
    "E": {
        "years": "2007-2008",
        "cdc_year_path": "2007",
        "sddsrvyr": 5,
    },
    "F": {
        "years": "2009-2010",
        "cdc_year_path": "2009",
        "sddsrvyr": 6,
    },
    "G": {
        "years": "2011-2012",
        "cdc_year_path": "2011",
        "sddsrvyr": 7,
    }
}

# Required component modules for audit
MODULES = {
    "SPX": "Spirometry Examination",
    "DEMO": "Demographic Variables & Survey Design",
    "BMX": "Body Measures (Height, Weight, BMI)",
    "SMQ": "Smoking Questionnaire",
    "RDQ": "Respiratory Health Questionnaire (Cough, Wheeze, Dyspnea)",
    "MCQ": "Medical Conditions (Asthma, Chronic Bronchitis, Emphysema)",
    "OCQ": "Occupational Exposure Questionnaire"
}

CDC_BASE_URL = "https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public"

def get_file_url(module: str, cycle: str) -> str:
    year_path = CYCLES[cycle]["cdc_year_path"]
    filename = f"{module}_{cycle}.xpt"
    return f"{CDC_BASE_URL}/{year_path}/DataFiles/{filename}"

def get_raw_file_path(module: str, cycle: str) -> Path:
    return RAW_DATA_DIR / f"{module}_{cycle}.XPT"
