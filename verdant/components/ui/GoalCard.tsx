"use client";

import { useTranslations } from "next-intl";
import { goalProgressPercent, projectedGoalDate, formatCurrency } from "@/lib/utils";
import type { FinancialGoal } from "@/types";

interface GoalCardProps {
  goal: FinancialGoal;
  monthlySurplus: number;
}

export default function GoalCard({ goal, monthlySurplus }: GoalCardProps) {
  const t = useTranslations("dashboard");
  const pct = goalProgressPercent(goal);
  const projected = projectedGoalDate(goal, monthlySurplus);

  const progressColor = pct >= 75 ? "#00d47f" : pct >= 40 ? "#4f8ef7" : "#8b5cf6";

  return (
    <article
      className="card p-5 transition-all duration-200"
      style={{ cursor: "default" }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--color-border-strong)";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--color-border)";
        el.style.transform = "";
        el.style.boxShadow = "";
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>{goal.name}</h3>
          <p className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            <span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>{formatCurrency(goal.currentAmount)}</span>
            {" "}/ {formatCurrency(goal.targetAmount)}
          </p>
        </div>
        <span
          className="badge flex-shrink-0"
          style={{
            background: `color-mix(in srgb, ${progressColor} 12%, transparent)`,
            color: progressColor,
            border: `1px solid color-mix(in srgb, ${progressColor} 25%, transparent)`,
          }}
        >
          {Math.round(pct)}%
        </span>
      </div>

      <div
        className="progress-track mb-3"
        style={{ height: "8px" }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.name}: ${Math.round(pct)}% complete`}
      >
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${progressColor}, ${progressColor}99)`,
            boxShadow: `0 0 8px ${progressColor}50`,
          }}
        />
      </div>

      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {t("projectedDate", { date: projected })}
      </p>
    </article>
  );
}
