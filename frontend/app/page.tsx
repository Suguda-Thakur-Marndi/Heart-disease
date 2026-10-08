"use client";

import React, { useState } from "react";
import { ThemeProvider } from "../lib/theme";
import { Navbar } from "../components/Navbar";
import { LandingHero } from "../components/LandingHero";
import { HowItWorks } from "../components/HowItWorks";
import { AssessmentForm } from "../components/AssessmentForm";
import { ResultView } from "../components/ResultView";
import { DashboardView } from "../components/DashboardView";
import { MedicalDisclaimer } from "../components/MedicalDisclaimer";
import { Footer } from "../components/Footer";
import { HeartAssessmentData, PredictionResponse } from "../lib/types";
import { saveAssessmentToHistory } from "../lib/history";
import { ArrowRight } from "lucide-react";

function MainContent() {
  const [currentView, setCurrentView] = useState<"home" | "assessment" | "result" | "dashboard">("home");
  const [currentResult, setCurrentResult] = useState<PredictionResponse | null>(null);
  const [currentInput, setCurrentInput] = useState<HeartAssessmentData | null>(null);

  const handleStartAssessment = () => {
    setCurrentView("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHowItWorks = () => {
    if (currentView !== "home") {
      setCurrentView("home");
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById("how-it-works");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePredictionSuccess = (result: PredictionResponse, input: HeartAssessmentData) => {
    setCurrentResult(result);
    setCurrentInput(input);
    saveAssessmentToHistory(input, result);
    setCurrentView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-800 dark:selection:text-emerald-300 transition-colors duration-300 relative">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {currentView === "home" && (
          <div>
            <LandingHero
              onStartAssessment={handleStartAssessment}
              onHowItWorks={handleHowItWorks}
            />
            <HowItWorks />
            {/* Embedded Quick Assessment Callout with Component-wise Blurred Glass */}
            <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                  Ready to check your risk estimate?
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Start Your Cardiovascular Risk Assessment
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
                  Takes less than 2 minutes. Enter 11 clinical indicators to run predictions
                  against the verified nearest-neighbor machine-learning model.
                </p>
                <div className="pt-3">
                  <button
                    onClick={handleStartAssessment}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Launch Clinical Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === "assessment" && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
            <AssessmentForm onSuccess={handlePredictionSuccess} />
            <MedicalDisclaimer />
          </div>
        )}

        {currentView === "result" && currentResult && currentInput && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
            <ResultView
              result={currentResult}
              inputData={currentInput}
              onRetake={handleStartAssessment}
              onViewDashboard={() => {
                setCurrentView("dashboard");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}

        {currentView === "dashboard" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
            <DashboardView onStartNewAssessment={handleStartAssessment} />
            <MedicalDisclaimer />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}
