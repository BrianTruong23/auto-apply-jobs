import assert from "node:assert/strict";
import test from "node:test";

import { formatSupabaseError } from "../lib/server/supabase-server.ts";

test("formats missing table errors with bootstrap guidance", () => {
  const message = formatSupabaseError("Saving profile", {
    code: "42P01",
    message: 'relation "profiles" does not exist',
  });

  assert.match(message, /Supabase tables do not exist/i);
  assert.match(message, /001_initial\.sql/);
});

test("formats RLS errors with policy guidance", () => {
  const message = formatSupabaseError("Saving profile", {
    code: "42501",
    message: "new row violates row-level security policy",
  });

  assert.match(message, /RLS/i);
  assert.match(message, /service role key/i);
});
