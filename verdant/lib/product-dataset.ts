/**
 * Vyridian Product Dataset
 *
 * Real-world benchmarks compiled from:
 *   - US Bureau of Labor Statistics Consumer Expenditure Survey 2022/2023
 *   - EPA Life Cycle Assessment databases & Carbon Trust data
 *   - Ellen MacArthur Foundation (circular economy / fashion)
 *   - iFixit Repairability Scores (electronics)
 *   - WRAP (Waste & Resources Action Programme) materials data
 *
 * Used to:
 *   - Ground Claude AI responses in real numbers
 *   - Show "you vs. average" spending comparisons on the dashboard
 *   - Provide sustainability context per product category
 *   - Guide eco-alternative suggestions
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CategoryBenchmark {
  /** Display name */
  name: string;
  /** Average US household monthly spend on this category (USD) — BLS CEX 2022 */
  avgMonthlySpend: number;
  /** Typical price range for an average purchase in this category */
  avgPrice: { low: number; mid: number; high: number };
  /**
   * Composite sustainability score 0–100 (higher = more sustainable).
   * Factors: CO2/item, lifespan, recyclability, supply-chain impact.
   */
  sustainabilityScore: number;
  /** Average CO2 equivalent (kg) for a typical single purchase in this category */
  co2PerPurchaseKg: number;
  /** Average useful lifespan in years for products in this category */
  lifespanYears: number;
  /**
   * Repairability score 1–10 (iFixit-inspired scale).
   * 10 = easily repaired at home; 1 = effectively not repairable.
   */
  repairabilityScore: number;
  /** Short eco-action tip specific to this category */
  ecoTip: string;
  /** What to look for when buying a more sustainable alternative */
  ecoAlternativeHint: string;
  /** Key sustainability red flags in this category */
  redFlags: string[];
}

// ─── Dataset ─────────────────────────────────────────────────────────────────

