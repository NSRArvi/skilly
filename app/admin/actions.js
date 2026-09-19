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
  const supabase = await getAdminSupabase();
  
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
