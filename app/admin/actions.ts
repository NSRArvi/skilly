"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/server";

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== 'admin@skilly.com') {
    throw new Error('Unauthorized');
  }
}

export async function toggleProfessionalVerification(userId: string, newStatus: boolean) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("professionals")
      .update({ is_verified: newStatus })
      .eq("id", userId)
      .select();
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    if (!data || data.length === 0) {
      return { success: false, error: "Failed to update record." };
    }
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function toggleJobVerification(jobId: string, newStatus: boolean) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .update({ is_verified: newStatus })
      .eq("id", jobId)
      .select();
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    if (!data || data.length === 0) {
      return { success: false, error: "Failed to update record." };
    }
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function togglePostArchive(postId: string, newStatus: boolean) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("community_posts")
      .update({ is_archived: newStatus })
      .eq("id", postId)
      .select();
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    if (!data || data.length === 0) {
      return { success: false, error: "Failed to update record." };
    }
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function getSupportMessages() {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteSupportMessage(id: string) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from("support_messages")
      .delete()
      .eq("id", id);
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function getOrders() {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    interface OrderData {
      client_id?: string;
      professional_id?: string;
      [key: string]: unknown;
    }
    interface ProfileSnippet {
      user_id: string;
      full_name?: string | null;
      avatar_url?: string | null;
    }

    const orderList = (data || []) as OrderData[];
    const userIds = [...new Set([
      ...orderList.map((o) => o.client_id),
      ...orderList.map((o) => o.professional_id)
    ])].filter((id): id is string => Boolean(id));
    let profiles: ProfileSnippet[] = [];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      if (profilesData) profiles = profilesData;
    }
    const enrichedOrders = orderList.map((order) => ({
      ...order,
      client: profiles.find(p => p.user_id === order.client_id) || null,
      professional: profiles.find(p => p.user_id === order.professional_id) || null
    }));
    return { success: true, data: enrichedOrders };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function getJobApplicationsForAdmin(jobId: string) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data: appsData, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) {
      return { success: false, error: "Database error occurred." };
    }
    if (!appsData || appsData.length === 0) {
      return { success: true, data: [] };
    }
    interface ApplicationData {
      applicant_id: string;
      [key: string]: unknown;
    }
    interface ProfileSnippet {
      user_id: string;
      full_name?: string | null;
      avatar_url?: string | null;
    }

    const appList = appsData as ApplicationData[];
    const applicantIds = [...new Set(appList.map((a) => a.applicant_id))];
    let profiles: ProfileSnippet[] = [];
    if (applicantIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", applicantIds);
      if (profilesData) profiles = profilesData;
    }
    const enrichedApps = appList.map((app) => ({
      ...app,
      applicant: profiles.find(p => p.user_id === app.applicant_id) || null
    }));
    return { success: true, data: enrichedApps };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function createCategory(data: Record<string, unknown>) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("categories").insert([data]).select().single();
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true, data: result };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("categories").update(data).eq("id", id);
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function createSubcategory(data: Record<string, unknown>) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("subcategories").insert([data]).select().single();
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true, data: result };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateSubcategory(id: string, data: Record<string, unknown>) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("subcategories").update(data).eq("id", id);
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteSubcategoryAction(id: string) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

function extractStoragePath(pathOrUrl: string, bucket = "kyc-documents"): string {
  if (!pathOrUrl) return "";
  let trimmed = pathOrUrl.trim().split("?")[0];
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const pathname = url.pathname;
      const marker = `/${bucket}/`;
      const idx = pathname.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(pathname.substring(idx + marker.length));
      }
      return decodeURIComponent(pathname.split("/").pop() || "");
    } catch {
      return decodeURIComponent(trimmed.split("/").pop() || "");
    }
  }
  if (trimmed.startsWith(`${bucket}/`)) {
    trimmed = trimmed.substring(`${bucket}/`.length);
  } else if (trimmed.startsWith(`/${bucket}/`)) {
    trimmed = trimmed.substring(`/${bucket}/`.length);
  }
  return decodeURIComponent(trimmed);
}

export async function getKycSignedUrl(pathOrUrl: string) {
  try {
    await requireAdmin();
    if (!pathOrUrl) return { success: false, error: "No URL provided" };

    const filePath = extractStoragePath(pathOrUrl, "kyc-documents");
    if (!filePath) return { success: false, error: "Invalid path" };

    const supabase = getAdminSupabase();
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      return { success: false, error: "Failed to generate signed URL" };
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function getKycSignedUrls(pathsOrUrls: { front?: string | null; back?: string | null }) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    let frontSignedUrl: string | null = null;
    let backSignedUrl: string | null = null;

    if (pathsOrUrls.front) {
      const filePath = extractStoragePath(pathsOrUrls.front, "kyc-documents");
      if (filePath) {
        const { data } = await supabase.storage.from("kyc-documents").createSignedUrl(filePath, 3600);
        frontSignedUrl = data?.signedUrl || null;
      }
    }

    if (pathsOrUrls.back) {
      const filePath = extractStoragePath(pathsOrUrls.back, "kyc-documents");
      if (filePath) {
        const { data } = await supabase.storage.from("kyc-documents").createSignedUrl(filePath, 3600);
        backSignedUrl = data?.signedUrl || null;
      }
    }

    return { success: true, frontSignedUrl, backSignedUrl };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}
