"""
Inspect downloaded raw SAS XPT datasets across 2007-2012.
Analyzes SEQN alignment, column availability, data types, and record counts.
"""

import sys
import json
from pathlib import Path
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parent.parent))
from config.settings import CYCLES, MODULES, RAW_DATA_DIR, REPORTS_DIR, get_raw_file_path

def inspect_datasets():
    print("=" * 80)
    print("INSPECTING RAW NHANES SAS XPORT DATASETS (2007-2012)")
    print("=" * 80)

    inspection_results = {}
    summary_rows = []

    for cycle, cycle_info in CYCLES.items():
        print(f"\n[+] Analyzing Cycle {cycle} ({cycle_info['years']})...")
        cycle_seqns = {}

        for module, desc in MODULES.items():
            file_path = get_raw_file_path(module, cycle)
            if not file_path.exists():
                print(f"  [!] Missing file: {file_path}")
                continue

            try:
                # Read SAS XPORT file
                df = pd.read_sas(file_path, format='xport')
                # Standardize column names to uppercase string
                df.columns = [c.upper() for c in df.columns]

                n_rows, n_cols = df.shape
                seqn_col = "SEQN" if "SEQN" in df.columns else None
                n_unique_seqn = df["SEQN"].nunique() if seqn_col else 0

                if seqn_col:
                    cycle_seqns[module] = set(df["SEQN"].astype(int))

                summary_rows.append({
                    "cycle": cycle,
                    "years": cycle_info["years"],
                    "module": module,
                    "filename": file_path.name,
                    "rows": n_rows,
                    "columns": n_cols,
                    "unique_seqn": n_unique_seqn,
                    "has_seqn": seqn_col is not None
                })

                inspection_results[f"{module}_{cycle}"] = {
                    "cycle": cycle,
                    "years": cycle_info["years"],
                    "module": module,
                    "rows": n_rows,
                    "columns": n_cols,
                    "column_names": list(df.columns),
                    "memory_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)
                }

                print(f"  {file_path.name:<12} | Rows: {n_rows:<6} | Cols: {n_cols:<4} | SEQN: {n_unique_seqn:<6}")
            except Exception as e:
                print(f"  [!] Error reading {file_path.name}: {e}")

        # Cycle SEQN intersection analysis
        if "DEMO" in cycle_seqns and "SPX" in cycle_seqns:
            demo_count = len(cycle_seqns["DEMO"])
            spx_count = len(cycle_seqns["SPX"])
            spx_in_demo = len(cycle_seqns["SPX"].intersection(cycle_seqns["DEMO"]))
            print(f"  --> Cycle {cycle} Alignment: DEMO N={demo_count}, SPX N={spx_count}, Match N={spx_in_demo} (100% matched: {spx_count == spx_in_demo})")

    df_summary = pd.DataFrame(summary_rows)
    summary_csv = REPORTS_DIR / "dataset_summary.csv"
    df_summary.to_csv(summary_csv, index=False)

    json_report = REPORTS_DIR / "dataset_inspection_report.json"
    with open(json_report, "w") as f:
        json.dump(inspection_results, f, indent=2)

    print("\n" + "=" * 80)
    print(f"INSPECTION SUMMARY SAVED -> {summary_csv}")
    print(f"DETAILED COLUMN CATALOG -> {json_report}")
    print("=" * 80)

    return inspection_results, df_summary

if __name__ == "__main__":
    inspect_datasets()
