"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  TrendingUp,
  Activity,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AssessmentHistoryItem } from "../lib/types";
import { getLocalHistory, clearLocalHistory } from "../lib/history";
import { useTheme } from "../lib/theme";

interface DashboardViewProps {
  onStartNewAssessment: () => void;
}

export function DashboardView({ onStartNewAssessment }: DashboardViewProps) {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setHistory(getLocalHistory());
  }, []);

  const handleClearHistory = () => {
    clearLocalHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  // Metrics
  const totalAssessments = history.length;
  const latestRisk = history.length > 0 ? history[0].riskPercentage : null;
  const avgRisk =
    history.length > 0
      ? Math.round(
          history.reduce((acc, curr) => acc + curr.riskPercentage, 0) / history.length
        )
      : null;
  const highestRisk =
    history.length > 0
      ? Math.max(...history.map((h) => h.riskPercentage))
      : null;

  // Chart data (ordered chronologically)
  const chartData = [...history]
    .reverse()
    .map((item, index) => ({
      index: index + 1,
      date: item.dateFormatted,
      risk: item.riskPercentage,
      category: item.riskCategory,
    }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wider uppercase bg-emerald-500/20 px-3 py-1 rounded-md border border-emerald-500/35 backdrop-blur-md">
            Client-Side Storage
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Assessment History &amp; Risk Trend
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Historical evaluations stored strictly inside your browser's private local storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/35 bg-rose-500/15 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 backdrop-blur-md transition-all shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={onStartNewAssessment}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/35 backdrop-blur-md transition-all"
          >
            <span>New Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 rounded-2xl border border-rose-500/35 bg-rose-500/15 backdrop-blur-2xl text-rose-950 dark:text-rose-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">Are you sure you want to permanently clear all stored local assessments?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 rounded-lg border border-slate-300/60 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleClearHistory}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* Overview Cards (Requirement 15) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Total Assessments
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalAssessments}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Local records</span>
        </div>

        <div className="glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Latest Estimated Risk
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {latestRisk !== null ? `${latestRisk}%` : "—"}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Most recent run</span>
        </div>

        <div className="glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Average Estimated Risk
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {avgRisk !== null ? `${avgRisk}%` : "—"}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Across all submissions</span>
        </div>

        <div className="glass-card p-5 rounded-3xl">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
            Highest Recent Risk
          </span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {highestRisk !== null ? `${highestRisk}%` : "—"}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">Peak model score</span>
        </div>
      </div>

      {/* Risk Trend Chart (Requirement 15) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Estimated Risk Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizes trajectory of machine-learning risk scores across assessments.
            </p>
          </div>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 self-start sm:self-auto font-semibold backdrop-blur-md">
            Model Estimates (Not Continuous Telemetry)
          </span>
        </div>

        {chartData.length > 1 ? (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.1)"}
                />
                <XAxis
                  dataKey="date"
                  stroke={theme === "dark" ? "#6ee7b7" : "#059669"}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme === "dark" ? "#6ee7b7" : "#059669"}
                  fontSize={11}
                  domain={[0, 100]}
                  unit="%"
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-950/85 dark:bg-[#040e07]/90 backdrop-blur-2xl border border-emerald-500/40 text-white rounded-xl text-xs shadow-xl space-y-1">
                          <p className="font-bold text-emerald-400">{data.date}</p>
                          <p className="text-slate-200">
                            Estimated Risk: <span className="font-bold text-emerald-300">{data.risk}%</span>
                          </p>
                          <p className="text-slate-400 capitalize">Tier: {data.category}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: "#34d399" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 glass-subcard rounded-2xl">
            <TrendingUp className="w-6 h-6 mx-auto text-emerald-500/60 mb-2" />
            Complete at least two assessments to visualize your risk trend over time.
          </div>
        )}
      </div>

      {/* Recent Assessments List (Requirement 14 & 15) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Assessments</h3>

        {history.length > 0 ? (
          <div className="divide-y divide-emerald-500/20 border border-emerald-500/25 rounded-2xl overflow-hidden glass-subcard">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-500/10 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/30">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.dateFormatted}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Age {item.age}, {item.sex}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Estimated Risk:{" "}
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {item.riskPercentage}%
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
                      item.riskCategory === "High"
                        ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/35"
                        : item.riskCategory === "Moderate"
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/35"
                        : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/35"
                    }`}
                  >
                    {item.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 glass-subcard rounded-2xl">
            <Activity className="w-6 h-6 mx-auto text-emerald-500/60 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-200">
              No assessments recorded yet
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Start an assessment to generate your first cardiovascular risk profile.
            </p>
            <button
              onClick={onStartNewAssessment}
              className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/35 backdrop-blur-md transition-all inline-flex items-center gap-1.5"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
