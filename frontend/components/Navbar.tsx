"use client";

import React, { useEffect, useState } from "react";
import {
  HeartPulse,
  History,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { fetchHealth } from "../lib/api";
import { useTheme } from "../lib/theme";

interface NavbarProps {
  currentView: "home" | "assessment" | "result" | "dashboard";
  onNavigate: (view: "home" | "assessment" | "dashboard") => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">("checking");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function checkStatus() {
      try {
        const health = await fetchHealth();
        if (health.model_loaded) {
          setServiceStatus("online");
        } else {
          setServiceStatus("offline");
        }
      } catch {
        setServiceStatus("offline");
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-500/20 bg-white/75 dark:bg-[#07170e]/80 backdrop-blur-xl transition-colors duration-300 shadow-[0_4px_25px_rgba(16,185,129,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.45)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] group-hover:scale-105 transition-all">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Heart<span className="text-emerald-500 dark:text-emerald-400">Guard</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-md backdrop-blur-md">
                ML v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-emerald-400/80 font-medium leading-none">
              Cardiovascular Risk Prediction
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate("home")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              currentView === "home"
                ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/35 font-bold shadow-xs backdrop-blur-md"
                : "text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/10 backdrop-blur-xs"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onNavigate("assessment")}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              currentView === "assessment" || currentView === "result"
                ? "bg-emerald-600/90 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.45)] border border-emerald-400/40 backdrop-blur-md"
                : "text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/10 backdrop-blur-xs"
            }`}
          >
            Start Assessment
          </button>

          <button
            onClick={() => onNavigate("dashboard")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              currentView === "dashboard"
                ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/35 font-bold shadow-xs backdrop-blur-md"
                : "text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-500/10 backdrop-blur-xs"
            }`}
          >
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">History &amp; Trend</span>
            <span className="sm:hidden">History</span>
          </button>
        </nav>

        {/* Right Section: Theme Toggle & Status */}
        <div className="flex items-center gap-3 pl-3 border-l border-emerald-500/25">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl bg-white/40 dark:bg-emerald-950/40 hover:bg-emerald-500/20 text-slate-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md transition-all shadow-xs cursor-pointer group"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-700 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Model Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            {serviceStatus === "online" && (
              <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 bg-emerald-500/15 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-[11px]">Model Active (k=5)</span>
              </div>
            )}
            {serviceStatus === "checking" && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md px-3 py-1 rounded-full border border-slate-400/20">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"></span>
                <span className="text-[11px]">Connecting...</span>
              </div>
            )}
            {serviceStatus === "offline" && (
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-500/15 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px]">Backend Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
