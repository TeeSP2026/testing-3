import { createClient } from "@/lib/supabase/server";
import { PointTransactionWithMember } from "@/lib/types";
import SalesClient from "./SalesClient";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const supabase = await createClient();

  const [{ data: transactions }, { data: members }] = await Promise.all([
    supabase
      .from("point_transactions")
      .select("*, members(id, full_name, member_id)")
      .order("transaction_date", { ascending: false }),
    supabase.from("members").select("id, member_id, full_name").order("full_name"),
  ]);

  return (
    <SalesClient
      initialTransactions={(transactions as PointTransactionWithMember[]) ?? []}
      members={members ?? []}
    />
  );
}
