/**
 * Vyridian Multilingual Content Dataset
 *
 * All user-facing content (lessons, insights, tips, labels) is stored here as
 * {en, es, fr} objects. Components call getText(entry, locale) to retrieve the
 * right language, with automatic English fallback.
 *
 * Structure:
 *   CONTENT          — flat ContentEntry[] for categories, tips, facts, labels
 *   MULTILINGUAL_LESSONS — rich lesson+quiz objects for the /learn page
 *
 * Helpers:
 *   resolveLocale(str)        → SupportedLocale ("en" | "es" | "fr")
 *   getText(ml, locale)       → string (with English fallback)
 *   getEntryById(id)          → ContentEntry | undefined
 *   getEntriesByCategory(cat) → ContentEntry[]
 *   getLocalizedText(id, loc) → string (convenience wrapper)
 *   getDashboardInsight(metrics, locale) → string
 *   getRandomTip(locale)      → string
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type SupportedLocale = "en" | "es" | "fr";

export interface MultilingualText {
  en: string;
  es: string;
  fr: string;
}

export type ContentCategory =
  | "product_category"
  | "dashboard_insight"
  | "savings_tip"
  | "sustainability_fact"
  | "budgeting_tip"
  | "quiz_label";

export interface ContentEntry {
  id: string;
  category: ContentCategory;
  text: MultilingualText;
  /** Optional condition metadata for context-aware selection */
  meta?: Record<string, unknown>;
}

export interface MultilingualQuizQuestion {
  question: MultilingualText;
  options: MultilingualText[];
  correct: number; // index into options[]
  explanation: MultilingualText;
}

export interface MultilingualLesson {
  id: string;
  emoji: string;
  readTime: string;
  color: string;
  title: MultilingualText;
  description: MultilingualText;
  content: MultilingualText[]; // paragraphs
  quiz: MultilingualQuizQuestion[];
}

// ─── Core helpers ───────────────────────────────────────────────────────────

/** Coerce any locale string to a supported locale, defaulting to "en". */
export function resolveLocale(locale: string | undefined | null): SupportedLocale {
  if (locale === "es" || locale === "fr") return locale;
  return "en";
}

/**
 * Return the correct translation for a MultilingualText object.
 * Falls back to English if the translation is empty.
 */
export function getText(ml: MultilingualText, locale: SupportedLocale | string): string {
  const l = resolveLocale(locale);
  return ml[l]?.trim() || ml.en;
}

/** Look up a ContentEntry by its id. */
export function getEntryById(id: string): ContentEntry | undefined {
  return CONTENT.find((e) => e.id === id);
}

/** Get all ContentEntry items in a given category. */
export function getEntriesByCategory(category: ContentCategory): ContentEntry[] {
  return CONTENT.filter((e) => e.category === category);
}

/** Convenience: return localized text for an entry id (falls back to the id itself). */
export function getLocalizedText(id: string, locale: string): string {
  const entry = getEntryById(id);
  if (!entry) return id;
  return getText(entry.text, locale);
}

/**
 * Pick the most relevant dashboard insight for the user's financial situation.
 * Returns localized text.
 */
export function getDashboardInsight(
  metrics: { savingsRate: number; monthlySurplus: number; goalMaxPct?: number },
  locale: string
): string {
  const { savingsRate, monthlySurplus, goalMaxPct = 0 } = metrics;

  let id = "insight_healthy_surplus";
  if (monthlySurplus < 0) id = "insight_overspending";
  else if (savingsRate >= 20) id = "insight_savings_excellent";
  else if (savingsRate < 10) id = "insight_savings_low";
  else if (goalMaxPct >= 80) id = "insight_goal_near";

  return getLocalizedText(id, locale);
}

/**
 * Return a deterministic (not random) savings tip based on the current
 * day-of-month, so it changes daily without needing state.
 */
export function getDailyTip(locale: string): string {
  const tips = getEntriesByCategory("savings_tip");
  if (!tips.length) return "";
  const idx = new Date().getDate() % tips.length;
  return getText(tips[idx].text, locale);
}

// ─── Flat content dataset ───────────────────────────────────────────────────

