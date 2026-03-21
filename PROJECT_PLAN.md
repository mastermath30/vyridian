# PROJECT_PLAN.md
> Personal Finance + Sustainability Platform with Browser Extension and Claude AI Assistant

---

## Project Title Ideas

1. **Verdant** — _Verde_ (green) + financial clarity. Evokes sustainability and growth.
2. **MintWise** — Combining money (mint) with smart decision-making.
3. **Clarity Finance** — Straightforward, accessible, goal-focused.
4. **GoalMark** — Goal tracking meets mindful spending.
5. **EcoLedger** — Eco-conscious financial tracking.

> **Recommended working title: Verdant**

---

## One-Sentence Pitch

> Verdant is a personal finance platform and browser extension that uses Claude AI to help users understand their spending, protect their financial goals, and make more sustainable purchasing decisions — in any language, on any device.

---

## Problem Statement

Most people have vague financial goals but no real-time system to connect everyday spending decisions to those goals. When someone adds a product to a shopping cart, they have no idea whether that purchase is aligned with their savings targets, what the long-term cost looks like, or whether a more sustainable and affordable alternative exists. Existing budgeting tools are reactive — they tell you what happened after the fact. Verdant is proactive: it helps users make better decisions at the moment that matters most.

---

## Why This Matters

- **68% of Americans** live paycheck to paycheck, regardless of income level.
- Financial literacy is unevenly distributed — language barriers, education gaps, and complex jargon exclude millions of people from useful financial tools.
- Consumer purchases account for a significant share of personal carbon footprints, yet most shopping experiences offer no sustainability signals.
- AI-powered personalization can now deliver expert-level financial guidance at zero cost to the user — making this the right moment to build it.

---

## Target Audience

**Primary:**
- Adults aged 22–45 who earn income, have some financial goals (buying a home, paying off debt, building savings), and shop online regularly.

**Secondary:**
- Students beginning to manage their own money.
- Users in non-English-speaking households (Spanish, French).
- Users with accessibility needs who rely on screen readers, keyboard navigation, or high-contrast displays.

---

## User Personas

### Persona 1 — Maya, 28, Marketing Coordinator
- **Goal:** Save $10,000 for a down payment in 18 months.
- **Pain point:** Knows she overspends on small purchases but doesn't see the compounding effect.
- **Needs:** Visual goal tracking, real-time purchase impact alerts, plain-language explanations.

### Persona 2 — Carlos, 35, Freelance Developer
- **Goal:** Build a 6-month emergency fund and reduce irregular spending.
- **Pain point:** Irregular income makes budgeting hard; tools feel rigid.
- **Needs:** Flexible income input, spending pattern analysis, AI-guided planning.
- **Language:** Prefers Spanish UI.

### Persona 3 — Sophie, 22, Graduate Student (France)
- **Goal:** Build basic financial habits, avoid debt.
- **Pain point:** Financial tools assume full-time employment and are in English only.
- **Needs:** French-language support, simple onboarding, accessible UI on mobile.

### Persona 4 — David, 52, Teacher with Low Vision
- **Goal:** Manage retirement contributions alongside everyday spending.
- **Pain point:** Charts and dashboards are often inaccessible to screen readers or visually difficult.
- **Needs:** Screen reader compatibility, keyboard navigation, high-contrast theme, simple data representations.

---

## Core User Journey

```
1. Onboarding
   └── User inputs: income sources, recurring expenses, financial goals, spending habits

2. Dashboard
   └── User sees: current financial picture, goal progress, spending breakdown, sustainability score

3. AI Assistant
   └── User asks: "Am I on track for my savings goal?" / "Where am I overspending?"
   └── Claude responds with: personalized, plain-language insight

4. Browser Extension (shopping moment)
   └── User visits product page
   └── Extension shows: cost impact on goals, sustainability rating, alternative product suggestion

5. Review & Adjust
   └── User returns to dashboard to update goals, log new expenses, or explore AI-guided tips
```

---

## Website Features

