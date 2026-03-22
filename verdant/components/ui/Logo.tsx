"use client";

/** Shared Vyridian brand mark — geometric V/leaf on green square */
export function VyridianMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#00d47f" />
      <path
        d="M8 9.5L16 22.5L24 9.5"
        stroke="#000"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5L16 16.5L20 9.5"
        stroke="#000"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}

/** Full wordmark: mark + "Vyridian" text */
export function VyridianWordmark({
  size = 28,
  glow = true,
}: {
  size?: number;
  glow?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
      <div
        style={{
          filter: glow ? "drop-shadow(0 0 8px rgba(0,212,127,0.4))" : "none",
          transition: "filter 0.25s ease",
          flexShrink: 0,
        }}
      >
        <VyridianMark size={size} />
      </div>
      <span
        style={{
          fontWeight: 800,
          fontSize: Math.round(size * 0.57) + "px",
          letterSpacing: "-0.03em",
          color: "var(--color-text-primary)",
        }}
      >
        Vyridian
      </span>
    </div>
  );
}
