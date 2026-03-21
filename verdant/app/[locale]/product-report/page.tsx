"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, RefreshCw, AlertTriangle, Search, Leaf } from "lucide-react";
import type { ProductAnalysisResponse } from "@/types";
import { getCategoryBenchmark } from "@/lib/product-dataset";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
  BarChart, Bar,
} from "recharts";

function ProductReportInner() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  const searchParams = useSearchParams();
  const { profile, theme } = useApp();
  const isDark = theme !== "light";
  const tooltipStyle = {
    background: isDark ? "#111111" : "#ffffff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e6ec"}`,
    borderRadius: "10px",
    fontSize: "0.8125rem",
    color: isDark ? "#ffffff" : "#0f1520",
    padding: "10px 14px",
    boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.8)" : "0 4px 12px rgba(0,0,0,0.08)",
  };
  const tooltipLabelStyle = { color: isDark ? "#a1a1aa" : "#6b7280", marginBottom: "4px" };
  const tooltipItemStyle = { color: isDark ? "#ffffff" : "#111827" };
  const tooltipWrapperStyle = { outline: "none", filter: "none" };

  const product = searchParams.get("product") ?? "";
  const price = parseFloat(searchParams.get("price") ?? "0");
  const category = searchParams.get("category") ?? "General";
  const brand = searchParams.get("brand") ?? "";
  const store = searchParams.get("store") ?? "";

  const [analysis, setAnalysis] = useState<ProductAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!product || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product,
          productPrice: price,
          productCategory: category,
          brand,
          userProfile: {
            income: profile.income,
            expenses: profile.expenses ?? [],
            goals: profile.goals,
            language: profile.language,
            sustainabilityPriority: profile.sustainabilityPriority,
          },
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: ProductAnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [product, price, category, brand, profile]);

  useEffect(() => {
    if (profile && product) runAnalysis();
  }, [profile, product, runAnalysis]);

  function verdictColor(verdict: string) {
    if (verdict === "significant") return "var(--color-danger)";
    if (verdict === "moderate") return "var(--color-warning)";
    return "var(--color-accent)";
  }

  function verdictBg(verdict: string) {
    if (verdict === "significant") return "rgba(239,68,68,0.08)";
    if (verdict === "moderate") return "rgba(245,158,11,0.08)";
    return "var(--color-accent-subtle)";
  }

  function verdictBorder(verdict: string) {
    if (verdict === "significant") return "rgba(239,68,68,0.2)";
    if (verdict === "moderate") return "rgba(245,158,11,0.2)";
    return "var(--color-accent-dim)";
  }

  function sustainabilityColor(rating: string) {
    const r = rating.toLowerCase();
    if (r === "high") return "var(--color-accent)";
    if (r === "low") return "var(--color-danger)";
    return "var(--color-warning)";
  }

  function sustainabilityBg(rating: string) {
    const r = rating.toLowerCase();
    if (r === "high") return "var(--color-accent-subtle)";
    if (r === "low") return "rgba(239,68,68,0.08)";
    return "rgba(245,158,11,0.08)";
  }

  // ── No profile state ──────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ maxWidth: "680px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
            Set up your profile first
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            You need a financial profile to see how this purchase affects your goals.
          </p>
          <Link href={`/${locale}/onboarding`} className="btn btn-primary">
            Set up profile
          </Link>
        </main>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: "1rem",
            padding: "2rem",
          }}
        >
          <div
            className="animate-spin"
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--color-border)",
              borderTopColor: "var(--color-accent)",
              borderRadius: "50%",
            }}
          />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            Analyzing product with Claude AI…
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Checking your goals &amp; sustainability
          </p>
        </main>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />
        <main
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "3rem 1.5rem",
            textAlign: "center",
          }}
        >
          <AlertTriangle
            size={48}
            style={{ color: "var(--color-danger)", marginBottom: "1rem" }}
          />
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Analysis failed
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
            {error}
          </p>
          <button
            onClick={runAnalysis}
            className="btn btn-primary"
            style={{ gap: "0.5rem" }}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </main>
      </div>
    );
  }

  // ── No product in URL ─────────────────────────────────────────────────────
  if (!product) {
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)" }}>No product specified.</p>
          <Link href={`/${locale}/dashboard`} className="btn btn-ghost" style={{ marginTop: "1rem" }}>
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  // ── Main report ───────────────────────────────────────────────────────────
  const a = analysis;
  const totalExpenses = profile.expenses.reduce((s, e) => s + e.monthlyEstimate, 0);
  const surplus = profile.income.monthlyNet - totalExpenses;
  // Use dataset benchmark — prefer what API returned (already enriched), else compute locally
  const benchmark = a?.categoryBenchmark ?? getCategoryBenchmark(category);

  // ── Compute comparison chart data ─────────────────────────────────────────
  const now = new Date();
  const altPrice = a && a.alternative.savingsPercent > 0
    ? Math.max(0, price * (1 - a.alternative.savingsPercent / 100))
    : (() => {
        if (!a) return price * 0.75;
        const nums = (a.alternative.estimatedPrice || "").match(/[\d,]+(?:\.\d+)?/g);
        if (!nums || nums.length === 0) return price * 0.75;
        const parsed = nums.map((n: string) => parseFloat(n.replace(/,/g, "")));
        return parsed.length >= 2 ? (parsed[0] + parsed[1]) / 2 : parsed[0];
      })();

  const comparisonData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const m = d.toLocaleDateString("en-US", { month: "short" });
    return {
      month: m,
      "Without purchase": Math.round(surplus * (i + 1)),
      "Original product": Math.max(0, Math.round(surplus * (i + 1) - price)),
      "Better alternative": Math.max(0, Math.round(surplus * (i + 1) - altPrice)),
    };
  });

  // ── Decision summary verdict ───────────────────────────────────────────────
  const altSavingsDays = a && a.alternative.savingsPercent > 0
    ? Math.round(a.daysDelayed * a.alternative.savingsPercent / 100)
    : 0;
  const verdict = !a ? null : a.financialVerdict === "minor"
    ? {
        label: "Low Impact",
        color: "#00d37f",
        bg: "rgba(0,211,127,0.08)",
        border: "rgba(0,211,127,0.2)",
        icon: "✓",
        text: "This purchase has minimal impact on your financial goals. Proceed if it fits your budget.",
      }
    : a.financialVerdict === "moderate"
    ? {
        label: "Moderate Impact",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.2)",
        icon: "◎",
        text: `Consider the alternative — it could save you ~${altSavingsDays} days toward your goal.`,
      }
    : {
        label: "High Impact",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.2)",
        icon: "!",
        text: `This is a significant purchase. The alternative saves ${altSavingsDays} days toward your goal.`,
      };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {/* Back button */}
        <Link
          href={`/${locale}/dashboard`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            textDecoration: "none",
            marginBottom: "1.75rem",
            transition: "color 0.15s",
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Product header */}
        <div
          className="card"
          style={{
            padding: "1.75rem 2rem",
            marginBottom: "1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, var(--color-accent) 0%, transparent 80%)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                {store && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      padding: "0.2rem 0.625rem",
                      borderRadius: "100px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {store}
                  </span>
                )}
                {brand && (
                  <span className="badge badge-green" style={{ fontSize: "0.75rem" }}>
                    {brand}
                  </span>
                )}
                {category && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      background: "var(--color-surface-raised)",
                      border: "1px solid var(--color-border)",
                      padding: "0.2rem 0.625rem",
                      borderRadius: "100px",
                    }}
                  >
                    {category}
                  </span>
                )}
              </div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  maxWidth: "600px",
                }}
              >
                {product}
              </h1>
            </div>
            {price > 0 && (
              <span
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: "var(--color-accent)",
                  letterSpacing: "-0.04em",
                  flexShrink: 0,
                }}
              >
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Category benchmark strip */}
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
              Avg. Spend / Month
            </p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              ${benchmark.avgMonthlySpend}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              national average
            </p>
          </div>
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
              Sustainability Score
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: benchmark.sustainabilityScore >= 60 ? "#00d37f" : benchmark.sustainabilityScore >= 35 ? "#f59e0b" : "#ef4444" }}>
                {benchmark.sustainabilityScore}/100
              </p>
            </div>
            <div style={{ height: "4px", background: "var(--color-border)", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${benchmark.sustainabilityScore}%`, background: benchmark.sustainabilityScore >= 60 ? "#00d37f" : benchmark.sustainabilityScore >= 35 ? "#f59e0b" : "#ef4444", borderRadius: "100px", transition: "width 1s ease" }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
              Avg. CO₂ / Purchase
            </p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              ~{benchmark.co2PerPurchaseKg} kg
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>CO₂ equivalent</p>
          </div>
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
              Typical Lifespan
            </p>
            <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {benchmark.lifespanYears} yr{benchmark.lifespanYears !== 1 ? "s" : ""}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>repairability {benchmark.repairabilityScore}/10</p>
          </div>
          {price > 0 && (
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                Cost Per Use
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                ${(price / (benchmark.lifespanYears * 52)).toFixed(2)}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>per week of use</p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
              Price vs. Category
            </p>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.2rem 0.625rem",
                borderRadius: "100px",
                background: price < benchmark.avgPrice.low
                  ? "rgba(59,130,246,0.1)" : price > benchmark.avgPrice.high
                  ? "rgba(239,68,68,0.1)" : "rgba(0,211,127,0.1)",
                color: price < benchmark.avgPrice.low
                  ? "#3b82f6" : price > benchmark.avgPrice.high
                  ? "#ef4444" : "#00d37f",
              }}
            >
              {price < benchmark.avgPrice.low
                ? "↓ Below avg range"
                : price > benchmark.avgPrice.high
                ? "↑ Premium tier"
                : "✓ Typical range"}
            </span>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              avg ${benchmark.avgPrice.low}–${benchmark.avgPrice.high}
            </p>
          </div>
        </div>

        {/* Grid layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Financial Impact */}
            {a && (
              <div
                style={{
                  background: verdictBg(a.financialVerdict),
                  border: `1px solid ${verdictBorder(a.financialVerdict)}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Goal Impact
                </p>

                {/* Days number */}
                <div style={{ marginBottom: "1rem" }}>
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: 800,
                      color: verdictColor(a.financialVerdict),
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {a.daysDelayed > 0 ? a.daysDelayed : "0"}
                  </span>
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {a.daysDelayed === 1 ? "day" : "days"} delayed
                  </span>
                </div>

                {/* Bar chart */}
                {(() => {
                  const pct = Math.min(100, a.percentOfSurplus ?? 0);
                  const currentPct = price > 0 && surplus > 0 ? Math.max(0, 100 - pct) : 80;
                  return (
                    <div style={{ marginBottom: "1rem" }}>
                      <div
                        style={{
                          height: "8px",
                          background: "var(--color-surface-raised)",
                          borderRadius: "100px",
                          overflow: "hidden",
                          display: "flex",
                          marginBottom: "0.5rem",
                        }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {/* Current progress */}
                        <div
                          style={{
                            width: `${currentPct}%`,
                            background: "var(--color-accent)",
                            borderRadius: "100px 0 0 100px",
                            transition: "width 0.8s ease",
                          }}
                        />
                        {/* This purchase */}
                        <div
                          style={{
                            width: `${pct}%`,
                            background: verdictColor(a.financialVerdict),
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          Saved progress
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: verdictColor(a.financialVerdict),
                          }}
                        >
                          {pct}% of surplus
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {a.goalImpact}
                </p>
              </div>
            )}

            {/* Goals overview */}
            {profile.goals.length > 0 && (
              <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  Your Goals
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {profile.goals.map((goal) => {
                    const pct =
                      goal.targetAmount > 0
                        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                        : 0;
                    return (
                      <div key={goal.id}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "0.375rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {goal.name}
                          </span>
                          <span
                            style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "0.25rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            ${goal.currentAmount.toLocaleString()} saved
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            Goal: ${goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Savings Impact Comparison chart — spans full width */}
          {a && surplus > 0 && (
            <div
              className="card"
              style={{ padding: "1.5rem 2rem", gridColumn: "1 / -1" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                    12-Month Savings Projection
                  </p>
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                    3-Scenario Comparison
                  </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {[
                    { color: "#00d47f", label: "Without purchase", dash: false },
                    { color: "#ef4444", label: "Buy original", dash: true },
                    { color: "#3b82f6", label: "Buy alternative", dash: true },
                  ].map(({ color, label, dash }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <svg width="20" height="10" aria-hidden>
                        <line x1="0" y1="5" x2="20" y2="5" stroke={color} strokeWidth="2" strokeDasharray={dash ? "4 2" : "none"} />
                      </svg>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={comparisonData}>
                  <defs>
                    <linearGradient id="gradWithout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d37f" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#00d37f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOriginal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAlternative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.10} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]}
                    contentStyle={tooltipStyle}
                    wrapperStyle={tooltipWrapperStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
                  />
                  <Area type="monotone" dataKey="Without purchase" stroke="#00d47f" strokeWidth={2.5} fill="url(#gradWithout)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: "#00d47f" }} />
                  <Area type="monotone" dataKey="Original product" stroke="#ef4444" strokeWidth={2} fill="url(#gradOriginal)" dot={false} strokeDasharray="5 3" activeDot={{ r: 4, strokeWidth: 0, fill: "#ef4444" }} />
                  <Area type="monotone" dataKey="Better alternative" stroke="#3b82f6" strokeWidth={2} fill="url(#gradAlternative)" dot={false} strokeDasharray="3 2" activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Sustainability */}
            {a && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.875rem",
                  }}
                >
                  Sustainability
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: sustainabilityBg(a.sustainabilityRating),
                    border: `1px solid ${sustainabilityColor(a.sustainabilityRating)}30`,
                    borderRadius: "100px",
                    padding: "0.375rem 1rem",
                    marginBottom: "0.875rem",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>
                    {a.sustainabilityRating.toLowerCase() === "high"
                      ? "🌿"
                      : a.sustainabilityRating.toLowerCase() === "low"
                      ? "⚠️"
                      : "〜"}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: sustainabilityColor(a.sustainabilityRating),
                    }}
                  >
                    {a.sustainabilityRating} Rating
                  </span>
                </div>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                  {a.sustainabilityReason}
                </p>
              </div>
            )}

            {/* Alternative */}
            {a?.alternative && (
              <div
                style={{
                  background: "var(--color-accent-subtle)",
                  border: "1px solid var(--color-accent-dim)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.875rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Better Alternative
                  </p>
                  {a.alternative.savingsPercent > 0 && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        background: "var(--color-accent)",
                        color: "#000",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "100px",
                      }}
                    >
                      −{a.alternative.savingsPercent}%
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {a.alternative.name}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {a.alternative.estimatedPrice}
                </p>
                <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
                  {a.alternative.reason}
                </p>
                <a
                  href={`https://www.amazon.com/s?k=${encodeURIComponent(a.alternative.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-ghost"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Search size={13} aria-hidden /> Search on Amazon
                </a>
              </div>
            )}

            {/* Eco tip from dataset */}
            <div
              style={{
                background: "var(--color-accent-subtle)",
                border: "1px solid var(--color-accent-dim)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem 1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Leaf size={14} style={{ color: "var(--color-accent)" }} aria-hidden />
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>
                  Eco Insight
                </p>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "0.875rem" }}>
                {benchmark.ecoTip}
              </p>
              {benchmark.redFlags.length > 0 && (
                <>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Red flags to watch
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.125rem" }}>
                    {benchmark.redFlags.slice(0, 3).map((flag, i) => (
                      <li key={i} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Decision Summary card */}
            {a && verdict && (
              <div
                style={{
                  background: verdict.bg,
                  border: `1px solid ${verdict.border}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: verdict.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#000",
                      flexShrink: 0,
                    }}
                  >
                    {verdict.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--color-text-muted)",
                        marginBottom: "0.125rem",
                      }}
                    >
                      Decision Summary
                    </p>
                    <p
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: verdict.color,
                      }}
                    >
                      {verdict.label}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                  }}
                >
                  {verdict.text}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "0.75rem",
                  }}
                >
                  Analysis powered by Claude AI + US BLS benchmark data.
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                href={`/${locale}/dashboard`}
                className="btn btn-primary"
                style={{ justifyContent: "center" }}
              >
                Open Dashboard
              </Link>
              <Link
                href={`/${locale}/onboarding`}
                className="btn btn-ghost"
                style={{ justifyContent: "center" }}
              >
                Update my profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductReportPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            background: "var(--color-bg)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid var(--color-border)",
              borderTopColor: "var(--color-accent)",
              borderRadius: "50%",
            }}
          />
        </div>
      }
    >
      <ProductReportInner />
    </Suspense>
  );
}
