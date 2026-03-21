"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/authContext";
import { computeMetrics, formatCurrency, formatPercent } from "@/lib/utils";
import { getDailyTip, getDashboardInsight, resolveLocale } from "@/lib/i18n-content";
import Navbar from "@/components/layout/Navbar";
import StatCard from "@/components/ui/StatCard";
import GoalCard from "@/components/ui/GoalCard";
import AIAssistant from "@/components/assistant/AIAssistant";
import FinanceCharts from "@/components/charts/FinanceCharts";
import { Settings, Plus, DollarSign, Target, TrendingUp, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { profile, isOnboarded, clearProfile } = useApp();
  const { user, loading: authLoading } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  // If a logged-in user has a stale profile belonging to a different account, clear it.
  // This handles: demo data, other user's data, or any anonymous session data.
  useEffect(() => {
    if (authLoading) return;
    if (user && profile && profile.ownerId !== user.id) {
      clearProfile();
    }
  }, [authLoading, user, profile, clearProfile]);

  // Wait for auth to resolve before deciding what to render.
  // Without this, there's a flash where auth is null but profile exists (stale localStorage).
  if (authLoading) {
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <div
            className="animate-spin"
            style={{
              width: "28px", height: "28px",
              border: "2.5px solid var(--color-border)",
              borderTopColor: "var(--color-accent)",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    );
  }

  // Compute whether this profile is valid for the current user.
  // Rule: if user is logged in, the profile must be stamped with their ID.
  const profileOwnerMatches = !user || (profile?.ownerId === user.id);
  const showDashboard = isOnboarded && profileOwnerMatches;

  // ── Setup gate ────────────────────────────────────────────────────────────
  if (!showDashboard) {
    const greeting = user ? `Welcome, ${user.first_name}` : "Welcome";
    return (
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />
        <main
          className="container mx-auto px-6 max-w-2xl"
          style={{ paddingTop: "8rem", paddingBottom: "4rem", textAlign: "center" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: "700px", height: "400px",
              background: "radial-gradient(ellipse at center, rgba(0,211,127,0.07) 0%, transparent 70%)",
              top: "8%", left: "50%", transform: "translateX(-50%)",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-dim)" }}
            >
              <TrendingUp size={28} style={{ color: "var(--color-accent)" }} aria-hidden />
            </div>

            <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {greeting}
            </p>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
            >
              To view your insights, enter your financial data
            </h1>
            <p
              className="text-sm mb-8 max-w-sm mx-auto"
              style={{ color: "var(--color-text-secondary)", lineHeight: "1.7" }}
            >
              Your dashboard, graphs, and projections are ready — they just need your real numbers first.
              Takes about 3 minutes.
            </p>

            <Link href={`/${locale}/onboarding`} className="btn btn-lg btn-primary">
              <Plus size={18} aria-hidden />
              Enter my financial data
            </Link>

            {/* What you'll unlock */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {[
                { icon: DollarSign, label: "Income tracking", desc: "Monthly surplus calculation" },
                { icon: ShoppingCart, label: "Spending breakdown", desc: "Category-by-category chart" },
                { icon: Target, label: "Goal progress", desc: "Days until each goal" },
                { icon: TrendingUp, label: "Savings projection", desc: "12-month savings forecast" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="card"
                  style={{ padding: "1rem", opacity: 0.7 }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: "var(--color-accent-subtle)" }}
                  >
                    <Icon size={14} style={{ color: "var(--color-accent)" }} aria-hidden />
                  </div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-primary)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)", lineHeight: "1.4" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // At this point showDashboard is true, so profile is non-null and owner-verified
  const safeProfile = profile!;
  const metrics = computeMetrics(safeProfile);
  const surplusPositive = metrics.monthlySurplus >= 0;
  const displayName = user ? user.first_name : safeProfile.name;
  const resolvedLocale = resolveLocale(locale);
  const dailyTip = getDailyTip(resolvedLocale);
  const dashboardInsight = getDashboardInsight(
    {
      savingsRate: metrics.savingsRate,
      monthlySurplus: metrics.monthlySurplus,
      goalMaxPct: safeProfile.goals.length > 0
        ? Math.max(...safeProfile.goals.map(g => g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0))
        : 0,
    },
    resolvedLocale
  );

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl" style={{ paddingTop: "5.5rem" }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
              {t("welcome", { name: displayName })}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {t("title")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/onboarding`} className="btn btn-sm btn-ghost">
              <Settings size={14} aria-hidden /> Edit profile
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label={t("monthlyIncome")} value={formatCurrency(metrics.monthlyIncome)} />
          <StatCard label={t("totalExpenses")} value={formatCurrency(metrics.totalExpenses)} trend="down" />
          <StatCard
            label={t("surplus")}
            value={formatCurrency(metrics.monthlySurplus)}
            sub={surplusPositive ? "▲ Healthy surplus" : "▼ Overspending"}
            trend={surplusPositive ? "up" : "down"}
          />
          <StatCard
            label={t("savingsRate")}
            value={formatPercent(metrics.savingsRate)}
            sub={metrics.savingsRate >= 20 ? "↑ Above 20% target" : "↓ Below 20% target"}
            trend={metrics.savingsRate >= 20 ? "up" : "neutral"}
          />
        </div>

        {/* Localized insight banner */}
        {dashboardInsight && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm flex items-start gap-3"
            style={{
              background: "var(--color-accent-subtle)",
              border: "1px solid var(--color-accent-dim)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>💡</span>
            <span>{dashboardInsight}</span>
          </div>
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Charts */}
            <section aria-labelledby="charts-heading">
              <h2 id="charts-heading" className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Money Insights
              </h2>
              <FinanceCharts profile={safeProfile} />
            </section>

            {/* Goals */}
            <section aria-labelledby="goals-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="goals-heading" className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t("goalProgress")}
                </h2>
                <Link href={`/${locale}/goals`} className="btn btn-sm btn-ghost" style={{ fontSize: "0.75rem" }}>
                  View all
                </Link>
              </div>
              {safeProfile.goals.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>No goals yet.</p>
                  <Link href={`/${locale}/onboarding`} className="btn btn-sm btn-ghost">
                    <Plus size={14} aria-hidden /> Add goals
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {safeProfile.goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} monthlySurplus={metrics.monthlySurplus} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* AI Assistant + Tip */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI Assistant
              </h2>
              <AIAssistant />
            </div>

            {/* Daily Tip */}
            {dailyTip && (
              <div>
                <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {{ en: "Tip of the Day", es: "Consejo del Día", fr: "Conseil du Jour" }[resolvedLocale]}
                </h2>
                <div
                  className="card p-4"
                  style={{ borderColor: "var(--color-accent-dim)" }}
                >
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)", lineHeight: "1.65" }}>
                    🌱 {dailyTip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
