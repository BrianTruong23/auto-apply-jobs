import { redirect } from "next/navigation";

export function AuthRequired({ title = "Authentication required" }: { title?: string }) {
  redirect(`/login?reason=${encodeURIComponent(title)}`);
  return null;
}
