import AdminSidebar from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated or non-admin users to the login page
  if (!user || user.email !== "admin@skilly.com") {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-gray-100">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