### Core (MVP — must have)
- **Onboarding flow** — step-by-step input of income, expenses, goals, and habits
- **Financial Dashboard** — overview of income vs. spending, goal progress bars, key metrics
- **Spending Breakdown** — categorized view of where money goes
- **Goal Tracker** — visual timeline for each financial goal with projected completion dates
- **Claude AI Assistant** — embedded chat panel that answers questions about the user's data
- **Language Switcher** — English / Spanish / French
- **Theme Switcher** — at least 2 accessible themes (light, dark, high-contrast)
- **Responsive Design** — works on desktop and mobile

### Enhanced (stretch goals)
- Recurring expense manager with renewal reminders
- Monthly report generation (exportable PDF or shareable link)
- Sustainability score for the user's overall spending profile
- User account with persistent storage (login/signup)
- Notification system (in-app alerts for goal milestones or budget overruns)

---

## Browser Extension Features

### Core (MVP — must have)
- **Product Page Detection** — recognizes when the user is on a product/shopping page
- **Purchase Impact Panel** — overlaid UI showing estimated cost impact on active financial goals
- **Sustainability Signal** — simple rating or label indicating the product's sustainability profile (powered by Claude)
- **Alternative Suggestion** — Claude-generated recommendation for a comparable but more sustainable/affordable product
- **Link to Dashboard** — one-click to open the Verdant dashboard for full context

### Enhanced (stretch goals)
- Price history display
- "Add to watchlist" or "Mark as planned purchase" synced to dashboard
- Extension settings page to toggle features on/off
- Support for multiple locales inside the extension

---

## Claude AI Assistant Responsibilities

The built-in AI assistant uses the Anthropic Claude API and is aware of the user's full financial profile (stored in app state / passed as context).

**Responsibilities:**
- Answer natural-language questions about the user's budget, goals, and spending
- Explain financial terms and concepts in plain, accessible language
- Provide actionable, personalized tips (e.g., "Cutting your dining budget by $50/month puts you 3 months ahead on your savings goal")
- Walk users through the onboarding flow if they get stuck
- Power the browser extension's product analysis and alternative recommendation
- Adapt tone and complexity to the user's apparent financial literacy level
- Respond in the user's selected language (English, Spanish, or French)

**Context injected into every Claude call:**
```
- User's income (monthly net)
- Active financial goals (name, target, timeline, current progress)
- Top 3 spending categories
- Current month's budget vs. actual
- User's selected language
```

---

## Accessibility Features

Accessibility is a **core feature**, not an add-on. Every component is built with the following requirements:

| Area | Requirement |
|---|---|
| **Typography** | Minimum 16px body text, 1.5 line-height, system or high-legibility fonts (Inter, system-ui) |
| **Color Contrast** | All text meets WCAG AA (4.5:1 normal, 3:1 large text). Default theme targets AAA. |
| **Keyboard Navigation** | Full tab order, visible focus rings on all interactive elements, no keyboard traps |
| **Screen Reader Support** | Semantic HTML, ARIA labels on icons/buttons, live regions for dynamic content (AI responses, alerts) |
| **Alt Text** | All meaningful images have descriptive alt text; decorative images use `alt=""` |
| **Forms & Labels** | All inputs have visible, associated `<label>` elements. Required fields are marked. |
| **Error States** | Inline error messages linked to inputs via `aria-describedby`; never color-only signals |
| **Helper Text** | Persistent helper text below complex inputs, not just on error |
| **Reduced Clutter** | Clean layouts with adequate whitespace; no auto-playing animations |
| **Charts & Visuals** | All charts include text alternatives (data tables or ARIA descriptions); patterns used alongside color |
| **Colorblind-Friendly** | Palette avoids red/green-only distinctions; uses shape, pattern, and label redundancy |
| **Focus Management** | Modals and drawers trap focus correctly; returning focus to trigger on close |

---

## Theme Customization Features

Users can personalize the visual experience through a theme switcher accessible in the navigation bar.

**Available Themes (MVP):**
1. **Light (Default)** — Clean white/off-white with blue-green accent. WCAG AA compliant.
2. **Dark** — Deep neutral backgrounds with legible text. WCAG AA compliant.
3. **High Contrast** — Maximum contrast (near-black/white), WCAG AAA. Designed for low-vision users.

