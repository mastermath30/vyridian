import { getDb, type DbUser } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "verdant_session";
const SESSION_DURATION_DAYS = 30;

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSession(userId: number): string {
  const db = getDb();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)").run(userId, token, expiresAt);
  return token;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getUserFromToken(token: string): Omit<DbUser, "password_hash"> | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as Omit<DbUser, "password_hash"> | undefined;
  return row ?? null;
}

export async function getSessionUser(): Promise<Omit<DbUser, "password_hash"> | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return getUserFromToken(token);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
