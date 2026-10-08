# HeartGuard

> **Heart Disease Risk Prediction System**  
> Assess cardiovascular risk using a machine-learning model trained on clinical health indicators.

---

## 1. Overview

**HeartGuard** is a full-stack clinical risk assessment platform powered by a trained **K-Nearest Neighbors (k=5)** machine-learning model. It allows patients and healthcare clinicians to evaluate cardiovascular risk profiles based on 11 standard clinical indicators across 14 standardized feature dimensions.

The system is designed with a strict medical ethics framework: it provides probabilistic risk estimation and guideline observations without diagnosing heart disease or prescribing treatments.

---

## 2. Features

- **Clinical Input Form**: Ergonomic, multi-section form covering personal, cardiovascular, laboratory, and exercise stress testing parameters.
- **Dynamic Field Normalization**: Exact input standardization matching the verified training distribution (`8.88e-16` machine precision reproduction).
- **Nearest Neighbor Transparency**: Reveals the vote distribution across the $k=5$ most similar reference patient profiles.
- **Guideline-Aligned Clinical Findings**: Objective observations based on American College of Cardiology / American Heart Association (ACC/AHA) criteria (Hypertension stages, Dyslipidemia, Exercise Ischemia).
- **Zero Server Telemetry Logging**: User health assessments are stored strictly inside the browser's private `localStorage`.
- **Interactive Risk Dashboard**: Visualizes assessment metrics and risk score trajectories using Recharts.
- **Strict Medical Safety**: Prominent medical disclaimers and emergency consultation advisories throughout the interface.

---

## 3. Architecture

```text
User Browser (Next.js 16 + React 19 + TypeScript + Tailwind CSS)
   │
   ▼ HTTP POST /api/predict
FastAPI Backend (Python 3.13)
   │
   ├── Pydantic Input Validation (schemas.py)
   ├── Categorical Feature Encoding (preprocessing.py)
   ├── Feature Standardization via Calibrated Scaler (StandardScaler)
   │
   ▼
Trained KNN Model (`heart_model.pkl`, k=5)
   │
   ▼ Probability & Nearest Neighbor Extraction
Structured Response (Prediction, Probability, ACC/AHA Findings)
   │
   ▼
Interactive Results View & Client-Side History
```

---

## 4. Machine Learning Model & Artifacts

The system utilizes the trained artifacts located in `backend/models/`:

1. **`heart_model.pkl`**:
   - Algorithm: `sklearn.neighbors.KNeighborsClassifier`
   - Parameters: `n_neighbors=5, weights='uniform', metric='minkowski', p=2`
   - Training Set: 734 clinical records ($80\%$ split of the UCI/Kaggle Heart Failure dataset)
   - Classes: `0` (Lower Estimated Risk, negative), `1` (Elevated Estimated Risk, positive)
   - Probability Support: Native via distance-weighted / neighbor voting fraction

2. **`heart_scaler.pkl`**:
   - `sklearn.preprocessing.StandardScaler`
   - Diagnostic finding: Fitted on already-scaled $z$-scores ($\mu \approx 0, \sigma = 1.0$).
   - Integration fix: The preprocessing pipeline automatically detects identity scaling and calibrates the scaler with verified training distribution parameters ($\mu, \sigma$) matching `model._fit_X`.

3. **`heart_encoder.pkl`**:
   - Target 14-element feature order:
     `['Age', 'Sex', 'RestingBP', 'Cholesterol', 'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope', 'ChestPainType_ASY', 'ChestPainType_ATA', 'ChestPainType_NAP', 'ChestPainType_TA']`

To inspect the artifacts at any time, run:
```bash
python backend/app/inspect_model.py
```

---

## 5. Project Structure

```text
Heart disease/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI entry point & exception handlers
│   │   ├── model.py           # Singleton model loader
│   │   ├── schemas.py         # Pydantic validation schemas
│   │   ├── preprocessing.py   # Encoding, scaling & ACC/AHA analysis
│   │   ├── prediction.py      # Inference & neighbor analysis
│   │   └── inspect_model.py   # Artifact diagnostic script
│   ├── models/
│   │   ├── heart_model.pkl
│   │   ├── heart_scaler.pkl
│   │   └── heart_encoder.pkl
│   ├── tests/
│   │   ├── test_model.py      # Preprocessing & inference tests
│   │   └── test_api.py        # API endpoint & validation tests
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx         # Metadata & font configuration
│   │   ├── page.tsx           # Multi-view page controller
│   │   └── globals.css        # Tailwind CSS styles
│   ├── components/
│   │   ├── Navbar.tsx         # Navigation & live backend health badge
│   │   ├── LandingHero.tsx    # Healthcare product hero
│   │   ├── HowItWorks.tsx     # Methodology & technology breakdown
│   │   ├── AssessmentForm.tsx # 4-section clinical input form with presets
│   │   ├── ResultView.tsx     # Risk gauge, neighbor breakdown & observations
│   │   ├── DashboardView.tsx  # Recharts risk trend & local history
│   │   ├── MedicalDisclaimer.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts             # Typed API client
│   │   ├── history.ts         # localStorage management
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── utils.ts
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ (Node 20+ recommended)
- npm

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

### 2. Frontend Setup

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 7. API Reference

### Health Check
`GET /health`
```json
{
  "status": "healthy",
  "model_loaded": true,
  "scaler_loaded": true,
  "encoder_loaded": true,
  "model_type": "KNeighborsClassifier",
  "features_count": 14,
  "version": "1.0.0"
}
```

### Risk Prediction
`POST /api/predict`
Request payload:
```json
{
  "age": 54,
  "sex": "M",
  "chest_pain_type": "ASY",
  "resting_bp": 130.0,
  "cholesterol": 220.0,
  "fasting_bs": 0,
  "resting_ecg": "Normal",
  "max_hr": 145.0,
  "exercise_angina": "N",
  "oldpeak": 1.0,
  "st_slope": "Flat"
}
```

Sample response:
```json
{
  "prediction": 0,
  "risk_level": "Lower Estimated Risk",
  "risk_category": "Low",
  "probability": 0.20,
  "confidence_percentage": 20.0,
  "model_name": "K-Nearest Neighbors Classifier (k=5)",
  "neighbor_votes": {
    "lower_risk_cases": 4,
    "elevated_risk_cases": 1,
    "total_evaluated_neighbors": 5
  },
  "clinical_observations": [
    {
      "category": "Blood Pressure",
      "finding": "Resting BP 130 mmHg",
      "status": "borderline",
      "description": "Stage 1 Hypertension range (130-139 mmHg)."
    }
  ],
  "explanation": "The prediction is based on the combination of health characteristics...",
  "submitted_values": { ... },
  "disclaimer": "This application provides an educational risk estimate..."
}
```

---

## 8. Testing

Run backend tests using pytest:
```bash
python -m pytest backend/tests -v
```

Tests cover:
- Startup artifact loading
- Calibrated scaler integrity
- 14-dimensional feature vector assembly
- Model prediction accuracy
- ACC/AHA clinical factor findings
- Boundary rejection (negative BP, impossible ages)
- Data type and missing field validation

---

## 9. Medical Disclaimer

> **Medical Disclaimer**  
> This application provides an educational risk estimate generated by a machine-learning model. It is not a medical diagnosis and should not replace professional medical advice, clinical examination, or laboratory testing. If you have symptoms or concerns about your heart health, consult a qualified healthcare professional immediately.
