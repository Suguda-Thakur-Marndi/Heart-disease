"""
API integration tests for HeartGuard FastAPI server.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.model import ModelContainer


@pytest.fixture(scope="module")
def client():
    # Use context manager so FastAPI lifespan triggers and loads artifacts
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client):
    """Verify health endpoint reports ready status and loaded model artifacts."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["scaler_loaded"] is True
    assert data["encoder_loaded"] is True
    assert data["model_type"] == "KNeighborsClassifier"
    assert data["features_count"] == 14


def test_model_info_endpoint(client):
    """Verify model-info endpoint returns complete metadata for the UI."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "K-Nearest Neighbors (k=5)"
    assert len(data["input_fields"]) == 11


def test_valid_predict_api(client):
    """Verify successful prediction via POST /api/predict."""
    payload = {
        "age": 52,
        "sex": "M",
        "chest_pain_type": "ASY",
        "resting_bp": 130.0,
        "cholesterol": 220.0,
        "fasting_bs": 0,
        "resting_ecg": "Normal",
        "max_hr": 145.0,
        "exercise_angina": "N",
        "oldpeak": 0.8,
        "st_slope": "Flat"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "risk_level" in data
    assert "probability" in data
    assert "neighbor_votes" in data
    assert "clinical_observations" in data
    assert "disclaimer" in data


def test_missing_required_fields(client):
    """Verify 422 Unprocessable Entity when required fields are missing."""
    payload = {
        "age": 52,
        "sex": "M"
        # missing rest of fields
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "details" in data


def test_invalid_categorical_value(client):
    """Verify rejection of unpermitted categorical option."""
    payload = {
        "age": 52,
        "sex": "INVALID_SEX",
        "chest_pain_type": "ASY",
        "resting_bp": 130.0,
        "cholesterol": 220.0,
        "fasting_bs": 0,
        "resting_ecg": "Normal",
        "max_hr": 145.0,
        "exercise_angina": "N",
        "oldpeak": 0.8,
        "st_slope": "Flat"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"


def test_out_of_bounds_numerical(client):
    """Verify rejection of physiologically impossible numbers (e.g. age < 18 or > 120)."""
    payload = {
        "age": 140,  # Impossible age
        "sex": "M",
        "chest_pain_type": "ASY",
        "resting_bp": 130.0,
        "cholesterol": 220.0,
        "fasting_bs": 0,
        "resting_ecg": "Normal",
        "max_hr": 145.0,
        "exercise_angina": "N",
        "oldpeak": 0.8,
        "st_slope": "Flat"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"


def test_negative_blood_pressure(client):
    """Verify rejection of negative medical measurements."""
    payload = {
        "age": 50,
        "sex": "M",
        "chest_pain_type": "ASY",
        "resting_bp": -120.0,  # Negative BP
        "cholesterol": 220.0,
        "fasting_bs": 0,
        "resting_ecg": "Normal",
        "max_hr": 145.0,
        "exercise_angina": "N",
        "oldpeak": 0.8,
        "st_slope": "Flat"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"


def test_wrong_data_type(client):
    """Verify rejection when string is passed where number expected."""
    payload = {
        "age": "not-a-number",
        "sex": "M",
        "chest_pain_type": "ASY",
        "resting_bp": 130.0,
        "cholesterol": 220.0,
        "fasting_bs": 0,
        "resting_ecg": "Normal",
        "max_hr": 145.0,
        "exercise_angina": "N",
        "oldpeak": 0.8,
        "st_slope": "Flat"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
