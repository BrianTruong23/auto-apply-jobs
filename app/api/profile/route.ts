import { NextRequest, NextResponse } from "next/server";

import { readStore, writeStore } from "@/lib/server/store";

export async function GET() {
  const data = await readStore();
  return NextResponse.json(data.profile);
}

export async function PUT(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const data = await readStore();
  data.profile = {
    id: "profile_1",
    full_name: String(payload.full_name || ""),
    email: String(payload.email || ""),
    location: String(payload.location || ""),
    summary: String(payload.summary || ""),
    resume_text: String(payload.resume_text || ""),
    preferred_roles: Array.isArray(payload.preferred_roles) ? payload.preferred_roles.map(String) : [],
    preferred_locations: Array.isArray(payload.preferred_locations) ? payload.preferred_locations.map(String) : [],
    preferred_companies: Array.isArray(payload.preferred_companies) ? payload.preferred_companies.map(String) : [],
    skills: Array.isArray(payload.skills) ? payload.skills.map(String) : [],
  };
  await writeStore(data);
  return NextResponse.json(data.profile);
}
