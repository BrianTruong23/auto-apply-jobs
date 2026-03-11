import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ACCESS_TOKEN_COOKIE = "jah-access-token";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

export type AuthUser = {
  id: string;
  email?: string;
};

function getAuthHeaders(token: string) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${token}`,
  };
}

export async function getServerAccessToken() {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

export async function getRequestAccessToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

export async function getUserForAccessToken(token: string | null): Promise<AuthUser | null> {
  if (!token || !supabaseUrl || !supabaseKey) {
    return null;
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { id?: string; email?: string };
  if (!payload.id) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
  };
}

export async function requireRequestUser(request: NextRequest) {
  const token = await getRequestAccessToken(request);
  const user = await getUserForAccessToken(token);
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}

export async function getServerViewer() {
  return getUserForAccessToken(await getServerAccessToken());
}
