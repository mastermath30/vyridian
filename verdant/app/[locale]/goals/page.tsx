"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/context";
import { computeMetrics, goalProgressPercent, projectedGoalDate, formatCurrency } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { Target } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "badge-red",
  medium: "badge-yellow",
  low: "badge-green",
};

export default function GoalsPage() {
  const t = useTranslations("goals");
  const { profile, isOnboarded } = useApp();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    if (!isOnboarded) router.push(`/${locale}`);
  }, [isOnboarded, locale, router]);

  if (!profile) return null;

  const metrics = computeMetrics(profile);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {t("title")}
        </h1>
        <p className="text-sm mb-7" style={{ color: "var(--color-text-secondary)" }}>
          {t("subtitle")}
        </p>

        {profile.goals.length === 0 ? (
          <div
            className="card p-10 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Target
              size={36}
              className="mx-auto mb-3 opacity-30"
              aria-hidden="true"
            />
            <p>{t("empty")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {profile.goals.map((goal) => {
              const pct = goalProgressPercent(goal);
              const projected = projectedGoalDate(goal, metrics.monthlySurplus);
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <article key={goal.id} className="card p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {goal.name}
                      </h2>
                      <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        Target date: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge ${PRIORITY_COLORS[goal.priority]}`}>
                      {goal.priority} priority
                    </span>
                  </div>

                  {/* Progress */}
                  <div
                    className="progress-track mb-2"
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.name}: ${Math.round(pct)}% complete`}
                  >
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="stat-label">Saved</p>
                      <p className="font-semibold text-base" style={{ color: "var(--color-text-primary)" }}>
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">Remaining</p>
                      <p className="font-semibold text-base" style={{ color: "var(--color-text-primary)" }}>
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">Projected</p>
                      <p className="font-semibold text-base" style={{ color: "var(--color-text-primary)" }}>
                        {projected}
                      </p>
                    </div>
                  </div>

                  {/* Progress pct */}
                  <div
                    className="mt-3 pt-3 text-sm"
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {Math.round(pct)}% complete · {formatCurrency(goal.targetAmount)} total target
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
