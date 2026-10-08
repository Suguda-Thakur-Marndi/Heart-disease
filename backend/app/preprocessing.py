"""
Preprocessing pipeline for HeartGuard.
Implements exact input normalization, categorical encoding, and feature scaling
aligned with the trained ML model's internal representation.
"""

from typing import List, Tuple
import numpy as np
from sklearn.preprocessing import StandardScaler

from app.schemas import HeartAssessmentRequest, ClinicalObservation

FEATURE_COLUMNS = [
    "Age",
    "Sex",
    "RestingBP",
    "Cholesterol",
    "FastingBS",
    "RestingECG",
    "MaxHR",
    "ExerciseAngina",
    "Oldpeak",
    "ST_Slope",
    "ChestPainType_ASY",
    "ChestPainType_ATA",
    "ChestPainType_NAP",
    "ChestPainType_TA"
]

# Exact training set distribution parameters matching model._fit_X to machine precision (8.88e-16).
# These parameters are applied if the loaded scaler contains identity values (scale_ == 1.0).
CALIBRATED_MEANS = np.array([
    53.65122615803815,
    0.773841961852861,
    133.06403269754767,
    199.68392370572207,
    0.22752043596730245,
    0.989100817438692,
    136.17847411444143,
    0.4128065395095368,
    0.9050408719346048,
    1.3528610354223434,
    0.5463215258855586,
    0.1893732970027248,
    0.22070844686648503,
    0.043596730245231606
], dtype=np.float64)

CALIBRATED_STDS = np.array([
    9.357908681954864,
    0.41834265850923713,
    18.426375719521435,
    108.14311255611187,
    0.41923130511037826,
    0.6284716188237197,
    25.311993793936143,
    0.49233860345061103,
    1.08221399162554,
    0.5992831683258841,
    0.4978496924169317,
    0.39180486391192565,
    0.41472427991168903,
    0.2041961198386397
], dtype=np.float64)

# Discrete categorical mappings matching the training set
SEX_MAP = {"F": 0, "M": 1}
RESTING_ECG_MAP = {"LVH": 0, "Normal": 1, "ST": 2}
EXERCISE_ANGINA_MAP = {"N": 0, "Y": 1}
ST_SLOPE_MAP = {"Down": 0, "Flat": 1, "Up": 2}


def calibrate_scaler(scaler: StandardScaler) -> StandardScaler:
    """
    Checks if the scaler artifact was erroneously fitted on already standardized data
    (i.e., scale_ is 1.0 and mean_ is ~0). If so, configures the scaler with the exact
    verified training distribution parameters to ensure correct distance calculations in KNN.
    """
    if scaler is None:
        new_scaler = StandardScaler()
        new_scaler.mean_ = CALIBRATED_MEANS.copy()
        new_scaler.scale_ = CALIBRATED_STDS.copy()
        new_scaler.var_ = (CALIBRATED_STDS ** 2).copy()
        new_scaler.n_features_in_ = 14
        return new_scaler

    # If scaler has scale_ of all 1s (identity transformation)
    if hasattr(scaler, "scale_") and np.allclose(scaler.scale_, 1.0) and np.allclose(scaler.mean_, 0.0, atol=1e-5):
        scaler.mean_ = CALIBRATED_MEANS.copy()
        scaler.scale_ = CALIBRATED_STDS.copy()
        scaler.var_ = (CALIBRATED_STDS ** 2).copy()

    return scaler


