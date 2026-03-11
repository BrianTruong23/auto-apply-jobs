"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControls } from "./auth-controls";
import { ThemeToggle } from "./theme-toggle";

function OverviewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.75 4.75H16.25V8.25H3.75V4.75Z" stroke="currentColor" strokeWidth="1.6" rx="1.5" />
      <path d="M3.75 11.75H9V15.25H3.75V11.75Z" stroke="currentColor" strokeWidth="1.6" rx="1.5" />
      <path d="M11 11.75H16.25V15.25H11V11.75Z" stroke="currentColor" strokeWidth="1.6" rx="1.5" />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.25 5.5H15.75C16.44 5.5 17 6.06 17 6.75V14.25C17 14.94 16.44 15.5 15.75 15.5H4.25C3.56 15.5 3 14.94 3 14.25V6.75C3 6.06 3.56 5.5 4.25 5.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 5.5V4.75C7 4.06 7.56 3.5 8.25 3.5H11.75C12.44 3.5 13 4.06 13 4.75V5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 9.5H17" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ApplicationsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 4.25H14C14.69 4.25 15.25 4.81 15.25 5.5V16L10 13.2L4.75 16V5.5C4.75 4.81 5.31 4.25 6 4.25Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.25 8H12.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SourcesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.75 6.5H16.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.25 10H13.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.75 13.5H11.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AnswersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 4.25H15C15.69 4.25 16.25 4.81 16.25 5.5V12.25C16.25 12.94 15.69 13.5 15 13.5H9.25L5.75 16V13.5H5C4.31 13.5 3.75 12.94 3.75 12.25V5.5C3.75 4.81 4.31 4.25 5 4.25Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.75 8H13.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.75 10.75H11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RunsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 14.5L7.25 11.25L9.5 13.5L15.75 7.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.75 7.25H15.75V10.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 10.25C11.7949 10.25 13.25 8.79492 13.25 7C13.25 5.20508 11.7949 3.75 10 3.75C8.20508 3.75 6.75 5.20508 6.75 7C6.75 8.79492 8.20508 10.25 10 10.25Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.75 15.75C5.78 13.85 7.72 12.75 10 12.75C12.28 12.75 14.22 13.85 15.25 15.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Overview", icon: OverviewIcon },
      { href: "/jobs", label: "Jobs", icon: JobsIcon },
      { href: "/applications", label: "Applications", icon: ApplicationsIcon },
    ],
  },
  {
    label: "Automation",
    items: [
      { href: "/sources", label: "Sources", icon: SourcesIcon },
      { href: "/answers", label: "Answers", icon: AnswersIcon },
      { href: "/runs", label: "Runs", icon: RunsIcon },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/profile", label: "Profile", icon: ProfileIcon }],
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
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.href} className={active ? "nav-link nav-link-active" : "nav-link"}>
                    <span className="nav-icon">
                      <Icon />
                    </span>
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
