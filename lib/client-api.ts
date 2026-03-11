export function getClientApiBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) {
    return "";
  }

  if (configured.includes("localhost") && window.location.hostname !== "localhost") {
    return "";
  }

  return configured.replace(/\/api\/?$/, "");
}

export function formatApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const [code, detail] = error.message.split(":", 2);
    if (code.startsWith("HTTP_500")) {
      return detail || "The server failed while saving. Check your Supabase configuration and the server logs.";
    }
    if (code.startsWith("HTTP_401") || code.startsWith("HTTP_403")) {
      return detail || "The request was rejected by the server. Log in and try again.";
    }
    if (code.startsWith("HTTP_404")) {
      return detail || "The API route was not found. Check that the app is using same-origin /api routes.";
    }
    if (error.message === "Failed to fetch") {
      return "The browser could not reach the API. If you are on the deployed site, remove any localhost API URL and use same-origin /api.";
    }
  }

  return fallback;
}

export async function assertApiResponse(response: Response) {
  if (response.ok) {
    return;
  }

  let detail = "";
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as { detail?: string; error?: string; message?: string };
      detail = body.detail || body.error || body.message || "";
    } else {
      detail = (await response.text()).trim();
    }
  } catch {
    detail = "";
  }

  throw new Error(`HTTP_${response.status}${detail ? `:${detail}` : ""}`);
}
