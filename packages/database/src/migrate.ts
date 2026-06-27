import { migrate } from "drizzle-orm/d1/migrator";
import { createDatabase } from "./queries";

export async function runMigrations(d1: D1Database) {
  const db = createDatabase(d1);
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed");
}