export const CATEGORY_DATA: Record<string, CategoryBenchmark> = {
  electronics: {
    name: "Electronics",
    avgMonthlySpend: 125, // BLS: ~$1,500/yr for consumer electronics
    avgPrice: { low: 20, mid: 200, high: 1200 },
    sustainabilityScore: 32,
    co2PerPurchaseKg: 70, // smartphone ~70 kg, laptop ~300 kg, accessories ~10 kg — weighted avg
    lifespanYears: 3,
    repairabilityScore: 4,
    ecoTip: "Extend device life by 1 extra year → cut its carbon footprint by ~30%.",
    ecoAlternativeHint: "Look for refurbished/certified-pre-owned devices; seek brands with repair programs (Fairphone, Framework).",
    redFlags: ["Non-replaceable battery", "No repair manual", "Proprietary screws", "No recycling program"],
  },

  clothing: {
    name: "Clothing & Apparel",
    avgMonthlySpend: 150, // BLS: ~$1,800/yr clothing + services
    avgPrice: { low: 15, mid: 60, high: 300 },
    sustainabilityScore: 22,
    co2PerPurchaseKg: 15, // t-shirt ~7 kg CO2, jeans ~33 kg CO2, dress ~22 kg CO2
    lifespanYears: 2.2, // fast fashion average before disposal
    repairabilityScore: 7,
    ecoTip: "Buying secondhand saves up to 82% of the carbon cost vs. buying new.",
    ecoAlternativeHint: "Shop ThredUp, Poshmark, or local thrift stores. Brands: Patagonia (repair pledge), Eileen Fisher (take-back), tentree.",
    redFlags: ["No fiber content label", "Less than $15 price point for garments", "'Eco' claims without certification (GOTS, Bluesign)"],
  },

  footwear: {
    name: "Footwear",
    avgMonthlySpend: 80, // BLS: ~$960/yr footwear
    avgPrice: { low: 25, mid: 90, high: 350 },
    sustainabilityScore: 28,
    co2PerPurchaseKg: 12, // average sneaker ~14 kg CO2; leather boots ~20 kg
    lifespanYears: 2,
    repairabilityScore: 6,
    ecoTip: "A cobbler can re-sole quality shoes for $30–$60, extending life by 3–5 years.",
    ecoAlternativeHint: "Look for Allbirds (carbon-labelled), Veja (organic/fair-trade), or buy leather that can be resoled.",
    redFlags: ["Glued-on soles (not stitched)", "Synthetic foam midsoles with no recycling path", "Ultra-cheap construction"],
  },

  home_furniture: {
    name: "Home & Furniture",
    avgMonthlySpend: 100, // BLS: ~$1,200/yr household furnishings
    avgPrice: { low: 20, mid: 150, high: 1500 },
    sustainabilityScore: 52,
    co2PerPurchaseKg: 80, // office chair ~40 kg, sofa ~200 kg, lamp ~5 kg — weighted avg
    lifespanYears: 10,
    repairabilityScore: 6,
    ecoTip: "Solid-wood furniture lasts 3–5× longer than particle-board and holds resale value.",
    ecoAlternativeHint: "Facebook Marketplace, Craigslist, and Habitat ReStores have quality secondhand furniture at 60–80% off.",
    redFlags: ["Particle board / MDF (emits formaldehyde, hard to recycle)", "Non-removable upholstery", "No country-of-origin disclosure"],
  },

  beauty: {
    name: "Beauty & Personal Care",
    avgMonthlySpend: 50, // BLS: ~$600/yr personal care products
    avgPrice: { low: 8, mid: 30, high: 120 },
    sustainabilityScore: 42,
    co2PerPurchaseKg: 1.8, // includes manufacturing + packaging (mostly packaging-driven)
    lifespanYears: 0.4, // consumables used within weeks to months
    repairabilityScore: 1, // not applicable — consumable
    ecoTip: "Concentrated or solid-bar formulas use 80% less plastic and last 2–3× longer.",
    ecoAlternativeHint: "Look for reef-safe, ECOCERT-certified, refillable formats. Brands: Ethique (solid bars), Meow Meow Tweet, LUSH.",
    redFlags: ["Microbeads (banned in US but still in some imports)", "Non-recyclable pump bottles", "Undisclosed fragrance"],
  },

  health_supplements: {
    name: "Health & Supplements",
    avgMonthlySpend: 55, // estimated avg US adult supplement spend
    avgPrice: { low: 10, mid: 35, high: 100 },
    sustainabilityScore: 56,
    co2PerPurchaseKg: 2.5,
    lifespanYears: 0.2, // consumed within weeks
    repairabilityScore: 1,
    ecoTip: "Whole-food sources of nutrients (lentils, nuts, leafy greens) are 90% cheaper than supplements with equivalent nutrition.",
    ecoAlternativeHint: "For supplements you need, look for third-party tested (USP, NSF), minimal packaging, and bulk sizes.",
    redFlags: ["No third-party testing seal", "Proprietary blends (hidden dosages)", "Excessive plastic packaging"],
  },

  books: {
    name: "Books",
    avgMonthlySpend: 20, // BLS: ~$240/yr reading
    avgPrice: { low: 5, mid: 18, high: 50 },
    sustainabilityScore: 68,
    co2PerPurchaseKg: 1.1, // new printed book ~1 kg CO2; e-book ~0.01 kg after device amortized
    lifespanYears: 50,
    repairabilityScore: 10, // you can tape a spine
    ecoTip: "Borrowing from your library is free and avoids all production CO2 entirely.",
    ecoAlternativeHint: "ThriftBooks, Better World Books (donates unsold books), or local used bookshops. E-books eliminate per-book CO2.",
    redFlags: ["Buying new textbooks (marked up 800% vs secondhand)", "Single-use coffee-table books"],
  },

  toys_games: {
    name: "Toys & Games",
    avgMonthlySpend: 45, // BLS: ~$540/yr toys, hobbies, games
    avgPrice: { low: 10, mid: 35, high: 200 },
    sustainabilityScore: 30,
    co2PerPurchaseKg: 7, // average toy ~5–10 kg CO2 (plastic manufacturing intensive)
    lifespanYears: 3,
    repairabilityScore: 5,
    ecoTip: "Toy libraries and rental programs let kids enjoy variety without accumulation.",
    ecoAlternativeHint: "LEGO has a take-back program. Open-ended wooden toys (HABA, PlanToys) last decades. Buy secondhand via eBay.",
    redFlags: ["Battery-only (no rechargeable option)", "Single-use packaging", "Toys sold in non-recyclable mixed-material packaging"],
  },

  food_beverage: {
    name: "Food & Beverage",
    avgMonthlySpend: 460, // BLS: ~$5,550/yr food ($3,030 at home + $2,520 away from home) — household avg
    avgPrice: { low: 5, mid: 30, high: 150 },
    sustainabilityScore: 62,
    co2PerPurchaseKg: 4, // highly variable: beef ~27 kg/kg food, vegetables ~2 kg/kg food
    lifespanYears: 0.05, // consumed within days/weeks
    repairabilityScore: 1, // not applicable
    ecoTip: "Reducing beef consumption by 1 meal/week saves ~200 kg CO2/year — equivalent to not driving for 3 weeks.",
    ecoAlternativeHint: "Plant-based proteins, seasonal/local produce, bulk-bin buying, and reducing food waste are the highest-impact changes.",
    redFlags: ["Ultra-processed foods with palm oil", "Single-use plastic packaging", "Out-of-season imports"],
  },

  general: {
    name: "General",
    avgMonthlySpend: 50,
    avgPrice: { low: 10, mid: 50, high: 300 },
    sustainabilityScore: 50,
    co2PerPurchaseKg: 8,
    lifespanYears: 5,
    repairabilityScore: 5,
    ecoTip: "Before buying anything, ask: do I need this, can I borrow it, or can I buy it secondhand?",
    ecoAlternativeHint: "Search on Facebook Marketplace, OfferUp, or eBay for a used version before buying new.",
    redFlags: ["Planned obsolescence", "No warranty", "Single-use design"],
  },
};

