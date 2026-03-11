import test from "node:test";
import assert from "node:assert/strict";

import { getBootstrapSql, listMigrationFiles } from "../lib/server/migrations.ts";

test("lists SQL migrations in sorted order", async () => {
  const files = await listMigrationFiles();
  assert.ok(files.length >= 1);
  assert.deepEqual([...files].sort(), files);
  assert.ok(files.every((file) => file.endsWith(".sql")));
});

test("builds bootstrap SQL from migration files", async () => {
  const sql = await getBootstrapSql();
  assert.match(sql, /create table if not exists profiles/i);
  assert.match(sql, /create table if not exists jobs/i);
});
