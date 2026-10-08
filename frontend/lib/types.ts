export interface HeartAssessmentData {
  age: number;
  sex: "M" | "F";
  chest_pain_type: "ASY" | "ATA" | "NAP" | "TA";
  resting_bp: number;
  cholesterol: number;
  fasting_bs: 0 | 1;
  resting_ecg: "Normal" | "LVH" | "ST";
  max_hr: number;
  exercise_angina: "N" | "Y";
  oldpeak: number;
  st_slope: "Up" | "Flat" | "Down";
}

export interface ClinicalObservation {
  category: string;
  finding: string;
  status: "normal" | "borderline" | "elevated";
  description: string;
}

export interface PredictionResponse {
  prediction: number;
  risk_level: string;
  risk_category: "Low" | "Moderate" | "High";
  probability: number;
  confidence_percentage: number;
  model_name: string;
  neighbor_votes: {
    lower_risk_cases: number;
    elevated_risk_cases: number;
    total_evaluated_neighbors: number;
  };
  clinical_observations: ClinicalObservation[];
  explanation: string;
  submitted_values: Record<string, string>;
  disclaimer: string;
}

export interface AssessmentHistoryItem {
  id: string;
  timestamp: string;
  dateFormatted: string;
  age: number;
  sex: string;
  riskPercentage: number;
  riskCategory: "Low" | "Moderate" | "High";
  riskLevel: string;
  submittedValues: Record<string, string>;
  clinicalObservations: ClinicalObservation[];
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  scaler_loaded: boolean;
  encoder_loaded: boolean;
  model_type: string;
  features_count: number;
  version: string;
}
