import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  verifySessionToken,
  createSessionToken,
  SESSION_COOKIE,
  COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  // ── Parse body ────────────────────────────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { firstName, lastName, username, email, password, confirmPassword } =
    body ?? {};

  // ── Validation ────────────────────────────────────────────────────────────
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { error: "All required fields must be filled." },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 }
    );
  }

  // ── Duplicate check (same browser) ───────────────────────────────────────
  const existingToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (existingToken) {
    const existing = verifySessionToken(existingToken);
    if (existing && existing.email === email.toLowerCase().trim()) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
  }

  // ── Create account ────────────────────────────────────────────────────────
  let passwordHash: string;
  try {
    passwordHash = await hashPassword(password);
  } catch (err) {
    console.error("[signup] Password hashing failed:", err);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }

  const payload = {
    id: Date.now(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    username: username?.trim() || null,
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  const token = createSessionToken(payload);

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
