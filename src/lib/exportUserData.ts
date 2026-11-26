import { supabase } from "@/integrations/supabase/client";

/** Tables a user's export includes; everything account deletion removes that the user can read. */
export const EXPORT_TABLES = ["goals", "activity_logs", "pain_reports", "cost_tracking", "chat_messages"] as const;

/**
 * Downloads the signed-in user's data as JSON. Every plan can call this: Settings offers it
 * to Premium, and the delete-account dialog offers it to everyone before they delete
 * (Privacy page, "Your Choices"). Throws if any read fails so a partial file is never saved.
 */
export async function exportUserData(userId: string): Promise<void> {
  const [profile, ...rows] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    ...EXPORT_TABLES.map((t) => supabase.from(t).select("*").eq("user_id", userId)),
  ]);
  const failed = [profile, ...rows].find((r) => r.error);
  if (failed?.error) throw failed.error;

  const data: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: profile.data,
  };
  EXPORT_TABLES.forEach((t, i) => {
    data[t] = rows[i].data || [];
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `momentum-data-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
