import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/csv";
import { writeAuditLog } from "@/lib/audit";

function findColumn(headers: string[], keywords: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
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
  return `${century + yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const csvText = body?.csv as string | undefined;
  if (!csvText || !csvText.trim()) {
    return NextResponse.json({ error: "CSV content is required." }, { status: 400 });
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return NextResponse.json({ error: "CSV has no data rows." }, { status: 400 });
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const col = {
    name: findColumn(headers, ["name", "姓名", "nama penuh"]),
    nickname: findColumn(headers, ["nickname", "花名", "panggilan"]),
    phone: findColumn(headers, ["phone", "电话", "telefon"]),
    ic: findColumn(headers, ["ic number", "mykad", "身份证", "pengenalan"]),
    dob: findColumn(headers, ["birth", "生日", "lahir"]),
    address: findColumn(headers, ["address", "地址", "alamat"]),
    state: findColumn(headers, ["state", "州属", "negeri"]),
    town: findColumn(headers, ["town", "area", "城镇", "bandar", "kawasan"]),
    referredBy: findColumn(headers, ["referred", "介绍人", "dirujuk"]),
    consent: findColumn(headers, ["consent", "同意", "persetujuan"]),
  };

  if (col.name === -1 || col.phone === -1) {
    return NextResponse.json(
      { error: "Could not find Name / Phone columns in the CSV header row." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data: existingMembers } = await supabase
    .from("members")
    .select("member_id, mobile_number, ic_number");

  const existingPhones = new Set((existingMembers ?? []).map((m) => m.mobile_number).filter(Boolean));
  const existingIcs = new Set((existingMembers ?? []).map((m) => m.ic_number).filter(Boolean));
  let lastNum = (existingMembers ?? []).reduce((max, m) => {
    const n = parseInt((m.member_id || "MBR-00000").replace("MBR-", ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of dataRows) {
    const fullName = (row[col.name] || "").trim();
    const phone = (row[col.phone] || "").trim();
    const ic = col.ic !== -1 ? (row[col.ic] || "").trim() : "";

    if (!fullName || !phone) {
      skipped++;
      continue;
    }
    if (existingPhones.has(phone) || (ic && existingIcs.has(ic))) {
      skipped++;
      continue;
    }

    lastNum += 1;
    const memberId = `MBR-${String(lastNum).padStart(5, "0")}`;
    const dobRaw = col.dob !== -1 ? (row[col.dob] || "").trim() : "";
    const dob = dobRaw || (ic ? dobFromIc(ic) : null);
    const consentRaw = col.consent !== -1 ? (row[col.consent] || "").trim() : "";

    const { error } = await supabase.from("members").insert({
      member_id: memberId,
      full_name: fullName,
      nickname: col.nickname !== -1 ? (row[col.nickname] || null) : null,
      mobile_number: phone,
      ic_number: ic || null,
      date_of_birth: dob,
      address: col.address !== -1 ? (row[col.address] || null) : null,
      state: col.state !== -1 ? (row[col.state] || null) : null,
      town_area: col.town !== -1 ? (row[col.town] || null) : null,
      referred_by: col.referredBy !== -1 ? (row[col.referredBy] || null) : null,
      consent: consentRaw.length > 0,
      registration_date: new Date().toISOString().slice(0, 10),
      current_points_balance: 0,
      annual_spend: 0,
      status: "Pending",
    });

    if (error) {
      errors.push(`${fullName}: ${error.message}`);
      lastNum -= 1;
      continue;
    }

    existingPhones.add(phone);
    if (ic) existingIcs.add(ic);
    imported++;
  }

  await writeAuditLog(supabase, {
    action: "IMPORT_MEMBERS_CSV",
    target_table: "members",
    performed_by: "Staff",
    after_state: { imported, skipped, errors: errors.length },
  });

  return NextResponse.json({ imported, skipped, total: dataRows.length, errors });
}
