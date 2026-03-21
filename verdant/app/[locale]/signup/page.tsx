"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import Navbar from "@/components/layout/Navbar";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const { user, loading: authLoading, refetch } = useAuth();
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  // Redirect already-authenticated users straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, user, locale, router]);

  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: "" }));
    setError("");
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Required";
    else if (form.password.length < 8) errs.password = "Must be at least 8 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Required";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username || undefined,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      await refetch();
      router.push(`/${locale}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const perks = [
    "Free forever — no credit card needed",
    "AI-powered financial insights",
    "Browser extension included",
    "English, Spanish, and French",
  ];

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="flex min-h-screen pt-16">
        {/* Left panel */}
        <div
          className="hidden lg:flex flex-col justify-center px-16 py-20 flex-1"
          style={{ background: "var(--color-bg-alt)", borderRight: "1px solid var(--color-border)" }}
        >
          <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-14">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#00d47f" />
              <path d="M8 9.5L16 22.5L24 9.5" stroke="#000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}>Vyridian</span>
          </Link>
          <h2 className="display-md mb-4" style={{ color: "var(--color-text-primary)" }}>
            Take control of your finances
          </h2>
          <p className="text-base mb-10" style={{ color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
            Join Vyridian and get a clear picture of your money, your goals, and your impact.
          </p>
          <ul className="flex flex-col gap-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <CheckCircle size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} aria-hidden />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-col justify-center items-center flex-1 px-6 py-16">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
              Create your account
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
              Already have one?{" "}
              <Link href={`/${locale}/login`} style={{ color: "var(--color-accent)" }} className="font-medium hover:underline">
                Log in
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
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="first-name">First name</label>
                  <input id="first-name" type="text" value={form.firstName} onChange={e => update("firstName", e.target.value)}
                    className="input" placeholder="Maya" aria-required="true"
                    aria-describedby={fieldErrors.firstName ? "fn-err" : undefined} />
                  {fieldErrors.firstName && <p id="fn-err" className="form-error" role="alert">{fieldErrors.firstName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="last-name">Last name</label>
                  <input id="last-name" type="text" value={form.lastName} onChange={e => update("lastName", e.target.value)}
                    className="input" placeholder="Johnson" aria-required="true"
                    aria-describedby={fieldErrors.lastName ? "ln-err" : undefined} />
                  {fieldErrors.lastName && <p id="ln-err" className="form-error" role="alert">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="username">Username <span style={{ color: "var(--color-text-muted)" }}>(optional)</span></label>
                <input id="username" type="text" value={form.username} onChange={e => update("username", e.target.value)}
                  className="input" placeholder="maya_finance" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input id="email" type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  className="input" placeholder="maya@example.com" aria-required="true"
                  aria-describedby={fieldErrors.email ? "em-err" : undefined} />
                {fieldErrors.email && <p id="em-err" className="form-error" role="alert">{fieldErrors.email}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="relative">
                  <input id="password" type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => update("password", e.target.value)}
                    className="input pr-11" placeholder="Min. 8 characters" aria-required="true"
                    aria-describedby={fieldErrors.password ? "pw-err" : undefined} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon btn"
                    style={{ background: "none", border: "none", color: "var(--color-text-muted)" }}
                    aria-label={showPass ? "Hide password" : "Show password"}>
                    {showPass ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                </div>
                {fieldErrors.password && <p id="pw-err" className="form-error" role="alert">{fieldErrors.password}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm password</label>
                <div className="relative">
                  <input id="confirm-password" type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                    onChange={e => update("confirmPassword", e.target.value)}
                    className="input pr-11" placeholder="Repeat your password" aria-required="true"
                    aria-describedby={fieldErrors.confirmPassword ? "cpw-err" : undefined} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon btn"
                    style={{ background: "none", border: "none", color: "var(--color-text-muted)" }}
                    aria-label={showConfirm ? "Hide password" : "Show password"}>
                    {showConfirm ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p id="cpw-err" className="form-error" role="alert">{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
                {loading ? "Creating account…" : <><span>Create account</span> <ArrowRight size={18} aria-hidden /></>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
