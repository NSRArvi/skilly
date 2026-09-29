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
    const userIds = [...new Set([
      ...(data || []).map((o: any) => o.client_id),
      ...(data || []).map((o: any) => o.professional_id)
    ])].filter(Boolean);
    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      if (profilesData) profiles = profilesData;
    }
    const enrichedOrders = (data || []).map((order: any) => ({
      ...order,
      client: profiles.find(p => p.user_id === order.client_id) || null,
      professional: profiles.find(p => p.user_id === order.professional_id) || null
    }));
    return { success: true, data: enrichedOrders };
  } catch (err) {
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
    const applicantIds = [...new Set(appsData.map((a: any) => a.applicant_id))];
    let profiles: any[] = [];
    if (applicantIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", applicantIds);
      if (profilesData) profiles = profilesData;
    }
    const enrichedApps = appsData.map((app: any) => ({
      ...app,
      applicant: profiles.find(p => p.user_id === app.applicant_id) || null
    }));
    return { success: true, data: enrichedApps };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function createCategory(data: any) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("categories").insert([data]).select().single();
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("categories").update(data).eq("id", id);
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true };
  } catch (err) {
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
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function createSubcategory(data: any) {
  try {
    await requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("subcategories").insert([data]).select().single();
    if (error) return { success: false, error: "Database error occurred." };
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateSubcategory(id: string, data: any) {
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