export const CONTENT: ContentEntry[] = [

  // ── Product Categories ────────────────────────────────────────────────────
  {
    id: "cat_electronics",
    category: "product_category",
    text: { en: "Electronics", es: "Electrónicos", fr: "Électronique" },
  },
  {
    id: "cat_clothing",
    category: "product_category",
    text: { en: "Clothing & Apparel", es: "Ropa y Accesorios", fr: "Vêtements et Mode" },
  },
  {
    id: "cat_home_furniture",
    category: "product_category",
    text: { en: "Home & Furniture", es: "Hogar y Muebles", fr: "Maison et Mobilier" },
  },
  {
    id: "cat_beauty",
    category: "product_category",
    text: { en: "Beauty & Personal Care", es: "Belleza y Cuidado Personal", fr: "Beauté et Soins Personnels" },
  },
  {
    id: "cat_health",
    category: "product_category",
    text: { en: "Health & Supplements", es: "Salud y Suplementos", fr: "Santé et Compléments" },
  },
  {
    id: "cat_food",
    category: "product_category",
    text: { en: "Food & Beverage", es: "Alimentos y Bebidas", fr: "Alimentation et Boissons" },
  },
  {
    id: "cat_books",
    category: "product_category",
    text: { en: "Books", es: "Libros", fr: "Livres" },
  },
  {
    id: "cat_toys",
    category: "product_category",
    text: { en: "Toys & Games", es: "Juguetes y Juegos", fr: "Jouets et Jeux" },
  },
  {
    id: "cat_footwear",
    category: "product_category",
    text: { en: "Footwear", es: "Calzado", fr: "Chaussures" },
  },
  {
    id: "cat_general",
    category: "product_category",
    text: { en: "General", es: "General", fr: "Général" },
  },

  // ── Dashboard Insights ────────────────────────────────────────────────────
  {
    id: "insight_savings_excellent",
    category: "dashboard_insight",
    text: {
      en: "Your savings rate is above 20% — you're building wealth faster than most people.",
      es: "Tu tasa de ahorro supera el 20% — estás construyendo riqueza más rápido que la mayoría.",
      fr: "Votre taux d'épargne dépasse 20% — vous construisez votre patrimoine plus vite que la plupart.",
    },
    meta: { condition: "savingsRate >= 20" },
  },
  {
    id: "insight_savings_low",
    category: "dashboard_insight",
    text: {
      en: "Your savings rate is under 10%. Small cuts in discretionary spending can make a big difference.",
      es: "Tu tasa de ahorro está por debajo del 10%. Pequeños recortes en gastos discrecionales pueden marcar la diferencia.",
      fr: "Votre taux d'épargne est inférieur à 10%. De petites réductions dans les dépenses discrétionnaires peuvent faire une grande différence.",
    },
    meta: { condition: "savingsRate < 10" },
  },
  {
    id: "insight_overspending",
    category: "dashboard_insight",
    text: {
      en: "You're spending more than you earn this month. Review your top expense categories to find opportunities.",
      es: "Este mes estás gastando más de lo que ganas. Revisa tus principales categorías de gastos para encontrar oportunidades.",
      fr: "Vous dépensez plus que vous ne gagnez ce mois-ci. Examinez vos catégories de dépenses pour trouver des opportunités.",
    },
    meta: { condition: "monthlySurplus < 0" },
  },
  {
    id: "insight_healthy_surplus",
    category: "dashboard_insight",
    text: {
      en: "You have a healthy monthly surplus. Consider directing it toward your top-priority goal.",
      es: "Tienes un superávit mensual saludable. Considera destinarlo a tu objetivo de mayor prioridad.",
      fr: "Vous avez un excédent mensuel sain. Envisagez de l'affecter à votre objectif prioritaire.",
    },
    meta: { condition: "monthlySurplus > 0" },
  },
  {
    id: "insight_goal_near",
    category: "dashboard_insight",
    text: {
      en: "You're close to reaching one of your goals! Keep the momentum and you'll hit it soon.",
      es: "¡Estás cerca de alcanzar uno de tus objetivos! Mantén el ritmo y lo lograrás pronto.",
      fr: "Vous êtes proche d'atteindre l'un de vos objectifs ! Maintenez l'élan et vous y arriverez bientôt.",
    },
    meta: { condition: "anyGoalAbove80Pct" },
  },

  // ── Savings Tips ──────────────────────────────────────────────────────────
  {
    id: "tip_automate",
    category: "savings_tip",
    text: {
      en: "Set up an automatic transfer to savings on payday — before you have a chance to spend it.",
      es: "Configura una transferencia automática al ahorro el día de pago, antes de tener la oportunidad de gastarlo.",
      fr: "Programmez un virement automatique vers l'épargne le jour de paye — avant d'avoir l'occasion de le dépenser.",
    },
  },
  {
    id: "tip_24h_rule",
    category: "savings_tip",
    text: {
      en: "Wait 24 hours before buying anything over $50. Most impulse desires fade within a day.",
      es: "Espera 24 horas antes de comprar algo que cueste más de $50. La mayoría de los impulsos desaparecen en un día.",
      fr: "Attendez 24 heures avant d'acheter quoi que ce soit au-dessus de 50 $. La plupart des envies impulsives s'estompent en un jour.",
    },
  },
  {
    id: "tip_cost_per_use",
    category: "savings_tip",
    text: {
      en: "Calculate cost-per-use before buying. A $90 item used 200 times costs just $0.45/use.",
      es: "Calcula el costo por uso antes de comprar. Un artículo de $90 usado 200 veces cuesta solo $0.45 por uso.",
      fr: "Calculez le coût par utilisation avant d'acheter. Un article à 90 $ utilisé 200 fois ne coûte que 0,45 $/utilisation.",
    },
  },
  {
    id: "tip_emergency_fund",
    category: "savings_tip",
    text: {
      en: "Build a 3–6 month emergency fund first. It prevents debt when life surprises you.",
      es: "Primero construye un fondo de emergencia de 3 a 6 meses. Previene las deudas cuando la vida te sorprende.",
      fr: "Constituez d'abord un fonds d'urgence de 3 à 6 mois. Il prévient l'endettement quand la vie vous surprend.",
    },
  },
  {
    id: "tip_high_yield",
    category: "savings_tip",
    text: {
      en: "Move savings to a high-yield account. Online banks often offer 4–5% APY vs 0.01% at traditional banks.",
      es: "Mueve tus ahorros a una cuenta de alto rendimiento. Los bancos en línea suelen ofrecer 4–5% APY vs 0.01% en los bancos tradicionales.",
      fr: "Déplacez votre épargne vers un compte à haut rendement. Les banques en ligne offrent souvent 4–5% de TAEG contre 0,01% ailleurs.",
    },
  },
  {
    id: "tip_subscriptions",
    category: "savings_tip",
    text: {
      en: "Audit your subscriptions every month. The average person pays for 3–4 services they rarely use.",
      es: "Revisa tus suscripciones cada mes. La persona promedio paga por 3 a 4 servicios que raramente usa.",
      fr: "Passez en revue vos abonnements chaque mois. En moyenne, les gens paient 3 à 4 services qu'ils utilisent rarement.",
    },
  },
  {
    id: "tip_50_30_20",
    category: "savings_tip",
    text: {
      en: "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Simple and effective.",
      es: "Prueba la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorros. Simple y efectivo.",
      fr: "Essayez la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne. Simple et efficace.",
    },
  },
  {
    id: "tip_meals",
    category: "savings_tip",
    text: {
      en: "Meal-prepping 3 dinners a week can save $150–$300/month compared to dining out.",
      es: "Preparar 3 cenas por semana puede ahorrar $150–$300 al mes en comparación con comer fuera.",
      fr: "Préparer 3 dîners par semaine peut économiser 150–300 $/mois par rapport aux repas au restaurant.",
    },
  },

  // ── Sustainability Facts ──────────────────────────────────────────────────
  {
    id: "sust_fast_fashion",
    category: "sustainability_fact",
    text: {
      en: "The fashion industry produces 10% of global carbon emissions. Buying secondhand cuts that impact by up to 82%.",
      es: "La industria de la moda produce el 10% de las emisiones mundiales de carbono. Comprar de segunda mano reduce ese impacto hasta un 82%.",
      fr: "L'industrie de la mode produit 10% des émissions mondiales de carbone. Acheter d'occasion réduit cet impact jusqu'à 82%.",
    },
  },
  {
    id: "sust_electronics",
    category: "sustainability_fact",
    text: {
      en: "Manufacturing a new smartphone produces ~70 kg of CO₂. Keeping it one extra year halves its lifetime environmental cost.",
      es: "Fabricar un nuevo teléfono produce ~70 kg de CO₂. Usarlo un año más reduce a la mitad su costo ambiental.",
      fr: "Fabriquer un nouveau smartphone produit ~70 kg de CO₂. Le garder un an de plus réduit de moitié son coût environnemental.",
    },
  },
  {
    id: "sust_food_waste",
    category: "sustainability_fact",
    text: {
      en: "Households waste 30–40% of the food they buy. Meal planning saves both money and emissions.",
      es: "Los hogares desperdician entre el 30–40% de los alimentos. Planificar las comidas ahorra dinero y emisiones.",
      fr: "Les ménages gaspillent 30 à 40% des aliments qu'ils achètent. Planifier les repas économise argent et émissions.",
    },
  },
  {
    id: "sust_local",
    category: "sustainability_fact",
    text: {
      en: "Buying locally produced goods significantly cuts transportation emissions and supports regional economies.",
      es: "Comprar productos locales reduce significativamente las emisiones de transporte y apoya la economía regional.",
      fr: "Acheter des produits locaux réduit considérablement les émissions de transport et soutient l'économie régionale.",
    },
  },

  // ── Budgeting Tips ────────────────────────────────────────────────────────
  {
    id: "budget_track_first",
    category: "budgeting_tip",
    text: {
      en: "Track spending for one month before building a budget. Reality is the best starting point.",
      es: "Rastrea tus gastos un mes antes de crear un presupuesto. La realidad es el mejor punto de partida.",
      fr: "Suivez vos dépenses pendant un mois avant de construire un budget. La réalité est toujours le meilleur point de départ.",
    },
  },
  {
    id: "budget_buffer",
    category: "budgeting_tip",
    text: {
      en: "Always include a small miscellaneous buffer (1–3% of income) in your budget. Life is unpredictable.",
      es: "Incluye siempre un pequeño margen para imprevistos (1–3% de ingresos). La vida es impredecible.",
      fr: "Incluez toujours une petite marge pour imprévus (1–3% du revenu). La vie est imprévisible.",
    },
  },
  {
    id: "budget_fixed_first",
    category: "budgeting_tip",
    text: {
      en: "Budget fixed expenses first (rent, utilities, loan payments), then allocate what remains to variables.",
      es: "Presupuesta primero los gastos fijos (alquiler, servicios, préstamos), luego asigna el resto a variables.",
      fr: "Budgétisez d'abord les dépenses fixes (loyer, charges, remboursements), puis allouez le reste aux variables.",
    },
  },
  {
    id: "budget_weekly_checkin",
    category: "budgeting_tip",
    text: {
      en: "Do a 5-minute weekly check-in on your budget. Catching overspending early prevents end-of-month crises.",
      es: "Haz un control semanal de 5 minutos de tu presupuesto. Detectar el gasto excesivo a tiempo evita crisis a fin de mes.",
      fr: "Faites un bilan budgétaire hebdomadaire de 5 minutes. Détecter tôt les dépassements évite les crises en fin de mois.",
    },
  },

  // ── Quiz Labels ───────────────────────────────────────────────────────────
  {
    id: "quiz_correct",
    category: "quiz_label",
    text: { en: "Correct!", es: "¡Correcto!", fr: "Correct !" },
  },
  {
    id: "quiz_incorrect",
    category: "quiz_label",
    text: { en: "Not quite.", es: "No del todo.", fr: "Pas tout à fait." },
  },
  {
    id: "quiz_submit",
    category: "quiz_label",
    text: { en: "Submit Quiz", es: "Enviar cuestionario", fr: "Soumettre le quiz" },
  },
  {
    id: "quiz_perfect",
    category: "quiz_label",
    text: { en: "Perfect! 🎉", es: "¡Perfecto! 🎉", fr: "Parfait ! 🎉" },
  },
  {
    id: "quiz_keep_learning",
    category: "quiz_label",
    text: { en: "Keep learning!", es: "¡Sigue aprendiendo!", fr: "Continuez à apprendre !" },
  },
];

