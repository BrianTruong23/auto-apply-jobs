"use client";

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
    return null;
  }

  return (
    <div className="account-dock">
      <div className="row">
        <div>
          <div className="dock-label">Signed in</div>
          <p className="muted auth-controls-copy">{viewer.email || "Signed in"}</p>
        </div>
        <button className="button-secondary button-compact" type="button" onClick={signOut}>
          Log out
        </button>
      </div>
    </div>
  );
}
