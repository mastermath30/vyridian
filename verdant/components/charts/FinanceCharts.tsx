"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import type { UserProfile } from "@/types";
import { computeMetrics } from "@/lib/utils";
import { useApp } from "@/lib/context";
import { matchSpendingBenchmark } from "@/lib/product-dataset";

type ChartTab = "spending" | "income-vs-expenses" | "goal-progress" | "projection";

const TABS: { id: ChartTab; label: string }[] = [
  { id: "spending", label: "Spending" },
  { id: "income-vs-expenses", label: "Income vs Expenses" },
  { id: "goal-progress", label: "Goals" },
  { id: "projection", label: "Projection" },
];

const COLORS = ["#00d37f", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

function formatK(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v}`;
}

function buildProjectionData(monthlyNet: number, totalExpenses: number, months = 12) {
  const surplus = Math.max(monthlyNet - totalExpenses, 0);
  return Array.from({ length: months }, (_, i) => ({
    month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short" }),
    savings: surplus * (i + 1),
    expenses: totalExpenses,
    income: monthlyNet,
  }));
}

function buildIncomeVsExpenses(monthlyNet: number, totalExpenses: number) {
  // Use deterministic variance seeded by stable values (no Math.random)
  const variance = [0, 0.04, -0.03, 0.06, -0.02, 0.05];
  const expVariance = [0, -0.05, 0.08, -0.04, 0.07, -0.02];
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleDateString("en-US", { month: "short" });
  });
  return months.map((m, i) => ({
    month: m,
    income: Math.round(monthlyNet * (1 + variance[i])),
    expenses: Math.round(totalExpenses * (1 + expVariance[i])),
  }));
}

interface Props {
  profile: UserProfile;
}

export default function FinanceCharts({ profile }: Props) {
  const [activeTab, setActiveTab] = useState<ChartTab>("spending");
  const metrics = computeMetrics(profile);
  const { theme } = useApp();
  const isDark = theme !== "light";
  const tooltipStyle = {
    background: isDark ? "#111111" : "#ffffff",
    border: `1px solid ${isDark ? "#1e1e1e" : "#e2e6ec"}`,
    borderRadius: "10px",
    fontSize: "0.8125rem",
    color: isDark ? "#ffffff" : "#0f1520",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.7)" : "0 4px 12px rgba(0,0,0,0.08)",
  };
  const cursorStyle = { fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" };

  const spendingData = profile.expenses.map(e => ({ name: e.name, value: e.monthlyEstimate }));

  // Build "you vs. average" benchmark comparison for matched expense categories
  const benchmarkComparison = profile.expenses
    .map(e => {
      const bm = matchSpendingBenchmark(e.name);
      if (!bm) return null;
      return {
        name: e.name.length > 12 ? e.name.slice(0, 12) + "…" : e.name,
        you: e.monthlyEstimate,
        average: bm.avgMonthlyUSD,
        diff: Math.round(((e.monthlyEstimate - bm.avgMonthlyUSD) / bm.avgMonthlyUSD) * 100),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 6);
  const goalData = profile.goals.map(g => ({
    name: g.name.length > 14 ? g.name.slice(0, 14) + "…" : g.name,
    saved: g.currentAmount,
    remaining: Math.max(g.targetAmount - g.currentAmount, 0),
    target: g.targetAmount,
  }));
  const projectionData = buildProjectionData(metrics.monthlyIncome, metrics.totalExpenses);
  const incomeExpData = buildIncomeVsExpenses(metrics.monthlyIncome, metrics.totalExpenses);

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      {/* Tab bar */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto"
        style={{ background: "var(--color-bg)", width: "fit-content" }}
        role="tablist"
        aria-label="Chart type"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className="btn btn-sm"
            style={{
              background: activeTab === id ? "var(--color-accent)" : "transparent",
              color: activeTab === id ? "#000" : "var(--color-text-secondary)",
              border: "none",
              fontWeight: activeTab === id ? 700 : 500,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div role="tabpanel" aria-label={TABS.find(t => t.id === activeTab)?.label}>

        {/* Spending breakdown */}
        {activeTab === "spending" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Monthly spending breakdown
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={spendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={2}>
                    {spendingData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-bg)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`$${v}`, "Amount"]} contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} cursor={cursorStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {spendingData.slice(0, 7).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} aria-hidden />
                      <span className="text-sm truncate" style={{ color: "var(--color-text-secondary)" }}>{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold font-mono flex-shrink-0" style={{ color: "var(--color-text-primary)" }}>
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* You vs. National Average */}
            {benchmarkComparison.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "1.25rem",
                }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  You vs. National Average
                </h3>
                <ResponsiveContainer width="100%" height={benchmarkComparison.length * 52 + 20}>
                  <BarChart data={benchmarkComparison} layout="vertical" barSize={14} barGap={3}>
                    <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                    <XAxis
                      type="number"
                      tickFormatter={formatK}
                      tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [`$${v.toLocaleString()}/mo`, name]}
                      contentStyle={tooltipStyle}
                      wrapperStyle={{ outline: "none" }}
                      cursor={cursorStyle}
                    />
                    <Legend formatter={v => <span style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>{v}</span>} />
                    <Bar dataKey="you" name="Your spend" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="average" name="US average" fill="var(--color-border-strong)" radius={[0, 4, 4, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                  Source: US Bureau of Labor Statistics Consumer Expenditure Survey 2022
                </p>
              </div>
            )}
          </div>
        )}

        {/* Income vs Expenses */}
        {activeTab === "income-vs-expenses" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Income vs expenses (last 6 months — estimated)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={incomeExpData} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatK} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} cursor={cursorStyle} />
                <Legend formatter={v => <span style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>{v}</span>} />
                <Bar dataKey="income" name="Income" fill="#00d37f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Goal progress */}
        {activeTab === "goal-progress" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Goal progress
            </h3>
            {goalData.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>No goals set yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={goalData} layout="vertical" barSize={16}>
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" tickFormatter={formatK} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} cursor={cursorStyle} />
                  <Bar dataKey="saved" name="Saved" stackId="a" fill="#00d37f" radius={[0, 0, 0, 4]} />
                  <Bar dataKey="remaining" name="Remaining" stackId="a" fill="var(--color-border)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Savings projection */}
        {activeTab === "projection" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Projected savings over next 12 months
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d37f" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d37f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatK} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Cumulative savings"]} contentStyle={tooltipStyle} wrapperStyle={{ outline: "none" }} cursor={cursorStyle} />
                <Area type="monotone" dataKey="savings" stroke="#00d37f" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs mt-3 text-center" style={{ color: "var(--color-text-muted)" }}>
              Based on your current monthly surplus of ${Math.max(metrics.monthlySurplus, 0).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
