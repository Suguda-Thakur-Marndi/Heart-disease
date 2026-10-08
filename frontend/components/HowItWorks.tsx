"use client";

import React from "react";
import { ClipboardList, Cpu, GitCompare, BarChart3, ShieldCheck } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Clinical Input Collection",
      icon: ClipboardList,
      description:
        "You provide 11 essential cardiovascular parameters including age, blood pressure, serum cholesterol, fasting blood sugar, resting ECG, and exercise stress data.",
    },
    {
      number: "02",
      title: "Input Normalization & Encoding",
      icon: Cpu,
      description:
        "Categorical features (such as chest pain type and ST slope) are encoded and all 14 resulting dimensions are normalized using verified clinical distribution parameters.",
    },
    {
      number: "03",
      title: "Nearest-Neighbor Similarity",
      icon: GitCompare,
      description:
        "The model searches 734 verified clinical patient profiles to identify the 5 closest clinical matches across the 14-dimensional feature space.",
    },
    {
      number: "04",
      title: "Risk Estimation & Observations",
      icon: BarChart3,
      description:
        "An estimated risk percentage is produced along with objective health observations referenced against American College of Cardiology (ACC/AHA) thresholds.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
            Methodology &amp; Technology
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
            How the Risk Estimation Model Works
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
            A transparent overview of the mathematical and clinical workflow behind HeartGuard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-wider">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Note Card */}
        <div className="mt-8 p-6 glass-card rounded-3xl flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
              Machine Learning Model Integrity
            </span>
            HeartGuard runs direct inference against the verified model artifacts. It does not fabricate
            weights or simulate random probabilities. All risk estimates are strictly calculated by
            distance-based neighbor voting in 14-dimensional standardized clinical space.
          </div>
        </div>
      </div>
    </section>
  );
}
