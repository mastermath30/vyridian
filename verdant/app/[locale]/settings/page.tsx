"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/context";
import { clearAll } from "@/lib/store";
import Navbar from "@/components/layout/Navbar";
import type { Theme } from "@/types";
import { Sun, Moon, Contrast, Trash2 } from "lucide-react";

const THEMES: { value: Theme; label: string; Icon: React.ElementType; desc: string }[] = [
  { value: "light", label: "Light", Icon: Sun, desc: "Clean and minimal, WCAG AA" },
  { value: "dark", label: "Dark", Icon: Moon, desc: "Easy on eyes in low light, WCAG AA" },
  { value: "high-contrast", label: "High Contrast", Icon: Contrast, desc: "Maximum readability, WCAG AAA" },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { profile, isOnboarded, theme, setTheme } = useApp();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    if (!isOnboarded) router.push(`/${locale}`);
  }, [isOnboarded, locale, router]);

  if (!profile) return null;

  function handleClear() {
    if (window.confirm(t("clearConfirm"))) {
      clearAll();
      window.location.href = `/${locale}`;
    }
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-7" style={{ color: "var(--color-text-primary)" }}>
          {t("title")}
        </h1>

        {/* Theme */}
        <section className="card p-5 mb-5" aria-labelledby="theme-heading">
          <h2
            id="theme-heading"
            className="font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            {t("theme")}
          </h2>
          <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="theme-heading">
            {THEMES.map(({ value, label, Icon, desc }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                style={{
                  background: theme === value ? "var(--color-accent-subtle)" : "var(--color-bg)",
                  border: `1.5px solid ${theme === value ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
                role="radio"
                aria-checked={theme === value}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: theme === value ? "var(--color-accent)" : "var(--color-border)",
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: theme === value ? "#fff" : "var(--color-text-muted)" }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                    {label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {desc}
                  </p>
                </div>
                {theme === value && (
                  <div
                    className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-accent)" }}
                    aria-hidden="true"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Profile summary */}
        <section className="card p-5 mb-5" aria-labelledby="profile-heading">
          <h2
            id="profile-heading"
            className="font-semibold mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Profile
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            {[
              { label: "Name", value: profile.name },
              { label: "Financial literacy", value: profile.literacyLevel },
              { label: "Sustainability priority", value: profile.sustainabilityPriority },
              { label: "Monthly income", value: `$${profile.income.monthlyNet.toLocaleString()}` },
              { label: "Income type", value: profile.income.type },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <dt style={{ color: "var(--color-text-secondary)" }}>{label}</dt>
                <dd className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <button
            onClick={() => router.push(`/${locale}/onboarding`)}
            className="btn-ghost text-sm w-full mt-4"
          >
            {t("profile")}
          </button>
        </section>

        {/* Danger zone */}
        <section
          className="card p-5"
          style={{ borderColor: "var(--color-danger)", borderWidth: "1px" }}
          aria-labelledby="danger-heading"
        >
          <h2
            id="danger-heading"
            className="font-semibold mb-3"
            style={{ color: "var(--color-danger)" }}
          >
            Danger Zone
          </h2>
          <button
            onClick={handleClear}
            className="btn-ghost text-sm"
            style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
          >
            <Trash2 size={14} aria-hidden="true" />
            {t("clearData")}
          </button>
        </section>
      </main>
    </div>
  );
}
