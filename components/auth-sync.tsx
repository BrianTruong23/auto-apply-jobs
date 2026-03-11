"use client";

import { useEffect } from "react";

import { supabase } from "@/lib/supabase";

async function syncAccessToken(accessToken: string | null) {
  if (!accessToken) {
    await fetch("/api/auth/session", {
      method: "DELETE",
    });
    return;
  }

  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
}

export function AuthSync() {
  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      void syncAccessToken(data.session?.access_token || null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAccessToken(session?.access_token || null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return null;
}
