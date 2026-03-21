"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/authContext";
import { generateId } from "@/lib/utils";
import type {
  UserProfile,
  ExpenseCategory,
  FinancialGoal,
  IncomeType,
  GoalPriority,
  LiteracyLevel,
  SustainabilityPriority,
} from "@/types";
import { Plus, Trash2, Check } from "lucide-react";

const STEP_COUNT = 4;

const EXPENSE_PRESETS = [
  { icon: "🏠", name: "Rent / Mortgage", isFixed: true },
  { icon: "🛒", name: "Groceries", isFixed: false },
  { icon: "🚗", name: "Transport", isFixed: true },
  { icon: "🍽️", name: "Dining & Takeout", isFixed: false },
  { icon: "📱", name: "Subscriptions", isFixed: true },
  { icon: "👕", name: "Clothing", isFixed: false },
  { icon: "🎮", name: "Entertainment", isFixed: false },
  { icon: "💊", name: "Healthcare", isFixed: false },
];

const GOAL_TEMPLATES: { label: string; targetAmount?: number }[] = [
  { label: "Emergency Fund", targetAmount: 5000 },
  { label: "Down Payment", targetAmount: 20000 },
  { label: "New Car", targetAmount: 15000 },
  { label: "Vacation", targetAmount: 3000 },
  { label: "Education", targetAmount: 10000 },
  { label: "Custom" },
];

