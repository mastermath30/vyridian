/**
 * Vyridian Content Script
 * Runs on every page. Extracts product information when on a shopping page.
 * Handles Amazon SPA navigation via MutationObserver.
 */

// ── Amazon: wait for title to appear before reporting data ──────────────────
function isAmazonProductPage() {
  return /amazon\.(com|co\.uk|ca|com\.au|de|fr|es|it|co\.jp)/.test(window.location.hostname)
    && /\/(dp|gp\/product)\//.test(window.location.pathname);
}

/**
 * Wait for an element matching `selector` to appear in the DOM.
 * Resolves after `timeout` ms even if not found.
 */
function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { observer.disconnect(); resolve(found); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
  });
}

// ── Best Buy detection ───────────────────────────────────────────────────────
function isBestBuyProductPage() {
  return window.location.hostname.includes("bestbuy.com") && /\/site\//.test(window.location.pathname);
}

function getBestBuyData() {
  const title = document.querySelector('.sku-title h1, [data-testid="sku-title"], .shop-sku-title h1, h1[class*="heading"]')?.textContent?.trim();
  // Try multiple price selectors in order of reliability
  let price = 0;
  const priceSelectors = [
    '[data-testid="customer-price"] span[aria-hidden="true"]',
    '[data-testid="customer-price"] span:first-child',
    '.priceView-customer-price span:first-child',
    '.priceView-hero-price span:first-child',
    '[data-testid="sr-only-price"]',
    '.sr-only[aria-label*="Your price"]',
  ];
  for (const sel of priceSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const raw = el.getAttribute('aria-label') || el.textContent || '';
      const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (parsed > 0) { price = parsed; break; }
    }
  }
  const brand = document.querySelector('[data-testid="brand-link"], .brand-link, [class*="brand"]')?.textContent?.trim();
  const category = document.querySelector('.breadcrumb-list li:last-child a, [aria-label="breadcrumb"] li:last-child, [data-testid="breadcrumb-link"]:last-child')?.textContent?.trim();
  return { title, price, brand, category };
}

// ── Walmart detection ────────────────────────────────────────────────────────
function isWalmartProductPage() {
  return window.location.hostname.includes("walmart.com") && window.location.pathname.includes("/ip/");
}

function getWalmartData() {
  const titleSelectors = [
    '[itemprop="name"] span',
    'h1[itemprop="name"]',
    '[data-testid="product-title"]',
    '[data-item-id] h1',
    'h1.f3.b',
    '.f3.b.lh-copy',
    'h1.prod-ProductTitle',
    'h1',
  ];
  let title = '';
  for (const sel of titleSelectors) {
    const t = document.querySelector(sel)?.textContent?.trim();
    if (t && t.length > 3) { title = t; break; }
  }

  let price = 0;
  // Strategy 1: itemprop="price" content attribute (most reliable)
  const priceContent = document.querySelector('[itemprop="price"]');
  if (priceContent) {
    const val = priceContent.getAttribute('content') || priceContent.textContent || '';
    price = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
  }
  // Strategy 2: data-automation-id price container
  if (!price) {
    const automationPrice = document.querySelector(
      '[data-automation-id="product-price"] span, [data-automation-id="product-price"] [itemprop="price"]'
    );
    if (automationPrice) {
      price = parseFloat((automationPrice.getAttribute('content') || automationPrice.textContent || '').replace(/[^0-9.]/g, '')) || 0;
    }
  }
  // Strategy 3: price-group / price-characteristic classes
  if (!price) {
    const charEl = document.querySelector('.price-characteristic, [class*="price-group"] span');
    if (charEl) {
      price = parseFloat((charEl.getAttribute('content') || charEl.textContent || '').replace(/[^0-9.]/g, '')) || 0;
    }
  }

  const brand = document.querySelector('[data-automation-id="product-brand"], [data-testid="product-brand"], .prod-brandName')?.textContent?.trim();
  const category = document.querySelector('[aria-label="breadcrumb"] li:last-child span, .breadcrumb-list li:last-child, nav[aria-label="breadcrumb"] li:last-child')?.textContent?.trim();
  return { title, price, brand, category };
}

