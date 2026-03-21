/**
 * Vyridian Extension Popup
 * Reads product data from the content script, sends it to the Vyridian API,
 * and renders the result.
 *
 * Key fixes vs prior version:
 *  - AbortSignal.timeout() replaced with Promise.race (wider browser compat)
 *  - Profile sync: on every popup open, tries to pull profile from active tab's
 *    localStorage via scripting API before falling back to cached storage
 *  - Better error messages with context for debugging
 */

const PORTS = [3000, 3001, 3002];
let API_BASE = null;

// ── Multilingual popup labels ──────────────────────────────────────────────
const LABELS = {
  en: {
    analyzing: "Analyzing…",
    connecting: "Connecting to Vyridian…",
    loading_profile: "Loading your profile…",
    scanning: "Scanning product page…",
    goal_impact: "Financial Impact",
    sustainability: "Sustainability",
    better_alt: "Better Alternative",
    search_amazon: "🔍 Search on Amazon",
    days_delay: "day delay to your goal",
    days_delay_plural: "days delay to your goal",
    pct_surplus: "% of monthly surplus",
    no_product: "No product detected",
    no_product_sub: "Navigate to a product page on Amazon, Best Buy, or Walmart to get insights.",
    no_product_refresh: "The page loaded but no product was found. Try refreshing and clicking the icon again.",
    no_profile: "Financial profile required",
    no_profile_sub: "Complete your financial profile — income, expenses, and goals — to see personalized impact analysis for any product.",
    complete_profile: "Complete profile →",
    complete_profile_setup: "Set up profile →",
    complete_profile_first: "To see personalized impact analysis, enter your income, expenses, and goals on the Vyridian website first.",
    retry: "🔄 Try again",
    retry_profile: "I already did — retry",
    minimal: "Minimal",
    open_dashboard: "Open Dashboard",
    view_report: "View Full Report",
    delay_to_goal: "delay to your goal",
    error_server: "Could not reach Vyridian server. Make sure the app is running (pnpm dev).",
    error_analysis: "Analysis failed",
    re_scanning: "Re-scanning page…",
    looking_profile: "Looking for your profile…",
  },
  es: {
    analyzing: "Analizando…",
    connecting: "Conectando a Vyridian…",
    loading_profile: "Cargando tu perfil…",
    scanning: "Escaneando página del producto…",
    goal_impact: "Impacto Financiero",
    sustainability: "Sostenibilidad",
    better_alt: "Mejor Alternativa",
    search_amazon: "🔍 Buscar en Amazon",
    days_delay: "día de retraso en tu objetivo",
    days_delay_plural: "días de retraso en tu objetivo",
    pct_surplus: "% del excedente mensual",
    no_product: "No se detectó ningún producto",
    no_product_sub: "Navega a una página de producto en Amazon, Best Buy o Walmart.",
    no_product_refresh: "La página cargó pero no se encontró ningún producto. Actualiza e intenta de nuevo.",
    no_profile: "Perfil financiero requerido",
    no_profile_sub: "Completa tu perfil financiero — ingresos, gastos y objetivos — para ver el análisis de impacto personalizado.",
    complete_profile: "Completar perfil →",
    complete_profile_setup: "Configurar perfil →",
    complete_profile_first: "Para ver el análisis personalizado, ingresa tus ingresos, gastos y objetivos en el sitio web de Vyridian primero.",
    retry: "🔄 Intentar de nuevo",
    retry_profile: "Ya lo hice — reintentar",
    minimal: "Mínimo",
    open_dashboard: "Abrir Panel",
    view_report: "Ver Informe Completo",
    delay_to_goal: "de retraso en tu objetivo",
    error_server: "No se pudo conectar al servidor Vyridian. Asegúrate de que la aplicación esté en ejecución.",
    error_analysis: "Error en el análisis",
    re_scanning: "Re-escaneando página…",
    looking_profile: "Buscando tu perfil…",
  },
  fr: {
    analyzing: "Analyse en cours…",
    connecting: "Connexion à Vyridian…",
    loading_profile: "Chargement de votre profil…",
    scanning: "Analyse de la page produit…",
    goal_impact: "Impact Financier",
    sustainability: "Durabilité",
    better_alt: "Meilleure Alternative",
    search_amazon: "🔍 Rechercher sur Amazon",
    days_delay: "jour de retard sur votre objectif",
    days_delay_plural: "jours de retard sur votre objectif",
    pct_surplus: "% de l'excédent mensuel",
    no_product: "Aucun produit détecté",
    no_product_sub: "Naviguez vers une page produit sur Amazon, Best Buy ou Walmart.",
    no_product_refresh: "La page a chargé mais aucun produit n'a été trouvé. Actualisez et réessayez.",
    no_profile: "Profil financier requis",
    no_profile_sub: "Complétez votre profil financier — revenus, dépenses et objectifs — pour voir l'analyse d'impact personnalisée.",
    complete_profile: "Compléter le profil →",
    complete_profile_setup: "Configurer le profil →",
    complete_profile_first: "Pour voir l'analyse personnalisée, saisissez vos revenus, dépenses et objectifs sur le site Vyridian d'abord.",
    retry: "🔄 Réessayer",
    retry_profile: "Je l'ai déjà fait — réessayer",
    minimal: "Minimal",
    open_dashboard: "Ouvrir le tableau de bord",
    view_report: "Voir le rapport complet",
    delay_to_goal: "de retard sur votre objectif",
    error_server: "Impossible de joindre le serveur Vyridian. Assurez-vous que l'application est en cours d'exécution.",
    error_analysis: "Échec de l'analyse",
    re_scanning: "Nouvelle analyse de la page…",
    looking_profile: "Recherche de votre profil…",
  },
};

