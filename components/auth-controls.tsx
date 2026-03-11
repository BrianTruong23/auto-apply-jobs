"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Viewer = {
  email?: string;
};

export function AuthControls() {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setViewer(data.user ? { email: data.user.email } : null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setViewer(session?.user ? { email: session.user.email } : null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/login";
  }

  if (!viewer) {
    return (
      <div className="stack">
        <Link href="/login" className="button-secondary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="muted">{viewer.email || "Signed in"}</p>
      <button className="button-secondary" type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