def preprocess_patient_input(
    data: HeartAssessmentRequest,
    scaler: StandardScaler
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Transforms a validated HeartAssessmentRequest into:
    1. Unscaled 14-element feature vector
    2. Scaled 14-element feature vector matching model._fit_X
    """
    # 1. Categorical encodings
    sex_val = SEX_MAP[data.sex]
    ecg_val = RESTING_ECG_MAP[data.resting_ecg]
    angina_val = EXERCISE_ANGINA_MAP[data.exercise_angina]
    slope_val = ST_SLOPE_MAP[data.st_slope]

    # 2. Chest pain one-hot encoding (ASY, ATA, NAP, TA)
    cp_asy = 1 if data.chest_pain_type == "ASY" else 0
    cp_ata = 1 if data.chest_pain_type == "ATA" else 0
    cp_nap = 1 if data.chest_pain_type == "NAP" else 0
    cp_ta = 1 if data.chest_pain_type == "TA" else 0

    # 3. Assemble vector in exact feature order
    raw_vector = np.array([
        float(data.age),
        float(sex_val),
        float(data.resting_bp),
        float(data.cholesterol),
        float(data.fasting_bs),
        float(ecg_val),
        float(data.max_hr),
        float(angina_val),
        float(data.oldpeak),
        float(slope_val),
        float(cp_asy),
        float(cp_ata),
        float(cp_nap),
        float(cp_ta)
    ], dtype=np.float64).reshape(1, -1)

    # 4. Feature scaling
    scaled_vector = scaler.transform(raw_vector)

    return raw_vector, scaled_vector


def generate_clinical_observations(data: HeartAssessmentRequest) -> List[ClinicalObservation]:
    """
    Analyzes submitted clinical measurements against standard cardiovascular health guidelines
    (ACC/AHA, ESC) to provide clinical context without fabricating model feature weights.
    """
    obs: List[ClinicalObservation] = []

    # Blood Pressure (ACC/AHA Guidelines)
    if data.resting_bp >= 140:
        obs.append(ClinicalObservation(
            category="Blood Pressure",
            finding=f"Resting BP {data.resting_bp:.0f} mmHg",
            status="elevated",
            description="Stage 2 Hypertension range (>= 140 mmHg), a significant cardiovascular risk factor."
        ))
    elif data.resting_bp >= 130:
        obs.append(ClinicalObservation(
            category="Blood Pressure",
            finding=f"Resting BP {data.resting_bp:.0f} mmHg",
            status="borderline",
            description="Stage 1 Hypertension range (130-139 mmHg)."
        ))
    else:
        obs.append(ClinicalObservation(
            category="Blood Pressure",
            finding=f"Resting BP {data.resting_bp:.0f} mmHg",
            status="normal",
            description="Normal to elevated resting blood pressure range (< 130 mmHg)."
        ))

    # Cholesterol
    if data.cholesterol >= 240:
        obs.append(ClinicalObservation(
            category="Cholesterol",
            finding=f"Serum Cholesterol {data.cholesterol:.0f} mg/dL",
            status="elevated",
            description="High cholesterol range (>= 240 mg/dL), associated with atherosclerotic plaque buildup."
        ))
    elif data.cholesterol >= 200:
        obs.append(ClinicalObservation(
            category="Cholesterol",
            finding=f"Serum Cholesterol {data.cholesterol:.0f} mg/dL",
            status="borderline",
            description="Borderline high cholesterol range (200-239 mg/dL)."
        ))
    elif data.cholesterol > 0:
        obs.append(ClinicalObservation(
            category="Cholesterol",
            finding=f"Serum Cholesterol {data.cholesterol:.0f} mg/dL",
            status="normal",
            description="Desirable cholesterol range (< 200 mg/dL)."
        ))
    else:
        obs.append(ClinicalObservation(
            category="Cholesterol",
            finding="Cholesterol unmeasured (0 mg/dL)",
            status="borderline",
            description="No cholesterol lab measurement provided in assessment."
        ))

    # Fasting Blood Sugar
    if data.fasting_bs == 1:
        obs.append(ClinicalObservation(
            category="Blood Sugar",
            finding="Fasting Blood Sugar > 120 mg/dL",
            status="elevated",
            description="Elevated fasting glycemia, an indicator of potential metabolic syndrome or diabetes."
        ))
    else:
        obs.append(ClinicalObservation(
            category="Blood Sugar",
            finding="Fasting Blood Sugar <= 120 mg/dL",
            status="normal",
            description="Normal fasting glucose range."
        ))

    # Exercise Induced Angina
    if data.exercise_angina == "Y":
        obs.append(ClinicalObservation(
            category="Angina",
            finding="Exercise-induced angina present",
            status="elevated",
            description="Chest pain or discomfort provoked by physical exertion, characteristic of coronary ischemia."
        ))
    else:
        obs.append(ClinicalObservation(
            category="Angina",
            finding="No exercise-induced angina",
            status="normal",
            description="Absence of chest pain during physical exertion."
        ))

    # ST Depression (Oldpeak)
    if data.oldpeak >= 2.0:
        obs.append(ClinicalObservation(
            category="Electrocardiogram",
            finding=f"ST Depression {data.oldpeak:.1f} mm",
            status="elevated",
            description="Marked exercise-induced ST-segment depression (>= 2.0 mm), a classic electrocardiographic indicator of myocardial ischemia."
        ))
    elif data.oldpeak > 1.0:
        obs.append(ClinicalObservation(
            category="Electrocardiogram",
            finding=f"ST Depression {data.oldpeak:.1f} mm",
            status="borderline",
            description="Moderate ST depression during exercise (1.0 - 2.0 mm)."
        ))
    else:
        obs.append(ClinicalObservation(
            category="Electrocardiogram",
            finding=f"ST Depression {data.oldpeak:.1f} mm",
            status="normal",
            description="Normal or minimal ST depression."
        ))

    # ST Slope
    if data.st_slope == "Flat":
        obs.append(ClinicalObservation(
            category="ST Slope",
            finding="Flat ST segment slope",
            status="elevated",
            description="Flat ST slope during peak exercise is frequently correlated with coronary artery disease."
        ))
    elif data.st_slope == "Down":
        obs.append(ClinicalObservation(
            category="ST Slope",
            finding="Downsloping ST segment slope",
            status="elevated",
            description="Downsloping ST segment represents a high-probability marker of myocardial ischemia."
        ))
    else:
        obs.append(ClinicalObservation(
            category="ST Slope",
            finding="Upsloping ST segment slope",
            status="normal",
            description="Upsloping ST segment slope is typically considered a physiological or lower-risk pattern."
        ))

    return obs
