import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Machine-readable production diagnostic.
 * Visit this URL in your browser (or curl it) to see exactly what is failing.
 *
 * Returns 200 when everything is healthy.
 * Returns 503 with a `checks` object describing each failure.
 *
 * Does NOT expose env var values — only whether they are present.
 */
export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // ── 1. Environment variables ───────────────────────────────────────────────
  const dbUrlSet = !!process.env.DATABASE_URL;
  const apiKeySet = !!process.env.ANTHROPIC_API_KEY;

  checks.env_DATABASE_URL = {
    ok: dbUrlSet,
    detail: dbUrlSet
      ? "DATABASE_URL is set"
      : "DATABASE_URL is MISSING — add it to Vercel Environment Variables and redeploy",
  };
  checks.env_ANTHROPIC_API_KEY = {
    ok: apiKeySet,
    detail: apiKeySet ? "ANTHROPIC_API_KEY is set" : "ANTHROPIC_API_KEY is MISSING",
  };

  if (!dbUrlSet) {
    return NextResponse.json(
      { healthy: false, checks },
      { status: 503 }
    );
  }

  // ── 2. Database connectivity ───────────────────────────────────────────────
  let sql: ReturnType<typeof import("@neondatabase/serverless").neon>;
  try {
    const { neon } = await import("@neondatabase/serverless");
    sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1`;
    checks.db_connection = { ok: true, detail: "Connected to database" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[health] DB connection failed:", msg);
    checks.db_connection = {
      ok: false,
      detail: `Cannot connect to database: ${msg}`,
    };
    return NextResponse.json({ healthy: false, checks }, { status: 503 });
  }

  // ── 3. Required tables ─────────────────────────────────────────────────────
  try {
    await sql`SELECT COUNT(*) FROM users LIMIT 1`;
    checks.table_users = { ok: true, detail: "users table exists" };
  } catch {
    checks.table_users = {
      ok: false,
      detail: 'users table is MISSING — run: pnpm db:migrate',
    };
  }

  try {
    await sql`SELECT COUNT(*) FROM sessions LIMIT 1`;
    checks.table_sessions = { ok: true, detail: "sessions table exists" };
  } catch {
    checks.table_sessions = {
      ok: false,
      detail: 'sessions table is MISSING — run: pnpm db:migrate',
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    { healthy: allOk, checks },
    { status: allOk ? 200 : 503 }
  );
}
