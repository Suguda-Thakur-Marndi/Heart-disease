"""
HeartGuard FastAPI Application.
Production-ready API for ML-driven cardiovascular risk assessment.
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    HeartAssessmentRequest,
    PredictionResponse,
    HealthResponse,
    ModelFeatureMetadata
)
from app.model import ModelContainer, get_model, get_scaler, get_encoder
from app.prediction import run_prediction

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("heartguard.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML model artifacts once
    logger.info("Initializing HeartGuard application lifespan...")
    container = ModelContainer.get_instance()
    container.load_artifacts()
    logger.info("HeartGuard application ready to serve predictions.")
    yield
    # Shutdown
    logger.info("HeartGuard application shutting down.")


app = FastAPI(
    title="HeartGuard API",
    description="Machine Learning API for Cardiovascular Risk Estimation",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

@app.get("/docs", include_in_schema=False)
async def docs_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/api/docs")

@app.get("/openapi.json", include_in_schema=False)
async def openapi_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/api/openapi.json")

# CORS Configuration
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permissive for local development across ports
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# Safe Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles Pydantic validation errors and returns user-friendly error details
    without leaking internal code paths.
    """
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{loc}: {msg}" if loc else msg)

    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "The submitted health data contains invalid or missing values.",
            "details": error_messages
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Invalid Input",
            "message": str(exc)
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "Unable to complete the risk assessment. Please check that the input data is valid and try again."
        }
    )


@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint verifying model readiness.
    """
    container = ModelContainer.get_instance()
    return HealthResponse(
        status="healthy" if container.is_loaded else "degraded",
        model_loaded=container.model is not None,
        scaler_loaded=container.scaler is not None,
        encoder_loaded=container.encoder is not None,
        model_type=type(container.model).__name__ if container.model else "None",
        features_count=len(container.encoder) if container.encoder else 0,
        version="1.0.0"
    )


@app.post("/api/predict", response_model=PredictionResponse)
@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(request: HeartAssessmentRequest):
    """
    Executes cardiovascular risk prediction based on submitted health parameters.
    """
    return run_prediction(request)


@app.get("/api/model-info")
@app.get("/model-info")
async def get_model_info():
    """
    Returns clinical input specifications dynamically derived from the trained model.
    """
    encoder = get_encoder()
    model = get_model()

    return {
        "model_name": "HeartGuard Risk Classifier",
        "algorithm": "K-Nearest Neighbors (k=5)",
        "features_count": len(encoder),
        "target_classes": [
            {"code": 0, "label": "Lower Estimated Risk"},
            {"code": 1, "label": "Elevated Estimated Risk"}
        ],
        "input_fields": [
            {
                "id": "age",
                "label": "Age",
                "category": "Personal Information",
                "unit": "Years",
                "type": "number",
                "min": 18,
                "max": 120,
                "step": 1,
                "default": 54,
                "description": "Patient chronological age in completed years."
            },
            {
                "id": "sex",
                "label": "Biological Sex",
                "category": "Personal Information",
                "unit": None,
                "type": "select",
                "options": [
                    {"value": "M", "label": "Male"},
                    {"value": "F", "label": "Female"}
                ],
                "default": "M",
                "description": "Biological sex at birth."
            },
            {
                "id": "chest_pain_type",
                "label": "Chest Pain Type",
                "category": "Cardiovascular Information",
                "unit": None,
                "type": "select",
                "options": [
                    {"value": "ASY", "label": "Asymptomatic (ASY) - Silent or no chest pain"},
                    {"value": "ATA", "label": "Atypical Angina (ATA) - Discomfort without classic angina signs"},
                    {"value": "NAP", "label": "Non-Anginal Pain (NAP) - Pain unlikely to be heart-related"},
                    {"value": "TA", "label": "Typical Angina (TA) - Classic exertional substernal pressure"}
                ],
                "default": "ASY",
                "description": "Clinical classification of chest discomfort or pain symptoms."
            },
            {
                "id": "resting_bp",
                "label": "Resting Blood Pressure",
                "category": "Cardiovascular Information",
                "unit": "mmHg",
                "type": "number",
                "min": 60,
                "max": 250,
                "step": 1,
                "default": 130,
                "description": "Systolic resting blood pressure upon admission."
            },
            {
                "id": "cholesterol",
                "label": "Serum Cholesterol",
                "category": "Laboratory Information",
                "unit": "mg/dL",
                "type": "number",
                "min": 0,
                "max": 700,
                "step": 1,
                "default": 220,
                "description": "Total serum cholesterol level (enter 0 if unmeasured)."
            },
            {
                "id": "fasting_bs",
                "label": "Fasting Blood Sugar",
                "category": "Laboratory Information",
                "unit": None,
                "type": "select",
                "options": [
                    {"value": 0, "label": "<= 120 mg/dL (Normal fasting glucose)"},
                    {"value": 1, "label": "> 120 mg/dL (Elevated fasting blood sugar)"}
                ],
                "default": 0,
                "description": "Indicator whether fasting blood sugar exceeds 120 mg/dL."
            },
            {
                "id": "resting_ecg",
                "label": "Resting Electrocardiogram (ECG)",
                "category": "Laboratory Information",
                "unit": None,
                "type": "select",
                "options": [
                    {"value": "Normal", "label": "Normal - No resting abnormalities"},
                    {"value": "LVH", "label": "LVH - Showing probable or definite left ventricular hypertrophy"},
                    {"value": "ST", "label": "ST - ST-T wave abnormalities (T wave inversions or ST depression)"}
                ],
                "default": "Normal",
                "description": "Resting 12-lead electrocardiographic evaluation."
            },
            {
                "id": "max_hr",
                "label": "Maximum Heart Rate Achieved",
                "category": "Cardiovascular Information",
                "unit": "bpm",
                "type": "number",
                "min": 50,
                "max": 230,
                "step": 1,
                "default": 140,
                "description": "Peak heart rate reached during treadmill exercise stress testing."
            },
            {
                "id": "exercise_angina",
                "label": "Exercise-Induced Angina",
                "category": "Exercise Information",
                "unit": None,
                "type": "select",
                "options": [
                    {"value": "N", "label": "No (No chest discomfort during exercise)"},
                    {"value": "Y", "label": "Yes (Chest pain or pressure provoked by exercise)"}
                ],
                "default": "N",
                "description": "Presence of angina provoked by exercise stress testing."
            },
            {
                "id": "oldpeak",
                "label": "ST Depression (Oldpeak)",
                "category": "Exercise Information",
                "unit": "mm",
                "type": "number",
                "min": -3.0,
                "max": 7.0,
                "step": 0.1,
                "default": 1.0,
                "description": "ST depression induced by exercise relative to rest."
            },
            {
                "id": "st_slope",
                "label": "Peak Exercise ST Slope",
                "category": "Exercise Information",
                "unit": None,
                "type": "select",
                "options": [
                    {"value": "Up", "label": "Upsloping - Physiological elevation during exertion"},
                    {"value": "Flat", "label": "Flat - Horizontal ST segment indicating ischemic risk"},
                    {"value": "Down", "label": "Downsloping - High-risk electrocardiographic marker"}
                ],
                "default": "Flat",
                "description": "The slope of the peak exercise ST segment."
            }
        ]
    }
