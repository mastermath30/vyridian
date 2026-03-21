"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/layout/Navbar";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { user, loading: authLoading, refetch } = useAuth();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  // Redirect already-authenticated users straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, user, locale, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      await refetch();
      router.push(`/${locale}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center pt-16 px-6">
        <div className="w-full max-w-md py-16">
          <div className="flex items-center gap-2.5 mb-10">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#00d47f" />
              <path d="M8 9.5L16 22.5L24 9.5" stroke="#000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}>Vyridian</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href={`/${locale}/signup`} style={{ color: "var(--color-accent)" }} className="font-medium hover:underline">
              Sign up free
            </Link>
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--color-danger)" }}
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="input" placeholder="maya@example.com" aria-required="true" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="relative">
                <input id="login-password" type={showPass ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  className="input pr-11" placeholder="Your password" aria-required="true" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon btn"
                  style={{ background: "none", border: "none", color: "var(--color-text-muted)" }}
                  aria-label={showPass ? "Hide password" : "Show password"}>
                  {showPass ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
              {loading ? "Signing in…" : <><span>Sign in</span> <ArrowRight size={18} aria-hidden /></>}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
