import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  icon?: LucideIcon;
  iconColor?: string;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  trend,
  className,
  icon: Icon,
  iconColor,
  accentColor,
}: StatCardProps) {
  const subColor =
    trend === "up" ? "var(--color-success)" :
    trend === "down" ? "var(--color-danger)" :
    "var(--color-text-muted)";

  const accent = accentColor ?? (
    trend === "up" ? "var(--color-accent)" :
    trend === "down" ? "var(--color-danger)" :
    "var(--color-blue)"
  );

  const resolvedIconColor = iconColor ?? accent;

  return (
    <div
      className={cn("dash-stat-card", className)}
      style={{ "--dash-stat-accent": accent } as React.CSSProperties}
    >
      {Icon && (
        <div
          className="flex items-center justify-center mb-3 w-8 h-8 rounded-lg"
          style={{
            background: `color-mix(in srgb, ${resolvedIconColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${resolvedIconColor} 20%, transparent)`,
          }}
          aria-hidden
        >
          <Icon size={15} style={{ color: resolvedIconColor }} />
        </div>
      )}
      <p className="stat-label mb-1.5">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && (
        <p className="text-xs mt-2 font-medium" style={{ color: subColor }}>{sub}</p>
      )}
    </div>
  );
}