const STEP_HEADLINES = [
  "What's your monthly income?",
  "What are your monthly expenses?",
  "What are you saving for?",
  "Almost done — tell us about yourself",
];
const STEP_SUBTITLES = [
  "We use this to calculate your monthly surplus and how purchases affect your goals.",
  "Add your regular monthly costs. We'll use these to find your disposable income.",
  "Set up to 5 savings goals. We'll show how each purchase impacts your progress.",
  "Personalize your experience with a name and preferences.",
];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const { setProfile } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const [step, setStep] = useState(1);

  // Income state
  const [monthlyNet, setMonthlyNet] = useState("");
  const [incomeType, setIncomeType] = useState<IncomeType>("salary");

  // Expenses state
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(
    EXPENSE_PRESETS.map((e) => ({ ...e, id: generateId(), monthlyEstimate: 0 }))
  );

  // Goals state
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: generateId(),
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
      priority: "high",
    },
  ]);

  // Preferences state
  const [name, setName] = useState("");
  const [literacyLevel, setLiteracyLevel] = useState<LiteracyLevel>("intermediate");
  const [sustainabilityPriority, setSustainabilityPriority] =
    useState<SustainabilityPriority>("medium");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Validation ────────────────────────────────────────────────────────────
  function validateStep(): boolean {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!monthlyNet || parseFloat(monthlyNet) <= 0) {
        newErrors.monthlyNet = t("required");
      }
    }
    if (step === 3) {
      goals.forEach((g, i) => {
        if (!g.name) newErrors[`goal_name_${i}`] = t("required");
        if (!g.targetAmount) newErrors[`goal_target_${i}`] = t("required");
        if (!g.targetDate) newErrors[`goal_date_${i}`] = t("required");
      });
    }
    if (step === 4) {
      if (!name.trim()) newErrors.name = t("required");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < STEP_COUNT) {
      setStep((s) => s + 1);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinish();
    }
  }

  function handleFinish() {
    const profile: UserProfile = {
      id: generateId(),
      // Stamp with the current auth user's ID so the dashboard can verify ownership
      ...(user?.id ? { ownerId: user.id } : {}),
      name: name.trim(),
      language: locale as "en" | "es" | "fr",
      theme: "dark",
      literacyLevel,
      sustainabilityPriority,
      income: { monthlyNet: parseFloat(monthlyNet), type: incomeType },
      expenses: expenses.filter((e) => e.monthlyEstimate > 0 || e.isFixed),
      goals: goals.filter((g) => g.name && g.targetAmount),
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    router.push(`/${locale}/dashboard`);
  }

  // ── Expense helpers ───────────────────────────────────────────────────────
  function updateExpense(
    id: string,
    field: keyof ExpenseCategory,
    value: string | number | boolean
  ) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function addExpense() {
    setExpenses((prev) => [
      ...prev,
      { id: generateId(), name: "", monthlyEstimate: 0, isFixed: false, icon: "📦" },
    ]);
  }

  function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  // ── Goal helpers ──────────────────────────────────────────────────────────
  function updateGoal(
    id: string,
    field: keyof FinancialGoal,
    value: string | number
  ) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  }

  function addGoal() {
    if (goals.length >= 5) return;
    setGoals((prev) => [
      ...prev,
      {
        id: generateId(),
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        targetDate: "",
        priority: "medium",
      },
    ]);
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function applyGoalTemplate(goalId: string, tpl: { label: string; targetAmount?: number }) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              name: tpl.label === "Custom" ? "" : tpl.label,
              targetAmount: tpl.targetAmount ?? g.targetAmount,
            }
          : g
      )
    );
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.monthlyEstimate || 0), 0);
  const progressPct = ((step - 1) / (STEP_COUNT - 1)) * 100;

  // ── Pill component ────────────────────────────────────────────────────────
  function Pill({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="onboarding-pill"
        style={{
          background: active ? "var(--color-accent)" : "var(--color-surface-raised)",
          color: active ? "#000" : "var(--color-text-secondary)",
          border: active
            ? "1.5px solid var(--color-accent)"
            : "1.5px solid var(--color-border)",
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* Top progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "var(--color-border)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "var(--color-accent)",
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>

      <main
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "5rem 1.5rem 3rem",
        }}
      >
        {/* Step badge */}
        <div className="badge badge-green" style={{ marginBottom: "1.25rem", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
          STEP {step} OF {STEP_COUNT}
        </div>

        {/* Step headline */}
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
            lineHeight: 1.2,
          }}
        >
          {STEP_HEADLINES[step - 1]}
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          {STEP_SUBTITLES[step - 1]}
        </p>

        {/* ── Step 1: Income ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            {/* Large income input */}
            <div className="form-group">
              <label className="form-label" htmlFor="monthly-net">
                {t("income.monthlyNet")}
              </label>
              <p className="form-helper">{t("income.monthlyNetHelper")}</p>
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  marginTop: "0.5rem",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  $
                </span>
                <input
                  id="monthly-net"
                  type="number"
                  min="0"
                  value={monthlyNet}
                  onChange={(e) => setMonthlyNet(e.target.value)}
                  placeholder="4200"
                  aria-required="true"
                  aria-describedby={errors.monthlyNet ? "monthly-net-error" : undefined}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              {errors.monthlyNet && (
                <p id="monthly-net-error" className="form-error" role="alert">
                  {errors.monthlyNet}
                </p>
              )}
            </div>

            {/* Income type pills */}
            <div className="form-group">
              <label className="form-label">{t("income.incomeType")}</label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {(["salary", "freelance", "mixed"] as IncomeType[]).map((type) => (
                  <Pill
                    key={type}
                    label={t(`income.${type}`)}
                    active={incomeType === type}
                    onClick={() => setIncomeType(type)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Expenses ── */}
        {step === 2 && (
          <div>
            {/* Total summary */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "var(--color-surface-raised)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: "1rem",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Monthly total
              </span>
              <span
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                ${totalExpenses.toLocaleString()}/mo
              </span>
            </div>

            {/* Expense rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {expenses.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                  }}
                >
                  {/* Icon + name */}
                  <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>
                    {(e as ExpenseCategory & { icon?: string }).icon ?? "📦"}
                  </span>
                  <input
                    type="text"
                    value={e.name}
                    onChange={(ev) => updateExpense(e.id, "name", ev.target.value)}
                    placeholder="Category name"
                    className="input"
                    style={{
                      flex: 1,
                      fontSize: "0.875rem",
                      padding: "0.4rem 0.75rem",
                    }}
                    aria-label="Expense category name"
                  />
                  {/* Amount */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "0.625rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.875rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={e.monthlyEstimate || ""}
                      onChange={(ev) =>
                        updateExpense(e.id, "monthlyEstimate", parseFloat(ev.target.value) || 0)
                      }
                      className="input"
                      style={{
                        paddingLeft: "1.5rem",
                        width: "6rem",
                        fontSize: "0.875rem",
                        padding: "0.4rem 0.5rem 0.4rem 1.4rem",
                      }}
                      aria-label={`Monthly amount for ${e.name}`}
                      placeholder="0"
                    />
                  </div>
                  {/* Trash */}
                  <button
                    type="button"
                    onClick={() => removeExpense(e.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem",
                      color: "var(--color-text-muted)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={`Remove ${e.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add category button */}
            <button
              type="button"
              onClick={addExpense}
              className="btn-ghost"
              style={{
                marginTop: "0.75rem",
                width: "100%",
                justifyContent: "center",
                fontSize: "0.875rem",
              }}
            >
              <Plus size={15} aria-hidden="true" />
              {t("expenses.addCategory")}
            </button>
          </div>
        )}

        {/* ── Step 3: Goals ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {goals.map((g, i) => {
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);
              return (
                <div key={g.id} className="card" style={{ padding: "1.25rem" }}>
                  {/* Goal header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Goal {i + 1}
                    </span>
                    {goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoal(g.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-danger)",
                          display: "flex",
                          alignItems: "center",
                          padding: "0.25rem",
                        }}
                        aria-label={t("goals.remove")}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Template pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                    {GOAL_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => applyGoalTemplate(g.id, tpl)}
                        className="onboarding-pill"
                        style={{
                          background:
                            g.name === tpl.label || (tpl.label === "Custom" && !GOAL_TEMPLATES.slice(0, -1).some((t2) => t2.label === g.name))
                              ? "var(--color-accent-subtle)"
                              : "var(--color-surface-raised)",
                          color:
                            g.name === tpl.label
                              ? "var(--color-accent)"
                              : "var(--color-text-muted)",
                          border:
                            g.name === tpl.label
                              ? "1.5px solid var(--color-accent-dim)"
                              : "1.5px solid var(--color-border)",
                          fontSize: "0.75rem",
                          padding: "0.3rem 0.75rem",
                        }}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>

                  {/* Goal name */}
                  <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                    <label className="form-label text-sm" htmlFor={`goal-name-${g.id}`}>
                      {t("goals.goalName")}
                    </label>
                    <input
                      id={`goal-name-${g.id}`}
                      type="text"
                      value={g.name}
                      onChange={(e) => updateGoal(g.id, "name", e.target.value)}
                      placeholder={t("goals.goalNamePlaceholder")}
                      className="input"
                      style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                      aria-required="true"
                      aria-describedby={errors[`goal_name_${i}`] ? `goal-name-err-${i}` : undefined}
                    />
                    {errors[`goal_name_${i}`] && (
                      <p id={`goal-name-err-${i}`} className="form-error" role="alert">
                        {errors[`goal_name_${i}`]}
                      </p>
                    )}
                  </div>

                  {/* Target + Current */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8125rem" }} htmlFor={`goal-target-${g.id}`}>
                        {t("goals.targetAmount")}
                      </label>
                      <div style={{ position: "relative", marginTop: "0.25rem" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "0.75rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.875rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          $
                        </span>
                        <input
                          id={`goal-target-${g.id}`}
                          type="number"
                          min="0"
                          value={g.targetAmount || ""}
                          onChange={(e) =>
                            updateGoal(g.id, "targetAmount", parseFloat(e.target.value) || 0)
                          }
                          className="input"
                          style={{ paddingLeft: "1.5rem", fontSize: "0.875rem" }}
                          aria-required="true"
                        />
                      </div>
                      {errors[`goal_target_${i}`] && (
                        <p className="form-error" role="alert">
                          {errors[`goal_target_${i}`]}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8125rem" }} htmlFor={`goal-current-${g.id}`}>
                        {t("goals.currentAmount")}
                      </label>
                      <div style={{ position: "relative", marginTop: "0.25rem" }}>
                        <span
                          style={{
                            position: "absolute",
                            left: "0.75rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.875rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          $
                        </span>
                        <input
                          id={`goal-current-${g.id}`}
                          type="number"
                          min="0"
                          value={g.currentAmount || ""}
                          onChange={(e) =>
                            updateGoal(g.id, "currentAmount", parseFloat(e.target.value) || 0)
                          }
                          className="input"
                          style={{ paddingLeft: "1.5rem", fontSize: "0.875rem" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remaining */}
                  {g.targetAmount > 0 && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-muted)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Remaining to save:{" "}
                      <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                        ${remaining.toLocaleString()}
                      </span>
                    </p>
                  )}

                  {/* Date + Priority */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8125rem" }} htmlFor={`goal-date-${g.id}`}>
                        {t("goals.targetDate")}
                      </label>
                      <input
                        id={`goal-date-${g.id}`}
                        type="date"
                        value={g.targetDate}
                        onChange={(e) => updateGoal(g.id, "targetDate", e.target.value)}
                        className="input"
                        style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                        aria-required="true"
                        aria-describedby={errors[`goal_date_${i}`] ? `goal-date-err-${i}` : undefined}
                      />
                      {errors[`goal_date_${i}`] && (
                        <p id={`goal-date-err-${i}`} className="form-error" role="alert">
                          {errors[`goal_date_${i}`]}
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.8125rem" }}>
                        {t("goals.priority")}
                      </label>
                      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.25rem" }}>
                        {(["high", "medium", "low"] as GoalPriority[]).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateGoal(g.id, "priority", p)}
                            className="onboarding-pill"
                            style={{
                              flex: 1,
                              fontSize: "0.75rem",
                              padding: "0.3rem 0.25rem",
                              background:
                                g.priority === p
                                  ? p === "high"
                                    ? "rgba(239,68,68,0.15)"
                                    : p === "medium"
                                    ? "rgba(245,158,11,0.15)"
                                    : "var(--color-accent-subtle)"
                                  : "var(--color-surface-raised)",
                              color:
                                g.priority === p
                                  ? p === "high"
                                    ? "var(--color-danger)"
                                    : p === "medium"
                                    ? "var(--color-warning)"
                                    : "var(--color-accent)"
                                  : "var(--color-text-muted)",
                              border:
                                g.priority === p
                                  ? `1.5px solid ${p === "high" ? "rgba(239,68,68,0.3)" : p === "medium" ? "rgba(245,158,11,0.3)" : "var(--color-accent-dim)"}`
                                  : "1.5px solid var(--color-border)",
                              fontWeight: g.priority === p ? 700 : 400,
                              textTransform: "capitalize",
                            }}
                          >
                            {t(`goals.${p}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.length < 5 && (
              <button
                type="button"
                onClick={addGoal}
                className="btn-ghost"
                style={{ justifyContent: "center", fontSize: "0.875rem" }}
              >
                <Plus size={15} aria-hidden="true" />
                {t("goals.addGoal")}
              </button>
            )}
          </div>
        )}

        {/* ── Step 4: Preferences ── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="pref-name">
                {t("preferences.name")}
              </label>
              <p className="form-helper">{t("preferences.nameHelper")}</p>
              <input
                id="pref-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                style={{ marginTop: "0.5rem" }}
                placeholder="e.g. Maya"
                aria-required="true"
                aria-describedby={errors.name ? "pref-name-error" : undefined}
              />
              {errors.name && (
                <p id="pref-name-error" className="form-error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Sustainability priority: 3 visual cards */}
            <div className="form-group">
              <label className="form-label">{t("preferences.sustainability")}</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                {(
                  [
                    {
                      value: "low" as SustainabilityPriority,
                      icon: "💰",
                      label: "Budget First",
                      desc: "Optimize for savings",
                    },
                    {
                      value: "medium" as SustainabilityPriority,
                      icon: "⚖️",
                      label: "Balanced",
                      desc: "Balance money and planet",
                    },
                    {
                      value: "high" as SustainabilityPriority,
                      icon: "🌿",
                      label: "Eco First",
                      desc: "Prioritize green choices",
                    },
                  ] as const
                ).map(({ value, icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSustainabilityPriority(value)}
                    style={{
                      background:
                        sustainabilityPriority === value
                          ? "var(--color-accent-subtle)"
                          : "var(--color-surface)",
                      border:
                        sustainabilityPriority === value
                          ? "2px solid var(--color-accent)"
                          : "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem 0.75rem",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color:
                          sustainabilityPriority === value
                            ? "var(--color-accent)"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial literacy pills */}
            <div className="form-group">
              <label className="form-label">{t("preferences.literacyLevel")}</label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {(
                  [
                    { value: "beginner" as LiteracyLevel, label: "Beginner" },
                    { value: "intermediate" as LiteracyLevel, label: "Intermediate" },
                    { value: "advanced" as LiteracyLevel, label: "Expert" },
                  ] as const
                ).map(({ value, label }) => (
                  <Pill
                    key={value}
                    label={label}
                    active={literacyLevel === value}
                    onClick={() => setLiteracyLevel(value)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (step === 1) router.push(`/${locale}`);
              else setStep((s) => s - 1);
            }}
            className="btn btn-secondary"
            style={{ minWidth: "8rem" }}
          >
            {step === 1 ? "← Home" : t("back")}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            style={{ minWidth: "8rem" }}
          >
            {step === STEP_COUNT ? (
              <>
                <Check size={16} aria-hidden="true" />
                {t("finish")}
              </>
            ) : (
              t("next")
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
