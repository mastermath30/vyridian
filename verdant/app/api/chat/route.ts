import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;
import type { UserProfile, ChatMessage } from "@/types";
import { buildSpendingComparison } from "@/lib/product-dataset";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(profile: UserProfile | null): string {
  const lang =
    profile?.language === "es"
      ? "Spanish"
      : profile?.language === "fr"
      ? "French"
      : "English";

  const literacy = profile?.literacyLevel ?? "intermediate";

  const financeContext = profile
    ? `
User Financial Profile:
- Name: ${profile.name}
- Monthly net income: $${profile.income.monthlyNet}
- Income type: ${profile.income.type}
- Monthly expenses: ${profile.expenses
        .map((e) => `${e.name}: $${e.monthlyEstimate} (${e.isFixed ? "fixed" : "variable"})`)
        .join(", ")}
- Total monthly expenses: $${profile.expenses.reduce((s, e) => s + e.monthlyEstimate, 0)}
- Monthly surplus: $${profile.income.monthlyNet - profile.expenses.reduce((s, e) => s + e.monthlyEstimate, 0)}
- Financial goals: ${profile.goals
        .map(
          (g) =>
            `${g.name} (target: $${g.targetAmount}, saved: $${g.currentAmount}, deadline: ${g.targetDate}, priority: ${g.priority})`
        )
        .join(" | ")}
- Sustainability priority: ${profile.sustainabilityPriority}
- Financial literacy: ${literacy}

${buildSpendingComparison(profile.expenses, profile.income.monthlyNet)}
`
    : "No user profile available.";

  const tone =
    literacy === "beginner"
      ? "Use very simple language, avoid jargon, and always explain financial terms."
      : literacy === "advanced"
      ? "You can use standard financial terminology and assume strong financial knowledge."
      : "Use clear, accessible language. Briefly explain any financial terms you use.";

  return `You are Vyridian's personal finance AI assistant. You help users understand their financial situation, make better spending decisions, and work toward their financial goals.

${financeContext}

Instructions:
- Always respond in ${lang}.
- ${tone}
- Write in plain, conversational prose. No bullet points, no numbered lists, no bold text, no headers, no asterisks, no markdown formatting of any kind.
- Sound like a knowledgeable friend talking — not a report or a checklist.
- Keep responses concise: 2–3 short paragraphs at most.
- Reference the user's actual data when relevant (goals, spending categories, surplus).
- When suggesting cuts or changes, be specific and empathetic — not preachy.
- For sustainability questions, balance eco-friendly advice with the user's financial reality.
- Never fabricate financial data you don't have.
- Format numbers as currency where appropriate.`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, profile, history } = (await req.json()) as {
      message: string;
      profile: UserProfile | null;
      history: ChatMessage[];
    };

    const systemPrompt = buildSystemPrompt(profile);

    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: systemPrompt,
      messages,
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "Sorry, I couldn't generate a response.";

    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