// ─── Spending Benchmarks for Expense Categories ───────────────────────────────
// Used by the AI assistant and dashboard charts to compare user vs. average

export interface SpendingBenchmark {
  category: string; // User-facing name
  avgMonthlyUSD: number; // US average monthly household spend
  pctOfIncome: number; // % of gross household income (BLS avg ~$94k/yr)
}

export const SPENDING_BENCHMARKS: SpendingBenchmark[] = [
  { category: "Housing / Rent", avgMonthlyUSD: 2025, pctOfIncome: 33 },
  { category: "Groceries / Food", avgMonthlyUSD: 503, pctOfIncome: 8 },
  { category: "Dining / Restaurants", avgMonthlyUSD: 336, pctOfIncome: 5.5 },
  { category: "Transportation", avgMonthlyUSD: 900, pctOfIncome: 16 },
  { category: "Healthcare", avgMonthlyUSD: 490, pctOfIncome: 8 },
  { category: "Clothing / Apparel", avgMonthlyUSD: 150, pctOfIncome: 2.5 },
  { category: "Entertainment", avgMonthlyUSD: 280, pctOfIncome: 4.6 },
  { category: "Subscriptions", avgMonthlyUSD: 85, pctOfIncome: 1.4 },
  { category: "Electronics", avgMonthlyUSD: 125, pctOfIncome: 2 },
  { category: "Personal Care / Beauty", avgMonthlyUSD: 50, pctOfIncome: 0.8 },
  { category: "Education", avgMonthlyUSD: 110, pctOfIncome: 1.8 },
  { category: "Utilities", avgMonthlyUSD: 270, pctOfIncome: 4.4 },
  { category: "Insurance", avgMonthlyUSD: 585, pctOfIncome: 9.5 },
  { category: "Savings / Investments", avgMonthlyUSD: 750, pctOfIncome: 12 },
];

// ─── Lookup Functions ─────────────────────────────────────────────────────────

/**
 * Look up category benchmark data by category name.
 * Fuzzy-matches against common category strings returned by the content script.
 */
export function getCategoryBenchmark(category: string): CategoryBenchmark {
  const c = (category || "").toLowerCase();

  if (/electron|laptop|phone|tablet|headphone|speaker|camera|tv|monitor|keyboard|mouse|cable|charger|earbuds|console/.test(c))
    return CATEGORY_DATA.electronics;

  if (/cloth|apparel|shirt|jacket|pants|dress|hoodie|sweater|coat|jeans/.test(c))
    return CATEGORY_DATA.clothing;

  if (/shoe|boot|sandal|sneaker|footwear/.test(c))
    return CATEGORY_DATA.footwear;

  if (/home|furniture|sofa|chair|desk|lamp|shelf|bed|mattress|pillow|blanket|curtain/.test(c))
    return CATEGORY_DATA.home_furniture;

  if (/beauty|personal care|shampoo|moisturizer|skincare|serum|mascara|lipstick|cleanser|sunscreen/.test(c))
    return CATEGORY_DATA.beauty;

  if (/health|supplement|vitamin|protein|omega|probiotic/.test(c))
    return CATEGORY_DATA.health_supplements;

  if (/book|novel|textbook/.test(c))
    return CATEGORY_DATA.books;

  if (/toy|game|puzzle|lego|play/.test(c))
    return CATEGORY_DATA.toys_games;

  if (/food|beverage|snack|drink|coffee|tea|grocery/.test(c))
    return CATEGORY_DATA.food_beverage;

  return CATEGORY_DATA.general;
}

