import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as { access_token?: string };
  const token = payload.access_token?.trim();
  if (!token) {
    return NextResponse.json({ detail: "access_token is required" }, { status: 400 });
  }

  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ status: "ok" });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  return NextResponse.json({ status: "ok" });
}
