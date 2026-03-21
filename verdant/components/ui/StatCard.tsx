import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function StatCard({ label, value, sub, trend, className }: StatCardProps) {
  const subColor =
    trend === "up" ? "var(--color-success)" :
    trend === "down" ? "var(--color-danger)" :
    "var(--color-text-muted)";

  return (
    <div className={cn("card p-5 transition-all duration-200", className)}>
      <p className="stat-label mb-2">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && (
        <p className="text-xs mt-2 font-medium" style={{ color: subColor }}>{sub}</p>
      )}
    </div>
  );
}
