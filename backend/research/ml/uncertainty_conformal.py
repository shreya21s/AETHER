"""
Uncertainty Quantification, Probability Calibration, and Split Conformal Prediction.
Implements:
1. Expected Calibration Error (ECE) and Brier Score evaluation.
2. Isotonic and Platt (Sigmoid) scaling calibrators.
3. Mondrian (Class-Conditional) Split Conformal Prediction for finite-sample coverage
   guarantees under extreme class imbalance (~10% prevalence).
4. 3-Way Clinical Decision Policy:
   - PREDICT_NORMAL: {0}
   - PREDICT_OBSTRUCTED: {1}
   - UNCERTAIN_REQUEST_DATA_OR_ABSTAIN: {0, 1} or {}
5. Selective Prediction, Empirical Coverage, and Risk–Coverage curves.
"""

from typing import Dict, List, Tuple, Any, Optional
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression

# Clinical 3-Way Decision Outcomes
DECISION_PREDICT_NORMAL = "PREDICT_NORMAL"
DECISION_PREDICT_OBSTRUCTED = "PREDICT_OBSTRUCTED"
DECISION_UNCERTAIN_ABSTAIN = "UNCERTAIN_REQUEST_DATA_OR_ABSTAIN"

def compute_brier_score(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    """Mean squared error of probabilistic predictions."""
    y_true = np.asarray(y_true, dtype=float)
    y_prob = np.asarray(y_prob, dtype=float)
    return float(np.mean((y_prob - y_true) ** 2))

def compute_ece(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    n_bins: int = 10
) -> Tuple[float, List[float], List[float], List[int]]:
    """
    Computes Expected Calibration Error (ECE) with equal-width binning across [0, 1].
    Returns (ece, bin_accuracies, bin_confidences, bin_counts).
    """
    y_true = np.asarray(y_true, dtype=float)
    y_prob = np.asarray(y_prob, dtype=float)
    n = len(y_true)
    
    bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
    bin_accuracies = []
    bin_confidences = []
    bin_counts = []
    
    ece = 0.0
    for i in range(n_bins):
        low, high = bin_edges[i], bin_edges[i + 1]
        if i == n_bins - 1:
            mask = (y_prob >= low) & (y_prob <= high)
        else:
            mask = (y_prob >= low) & (y_prob < high)
            
        bin_count = int(np.sum(mask))
        bin_counts.append(bin_count)
        
        if bin_count > 0:
            bin_acc = float(np.mean(y_true[mask]))
            bin_conf = float(np.mean(y_prob[mask]))
            bin_accuracies.append(bin_acc)
            bin_confidences.append(bin_conf)
            ece += (bin_count / n) * abs(bin_acc - bin_conf)
        else:
            bin_accuracies.append(0.0)
            bin_confidences.append(float((low + high) / 2.0))
            
    return float(ece), bin_accuracies, bin_confidences, bin_counts

class ProbabilityCalibrator:
    """
    Post-hoc probability calibrator trained on held-out calibration split.
    Supports both Isotonic Regression and Platt Scaling (Sigmoid).
    """
    def __init__(self, method: str = "isotonic"):
        self.method = method
        self.calibrator = None
        
    def fit(self, y_cal: np.ndarray, p_cal: np.ndarray) -> "ProbabilityCalibrator":
        y_cal = np.asarray(y_cal, dtype=float)
        p_cal = np.asarray(p_cal, dtype=float)
        
        if self.method == "isotonic":
            self.calibrator = IsotonicRegression(out_of_bounds="clip")
            self.calibrator.fit(p_cal, y_cal)
        elif self.method == "sigmoid":
            # Platt scaling: fit logistic regression on raw probability
            self.calibrator = LogisticRegression(C=1e5, solver="lbfgs")
            self.calibrator.fit(p_cal.reshape(-1, 1), y_cal.astype(int))
        else:
            raise ValueError(f"Unknown calibration method: {self.method}")
            
        return self
        
    def predict_proba(self, p_raw: np.ndarray) -> np.ndarray:
        p_raw = np.asarray(p_raw, dtype=float)
        if self.method == "isotonic":
            p_cal = self.calibrator.predict(p_raw)
        else:
            p_cal = self.calibrator.predict_proba(p_raw.reshape(-1, 1))[:, 1]
            
        # Numerical stability clipping
        return np.clip(p_cal, 1e-6, 1.0 - 1e-6)

class MondrianConformalPredictor:
    """
    Mondrian (Class-Conditional) Split Conformal Predictor.
    Provides finite-sample coverage guarantees P(Y in C(X) | Y=y) >= 1 - alpha
    for each individual class y in {0, 1}.
    """
    def __init__(self, alphas: List[float] = [0.05, 0.10, 0.15, 0.20]):
        self.alphas = sorted(alphas)
        # Store quantiles for each alpha: {alpha: {'q0': float, 'q1': float}}
        self.quantiles: Dict[float, Dict[str, float]] = {}
        self.n_cal_0 = 0
        self.n_cal_1 = 0
        
    def fit(self, y_cal: np.ndarray, p_cal: np.ndarray) -> "MondrianConformalPredictor":
        """
        Computes non-conformity score quantiles on held-out calibration split.
        Non-conformity scores:
          Class 0: s_0 = p (predicting high positive probability when true class is 0 is non-conforming)
          Class 1: s_1 = 1 - p (predicting low positive probability when true class is 1 is non-conforming)
        """
        y_cal = np.asarray(y_cal, dtype=int)
        p_cal = np.asarray(p_cal, dtype=float)
        
        s0 = p_cal[y_cal == 0]
        s1 = 1.0 - p_cal[y_cal == 1]
        
        self.n_cal_0 = len(s0)
        self.n_cal_1 = len(s1)
        
        if self.n_cal_0 == 0 or self.n_cal_1 == 0:
            raise ValueError("Calibration split must contain both classes for Mondrian conformal prediction.")
            
        for alpha in self.alphas:
            # Conformal finite-sample quantile formula:
            # q_level = ceil((n + 1) * (1 - alpha)) / n
            level_0 = min(1.0, np.ceil((self.n_cal_0 + 1) * (1.0 - alpha)) / self.n_cal_0)
            level_1 = min(1.0, np.ceil((self.n_cal_1 + 1) * (1.0 - alpha)) / self.n_cal_1)
            
            q0 = float(np.quantile(s0, level_0, method="higher"))
            q1 = float(np.quantile(s1, level_1, method="higher"))
            
            self.quantiles[alpha] = {"q0": q0, "q1": q1}
            
        return self

    def predict(
        self,
        p_test: np.ndarray,
        alpha: float = 0.10
    ) -> Tuple[List[List[int]], List[str]]:
        """
        Generates conformal prediction sets and clinical decisions for test cases at target alpha.
        Returns:
          prediction_sets: List of sets e.g. [0], [1], [0, 1], or []
          decisions: List of clinical decisions
        """
        if alpha not in self.quantiles:
            raise ValueError(f"Alpha {alpha} not fitted. Available: {list(self.quantiles.keys())}")
            
        p_test = np.asarray(p_test, dtype=float)
        q0 = self.quantiles[alpha]["q0"]
        q1 = self.quantiles[alpha]["q1"]
        
        # Test non-conformity scores
        # Include 0 if s0 <= q0 <=> p <= q0
        # Include 1 if s1 <= q1 <=> (1 - p) <= q1 <=> p >= 1 - q1
        include_0 = p_test <= q0
        include_1 = (1.0 - p_test) <= q1
        
        prediction_sets: List[List[int]] = []
        decisions: List[str] = []
        
        for inc0, inc1 in zip(include_0, include_1):
            c_set = []
            if inc0:
                c_set.append(0)
            if inc1:
                c_set.append(1)
            prediction_sets.append(c_set)
            
            if inc0 and not inc1:
                decisions.append(DECISION_PREDICT_NORMAL)
            elif inc1 and not inc0:
                decisions.append(DECISION_PREDICT_OBSTRUCTED)
            else:
                # Both [0, 1] (uncertain) or [] (empty anomaly)
                decisions.append(DECISION_UNCERTAIN_ABSTAIN)
                
        return prediction_sets, decisions

    def evaluate(
        self,
        y_test: np.ndarray,
        p_test: np.ndarray,
        alpha: float = 0.10
    ) -> Dict[str, Any]:
        """
        Evaluates empirical coverage, singleton rate, abstention rate, and selective risk.
        """
        y_test = np.asarray(y_test, dtype=int)
        p_test = np.asarray(p_test, dtype=float)
        
        prediction_sets, decisions = self.predict(p_test, alpha=alpha)
        
        n_total = len(y_test)
        covered_arr = np.array([y in c_set for y, c_set in zip(y_test, prediction_sets)], dtype=bool)
        singleton_arr = np.array([len(c_set) == 1 for c_set in prediction_sets], dtype=bool)
        
        # Class conditional coverage
        mask_0 = (y_test == 0)
        mask_1 = (y_test == 1)
        
        cov_overall = float(np.mean(covered_arr))
        cov_class_0 = float(np.mean(covered_arr[mask_0])) if np.sum(mask_0) > 0 else 0.0
        cov_class_1 = float(np.mean(covered_arr[mask_1])) if np.sum(mask_1) > 0 else 0.0
        
        singleton_rate = float(np.mean(singleton_arr))
        abstention_rate = float(1.0 - singleton_rate)
        
        # Selective Risk: error rate among accepted singleton predictions
        if np.sum(singleton_arr) > 0:
            singleton_preds = np.array([c_set[0] for c_set in prediction_sets if len(c_set) == 1])
            singleton_trues = y_test[singleton_arr]
            selective_risk = float(np.mean(singleton_preds != singleton_trues))
            selective_accuracy = float(1.0 - selective_risk)
        else:
            selective_risk = 0.0
            selective_accuracy = 1.0
            
        return {
            "alpha": alpha,
            "nominal_coverage": float(1.0 - alpha),
            "empirical_coverage_overall": cov_overall,
            "empirical_coverage_class_0": cov_class_0,
            "empirical_coverage_class_1": cov_class_1,
            "singleton_rate": singleton_rate,
            "abstention_rate": abstention_rate,
            "selective_risk": selective_risk,
            "selective_accuracy": selective_accuracy,
            "q0_threshold": self.quantiles[alpha]["q0"],
            "q1_threshold": self.quantiles[alpha]["q1"],
            "n_evaluated": n_total,
        }

def compute_risk_coverage_curve(
    y_true: np.ndarray,
    p_calibrated: np.ndarray,
    n_points: int = 30
) -> List[Dict[str, float]]:
    """
    Computes selective classification risk vs. coverage curve across confidence thresholds.
    Confidence score is defined as distance from decision boundary: c(x) = |p - 0.5|
    """
    y_true = np.asarray(y_true, dtype=int)
    p_calibrated = np.asarray(p_calibrated, dtype=float)
    y_pred = (p_calibrated >= 0.5).astype(int)
    
    confidence = np.abs(p_calibrated - 0.5)
    sorted_indices = np.argsort(-confidence) # Descending confidence
    
    curve = []
    n = len(y_true)
    
    # Evaluate at coverage percentiles from 10% to 100%
    percentiles = np.linspace(0.10, 1.0, n_points)
    for cov in percentiles:
        k = max(1, int(round(cov * n)))
        retained_idx = sorted_indices[:k]
        
        retained_pred = y_pred[retained_idx]
        retained_true = y_true[retained_idx]
        
        error_rate = float(np.mean(retained_pred != retained_true))
        min_conf = float(confidence[retained_idx[-1]])
        
        curve.append({
            "coverage": float(cov),
            "selective_risk": float(error_rate),
            "selective_accuracy": float(1.0 - error_rate),
            "confidence_cutoff": min_conf,
            "n_retained": k,
        })
        
    return curve
