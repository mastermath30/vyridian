"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useApp } from "@/lib/context";
import type { Locale } from "@/types";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "fr", label: "FR" },
];

// Vyridian wordmark SVG — a subtle geometric leaf/V mark
function VyridianMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#00d47f" />
      <path
        d="M8 9.5L16 22.5L24 9.5"
        stroke="#000"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 9.5L16 16.5L20 9.5"
        stroke="#000"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme, profile, setProfile } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLocale = (pathname.split("/")[1] as Locale) || "en";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function switchLocale(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    try { localStorage.setItem("verdant_locale", locale); } catch {}
    if (profile) setProfile({ ...profile, language: locale });
    router.push(segments.join("/"));
  }

  const navLinks = [
    { href: `/${currentLocale}#features`, label: "Features" },
    { href: `/${currentLocale}#how-it-works`, label: "How it works" },
    { href: `/${currentLocale}/extension`, label: "Extension" },
    { href: `/${currentLocale}/learn`, label: "Learn" },
  ];

  const displayName = profile?.name?.split(" ")[0] || user?.username || null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2.5" : "py-4"
      )}
    >
      <div className="container mx-auto px-5 max-w-6xl">
        <div
          className={cn(
            "flex items-center justify-between gap-4 px-5 py-2.5 transition-all duration-300",
            "glass",
            scrolled
              ? "rounded-2xl shadow-xl"
              : "rounded-3xl"
          )}
          style={scrolled ? {
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,127,0.06), 0 0 80px rgba(0,212,127,0.04)",
          } : undefined}
        >
          {/* Logo */}
          <Link
            href={`/${currentLocale}`}
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="Vyridian home"
            style={{ textDecoration: "none" }}
          >
            <div style={{ filter: "drop-shadow(0 0 8px rgba(0,212,127,0.4))", transition: "filter 0.25s ease" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 14px rgba(0,212,127,0.6))")}
              onMouseLeave={e => (e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(0,212,127,0.4))")}
            >
              <VyridianMark size={28} />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.03em",
                color: "var(--color-text-primary)",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
            >
              Vyridian
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link-hover px-3.5 py-2 rounded-xl text-sm font-medium"
                style={{
                  color: "var(--color-text-secondary)",
                  transition: "color 0.18s ease, background 0.18s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--color-text-primary)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn btn-sm btn-ghost btn-icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{ padding: "0.4rem", width: "34px", height: "34px" }}
            >
              {theme === "dark"
                ? <Sun size={14} aria-hidden />
                : <Moon size={14} aria-hidden />
              }
            </button>

            {/* Locale switcher */}
            <div
              className="flex items-center gap-0.5 rounded-lg p-0.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {LOCALES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => switchLocale(value)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150"
                  style={{
                    background: currentLocale === value
                      ? "var(--color-accent)"
                      : "transparent",
                    color: currentLocale === value ? "#000" : "var(--color-text-muted)",
                  }}
                  aria-label={`Switch to ${value}`}
                  aria-pressed={currentLocale === value}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Separator */}
            <div style={{ width: "1px", height: "20px", background: "var(--color-border)" }} />

            {user ? (
              <>
                {displayName && (
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      maxWidth: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                  </span>
                )}
                <Link href={`/${currentLocale}/dashboard`} className="btn btn-sm btn-secondary">
                  Dashboard
                </Link>
                <button
                  onClick={async () => { await logout(); router.push(`/${currentLocale}`); }}
                  className="btn btn-sm btn-ghost"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href={`/${currentLocale}/login`} className="btn btn-sm btn-ghost">
                  Log in
                </Link>
                <Link href={`/${currentLocale}/signup`} className="btn btn-sm btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn btn-icon btn-ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden mt-2 rounded-2xl p-4 glass shadow-lg"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="h-px my-2" style={{ background: "var(--color-border)" }} />
              {user ? (
                <>
                  <Link
                    href={`/${currentLocale}/dashboard`}
                    className="btn btn-secondary w-full justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setMenuOpen(false);
                      router.push(`/${currentLocale}`);
                    }}
                    className="btn btn-ghost w-full justify-center"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${currentLocale}/login`}
                    className="btn btn-ghost w-full justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href={`/${currentLocale}/signup`}
                    className="btn btn-primary w-full justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
