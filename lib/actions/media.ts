"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/server";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function extractStoragePath(pathOrUrl: string, bucket: string): string {
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

/**
 * Uploads avatar or cover image to the public 'avatars' bucket.
 */
export async function uploadProfileMedia(formData: FormData) {
  try {
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "avatar" | "cover" | null;

    if (!file || !type || (type !== "avatar" && type !== "cover")) {
      return { success: false, error: "Invalid file or media type." };
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit." };
    }

    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMime.includes(file.type)) {
      return {
        success: false,
        error: "Only JPG, PNG, WEBP, and GIF images are allowed.",
      };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${user.id}-${type}-${Date.now()}.${cleanExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getAdminSupabase();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: "Failed to upload file to storage." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    const updatePayload =
      type === "avatar"
        ? { avatar_url: publicUrl }
        : { cover_image_url: publicUrl };

    // Update or insert into professionals table
    const { error: dbError } = await supabase.from("professionals").upsert(
      {
        user_id: user.id,
        full_name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Professional",
        email: user.email || "",
        ...updatePayload,
      },
      { onConflict: "user_id" }
    );

    if (dbError) {
      return { success: false, error: "Failed to update profile record." };
    }

    return { success: true, publicUrl };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Uploads a service cover/card image to the public 'avatars' (or service media) bucket.
 */
export async function uploadServiceImage(formData: FormData) {
  try {
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit." };
    }

    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMime.includes(file.type)) {
      return {
        success: false,
        error: "Only JPG, PNG, WEBP, and GIF images are allowed.",
      };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `service-${user.id}-${Date.now()}.${cleanExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getAdminSupabase();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: "Failed to upload service image to storage." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    return { success: true, publicUrl };
  } catch {
    return { success: false, error: "An unexpected error occurred during image upload." };
  }
}


/**
 * Uploads a KYC identification document to the private 'kyc-documents' bucket.
 */
export async function uploadKycDocument(formData: FormData) {
  try {
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const file = formData.get("file") as File | null;
    const side = formData.get("side") as "front" | "back" | null;
    const idType = (formData.get("idType") as string) || "nid";

    if (!file || !side || (side !== "front" && side !== "back")) {
      return { success: false, error: "Invalid file or document side." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size exceeds 10MB limit." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${user.id}-${side}-${Date.now()}.${cleanExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getAdminSupabase();
    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(fileName, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: "Failed to upload document to secure storage." };
    }

    // Canonical permanent URL for storing in database
    const {
      data: { publicUrl: storageUrl },
    } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

    // Secure temporary signed URL for client preview
    const { data: signData } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(fileName, 3600);

    const previewUrl = signData?.signedUrl || null;

    const columnToUpdate = side === "front" ? "id_front_url" : "id_back_url";

    const { error: dbError } = await supabase.from("professionals").upsert(
      {
        user_id: user.id,
        full_name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Professional",
        email: user.email || "",
        [columnToUpdate]: storageUrl,
        id_type: idType,
      },
      { onConflict: "user_id" }
    );

    if (dbError) {
      return { success: false, error: "Uploaded document, but failed to link to profile." };
    }

    return {
      success: true,
      previewUrl,
      storageUrl,
      fileName,
    };
  } catch {
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Returns temporary signed URLs for the current logged-in user's KYC documents.
 */
export async function getMyKycSignedUrls() {
  try {
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = getAdminSupabase();
    const { data: prof, error: profError } = await supabase
      .from("professionals")
      .select("id_front_url, id_back_url, is_verified, id_type")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profError || !prof) {
      return { success: true, frontSignedUrl: null, backSignedUrl: null, isVerified: false };
    }

    let frontSignedUrl: string | null = null;
    let backSignedUrl: string | null = null;

    if (prof.id_front_url) {
      const frontPath = extractStoragePath(prof.id_front_url, "kyc-documents");
      if (frontPath) {
        const { data } = await supabase.storage
          .from("kyc-documents")
          .createSignedUrl(frontPath, 3600);
        frontSignedUrl = data?.signedUrl || null;
      }
    }

    if (prof.id_back_url) {
      const backPath = extractStoragePath(prof.id_back_url, "kyc-documents");
      if (backPath) {
        const { data } = await supabase.storage
          .from("kyc-documents")
          .createSignedUrl(backPath, 3600);
        backSignedUrl = data?.signedUrl || null;
      }
    }

    return {
      success: true,
      frontSignedUrl,
      backSignedUrl,
      rawFrontUrl: prof.id_front_url,
      rawBackUrl: prof.id_back_url,
      isVerified: Boolean(prof.is_verified),
      idType: prof.id_type || "nid",
    };
  } catch {
    return { success: false, error: "An error occurred." };
  }
}