/** Current UI language — updated when profile loads. Defaults to English. */
let _lang = "en";

/** Resolve a language code to a supported locale. */
function resolveLang(lang) {
  if (lang === "es" || lang === "fr") return lang;
  return "en";
}

/** Get a localized label string. */
function label(key) {
  return (LABELS[_lang] || LABELS.en)[key] || LABELS.en[key] || key;
}

const main = document.getElementById("main");
const openBtn = document.getElementById("open-dashboard");
const userNameEl = document.getElementById("user-name");

// ── Timeout-safe fetch (replaces AbortSignal.timeout which is unreliable in extensions) ──
function fetchWithTimeout(url, options = {}, ms = 1500) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Detect which port the Next.js server is running on ───────────────────────
async function detectApiBase() {
  for (const port of PORTS) {
    try {
      const res = await fetchWithTimeout(
        `http://localhost:${port}/api/auth/me`,
        { method: "GET" },
        1200
      );
      if (res.status === 200 || res.status === 401) {
        console.log(`[Vyridian] Server found on port ${port}`);
        return `http://localhost:${port}`;
      }
    } catch (e) {
      console.log(`[Vyridian] Port ${port} not responding:`, e.message);
    }
  }
  console.warn("[Vyridian] Could not find server on any port, defaulting to 3000");
  return "http://localhost:3000";
}

// ── Load profile: first try syncing from tab, then fall back to cached storage ─
async function loadAndSyncProfile(tabId) {
  // Step 1: Try active tab (may be the shopping page or the Vyridian website)
  if (tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => ({
          profile: localStorage.getItem("verdant_profile"),
          locale: localStorage.getItem("verdant_locale"),
        }),
      });
      const data = results?.[0]?.result;
      if (data?.profile) {
        await chrome.storage.local.set({ verdant_profile: data.profile });
        if (data.locale) await chrome.storage.local.set({ verdant_locale: data.locale });
        console.log("[Vyridian] Profile synced from active tab");
        return JSON.parse(data.profile);
      }
    } catch (e) {
      console.log("[Vyridian] Could not sync from active tab:", e.message);
    }
  }

  // Step 2: Try to find Vyridian website open in another tab
  try {
    const verdantTabs = await chrome.tabs.query({});
    for (const t of verdantTabs) {
      if (t.id && t.id !== tabId && t.url && /localhost:\d+|verdant\.vercel\.app/.test(t.url)) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: t.id },
            func: () => ({
              profile: localStorage.getItem("verdant_profile"),
              locale: localStorage.getItem("verdant_locale"),
            }),
          });
          const data = results?.[0]?.result;
          if (data?.profile) {
            await chrome.storage.local.set({ verdant_profile: data.profile });
            if (data.locale) await chrome.storage.local.set({ verdant_locale: data.locale });
            console.log("[Vyridian] Profile synced from Vyridian tab:", t.url);
            return JSON.parse(data.profile);
          }
        } catch {}
      }
    }
  } catch {}

  // Step 3: Fall back to chrome.storage.local
  return new Promise((resolve) => {
    chrome.storage.local.get(["verdant_profile", "verdant_locale"], (result) => {
      // Apply stored locale preference even if profile language field is stale
      if (result.verdant_locale) _lang = resolveLang(result.verdant_locale);
      if (result.verdant_profile) {
        try {
          console.log("[Vyridian] Profile loaded from chrome.storage.local");
          resolve(JSON.parse(result.verdant_profile));
          return;
        } catch (e) {
          console.warn("[Vyridian] Failed to parse cached profile:", e);
        }
      }
      console.log("[Vyridian] No profile found");
      resolve(null);
    });
  });
}

