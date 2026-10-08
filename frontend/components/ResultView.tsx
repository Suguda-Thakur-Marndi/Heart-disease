"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  History,
  Activity,
  HeartPulse,
  Info,
  ArrowRight,
  Stethoscope,
  Printer,
  Sparkles,
} from "lucide-react";
import { PredictionResponse, HeartAssessmentData } from "../lib/types";
import { MedicalDisclaimer } from "./MedicalDisclaimer";

interface ResultViewProps {
  result: PredictionResponse;
  inputData: HeartAssessmentData;
  onRetake: () => void;
  onViewDashboard: () => void;
}

export function ResultView({ result, inputData, onRetake, onViewDashboard }: ResultViewProps) {
  const isElevated = result.prediction === 1 || result.confidence_percentage >= 50;
  const isModerate = result.confidence_percentage >= 35 && result.confidence_percentage < 50;

  const gaugeStrokeColor = isElevated ? "#f43f5e" : isModerate ? "#f59e0b" : "#10b981";

  // Calculate circular gauge parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (result.confidence_percentage / 100) * circumference;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner Alert if elevated */}
      <MedicalDisclaimer elevatedRiskAlert={isElevated} />

      {/* Main Result Card */}
      <div className="glass-card rounded-3xl overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-500/15 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase bg-emerald-500/20 px-3 py-1 rounded-md border border-emerald-500/35 backdrop-blur-md">
              Assessment Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              Cardiovascular Risk Estimate
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-400/80 mt-0.5 font-medium">
              Algorithm: {result.model_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-white/50 dark:bg-emerald-950/40 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-emerald-200 hover:bg-emerald-500/15 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Print</span>
            </button>
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-white/50 dark:bg-emerald-950/40 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-emerald-200 hover:bg-emerald-500/15 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Retake</span>
            </button>
          </div>
        </div>

        {/* Central Risk Visualization */}
        <div className="p-6 sm:p-10 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border-b border-emerald-500/15">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Circular Gauge */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    className="text-slate-200/80 dark:text-emerald-950/60"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={gaugeStrokeColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 12px ${gaugeStrokeColor}77)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {result.confidence_percentage}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mt-1">
                    Estimated Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Interpretation Column */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold text-xs shadow-xs backdrop-blur-md">
                {isElevated ? (
                  <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-500/20 border border-rose-500/35 px-3 py-1 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    Elevated Estimated Risk
                  </span>
                ) : isModerate ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-500/20 border border-amber-500/35 px-3 py-1 rounded-lg">
                    <Info className="w-4 h-4" />
                    Moderate Estimated Risk
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/35 px-3 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    Lower Estimated Risk
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {isElevated
                    ? "The model estimates an elevated risk based on the information provided."
                    : isModerate
                    ? "The model estimates a moderate cardiovascular risk profile."
                    : "The model estimates a lower cardiovascular risk profile."}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  This calculation reflects nearest-neighbor similarities across 14 standardized
                  clinical parameters. This result is an estimate generated by a machine-learning
                  model and is not a medical diagnosis.
                </p>
              </div>

              {/* Nearest Neighbor Votes */}
              <div className="glass-subcard p-4 rounded-2xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-emerald-200">
                    Reference Cases Voting:
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {result.neighbor_votes.lower_risk_cases} Lower Risk
                  </span>
                  <span className="text-slate-300 dark:text-emerald-800">|</span>
                  <span className="text-rose-600 dark:text-rose-400">
                    {result.neighbor_votes.elevated_risk_cases} Elevated Risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: What influenced this estimate? (Requirement 12) */}
        <div className="p-6 sm:p-8 border-b border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              What influenced this estimate?
            </h3>
          </div>

          <div className="glass-subcard p-4 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
            <p className="font-bold text-slate-900 dark:text-white">
              Machine Learning Methodology &amp; Reference Comparison
            </p>
            <p>
              The prediction is based on the combination of health characteristics provided to the
              machine-learning model. Because the algorithm is an instance-based K-Nearest Neighbors
              classifier (k=5), it does not generate arbitrary regression weights or fabricated SHAP
              scores. Instead, it locates the 5 closest clinical profiles in the 14-dimensional reference space.
            </p>
          </div>

          {/* Clinical Observations based on ACC/AHA guidelines */}
          {result.clinical_observations && result.clinical_observations.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Observed Health Factor Findings (ACC/AHA Criteria)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.clinical_observations.map((obs, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs backdrop-blur-xl ${
                      obs.status === "elevated"
                        ? "bg-rose-500/15 border-rose-500/35 text-rose-950 dark:text-rose-200"
                        : obs.status === "borderline"
                        ? "bg-amber-500/15 border-amber-500/35 text-amber-950 dark:text-amber-200"
                        : "bg-emerald-500/15 border-emerald-500/35 text-emerald-950 dark:text-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{obs.finding}</span>
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/60 dark:bg-black/35 border border-current">
                        {obs.status}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{obs.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section: Your Assessment Summary (Requirement 10) */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Your Assessment Parameters
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Submitted Values</span>
          </div>

          <div className="border border-emerald-500/25 rounded-2xl overflow-hidden glass-subcard">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-500/20">
              <div className="divide-y divide-emerald-500/20">
                {Object.entries(result.submitted_values)
                  .slice(0, 6)
                  .map(([key, val]) => (
                    <div key={key} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{key}</span>
                      <span className="text-slate-900 dark:text-emerald-100 font-bold text-right">{val}</span>
                    </div>
                  ))}
              </div>
              <div className="divide-y divide-emerald-500/20">
                {Object.entries(result.submitted_values)
                  .slice(6)
                  .map(([key, val]) => (
                    <div key={key} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{key}</span>
                      <span className="text-slate-900 dark:text-emerald-100 font-bold text-right">{val}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 bg-emerald-500/10 dark:bg-emerald-500/15 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onRetake}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-emerald-500/35 bg-white/60 dark:bg-emerald-950/45 backdrop-blur-md text-slate-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-500/20 transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Start New Assessment</span>
          </button>

          <button
            onClick={onViewDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/35 backdrop-blur-md transition-all"
          >
            <History className="w-3.5 h-3.5" />
            <span>View History &amp; Risk Trend</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