// ─── Multilingual lesson dataset ────────────────────────────────────────────

export const MULTILINGUAL_LESSONS: MultilingualLesson[] = [
  // ── Lesson 1: Budgeting Basics ─────────────────────────────────────────────
  {
    id: "budgeting",
    emoji: "💰",
    readTime: "3 min",
    color: "#00d37f",
    title: {
      en: "Budgeting Basics",
      es: "Fundamentos del Presupuesto",
      fr: "Les Bases du Budget",
    },
    description: {
      en: "Learn how to build a budget that actually works — and stick to it.",
      es: "Aprende a crear un presupuesto que funcione de verdad y a cumplirlo.",
      fr: "Apprenez à créer un budget qui fonctionne vraiment — et à le respecter.",
    },
    content: [
      {
        en: "A budget is simply a plan for your money. Instead of wondering where it went, you decide in advance where it goes. The most popular framework is the 50/30/20 rule: 50% of take-home pay covers needs (rent, groceries, utilities), 30% covers wants (dining out, entertainment, subscriptions), and 20% goes to savings and debt repayment.",
        es: "Un presupuesto es simplemente un plan para tu dinero. En lugar de preguntarte adónde fue, decides de antemano adónde va. El marco más popular es la regla 50/30/20: el 50% de tu sueldo neto cubre las necesidades (alquiler, comestibles, servicios), el 30% cubre los deseos (comidas fuera, entretenimiento, suscripciones) y el 20% va a ahorros y pago de deudas.",
        fr: "Un budget est simplement un plan pour votre argent. Au lieu de vous demander où il est passé, vous décidez à l'avance où il va. Le cadre le plus populaire est la règle 50/30/20 : 50% de votre salaire net couvre les besoins (loyer, courses, charges), 30% couvre les envies (restaurants, loisirs, abonnements) et 20% va à l'épargne et au remboursement des dettes.",
      },
      {
        en: "The #1 reason budgets fail is that people make them too rigid. Life is unpredictable — a car repair, a medical bill, a friend's wedding. Build a small buffer (1–3% of income) labeled 'Miscellaneous' so surprise expenses don't blow up your whole plan.",
        es: "La razón número 1 por la que los presupuestos fracasan es que la gente los hace demasiado rígidos. La vida es impredecible: una reparación del coche, una factura médica, la boda de un amigo. Crea un pequeño colchón (1–3% de los ingresos) etiquetado como 'Imprevistos' para que los gastos inesperados no arruinen todo tu plan.",
        fr: "La principale raison pour laquelle les budgets échouent est qu'ils sont trop rigides. La vie est imprévisible : une réparation de voiture, une facture médicale, le mariage d'un ami. Prévoyez une petite réserve (1–3% du revenu) intitulée 'Divers' pour que les dépenses surprises ne sabotent pas tout votre plan.",
      },
      {
        en: "Track your spending for just one month before building your budget. You'll almost always be shocked at how much goes to categories you didn't expect. Seeing the reality makes you a much better planner.",
        es: "Registra tus gastos durante solo un mes antes de crear tu presupuesto. Casi siempre te sorprenderá cuánto va a categorías que no esperabas. Ver la realidad te convierte en un planificador mucho mejor.",
        fr: "Suivez vos dépenses pendant un seul mois avant de construire votre budget. Vous serez presque toujours surpris de voir combien va dans des catégories inattendues. Voir la réalité fait de vous un bien meilleur planificateur.",
      },
    ],
    quiz: [
      {
        question: {
          en: "In the 50/30/20 rule, what does the '20' represent?",
          es: "En la regla 50/30/20, ¿qué representa el '20'?",
          fr: "Dans la règle 50/30/20, que représente le « 20 » ?",
        },
        options: [
          { en: "Entertainment and dining out", es: "Entretenimiento y comidas fuera", fr: "Loisirs et restaurants" },
          { en: "Savings and debt repayment", es: "Ahorros y pago de deudas", fr: "Épargne et remboursement des dettes" },
          { en: "Housing and utilities", es: "Vivienda y servicios", fr: "Logement et charges" },
          { en: "Food and groceries", es: "Comida y comestibles", fr: "Alimentation et épicerie" },
        ],
        correct: 1,
        explanation: {
          en: "The '20' refers to directing at least 20% of take-home pay toward savings, investments, and debt repayment — building your financial future.",
          es: "El '20' se refiere a destinar al menos el 20% del sueldo neto a ahorros, inversiones y pago de deudas, construyendo tu futuro financiero.",
          fr: "Le « 20 » désigne au moins 20% du salaire net à consacrer à l'épargne, aux investissements et au remboursement des dettes — bâtir votre avenir financier.",
        },
      },
      {
        question: {
          en: "What is the most common reason budgets fail?",
          es: "¿Cuál es la razón más común por la que los presupuestos fracasan?",
          fr: "Quelle est la raison la plus courante pour laquelle les budgets échouent ?",
        },
        options: [
          { en: "People earn too little money", es: "Las personas ganan muy poco dinero", fr: "Les gens gagnent trop peu d'argent" },
          { en: "Budgets are too complicated", es: "Los presupuestos son demasiado complicados", fr: "Les budgets sont trop compliqués" },
          { en: "No room for unexpected expenses", es: "Sin margen para gastos inesperados", fr: "Pas de place pour les dépenses imprévues" },
          { en: "Banks charge tracking fees", es: "Los bancos cobran tarifas de seguimiento", fr: "Les banques facturent des frais de suivi" },
        ],
        correct: 2,
        explanation: {
          en: "Most budgets fail because they're too rigid. When a surprise expense hits, having a small buffer prevents one setback from derailing everything.",
          es: "La mayoría de los presupuestos fracasan porque son demasiado rígidos. Cuando llega un gasto inesperado, tener un pequeño colchón evita que un contratiempo arruine todo.",
          fr: "La plupart des budgets échouent parce qu'ils sont trop rigides. Quand une dépense imprévue survient, une petite réserve empêche un contretemps de tout faire échouer.",
        },
      },
      {
        question: {
          en: "What should you do BEFORE building your first budget?",
          es: "¿Qué debes hacer ANTES de crear tu primer presupuesto?",
          fr: "Que devez-vous faire AVANT de créer votre premier budget ?",
        },
        options: [
          { en: "Open a new savings account", es: "Abrir una nueva cuenta de ahorros", fr: "Ouvrir un nouveau compte épargne" },
          { en: "Track your actual spending for one month", es: "Registrar tu gasto real durante un mes", fr: "Suivre vos dépenses réelles pendant un mois" },
          { en: "Cut all subscriptions immediately", es: "Cancelar todas las suscripciones de inmediato", fr: "Annuler immédiatement tous les abonnements" },
          { en: "Set annual savings goals", es: "Establecer metas de ahorro anuales", fr: "Fixer des objectifs d'épargne annuels" },
        ],
        correct: 1,
        explanation: {
          en: "Tracking your real spending for one month reveals the truth about your habits — and reality is the best foundation for an honest, achievable budget.",
          es: "Registrar tu gasto real durante un mes revela la verdad sobre tus hábitos, y la realidad es la mejor base para un presupuesto honesto y alcanzable.",
          fr: "Suivre vos dépenses réelles pendant un mois révèle la vérité sur vos habitudes — et la réalité est la meilleure base pour un budget honnête et réalisable.",
        },
      },
    ],
  },

  // ── Lesson 2: Smart Saving ─────────────────────────────────────────────────
  {
    id: "saving",
    emoji: "📈",
    readTime: "4 min",
    color: "#3b82f6",
    title: {
      en: "Smart Saving Strategies",
      es: "Estrategias de Ahorro Inteligentes",
      fr: "Stratégies d'Épargne Intelligentes",
    },
    description: {
      en: "Build saving habits that compound over time — starting with your next paycheck.",
      es: "Construye hábitos de ahorro que se acumulen con el tiempo, empezando con tu próximo sueldo.",
      fr: "Construisez des habitudes d'épargne qui se composent dans le temps — dès votre prochain salaire.",
    },
    content: [
      {
        en: "The single most powerful saving strategy is 'pay yourself first.' The moment you receive income, move your savings before spending anything. Automate a transfer to a separate savings account the same day your paycheck hits.",
        es: "La estrategia de ahorro más poderosa es 'págate primero a ti mismo'. En el momento en que recibes ingresos, mueve tus ahorros antes de gastar nada. Automatiza una transferencia a una cuenta de ahorros separada el mismo día que recibes tu sueldo.",
        fr: "La stratégie d'épargne la plus puissante est de « vous payer en premier ». Dès que vous recevez des revenus, transférez votre épargne avant de dépenser quoi que ce soit. Automatisez un virement vers un compte épargne séparé le jour même de votre salaire.",
      },
      {
        en: "Your first savings goal should be a 3–6 month emergency fund. Without it, every unexpected expense becomes debt. Once your emergency fund is full, redirect that same monthly amount toward other goals.",
        es: "Tu primer objetivo de ahorro debe ser un fondo de emergencia de 3 a 6 meses. Sin él, cada gasto inesperado se convierte en deuda. Una vez lleno el fondo, redirige esa misma cantidad mensual hacia otros objetivos.",
        fr: "Votre premier objectif d'épargne devrait être un fonds d'urgence de 3 à 6 mois. Sans lui, chaque dépense imprévue devient une dette. Une fois le fonds constitué, redirigez ce même montant mensuel vers d'autres objectifs.",
      },
      {
        en: "High-yield savings accounts (HYSAs) offer 4–5% annual interest compared to the 0.01% at most traditional banks. On $10,000, that's the difference between earning $1 per year and $450 per year — just by switching banks.",
        es: "Las cuentas de ahorro de alto rendimiento ofrecen un interés anual del 4–5% comparado con el 0.01% de la mayoría de los bancos tradicionales. En $10,000, eso es la diferencia entre ganar $1 al año y $450 al año, solo cambiando de banco.",
        fr: "Les comptes épargne à haut rendement offrent 4–5% d'intérêts annuels contre 0,01% dans la plupart des banques traditionnelles. Sur 10 000 $, c'est la différence entre gagner 1 $ par an et 450 $ par an — juste en changeant de banque.",
      },
    ],
    quiz: [
      {
        question: {
          en: "What does 'pay yourself first' mean?",
          es: "¿Qué significa 'págate primero a ti mismo'?",
          fr: "Que signifie « vous payer en premier » ?",
        },
        options: [
          { en: "Reward yourself before paying bills", es: "Recompensarte antes de pagar facturas", fr: "Vous récompenser avant de payer les factures" },
          { en: "Save money before spending on anything else", es: "Ahorrar dinero antes de gastar en cualquier otra cosa", fr: "Épargner de l'argent avant de dépenser quoi que ce soit" },
          { en: "Invest in your own business first", es: "Invertir primero en tu propio negocio", fr: "Investir d'abord dans votre propre entreprise" },
          { en: "Pay off your highest debts first", es: "Pagar primero tus deudas más altas", fr: "Rembourser d'abord vos dettes les plus élevées" },
        ],
        correct: 1,
        explanation: {
          en: "'Pay yourself first' means automatically moving money to savings as soon as you're paid — before you have a chance to spend it.",
          es: "'Págate primero' significa mover automáticamente dinero al ahorro tan pronto como cobras, antes de tener la oportunidad de gastarlo.",
          fr: "« Vous payer en premier » signifie transférer automatiquement de l'argent vers l'épargne dès que vous êtes payé — avant d'avoir l'occasion de le dépenser.",
        },
      },
      {
        question: {
          en: "What should your first savings goal typically be?",
          es: "¿Cuál suele ser tu primer objetivo de ahorro?",
          fr: "Quel devrait généralement être votre premier objectif d'épargne ?",
        },
        options: [
          { en: "A vacation fund", es: "Un fondo para vacaciones", fr: "Un fonds de vacances" },
          { en: "A house down payment", es: "Un pago inicial para una casa", fr: "Un acompte pour une maison" },
          { en: "A 3–6 month emergency fund", es: "Un fondo de emergencia de 3 a 6 meses", fr: "Un fonds d'urgence de 3 à 6 mois" },
          { en: "A new car fund", es: "Un fondo para un coche nuevo", fr: "Un fonds pour une nouvelle voiture" },
        ],
        correct: 2,
        explanation: {
          en: "An emergency fund of 3–6 months of expenses protects you from debt when life surprises you. It's the financial foundation everything else is built on.",
          es: "Un fondo de emergencia de 3 a 6 meses de gastos te protege de las deudas cuando la vida te sorprende. Es la base financiera sobre la que se construye todo lo demás.",
          fr: "Un fonds d'urgence de 3 à 6 mois de dépenses vous protège des dettes quand la vie vous surprend. C'est la base financière sur laquelle tout le reste est construit.",
        },
      },
      {
        question: {
          en: "How much more can a high-yield savings account earn vs. a traditional bank?",
          es: "¿Cuánto más puede ganar una cuenta de alto rendimiento frente a un banco tradicional?",
          fr: "Combien de plus peut rapporter un compte épargne à haut rendement par rapport à une banque traditionnelle ?",
        },
        options: [
          { en: "About the same", es: "Más o menos lo mismo", fr: "À peu près pareil" },
          { en: "2–3 times more", es: "De 2 a 3 veces más", fr: "2 à 3 fois plus" },
          { en: "10–20 times more", es: "De 10 a 20 veces más", fr: "10 à 20 fois plus" },
          { en: "400–500 times more", es: "De 400 a 500 veces más", fr: "400 à 500 fois plus" },
        ],
        correct: 3,
        explanation: {
          en: "HYSAs at 4–5% vs traditional banks at 0.01% is roughly a 400–500x difference in interest earned — a massive benefit for zero extra effort.",
          es: "Las HYSAs al 4–5% frente a los bancos tradicionales al 0.01% representan una diferencia de aproximadamente 400–500x en intereses ganados, una ventaja enorme sin ningún esfuerzo adicional.",
          fr: "Les CSHR à 4–5% contre les banques traditionnelles à 0,01% représentent une différence d'environ 400 à 500x d'intérêts gagnés — un avantage énorme pour zéro effort supplémentaire.",
        },
      },
    ],
  },

  // ── Lesson 3: Needs vs. Wants ──────────────────────────────────────────────
  {
    id: "needs-vs-wants",
    emoji: "⚖️",
    readTime: "3 min",
    color: "#8b5cf6",
    title: {
      en: "Needs vs. Wants",
      es: "Necesidades vs. Deseos",
      fr: "Besoins vs. Envies",
    },
    description: {
      en: "The framework for every spending decision — and why it's harder than it sounds.",
      es: "El marco para cada decisión de gasto, y por qué es más difícil de lo que parece.",
      fr: "Le cadre pour chaque décision de dépense — et pourquoi c'est plus difficile qu'il n'y paraît.",
    },
    content: [
      {
        en: "A 'need' is something required for basic functioning and safety: housing, food, healthcare, transportation to work. A 'want' is everything else. The tricky part is that our brains are wired to turn wants into needs over time — 'I need Netflix' creeps into our mental categories, but it isn't a need by definition.",
        es: "Una 'necesidad' es algo requerido para el funcionamiento básico y la seguridad: vivienda, comida, atención médica, transporte al trabajo. Un 'deseo' es todo lo demás. La parte complicada es que nuestro cerebro está programado para convertir deseos en necesidades con el tiempo.",
        fr: "Un « besoin » est quelque chose de nécessaire pour fonctionner et rester en sécurité : logement, nourriture, soins de santé, transport au travail. Une « envie » est tout le reste. La partie délicate, c'est que notre cerveau est programmé pour transformer les envies en besoins avec le temps.",
      },
      {
        en: "Opportunity cost is the hidden price of every purchase: what you give up by choosing to spend money one way instead of another. When you buy a $150 dinner, the opportunity cost might be $150 less in your vacation or emergency fund. It's not about guilt — it's about conscious tradeoffs.",
        es: "El costo de oportunidad es el precio oculto de cada compra: lo que renuncias al elegir gastar dinero de una forma en lugar de otra. No se trata de culpa, sino de hacer intercambios conscientes con pleno conocimiento de lo que estás sacrificando.",
        fr: "Le coût d'opportunité est le prix caché de chaque achat : ce à quoi vous renoncez en choisissant de dépenser de l'argent d'une façon plutôt que d'une autre. Il ne s'agit pas de culpabilité — mais de compromis conscients.",
      },
      {
        en: "A powerful rule: wait 24 hours before buying anything over $50, and 7 days before anything over $200. Research shows that desire fades significantly within 24–48 hours if you don't act on it immediately. Use the Vyridian extension to see goal impact before you commit.",
        es: "Una regla poderosa: espera 24 horas antes de comprar algo que cueste más de $50, y 7 días antes de algo que cueste más de $200. Las investigaciones muestran que el deseo disminuye significativamente en 24 a 48 horas si no actúas de inmediato.",
        fr: "Une règle puissante : attendez 24 heures avant d'acheter quoi que ce soit au-dessus de 50 $, et 7 jours avant tout achat au-dessus de 200 $. Les recherches montrent que le désir diminue significativement dans les 24 à 48 heures si vous n'agissez pas immédiatement.",
      },
    ],
    quiz: [
      {
        question: {
          en: "Which of the following is a 'need' by strict definition?",
          es: "¿Cuál de los siguientes es una 'necesidad' en sentido estricto?",
          fr: "Lequel des éléments suivants est un « besoin » au sens strict ?",
        },
        options: [
          { en: "High-speed internet", es: "Internet de alta velocidad", fr: "Internet haut débit" },
          { en: "A monthly gym membership", es: "Una membresía mensual al gimnasio", fr: "Un abonnement mensuel à la salle de sport" },
          { en: "Basic food and housing", es: "Alimentación básica y vivienda", fr: "Nourriture de base et logement" },
          { en: "The latest smartphone", es: "El último teléfono inteligente", fr: "Le dernier smartphone" },
        ],
        correct: 2,
        explanation: {
          en: "Needs are things required for basic survival and safety: food, shelter, healthcare, and transport to work. Everything else is technically a want — even if it feels necessary.",
          es: "Las necesidades son cosas requeridas para la supervivencia básica y la seguridad: comida, techo, atención médica y transporte al trabajo. Todo lo demás es técnicamente un deseo.",
          fr: "Les besoins sont des choses nécessaires à la survie de base et à la sécurité : nourriture, abri, soins de santé et transport au travail. Tout le reste est techniquement une envie.",
        },
      },
      {
        question: {
          en: "What is 'opportunity cost'?",
          es: "¿Qué es el 'costo de oportunidad'?",
          fr: "Qu'est-ce que le « coût d'opportunité » ?",
        },
        options: [
          { en: "A fee charged by investment brokers", es: "Una tarifa cobrada por corredores de inversión", fr: "Des frais facturés par des courtiers en investissement" },
          { en: "The tax you pay on purchases", es: "El impuesto que pagas en las compras", fr: "La taxe que vous payez sur les achats" },
          { en: "What you give up by choosing one option over another", es: "Lo que renuncias al elegir una opción sobre otra", fr: "Ce à quoi vous renoncez en choisissant une option plutôt qu'une autre" },
          { en: "The discount you missed by not waiting for a sale", es: "El descuento que perdiste por no esperar las rebajas", fr: "La remise que vous avez manquée en n'attendant pas les soldes" },
        ],
        correct: 2,
        explanation: {
          en: "Opportunity cost is what you forgo when you make a choice. Spending $150 on dinner 'costs' you $150 less toward another goal — it's the real price behind every decision.",
          es: "El costo de oportunidad es lo que renuncias al tomar una decisión. Gastar $150 en una cena te 'cuesta' $150 menos hacia otro objetivo.",
          fr: "Le coût d'opportunité est ce à quoi vous renoncez lorsque vous faites un choix. Dépenser 150 $ pour un dîner vous « coûte » 150 $ de moins vers un autre objectif.",
        },
      },
      {
        question: {
          en: "How long should you wait before buying something over $200?",
          es: "¿Cuánto tiempo debes esperar antes de comprar algo que cueste más de $200?",
          fr: "Combien de temps devez-vous attendre avant d'acheter quelque chose à plus de 200 $ ?",
        },
        options: [
          { en: "1 hour", es: "1 hora", fr: "1 heure" },
          { en: "24 hours", es: "24 horas", fr: "24 heures" },
          { en: "7 days", es: "7 días", fr: "7 jours" },
          { en: "30 days", es: "30 días", fr: "30 jours" },
        ],
        correct: 2,
        explanation: {
          en: "Waiting 7 days before purchases over $200 dramatically reduces impulse buying. The desire for most things fades within days if you don't act immediately.",
          es: "Esperar 7 días antes de compras superiores a $200 reduce drásticamente las compras impulsivas. El deseo de la mayoría de las cosas disminuye en días si no actúas de inmediato.",
          fr: "Attendre 7 jours avant les achats de plus de 200 $ réduit considérablement les achats impulsifs. Le désir de la plupart des choses s'estompe en quelques jours si vous n'agissez pas immédiatement.",
        },
      },
    ],
  },

  // ── Lesson 4: Credit & Debt ────────────────────────────────────────────────
  {
    id: "credit",
    emoji: "🏦",
    readTime: "4 min",
    color: "#f59e0b",
    title: {
      en: "Credit & Debt Fundamentals",
      es: "Fundamentos de Crédito y Deuda",
      fr: "Fondamentaux du Crédit et des Dettes",
    },
    description: {
      en: "Understand credit scores, good vs. bad debt, and how interest really works.",
      es: "Comprende las puntuaciones de crédito, la deuda buena vs. mala y cómo funciona realmente el interés.",
      fr: "Comprenez les scores de crédit, les bonnes et mauvaises dettes, et comment les intérêts fonctionnent vraiment.",
    },
    content: [
      {
        en: "Your credit score (300–850) tells lenders how risky it is to loan you money. The biggest factors: payment history (35% of your score) and credit utilization — how much of your available credit you're using (30%). Paying on time and keeping utilization below 30% are the two most impactful things you can do.",
        es: "Tu puntuación de crédito (300–850) indica a los prestamistas el riesgo de prestarte dinero. Los factores más importantes: historial de pagos (35% de tu puntuación) y utilización del crédito (30%). Pagar a tiempo y mantener la utilización por debajo del 30% son las dos cosas más impactantes que puedes hacer.",
        fr: "Votre score de crédit (300–850) indique aux prêteurs le risque qu'ils prennent à vous prêter de l'argent. Les facteurs les plus importants : l'historique de paiement (35% de votre score) et l'utilisation du crédit (30%). Payer à temps et maintenir l'utilisation en dessous de 30% sont les deux choses les plus impactantes à faire.",
      },
      {
        en: "Not all debt is equal. 'Good debt' funds things that grow in value or increase your earning power: a mortgage, student loans for a high-ROI degree. 'Bad debt' funds things that lose value: credit card balances at 20%+ interest, payday loans. The key question: does this debt help you build wealth?",
        es: "No toda la deuda es igual. La 'deuda buena' financia cosas que aumentan de valor o incrementan tu poder adquisitivo: una hipoteca, préstamos estudiantiles para una carrera de alto rendimiento. La 'deuda mala' financia cosas que pierden valor: saldos de tarjetas de crédito con intereses del 20%+, préstamos de día de pago.",
        fr: "Toutes les dettes ne sont pas égales. La « bonne dette » finance des choses qui prennent de la valeur ou augmentent votre pouvoir de gain : un prêt immobilier, des prêts étudiants pour un diplôme rentable. La « mauvaise dette » finance des choses qui perdent de la valeur : des soldes de cartes de crédit à 20%+ d'intérêts, des prêts sur salaire.",
      },
      {
        en: "At 20% APR (typical credit card), a $1,000 balance with only minimum payments can take 5+ years to pay off and cost $700+ in interest alone. The avalanche method (pay highest-interest debt first) saves the most money. The snowball method (pay smallest balance first) provides motivational wins. Both beat minimum payments.",
        es: "Al 20% TAE (tarjeta de crédito típica), un saldo de $1,000 con solo pagos mínimos puede tardar 5+ años en liquidarse y costar $700+ solo en intereses. El método avalancha (pagar primero la deuda de mayor interés) ahorra más dinero. El método bola de nieve (pagar primero el saldo más pequeño) proporciona victorias motivadoras.",
        fr: "À 20% de TAEG (carte de crédit typique), un solde de 1 000 $ avec seulement des paiements minimaux peut prendre 5+ ans à rembourser et coûter 700 $+ en intérêts seuls. La méthode avalanche (rembourser d'abord la dette au taux le plus élevé) économise le plus. La méthode boule de neige (rembourser d'abord le solde le plus petit) fournit des victoires motivantes.",
      },
    ],
    quiz: [
      {
        question: {
          en: "What is the biggest factor in your credit score?",
          es: "¿Cuál es el factor más importante de tu puntuación de crédito?",
          fr: "Quel est le facteur le plus important de votre score de crédit ?",
        },
        options: [
          { en: "Your income level", es: "Tu nivel de ingresos", fr: "Votre niveau de revenus" },
          { en: "How many credit cards you have", es: "Cuántas tarjetas de crédito tienes", fr: "Le nombre de cartes de crédit que vous avez" },
          { en: "Payment history", es: "Historial de pagos", fr: "Historique de paiement" },
          { en: "Your total savings amount", es: "El total de tus ahorros", fr: "Le montant total de votre épargne" },
        ],
        correct: 2,
        explanation: {
          en: "Payment history makes up 35% of your score — the single biggest factor. Paying every bill on time, consistently, is the most powerful thing you can do for your score.",
          es: "El historial de pagos representa el 35% de tu puntuación, el factor más importante. Pagar cada factura a tiempo, de forma consistente, es lo más poderoso que puedes hacer por tu puntuación.",
          fr: "L'historique de paiement représente 35% de votre score — le facteur le plus important. Payer chaque facture à temps, de manière constante, est la chose la plus puissante que vous puissiez faire pour votre score.",
        },
      },
      {
        question: {
          en: "Which of the following is generally considered 'good debt'?",
          es: "¿Cuál de los siguientes se considera generalmente 'deuda buena'?",
          fr: "Lequel des éléments suivants est généralement considéré comme une « bonne dette » ?",
        },
        options: [
          { en: "A credit card balance with 24% APR", es: "Un saldo de tarjeta de crédito con 24% TAE", fr: "Un solde de carte de crédit à 24% de TAEG" },
          { en: "A payday loan", es: "Un préstamo de día de pago", fr: "Un prêt sur salaire" },
          { en: "A mortgage on a home", es: "Una hipoteca sobre una vivienda", fr: "Un prêt immobilier" },
          { en: "A personal loan for a vacation", es: "Un préstamo personal para unas vacaciones", fr: "Un prêt personnel pour des vacances" },
        ],
        correct: 2,
        explanation: {
          en: "A mortgage is typically 'good debt' — it funds an asset that historically appreciates and builds equity. Bad debt funds depreciating purchases or consumables.",
          es: "Una hipoteca es típicamente 'deuda buena': financia un activo que históricamente se valoriza y genera capital. La deuda mala financia compras que se deprecian o bienes de consumo.",
          fr: "Un prêt immobilier est généralement une « bonne dette » — il finance un actif qui s'apprécie historiquement et constitue un capital. La mauvaise dette finance des achats qui se déprécient ou des produits de consommation.",
        },
      },
      {
        question: {
          en: "What is credit utilization, and what level is recommended?",
          es: "¿Qué es la utilización del crédito y qué nivel se recomienda?",
          fr: "Qu'est-ce que l'utilisation du crédit et quel niveau est recommandé ?",
        },
        options: [
          { en: "How often you use your card — use it daily", es: "Con qué frecuencia usas tu tarjeta — úsala a diario", fr: "La fréquence d'utilisation de votre carte — utilisez-la quotidiennement" },
          { en: "How many cards you have — keep it under 5", es: "Cuántas tarjetas tienes — mantener menos de 5", fr: "Le nombre de cartes que vous avez — en avoir moins de 5" },
          { en: "How much of your credit limit you're using — keep it under 30%", es: "Cuánto de tu límite de crédito estás usando — mantenlo por debajo del 30%", fr: "La proportion de votre limite de crédit utilisée — la maintenir sous 30%" },
          { en: "Your total credit limit — keep it above $10,000", es: "Tu límite de crédito total — mantenerlo por encima de $10,000", fr: "Votre limite de crédit totale — la maintenir au-dessus de 10 000 $" },
        ],
        correct: 2,
        explanation: {
          en: "Credit utilization is the percentage of available credit you're using. Keeping it below 30% signals to lenders you're not over-extended, which boosts your score.",
          es: "La utilización del crédito es el porcentaje del crédito disponible que estás usando. Mantenerlo por debajo del 30% señala a los prestamistas que no estás sobre-extendido, lo que mejora tu puntuación.",
          fr: "L'utilisation du crédit est le pourcentage du crédit disponible que vous utilisez. Le maintenir en dessous de 30% signale aux prêteurs que vous n'êtes pas surendetté, ce qui améliore votre score.",
        },
      },
    ],
  },

  // ── Lesson 5: Sustainable Spending ────────────────────────────────────────
  {
    id: "sustainable",
    emoji: "🌿",
    readTime: "4 min",
    color: "#00d37f",
    title: {
      en: "Sustainable Spending",
      es: "Gasto Sostenible",
      fr: "Dépenses Durables",
    },
    description: {
      en: "Buy less, buy better — how your choices affect the planet and your wallet.",
      es: "Compra menos, compra mejor: cómo tus elecciones afectan al planeta y a tu bolsillo.",
      fr: "Achetez moins, achetez mieux — comment vos choix affectent la planète et votre portefeuille.",
    },
    content: [
      {
        en: "Sustainable spending means considering the full impact of your purchase: environmental, social, and financial. The cheapest product often isn't — a $15 t-shirt that falls apart after 10 washes actually costs more per wear than a $45 shirt that lasts 3 years. Cost-per-use is a more honest measure of value than the sticker price.",
        es: "El gasto sostenible significa considerar el impacto total de tu compra: ambiental, social y financiero. El producto más barato a menudo no lo es: una camiseta de $15 que se deshace después de 10 lavados en realidad cuesta más por uso que una de $45 que dura 3 años. El costo por uso es una medida más honesta del valor que el precio de etiqueta.",
        fr: "Les dépenses durables signifient prendre en compte l'impact total de votre achat : environnemental, social et financier. Le produit le moins cher ne l'est souvent pas — un t-shirt à 15 $ qui tombe en morceaux après 10 lavages coûte en réalité plus par port qu'une chemise à 45 $ qui dure 3 ans.",
      },
      {
        en: "Fast fashion, fast electronics, and disposable goods externalize costs onto the environment. Some practical swaps: buy secondhand before buying new, choose products from brands with repair programs, prefer items with minimal packaging, and favor durability over novelty.",
        es: "La moda rápida, la electrónica rápida y los bienes desechables externalizan los costos al medio ambiente. Algunos intercambios prácticos: compra de segunda mano antes de comprar nuevo, elige productos de marcas con programas de reparación, prefiere artículos con envases mínimos y favorece la durabilidad sobre la novedad.",
        fr: "La mode rapide, l'électronique rapide et les produits jetables externalisent les coûts sur l'environnement. Quelques échanges pratiques : achetez d'occasion avant d'acheter neuf, choisissez des produits de marques proposant des programmes de réparation, préférez les articles avec un emballage minimal et favorisez la durabilité plutôt que la nouveauté.",
      },
      {
        en: "Your spending is a vote. Every purchase supports a business model. Shifting even 10–20% of your discretionary spending toward more sustainable options creates meaningful aggregate change. The Verdant extension shows you sustainability ratings and smarter alternatives before you buy.",
        es: "Tu gasto es un voto. Cada compra apoya un modelo de negocio. Cambiar incluso el 10–20% de tu gasto discrecional hacia opciones más sostenibles crea un cambio agregado significativo. La extensión Vyridian te muestra las valoraciones de sostenibilidad y alternativas más inteligentes antes de comprar.",
        fr: "Vos dépenses sont un vote. Chaque achat soutient un modèle économique. Déplacer même 10 à 20% de vos dépenses discrétionnaires vers des options plus durables crée un changement global significatif. L'extension Vyridian vous montre les évaluations de durabilité et des alternatives plus intelligentes avant d'acheter.",
      },
    ],
    quiz: [
      {
        question: {
          en: "What is 'cost-per-use' and why does it matter?",
          es: "¿Qué es el 'costo por uso' y por qué importa?",
          fr: "Qu'est-ce que le « coût par utilisation » et pourquoi est-ce important ?",
        },
        options: [
          { en: "Shipping cost divided by item weight", es: "Costo de envío dividido por el peso del artículo", fr: "Coût d'expédition divisé par le poids de l'article" },
          { en: "How much you effectively pay per time you use something", es: "Cuánto pagas efectivamente por cada vez que usas algo", fr: "Combien vous payez effectivement à chaque utilisation de quelque chose" },
          { en: "A fee charged by subscription services", es: "Una tarifa cobrada por los servicios de suscripción", fr: "Des frais facturés par les services d'abonnement" },
          { en: "The tax rate on luxury goods", es: "La tasa impositiva sobre los bienes de lujo", fr: "Le taux de taxe sur les produits de luxe" },
        ],
        correct: 1,
        explanation: {
          en: "Cost-per-use divides the total price by how many times you use something. A $90 jacket worn 200 times costs $0.45/use; a $20 jacket worn 10 times costs $2/use. This reveals true value.",
          es: "El costo por uso divide el precio total por el número de veces que usas algo. Una chaqueta de $90 usada 200 veces cuesta $0.45 por uso; una de $20 usada 10 veces cuesta $2 por uso. Esto revela el valor real.",
          fr: "Le coût par utilisation divise le prix total par le nombre d'utilisations. Un manteau à 90 $ porté 200 fois coûte 0,45 $/utilisation ; un à 20 $ porté 10 fois coûte 2 $/utilisation. Cela révèle la vraie valeur.",
        },
      },
      {
        question: {
          en: "Which is the most sustainable approach to buying electronics?",
          es: "¿Cuál es el enfoque más sostenible para comprar electrónica?",
          fr: "Quelle est l'approche la plus durable pour acheter des appareils électroniques ?",
        },
        options: [
          { en: "Buy the newest model every year", es: "Comprar el modelo más nuevo cada año", fr: "Acheter le modèle le plus récent chaque année" },
          { en: "Only buy the cheapest option", es: "Comprar solo la opción más barata", fr: "N'acheter que l'option la moins chère" },
          { en: "Buy secondhand or refurbished", es: "Comprar de segunda mano o reacondicionado", fr: "Acheter d'occasion ou reconditionné" },
          { en: "Avoid electronics entirely", es: "Evitar la electrónica por completo", fr: "Éviter complètement les appareils électroniques" },
        ],
        correct: 2,
        explanation: {
          en: "Buying secondhand or refurbished electronics extends the product's life, prevents e-waste, and often saves 30–60% vs. buying new.",
          es: "Comprar electrónica de segunda mano o reacondicionada extiende la vida del producto, previene los residuos electrónicos y a menudo ahorra un 30–60% frente a comprar nuevo.",
          fr: "Acheter des appareils électroniques d'occasion ou reconditionnés prolonge la durée de vie du produit, prévient les déchets électroniques et économise souvent 30 à 60% par rapport à l'achat neuf.",
        },
      },
      {
        question: {
          en: "What percentage of discretionary spending shifted sustainably creates meaningful impact?",
          es: "¿Qué porcentaje del gasto discrecional desviado de forma sostenible crea un impacto significativo?",
          fr: "Quel pourcentage des dépenses discrétionnaires orientées durablement crée un impact significatif ?",
        },
        options: [
          { en: "100% — it must be all-or-nothing", es: "100% — debe ser todo o nada", fr: "100% — c'est tout ou rien" },
          { en: "50% minimum", es: "50% como mínimo", fr: "50% minimum" },
          { en: "10–20%", es: "10–20%", fr: "10–20%" },
          { en: "1% is enough", es: "El 1% es suficiente", fr: "1% suffit" },
        ],
        correct: 2,
        explanation: {
          en: "Even shifting 10–20% of discretionary spending toward sustainable choices creates meaningful aggregate impact — and is a realistic target that doesn't require perfection.",
          es: "Incluso cambiar el 10–20% del gasto discrecional hacia elecciones sostenibles crea un impacto agregado significativo, y es un objetivo realista que no requiere perfección.",
          fr: "Même déplacer 10 à 20% des dépenses discrétionnaires vers des choix durables crée un impact global significatif — et c'est un objectif réaliste qui ne nécessite pas la perfection.",
        },
      },
    ],
  },
];