// ── Render helpers ────────────────────────────────────────────────────────────

function render(html) { main.innerHTML = html; }

function renderHeader(profileName) {
  if (profileName && userNameEl) {
    userNameEl.textContent = profileName;
    userNameEl.style.display = "block";
  }
}

function renderState(icon, title, sub, extraHtml = "") {
  render(`
    <div class="state" role="status">
      <div class="state-icon" aria-hidden="true">${icon}</div>
      <p class="state-title">${title}</p>
      ${sub ? `<p class="state-sub">${sub}</p>` : ""}
      ${extraHtml}
    </div>
  `);
}

function renderLoading(msg) {
  render(`
    <div class="state" role="status" aria-label="${label("analyzing")}">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">${label("analyzing")}</p>
      <p class="state-sub">${msg ?? label("analyzing")}</p>
    </div>
  `);
}

function renderNoProduct(url) {
  const isShoppingPage = url && /(amazon|bestbuy|walmart|target|etsy|ebay)/.test(url);
  renderState(
    "🛍️",
    label("no_product"),
    isShoppingPage ? label("no_product_refresh") : label("no_product_sub"),
    `<button onclick="retryProduct()" class="cta-btn cta-secondary" style="margin-top:10px;max-width:180px;">
      ${label("retry")}
    </button>`
  );
}

function renderNoProfile() {
  render(`
    <div class="state" role="status">
      <div class="state-icon" aria-hidden="true">📊</div>
      <p class="state-title">${label("no_profile")}</p>
      <p class="state-sub">${label("no_profile_sub")}</p>
      <a href="${API_BASE}/en/onboarding" target="_blank" class="get-started-btn">
        ${label("complete_profile")}
      </a>
      <button onclick="retryProfile()" class="cta-btn cta-secondary" style="margin-top:8px;max-width:200px;font-size:11px;">
        ${label("retry_profile")}
      </button>
    </div>
  `);
}

// ── Classification helpers ────────────────────────────────────────────────────

function verdictClass(verdict) {
  if (verdict === "significant") return "impact-significant";
  if (verdict === "moderate") return "impact-moderate";
  return "impact-minor";
}

function barClass(pct) {
  if (pct <= 25) return "bar-green";
  if (pct <= 75) return "bar-yellow";
  return "bar-red";
}

function sustainabilityClass(rating) {
  const r = (rating || "").toLowerCase();
  if (r === "high") return "sust-high";
  if (r === "low") return "sust-low";
  return "sust-medium";
}

function sustainabilityEmoji(rating) {
  if ((rating || "").toLowerCase() === "high") return "🌿";
  if ((rating || "").toLowerCase() === "low") return "⚠️";
  return "〜";
}

// ── Main result renderer ──────────────────────────────────────────────────────

