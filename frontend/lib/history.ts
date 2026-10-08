import { AssessmentHistoryItem, PredictionResponse, HeartAssessmentData } from "./types";

const HISTORY_STORAGE_KEY = "heartguard_assessment_history_v1";

export function getLocalHistory(): AssessmentHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read assessment history from localStorage:", e);
    return [];
  }
}

export function saveAssessmentToHistory(
  input: HeartAssessmentData,
  result: PredictionResponse
): AssessmentHistoryItem[] {
  if (typeof window === "undefined") return [];

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const newItem: AssessmentHistoryItem = {
    id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    dateFormatted,
    age: input.age,
    sex: input.sex === "M" ? "Male" : "Female",
    riskPercentage: result.confidence_percentage,
    riskCategory: result.risk_category,
    riskLevel: result.risk_level,
    submittedValues: result.submitted_values,
    clinicalObservations: result.clinical_observations,
  };

  const existing = getLocalHistory();
  const updated = [newItem, ...existing].slice(0, 50); // Keep 50 most recent

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to write assessment history to localStorage:", e);
  }

  return updated;
}

export function clearLocalHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear assessment history from localStorage:", e);
  }
}
