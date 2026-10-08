"""
Model manager for HeartGuard.
Loads trained ML artifacts (heart_model.pkl, heart_scaler.pkl, heart_encoder.pkl)
at application startup and provides thread-safe access.
"""

import os
from pathlib import Path
import logging
from typing import Optional, List, Any
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

from app.preprocessing import calibrate_scaler

logger = logging.getLogger("heartguard.model")

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODELS_DIR / "heart_model.pkl"
SCALER_PATH = MODELS_DIR / "heart_scaler.pkl"
ENCODER_PATH = MODELS_DIR / "heart_encoder.pkl"


class ModelContainer:
    _instance: Optional["ModelContainer"] = None

    def __init__(self):
        self.model: Optional[KNeighborsClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.encoder: Optional[List[str]] = None
        self.is_loaded: bool = False

    @classmethod
    def get_instance(cls) -> "ModelContainer":
        if cls._instance is None:
            cls._instance = ModelContainer()
        return cls._instance

    def load_artifacts(self) -> None:
        """
        Loads all three artifacts at startup. Fails explicitly if any file is missing or corrupted.
        """
        logger.info("Initializing HeartGuard ML artifacts...")

        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}")
        if not SCALER_PATH.exists():
            raise FileNotFoundError(f"Scaler artifact not found at {SCALER_PATH}")
        if not ENCODER_PATH.exists():
            raise FileNotFoundError(f"Encoder artifact not found at {ENCODER_PATH}")

        try:
            self.model = joblib.load(MODEL_PATH)
            logger.info(f"Loaded ML model: {type(self.model).__name__} (k={getattr(self.model, 'n_neighbors', 'N/A')})")
        except Exception as e:
            raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

        try:
            raw_scaler = joblib.load(SCALER_PATH)
            self.scaler = calibrate_scaler(raw_scaler)
            logger.info("Loaded and calibrated feature scaler.")
        except Exception as e:
            raise RuntimeError(f"Failed to load scaler from {SCALER_PATH}: {e}")

        try:
            self.encoder = joblib.load(ENCODER_PATH)
            logger.info(f"Loaded feature encoder definitions ({len(self.encoder)} columns).")
        except Exception as e:
            raise RuntimeError(f"Failed to load encoder from {ENCODER_PATH}: {e}")

        # Perform a startup verification inference
        try:
            dummy_sample = self.model._fit_X[:1]
            test_pred = self.model.predict(dummy_sample)
            test_proba = self.model.predict_proba(dummy_sample)
            logger.info(f"Startup model verification test passed! (Test pred: {test_pred[0]}, proba: {test_proba[0]})")
        except Exception as e:
            raise RuntimeError(f"Model verification check failed: {e}")

        self.is_loaded = True


def get_model() -> KNeighborsClassifier:
    container = ModelContainer.get_instance()
    if not container.is_loaded or container.model is None:
        raise RuntimeError("ML model has not been loaded.")
    return container.model


def get_scaler() -> StandardScaler:
    container = ModelContainer.get_instance()
    if not container.is_loaded or container.scaler is None:
        raise RuntimeError("Scaler has not been loaded.")
    return container.scaler


def get_encoder() -> List[str]:
    container = ModelContainer.get_instance()
    if not container.is_loaded or container.encoder is None:
        raise RuntimeError("Encoder has not been loaded.")
    return container.encoder
