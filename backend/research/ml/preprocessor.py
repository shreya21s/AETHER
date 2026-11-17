"""
Clinical Preprocessing Pipeline for AETHER.
Fitted strictly on the training partition (Cycles E+F) to prevent data leakage.
Handles numeric standardization, median imputation, and categorical one-hot encoding.
"""

from typing import List, Tuple
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, FunctionTransformer
from sklearn.impute import SimpleImputer

from .feature_tiers import (
    TIER_1_FEATURES,
    TIER_2_FEATURES,
    TIER_3_FEATURES,
    assert_no_target_leakage,
)

# Known numeric vs. categorical column definitions
NUMERIC_FEATURES = {
    "RIDAGEYR",
    "BMXHT",
    "BMXWT",
    "BMXBMI",
    "PACK_YEARS",
    "SMD030",
    "SMD650",
    "PEF_L_MIN",
    "PEF_HEIGHT_RATIO",
}

CATEGORICAL_FEATURES = {
    "RIAGENDR",
    "RIDRETH1",
    "SMOKING_STATUS",
    "SMQ020",
    "RDQ031",
    "RDQ050",
    "RDQ070",
    "RDQ140",
    "OCD150",
    "MCQ010",
    "MCQ035",
    "MCQ160G",
    "MCQ160K",
}

def string_caster(X):
    """Cast categorical array/dataframe to uniform string with explicit 'Missing' category."""
    if isinstance(X, pd.DataFrame):
        return X.fillna("Missing").astype(str)
    return pd.DataFrame(X).fillna("Missing").astype(str)

def get_column_types(feature_names: List[str]) -> Tuple[List[str], List[str]]:
    """Partitions feature list into numeric and categorical subsets."""
    assert_no_target_leakage(feature_names)
    num_cols = [c for c in feature_names if c in NUMERIC_FEATURES]
    cat_cols = [c for c in feature_names if c in CATEGORICAL_FEATURES or c not in NUMERIC_FEATURES]
    return num_cols, cat_cols

def build_preprocessor(feature_names: List[str]) -> ColumnTransformer:
    """
    Constructs a scikit-learn ColumnTransformer for the specified feature subset.
    Zero-leakage: must be fitted ONLY on training data.
    """
    assert_no_target_leakage(feature_names)
    num_cols, cat_cols = get_column_types(feature_names)

    transformers = []
    if num_cols:
        num_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])
        transformers.append(("num", num_pipeline, num_cols))

    if cat_cols:
        cat_pipeline = Pipeline([
            ("cast", FunctionTransformer(string_caster, validate=False, feature_names_out="one-to-one")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ])
        transformers.append(("cat", cat_pipeline, cat_cols))

    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop",
        verbose_feature_names_out=False,
    )
    return preprocessor

def get_transformed_feature_names(preprocessor: ColumnTransformer, raw_feature_names: List[str]) -> List[str]:
    """Retrieves feature names after imputation, scaling, and one-hot encoding."""
    try:
        return list(preprocessor.get_feature_names_out())
    except Exception:
        # Fallback manual reconstruction if get_feature_names_out is unavailable
        num_cols, cat_cols = get_column_types(raw_feature_names)
        names = list(num_cols)
        if cat_cols and hasattr(preprocessor.named_transformers_["cat"]["encoder"], "categories_"):
            enc = preprocessor.named_transformers_["cat"]["encoder"]
            for col, cats in zip(cat_cols, enc.categories_):
                for c in cats:
                    names.append(f"{col}_{c}")
        return names
