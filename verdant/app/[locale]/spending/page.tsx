"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import SpendingChart from "@/components/charts/SpendingChart";

export default function SpendingPage() {
  const t = useTranslations("spending");
  const { profile, isOnboarded } = useApp();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  useEffect(() => {
    if (!isOnboarded) router.push(`/${locale}`);
  }, [isOnboarded, locale, router]);

  if (!profile) return null;

  const total = profile.expenses.reduce((s, e) => s + e.monthlyEstimate, 0);
  const sorted = [...profile.expenses].sort((a, b) => b.monthlyEstimate - a.monthlyEstimate);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6" style={{ paddingTop: "5.5rem", paddingBottom: "3rem" }}>
        <div className="mb-8">
          <p className="text-xs font-bold mb-1.5" style={{ color: "var(--color-accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Overview</p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}>
            {t("title")}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t("subtitle")}
          </p>
        </div>

        {profile.expenses.length === 0 ? (
          <div className="card p-10 text-center" style={{ color: "var(--color-text-muted)" }}>
            {t("noData")}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chart */}
            <section className="card p-5" aria-labelledby="chart-heading">
              <h2 id="chart-heading" className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Distribution
              </h2>
              <SpendingChart expenses={profile.expenses} />
            </section>

            {/* Table */}
            <section className="card p-5" aria-labelledby="table-heading">
              <h2 id="table-heading" className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                {t("title")}
              </h2>
              <table className="w-full text-sm" aria-label="Monthly expenses by category">
                <thead>
                  <tr style={{ color: "var(--color-text-muted)" }}>
                    <th className="text-left py-2 font-medium">{t("category")}</th>
                    <th className="text-right py-2 font-medium">{t("amount")}</th>
                    <th className="text-right py-2 font-medium">{t("percent")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((e) => (
                    <tr
                      key={e.id}
                      style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                      <td className="py-2.5" style={{ color: "var(--color-text-primary)" }}>
                        <div className="flex items-center gap-2">
                          {e.name}
                          {e.isFixed && (
                            <span className="badge badge-green text-xs py-0.5">
                              {t("fixed")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="py-2.5 text-right font-mono"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {formatCurrency(e.monthlyEstimate)}
                      </td>
                      <td
                        className="py-2.5 text-right"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {formatPercent((e.monthlyEstimate / profile.income.monthlyNet) * 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--color-border-strong)" }}>
                    <td className="py-2.5 font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {t("total")}
                    </td>
                    <td
                      className="py-2.5 text-right font-mono font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {formatCurrency(total)}
                    </td>
                    <td
                      className="py-2.5 text-right font-semibold"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {formatPercent((total / profile.income.monthlyNet) * 100)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
