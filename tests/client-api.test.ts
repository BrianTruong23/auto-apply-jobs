import assert from "node:assert/strict";
import test from "node:test";

import { assertApiResponse, formatApiErrorMessage } from "../lib/client-api.ts";

test("returns detailed Supabase-aware message for server errors", () => {
  const message = formatApiErrorMessage(
    new Error("HTTP_500:Saving profile failed because the required Supabase tables do not exist."),
    "fallback",
  );

  assert.match(message, /Supabase tables do not exist/i);
});

test("throws detailed error from JSON API responses", async () => {
  const response = new Response(JSON.stringify({ detail: "Failed to save profile." }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });

  await assert.rejects(() => assertApiResponse(response), /HTTP_500:Failed to save profile/);
});