// ── Amazon-specific price extraction ────────────────────────────────────────
function getAmazonPrice() {
  // Strategy 1: .a-offscreen inside .a-price has the full "$24.99" text (screen-reader hidden)
  const offscreen = document.querySelector(".a-price .a-offscreen");
  if (offscreen) {
    const parsed = parseFloat(offscreen.textContent.replace(/[^0-9.]/g, ""));
    if (parsed > 0) return parsed;
  }

  // Strategy 2: #price_inside_buybox (buy box price, most reliable)
  const buybox = document.querySelector("#price_inside_buybox, #priceblock_ourprice, #priceblock_dealprice");
  if (buybox) {
    const parsed = parseFloat(buybox.textContent.replace(/[^0-9.]/g, ""));
    if (parsed > 0) return parsed;
  }

  // Strategy 3: Combine whole + fraction (e.g. "24" + "99" → 24.99)
  const whole = document.querySelector(".a-price-whole");
  const fraction = document.querySelector(".a-price-fraction");
  if (whole) {
    const w = whole.textContent.replace(/[^0-9]/g, "");
    const f = fraction ? fraction.textContent.replace(/[^0-9]/g, "").padEnd(2, "0") : "00";
    const parsed = parseFloat(`${w}.${f}`);
    if (parsed > 0) return parsed;
  }

  // Strategy 4: generic data-asin-price attribute
  const asinPrice = document.querySelector('[data-asin-price], [data-price]');
  if (asinPrice) {
    const attr = asinPrice.getAttribute('data-asin-price') || asinPrice.getAttribute('data-price') || '';
    const parsed = parseFloat(attr.replace(/[^0-9.]/g, ''));
    if (parsed > 0) return parsed;
  }

  return 0;
}

// ── Main extraction ──────────────────────────────────────────────────────────
function extractProductData() {
  const result = {
    found: false,
    productName: "",
    productPrice: 0,
    productCategory: "",
    brand: "",
    store: "",
    url: window.location.href,
  };

  // ── Strategy 1: JSON-LD structured data ──────────────────────────────────
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "Product") {
          result.productName = item.name || "";
          result.brand = item.brand?.name || item.brand || "";
          result.productCategory = item.category || inferCategory(result.productName);
          if (item.offers) {
            const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
            result.productPrice = parseFloat(offers[0]?.price) || 0;
          }
          if (result.productName) { result.found = true; return result; }
        }
      }
    } catch {}
  }

  // ── Strategy 2: Open Graph meta tags ─────────────────────────────────────
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
  const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute("content");
  if (ogTitle && ogType === "product") {
    result.productName = ogTitle;
    result.found = true;
  }

  // ── Strategy 3: Amazon-specific selectors ────────────────────────────────
  if (isAmazonProductPage()) {
    result.store = "Amazon";
    const titleEl = document.querySelector("#productTitle");
    if (titleEl?.textContent?.trim()) {
      result.productName = titleEl.textContent.trim().slice(0, 150);
      result.found = true;
    }
    result.productPrice = getAmazonPrice();

    const byline = document.querySelector("#bylineInfo");
    if (byline?.textContent?.trim()) {
      result.brand = byline.textContent.replace(/^(Visit|Brand:|by)\s*/i, "").trim().slice(0, 60);
    }

    result.productCategory = result.productCategory || inferCategoryFromBreadcrumb() || inferCategory(result.productName);
    return result;
  }

  // ── Strategy 3b: Best Buy-specific selectors ─────────────────────────────
  if (isBestBuyProductPage()) {
    result.store = "Best Buy";
    const d = getBestBuyData();
    if (d.title) {
      result.productName = d.title.slice(0, 150);
      result.found = true;
    }
    if (d.price > 0) result.productPrice = d.price;
    if (d.brand) result.brand = d.brand.slice(0, 60);
    result.productCategory = d.category || inferCategory(result.productName);
    return result;
  }

  // ── Strategy 3c: Walmart-specific selectors ───────────────────────────────
  if (isWalmartProductPage()) {
    result.store = "Walmart";
    const d = getWalmartData();
    if (d.title) {
      result.productName = d.title.slice(0, 150);
      result.found = true;
    }
    if (d.price > 0) result.productPrice = d.price;
    if (d.brand) result.brand = d.brand.slice(0, 60);
    result.productCategory = d.category || inferCategory(result.productName);
    return result;
  }

  // ── Strategy 4: Generic e-commerce DOM patterns ───────────────────────────
  const titleSelectors = [
    ".product-title", "[data-testid='product-title']",
    "h1.title", ".pdp-title", ".product_title",
    "h1[itemprop='name']", ".product-name h1", "h1",
  ];
  for (const sel of titleSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      result.productName = el.textContent.trim().slice(0, 120);
      result.found = true;
      break;
    }
  }

  const priceSelectors = [
    "[data-testid='price']", ".price", ".product-price",
    "[itemprop='price']", ".pdp-price", ".current-price",
  ];
  for (const sel of priceSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const raw = el.getAttribute("content") || el.textContent || "";
      const parsed = parseFloat(raw.replace(/[^0-9.]/g, ""));
      if (parsed > 0) { result.productPrice = parsed; break; }
    }
  }

  const brandSelectors = ["[itemprop='brand']", ".product-brand", ".brand-name"];
  for (const sel of brandSelectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) { result.brand = el.textContent.trim().slice(0, 60); break; }
  }

  result.productCategory = result.productCategory || inferCategory(result.productName);
  return result;
}

