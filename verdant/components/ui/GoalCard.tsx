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

  return (
    <article
      className="card p-5 transition-all duration-200"
      style={{ cursor: "default" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>{goal.name}</h3>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {formatCurrency(goal.currentAmount)} <span style={{ color: "var(--color-text-muted)" }}>/ {formatCurrency(goal.targetAmount)}</span>
          </p>
        </div>
        <span className="badge badge-green" style={{ flexShrink: 0 }}>
          {Math.round(pct)}%
        </span>
      </div>

      <div
        className="progress-track mb-3"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.name}: ${Math.round(pct)}% complete`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {t("projectedDate", { date: projected })}
      </p>
    </article>
  );
}
