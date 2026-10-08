"use client";

import React, { useState } from "react";
import {
  Heart,
  User,
  Activity,
  FlaskConical,
  Zap,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { HeartAssessmentData, PredictionResponse } from "../lib/types";
import { predictRisk, ApiError } from "../lib/api";

interface AssessmentFormProps {
  onSuccess: (result: PredictionResponse, input: HeartAssessmentData) => void;
}

const PRESETS: { label: string; description: string; data: HeartAssessmentData }[] = [
  {
    label: "Low Risk Sample",
    description: "Younger patient, normotensive, normal ECG, upsloping ST",
    data: {
      age: 34,
      sex: "F",
      chest_pain_type: "ATA",
      resting_bp: 118,
      cholesterol: 182,
      fasting_bs: 0,
      resting_ecg: "Normal",
      max_hr: 172,
      exercise_angina: "N",
      oldpeak: 0.0,
      st_slope: "Up",
    },
  },
  {
    label: "Moderate Risk Sample",
    description: "Middle-aged patient, borderline BP & cholesterol",
    data: {
      age: 52,
      sex: "M",
      chest_pain_type: "NAP",
      resting_bp: 138,
      cholesterol: 235,
      fasting_bs: 0,
      resting_ecg: "Normal",
      max_hr: 144,
      exercise_angina: "N",
      oldpeak: 1.0,
      st_slope: "Flat",
    },
  },
  {
    label: "Elevated Risk Sample",
    description: "Older patient, hypertension, asymptomatic, ST depression",
    data: {
      age: 62,
      sex: "M",
      chest_pain_type: "ASY",
      resting_bp: 155,
      cholesterol: 268,
      fasting_bs: 1,
      resting_ecg: "LVH",
      max_hr: 115,
      exercise_angina: "Y",
      oldpeak: 2.4,
      st_slope: "Down",
    },
  },
];

export function AssessmentForm({ onSuccess }: AssessmentFormProps) {
  const [formData, setFormData] = useState<HeartAssessmentData>({
    age: 54,
    sex: "M",
    chest_pain_type: "ASY",
    resting_bp: 130,
    cholesterol: 220,
    fasting_bs: 0,
    resting_ecg: "Normal",
    max_hr: 140,
    exercise_angina: "N",
    oldpeak: 1.0,
    st_slope: "Flat",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[] | null>(null);

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormData({ ...preset.data });
    setErrorMessage(null);
    setErrorDetails(null);
  };

  const handleChange = (field: keyof HeartAssessmentData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errorMessage) {
      setErrorMessage(null);
      setErrorDetails(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setErrorDetails(null);

    // Validation
    if (formData.age < 18 || formData.age > 120) {
      setErrorMessage("Patient age must be between 18 and 120 years.");
      setIsLoading(false);
      return;
    }
    if (formData.resting_bp < 60 || formData.resting_bp > 250) {
      setErrorMessage("Resting blood pressure must be between 60 and 250 mmHg.");
      setIsLoading(false);
      return;
    }
    if (formData.cholesterol < 0 || formData.cholesterol > 700) {
      setErrorMessage("Serum cholesterol must be between 0 and 700 mg/dL.");
      setIsLoading(false);
      return;
    }
    if (formData.max_hr < 50 || formData.max_hr > 230) {
      setErrorMessage("Maximum heart rate must be between 50 and 230 bpm.");
      setIsLoading(false);
      return;
    }
    if (formData.oldpeak < -3.0 || formData.oldpeak > 7.0) {
      setErrorMessage("Exercise ST depression (oldpeak) must be between -3.0 and 7.0 mm.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await predictRisk(formData);
      setIsLoading(false);
      onSuccess(response, formData);
    } catch (err: any) {
      setIsLoading(false);
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        setErrorDetails(err.details || null);
      } else {
        setErrorMessage(
          "Unable to complete the assessment. Please check that the prediction service is running and try again."
        );
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden transition-colors duration-300">
      {/* Form Header */}
      <div className="p-6 sm:p-8 border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase bg-emerald-500/20 px-3 py-1 rounded-md border border-emerald-500/35 backdrop-blur-md">
              Clinical Assessment Form
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              Enter Health Indicators
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Provide clinical measurements for standardized feature normalization and risk calculation.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-white/50 dark:bg-emerald-950/40 backdrop-blur-md text-xs font-bold text-slate-800 dark:text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer shadow-xs"
                title={p.description}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl border border-rose-500/35 bg-rose-500/15 backdrop-blur-xl text-rose-950 dark:text-rose-200 text-sm space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{errorMessage}</p>
                {errorDetails && errorDetails.length > 0 && (
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-rose-800 dark:text-rose-300">
                    {errorDetails.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-emerald-300">
              1. Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Age */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-age" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Age
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Years (18-120)
                </span>
              </div>
              <input
                id="input-age"
                type="number"
                min={18}
                max={120}
                required
                value={formData.age}
                onChange={(e) => handleChange("age", parseInt(e.target.value) || 0)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
                placeholder="e.g. 54"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Chronological age in completed years.
              </p>
            </div>

            {/* Sex */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-sex" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Biological Sex
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Clinical factor
                </span>
              </div>
              <select
                id="input-sex"
                value={formData.sex}
                onChange={(e) => handleChange("sex", e.target.value as "M" | "F")}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              >
                <option value="M" className="dark:bg-[#07170e]">Male</option>
                <option value="F" className="dark:bg-[#07170e]">Female</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Biological sex assigned at birth (used by epidemiological risk formulas).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Cardiovascular Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-emerald-300">
              2. Cardiovascular Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Chest Pain Type */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-chest-pain" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Chest Pain Type
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Symptom categorization
                </span>
              </div>
              <select
                id="input-chest-pain"
                value={formData.chest_pain_type}
                onChange={(e) =>
                  handleChange("chest_pain_type", e.target.value as "ASY" | "ATA" | "NAP" | "TA")
                }
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              >
                <option value="ASY" className="dark:bg-[#07170e]">Asymptomatic (ASY) — No subjective chest discomfort or silent ischemia</option>
                <option value="ATA" className="dark:bg-[#07170e]">Atypical Angina (ATA) — Chest discomfort without all classical angina hallmarks</option>
                <option value="NAP" className="dark:bg-[#07170e]">Non-Anginal Pain (NAP) — Pain unlikely to stem from coronary arteries</option>
                <option value="TA" className="dark:bg-[#07170e]">Typical Angina (TA) — Classic exertional substernal pressure or squeezing</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Clinical classification of chest discomfort. Asymptomatic presentations still bear significant predictive value.
              </p>
            </div>

            {/* Resting Blood Pressure */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-bp" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Resting Blood Pressure
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  mmHg (60-250)
                </span>
              </div>
              <input
                id="input-bp"
                type="number"
                min={60}
                max={250}
                required
                value={formData.resting_bp}
                onChange={(e) => handleChange("resting_bp", parseFloat(e.target.value) || 0)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
                placeholder="e.g. 130"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Resting systolic arterial blood pressure measured upon admission (mmHg).
              </p>
            </div>

            {/* Maximum Heart Rate */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-maxhr" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Maximum Heart Rate
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  bpm (50-230)
                </span>
              </div>
              <input
                id="input-maxhr"
                type="number"
                min={50}
                max={230}
                required
                value={formData.max_hr}
                onChange={(e) => handleChange("max_hr", parseFloat(e.target.value) || 0)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
                placeholder="e.g. 145"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Maximum heart rate reached during cardiovascular exercise stress testing (bpm).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Laboratory Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-emerald-300">
              3. Laboratory Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Cholesterol */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-chol" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Serum Cholesterol
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  mg/dL (0-700)
                </span>
              </div>
              <input
                id="input-chol"
                type="number"
                min={0}
                max={700}
                required
                value={formData.cholesterol}
                onChange={(e) => handleChange("cholesterol", parseFloat(e.target.value) || 0)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
                placeholder="e.g. 220"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Total serum cholesterol (mg/dL). Enter 0 if unmeasured.
              </p>
            </div>

            {/* Fasting Blood Sugar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-fbs" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Fasting Blood Sugar
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  &gt; 120 mg/dL
                </span>
              </div>
              <select
                id="input-fbs"
                value={formData.fasting_bs}
                onChange={(e) => handleChange("fasting_bs", parseInt(e.target.value) as 0 | 1)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              >
                <option value={0} className="dark:bg-[#07170e]">&le; 120 mg/dL (Normal fasting glucose)</option>
                <option value={1} className="dark:bg-[#07170e]">&gt; 120 mg/dL (Elevated Glycemia)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Indicator whether fasting glucose exceeds 120 mg/dL.
              </p>
            </div>

            {/* Resting ECG */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-ecg" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Resting ECG
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Electrocardiogram
                </span>
              </div>
              <select
                id="input-ecg"
                value={formData.resting_ecg}
                onChange={(e) =>
                  handleChange("resting_ecg", e.target.value as "Normal" | "LVH" | "ST")
                }
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              >
                <option value="Normal" className="dark:bg-[#07170e]">Normal — No baseline abnormalities</option>
                <option value="LVH" className="dark:bg-[#07170e]">LVH — Left Ventricular Hypertrophy</option>
                <option value="ST" className="dark:bg-[#07170e]">ST — ST-T Wave Abnormality</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Resting 12-lead electrocardiographic evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Exercise Stress Testing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-emerald-300">
              4. Exercise Stress Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Exercise Angina */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-angina" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Exercise Angina
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Exertional pain
                </span>
              </div>
              <select
                id="input-angina"
                value={formData.exercise_angina}
                onChange={(e) => handleChange("exercise_angina", e.target.value as "N" | "Y")}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              >
                <option value="N" className="dark:bg-[#07170e]">No — No chest pain during exercise</option>
                <option value="Y" className="dark:bg-[#07170e]">Yes — Exertion provokes chest pain</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Presence of exertional angina during stress test.
              </p>
            </div>

            {/* Oldpeak (ST Depression) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-oldpeak" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Exercise ST Depression
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  mm (-3.0 to 7.0)
                </span>
              </div>
              <input
                id="input-oldpeak"
                type="number"
                step="0.1"
                min={-3.0}
                max={7.0}
                required
                value={formData.oldpeak}
                onChange={(e) => handleChange("oldpeak", parseFloat(e.target.value) || 0)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
                placeholder="e.g. 1.0"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                ST depression induced by exercise relative to rest (Oldpeak, mm).
              </p>
            </div>

            {/* ST Slope */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-slope" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Peak ST Slope
                </label>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  ECG vector
                </span>
              </div>
              <select
                id="input-slope"
                value={formData.st_slope}
                onChange={(e) =>
                  handleChange("st_slope", e.target.value as "Up" | "Flat" | "Down")
                }
                className="glass-input w-full px-4 py-2.5 rounded-xl text-slate-900 dark:text-emerald-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              >
                <option value="Up" className="dark:bg-[#07170e]">Upsloping — Physiological rise</option>
                <option value="Flat" className="dark:bg-[#07170e]">Flat — Horizontal ischemic signal</option>
                <option value="Down" className="dark:bg-[#07170e]">Downsloping — High ischemic risk</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Slope geometry of the peak exercise ST segment.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated through direct ML inference using normalized clinical features.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.45)] border border-emerald-400/40 backdrop-blur-md disabled:bg-slate-400 disabled:cursor-not-allowed active:scale-[0.99] transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing your information...</span>
              </>
            ) : (
              <>
                <span>Predict Risk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
