"use server";

import { createClient } from "@supabase/supabase-js";

// Create a Supabase client that bypasses RLS using the Service Role Key
// We use the standard supabase-js client without cookies so it doesn't adopt the user's restricted RLS context
function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function toggleProfessionalVerification(userId, newStatus) {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from("professionals")
    .update({ is_verified: newStatus })
    .eq("id", userId)
    .select();

  if (error) {
    return { success: false, error: error.message };
  }
  
  if (!data || data.length === 0) {
    return { success: false, error: "Row Level Security (RLS) blocked the update. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS." };
  }

  return { success: true, data: data[0] };
}

export async function toggleJobVerification(jobId, newStatus) {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from("jobs")
    .update({ is_verified: newStatus })
    .eq("id", jobId)
    .select();

  if (error) {
    return { success: false, error: error.message };
  }
  
  if (!data || data.length === 0) {
    return { success: false, error: "Row Level Security (RLS) blocked the update. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS." };
  }

  return { success: true, data: data[0] };
}

export async function togglePostArchive(postId, newStatus) {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from("community_posts")
    .update({ is_archived: newStatus })
    .eq("id", postId)
    .select();

  if (error) {
    return { success: false, error: error.message };
  }
  
  if (!data || data.length === 0) {
    return { success: false, error: "Row Level Security (RLS) blocked the update. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS." };
  }

  return { success: true, data: data[0] };
}

export async function getSupportMessages() {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}

export async function deleteSupportMessage(id) {
  const supabase = getAdminSupabase();
  
  const { error } = await supabase
    .from("support_messages")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getOrders() {
  const supabase = getAdminSupabase();
  
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  // Also fetch profiles for client and professional
  const userIds = [...new Set([
    ...(data || []).map(o => o.client_id),
    ...(data || []).map(o => o.professional_id)
  ])].filter(Boolean);

  let profiles = [];
  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("professionals")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);
    if (profilesData) profiles = profilesData;
  }

  const enrichedOrders = (data || []).map(order => ({
    ...order,
    client: profiles.find(p => p.user_id === order.client_id) || null,
    professional: profiles.find(p => p.user_id === order.professional_id) || null
  }));

  return { success: true, data: enrichedOrders };
}

export async function getJobApplicationsForAdmin(jobId) {
  const supabase = getAdminSupabase();
  
  const { data: appsData, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!appsData || appsData.length === 0) {
    return { success: true, data: [] };
  }

  const applicantIds = [...new Set(appsData.map(a => a.applicant_id))];
  
  let profiles = [];
  if (applicantIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("professionals")
      .select("user_id, full_name, avatar_url")
      .in("user_id", applicantIds);
    if (profilesData) profiles = profilesData;
  }

  const enrichedApps = appsData.map(app => ({
    ...app,
    applicant: profiles.find(p => p.user_id === app.applicant_id) || null
  }));

  return { success: true, data: enrichedApps };
}

// Categories Admin Actions
export async function createCategory(data) {
  const supabase = getAdminSupabase();
  const { data: result, error } = await supabase.from("categories").insert([data]).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: result };
}

export async function updateCategory(id, data) {
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteCategoryAction(id) {
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createSubcategory(data) {
  const supabase = getAdminSupabase();
  const { data: result, error } = await supabase.from("subcategories").insert([data]).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: result };
}

export async function updateSubcategory(id, data) {
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("subcategories").update(data).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteSubcategoryAction(id) {
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
