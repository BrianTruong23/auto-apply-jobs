"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setState("error");
      setMessage("Supabase auth is not configured.");
      return;
    }

    setState("loading");
    setMessage("");

    const action =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    setState("done");
    setMessage(mode === "login" ? "Logged in. Redirecting..." : "Account created. Check your email if confirmation is required.");

    if (mode === "login") {
      window.location.href = "/";
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field field-full">
        <span>Email</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="field field-full">
        <span>Password</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <div className="form-actions field-full">
        <button className="button-primary" type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Working..." : mode === "login" ? "Log in" : "Create account"}
        </button>
        <button
          className="button-secondary"
          type="button"
          onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
        >
          {mode === "login" ? "Need an account?" : "Already have an account?"}
        </button>
      </div>
      {message ? (
        <p className={state === "error" ? "inline-message inline-error" : "inline-message inline-saved"}>{message}</p>
      ) : null}
    </form>
  );
}
