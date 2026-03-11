import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const migrationsDir = path.join(process.cwd(), "lib", "server", "migrations");

export async function listMigrationFiles() {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

export async function readMigrationSql(file: string) {
  return readFile(path.join(migrationsDir, file), "utf8");
}

export async function getBootstrapSql() {
  const files = await listMigrationFiles();
  const sqlChunks = await Promise.all(files.map((file) => readMigrationSql(file)));
  return sqlChunks.join("\n\n");
}