**Stretch Themes:**
4. **Warm** — Warm beige/amber palette for reduced eye strain.
5. **Pastel** — Softer tones for users who prefer lower saturation.

**Implementation approach:**
- Themes are implemented as CSS custom property sets on `:root` (e.g., `--color-bg`, `--color-text`, `--color-accent`).
- Tailwind CSS config extends the default palette using these variables.
- Theme selection is persisted in `localStorage` and applied before first paint to avoid flash.
- A `prefers-color-scheme` media query sets the default theme automatically on first visit.
- All themes are tested against WCAG contrast requirements before shipping.

---

## Multilingual Support Plan

The platform supports **English (en)**, **Spanish (es)**, and **French (fr)**.

### Implementation (Hackathon-Realistic Scope)

**Library:** `next-intl` (lightweight, works well with Next.js App Router)

**Structure:**
```
/messages
  en.json
  es.json
  fr.json
```

**What gets translated:**
- All UI labels, headings, button text, and navigation
- Onboarding questions and field labels
- Error messages and helper text
- Dashboard metric labels and goal descriptions
- AI assistant placeholder text and suggested prompts

**What does NOT need manual translation (AI handles it):**
- Claude AI responses — the system prompt instructs Claude to respond in the user's selected language
- Extension product analysis copy — Claude generates this inline, in the correct language

**Language Switcher:**
- Persistent in the main navigation (top-right area)
- Displays as a `<select>` or icon button with full language names (English / Español / Français)
- Updates `locale` in URL path (e.g., `/es/dashboard`) via next-intl routing
- Persisted in `localStorage` and respected on return visits

**Hackathon scope note:** Translations for MVP pages (onboarding, dashboard, extension panel) will be written manually in the 3 JSON files. Only the core UI strings need to be translated — AI-generated content is handled dynamically.

---

## Inputs the System Collects

**Income:**
- Monthly net income (after tax)
- Income type: salary, freelance/variable, multiple sources
- Frequency: weekly, bi-weekly, monthly

**Spending:**
- Fixed monthly expenses (rent, utilities, subscriptions, loan payments)
- Variable category estimates (groceries, dining, transport, entertainment, clothing, health)
- One-time recent large purchases (optional)

**Financial Goals:**
- Goal name (e.g., "Emergency Fund", "Down Payment", "Pay off credit card")
- Target amount
- Target date
- Current saved amount

**Habits & Preferences:**
- Self-assessed financial literacy level (beginner / intermediate / advanced)
- Sustainability priority level (low / medium / high)
- Preferred language
- Selected theme

---

## Insights and Outputs the System Generates

- **Income vs. Expense summary** — monthly surplus or deficit
- **Spending breakdown** — percentage and dollar amounts per category, vs. recommended benchmarks (50/30/20 rule)
- **Goal projection** — estimated date of goal completion at current savings rate
- **Goal impact alerts** — how a specific purchase would delay or accelerate each goal
- **Spending trend** — whether this month is on track compared to the user's own average
- **Sustainability profile** — how eco-friendly the user's typical purchases are, based on categories
- **AI-generated narrative insight** — plain-language summary of the user's financial picture
- **Personalized tips** — 2–3 actionable suggestions Claude generates based on the user's data
- **Extension: Purchase impact score** — estimated impact of a product on goals (in days of delay, or dollar equivalents)
- **Extension: Alternative recommendation** — Claude-suggested comparable product with better sustainability or price

---

## Sustainability + Financial Recommendation System

### How It Works (Extension Flow)
1. User visits a product page (e.g., Amazon, a retailer site).
2. The extension content script extracts: **product name, price, brand, category** from the page DOM.
3. These are sent to the Verdant backend (Next.js API route) along with the user's active goals and current budget status.
4. The backend calls Claude with a structured prompt:
```
Given this product: [name, price, category]
And this user's financial profile: [goals, monthly surplus, spending habits]
Please:
1. Rate the sustainability of this product (High / Medium / Low) with a one-line reason.
2. Estimate the impact of this purchase on the user's goal "[goal name]" (e.g., "delays your goal by ~3 days").
3. Suggest one comparable alternative product that is more sustainable and/or lower cost. Include product name, estimated price, and why it's a better choice.
Respond in [language].
```
5. The extension popup renders the response in a clean, readable card UI.

