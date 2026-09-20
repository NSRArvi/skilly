"use server";

import { createClient } from "@supabase/supabase-js";

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

export async function incrementProfessionalOrderCount(professionalId) {
  const supabase = getAdminSupabase();
  
  const { data: prof, error: profError } = await supabase
    .from("professionals")
    .select("orders_count")
    .eq("user_id", professionalId)
    .single();

  if (profError) {
    return { success: false, error: profError.message };
  }

  const { error: updateError } = await supabase
    .from("professionals")
    .update({ orders_count: (prof.orders_count || 0) + 1 })
    .eq("user_id", professionalId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
