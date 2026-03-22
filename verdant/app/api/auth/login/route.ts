import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  verifySessionToken,
  createSessionToken,
  SESSION_COOKIE,
  COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  // ── Parse body ────────────────────────────────────────────────────────────
  let email: string, password: string;
  try {
    const body = await req.json();
    email    = body?.email    ?? "";
    password = body?.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email.trim() || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  // ── Read stored credentials from session cookie ───────────────────────────
  const existingToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (!existingToken) {
    return NextResponse.json(
      { error: "No account found. Please sign up first." },
      { status: 401 }
    );
  }

  const stored = verifySessionToken(existingToken);
  if (!stored) {
    return NextResponse.json(
      { error: "Session is invalid. Please sign up again." },
      { status: 401 }
    );
  }

  if (stored.email !== email.toLowerCase().trim()) {
    return NextResponse.json(
      { error: "No account found with that email." },
      { status: 401 }
    );
  }

  // ── Verify password ───────────────────────────────────────────────────────
  let valid: boolean;
  try {
    valid = await verifyPassword(password, stored.password_hash);
  } catch (err) {
    console.error("[login] Password verification error:", err);
    return NextResponse.json(
      { error: "Could not verify password. Please try again." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // ── Refresh session cookie (reset 30-day expiry) ──────────────────────────
  const refreshedToken = createSessionToken(stored);

  const res = NextResponse.json({
    success: true,
    user: {
      id: stored.id,
      firstName: stored.first_name,
      lastName: stored.last_name,
      email: stored.email,
    },
  });

  res.cookies.set(SESSION_COOKIE, refreshedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return res;
}
