"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControls } from "./auth-controls";
import { ThemeToggle } from "./theme-toggle";

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Overview", icon: "OV" },
      { href: "/jobs", label: "Jobs", icon: "JB" },
      { href: "/applications", label: "Applications", icon: "AP" },
    ],
  },
  {
    label: "Automation",
    items: [
      { href: "/sources", label: "Sources", icon: "SC" },
      { href: "/answers", label: "Answers", icon: "AN" },
      { href: "/runs", label: "Runs", icon: "RN" },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/profile", label: "Profile", icon: "PF" }],
  },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandaloneRoute = pathname === "/login";

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <img src="/app-icon.svg" alt="Job Application Hub icon" className="brand-mark-image" />
          </div>
          <div className="brand">Job Application Hub</div>
          <div className="brand-subtitle">A focused workspace for discovering roles, managing applications, and reviewing each step with care.</div>
        </div>

        {navSections.map((section) => (
          <div className="stack" key={section.label}>
            <div className="nav-group-label">{section.label}</div>
            <nav className="nav">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link href={item.href} key={item.href} className={active ? "nav-link nav-link-active" : "nav-link"}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div className="sidebar-footer">
          <AuthControls />
        </div>
      </aside>
      <div className="content">
        <div className="topbar">
          <div className="topbar-search">
            <input placeholder="Search jobs, answers, sources, or recent runs" />
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <div className="status-pill">System healthy</div>
            <Link href="/sources" className="button-secondary">
              Sources
            </Link>
            <Link href="/answers" className="button-primary">
              New draft
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