### Recommendation Principles
- Alternatives must be **functionally similar** (same use case, not a different product category).
- Alternatives should be **more sustainable** (longer-lasting, repairable, lower environmental impact) OR **more affordable** OR **both**.
- Claude is instructed to be **specific** (named product or brand) rather than vague ("try a generic brand").
- All recommendations include a brief **"Why this is better"** explanation.

---

## Example User Flow

**Maya opens the extension while shopping for a fast-fashion jacket ($75):**

> **Verdant Extension**
>
> **Patagonia Nano Puff Jacket — $75**
>
> **Goal impact:** This purchase would delay your "Down Payment Fund" goal by approximately **4 days**.
>
> **Sustainability:** Medium — synthetic fill, though brand has strong repair and recycling programs.
>
> **Better alternative:** _Icebreaker Merino Wool Midlayer_ (~$60–80)
> Longer-lasting, naturally biodegradable, better warmth-to-weight ratio. Comparable price, significantly lower long-term cost per wear.
>
> [View in Verdant Dashboard →]

---

## Suggested Pages / Screens

### Website
| Route | Purpose |
|---|---|
| `/` | Landing page — pitch, sign-in/sign-up, or "Try Demo" |
| `/onboarding` | Multi-step form: income → expenses → goals → preferences |
| `/dashboard` | Main financial overview + AI assistant panel |
| `/goals` | Detailed goal tracker page |
| `/spending` | Spending breakdown by category |
| `/settings` | Theme switcher, language switcher, profile preferences |

### Browser Extension
| Screen | Purpose |
|---|---|
| **Popup (default)** | "Analyzing this page…" with product context |
| **Popup (result)** | Goal impact + sustainability rating + alternative |
| **Popup (no product)** | "Visit a product page to get insights" |
| **Settings** | Link to dashboard, language, on/off toggles |

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│               NEXT.JS APP                   │
│  ┌──────────────┐   ┌─────────────────────┐ │
│  │  React Pages │   │   API Routes        │ │
│  │  (App Router)│   │  /api/analyze       │ │
│  │  + next-intl │   │  /api/chat          │ │
│  │  + Tailwind  │   │  /api/goals         │ │
│  └──────┬───────┘   └────────┬────────────┘ │
│         │                    │              │
│  ┌──────▼───────────────────▼────────────┐ │
│  │         React Context / State          │ │
│  │   (user profile, goals, theme, locale) │ │
│  └────────────────────┬───────────────────┘ │
└───────────────────────┼─────────────────────┘
                        │
              ┌─────────▼────────┐
              │  Anthropic       │
              │  Claude API      │
              │  (claude-sonnet) │
              └──────────────────┘

┌────────────────────────────────┐
│     BROWSER EXTENSION          │
│   Manifest V3 + React popup    │
│   Content script: DOM scraping │
│   → POST to /api/analyze       │
└────────────────────────────────┘

