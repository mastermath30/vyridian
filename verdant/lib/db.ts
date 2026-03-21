import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
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
