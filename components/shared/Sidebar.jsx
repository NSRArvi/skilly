"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Users2,
  GraduationCap,
  ShieldCheck,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
  MessageCircle,
} from "lucide-react";
import { createClient } from "../../lib/client";
import { toast } from "sonner";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  // "first active tab will be professional." - per user instruction, default to "Professionals"
  const [activeTab, setActiveTab] = useState("Professionals");

  useEffect(() => {
    // Keep activeTab in sync with pathname, defaulting to Professionals
    if (
      pathname === "/professionals" ||
      pathname.startsWith("/professionals/")
    ) {
      setActiveTab("Professionals");
    } else if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/")
    ) {
      setActiveTab("Dashboard");
    } else if (pathname === "/jobs" || pathname.startsWith("/jobs/")) {
      setActiveTab("Jobs & Projects");
    }
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const navSections = [
    {
      title: "MAIN",
      items: [
        {
          id: "Professionals",
          label: "Professionals",
          icon: Users,
          href: "/professionals",
        },
        {
          id: "Jobs",
          label: "Jobs",
          icon: Briefcase,
          href: "/jobs",
        },
        {
          id: "Dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
        },
      ],
    },
    {
      title: "CONNECT",
      items: [
        {
          id: "Messages",
          label: "Messages",
          icon: MessageCircle,
          href: "/messages",
        },
        {
          id: "Community",
          label: "Community",
          icon: Users2,
          href: "/community",
        },
      ],
    },
    // {
    //   title: "MANAGEMENT",
    //   items: [
    //     {
    //       id: "Verification Center",
    //       label: "Verification Center",
    //       icon: ShieldCheck,
    //       href: "#",
    //       action: () => toast.info("Verification Center: KYC Status verified"),
    //     },
    //     {
    //       id: "Wallet & Payouts",
    //       label: "Wallet & Payouts",
    //       icon: Wallet,
    //       href: "#",
    //       action: () => toast.info("Wallet & Payouts connected via Stripe"),
    //     },
    //     {
    //       id: "Analytics",
    //       label: "Analytics",
    //       icon: BarChart3,
    //       href: "#",
    //       action: () => toast.info("Analytics dashboard coming soon!"),
    //     },
    //   ],
    // },
  ];

  const bottomItems = [
    // {
    //   id: "Settings",
    //   label: "Settings",
    //   icon: Settings,
    //   action: () => toast.info("Settings modal"),
    // },
    {
      id: "Help & Support",
      label: "Help & Support",
      icon: HelpCircle,
      href: "/support",
    },
    {
      id: "Log out",
      label: "Log out",
      icon: LogOut,
      action: handleLogout,
      isDestructive: true,
    },
  ];

  const renderItem = (item) => {
    // Route-based active detection: matches /jobs, /jobs/create, /jobs/[id] etc.
    const isActive =
      item.href && item.href !== "#"
        ? pathname === item.href || pathname.startsWith(item.href + "/")
        : activeTab === item.id;
    const Icon = item.icon;

    const handleClick = () => {
      setActiveTab(item.id);
      if (setMobileOpen) setMobileOpen(false);
      if (item.action) item.action();
    };

    const content = (
      <div
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
          isActive
            ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
          />
          <span>{item.label}</span>
        </div>

        {item.badge && (
          <span
            className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
              isActive
                ? "bg-primary-foreground text-primary"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {item.badge}
          </span>
        )}
      </div>
    );

    if (item.href && item.href !== "#") {
      return (
        <Link key={item.id} href={item.href} className="block">
          {content}
        </Link>
      );
    }

    return <div key={item.id}>{content}</div>;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-card/95 md:bg-card/70 backdrop-blur-xl border-r border-border/70 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <Link href="/professionals" className="flex items-center gap-2.5">
              {/* <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-black/50 border border-border">
                <Image
                  src="/skilly.png"
                  alt="Skilly Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div> */}
              <span className="font-bold text-xl text-foreground tracking-tight">
                Skilly
              </span>
              {/* <span className="border border-primary/50 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider bg-primary/10 ml-0.5">
                PRO
              </span> */}
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              className="md:hidden text-muted-foreground hover:text-foreground p-1"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 scrollbar-hide">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <h4 className="text-[11px] font-semibold text-muted-foreground/70 tracking-wider px-3 uppercase mb-1.5">
                  {section.title}
                </h4>
                <div className="space-y-1">{section.items.map(renderItem)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions (Settings, Help, Logout) */}
        <div className="pt-4 border-t border-border/60 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (setMobileOpen) setMobileOpen(false);
                  if (item.action) {
                    item.action();
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  item.isDestructive
                    ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
