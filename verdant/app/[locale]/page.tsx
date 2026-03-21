"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/layout/Navbar";
import { ArrowRight, CheckCircle, Sparkles, Chrome, ArrowDown } from "lucide-react";

/* ─── Dashboard Preview (code-rendered, Linear-style) ──────── */
function DashboardPreview() {
  return (
    <div className="dashboard-preview" style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Browser chrome */}
      <div
        style={{
          background: "#0c1018",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {["#f04444", "#f59e0b", "#00d47f"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.75 }} />
        ))}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "6px",
            height: "22px",
            marginLeft: "6px",
            display: "flex",
            alignItems: "center",
            paddingLeft: "10px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
            letterSpacing: "0.01em",
          }}
        >
          vyridian.app/dashboard
        </div>
      </div>

      {/* Dashboard body */}
      <div style={{ padding: "20px", background: "var(--color-bg)", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "10px", color: "var(--color-text-muted)", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Good morning</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}>Your financial overview</div>
          </div>
          <div
            style={{
              padding: "5px 12px",
              background: "linear-gradient(135deg, rgba(0,212,127,0.15), rgba(0,212,127,0.08))",
              border: "1px solid rgba(0,212,127,0.3)",
              borderRadius: "100px",
              fontSize: "10.5px",
              fontWeight: 600,
              color: "#00d47f",
              letterSpacing: "-0.01em",
            }}
          >
            💡 On track to save $2,400 this year
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            { label: "Monthly Income", value: "$5,400", color: "var(--color-text-primary)", sub: null },
            { label: "Total Expenses", value: "$3,180", color: "#f04444", sub: "↓ 4% vs last month" },
            { label: "Monthly Surplus", value: "$2,220", color: "#00d47f", sub: null },
            { label: "Savings Rate", value: "41.1%", color: "#4f8ef7", sub: "Target: 35%" },
          ].map(({ label, value, color, sub }) => (
            <div
              key={label}
              style={{
                background: "linear-gradient(145deg, var(--color-surface), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "13px 15px",
              }}
            >
              <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "7px" }}>{label}</div>
              <div style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.035em", color, lineHeight: 1.1 }}>{value}</div>
              {sub && <div style={{ fontSize: "9px", color: color === "#f04444" ? "#f04444" : "var(--color-text-muted)", marginTop: "4px", fontWeight: 600 }}>{sub}</div>}
            </div>
          ))}
        </div>

        {/* Charts + Goals row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 210px", gap: "10px" }}>
          {/* Simulated chart */}
          <div style={{ background: "linear-gradient(145deg, var(--color-surface), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Spending vs National Average</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", color: "var(--color-text-muted)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "2px", background: "#4f8ef7" }} />You
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", color: "var(--color-text-muted)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "2px", background: "rgba(255,255,255,0.15)" }} />Avg
                </div>
              </div>
            </div>
            {[
              { label: "Rent", you: 80, avg: 65 },
              { label: "Groceries", you: 45, avg: 55 },
              { label: "Transport", you: 32, avg: 38 },
              { label: "Dining", you: 62, avg: 40 },
            ].map(({ label, you, avg }) => (
              <div key={label} style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "9px", color: "var(--color-text-muted)", marginBottom: "4px", fontWeight: 500 }}>{label}</div>
                <div style={{ display: "flex", gap: "3px" }}>
                  <div style={{ position: "relative", height: "5px", flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${you}%`, background: "linear-gradient(90deg, #4f8ef7, #6fa8ff)", borderRadius: "100px" }} />
                  </div>
                </div>
                <div style={{ position: "relative", height: "5px", flex: 1, marginTop: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${avg}%`, background: "rgba(255,255,255,0.18)", borderRadius: "100px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Goals + AI */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { name: "Emergency Fund", pct: 64, color: "#00d47f" },
              { name: "Down Payment", pct: 28, color: "#4f8ef7" },
            ].map(({ name, pct, color }) => (
              <div key={name} style={{ background: "linear-gradient(145deg, var(--color-surface), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>{name}</div>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{pct}%</div>
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: "100px" }} />
                </div>
              </div>
            ))}
            <div style={{ background: "linear-gradient(145deg, rgba(0,212,127,0.06), rgba(0,212,127,0.02))", border: "1px solid rgba(0,212,127,0.2)", borderRadius: "14px", padding: "12px 14px", flex: 1 }}>
              <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00d47f", marginBottom: "8px" }}>AI Advisor</div>
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "8px", padding: "7px 9px", fontSize: "9.5px", color: "var(--color-text-secondary)", lineHeight: "1.55", borderLeft: "2px solid rgba(0,212,127,0.4)" }}>
                At your current rate, you&apos;ll reach Emergency Fund in ~5 months. 🎯
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Extension Popup Preview ─────────────────────────────── */
function ExtensionPopup() {
  return (
    <div
      className="animate-float"
      style={{
        background: "#070b11",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "22px",
        width: "300px",
        boxShadow: "0 0 0 1px rgba(0,212,127,0.12), 0 32px 80px rgba(0,0,0,0.9), 0 0 100px rgba(0,212,127,0.10)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{ background: "#0d1520", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#f0f4f8", fontSize: "13.5px", letterSpacing: "-0.025em" }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#00d47f" />
            <path d="M8 9.5L16 22.5L24 9.5" stroke="#000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9.5L16 16.5L20 9.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
          </svg>
          Vyridian
        </div>
        <span style={{ background: "rgba(0,212,127,0.14)", color: "#00d47f", border: "1px solid rgba(0,212,127,0.28)", borderRadius: "100px", padding: "2px 9px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
      </div>

      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Product card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "11px 13px" }}>
          <div style={{ fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3a4a5e", marginBottom: "4px" }}>Amazon · Electronics</div>
          <div style={{ fontWeight: 700, fontSize: "12.5px", color: "#f0f4f8", marginBottom: "1px", letterSpacing: "-0.01em" }}>Sony WH-1000XM5</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#00d47f", letterSpacing: "-0.04em", marginTop: "4px" }}>$279.99</div>
        </div>

        {/* Impact 2-col */}
        <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.04))", border: "1px solid rgba(245,158,11,0.22)", borderRadius: "14px", padding: "11px 13px" }}>
          <div style={{ fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3a4a5e", marginBottom: "8px" }}>Financial Impact</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.04em", color: "#f59e0b", lineHeight: 1 }}>11</div>
              <div style={{ fontSize: "9px", color: "#6a7a8e", marginTop: "3px", lineHeight: 1.35 }}>days to your goal delayed</div>
            </div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.04em", color: "#f0f4f8", lineHeight: 1 }}>12.6%</div>
              <div style={{ fontSize: "9px", color: "#6a7a8e", marginTop: "3px", lineHeight: 1.35 }}>of your monthly surplus</div>
            </div>
          </div>
        </div>

        {/* Sustainability */}
        <div style={{ background: "linear-gradient(135deg, rgba(0,212,127,0.07), rgba(0,212,127,0.03))", border: "1px solid rgba(0,212,127,0.2)", borderRadius: "14px", padding: "11px 13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
            <div style={{ fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#00d47f" }}>Sustainability</div>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.28)", borderRadius: "100px", padding: "2px 8px" }}>Medium</span>
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "55%", background: "linear-gradient(90deg, #f59e0b, #fbbf24)", borderRadius: "100px" }} />
          </div>
        </div>

        {/* Alternative */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "11px 13px" }}>
          <div style={{ fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3a4a5e", marginBottom: "5px" }}>Better Alternative</div>
          <div style={{ fontWeight: 700, fontSize: "12px", color: "#f0f4f8", letterSpacing: "-0.01em" }}>Anker Soundcore Q45</div>
          <div style={{ fontSize: "10px", color: "#00d47f", fontWeight: 700, marginTop: "2px" }}>~$49–65 · Save ~$215</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature visuals ─────────────────────────────────────── */
function GoalVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      {[
        { name: "Emergency Fund", pct: 64, color: "#00d47f", delta: "+3 days" },
        { name: "Vacation Fund", pct: 38, color: "#4f8ef7", delta: "+1 day" },
      ].map(({ name, pct, color, delta }) => (
        <div key={name}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", fontWeight: 600, marginBottom: "4px" }}>
            <span style={{ color: "var(--color-text-secondary)" }}>{name}</span>
            <span style={{ color }}>{delta}</span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.07)", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)`, borderRadius: "100px" }} />
          </div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px", background: "rgba(0,212,127,0.08)", borderRadius: "8px", padding: "5px 9px" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d47f" }} />
        <span style={{ fontSize: "9.5px", color: "#00d47f", fontWeight: 600 }}>Spending $50 saves you 3 goal days</span>
      </div>
    </div>
  );
}

function AIVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: "10px 10px 2px 10px", padding: "7px 10px", fontSize: "9.5px", color: "var(--color-text-secondary)", alignSelf: "flex-end", maxWidth: "90%", lineHeight: 1.45 }}>
        Should I buy the $280 Sony headset?
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "2px 10px 10px 10px", padding: "7px 10px", fontSize: "9.5px", color: "var(--color-text-secondary)", maxWidth: "90%", lineHeight: 1.45 }}>
        It delays your <span style={{ color: "#00d47f", fontWeight: 700 }}>Emergency Fund by 11 days</span>. The Anker Q45 at $55 gives you 90% of the experience.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4f8ef7", animation: "pulse-glow 2s infinite" }} />
        <span style={{ fontSize: "8.5px", color: "#4f8ef7", fontWeight: 600 }}>Powered by Claude AI · knows your profile</span>
      </div>
    </div>
  );
}

function SustainabilityVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {[
        { label: "High", sub: "Recycled materials, repair program", color: "#00d47f", score: 82, icon: "🌿" },
        { label: "Medium", sub: "Partial compliance, avg lifespan", color: "#f59e0b", score: 55, icon: "⚖️" },
        { label: "Low", sub: "Short lifespan, hard to recycle", color: "#f04444", score: 24, icon: "⚠️" },
      ].map(({ label, sub, color, score, icon }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px" }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "3px" }}>
              <span style={{ fontWeight: 700, color }}>{label}</span>
              <span style={{ color: "var(--color-text-muted)" }}>{score}/100</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: "100px" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartsVisual() {
  const bars = [40, 65, 52, 78, 61, 88];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "44px", marginBottom: "6px" }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: i === bars.length - 1
                ? "linear-gradient(180deg, #00d47f, #00d47f80)"
                : `rgba(79,142,247,${0.2 + i * 0.05})`,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.6s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", marginTop: "4px" }}>
        {[
          { label: "Income", value: "$5.4k", color: "#00d47f" },
          { label: "Expenses", value: "$3.2k", color: "#f04444" },
          { label: "Saved", value: "$2.2k", color: "#4f8ef7" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
            <div style={{ fontSize: "8.5px", color: "var(--color-text-muted)", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtensionBadgeVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {["Amazon", "Best Buy", "Walmart", "Target", "ASOS", "Etsy"].map((s, i) => (
          <span key={s} style={{ fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", background: `rgba(240,68,68,${0.06 + i * 0.02})`, border: "1px solid rgba(240,68,68,0.2)", color: "#f04444", letterSpacing: "0.02em" }}>
            {s}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 8px", background: "rgba(240,68,68,0.06)", borderRadius: "8px", marginTop: "2px" }}>
        <Chrome size={10} color="#f04444" />
        <span style={{ fontSize: "9px", fontWeight: 600, color: "#f04444" }}>Activates automatically on product pages</span>
      </div>
    </div>
  );
}

function LanguageVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {[
        { flag: "🇺🇸", lang: "English", sample: "Your savings goal: $12,000" },
        { flag: "🇪🇸", lang: "Español", sample: "Tu objetivo de ahorro: $12,000" },
        { flag: "🇫🇷", lang: "Français", sample: "Votre objectif d'épargne: $12,000" },
      ].map(({ flag, lang, sample }) => (
        <div key={lang} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px" }}>{flag}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#06b6d4", marginBottom: "1px" }}>{lang}</div>
            <div style={{ fontSize: "9px", color: "var(--color-text-muted)" }}>{sample}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Landing Page ─────────────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuth();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      color: "#00d47f",
      bg: "rgba(0,212,127,0.06)",
      border: "rgba(0,212,127,0.16)",
      title: "Goal-linked spending",
      desc: "Every purchase shows exactly how many days it delays your savings goals — in real time.",
      visual: <GoalVisual />,
    },
    {
      color: "#4f8ef7",
      bg: "rgba(79,142,247,0.06)",
      border: "rgba(79,142,247,0.16)",
      title: "Claude AI advisor",
      desc: "Ask anything about your money in plain language — Claude knows your actual financial profile.",
      visual: <AIVisual />,
    },
    {
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.06)",
      border: "rgba(139,92,246,0.16)",
      title: "Sustainability scoring",
      desc: "Every product rated High, Medium, or Low — backed by real EPA life-cycle data.",
      visual: <SustainabilityVisual />,
    },
    {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.16)",
      title: "Visual money insights",
      desc: "Spending breakdowns, goal progress, income trends, and 12-month projections in one view.",
      visual: <ChartsVisual />,
    },
    {
      color: "#f04444",
      bg: "rgba(240,68,68,0.06)",
      border: "rgba(240,68,68,0.16)",
      title: "Browser extension",
      desc: "Analyze any product on 6+ shopping sites with AI-powered insights before you buy.",
      visual: <ExtensionBadgeVisual />,
    },
    {
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.06)",
      border: "rgba(6,182,212,0.16)",
      title: "3 languages",
      desc: "English, Spanish, and French. Your entire dashboard and AI assistant adapt instantly.",
      visual: <LanguageVisual />,
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Set up your profile",
      desc: "Enter your income, monthly expenses, and goals. Takes under 3 minutes.",
      detail: "No credit card needed",
    },
    {
      num: "02",
      title: "Get personalized insights",
      desc: "Your dashboard shows where your money goes and how each category affects your goals.",
      detail: "Powered by real BLS data",
    },
    {
      num: "03",
      title: "Shop with intelligence",
      desc: "Browse with the extension active. See the full financial impact before you check out.",
      detail: "Works on 6+ shopping sites",
    },
  ];

  return (
    <>
      <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        <Navbar />

        {/* ── Hero ──────────────────────────────────────────── */}
        <section
          className="relative flex flex-col items-center text-center overflow-hidden"
          style={{ minHeight: "100vh", paddingTop: "7rem", paddingBottom: "3rem" }}
          aria-labelledby="hero-heading"
        >
          <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

          {/* Aurora orbs */}
          <div className="aurora-orb animate-aurora-shift" style={{ width: "800px", height: "450px", background: "radial-gradient(ellipse, rgba(0,212,127,0.08) 0%, transparent 70%)", top: "-80px", left: "50%", transform: "translateX(-50%)" }} aria-hidden="true" />
          <div className="aurora-orb" style={{ width: "550px", height: "550px", background: "radial-gradient(ellipse, rgba(79,142,247,0.06) 0%, transparent 70%)", top: "15%", right: "-120px", animation: "aurora-shift 15s ease-in-out infinite", animationDelay: "5s" }} aria-hidden="true" />
          <div className="aurora-orb" style={{ width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)", top: "10%", left: "-100px", animation: "aurora-shift 18s ease-in-out infinite", animationDelay: "10s" }} aria-hidden="true" />

          <div className="relative z-10 container mx-auto px-6 max-w-5xl">
            {/* Badge */}
            <div className="animate-fade-up flex justify-center mb-8">
              <span className="stat-pill">
                <Sparkles size={12} style={{ color: "var(--color-accent)" }} aria-hidden />
                Powered by Claude AI · Free to use
              </span>
            </div>

            <h1
              id="hero-heading"
              className="display-xl animate-fade-up delay-100"
              style={{ color: "var(--color-text-primary)", maxWidth: "820px", margin: "0 auto 1.5rem" }}
            >
              Know the impact{" "}
              <span className="text-gradient">before you buy.</span>
            </h1>

            <p
              className="animate-fade-up delay-200"
              style={{ fontSize: "1.1875rem", color: "var(--color-text-secondary)", lineHeight: "1.75", maxWidth: "580px", margin: "0 auto 2.5rem" }}
            >
              Vyridian connects your spending to your goals — and puts an AI financial advisor at every purchase decision, in real time.
            </p>

            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              {user ? (
                <Link href={`/${locale}/dashboard`} className="btn btn-lg btn-primary">
                  Go to Dashboard <ArrowRight size={18} aria-hidden />
                </Link>
              ) : (
                <>
                  <Link href={`/${locale}/signup`} className="btn btn-lg btn-primary">
                    Start for free <ArrowRight size={18} aria-hidden />
                  </Link>
                  <Link href={`/${locale}/login`} className="btn btn-lg btn-secondary">
                    Log in
                  </Link>
                </>
              )}
            </div>

            <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-2 mb-16">
              {["No credit card", "3-min setup", "AI-powered", "3 languages", "Chrome extension"].map((tag) => (
                <span key={tag} className="stat-pill">
                  <CheckCircle size={10} style={{ color: "var(--color-accent)" }} aria-hidden />
                  {tag}
                </span>
              ))}
            </div>

            {/* Dashboard mockup */}
            <div className="animate-fade-up delay-500 relative">
              <div
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "100px",
                  background: "linear-gradient(to bottom, transparent, var(--color-bg))",
                  zIndex: 2, pointerEvents: "none",
                }}
                aria-hidden="true"
              />
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ── Extension Intelligence Spotlight ──────────────── */}
        <section
          style={{
            padding: "5rem 0",
            background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-alt) 100%)",
          }}
        >
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Floating spotlight card */}
            <div
              className="reveal"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,127,0.06) 0%, rgba(4,6,10,0) 60%), var(--color-surface)",
                border: "1px solid rgba(0,212,127,0.18)",
                borderRadius: "28px",
                padding: "0",
                overflow: "hidden",
                boxShadow: "0 0 0 1px rgba(0,212,127,0.08), 0 32px 80px rgba(0,0,0,0.5), 0 0 120px rgba(0,212,127,0.06)",
                position: "relative",
              }}
            >
              {/* Subtle top glow line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,212,127,0.5), transparent)" }} aria-hidden="true" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "0" }}>
                {/* Left content */}
                <div style={{ padding: "3rem 3rem 3rem 3.5rem" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(0,212,127,0.1)", border: "1px solid rgba(0,212,127,0.25)", borderRadius: "100px", padding: "4px 12px", marginBottom: "1.75rem" }}>
                    <Chrome size={12} color="#00d47f" />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#00d47f", letterSpacing: "0.06em", textTransform: "uppercase" }}>Chrome Extension</span>
                  </div>

                  <h2
                    style={{
                      fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.035em",
                      lineHeight: 1.12,
                      color: "var(--color-text-primary)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Smart financial decisions
                    <br />
                    <span style={{ background: "linear-gradient(135deg, #00d47f, #4f8ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      at the moment of purchase.
                    </span>
                  </h2>

                  <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", lineHeight: "1.75", marginBottom: "2rem", maxWidth: "420px" }}>
                    Before you click &ldquo;Buy,&rdquo; Vyridian shows you exactly what it costs — in goal days, percentage of your surplus, and a greener alternative.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.25rem" }}>
                    {[
                      { icon: "🎯", title: "Goal impact score", desc: "Days delayed or gained — tied to your actual savings goals" },
                      { icon: "🌱", title: "Sustainability rating", desc: "High / Medium / Low based on EPA life-cycle data" },
                      { icon: "💡", title: "AI-powered alternative", desc: "A better product at a better price, every time" },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", lineHeight: "24px", flexShrink: 0 }}>{icon}</span>
                        <div>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>{title} — </span>
                          <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Link href={`/${locale}/extension`} className="btn btn-primary">
                      Install Extension <ArrowRight size={15} aria-hidden />
                    </Link>
                    <Link href={`/${locale}/signup`} className="btn btn-ghost" style={{ borderColor: "rgba(0,212,127,0.3)", color: "var(--color-accent)" }}>
                      Create account
                    </Link>
                  </div>
                </div>

                {/* Right: popup mockup */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(0,212,127,0.05), rgba(79,142,247,0.03))",
                    borderLeft: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2.5rem",
                  }}
                >
                  <ExtensionPopup />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats row ─────────────────────────────────────── */}
        <div className="divider" aria-hidden="true" />
        <section style={{ padding: "3.5rem 0" }}>
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-center reveal">
              {[
                { value: "3 min", label: "Average setup time" },
                { value: "AI", label: "Powered by Claude" },
                { value: "3", label: "Languages supported" },
                { value: "6+", label: "Shopping sites supported" },
              ].map(({ value, label }) => (
                <div key={label} className="stats-card">
                  <div className="stat-value mb-1.5" style={{ fontSize: "2rem" }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="divider" aria-hidden="true" />

        {/* ── Features ─────────────────────────────────────── */}
        <section id="features" className="section" aria-labelledby="features-heading">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16 reveal">
              <p className="section-label-tag">
                <Sparkles size={11} aria-hidden /> Features
              </p>
              <h2 className="display-md mb-5" style={{ color: "var(--color-text-primary)" }} id="features-heading">
                Everything you need to{" "}
                <span className="text-gradient-green">take control</span>
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)", maxWidth: "460px", margin: "0 auto" }}>
                Built for people who want to build real wealth — not just track where it went.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ color, bg, border, title, desc, visual }, i) => (
                <div
                  key={title}
                  className={`feature-card reveal reveal-delay-${Math.min(i + 1, 5)}`}
                >
                  {/* Visual preview panel */}
                  <div
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: "14px",
                      padding: "14px",
                      marginBottom: "1.25rem",
                    }}
                    aria-hidden="true"
                  >
                    {visual}
                  </div>

                  {/* Color dot + title */}
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "0.5rem" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 8px ${color}80` }} aria-hidden="true" />
                    <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.015em", color: "var(--color-text-primary)" }}>
                      {title}
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.875rem", lineHeight: "1.65", color: "var(--color-text-secondary)" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section
          id="how-it-works"
          style={{
            padding: "7rem 0",
            background: "linear-gradient(180deg, var(--color-bg-alt) 0%, var(--color-bg) 100%)",
          }}
          aria-labelledby="how-heading"
        >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16 reveal">
              <p className="section-label-tag">How it works</p>
              <h2 className="display-md mb-5" style={{ color: "var(--color-text-primary)" }} id="how-heading">
                From setup to smarter spending
                <br />
                <span className="text-gradient-green">in under 5 minutes</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {steps.map(({ num, title, desc, detail }, i) => (
                <div
                  key={num}
                  className={`reveal reveal-delay-${i + 1}`}
                  style={{
                    background: "linear-gradient(145deg, var(--color-surface), rgba(255,255,255,0.015))",
                    border: "1px solid var(--color-border)",
                    borderRadius: "22px",
                    padding: "2rem",
                    position: "relative",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                  }}
                >
                  {i < steps.length - 1 && (
                    <div
                      className="hidden sm:flex absolute items-center"
                      style={{ top: "2rem", right: "-1.75rem", zIndex: 1 }}
                      aria-hidden="true"
                    >
                      <ArrowRight size={14} color="var(--color-text-muted)" opacity={0.4} />
                    </div>
                  )}
                  <div className="step-number mb-5" style={{ display: "inline-flex" }}>{num}</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.625rem" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", lineHeight: "1.65", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                    {desc}
                  </p>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent)", background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-dim)", borderRadius: "100px", padding: "3px 10px", display: "inline-block" }}>
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dashboard + Extension split showcase ─────────── */}
        <section
          id="extension"
          style={{ padding: "7rem 0", background: "var(--color-bg)" }}
          aria-labelledby="ext-heading"
        >
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="reveal">
                <p className="section-label-tag">
                  <Chrome size={12} aria-hidden /> Real-time purchase intelligence
                </p>
                <h2 className="display-md mb-6" style={{ color: "var(--color-text-primary)" }} id="ext-heading">
                  The information you need,
                  <br />
                  <span className="text-gradient-green">right when you need it</span>
                </h2>
                <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)", lineHeight: "1.8", marginBottom: "2.5rem" }}>
                  The Vyridian extension connects to your financial profile and analyzes any product — showing its impact on your goals, a sustainability rating, and a smarter alternative.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                  {[
                    { label: "Goal impact", desc: "Days delayed or gained — tied to your actual savings goals" },
                    { label: "Eco ratings", desc: "Every product rated using real EPA life-cycle assessment data" },
                    { label: "AI alternatives", desc: "A better product suggestion with price and savings comparison" },
                    { label: "Full report", desc: "Detailed analysis with charts, projections, and eco insights" },
                  ].map(({ label, desc }) => (
                    <div key={label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0, marginTop: "9px", boxShadow: "0 0 8px rgba(0,212,127,0.5)" }} aria-hidden="true" />
                      <div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>{label} — </span>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/${locale}/extension`} className="btn btn-primary">
                    View Extension <ArrowRight size={16} aria-hidden />
                  </Link>
                  <Link href={`/${locale}/signup`} className="btn btn-secondary">
                    Create free account
                  </Link>
                </div>
              </div>

              <div className="reveal flex justify-center lg:justify-end">
                <ExtensionPopup />
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section
          className="text-center"
          style={{
            padding: "7rem 0",
            background: "linear-gradient(180deg, var(--color-bg-alt) 0%, var(--color-bg) 100%)",
            borderTop: "1px solid var(--color-border)",
            position: "relative",
            overflow: "hidden",
          }}
          aria-labelledby="cta-heading"
        >
          {/* Background glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(0,212,127,0.08) 0%, transparent 70%)", pointerEvents: "none" }} aria-hidden="true" />

          <div className="container mx-auto px-6 max-w-3xl reveal" style={{ position: "relative", zIndex: 1 }}>
            <p className="section-label-tag justify-center">
              <Sparkles size={11} aria-hidden /> Get started today
            </p>
            <h2 className="display-md mb-6" style={{ color: "var(--color-text-primary)" }} id="cta-heading">
              Start building wealth{" "}
              <span className="text-gradient">with clarity</span>
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)", marginBottom: "2.5rem", lineHeight: "1.75" }}>
              Free to use. No credit card required. 3 minutes to set up. Available in English, Spanish, and French.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/${locale}/signup`} className="btn btn-lg btn-primary">
                Start for free <ArrowRight size={18} aria-hidden />
              </Link>
              <Link href={`/${locale}/login`} className="btn btn-lg btn-secondary">
                Log in
              </Link>
            </div>

            {/* Scroll CTA for the hero — shown below the fold */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
              <Link
                href={`/${locale}/extension`}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 500, textDecoration: "none" }}
                className="hover:opacity-80 transition-opacity"
              >
                <ArrowDown size={14} aria-hidden />
                Learn about the extension
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid var(--color-border)", padding: "2.5rem 0" }}>
          <div className="container mx-auto px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="9" fill="#00d47f" />
                <path d="M8 9.5L16 22.5L24 9.5" stroke="#000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.025em", color: "var(--color-text-primary)" }}>Vyridian</span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textAlign: "center" }}>
              Personal finance &amp; sustainable consumer choices — powered by Claude AI
            </p>
            <div className="flex items-center gap-5" style={{ fontSize: "0.8125rem" }}>
              <Link href={`/${locale}/extension`} style={{ color: "var(--color-text-muted)" }} className="hover:opacity-80 transition-opacity">Extension</Link>
              <Link href={`/${locale}/login`} style={{ color: "var(--color-text-muted)" }} className="hover:opacity-80 transition-opacity">Log in</Link>
              <Link href={`/${locale}/signup`} style={{ color: "var(--color-accent)", fontWeight: 600 }} className="hover:opacity-80 transition-opacity">Sign up free</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