┌────────────────────────────────┐
│     DATA PERSISTENCE           │
│   localStorage (MVP)           │
│   (Upgrade path: PostgreSQL    │
│    via Prisma + Vercel Postgres)│
└────────────────────────────────┘
```

---

## Suggested Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Built-in API routes, SSR, great i18n support, easy Vercel deploy |
| **Language** | TypeScript | Type safety speeds up development, reduces runtime bugs |
| **Styling** | Tailwind CSS | Utility-first, fast to theme with CSS variables, responsive by default |
| **Component Library** | shadcn/ui | Accessible, unstyled, easy to theme — built on Radix UI primitives |
| **Charts** | Recharts | React-native, composable, supports accessibility patterns |
| **i18n** | next-intl | Lightweight, App Router compatible, simple JSON translation files |
| **AI** | Anthropic Claude API (claude-sonnet-4-6) | Best reasoning + instruction-following for financial + sustainability context |
| **State** | React Context + localStorage | Sufficient for hackathon MVP; no DB setup needed for demo |
| **Browser Extension** | Manifest V3 + React | Modern extension standard; React reuse from main app |
| **Deployment** | Vercel | Zero-config Next.js deploy, free tier, instant preview URLs |
| **Package manager** | pnpm | Fast installs, monorepo-friendly if extension shares code |

---

## Data Model Ideas

```typescript
// User Profile (stored in localStorage / Context)
interface UserProfile {
  id: string;
  name: string;
  language: 'en' | 'es' | 'fr';
  theme: 'light' | 'dark' | 'high-contrast';
  literacyLevel: 'beginner' | 'intermediate' | 'advanced';
  sustainabilityPriority: 'low' | 'medium' | 'high';
  income: {
    monthlyNet: number;
    type: 'salary' | 'freelance' | 'mixed';
  };
  expenses: ExpenseCategory[];
  goals: FinancialGoal[];
  createdAt: string;
}

interface ExpenseCategory {
  name: string;            // e.g., "Groceries"
  monthlyEstimate: number;
  isFixed: boolean;
}

interface FinancialGoal {
  id: string;
  name: string;            // e.g., "Emergency Fund"
  targetAmount: number;
  currentAmount: number;
  targetDate: string;      // ISO date string
  priority: 'high' | 'medium' | 'low';
}

// Extension: Product Analysis Request
interface ProductAnalysisRequest {
  productName: string;
  productPrice: number;
  productCategory: string;
  brand?: string;
  userProfile: Pick<UserProfile, 'income' | 'goals' | 'language' | 'sustainabilityPriority'>;
}