function renderResult(product, analysis) {
  const priceStr = product.productPrice > 0 ? `$${product.productPrice.toFixed(2)}` : "";
  const verdictC = verdictClass(analysis.financialVerdict);
  const pct = Math.round(analysis.percentOfSurplus ?? 0);
  const days = analysis.daysDelayed ?? 0;
  const savingsPct = analysis.alternative?.savingsPercent ?? 0;
  const barFill = Math.min(100, pct);
  const barCls = barClass(pct);
  const bm = analysis.categoryBenchmark;
  const bmScore = bm?.sustainabilityScore ?? null;
  const bmAvgSpend = bm?.avgMonthlySpend ?? null;
  const bmCo2 = bm?.co2PerPurchaseKg ?? null;

  const reportLocale = (_currentProfile?.language) || _lang || "en";
  const reportUrl = `${API_BASE}/${reportLocale}/product-report` +
    `?product=${encodeURIComponent(product.productName)}` +
    `&price=${product.productPrice}` +
    `&category=${encodeURIComponent(product.productCategory)}` +
    `&brand=${encodeURIComponent(product.brand || "")}` +
    `&store=${encodeURIComponent(product.store || "")}`;

  render(`
    <!-- Product card -->
    <div class="card">
      ${product.store ? `<span class="product-store">${escHtml(product.store)}</span>` : ""}
      <p class="product-name">${escHtml(product.productName)}</p>
      ${priceStr ? `<p class="product-price">${escHtml(priceStr)}</p>` : ""}
      <p class="product-meta">${escHtml(
        [product.brand, product.productCategory].filter(Boolean).join(" · ")
      )}</p>
      ${bmScore !== null || bmAvgSpend !== null ? `
        <div class="bm-strip">
          ${bmScore !== null ? `<span class="bm-stat">🌿 ${bmScore}/100</span>` : ""}
          ${bmCo2 !== null ? `<span class="bm-stat">~${bmCo2} kg CO₂</span>` : ""}
          ${bmAvgSpend !== null ? `<span class="bm-stat">avg $${bmAvgSpend}/mo</span>` : ""}
        </div>` : ""}
    </div>

    <!-- Financial impact card -->
    <div class="impact-card ${verdictC}" role="region" aria-label="${label("goal_impact")}">
      <p class="section-label">${label("goal_impact")}</p>
      <div class="impact-metrics">
        <div class="metric-box">
          <div class="metric-value ${days > 14 ? (days > 30 ? "metric-danger" : "metric-warn") : "metric-accent"}">${days > 0 ? days : "0"}</div>
          <div class="metric-label">${days === 1 ? label("days_delay") : label("days_delay_plural")}</div>
        </div>
        <div class="metric-box">
          <div class="metric-value ${pct > 75 ? "metric-danger" : pct > 25 ? "metric-warn" : "metric-accent"}">${pct}%</div>
          <div class="metric-label">${label("pct_surplus").replace(/^%\s*/, "").trim() || "of monthly surplus"}</div>
        </div>
      </div>
      <div class="mini-bar-track" role="progressbar" aria-valuenow="${barFill}" aria-valuemin="0" aria-valuemax="100">
        <div class="mini-bar-fill ${barCls}" style="width:${barFill}%"></div>
      </div>
      <p class="bar-label">${pct}% of monthly surplus used</p>
      <p class="impact-detail">${escHtml(analysis.goalImpact)}</p>
    </div>

    <!-- Sustainability card -->
    <div class="card" aria-label="${label("sustainability")}">
      <p class="section-label">${label("sustainability")}</p>
      ${bm ? `
        <div class="sust-score-row">
          <span class="sust-badge ${sustainabilityClass(analysis.sustainabilityRating)}">${sustainabilityEmoji(analysis.sustainabilityRating)} ${escHtml(analysis.sustainabilityRating)}</span>
          <div class="sust-score-track">
            <div class="sust-score-fill" style="width:${bm.sustainabilityScore}%;background:${analysis.sustainabilityRating.toLowerCase() === 'high' ? 'var(--accent)' : analysis.sustainabilityRating.toLowerCase() === 'low' ? 'var(--danger)' : 'var(--warn)'};"></div>
          </div>
          <span class="sust-score-num">${bm.sustainabilityScore}/100</span>
        </div>
      ` : `<span class="sust-badge ${sustainabilityClass(analysis.sustainabilityRating)} mb-2">${sustainabilityEmoji(analysis.sustainabilityRating)} ${escHtml(analysis.sustainabilityRating)}</span><br>`}
      <p class="info-value">${escHtml(analysis.sustainabilityReason)}</p>
    </div>

    <!-- Better alternative card -->
    <div class="alt-card" aria-label="${label("better_alt")}">
      <div class="alt-header">
        <p class="section-label" style="margin-bottom:0">${label("better_alt")}</p>
        ${savingsPct > 0 ? `<span class="savings-badge">−${savingsPct}%</span>` : ""}
      </div>
      <p class="alt-name">${escHtml(analysis.alternative.name)}</p>
      <p class="alt-price">${escHtml(analysis.alternative.estimatedPrice)}</p>
      <p class="alt-reason">${escHtml(analysis.alternative.reason)}</p>
      <a href="https://www.amazon.com/s?k=${encodeURIComponent(analysis.alternative.name)}"
         target="_blank" rel="noopener noreferrer" class="cta-btn cta-secondary"
         style="margin-top:8px;font-size:11px;text-align:center;">
        ${label("search_amazon")}
      </a>
    </div>

    <!-- CTA Buttons -->
    <a href="${escHtml(reportUrl)}" target="_blank" class="cta-btn cta-primary"
       aria-label="${label("view_report")}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      ${label("view_report")}
    </a>
    <a href="${escHtml(`${API_BASE}/en/dashboard`)}" target="_blank"
       class="cta-btn cta-secondary" aria-label="${label("open_dashboard")}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      ${label("open_dashboard")}
    </a>
  `);
}

