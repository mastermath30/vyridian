import { neon } from "@neondatabase/serverless";

/** Thrown when DATABASE_URL is absent — distinguishable from connection errors */
export class DatabaseConfigError extends Error {
  constructor() {
    super(
      "DATABASE_URL is not set. " +
      "Create a free Neon database at https://neon.tech and add " +
      "DATABASE_URL to your .env.local (local) and Vercel Environment Variables (production). " +
      "Then run: pnpm db:migrate"
    );
    this.name = "DatabaseConfigError";
  }
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new DatabaseConfigError();
  return neon(databaseUrl);
}

export interface DbUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  password_hash: string;
  created_at: string;
}
