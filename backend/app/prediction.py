"""
Inference service for HeartGuard.
Coordinates preprocessing, model inference, neighbor analysis, and response generation.
"""

from typing import Dict, Any
import numpy as np

from app.schemas import HeartAssessmentRequest, PredictionResponse
from app.preprocessing import (
    preprocess_patient_input,
    generate_clinical_observations,
    FEATURE_COLUMNS
)
from app.model import get_model, get_scaler


def run_prediction(request: HeartAssessmentRequest) -> PredictionResponse:
    """
    Executes the end-to-end ML prediction pipeline for an assessment request.
    """
    model = get_model()
    scaler = get_scaler()

    # 1. Preprocess & Scale
    raw_vector, scaled_vector = preprocess_patient_input(request, scaler)

    # 2. Model Prediction
    raw_pred = int(model.predict(scaled_vector)[0])
    raw_proba = model.predict_proba(scaled_vector)[0]

    # Model classes are [0, 1] where:
    # 0 = Lower Estimated Risk (Negative)
    # 1 = Elevated Estimated Risk (Positive)
    # Probability of elevated risk is probability for class 1
    elevated_risk_prob = float(raw_proba[1])
    conf_pct = round(elevated_risk_prob * 100.0, 1)

    # 3. K-Nearest Neighbor Analysis (k=5)
    # Inspect actual votes among the k=5 nearest clinical cases
    distances, indices = model.kneighbors(scaled_vector)
    neighbor_targets = model._y[indices[0]]
    elevated_count = int(np.sum(neighbor_targets == 1))
    lower_risk_count = int(np.sum(neighbor_targets == 0))

    neighbor_votes = {
        "lower_risk_cases": lower_risk_count,
        "elevated_risk_cases": elevated_count,
        "total_evaluated_neighbors": len(neighbor_targets)
    }

    # 4. Risk Category Classification
    if elevated_risk_prob < 0.35:
        risk_level = "Lower Estimated Risk"
        risk_category = "Low"
    elif elevated_risk_prob < 0.60:
        risk_level = "Moderate Estimated Risk"
        risk_category = "Moderate"
    else:
        risk_level = "Elevated Estimated Risk"
        risk_category = "High"

    # 5. Clinical Observations (ACC/AHA standards)
    clinical_obs = generate_clinical_observations(request)

    # 6. Honest explanation according to requirements (no fabricated SHAP)
    explanation = (
        f"The prediction is based on the combination of health characteristics provided to the "
        f"machine-learning model. The model identified the 5 most clinically similar patient profiles "
        f"in the reference dataset: {elevated_count} showed signs of cardiovascular disease, while "
        f"{lower_risk_count} showed lower risk profiles."
    )

    # 7. Submitted values mirror
    submitted_values = {
        "Age": f"{request.age} years",
        "Sex": "Male" if request.sex == "M" else "Female",
        "Chest Pain Type": {
            "ASY": "Asymptomatic (ASY)",
            "ATA": "Atypical Angina (ATA)",
            "NAP": "Non-Anginal Pain (NAP)",
            "TA": "Typical Angina (TA)"
        }[request.chest_pain_type],
        "Resting Blood Pressure": f"{request.resting_bp:.0f} mmHg",
        "Serum Cholesterol": f"{request.cholesterol:.0f} mg/dL" if request.cholesterol > 0 else "Unmeasured",
        "Fasting Blood Sugar": "> 120 mg/dL" if request.fasting_bs == 1 else "<= 120 mg/dL",
        "Resting ECG": {
            "Normal": "Normal",
            "LVH": "Left Ventricular Hypertrophy (LVH)",
            "ST": "ST-T Wave Abnormality"
        }[request.resting_ecg],
        "Maximum Heart Rate": f"{request.max_hr:.0f} bpm",
        "Exercise-Induced Angina": "Yes" if request.exercise_angina == "Y" else "No",
        "ST Depression (Oldpeak)": f"{request.oldpeak:.1f} mm",
        "Peak ST Slope": {
            "Up": "Upsloping",
            "Flat": "Flat",
            "Down": "Downsloping"
        }[request.st_slope]
    }

    return PredictionResponse(
        prediction=raw_pred,
        risk_level=risk_level,
        risk_category=risk_category,
        probability=round(elevated_risk_prob, 4),
        confidence_percentage=conf_pct,
        model_name="K-Nearest Neighbors Classifier (k=5)",
        neighbor_votes=neighbor_votes,
        clinical_observations=clinical_obs,
        explanation=explanation,
        submitted_values=submitted_values
    )
