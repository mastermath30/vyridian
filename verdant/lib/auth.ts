/**
 * Cookie-based auth — no database required.
 *
 * User credentials (including the bcrypt password hash) are stored in a
 * signed, httpOnly cookie on the user's browser.  An HMAC-SHA256 signature
 * prevents tampering.  SESSION_SECRET env var sets the signing key; if it is
 * absent a built-in fallback is used so the app works with zero configuration.
 *
 * Limitations (acceptable for hackathon / demo):
 *  - Credentials live in the browser that signed up — a different device
 *    cannot log in with the same account.
 *  - Clearing cookies requires re-signup.
 *  - Single account per browser (new signup overwrites the old one).
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "verdant_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ── Signing key ───────────────────────────────────────────────────────────────
function signingKey(): string {
  return (
    process.env.SESSION_SECRET ??
    "vyridian-hackathon-built-in-key-2024-replace-in-prod"
  );
}

// ── Payload stored inside the cookie ─────────────────────────────────────────
export interface CookiePayload {
  id: number;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  password_hash: string;
  created_at: string;
}

// ── Token helpers ─────────────────────────────────────────────────────────────
function makeToken(payload: CookiePayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", signingKey())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

function parseToken(token: string): CookiePayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = crypto
    .createHmac("sha256", signingKey())
    .update(data)
    .digest("base64url");

  // Constant-time comparison
  try {
    const a = Buffer.from(sig, "ascii");
    const b = Buffer.from(expected, "ascii");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as CookiePayload;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Create a signed session token from a payload. */
export function createSessionToken(payload: CookiePayload): string {
  return makeToken(payload);
}

/** Verify and decode a session token string. Returns null if invalid. */
export function verifySessionToken(token: string): CookiePayload | null {
  return parseToken(token);
}

/**
 * Read the session cookie and return the user without the password hash.
 * Returns null if not logged in or the token is invalid / tampered.
 */
export async function getSessionUser(): Promise<
  Omit<CookiePayload, "password_hash"> | null
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const payload = parseToken(token);
    if (!payload) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _ph, ...user } = payload;
    return user;
  } catch {
    return null;
  }
}

/** No-op in cookie-based auth — cookie is cleared by the logout route. */
export async function deleteSession(_token: string): Promise<void> {}

// Keep these exports so nothing else breaks if imported elsewhere
export { COOKIE_MAX_AGE };
