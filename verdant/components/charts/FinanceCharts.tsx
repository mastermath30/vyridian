"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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

const COLORS = ["#00d37f", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

function formatK(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v}`;
}

function buildProjectionData(monthlyNet: number, totalExpenses: number, locale: string, months = 12) {
  const surplus = Math.max(monthlyNet - totalExpenses, 0);
  return Array.from({ length: months }, (_, i) => ({
    month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(locale, { month: "short" }),
    savings: surplus * (i + 1),
    expenses: totalExpenses,
    income: monthlyNet,
  }));
}

function buildIncomeVsExpenses(monthlyNet: number, totalExpenses: number, locale: string) {
  // Use deterministic variance seeded by stable values (no Math.random)
  const variance = [0, 0.04, -0.03, 0.06, -0.02, 0.05];
  const expVariance = [0, -0.05, 0.08, -0.04, 0.07, -0.02];
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleDateString(locale, { month: "short" });
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
  const t = useTranslations("charts");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<ChartTab>("spending");
  const metrics = computeMetrics(profile);
  const { theme } = useApp();

  const TABS: { id: ChartTab; label: string }[] = [
    { id: "spending",            label: t("tabSpending") },
    { id: "income-vs-expenses",  label: t("tabIncomeExpenses") },
    { id: "goal-progress",       label: t("tabGoals") },
    { id: "projection",          label: t("tabProjection") },
  ];
  const isDark = theme !== "light";
  const tooltipStyle = {
    background: isDark ? "#0c1018" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#e2e6ec"}`,
    borderRadius: "10px",
    fontSize: "0.8125rem",
    color: isDark ? "#f0f4f8" : "#0f1520",
    padding: "10px 14px",
    boxShadow: isDark
      ? "0 4px 28px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)"
      : "0 4px 16px rgba(0,0,0,0.10)",
  };
  const tooltipLabelStyle = { color: isDark ? "#8892a4" : "#6b7280", marginBottom: "4px" };
  const tooltipItemStyle = { color: isDark ? "#f0f4f8" : "#111827" };
  const tooltipWrapperStyle = { outline: "none", filter: "none" };
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
  const projectionData = buildProjectionData(metrics.monthlyIncome, metrics.totalExpenses, locale);
  const incomeExpData = buildIncomeVsExpenses(metrics.monthlyIncome, metrics.totalExpenses, locale);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex gap-0.5 mb-6 p-1 overflow-x-auto"
        style={{
          background: "var(--color-bg)",
          borderRadius: "var(--radius-md)",
          width: "fit-content",
          border: "1px solid var(--color-border)",
        }}
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
              background: activeTab === id
                ? "linear-gradient(135deg, var(--color-accent) 0%, #00b870 100%)"
                : "transparent",
              color: activeTab === id ? "#000" : "var(--color-text-secondary)",
              border: "none",
              fontWeight: activeTab === id ? 700 : 500,
              whiteSpace: "nowrap",
              boxShadow: activeTab === id ? "0 2px 8px rgba(0,212,127,0.25)" : "none",
              transition: "all 0.2s var(--ease-smooth)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div role="tabpanel" aria-label={TABS.find(tab => tab.id === activeTab)?.label}>

        {/* Spending breakdown */}
        {activeTab === "spending" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              {t("headingSpending")}
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={spendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={2}>
                    {spendingData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-bg)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`$${v}`, t("tooltipAmount")]} contentStyle={tooltipStyle} wrapperStyle={tooltipWrapperStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={cursorStyle} />
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
                  {t("headingBenchmark")}
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
                      wrapperStyle={tooltipWrapperStyle}
                      labelStyle={tooltipLabelStyle}
                      itemStyle={tooltipItemStyle}
                      cursor={cursorStyle}
                    />
                    <Legend formatter={v => <span style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>{v}</span>} />
                    <Bar dataKey="you" name={t("seriesYourSpend")} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="average" name={t("seriesUsAverage")} fill="var(--color-border-strong)" radius={[0, 4, 4, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                  {t("blsSource")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Income vs Expenses */}
        {activeTab === "income-vs-expenses" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              {t("headingIncomeExpenses")}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={incomeExpData} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatK} tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} wrapperStyle={tooltipWrapperStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={cursorStyle} />
                <Legend formatter={v => <span style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>{v}</span>} />
                <Bar dataKey="income" name={t("seriesIncome")} fill="#00d37f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={t("seriesExpenses")} fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Goal progress */}
        {activeTab === "goal-progress" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              {t("headingGoalProgress")}
            </h3>
            {goalData.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>{t("noGoals")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={goalData} layout="vertical" barSize={16}>
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" tickFormatter={formatK} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} contentStyle={tooltipStyle} wrapperStyle={tooltipWrapperStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={cursorStyle} />
                  <Bar dataKey="saved" name={t("seriesSaved")} stackId="a" fill="#00d37f" radius={[0, 0, 0, 4]} />
                  <Bar dataKey="remaining" name={t("seriesRemaining")} stackId="a" fill="var(--color-border)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Savings projection */}
        {activeTab === "projection" && (
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
              {t("headingProjection")}
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
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, t("seriesCumulativeSavings")]} contentStyle={tooltipStyle} wrapperStyle={tooltipWrapperStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={cursorStyle} />
                <Area type="monotone" dataKey="savings" stroke="#00d37f" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs mt-3 text-center" style={{ color: "var(--color-text-muted)" }}>
              {t("basedOnSurplus", { amount: `$${Math.max(metrics.monthlySurplus, 0).toLocaleString()}` })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
