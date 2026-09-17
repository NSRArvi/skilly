"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login or auth callback, show bare content without sidebar/navbar
  const isAuthPage = pathname === "/login" || pathname?.startsWith("/auth");

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Sidebar fixed on the left on desktop, drawer on mobile */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Navbar */}
        <Navbar
          onToggleMobileSidebar={() =>
            setMobileSidebarOpen((prev) => !prev)
          }
        />

        {/* Page Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
