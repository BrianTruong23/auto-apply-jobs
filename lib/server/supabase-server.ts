const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";

type SupabaseErrorShape = { code?: string; message?: string } | null | undefined;

function restBaseUrl() {
  return `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
}

function authHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extra,
  };
}

function tableUrl(table: string, query = "") {
  return `${restBaseUrl()}/${table}${query ? `?${query}` : ""}`;
}

async function readJsonResponse<T>(response: Response) {
  const text = await response.text();
  if (!text.trim()) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T;
  }
}

async function throwSupabaseHttpError(operation: string, response: Response): Promise<never> {
  let error: SupabaseErrorShape = null;

  try {
    error = await readJsonResponse<SupabaseErrorShape>(response);
  } catch {
    error = { message: await response.text() };
  }

  throw new Error(formatSupabaseError(operation, error));
}

export function isServerSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getServerPersistenceMode() {
  return isServerSupabaseConfigured() ? "supabase" : "file";
}

export function formatSupabaseError(operation: string, error: SupabaseErrorShape) {
  if (!error) {
    return `${operation} failed for an unknown Supabase reason.`;
  }

  if (error.code === "42P01") {
    return `${operation} failed because the required Supabase tables do not exist. Run lib/server/migrations/001_initial.sql in the Supabase SQL editor first.`;
  }

  if (error.code === "42501") {
    return `${operation} was blocked by Supabase permissions or RLS. Use a service role key on the server or allow this table operation in your Supabase policies.`;
  }

  return `${operation} failed: ${error.message || "unknown Supabase error"}`;
}

export async function selectMany<T>(operation: string, table: string, query = "") {
  const response = await fetch(tableUrl(table, query), {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    await throwSupabaseHttpError(operation, response);
  }
  return (await readJsonResponse<T[]>(response)) || [];
}

export async function selectOne<T>(operation: string, table: string, query = "") {
  const rows = await selectMany<T>(operation, table, query);
  return rows[0] || null;
}

export async function insertRow<T>(operation: string, table: string, payload: Record<string, unknown>) {
  const response = await fetch(tableUrl(table), {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    await throwSupabaseHttpError(operation, response);
  }
  const rows = (await readJsonResponse<T[]>(response)) || [];
  return rows[0] || null;
}

export async function upsertRow<T>(
  operation: string,
  table: string,
  payload: Record<string, unknown>,
  onConflict: string,
) {
  const response = await fetch(tableUrl(table, `on_conflict=${encodeURIComponent(onConflict)}`), {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    }),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    await throwSupabaseHttpError(operation, response);
  }
  const rows = (await readJsonResponse<T[]>(response)) || [];
  return rows[0] || null;
}

export async function updateRow<T>(
  operation: string,
  table: string,
  query: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(tableUrl(table, query), {
    method: "PATCH",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    await throwSupabaseHttpError(operation, response);
  }
  const rows = (await readJsonResponse<T[]>(response)) || [];
  return rows[0] || null;
}
