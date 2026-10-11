import { createClient } from "@/lib/server";

export async function getProfessional(id: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("professionals")
      .select("*, categories(name), subcategories(name)")
      .or(`id.eq.${id},user_id.eq.${id}`)
      .limit(1);

    if (!data || data.length === 0) return null;
    return data[0];
  } catch (err) {
    console.error("Error fetching professional for metadata:", err);
    return null;
  }
}

