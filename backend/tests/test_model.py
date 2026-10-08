"""
Unit tests for HeartGuard ML artifacts and preprocessing pipeline.
"""

import pytest
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

from app.model import ModelContainer, get_model, get_scaler, get_encoder
from app.schemas import HeartAssessmentRequest
from app.preprocessing import (
    preprocess_patient_input,
    calibrate_scaler,
    generate_clinical_observations,
    FEATURE_COLUMNS,
    CALIBRATED_MEANS,
    CALIBRATED_STDS
)
from app.prediction import run_prediction


@pytest.fixture(scope="module", autouse=True)
def setup_models():
    container = ModelContainer.get_instance()
    container.load_artifacts()


def test_model_loading():
    """Verify that model, scaler, and encoder load successfully without error."""
    model = get_model()
    scaler = get_scaler()
    encoder = get_encoder()

    assert isinstance(model, KNeighborsClassifier)
    assert model.n_neighbors == 5
    assert set(model.classes_) == {0, 1}

    assert isinstance(scaler, StandardScaler)
    assert len(scaler.mean_) == 14
    assert len(scaler.scale_) == 14

    assert isinstance(encoder, list)
    assert len(encoder) == 14
    assert encoder == FEATURE_COLUMNS


def test_scaler_calibration():
    """Verify scaler calibration correctly restores the training distribution."""
    scaler = get_scaler()
    # Check that scale_ is NOT all 1s (which was the bug in the raw artifact)
    assert not np.allclose(scaler.scale_, 1.0)
    assert np.allclose(scaler.mean_, CALIBRATED_MEANS)
    assert np.allclose(scaler.scale_, CALIBRATED_STDS)


def test_preprocessing_output_shape():
    """Verify preprocessing produces exactly 1x14 vectors with proper types."""
    req = HeartAssessmentRequest(
        age=54,
        sex="M",
        chest_pain_type="ASY",
        resting_bp=135.0,
        cholesterol=210.0,
        fasting_bs=0,
        resting_ecg="Normal",
        max_hr=142.0,
        exercise_angina="N",
        oldpeak=1.2,
        st_slope="Flat"
    )
    scaler = get_scaler()
    raw_vec, scaled_vec = preprocess_patient_input(req, scaler)

    assert raw_vec.shape == (1, 14)
    assert scaled_vec.shape == (1, 14)
    assert raw_vec[0, 0] == 54.0  # Age
    assert raw_vec[0, 1] == 1.0   # Male = 1
    assert raw_vec[0, 10] == 1.0  # ChestPainType_ASY = 1
    assert raw_vec[0, 11] == 0.0  # ChestPainType_ATA = 0


def test_valid_prediction():
    """Verify end-to-end prediction returns valid probabilities and categories."""
    req = HeartAssessmentRequest(
        age=54,
        sex="M",
        chest_pain_type="ASY",
        resting_bp=140.0,
        cholesterol=260.0,
        fasting_bs=1,
        resting_ecg="LVH",
        max_hr=110.0,
        exercise_angina="Y",
        oldpeak=2.5,
        st_slope="Flat"
    )
    resp = run_prediction(req)

    assert resp.prediction in [0, 1]
    assert resp.risk_level in ["Lower Estimated Risk", "Elevated Estimated Risk"]
    assert 0.0 <= resp.probability <= 1.0
    assert 0.0 <= resp.confidence_percentage <= 100.0
    assert resp.neighbor_votes["total_evaluated_neighbors"] == 5
    assert len(resp.clinical_observations) > 0


def test_low_risk_case():
    """Verify that a young healthy profile correctly predicts lower estimated risk."""
    req = HeartAssessmentRequest(
        age=32,
        sex="F",
        chest_pain_type="ATA",
        resting_bp=110.0,
        cholesterol=170.0,
        fasting_bs=0,
        resting_ecg="Normal",
        max_hr=175.0,
        exercise_angina="N",
        oldpeak=0.0,
        st_slope="Up"
    )
    resp = run_prediction(req)

    assert resp.prediction == 0
    assert resp.risk_level == "Lower Estimated Risk"
    assert resp.probability <= 0.40


def test_clinical_observations():
    """Verify clinical observations are generated based on ACC/AHA guidelines."""
    req = HeartAssessmentRequest(
        age=60,
        sex="M",
        chest_pain_type="ASY",
        resting_bp=160.0,  # Stage 2 hypertension
        cholesterol=290.0,  # High cholesterol
        fasting_bs=1,      # Elevated glucose
        resting_ecg="Normal",
        max_hr=120.0,
        exercise_angina="Y",
        oldpeak=2.5,
        st_slope="Down"
    )
    obs = generate_clinical_observations(req)
    categories = [o.category for o in obs]
    assert "Blood Pressure" in categories
    assert "Cholesterol" in categories
    assert "Blood Sugar" in categories
    assert "Angina" in categories

    bp_obs = next(o for o in obs if o.category == "Blood Pressure")
    assert bp_obs.status == "elevated"
