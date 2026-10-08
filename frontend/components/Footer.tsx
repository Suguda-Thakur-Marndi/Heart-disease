import React from "react";
import { HeartPulse, ShieldCheck, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-emerald-500/25 bg-white/35 dark:bg-[#030b05]/45 backdrop-blur-2xl py-12 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">HeartGuard</span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Cardiovascular Risk Prediction System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Client-Side History Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Trained Clinical Artifacts
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-500 font-medium">
          <p>
            &copy; 2026 HeartGuard. Built with FastAPI, scikit-learn &amp; Next.js.
          </p>
          <p className="max-w-xl leading-relaxed">
            Educational cardiovascular risk calculator based on statistical machine-learning models.
            Not intended for medical diagnosis or clinical decision making.
          </p>
        </div>
      </div>
    </footer>
  );
}
