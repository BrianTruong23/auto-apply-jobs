"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControls } from "./auth-controls";

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

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">JH</div>
          <div className="brand">Job Application Hub</div>
          <div className="brand-subtitle">A deliberate operating system for sourcing, drafting, tracking, and reviewing every application step.</div>
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
          <div className="status-dock">
            <div className="dock-label">Operating posture</div>
            <div className="dock-row">
              <span>Human review</span>
              <span>Required</span>
            </div>
            <div className="dock-row">
              <span>Automation</span>
              <span>Assisted</span>
            </div>
            <div className="dock-row">
              <span>Visibility</span>
              <span>Full logs</span>
            </div>
          </div>
          <AuthControls />
        </div>
      </aside>
      <div className="content">
        <div className="topbar">
          <div className="topbar-search">
            <span className="muted">Search</span>
            <input placeholder="Search jobs, sources, answers, or recent runs" />
          </div>
          <div className="topbar-actions">
            <div className="status-pill">System healthy</div>
            <Link href="/sources" className="button-secondary">
              New source
            </Link>
            <Link href="/answers" className="button-primary">
              Draft answer
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
