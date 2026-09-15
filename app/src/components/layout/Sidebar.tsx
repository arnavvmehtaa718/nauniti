"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Anchor,
  BadgeCheck,
  ClipboardList,
  Download,
  LayoutDashboard,
  Map,
  PiggyBank,
  ScrollText,
  Settings,
  ShieldAlert,
  Ship,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

function SignOutDoorIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <line x1="10" x2="21" y1="12" y2="12" />
      <polyline points="16 7 21 12 16 17" />
    </svg>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Insights" },
  { label: "New Procurement Analysis", href: "/procurement", icon: ClipboardList, section: "Insights" },
  { label: "Freight Forecast", href: "/forecast", icon: TrendingUp, section: "Insights" },
  { label: "Vessel Recommendation", href: "/vessels", icon: Ship, section: "Insights" },
  { label: "Port Analytics", href: "/ports", icon: Anchor, section: "Insights" },
  { label: "Route Optimization", href: "/routes", icon: Map, section: "Insights" },
  { label: "Cost & Savings", href: "/cost-savings", icon: PiggyBank, section: "Decision" },
  { label: "Risk & Alerts", href: "/risk", icon: ShieldAlert, section: "Decision" },
  { label: "Contract Strategy", href: "/contracts", icon: ScrollText, section: "Decision" },
  { label: "Final Recommendation", href: "/recommendation", icon: BadgeCheck, section: "Decision" },
  { label: "Reports", href: "/reports", icon: Download, section: "Workspace" },
];

const SECTIONS = ["Insights", "Decision", "Workspace"];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const pushToast = useAppStore((s) => s.pushToast);
  const userName = useAppStore((s) => s.userName);
  const userRole = useAppStore((s) => s.userRole);

  const navBySection = (section: string) => NAV_ITEMS.filter((n) => n.section === section);

  const handleSignOut = useCallback(() => {
    logout();
    pushToast({ title: "Signed out", description: "You've been securely signed out.", kind: "info" });
    router.push("/");
  }, [logout, pushToast, router]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-line bg-panel">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-9 place-items-center rounded-lg bg-blue-nav shadow-lg shadow-blue-glow/40">
          <Ship className="size-5 text-white" />
        </div>
        <div>
          <div className="text-[15px] font-bold leading-4 tracking-tight text-primary">
            Ocean<span className="text-accent">IQ</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-secondary">
            Charter Intelligence
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((section) => (
          <div key={section} className="mb-4">
            <div className="px-2 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-widest text-secondary/70">
              {section}
            </div>
            <ul className="space-y-0.5">
              {navBySection(section).map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
                        active
                          ? "nav-glow bg-blue-nav font-medium text-white"
                          : "text-secondary hover:bg-white/[0.04] hover:text-primary"
                      }`}
                    >
                      <Icon className={`size-4 ${active ? "text-accent" : "text-secondary group-hover:text-accent"}`} />
                      {item.label}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Settings link (below main nav) */}
      <div className="border-t border-line px-3 py-3">
        <Link
          href="/settings"
          className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
            pathname === "/settings" || pathname.startsWith("/settings/")
              ? "nav-glow bg-blue-nav font-medium text-white"
              : "text-secondary hover:bg-white/[0.04] hover:text-primary"
          }`}
        >
          <Settings className="size-4 text-secondary group-hover:text-accent" />
          Settings
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
            {(userName || "SA").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-primary">
              {userName || "Steel Authority Ltd."}
            </div>
            <div className="truncate text-[10px] text-secondary">{userRole}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-secondary transition-colors hover:border-bad/40 hover:bg-bad/10 hover:text-bad"
        >
          <SignOutDoorIcon className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
