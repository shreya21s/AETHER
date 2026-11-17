"""
AETHER ML Research & Clinical Screening Package
Offline-First, Uncertainty-Aware Adaptive Cloud–Edge AI
"""

from .feature_tiers import (
    TIER_1_FEATURES,
    TIER_2_FEATURES,
    TIER_3_FEATURES,
    FORBIDDEN_LEAKAGE_COLUMNS,
    FEATURE_LABELS,
    FEATURE_COSTS,
    assert_no_target_leakage,
    get_feature_tier_columns,
)

__all__ = [
    "TIER_1_FEATURES",
    "TIER_2_FEATURES",
    "TIER_3_FEATURES",
    "FORBIDDEN_LEAKAGE_COLUMNS",
    "FEATURE_LABELS",
    "FEATURE_COSTS",
    "assert_no_target_leakage",
    "get_feature_tier_columns",
]
