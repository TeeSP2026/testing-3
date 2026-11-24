"use server";

import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export interface RegistrationInput {
  full_name: string;
  nickname: string;
  mobile_number: string;
  ic_number: string;
  date_of_birth: string;
  address: string;
  state: string;
  town_area: string;
  referred_by: string;
  consent: boolean;
}

function dobFromIc(ic: string): string | null {
  const digits = ic.replace(/[^0-9]/g, "");
  if (digits.length < 6) return null;
  const yy = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const dd = parseInt(digits.slice(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const currentYY = new Date().getFullYear() % 100;
  const century = yy > currentYY ? 1900 : 2000;
  const year = century + yy;
  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export async function submitRegistration(input: RegistrationInput) {
  if (!input.full_name.trim()) throw new Error("Name is required.");
  if (!input.mobile_number.trim()) throw new Error("Phone number is required.");
  if (!input.consent) throw new Error("Consent is required.");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("members")
    .select("member_id")
    .order("member_id", { ascending: false })
    .limit(1);
  const lastNum = existing?.[0]?.member_id
    ? parseInt(existing[0].member_id.replace("MBR-", ""), 10)
    : 0;
  const memberId = `MBR-${String(lastNum + 1).padStart(5, "0")}`;

  const dob = input.date_of_birth || (input.ic_number ? dobFromIc(input.ic_number) : null);

  const { data, error } = await supabase
    .from("members")
    .insert({
      member_id: memberId,
      full_name: input.full_name.trim(),
      nickname: input.nickname || null,
      mobile_number: input.mobile_number.trim(),
      ic_number: input.ic_number || null,
      date_of_birth: dob,
      address: input.address || null,
      state: input.state || null,
      town_area: input.town_area || null,
      referred_by: input.referred_by || null,
      consent: input.consent,
      registration_date: new Date().toISOString().slice(0, 10),
      current_points_balance: 0,
      annual_spend: 0,
      status: "Pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAuditLog(supabase, {
    action: "SELF_REGISTER",
    target_table: "members",
    target_id: data.id,
    performed_by: "Public Form",
    after_state: data,
  });

  return data;
}
