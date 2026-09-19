"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize standard Supabase client (using service role to bypass RLS if needed, 
// though our RLS policy allows anon inserts, so standard client is fine).
// Note: We use the environment variables directly in server actions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Basic list of irrelevant/spam/profane words to block
const BANNED_WORDS = [
  "crypto", "bitcoin", "eth", "nft", 
  "viagra", "cialis", 
  "buy followers", "buy likes", "seo services",
  "fuck", "shit", "bitch", "asshole", "dick", "cunt",
  "slut", "whore", "faggot", "nigger"
];

export async function submitSupportMessage(formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const title = formData.get("title");
    const message = formData.get("message");
    
    // 1. Honeypot check
    // If the hidden 'website' field is filled, it's a bot.
    const website = formData.get("website");
    if (website && website.trim() !== "") {
      // Pretend it succeeded to confuse the bot
      return { success: true, message: "Message sent successfully!" };
    }

    if (!name || !email || !title || !message) {
      return { success: false, error: "All fields are required." };
    }

    // 2. Profanity and Spam Filter
    const contentToCheck = `${title} ${message}`.toLowerCase();
    const containsBannedWord = BANNED_WORDS.some(word => contentToCheck.includes(word.toLowerCase()));
    
    if (containsBannedWord) {
      return { 
        success: false, 
        error: "Your message contains inappropriate language or spam keywords and cannot be submitted." 
      };
    }

    // 3. Insert into Supabase
    const { error } = await supabase
      .from("support_messages")
      .insert({
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        message: message.trim()
      });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: "Failed to send message. Please try again later." };
    }

    return { success: true, message: "Your message has been sent successfully! Our team will get back to you soon." };

  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