function renderError(msg, retryable = true) {
  render(`
    <div class="error-box" role="alert">${escHtml(msg || "Something went wrong.")}</div>
    ${retryable
      ? `<button onclick="init()" class="cta-btn cta-secondary" style="margin-top:8px;">
           🔄 Retry
         </button>`
      : ""}
  `);
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Global retry handlers (called from inline onclick in rendered HTML) ───────
let _currentTab = null;
let _currentProfile = null;

async function retryProduct() {
  if (!_currentTab || !_currentProfile) { init(); return; }
  renderLoading(label("re_scanning"));
  await runProductScan(_currentTab, _currentProfile);
}

async function retryProfile() {
  renderLoading(label("looking_profile"));
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const profile = await loadAndSyncProfile(tab?.id);
  if (profile) {
    _lang = resolveLang(profile.language);
    _currentProfile = profile;
    renderHeader(profile.name);
    if (tab) await runProductScan(tab, profile);
  } else {
    renderNoProfile();
  }
}

// ── Product scan + analysis (extracted so retryProduct can call it) ───────────
async function runProductScan(tab, profile) {
  // Gate: profile must have real user-entered data
  const hasRealData = profile &&
    profile.income?.monthlyNet > 0 &&
    Array.isArray(profile.expenses) && profile.expenses.length > 0 &&
    Array.isArray(profile.goals) && profile.goals.length > 0;

  if (!hasRealData) {
    render(`
      <div class="state" role="status">
        <div class="state-icon" aria-hidden="true">📊</div>
        <p class="state-title">${label("no_profile")}</p>
        <p class="state-sub">${label("complete_profile_first")}</p>
        <a href="${API_BASE}/en/onboarding" target="_blank" class="get-started-btn">
          ${label("complete_profile_setup")}
        </a>
      </div>
    `);
    return;
  }

  let product;
  try {
    product = await chrome.tabs.sendMessage(tab.id, { type: "GET_PRODUCT" });
  } catch (e) {
    console.warn("[Vyridian] sendMessage failed:", e.message,
      "— content script may not be injected yet");
    renderNoProduct(tab.url);
    return;
  }

  console.log("[Vyridian] Product data:", product);

  if (!product?.found || !product.productName) {
    renderNoProduct(tab.url);
    return;
  }

  renderLoading(`Analyzing "${product.productName.slice(0, 40)}…"`);

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.productName,
          productPrice: product.productPrice,
          productCategory: product.productCategory,
          brand: product.brand,
          userProfile: {
            income: profile.income,
            expenses: profile.expenses ?? [],
            goals: profile.goals,
            language: profile.language,
            sustainabilityPriority: profile.sustainabilityPriority,
          },
        }),
      },
      30000 // 30s timeout for Claude API call
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API returned ${res.status}: ${body.slice(0, 100)}`);
    }

    const analysis = await res.json();
    console.log("[Vyridian] Analysis:", analysis);
    renderResult(product, analysis);
  } catch (e) {
    console.error("[Vyridian] Analysis error:", e);
    renderError(
      e.message.includes("Timeout") || e.message.includes("fetch")
        ? label("error_server")
        : `${label("error_analysis")}: ${e.message}`
    );
  }
}

// ── Main flow ─────────────────────────────────────────────────────────────────

async function init() {
  renderLoading(label("connecting"));

  // 1. Find the server
  API_BASE = await detectApiBase();
  openBtn.onclick = () => chrome.tabs.create({ url: `${API_BASE}/en/dashboard` });

  // 2. Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  _currentTab = tab;

  if (!tab?.id) {
    renderError("Could not access the current tab.", false);
    return;
  }

  // 3. Sync + load profile (tries tab localStorage first, then cached storage)
  renderLoading(label("loading_profile"));
  const profile = await loadAndSyncProfile(tab.id);
  _currentProfile = profile;

  // Update language as soon as profile is loaded
  if (profile?.language) _lang = resolveLang(profile.language);

  if (profile?.name) renderHeader(profile.name);

  if (!profile) {
    renderNoProfile();
    return;
  }

  // 4. Scan the page for product data
  renderLoading(label("scanning"));
  await runProductScan(tab, profile);
}

init();
