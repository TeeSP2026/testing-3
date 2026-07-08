import { createClient } from "@/lib/supabase/server";
import { Reward } from "@/lib/types";
import RewardsClient from "./RewardsClient";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const supabase = await createClient();
  const { data: rewards } = await supabase.from("rewards").select("*").order("points_required");

  return <RewardsClient initialRewards={(rewards as Reward[]) ?? []} />;
}
