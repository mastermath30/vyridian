"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useApp } from "@/lib/context";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft, RefreshCw, AlertTriangle, Leaf } from "lucide-react";
import type { ProductAnalysisResponse } from "@/types";
import { getCategoryBenchmark } from "@/lib/product-dataset";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Shared tooltip style helper ──────────────────────────────────────────────
function useTooltipStyles(isDark: boolean) {
  return {
    contentStyle: {
      background: isDark ? "#0c1018" : "#ffffff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#e2e6ec"}`,
      borderRadius: "10px",
      fontSize: "0.8125rem",
      color: isDark ? "#f0f4f8" : "#0f1520",
      padding: "10px 14px",
      boxShadow: isDark
        ? "0 4px 24px rgba(0,0,0,0.85)"
        : "0 4px 12px rgba(0,0,0,0.10)",
    },
    labelStyle: { color: isDark ? "#8892a4" : "#6b7280", marginBottom: "4px" },
    itemStyle: { color: isDark ? "#f0f4f8" : "#111827" },
    wrapperStyle: { outline: "none", filter: "none" },
    cursorStyle: {
      fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    },
  };
}

// ── Individual Scenario Projection Card ─────────────────────────────────────
interface ScenarioCardProps {
  title: string;
  subtitle: string;
  color: string;
  data: Array<{ month: string; savings: number }>;
  yDomain: [number, number];
  finalAmount: number;
  deltaLabel: string | null;
  deltaPositive: boolean | null;
  isDark: boolean;
  gradId: string;
  delay: number;
}

function ScenarioCard({
  title, subtitle, color, data, yDomain, finalAmount,
  deltaLabel, deltaPositive, isDark, gradId, delay,
}: ScenarioCardProps) {
  const tt = useTooltipStyles(isDark);
  return (
    <div
      className="card"
      style={{
        padding: "1.375rem",
        border: `1px solid ${color}28`,
        position: "relative",
        overflow: "hidden",
        animation: `fadeUp 0.6s var(--ease-expo) ${delay}ms both`,
      }}
    >
      {/* Top color accent bar */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px", background: color, opacity: 0.85,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span
              style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }}
            />
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
              {title}
            </span>
          </div>
          <p
            style={{
              fontSize: "0.6875rem", color: "var(--color-text-muted)",
              paddingLeft: "1.125rem", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            ${finalAmount.toLocaleString()}
          </p>
          <p style={{ fontSize: "0.625rem", color: "var(--color-text-muted)", marginTop: "2px" }}>after 12 mo</p>
          {deltaLabel && (
            <span
              style={{
                display: "inline-block", marginTop: "0.3rem",
                fontSize: "0.6875rem", fontWeight: 700,
                padding: "0.125rem 0.5rem", borderRadius: "100px",
                color: deltaPositive ? "#00d47f" : "#ef4444",
                background: deltaPositive ? "rgba(0,212,127,0.1)" : "rgba(239,68,68,0.1)",
              }}
            >
              {deltaLabel}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={155}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.24} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
            axisLine={false} tickLine={false} interval={2}
          />
          <YAxis
            domain={yDomain}
            tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
            tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
            axisLine={false} tickLine={false} width={44}
          />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString()}`, title]}
            contentStyle={tt.contentStyle}
            wrapperStyle={tt.wrapperStyle}
            labelStyle={tt.labelStyle}
            itemStyle={{ color }}
            cursor={tt.cursorStyle}
          />
          <Area
            type="monotone" dataKey="savings"
            stroke={color} strokeWidth={2}
            fill={`url(#${gradId})`} dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Verdict helpers ──────────────────────────────────────────────────────────
function verdictColor(v: string) {
  if (v === "significant") return "var(--color-danger)";
  if (v === "moderate") return "var(--color-warning)";
  return "var(--color-accent)";
}
function verdictBg(v: string) {
  if (v === "significant") return "rgba(239,68,68,0.07)";
  if (v === "moderate") return "rgba(245,158,11,0.07)";
  return "var(--color-accent-subtle)";
}
function verdictBorder(v: string) {
  if (v === "significant") return "rgba(239,68,68,0.2)";
  if (v === "moderate") return "rgba(245,158,11,0.2)";
  return "var(--color-accent-dim)";
}
function sustainColor(r: string) {
  const rr = r.toLowerCase();
  if (rr === "high") return "var(--color-accent)";
  if (rr === "low") return "var(--color-danger)";
  return "var(--color-warning)";
}
function sustainBg(r: string) {
  const rr = r.toLowerCase();
  if (rr === "high") return "var(--color-accent-subtle)";
  if (rr === "low") return "rgba(239,68,68,0.08)";
  return "rgba(245,158,11,0.08)";
}

