"use client";

import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Activity,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface LandingHeroProps {
  onStartAssessment: () => void;
  onHowItWorks: () => void;
}

export function LandingHero({ onStartAssessment, onHowItWorks }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/35 text-emerald-900 dark:text-emerald-300 text-xs font-bold backdrop-blur-xl shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Evidence-Based Clinical ML Architecture</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Understand Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  Heart Health Risk
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
                Enter your health information to receive an AI-generated heart disease risk estimate.
              </p>
            </div>

            {/* Blurred Glass Subcard */}
            <div className="glass-subcard rounded-2xl p-4 sm:p-5 text-slate-700 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
              <p className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                HeartGuard Clinical Assessment
              </p>
              Assess cardiovascular risk using a machine-learning model trained on clinical health
              indicators. Designed for educational risk profiling without substituting medical diagnostic testing.
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onStartAssessment}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-base shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-[0.99] transition-all cursor-pointer border border-emerald-400/40 backdrop-blur-md"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onHowItWorks}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-emerald-950/45 border border-emerald-500/35 text-emerald-900 dark:text-emerald-200 font-bold text-base backdrop-blur-xl hover:bg-emerald-50/80 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-emerald-500" />
              </button>
            </div>

            {/* Trust Points */}
            <div className="pt-6 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>14 Clinical Parameters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>k=5 Nearest Neighbors ML</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero Server Data Logging</span>
              </div>
            </div>
          </div>

          {/* Visual Glass Showcase Column */}
          <div className="lg:col-span-5">
            <div className="glass-card relative mx-auto max-w-md rounded-3xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      Clinical Evaluation Module
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      K-Nearest Neighbors Algorithm
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-500/35">
                  Ready
                </span>
              </div>

              {/* Sample Metrics Simulation */}
              <div className="py-4 space-y-2.5">
                <div className="glass-subcard p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Resting Blood Pressure
                    </span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">120 mmHg</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Normotensive
                  </span>
                </div>

                <div className="glass-subcard p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Serum Cholesterol
                    </span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">195 mg/dL</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Desirable
                  </span>
                </div>

                <div className="glass-subcard p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Exercise ST Segment
                    </span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      Upsloping (0.0 mm)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Physiological
                  </span>
                </div>
              </div>

              {/* Output Preview */}
              <div className="pt-3 border-t border-emerald-500/20 bg-emerald-500/15 -mx-6 -mb-6 p-5 rounded-b-3xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                      Estimated Model Risk
                    </span>
                    <p className="text-3xl font-black text-emerald-900 dark:text-emerald-300">18%</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-xs font-bold bg-emerald-500/25 text-emerald-900 dark:text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs">
                      Lower Estimated Risk
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      Based on 5 reference cases
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
