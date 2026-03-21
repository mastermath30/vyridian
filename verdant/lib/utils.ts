import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserProfile, DashboardMetrics, FinancialGoal } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function computeMetrics(profile: UserProfile): DashboardMetrics {
  const monthlyIncome = profile.income.monthlyNet;
  const totalExpenses = profile.expenses.reduce(
    (sum, e) => sum + e.monthlyEstimate,
    0
  );
  const monthlySurplus = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;
  const topCategory =
    profile.expenses.sort((a, b) => b.monthlyEstimate - a.monthlyEstimate)[0]
      ?.name ?? "—";

  return { monthlyIncome, totalExpenses, monthlySurplus, savingsRate, topCategory };
}

export function goalProgressPercent(goal: FinancialGoal): number {
  if (goal.targetAmount === 0) return 0;
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
}

export function projectedGoalDate(goal: FinancialGoal, monthlySurplus: number): string {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return "Reached!";
  if (monthlySurplus <= 0) return "No surplus";
  const monthsLeft = Math.ceil(remaining / monthlySurplus);
  const date = new Date();
  date.setMonth(date.getMonth() + monthsLeft);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