function inferCategoryFromBreadcrumb() {
  // Amazon breadcrumb: #wayfinding-breadcrumbs_feature_div
  const crumb = document.querySelector("#wayfinding-breadcrumbs_feature_div");
  if (crumb) {
    const items = crumb.querySelectorAll("a");
    if (items.length > 0) return items[items.length - 1].textContent.trim();
  }
  return "";
}

function inferCategory(name) {
  const n = (name || "").toLowerCase();
  if (/jacket|shirt|pants|dress|shoes|boots|hoodie|sweater|coat|jeans|clothing|apparel/.test(n)) return "Clothing & Apparel";
  if (/laptop|phone|tablet|headphone|speaker|camera|tv|monitor|keyboard|mouse|cable|charger|earbuds/.test(n)) return "Electronics";
  if (/sofa|chair|desk|lamp|shelf|bed|mattress|pillow|blanket|curtain/.test(n)) return "Home & Furniture";
  if (/shampoo|moisturizer|sunscreen|cleanser|serum|mascara|lipstick|foundation|skincare|beauty/.test(n)) return "Beauty & Personal Care";
  if (/vitamin|supplement|protein|omega|probiotic/.test(n)) return "Health & Supplements";
  if (/book|novel|textbook/.test(n)) return "Books";
  if (/toy|game|puzzle|lego/.test(n)) return "Toys & Games";
  if (/shoe|sneaker|boot|sandal/.test(n)) return "Footwear";
  if (/coffee|tea|food|snack|drink|beverage/.test(n)) return "Food & Beverage";
  return "General";
}

// ── Sync localStorage profile to chrome.storage.local so popup can read it ──
(function syncProfile() {
  try {
    const raw = localStorage.getItem("verdant_profile");
    if (raw) chrome.storage.local.set({ verdant_profile: raw });
    // Also sync locale preference so popup can read it even from non-Vyridian pages
    const locale = localStorage.getItem("verdant_locale");
    if (locale) chrome.storage.local.set({ verdant_locale: locale });
  } catch {}
})();

// ── Listen for messages from popup ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PRODUCT") {
    if (isAmazonProductPage()) {
      waitForElement("#productTitle", 4000).then(() => {
        sendResponse(extractProductData());
      });
      return true;
    }
    if (isBestBuyProductPage()) {
      waitForElement('.sku-title h1, [data-testid="sku-title"]', 4000).then(() => {
        sendResponse(extractProductData());
      });
      return true;
    }
    if (isWalmartProductPage()) {
      // Walmart can lazy-load the price — wait briefly then extract
      waitForElement('[itemprop="price"], [data-automation-id="product-price"]', 3000).then(() => {
        sendResponse(extractProductData());
      });
      return true;
    }
    sendResponse(extractProductData());
  }

  // Allow popup to force a profile re-sync from this tab
  if (message.type === "SYNC_PROFILE") {
    try {
      const raw = localStorage.getItem("verdant_profile");
      if (raw) chrome.storage.local.set({ verdant_profile: raw });
      sendResponse({ ok: true, hasProfile: !!raw });
    } catch (e) {
      sendResponse({ ok: false, error: e.message });
    }
  }

  return true;
});

// ── Amazon SPA: re-sync profile when user navigates between products ─────────
if (isAmazonProductPage()) {
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      // Re-sync profile on navigation
      try {
        const raw = localStorage.getItem("verdant_profile");
        if (raw) chrome.storage.local.set({ verdant_profile: raw });
      } catch {}
    }
  }).observe(document.body, { childList: true, subtree: true });
}
