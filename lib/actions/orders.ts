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

export async function incrementProfessionalOrderCount(professionalId: string) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // TODO: This uses read-modify-write which has a potential race condition.
    // Consider replacing this with an atomic update via Supabase RPC in the future:
    // .rpc('increment_orders_count', { p_user_id: professionalId })
    const supabase = getAdminSupabase();
    const { data: prof, error: profError } = await supabase
      .from("professionals")
      .select("orders_count")
      .eq("user_id", professionalId)
      .single();
      
    if (profError) {
      return { success: false, error: "Failed to read professional record." };
    }
    
    const { error: updateError } = await supabase
      .from("professionals")
      .update({ orders_count: (prof.orders_count || 0) + 1 })
      .eq("user_id", professionalId);
      
    if (updateError) {
      return { success: false, error: "Failed to update professional record." };
    }
    
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}
