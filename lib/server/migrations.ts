import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Pool } from "pg";

const migrationsDir = path.join(process.cwd(), "lib", "server", "migrations");

export async function listMigrationFiles() {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

export async function runMigrations(pool: Pool) {
  await pool.query(
    "create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())",
  );

  const applied = await pool.query<{ version: string }>("select version from schema_migrations");
  const appliedVersions = new Set(applied.rows.map((row) => row.version));
  const migrationFiles = await listMigrationFiles();

  for (const file of migrationFiles) {
    if (appliedVersions.has(file)) {
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (version) values ($1)", [file]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}
