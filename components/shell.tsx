import Link from "next/link";
import { AuthControls } from "./auth-controls";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/sources", label: "Sources" },
  { href: "/answers", label: "Answers" },
  { href: "/runs", label: "Runs" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>Job Application</strong>
          <br />
          Hub
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <AuthControls />
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}
