import test from "node:test";
import assert from "node:assert/strict";

import { listMigrationFiles } from "../lib/server/migrations.ts";

test("lists SQL migrations in sorted order", async () => {
  const files = await listMigrationFiles();
  assert.ok(files.length >= 1);
  assert.deepEqual([...files].sort(), files);
  assert.ok(files.every((file) => file.endsWith(".sql")));
});
