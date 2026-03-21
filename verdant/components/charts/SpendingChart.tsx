"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseCategory } from "@/types";

interface SpendingChartProps {
  expenses: ExpenseCategory[];
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "#f4a261",
  "#e76f51",
];

export default function SpendingChart({ expenses }: SpendingChartProps) {
  const data = expenses.map((e) => ({ name: e.name, value: e.monthlyEstimate }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={2}
            aria-label="Spending breakdown pie chart"
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                stroke="var(--color-bg)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "0.875rem",
              color: "var(--color-text-primary)",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Accessible data table fallback */}
      <details className="mt-2">
        <summary
          className="text-xs cursor-pointer"
          style={{ color: "var(--color-text-muted)" }}
        >
          View as table
        </summary>
        <table className="w-full mt-2 text-sm" aria-label="Spending breakdown data table">
          <thead>
            <tr style={{ color: "var(--color-text-muted)" }}>
              <th className="text-left py-1 font-medium">Category</th>
              <th className="text-right py-1 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                <td className="py-1.5" style={{ color: "var(--color-text-primary)" }}>{row.name}</td>
                <td className="py-1.5 text-right font-mono" style={{ color: "var(--color-text-primary)" }}>
                  {formatCurrency(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
