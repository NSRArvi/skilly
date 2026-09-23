"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  MessageSquare,
  Tag,
  LifeBuoy,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";

const tabs = [
  { name: "Professionals", href: "/admin/professionals", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { name: "Posts", href: "/admin/community_posts", icon: MessageSquare },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Support", href: "/admin/support_messages", icon: LifeBuoy },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen text-gray-300 flex flex-col hidden md:flex border-r border-gray-800">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wider">
          SKILLY ADMIN
        </h2>
      </div>
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white border-l-4 border-primary"
                  : "hover:bg-gray-800/50 hover:text-white border-l-4 border-transparent",
              )}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 rounded-lg transition-colors hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
        <div className="text-xs text-gray-500 text-center uppercase tracking-widest font-semibold">
          Super Secret Admin Zone
        </div>
      </div>
    </div>
  );
}
