import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { ensureSeedData, getProfileRecord, upsertProfileRecord } from "@/lib/server/repository";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    await ensureSeedData(user.id);
    return NextResponse.json(await getProfileRecord(user.id));
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to load profile." }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const profile = {
      id: `profile_${user.id}`,
      user_id: user.id,
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
    await upsertProfileRecord(user.id, profile);
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Failed to save profile." }, { status: 401 });
  }
}
