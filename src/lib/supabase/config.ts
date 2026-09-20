const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase authentication is not configured for this environment.");
    this.name = "SupabaseConfigurationError";
  }
}

export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabasePublishableKey || supabasePublishableKey.startsWith("replace-with-")) return false;
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigurationError();
  }

  return { url: supabaseUrl!, publishableKey: supabasePublishableKey! };
}
