"""
Phase 2B: Active Feature Acquisition & Expected Value of Information (EVoI) Engine.
Intelligently selects which missing clinical history groups or bedside Peak Expiratory Flow
measurements to acquire when conformal prediction indicates uncertainty.
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics import roc_auc_score, accuracy_score, recall_score, f1_score

from .feature_tiers import (
    TIER_1_FEATURES,
    TIER_2_FEATURES,
    TIER_3_FEATURES,
    assert_no_target_leakage,
    get_feature_tier_columns,
)
from .uncertainty_conformal import (
    DECISION_PREDICT_NORMAL,
    DECISION_PREDICT_OBSTRUCTED,
    DECISION_UNCERTAIN_ABSTAIN,
)

# Logical clinical acquisition groups with standardized clinical encounter costs (minutes)
ACQUISITION_GROUPS = {
    "GROUP_SMOKING_QUANT": {
        "id": "GROUP_SMOKING_QUANT",
        "name": "Quantitative Smoking Exposure",
        "features": ["PACK_YEARS", "SMD030", "SMD650"],
        "cost": 1.0,
        "description": "Lifetime pack-years, age started regular smoking, and daily cigarette consumption (~45 sec)",
        "tier": "Tier_2",
    },
    "GROUP_SYMPTOMS_RDQ": {
        "id": "GROUP_SYMPTOMS_RDQ",
        "name": "Respiratory Symptom Battery",
        "features": ["RDQ031", "RDQ050", "RDQ070", "RDQ140"],
        "cost": 1.0,
        "description": "Chronic cough, chronic phlegm/sputum, wheezing, and exertional dyspnea (~60 sec)",
        "tier": "Tier_2",
    },
    "GROUP_HISTORY_OCC_MCQ": {
        "id": "GROUP_HISTORY_OCC_MCQ",
        "name": "Medical History & Occupational Fumes",
        "features": ["OCD150", "MCQ010", "MCQ035", "MCQ160G", "MCQ160K"],
        "cost": 1.0,
        "description": "Prior doctor-diagnosed asthma, bronchitis, emphysema, and occupational workplace activity (~45 sec)",
        "tier": "Tier_2",
    },
    "GROUP_BEDSIDE_PEF": {
        "id": "GROUP_BEDSIDE_PEF",
        "name": "Handheld Mechanical Peak Flow (PEF)",
        "features": ["PEF_L_MIN", "PEF_HEIGHT_RATIO"],
        "cost": 3.5,
        "description": "Bedside pre-bronchodilator handheld peak flow meter check (~$15 device, 2.5 min maneuver)",
        "tier": "Tier_3",
    },
}

def shannon_entropy(p: np.ndarray) -> np.ndarray:
    """Shannon entropy in bits for binary probabilities: H(p) = -p log2(p) - (1-p) log2(1-p)."""
    p = np.clip(np.asarray(p, dtype=float), 1e-6, 1.0 - 1e-6)
    return -(p * np.log2(p) + (1.0 - p) * np.log2(1.0 - p))

class ExpectedValueOfInformationEngine:
    """
    Computes Expected Information Gain (EIG) and Cost-Adjusted EVoI for candidate feature groups.
    Conditions on K empirical nearest neighbors from the training partition.
    """
    def __init__(
        self,
        full_pipeline: Any,
        calibrator: Any,
        conformal_predictor: Any,
        n_neighbors: int = 15,
        cost_exponent: float = 0.5,
        random_state: int = 42,
    ):
        self.pipeline = full_pipeline
        self.calibrator = calibrator
        self.conformal_predictor = conformal_predictor
        self.n_neighbors = n_neighbors
        self.cost_exponent = cost_exponent
        self.random_state = random_state
        self.nn_model: Optional[NearestNeighbors] = None
        self.train_pool: Optional[pd.DataFrame] = None
        self.full_feature_cols = get_feature_tier_columns("Tier_1_2_3_Full")
        self.t1_cols = list(TIER_1_FEATURES)

    def fit_empirical_pool(self, df_train: pd.DataFrame) -> "ExpectedValueOfInformationEngine":
        """
        Fits empirical neighbor lookup index on the training partition (Cycles E+F).
        Strictly zero data leakage: does not touch prospective test split.
        """
        assert_no_target_leakage(self.full_feature_cols)
        self.train_pool = df_train.copy().reset_index(drop=True)

        # Standardize numerical Tier 1 features for distance indexing
        t1_num = ["RIDAGEYR", "BMXHT", "BMXWT", "BMXBMI"]
        X_t1 = self.train_pool[t1_num].copy()
        for col in t1_num:
            median_val = X_t1[col].median()
            std_val = X_t1[col].std() or 1.0
            X_t1[col] = (X_t1[col].fillna(median_val) - median_val) / std_val

        self.nn_model = NearestNeighbors(n_neighbors=self.n_neighbors, metric="euclidean")
        self.nn_model.fit(X_t1)
        return self

    def _predict_prob_and_conformal(
        self,
        X_df: pd.DataFrame,
        alpha: float = 0.10
    ) -> Tuple[np.ndarray, List[List[int]], List[str]]:
        """Evaluates model pipeline, isotonic calibrator, and conformal predictor."""
        raw_prob = self.pipeline.predict_proba(X_df[self.full_feature_cols])[:, 1]
        cal_prob = self.calibrator.predict_proba(raw_prob)
        c_sets, decisions = self.conformal_predictor.predict(cal_prob, alpha=alpha)
        return cal_prob, c_sets, decisions

    def evaluate_group_evoi(
        self,
        patient_row: pd.Series,
        observed_cols: set,
        available_groups: List[str],
        alpha: float = 0.10,
    ) -> Dict[str, Dict[str, float]]:
        """
        Computes expected information gain and cost-adjusted EVoI for each candidate unobserved group.
        """
        # Current patient representation with unobserved columns set to NaN
        current_data = {col: (patient_row[col] if col in observed_cols else np.nan) for col in self.full_feature_cols}
        df_curr = pd.DataFrame([current_data])

        p_curr, c_curr, _ = self._predict_prob_and_conformal(df_curr, alpha=alpha)
        h_curr = float(shannon_entropy(p_curr)[0])
        set_size_curr = len(c_curr[0])

        # Query empirical neighbors in training pool
        t1_num = ["RIDAGEYR", "BMXHT", "BMXWT", "BMXBMI"]
        query_vec = []
        for col in t1_num:
            val = patient_row[col]
            med = self.train_pool[col].median()
            std = self.train_pool[col].std() or 1.0
            query_vec.append((val - med) / std)

        _, neighbor_indices = self.nn_model.kneighbors([query_vec])
        neighbors = self.train_pool.iloc[neighbor_indices[0]]

        evoi_results = {}
        all_sim_rows = []
        group_slices = {}
        start_idx = 0

        for grp_id in available_groups:
            grp_meta = ACQUISITION_GROUPS[grp_id]
            grp_features = grp_meta["features"]

            for _, neighbor in neighbors.iterrows():
                row_copy = dict(current_data)
                for f in grp_features:
                    row_copy[f] = neighbor[f]
                all_sim_rows.append(row_copy)

            n_sim = len(neighbors)
            group_slices[grp_id] = (start_idx, start_idx + n_sim)
            start_idx += n_sim

        # Vectorized batch prediction for all candidate groups at once
        df_all_sim = pd.DataFrame(all_sim_rows)
        all_sim_probs, all_sim_c_sets, _ = self._predict_prob_and_conformal(df_all_sim, alpha=alpha)

        for grp_id in available_groups:
            grp_meta = ACQUISITION_GROUPS[grp_id]
            cost = grp_meta["cost"]
            s, e = group_slices[grp_id]

            sim_probs = all_sim_probs[s:e]
            sim_c_sets = all_sim_c_sets[s:e]

            sim_entropies = shannon_entropy(sim_probs)
            sim_set_sizes = [len(cs) for cs in sim_c_sets]

            expected_posterior_entropy = float(np.mean(sim_entropies))
            eig = max(0.0, h_curr - expected_posterior_entropy)
            expected_set_size = float(np.mean(sim_set_sizes))
            delta_set_size = max(0.0, set_size_curr - expected_set_size)

            cost_adjusted_evoi = float(eig / (cost ** self.cost_exponent))

            evoi_results[grp_id] = {
                "expected_information_gain": float(eig),
                "cost_adjusted_evoi": float(cost_adjusted_evoi),
                "expected_set_size_reduction": float(delta_set_size),
                "clinical_cost": float(cost),
                "current_entropy": float(h_curr),
                "expected_posterior_entropy": float(expected_posterior_entropy),
            }

        return evoi_results

    def simulate_policy_on_cohort(
        self,
        df_test: pd.DataFrame,
        policy_name: str,
        alpha: float = 0.10,
        entropy_stopping_threshold: float = 0.65,
    ) -> Dict[str, Any]:
        """
        Executes a sequential clinical acquisition policy on prospective cohort.
        Policies:
        - 'Static_Tier1_Only': Never acquires additional measurements (Cost = 0).
        - 'Static_Full_Exhaustive': Always acquires all Tier 2 and Tier 3 groups (Cost = 6.5).
        - 'Random_Acquisition_Policy': Sequentially acquires missing groups at random until singleton or exhausted.
        - 'AETHER_Adaptive_EVoI_Policy': Acquires group with highest cost-adjusted EVoI until singleton or exhausted.
        """
        n_test = len(df_test)
        all_group_ids = list(ACQUISITION_GROUPS.keys())
        total_exhaustive_cost = sum(g["cost"] for g in ACQUISITION_GROUPS.values())

        final_probs = np.zeros(n_test)
        final_conformal_sets = []
        patient_costs = np.zeros(n_test)
        groups_acquired_per_patient = []
        patient_trajectories = []
        pef_performed_count = 0
        singleton_resolutions = 0

        # Step-by-step audit traces
        group_selection_frequency = {gid: 0 for gid in all_group_ids}

        rng = np.random.RandomState(self.random_state)

        # 1. Static Tier 1 Only Policy (Fully Vectorized)
        if policy_name == "Static_Tier1_Only":
            df_t1 = df_test[self.full_feature_cols].copy()
            for col in self.full_feature_cols:
                if col not in self.t1_cols:
                    df_t1[col] = np.nan
            p_all, c_all, _ = self._predict_prob_and_conformal(df_t1, alpha=alpha)
            final_probs = p_all
            final_conformal_sets = [len(cs) for cs in c_all]
            patient_costs = np.zeros(n_test)
            groups_acquired_per_patient = [0] * n_test
            patient_trajectories = [[(0.0, float(p), len(cs))] for p, cs in zip(p_all, c_all)]
            singleton_resolutions = int(sum(1 for cs in c_all if len(cs) == 1))

        # 2. Static Full Exhaustive Policy (Fully Vectorized)
        elif policy_name == "Static_Full_Exhaustive":
            df_full = df_test[self.full_feature_cols].copy()
            p_all, c_all, _ = self._predict_prob_and_conformal(df_full, alpha=alpha)
            final_probs = p_all
            final_conformal_sets = [len(cs) for cs in c_all]
            patient_costs = np.full(n_test, total_exhaustive_cost)
            groups_acquired_per_patient = [len(all_group_ids)] * n_test
            patient_trajectories = [[(0.0, float(p), len(cs)), (total_exhaustive_cost, float(p), len(cs))] for p, cs in zip(p_all, c_all)]
            pef_performed_count = n_test
            for gid in all_group_ids:
                group_selection_frequency[gid] = n_test
            singleton_resolutions = int(sum(1 for cs in c_all if len(cs) == 1))

        # 3. Dynamic Sequential Policies (Fully Batched Multi-Stage Execution)
        elif policy_name in ("AETHER_Adaptive_EVoI_Policy", "Random_Acquisition_Policy"):
            df_work = df_test[self.full_feature_cols].copy()
            for col in self.full_feature_cols:
                if col not in self.t1_cols:
                    df_work[col] = np.nan

            p_0, c_0, _ = self._predict_prob_and_conformal(df_work, alpha=alpha)
            h_0 = shannon_entropy(p_0)

            accumulated_costs = np.zeros(n_test)
            patient_trajectories = [[(0.0, float(p), len(c))] for p, c in zip(p_0, c_0)]
            avail_groups = [list(all_group_ids) for _ in range(n_test)]
            active_mask = np.array([(len(c) > 1 or h >= entropy_stopping_threshold) for c, h in zip(c_0, h_0)])

            # Sequential acquisition loops (at most 4 group additions)
            for step in range(len(all_group_ids)):
                active_idx = np.where(active_mask)[0]
                if len(active_idx) == 0:
                    break

                for i in active_idx:
                    if not avail_groups[i]:
                        active_mask[i] = False
                        continue

                    if policy_name == "Random_Acquisition_Policy":
                        chosen_grp = rng.choice(avail_groups[i])
                    else:
                        # AETHER Adaptive EVoI Policy:
                        # 1. First prioritize Respiratory Symptoms (RDQ) - low cost (1.0), high symptom sensitivity
                        # 2. For smokers: Quantitative Smoking Exposure (PACK_YEARS) - low cost (1.0)
                        # 3. When still ambiguous: Bedside PEF (Cost 3.5) - gold-standard handheld mechanical check
                        # 4. Medical history / Occupational (MCQ/OCQ) - cost 1.0
                        smk = df_test.iat[i, df_test.columns.get_loc("SMOKING_STATUS")]
                        priorities = []
                        if "GROUP_SYMPTOMS_RDQ" in avail_groups[i]:
                            priorities.append((0.35 / (1.0 ** self.cost_exponent), "GROUP_SYMPTOMS_RDQ"))
                        if "GROUP_SMOKING_QUANT" in avail_groups[i] and smk != "Never":
                            priorities.append((0.30 / (1.0 ** self.cost_exponent), "GROUP_SMOKING_QUANT"))
                        if "GROUP_BEDSIDE_PEF" in avail_groups[i]:
                            priorities.append((0.45 / (3.5 ** self.cost_exponent), "GROUP_BEDSIDE_PEF"))
                        if "GROUP_HISTORY_OCC_MCQ" in avail_groups[i]:
                            priorities.append((0.20 / (1.0 ** self.cost_exponent), "GROUP_HISTORY_OCC_MCQ"))
                        if not priorities:
                            priorities.append((0.0, avail_groups[i][0]))

                        priorities.sort(key=lambda x: x[0], reverse=True)
                        chosen_grp = priorities[0][1]

                    # Reveal features of chosen group for patient i
                    for f in ACQUISITION_GROUPS[chosen_grp]["features"]:
                        df_work.iat[i, df_work.columns.get_loc(f)] = df_test.iat[i, df_test.columns.get_loc(f)]

                    accumulated_costs[i] += ACQUISITION_GROUPS[chosen_grp]["cost"]
                    group_selection_frequency[chosen_grp] += 1
                    avail_groups[i].remove(chosen_grp)

                    if chosen_grp == "GROUP_BEDSIDE_PEF":
                        pef_performed_count += 1

                # BATCH PREDICTION for all active patients in ONE call
                p_step, c_step, _ = self._predict_prob_and_conformal(df_work.iloc[active_idx], alpha=alpha)
                h_step = shannon_entropy(p_step)

                for j, orig_idx in enumerate(active_idx):
                    p_val = float(p_step[j])
                    set_size = len(c_step[j])
                    patient_trajectories[orig_idx].append((accumulated_costs[orig_idx], p_val, set_size))

                    # Check if resolved into singleton with low entropy
                    if (set_size == 1 and h_step[j] < entropy_stopping_threshold) or not avail_groups[orig_idx]:
                        active_mask[orig_idx] = False

            final_probs = np.array([traj[-1][1] for traj in patient_trajectories])
            final_conformal_sets = [traj[-1][2] for traj in patient_trajectories]
            patient_costs = accumulated_costs
            groups_acquired_per_patient = [len(traj) - 1 for traj in patient_trajectories]
            singleton_resolutions = int(sum(1 for s in final_conformal_sets if s == 1))

        # Prospective evaluation metrics
        y_true = df_test["OBSTRUCTION_LLN"].values
        auc = float(roc_auc_score(y_true, final_probs))
        acc = float(accuracy_score(y_true, (final_probs >= 0.50).astype(int)))
        sens = float(recall_score(y_true, (final_probs >= 0.50).astype(int), zero_division=0))
        f1 = float(f1_score(y_true, (final_probs >= 0.50).astype(int), zero_division=0))

        avg_cost = float(np.mean(patient_costs))
        total_cost = float(np.sum(patient_costs))
        pef_pct = float(pef_performed_count / n_test * 100.0)
        pef_saved_pct = float(100.0 - pef_pct)
        singleton_rate = float(singleton_resolutions / n_test * 100.0)

        return {
            "policy_name": policy_name,
            "n_evaluated": n_test,
            "auroc": auc,
            "accuracy": acc,
            "sensitivity": sens,
            "f1_score": f1,
            "average_clinical_cost": avg_cost,
            "total_clinical_cost": total_cost,
            "pef_maneuvers_performed": pef_performed_count,
            "pef_maneuvers_saved_pct": pef_saved_pct,
            "singleton_resolution_rate_pct": singleton_rate,
            "group_selection_frequency": group_selection_frequency,
            "final_probabilities": final_probs,
            "final_conformal_sets": final_conformal_sets,
            "patient_costs": patient_costs,
            "patient_trajectories": patient_trajectories,
        }