// ─── Extension popup translations (consumed by popup.js via inline JSON) ─────

/** Static UI labels for the extension popup in all three languages. */
export const POPUP_LABELS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    analyzing: "Analyzing…",
    connecting: "Connecting to Vyridian…",
    loading_profile: "Loading your profile…",
    scanning: "Scanning product page…",
    goal_impact: "Financial Impact",
    sustainability: "Sustainability",
    better_alt: "Better Alternative",
    search_amazon: "Search on Amazon",
    days_delay: "day delay to your goal",
    days_delay_plural: "days delay to your goal",
    pct_surplus: "% of monthly surplus",
    no_product: "No product detected",
    no_product_sub: "Navigate to a product page on Amazon, Best Buy, or Walmart.",
    no_profile: "Financial profile required",
    no_profile_sub: "Complete your income, expenses, and goals to see personalized impact analysis.",
    complete_profile: "Complete profile →",
    retry: "Try again",
    retry_profile: "I already did — retry",
    minimal: "Minimal",
    open_dashboard: "Open Dashboard",
    view_report: "View Full Report",
    error_server: "Could not reach Vyridian server. Make sure the app is running.",
    error_analysis: "Analysis failed",
  },
  es: {
    analyzing: "Analizando…",
    connecting: "Conectando a Vyridian…",
    loading_profile: "Cargando tu perfil…",
    scanning: "Escaneando página del producto…",
    goal_impact: "Impacto Financiero",
    sustainability: "Sostenibilidad",
    better_alt: "Mejor Alternativa",
    search_amazon: "Buscar en Amazon",
    days_delay: "día de retraso en tu objetivo",
    days_delay_plural: "días de retraso en tu objetivo",
    pct_surplus: "% del excedente mensual",
    no_product: "No se detectó ningún producto",
    no_product_sub: "Navega a una página de producto en Amazon, Best Buy o Walmart.",
    no_profile: "Perfil financiero requerido",
    no_profile_sub: "Completa tus ingresos, gastos y objetivos para ver el análisis de impacto personalizado.",
    complete_profile: "Completar perfil →",
    retry: "Intentar de nuevo",
    retry_profile: "Ya lo hice — reintentar",
    minimal: "Mínimo",
    open_dashboard: "Abrir Panel",
    view_report: "Ver Informe Completo",
    error_server: "No se pudo conectar al servidor Vyridian. Asegúrate de que la aplicación esté en ejecución.",
    error_analysis: "Error en el análisis",
  },
  fr: {
    analyzing: "Analyse en cours…",
    connecting: "Connexion à Vyridian…",
    loading_profile: "Chargement de votre profil…",
    scanning: "Analyse de la page produit…",
    goal_impact: "Impact Financier",
    sustainability: "Durabilité",
    better_alt: "Meilleure Alternative",
    search_amazon: "Rechercher sur Amazon",
    days_delay: "jour de retard sur votre objectif",
    days_delay_plural: "jours de retard sur votre objectif",
    pct_surplus: "% de l'excédent mensuel",
    no_product: "Aucun produit détecté",
    no_product_sub: "Naviguez vers une page produit sur Amazon, Best Buy ou Walmart.",
    no_profile: "Profil financier requis",
    no_profile_sub: "Complétez vos revenus, dépenses et objectifs pour voir l'analyse d'impact personnalisée.",
    complete_profile: "Compléter le profil →",
    retry: "Réessayer",
    retry_profile: "Je l'ai déjà fait — réessayer",
    minimal: "Minimal",
    open_dashboard: "Ouvrir le tableau de bord",
    view_report: "Voir le rapport complet",
    error_server: "Impossible de joindre le serveur Vyridian. Assurez-vous que l'application est en cours d'exécution.",
    error_analysis: "Échec de l'analyse",
  },
};
