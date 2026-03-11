import { NextResponse } from "next/server";

import { getServerPersistenceMode, isServerSupabaseConfigured } from "@/lib/server/supabase-server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    persistence_mode: getServerPersistenceMode(),
    supabase_configured: isServerSupabaseConfigured(),
    brave_configured: Boolean(process.env.BRAVE_SEARCH_API_KEY),
    openrouter_configured: Boolean(
      process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API || process.env.OPENREUTER_API,
    ),
  });
}
