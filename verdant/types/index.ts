export type Locale = "en" | "es" | "fr";
export type Theme = "light" | "dark" | "high-contrast";
export type LiteracyLevel = "beginner" | "intermediate" | "advanced";
export type SustainabilityPriority = "low" | "medium" | "high";
export type IncomeType = "salary" | "freelance" | "mixed";
export type GoalPriority = "high" | "medium" | "low";
export type SustainabilityRating = "High" | "Medium" | "Low";

export interface ExpenseCategory {
  id: string;
  name: string;
  monthlyEstimate: number;
  isFixed: boolean;
  icon?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: GoalPriority;
}

export interface UserProfile {
  id: string;
  /** Auth user ID this profile belongs to. Required for logged-in users. */
  ownerId?: number;
  name: string;
  language: Locale;
  theme: Theme;
  literacyLevel: LiteracyLevel;
  sustainabilityPriority: SustainabilityPriority;
  income: {
    monthlyNet: number;
    type: IncomeType;
  };
  expenses: ExpenseCategory[];
  goals: FinancialGoal[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ProductAnalysisRequest {
  productName: string;
  productPrice: number;
  productCategory: string;
  brand?: string;
  userProfile: Pick<UserProfile, "income" | "expenses" | "goals" | "language" | "sustainabilityPriority">;
}

export interface CategoryBenchmark {
  name: string;
  avgMonthlySpend: number;
  avgPrice: { low: number; mid: number; high: number };
  sustainabilityScore: number;
  co2PerPurchaseKg: number;
  lifespanYears: number;
  repairabilityScore: number;
  ecoTip: string;
  ecoAlternativeHint: string;
  redFlags: string[];
}

export interface ProductAnalysisResponse {
  sustainabilityRating: SustainabilityRating;
  sustainabilityReason: string;
  goalImpact: string;
  daysDelayed: number;
  percentOfSurplus: number;
  financialVerdict: "minor" | "moderate" | "significant";
  alternative: {
    name: string;
    estimatedPrice: string;
    savingsPercent: number;
    reason: string;
  };
  /** Dataset-backed category benchmarks included in the response */
  categoryBenchmark?: CategoryBenchmark;
}

export interface DashboardMetrics {
  monthlyIncome: number;
  totalExpenses: number;
  monthlySurplus: number;
  savingsRate: number;
  topCategory: string;
}

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  created_at: string;
}