// Extension: Product Analysis Response (from Claude)
interface ProductAnalysisResponse {
  sustainabilityRating: 'High' | 'Medium' | 'Low';
  sustainabilityReason: string;
  goalImpact: string;       // e.g., "Delays 'Down Payment' goal by ~4 days"
  alternative: {
    name: string;
    estimatedPrice: string;
    reason: string;
  };
}
```

---

## APIs / Integrations Needed

| API / Service | Purpose | Required for MVP? |
|---|---|---|
| **Anthropic Claude API** | AI assistant + product analysis + alternative recommendations | YES |
| **Vercel** | Hosting and deployment | YES (or local dev) |
| **Browser Extension APIs** | DOM access, storage, messaging between content script and popup | YES |
| Open Food Facts API | Product sustainability data (food items) | No — stretch goal |
| Amazon Product Advertising API | Real product alternatives | No — stretch goal |
| Plaid / Finicity | Real bank account integration | No — stretch goal |
| Firebase / Supabase | Persistent user accounts | No — stretch goal |

---

## MVP for Hackathon (3-Hour Build)

**Goal:** A working, demonstrable product across all three surfaces — website, AI assistant, and browser extension — at an even level of completeness.

### What the MVP includes:

**Website:**
- [ ] Onboarding form (income, 3–5 expense categories, 1–2 goals)
- [ ] Dashboard with: income/expense summary, goal progress bars, top spending categories
- [ ] Claude AI chat panel (aware of user profile, answers in correct language)
- [ ] Language switcher (3 languages, at least onboarding + dashboard translated)
- [ ] Theme switcher (light/dark at minimum)
- [ ] Responsive layout, keyboard navigable, visible focus styles

**Browser Extension:**
- [ ] Manifest V3 extension installed in browser
- [ ] Content script that extracts product name, price, and category from page
- [ ] Popup UI showing: goal impact, sustainability rating, and one Claude-suggested alternative
- [ ] Calls Verdant `/api/analyze` endpoint

**Backend:**
- [ ] `POST /api/chat` — receives user profile + message, calls Claude, returns response
- [ ] `POST /api/analyze` — receives product context + user profile, calls Claude, returns structured analysis

### What the MVP explicitly skips:
- User authentication / persistent database
- Full translation of all pages (only key pages translated)
- Real product API integration
- All stretch themes beyond light + dark
- Mobile app

---

## Stretch Goals

Listed in order of impact vs. effort:

1. **High-contrast + warm themes** (low effort, high accessibility value)
2. **Full translation of all pages** into all 3 languages
3. **Recurring expense manager** with calendar reminders
4. **Sustainability score** for user's overall spending profile
5. **Monthly spending report** (PDF export or shareable summary)
6. **Extension: "Add to watchlist"** — sync planned purchases to dashboard
7. **Extension: Price history** — surface basic price trend data
8. **User authentication** — persistent account with Next Auth or Clerk
9. **Real database** — PostgreSQL via Prisma + Vercel Postgres
10. **Plaid integration** — real bank transaction import
11. **Open Food Facts integration** — accurate sustainability data for food products
12. **Mobile-first responsive polish** — dedicated mobile UX pass

---

## Demo Strategy

**Demo flow (5–7 minutes):**

1. **Open Verdant website** — show the landing page, highlight the clean design and language switcher.
2. **Run through onboarding** — quickly fill in Maya's profile (income, rent, groceries, dining, savings goal). Show the step-by-step form with accessible labels and helper text.
3. **Dashboard** — show goal progress bars, spending breakdown chart, monthly surplus/deficit. Switch to dark theme to demonstrate theming.
4. **AI Assistant** — ask: _"Am I on track for my savings goal?"_ and _"Where should I cut spending?"_ — Claude responds with personalized, plain-language insight.
5. **Switch to Spanish** — demonstrate language switcher; show dashboard relabel in Spanish; ask AI assistant a question in Spanish and show it responds in Spanish.
6. **Browser extension** — navigate to a real product page (e.g., a jacket on any retailer), trigger the extension popup, show goal impact + sustainability rating + Claude's alternative suggestion.
7. **Wrap up** — come back to dashboard, show the link between the extension insight and the goal tracker.

**Key talking points:**
- "The AI knows your goals and speaks your language."
- "We brought the financial advisor to the point of purchase."
- "Accessibility and sustainability aren't features — they're defaults."

---

## Risks / Constraints

| Risk | Likelihood | Mitigation |
|---|---|---|
| 3-hour time constraint | High | Pre-build onboarding form and dashboard shell before hackathon starts; use shadcn/ui to skip component building |
| Claude API latency | Medium | Show skeleton loaders; cache responses during demo; keep prompts tight |
| Extension DOM scraping breaks on some sites | Medium | Test on 2–3 known product pages (Amazon, Best Buy); have fallback manual input UI |
| Translation quality | Low | Use native speakers on team or Claude to draft translations; validate before demo |
| Over-scoping | High | Strictly enforce MVP list; do not start stretch goals until all MVP items are checked off |
| CORS / API key exposure | Medium | Store Claude API key server-side in Next.js API routes only; never expose in extension or client code |
| Browser extension install friction for judges | Low | Provide step-by-step install guide; pre-load extension on demo machine |

---

## Step-by-Step Build Roadmap

> Designed for a **3-hour hackathon sprint**. Each phase has clear, shippable outputs.

### Phase 1 — Setup (0:00–0:20) [20 min]
- [ ] Initialize Next.js 14 app with TypeScript: `pnpm create next-app@latest verdant --typescript --tailwind --app`
- [ ] Install dependencies: `shadcn/ui`, `next-intl`, `recharts`, `@anthropic-ai/sdk`
- [ ] Set up folder structure: `/messages` (en/es/fr JSON), `/components`, `/app/[locale]`
- [ ] Add `.env.local` with `ANTHROPIC_API_KEY`
- [ ] Create Next.js API routes: `/api/chat` and `/api/analyze` (stub responses first)
- [ ] Bootstrap browser extension folder: `/extension` with `manifest.json`, `popup.html`, `popup.js`, `content.js`
- [ ] Set up Tailwind theme with CSS variables for light and dark themes

### Phase 2 — Onboarding + Data Model (0:20–0:45) [25 min]
- [ ] Build `UserProfile` TypeScript types
- [ ] Build multi-step onboarding form (3 steps: Income → Expenses → Goals)
- [ ] Implement React Context for global user profile state
- [ ] Persist profile to `localStorage` on completion
- [ ] Add accessible form labels, helper text, and validation
- [ ] Add English strings to `en.json`; add Spanish and French equivalents for onboarding strings

### Phase 3 — Dashboard (0:45–1:15) [30 min]
- [ ] Build dashboard layout: sidebar nav + main content area
- [ ] Income vs. expenses summary card (computed from profile data)
- [ ] Goal progress bars (one per goal, showing % complete + projected date)
- [ ] Spending breakdown chart (Recharts pie or bar chart with data table alternative for accessibility)
- [ ] Translate all dashboard strings into es.json and fr.json
- [ ] Add language switcher to navbar
- [ ] Add theme switcher to navbar (light/dark toggle using CSS variables)

### Phase 4 — Claude AI Assistant (1:15–1:40) [25 min]
- [ ] Build chat panel UI (fixed right sidebar or drawer)
- [ ] Wire `POST /api/chat` endpoint to Claude API with user profile as context
- [ ] Implement system prompt: inject user's goals, income, spending summary, and language preference
- [ ] Render AI responses as streaming text (or non-streaming if simpler)
- [ ] Test with: "Am I on track?" / "Where should I cut spending?" in all 3 languages
- [ ] Add ARIA live region to chat panel so screen readers announce new responses

### Phase 5 — Browser Extension (1:40–2:15) [35 min]
- [ ] Finalize `manifest.json` (permissions: `activeTab`, `storage`, target `host_permissions`)
- [ ] Build content script to extract: `productName`, `price`, `category` from page DOM (test on 2–3 real sites)
- [ ] Build `POST /api/analyze` handler: receive product + user profile, call Claude with structured prompt, return JSON
- [ ] Build popup UI: loading state → result card (sustainability rating, goal impact text, alternative suggestion)
- [ ] Pull user profile from `localStorage` in popup to send with each request
- [ ] Test end-to-end on a real product page

### Phase 6 — Polish + Accessibility Pass (2:15–2:45) [30 min]
- [ ] Verify all interactive elements are keyboard-reachable and have visible focus rings
- [ ] Add `aria-label` to icon-only buttons (theme toggle, language switcher)
- [ ] Check color contrast on both light and dark themes (use browser devtools accessibility panel)
- [ ] Ensure all chart elements have associated text descriptions
- [ ] Fix any obvious mobile layout issues
- [ ] Verify language switcher works and persists across page navigation
- [ ] Smoke test all Claude API calls; verify API key is not exposed client-side

### Phase 7 — Demo Prep (2:45–3:00) [15 min]
- [ ] Pre-fill Maya's profile in `localStorage` for the demo (skip manual onboarding during presentation)
- [ ] Load extension into Chrome (chrome://extensions → Developer mode → Load unpacked)
- [ ] Run through demo script once end-to-end
- [ ] Note any fallbacks if live API fails (have screenshot/recording backup)
- [ ] Deploy to Vercel (`vercel --prod`) and confirm live URL works

---

## Appendix — Translation Key Structure

```json
// en.json (sample)
{
  "onboarding": {
    "title": "Let's get to know your finances",
    "income_label": "Monthly take-home income",
    "income_helper": "Enter your income after taxes",
    "next": "Next",
    "back": "Back"
  },
  "dashboard": {
    "title": "Your Financial Overview",
    "goal_progress": "Goal Progress",
    "spending_breakdown": "Spending Breakdown",
    "monthly_surplus": "Monthly Surplus"
  },
  "assistant": {
    "placeholder": "Ask me anything about your finances...",
    "suggested_1": "Am I on track for my savings goal?",
    "suggested_2": "Where am I overspending?",
    "suggested_3": "How can I reach my goal faster?"
  },
  "extension": {
    "analyzing": "Analyzing this product...",
    "no_product": "Visit a product page to get spending insights.",
    "sustainability": "Sustainability",
    "goal_impact": "Goal Impact",
    "better_option": "Better Alternative"
  }
}
```

---

_Last updated: 2026-03-21 | Hackathon sprint plan for Verdant_