// ── Main report component ────────────────────────────────────────────────────
function ProductReportInner() {
  const t = useTranslations("report");
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  const i18nLocale = useLocale();
  const searchParams = useSearchParams();
  const { profile, theme } = useApp();
  const isDark = theme !== "light";
  const tt = useTooltipStyles(isDark);

  const product  = searchParams.get("product") ?? "";
  const price    = parseFloat(searchParams.get("price") ?? "0");
  const category = searchParams.get("category") ?? "General";
  const brand    = searchParams.get("brand") ?? "";
  const store    = searchParams.get("store") ?? "";

  const [analysis, setAnalysis] = useState<ProductAnalysisResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!product || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product, productPrice: price,
          productCategory: category, brand,
          userProfile: {
            income: profile.income, expenses: profile.expenses ?? [],
            goals: profile.goals, language: profile.language,
            sustainabilityPriority: profile.sustainabilityPriority,
          },
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setAnalysis(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [product, price, category, brand, profile]);

  useEffect(() => { if (profile && product) runAnalysis(); }, [profile, product, runAnalysis]);

  // ── Guard: no profile ────────────────────────────────────────────────────
  if (!profile) return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>📊</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
          {t("setupProfileFirst")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
          {t("setupProfileDesc")}
        </p>
        <Link href={`/${locale}/onboarding`} className="btn btn-primary">{t("setupProfile")}</Link>
      </main>
    </div>
  );

  // ── Guard: loading ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1.25rem", padding: "2rem" }}>
        <div
          className="animate-spin"
          style={{ width: "42px", height: "42px", border: "3px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%" }}
        />
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", fontWeight: 600 }}>{t("analyzing")}</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.375rem" }}>{t("analyzingDesc")}</p>
        </div>
      </main>
    </div>
  );

  // ── Guard: error ─────────────────────────────────────────────────────────
  if (error) return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: "520px", margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
        <AlertTriangle size={48} style={{ color: "var(--color-danger)", marginBottom: "1.25rem" }} />
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
          {t("analysisFailed")}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.75rem" }}>{error}</p>
        <button onClick={runAnalysis} className="btn btn-primary" style={{ gap: "0.5rem" }}>
          <RefreshCw size={16} /> {t("retry")}
        </button>
      </main>
    </div>
  );

  // ── Guard: no product ────────────────────────────────────────────────────
  if (!product) return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: "520px", margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>{t("noProduct")}</p>
        <Link href={`/${locale}/dashboard`} className="btn btn-ghost">{t("backToDashboard")}</Link>
      </main>
    </div>
  );

  // ── Computed values ──────────────────────────────────────────────────────
  const a          = analysis;
  const totalExp   = profile.expenses.reduce((s, e) => s + e.monthlyEstimate, 0);
  const surplus    = profile.income.monthlyNet - totalExp;
  const benchmark  = a?.categoryBenchmark ?? getCategoryBenchmark(category);

  const altPrice = a && a.alternative.savingsPercent > 0
    ? Math.max(0, price * (1 - a.alternative.savingsPercent / 100))
    : (() => {
        if (!a) return price * 0.75;
        const nums = (a.alternative.estimatedPrice || "").match(/[\d,]+(?:\.\d+)?/g);
        if (!nums?.length) return price * 0.75;
        const ps = nums.map((n: string) => parseFloat(n.replace(/,/g, "")));
        return ps.length >= 2 ? (ps[0] + ps[1]) / 2 : ps[0];
      })();

  const now = new Date();
  const comparisonData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return {
      month: d.toLocaleDateString(i18nLocale, { month: "short" }),
      withoutPurchase:   Math.round(surplus * (i + 1)),
      originalProduct:   Math.max(0, Math.round(surplus * (i + 1) - price)),
      betterAlternative: Math.max(0, Math.round(surplus * (i + 1) - altPrice)),
    };
  });

  const altSavingsDays = a && a.alternative.savingsPercent > 0
    ? Math.round(a.daysDelayed * a.alternative.savingsPercent / 100) : 0;

  const verdict = !a ? null : a.financialVerdict === "minor"
    ? { label: t("verdictLow"),      color: "#00d37f", bg: "rgba(0,211,127,0.07)",   border: "rgba(0,211,127,0.2)",   icon: "✓", text: t("verdictLowText") }
    : a.financialVerdict === "moderate"
    ? { label: t("verdictModerate"), color: "#f59e0b", bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.2)",  icon: "◎", text: t("verdictModerateText", { days: altSavingsDays }) }
    : { label: t("verdictHigh"),     color: "#ef4444", bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.2)",   icon: "!", text: t("verdictHighText", { days: altSavingsDays }) };

  // Shared Y scale for all 3 scenario cards
  const yMax = surplus > 0
    ? Math.max(...comparisonData.map(d => d.withoutPurchase), 100)
    : 100;
  const yDomain: [number, number] = [0, Math.ceil(yMax * 1.1 / 50) * 50];

  const scenarios = [
    {
      key: "withoutPurchase" as const,
      title: t("withoutPurchase"),
      subtitle: "Baseline savings trajectory",
      color: "#00d47f",
      gradId: "grad-scen-without",
      delay: 0,
    },
    {
      key: "originalProduct" as const,
      title: t("buyOriginal"),
      subtitle: price > 0 ? `${product.slice(0, 28)}${product.length > 28 ? "…" : ""} · $${price.toFixed(0)}` : product,
      color: "#ef4444",
      gradId: "grad-scen-original",
      delay: 120,
    },
    {
      key: "betterAlternative" as const,
      title: t("buyAlternative"),
      subtitle: a?.alternative?.name
        ? `${a.alternative.name.slice(0, 28)}${a.alternative.name.length > 28 ? "…" : ""}`
        : "Smarter choice",
      color: "#3b82f6",
      gradId: "grad-scen-alt",
      delay: 240,
    },
  ];

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>

        {/* Back link */}
        <Link
          href={`/${locale}/dashboard`}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            color: "var(--color-text-muted)", fontSize: "0.875rem",
            textDecoration: "none", marginBottom: "1.75rem",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <ArrowLeft size={15} /> {t("backToDashboard")}
        </Link>

        {/* ── Product Hero Card ──────────────────────────────────────────── */}
        <div
          className="card"
          style={{ padding: "1.75rem 2rem", marginBottom: "1.25rem", position: "relative", overflow: "hidden", animation: "fadeUp 0.5s var(--ease-expo) both" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, var(--color-accent) 0%, transparent 80%)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.25rem" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
                {store && (
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-muted)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "0.2rem 0.625rem", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {store}
                  </span>
                )}
                {brand && <span className="badge badge-green" style={{ fontSize: "0.6875rem" }}>{brand}</span>}
                {category && (
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", padding: "0.2rem 0.625rem", borderRadius: "100px" }}>
                    {category}
                  </span>
                )}
                {verdict && (
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.75rem", borderRadius: "100px", background: verdict.bg, border: `1px solid ${verdict.border}`, color: verdict.color }}>
                    {verdict.icon} {verdict.label}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.025em", lineHeight: 1.2, maxWidth: "600px" }}>
                {product}
              </h1>
            </div>
            {price > 0 && (
              <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-accent)", letterSpacing: "-0.045em", flexShrink: 0 }}>
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick KPI strip inside hero */}
          {a && (
            <div
              style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--color-border)" }}
            >
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                  {t("goalImpact")}
                </p>
                <p style={{ fontSize: "1.375rem", fontWeight: 800, color: verdictColor(a.financialVerdict), letterSpacing: "-0.03em" }}>
                  {a.daysDelayed > 0 ? a.daysDelayed : "0"}
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-secondary)", marginLeft: "0.375rem" }}>
                    {a.daysDelayed === 1 ? t("dayDelayed") : t("daysDelayed")}
                  </span>
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                  {t("sustainabilitySection")}
                </p>
                <p style={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.03em", color: sustainColor(a.sustainabilityRating) }}>
                  {a.sustainabilityRating}
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-muted)", marginLeft: "0.375rem" }}>{t("rating")}</span>
                </p>
              </div>
              {surplus > 0 && price > 0 && (
                <div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                    {t("ofSurplus")}
                  </p>
                  <p style={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}>
                    {Math.min(100, Math.round((price / surplus) * 100))}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Benchmark Stats Strip ──────────────────────────────────────── */}
        <div
          className="card"
          style={{ marginBottom: "1.5rem", padding: "1.125rem 1.5rem", animation: "fadeUp 0.55s var(--ease-expo) 60ms both" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem 1.25rem" }}>
            {/* Avg Spend */}
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {t("avgSpendPerMonth")}
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                ${benchmark.avgMonthlySpend}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t("nationalAverage")}</p>
            </div>
            {/* Sustainability Score */}
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {t("sustainabilityScore")}
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: benchmark.sustainabilityScore >= 60 ? "#00d37f" : benchmark.sustainabilityScore >= 35 ? "#f59e0b" : "#ef4444" }}>
                {benchmark.sustainabilityScore}/100
              </p>
              <div style={{ marginTop: "4px", height: "3px", background: "var(--color-border)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${benchmark.sustainabilityScore}%`, background: benchmark.sustainabilityScore >= 60 ? "#00d37f" : benchmark.sustainabilityScore >= 35 ? "#f59e0b" : "#ef4444", borderRadius: "100px" }} />
              </div>
            </div>
            {/* CO2 */}
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {t("avgCo2")}
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                ~{benchmark.co2PerPurchaseKg} kg
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t("co2Equiv")}</p>
            </div>
            {/* Lifespan */}
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {t("lifespan")}
              </p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                {benchmark.lifespanYears} yr{benchmark.lifespanYears !== 1 ? "s" : ""}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {t("repairability")} {benchmark.repairabilityScore}/10
              </p>
            </div>
            {/* Cost per use */}
            {price > 0 && (
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                  {t("costPerUse")}
                </p>
                <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  ${(price / (benchmark.lifespanYears * 52)).toFixed(2)}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t("perWeekOfUse")}</p>
              </div>
            )}
            {/* Price vs category */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
                {t("priceVsCategory")}
              </p>
              <span style={{
                display: "inline-block", fontSize: "0.75rem", fontWeight: 600,
                padding: "0.2rem 0.625rem", borderRadius: "100px",
                background: price < benchmark.avgPrice.low ? "rgba(59,130,246,0.1)" : price > benchmark.avgPrice.high ? "rgba(239,68,68,0.1)" : "rgba(0,211,127,0.1)",
                color: price < benchmark.avgPrice.low ? "#3b82f6" : price > benchmark.avgPrice.high ? "#ef4444" : "#00d37f",
              }}>
                {price < benchmark.avgPrice.low ? t("belowAvg") : price > benchmark.avgPrice.high ? t("premiumTier") : t("typicalRange")}
              </span>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                {t("avgRange", { low: benchmark.avgPrice.low, high: benchmark.avgPrice.high })}
              </p>
            </div>
          </div>
        </div>

        {/* ── 3 Scenario Projection Cards ───────────────────────────────── */}
        {a && surplus > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {t("projectionTitle")}
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                {t("scenarioComparison")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map(({ key, title, subtitle, color, gradId, delay }) => {
                const finalAmount  = comparisonData[11][key];
                const finalBaseline = comparisonData[11].withoutPurchase;
                const delta        = key !== "withoutPurchase" ? finalAmount - finalBaseline : null;
                const deltaLabel   = delta !== null
                  ? (delta >= 0 ? `+$${Math.abs(delta).toLocaleString()}` : `−$${Math.abs(delta).toLocaleString()}`)
                  : null;
                const data = comparisonData.map(d => ({ month: d.month, savings: d[key] }));
                return (
                  <ScenarioCard
                    key={key}
                    title={title} subtitle={subtitle} color={color}
                    data={data} yDomain={yDomain} finalAmount={finalAmount}
                    deltaLabel={deltaLabel} deltaPositive={delta !== null && delta >= 0}
                    isDark={isDark} gradId={gradId} delay={delay}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── 2-column: Financial Impact + Sustainability ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginBottom: "1.25rem" }}>

          {/* Financial Impact */}
          {a && (
            <div
              style={{
                background: verdictBg(a.financialVerdict),
                border: `1px solid ${verdictBorder(a.financialVerdict)}`,
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                animation: "fadeUp 0.6s var(--ease-expo) 100ms both",
              }}
            >
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                {t("goalImpact")}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3.25rem", fontWeight: 800, color: verdictColor(a.financialVerdict), letterSpacing: "-0.05em", lineHeight: 1 }}>
                  {a.daysDelayed > 0 ? a.daysDelayed : "0"}
                </span>
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  {a.daysDelayed === 1 ? t("dayDelayed") : t("daysDelayed")}
                </span>
              </div>
              {surplus > 0 && price > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", padding: "0.625rem 0.875rem", background: "var(--color-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{t("savedProgress")}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: verdictColor(a.financialVerdict) }}>
                    {Math.min(100, Math.round((price / surplus) * 100))}{t("ofSurplus")}
                  </span>
                </div>
              )}
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                {a.goalImpact}
              </p>
            </div>
          )}

          {/* Sustainability */}
          {a && (
            <div
              className="card"
              style={{ padding: "1.5rem", animation: "fadeUp 0.6s var(--ease-expo) 180ms both" }}
            >
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                {t("sustainabilitySection")}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: sustainBg(a.sustainabilityRating),
                border: `1px solid ${sustainColor(a.sustainabilityRating)}30`,
                borderRadius: "100px", padding: "0.375rem 1rem", marginBottom: "1rem",
              }}>
                <span style={{ fontSize: "1rem" }}>
                  {a.sustainabilityRating.toLowerCase() === "high" ? "🌿" : a.sustainabilityRating.toLowerCase() === "low" ? "⚠️" : "〜"}
                </span>
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: sustainColor(a.sustainabilityRating) }}>
                  {a.sustainabilityRating} {t("rating")}
                </span>
              </div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                {a.sustainabilityReason}
              </p>
            </div>
          )}
        </div>

        {/* ── 2-column: Goals + Alternative ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginBottom: "1.25rem" }}>

          {/* Goals */}
          {profile.goals.length > 0 && (
            <div className="card" style={{ padding: "1.375rem 1.5rem", animation: "fadeUp 0.6s var(--ease-expo) 140ms both" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "1.125rem" }}>
                {t("yourGoals")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {profile.goals.map(goal => {
                  const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
                  return (
                    <div key={goal.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{goal.name}</span>
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{pct}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {t("goalSaved", { amount: `$${goal.currentAmount.toLocaleString()}` })}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {t("goalTarget", { amount: `$${goal.targetAmount.toLocaleString()}` })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alternative */}
          {a?.alternative && (
            <div
              style={{
                background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-dim)",
                borderRadius: "var(--radius-lg)", padding: "1.5rem",
                animation: "fadeUp 0.6s var(--ease-expo) 220ms both",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)" }}>
                  {t("betterAlternative")}
                </p>
                {a.alternative.savingsPercent > 0 && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "var(--color-accent)", color: "#000", padding: "0.2rem 0.625rem", borderRadius: "100px" }}>
                    −{a.alternative.savingsPercent}%
                  </span>
                )}
              </div>
              <p style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                {a.alternative.name}
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.875rem" }}>
                {a.alternative.estimatedPrice}
              </p>
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "1.125rem" }}>
                {a.alternative.reason}
              </p>
              <a
                href={`https://www.amazon.com/s?k=${encodeURIComponent(a.alternative.name)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-sm btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {t("searchAmazon")}
              </a>
            </div>
          )}
        </div>

        {/* ── Eco Insight ───────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-dim)",
            borderRadius: "var(--radius-lg)", padding: "1.375rem 1.5rem",
            marginBottom: "1.25rem", animation: "fadeUp 0.6s var(--ease-expo) 260ms both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <Leaf size={14} style={{ color: "var(--color-accent)" }} aria-hidden />
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)" }}>
              {t("ecoInsight")}
            </p>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: benchmark.redFlags.length > 0 ? "0.875rem" : 0 }}>
            {benchmark.ecoTip}
          </p>
          {benchmark.redFlags.length > 0 && (
            <>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t("redFlags")}
              </p>
              <ul style={{ margin: 0, paddingLeft: "1.125rem" }}>
                {benchmark.redFlags.slice(0, 3).map((flag, i) => (
                  <li key={i} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>{flag}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Decision Summary ──────────────────────────────────────────── */}
        {a && verdict && (
          <div
            style={{
              background: verdict.bg, border: `1px solid ${verdict.border}`,
              borderRadius: "var(--radius-lg)", padding: "1.75rem",
              marginBottom: "1.25rem", animation: "fadeUp 0.6s var(--ease-expo) 300ms both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: verdict.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 800, color: "#000", flexShrink: 0 }}>
                {verdict.icon}
              </div>
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.125rem" }}>
                  {t("decisionSummary")}
                </p>
                <p style={{ fontSize: "1.125rem", fontWeight: 700, color: verdict.color }}>{verdict.label}</p>
              </div>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "1rem" }}>
              {verdict.text}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: "0.875rem" }}>
              {t("poweredBy")}
            </p>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "360px", animation: "fadeUp 0.6s var(--ease-expo) 340ms both" }}>
          <Link href={`/${locale}/dashboard`} className="btn btn-primary" style={{ justifyContent: "center" }}>
            {t("openDashboard")}
          </Link>
          <Link href={`/${locale}/onboarding`} className="btn btn-ghost" style={{ justifyContent: "center" }}>
            {t("updateProfile")}
          </Link>
        </div>

      </main>
    </div>
  );
}

export default function ProductReportPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "var(--color-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%" }} className="animate-spin" />
        </div>
      }
    >
      <ProductReportInner />
    </Suspense>
  );
}
