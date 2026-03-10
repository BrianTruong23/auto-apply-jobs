import { NextRequest, NextResponse } from "next/server";

import { nextId, readStore, writeStore } from "@/lib/server/store";

export async function GET() {
  const data = await readStore();
  return NextResponse.json(data.sources);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const data = await readStore();
  const source = {
    id: nextId("src", data.sources.map((item) => item.id)),
    name: String(payload.name || ""),
    type: String(payload.type || "search_keyword"),
    base_url: payload.base_url ? String(payload.base_url) : undefined,
    keywords: Array.isArray(payload.keywords) ? payload.keywords.map(String) : [],
    companies: Array.isArray(payload.companies) ? payload.companies.map(String) : [],
    roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
    locations: Array.isArray(payload.locations) ? payload.locations.map(String) : [],
    workplace_modes: Array.isArray(payload.workplace_modes) ? payload.workplace_modes.map(String) : [],
    enabled: payload.enabled !== false,
    last_checked_at: undefined,
  };
  data.sources.unshift(source);
  await writeStore(data);
  return NextResponse.json(source, { status: 201 });
}
