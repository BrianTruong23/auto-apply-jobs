import { NextRequest, NextResponse } from "next/server";

import { allocateId, createSourceRecord, ensureSeedData, listSourceRecords } from "@/lib/server/repository";

export async function GET() {
  await ensureSeedData();
  return NextResponse.json(await listSourceRecords());
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const source = {
    id: await allocateId("src"),
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
  await createSourceRecord(source);
  return NextResponse.json(source, { status: 201 });
}
