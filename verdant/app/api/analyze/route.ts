import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ProductAnalysisRequest, ProductAnalysisResponse } from "@/types";
import { getCategoryBenchmark, buildCategoryContext } from "@/lib/product-dataset";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProductAnalysisRequest;
    const { productName, productPrice, productCategory, brand, userProfile } = body;

    const lang =
      userProfile.language === "es" ? "Spanish" :
      userProfile.language === "fr" ? "French" : "English";

    // ── Server-side financial computations (authoritative — never trust Claude for math) ──
    const totalExpenses = userProfile.expenses?.reduce((s, e) => s + e.monthlyEstimate, 0) ?? 0;
    const monthlySurplus = userProfile.income.monthlyNet - totalExpenses;
    const dailySurplus = monthlySurplus / 30;
    const daysDelayed = dailySurplus > 0 ? Math.round(productPrice / dailySurplus) : 0;
    const percentOfSurplus = monthlySurplus > 0
      ? Math.round((productPrice / monthlySurplus) * 100)
      : 100;

    const primaryGoal = [...(userProfile.goals ?? [])].sort((a, b) =>
      a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0
    )[0];

    const goalContext = primaryGoal
      ? `Primary goal: "${primaryGoal.name}" — needs $${(primaryGoal.targetAmount - primaryGoal.currentAmount).toFixed(0)} more by ${primaryGoal.targetDate}`
      : "No goal set";

    // ── Dataset lookup ──────────────────────────────────────────────────────
    const benchmark = getCategoryBenchmark(productCategory);

    // Find how much user currently spends on this category
    const userCategorySpend = userProfile.expenses
      ?.filter(e => {
        const n = e.name.toLowerCase();
        const cat = productCategory.toLowerCase();
        return (
          n.includes(cat.split(" ")[0]) ||
          (cat.includes("electronic") && /electron|tech|gadget/.test(n)) ||
          (cat.includes("cloth") && /cloth|apparel|fashion/.test(n)) ||
          (cat.includes("beauty") && /beauty|personal care|grooming/.test(n)) ||
          (cat.includes("food") && /food|grocer|dining|restaurant/.test(n))
        );
      })
      .reduce((s, e) => s + e.monthlyEstimate, 0) ?? 0;

    const categoryContext = buildCategoryContext(benchmark, productPrice, userCategorySpend);

    // ── Cost-per-use calculation ────────────────────────────────────────────
    const costPerUse = benchmark.lifespanYears > 0
      ? (productPrice / (benchmark.lifespanYears * 52)).toFixed(2) // weekly uses over lifespan
      : null;

    const prompt = `You are a finance + sustainability advisor for the Vyridian app. Analyze this product purchase and respond with ONLY a JSON object — no markdown, no explanation.

Product:
- Name: ${productName}
- Brand: ${brand ?? "Unknown"}
- Price: $${productPrice.toFixed(2)}
- Category: ${productCategory}

User's financial situation:
- Monthly net income: $${userProfile.income.monthlyNet}
- Monthly expenses: $${totalExpenses.toFixed(0)}
- Monthly surplus: $${monthlySurplus.toFixed(0)}
- ${goalContext}
- Pre-calculated: this purchase = ${percentOfSurplus}% of monthly surplus, delays primary goal by ~${daysDelayed} days
- Sustainability priority: ${userProfile.sustainabilityPriority}
${costPerUse ? `- Estimated cost-per-use: ~$${costPerUse}/week over the product's typical lifespan` : ""}

${categoryContext}

Instructions:
- Use the dataset context above to make your sustainability analysis specific and data-grounded.
- Reference the CO2 footprint, lifespan, and repairability score in your sustainabilityReason.
- For the alternative, apply the ecoAlternativeHint from the dataset context and suggest a real specific product.
- Reference whether this price is above/below/within the typical range for this category.
- Use the pre-calculated daysDelayed (${daysDelayed}) and percentOfSurplus (${percentOfSurplus}) exactly.
- financialVerdict: "minor" if percentOfSurplus ≤ 25, "moderate" if 26–75, "significant" if > 75.
- Respond entirely in ${lang}.

Respond ONLY with this JSON (no extra text, no markdown):
{
  "sustainabilityRating": "High" | "Medium" | "Low",
  "sustainabilityReason": "2 sentences: cite specific CO2 figure (~${benchmark.co2PerPurchaseKg}kg for this category), lifespan (${benchmark.lifespanYears}yr avg), and brand/product-specific factors",
  "goalImpact": "Specific sentence referencing the goal name and exact days, e.g. 'This pushes your Emergency Fund back by ${daysDelayed} days'",
  "daysDelayed": ${daysDelayed},
  "percentOfSurplus": ${percentOfSurplus},
  "financialVerdict": "minor" | "moderate" | "significant",
  "alternative": {
    "name": "A specific real product name or brand that is cheaper or more sustainable (apply the eco strategy from dataset context)",
    "estimatedPrice": "$XX–$XX",
    "savingsPercent": integer % cheaper than original (0 if similar price),
    "reason": "1–2 sentences: cite price difference and/or specific eco benefit vs the original product"
  }
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const clean = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean) as ProductAnalysisResponse;

    // Enforce server-computed values — Claude cannot override math
    parsed.daysDelayed = daysDelayed;
    parsed.percentOfSurplus = percentOfSurplus;
    parsed.financialVerdict = percentOfSurplus <= 25 ? "minor" : percentOfSurplus <= 75 ? "moderate" : "significant";

    // Attach dataset benchmark for frontend display
    parsed.categoryBenchmark = benchmark;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/analyze]", err);
    return NextResponse.json(
      {
        sustainabilityRating: "Medium",
        sustainabilityReason: "Unable to analyze at this time.",
        goalImpact: "Unable to calculate impact.",
        daysDelayed: 0,
        percentOfSurplus: 0,
        financialVerdict: "minor",
        alternative: { name: "—", estimatedPrice: "—", savingsPercent: 0, reason: "—" },
      } satisfies ProductAnalysisResponse,
      { status: 200 }
    );
  }
}