/**
 * Find the best matching spending benchmark for a user expense category name.
 * Returns null if no reasonable match found.
 */
export function matchSpendingBenchmark(expenseName: string): SpendingBenchmark | null {
  const n = (expenseName || "").toLowerCase();

  if (/rent|housing|mortgage|apartment/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Housing"))!;
  if (/groceri|food|supermarket|costco|walmart/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Groceries"))!;
  if (/dining|restaurant|takeout|takeaway|delivery|eat out/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Dining"))!;
  if (/transport|car|gas|petrol|uber|lyft|transit|bus|train/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Transportation"))!;
  if (/health|doctor|medical|pharmacy|dental/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Healthcare"))!;
  if (/cloth|apparel|fashion|wardrobe/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Clothing"))!;
  if (/entertainment|fun|hobby|concert|movie/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Entertainment"))!;
  if (/subscription|netflix|spotify|amazon prime|hulu|disney/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Subscriptions"))!;
  if (/electron|tech|gadget/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Electronics"))!;
  if (/beauty|personal care|grooming|cosmetic/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Personal Care"))!;
  if (/education|tuition|course|school/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Education"))!;
  if (/util|electric|water|internet|phone bill/.test(n))
    return SPENDING_BENCHMARKS.find(b => b.category.startsWith("Utilities"))!;

  return null;
}

/**
 * Build a spending comparison string for the AI assistant.
 * e.g. "You spend $250/month on Dining (avg: $336/month — you're 26% below average)"
 */
export function buildSpendingComparison(
  expenses: Array<{ name: string; monthlyEstimate: number }>,
  monthlyIncome: number
): string {
  const lines: string[] = [];

  for (const expense of expenses) {
    const benchmark = matchSpendingBenchmark(expense.name);
    if (!benchmark) continue;

    const diff = expense.monthlyEstimate - benchmark.avgMonthlyUSD;
    const pct = Math.abs(Math.round((diff / benchmark.avgMonthlyUSD) * 100));
    const direction = diff > 0 ? "above" : "below";
    const incomeShare = monthlyIncome > 0
      ? Math.round((expense.monthlyEstimate / monthlyIncome) * 100)
      : 0;

    lines.push(
      `${expense.name}: $${expense.monthlyEstimate}/mo (avg $${benchmark.avgMonthlyUSD}/mo — ${pct}% ${direction} average; ${incomeShare}% of your income)`
    );
  }

  return lines.length > 0
    ? "Spending vs. US averages:\n" + lines.join("\n")
    : "";
}

/**
 * Compute a sustainability score context string for use in Claude prompts.
 */
export function buildCategoryContext(
  benchmark: CategoryBenchmark,
  productPrice: number,
  userMonthlyCategorySpend: number
): string {
  const priceVsAvg = benchmark.avgPrice.mid > 0
    ? productPrice < benchmark.avgPrice.low
      ? "below the typical price range (possible quality concern)"
      : productPrice > benchmark.avgPrice.high
      ? "above the typical price range (premium tier)"
      : "within the typical price range"
    : "";

  const spendVsAvg = userMonthlyCategorySpend > 0
    ? `User spends $${userMonthlyCategorySpend}/month on this category (national avg: $${benchmark.avgMonthlySpend}/month).`
    : "";

  return `
Category Dataset Context (${benchmark.name}):
- National avg monthly spend: $${benchmark.avgMonthlySpend}/month per household
- Typical price range: $${benchmark.avgPrice.low}–$${benchmark.avgPrice.high} (this item is ${priceVsAvg})
- Sustainability score: ${benchmark.sustainabilityScore}/100 (${benchmark.sustainabilityScore < 35 ? "low" : benchmark.sustainabilityScore < 60 ? "medium" : "high"} sustainability category)
- Avg CO2 per purchase: ~${benchmark.co2PerPurchaseKg} kg CO2e
- Avg product lifespan: ${benchmark.lifespanYears} year${benchmark.lifespanYears !== 1 ? "s" : ""}
- Repairability: ${benchmark.repairabilityScore}/10
- Eco tip: ${benchmark.ecoTip}
- Better alternative strategy: ${benchmark.ecoAlternativeHint}
${spendVsAvg}`.trim();
}
