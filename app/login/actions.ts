"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Please enter both email/username and password." };
  }

  const supabase = await createClient();
  const loginEmail = email.includes("@") ? email : `${email}@maplantation.local`;

  const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
  if (error) {
    return { error: "Invalid login credentials." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
