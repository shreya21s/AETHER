"""
Machine Learning Architectures for AETHER Clinical Risk Screening.
Implements:
1. L2-Regularized Logistic Regression (Interpretable, ultra-low-power Edge/Offline baseline)
2. Random Forest Classifier (Calibrated tree ensemble)
3. XGBoost Classifier (High-performance gradient boosted decision trees)
4. Cloud Soft-Voting Ensemble (Calibrated weighted ensemble for heavy Cloud mode)

All models support complex survey sample weighting (WTMEC6YR) and class-imbalance corrections.
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

from .preprocessor import build_preprocessor

def get_base_models(
    scale_pos_weight: float = 8.5,
    random_state: int = 42
) -> Dict[str, BaseEstimator]:
    """
    Initializes the base classification algorithms configured with clinical class-imbalance
    weighting and regularization parameters.
    """
    lr = LogisticRegression(
        C=0.5,
        solver="lbfgs",
        max_iter=1000,
        class_weight="balanced",
        random_state=random_state,
    )

    rf = RandomForestClassifier(
        n_estimators=250,
        max_depth=7,
        min_samples_split=12,
        min_samples_leaf=5,
        max_features="sqrt",
        class_weight="balanced_subsample",
        random_state=random_state,
        n_jobs=-1,
    )

    xgb = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.04,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=random_state,
        n_jobs=-1,
    )

    cloud_ensemble = VotingClassifier(
        estimators=[
            ("lr", lr),
            ("rf", rf),
            ("xgb", xgb),
        ],
        voting="soft",
        weights=[1.0, 2.0, 3.0],
    )

    return {
        "LogisticRegression": lr,
        "RandomForest": rf,
        "XGBoost": xgb,
        "CloudEnsemble": cloud_ensemble,
    }

def build_model_pipeline(
    feature_names: list,
    model_name: str,
    scale_pos_weight: float = 8.5,
    random_state: int = 42
) -> Pipeline:
    """
    Combines feature preprocessor with a classifier into an end-to-end scikit-learn Pipeline.
    Ensures that transformations are strictly isolated and fit only on training splits.
    """
    preprocessor = build_preprocessor(feature_names)
    models = get_base_models(scale_pos_weight=scale_pos_weight, random_state=random_state)
    
    if model_name not in models:
        raise ValueError(f"Unknown model_name '{model_name}'. Choose from: {list(models.keys())}")
        
    clf = models[model_name]
    
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf),
    ])
    return pipeline
