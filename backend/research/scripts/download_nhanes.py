"""
Download official CDC NHANES 2007-2012 datasets for respiratory feasibility audit.
Preserves original downloaded XPT files in raw/ directory without modification.
"""

import sys
import time
from pathlib import Path
import requests
import pandas as pd

# Add research root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))
from config.settings import CYCLES, MODULES, RAW_DATA_DIR, REPORTS_DIR, get_file_url, get_raw_file_path

def download_nhanes_files():
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (AETHER Clinical AI Research)'
    }

    inventory = []

    print("=" * 80)
    print("CDC NHANES 2007-2012 REPRODUCIBLE DATASET DOWNLOAD PIPELINE")
    print("=" * 80)

    total_files = len(CYCLES) * len(MODULES)
    idx = 0

    for cycle, cycle_info in CYCLES.items():
        print(f"\n[+] Processing Cycle {cycle} ({cycle_info['years']})...")
        for module, desc in MODULES.items():
            idx += 1
            filename = f"{module}_{cycle}.XPT"
            file_path = get_raw_file_path(module, cycle)
            url = get_file_url(module, cycle)

            file_exists = file_path.exists() and file_path.stat().st_size > 1024

            if file_exists:
                size_kb = file_path.stat().st_size / 1024
                print(f"  [{idx}/{total_files}] CACHED: {filename} ({size_kb:.1f} KB) -> {file_path.name}")
                status = "CACHED"
                file_size = file_path.stat().st_size
            else:
                print(f"  [{idx}/{total_files}] DOWNLOADING: {filename} from {url} ...")
                try:
                    resp = requests.get(url, headers=headers, stream=True, timeout=30)
                    if resp.status_code == 200:
                        with open(file_path, "wb") as f:
                            for chunk in resp.iter_content(chunk_size=65536):
                                if chunk:
                                    f.write(chunk)
                        file_size = file_path.stat().st_size
                        size_kb = file_size / 1024
                        print(f"      -> SUCCESS: {filename} ({size_kb:.1f} KB)")
                        status = "DOWNLOADED"
                    else:
                        print(f"      -> HTTP ERROR {resp.status_code} for {url}")
                        status = f"HTTP_{resp.status_code}"
                        file_size = 0
                except Exception as e:
                    print(f"      -> DOWNLOAD ERROR: {e}")
                    status = f"ERROR_{str(e)[:30]}"
                    file_size = 0

            # Verify integrity
            is_valid_sas = False
            if file_path.exists() and file_path.stat().st_size > 80:
                with open(file_path, "rb") as f:
                    header = f.read(80)
                    if b"HEADER RECORD*******LIBRARY HEADER RECORD" in header:
                        is_valid_sas = True

            inventory.append({
                "module": module,
                "cycle": cycle,
                "years": cycle_info["years"],
                "filename": filename,
                "description": desc,
                "url": url,
                "status": status,
                "size_bytes": file_size,
                "size_kb": round(file_size / 1024, 2),
                "is_valid_sas_xpt": is_valid_sas
            })
            time.sleep(0.1)

    df_inv = pd.DataFrame(inventory)
    inventory_csv = REPORTS_DIR / "dataset_inventory.csv"
    df_inv.to_csv(inventory_csv, index=False)
    print("\n" + "=" * 80)
    print(f"DATASET INVENTORY RECORDED -> {inventory_csv}")
    print("=" * 80)
    print(df_inv[["filename", "years", "status", "size_kb", "is_valid_sas_xpt"]].to_string(index=False))

    all_valid = df_inv["is_valid_sas_xpt"].all()
    print(f"\nALL {total_files} DATASETS VERIFIED VALID SAS XPORT: {all_valid}")
    return df_inv

if __name__ == "__main__":
    download_nhanes_files()
