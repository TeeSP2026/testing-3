import { SupabaseClient } from "@supabase/supabase-js";

export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: {
    action: string;
    target_table: string;
    target_id?: string | null;
    performed_by?: string;
    before_state?: unknown;
    after_state?: unknown;
  },
) {
  await supabase.from("audit_logs").insert({
    action: entry.action,
    target_table: entry.target_table,
    target_id: entry.target_id ?? null,
    performed_by: entry.performed_by ?? "Staff",
    before_state: entry.before_state ?? null,
    after_state: entry.after_state ?? null,
  });
}
