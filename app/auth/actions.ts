"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
  pendingConfirmation?: boolean;
  email?: string;
};

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: null, pendingConfirmation: true, email };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const username = String(formData.get("username") || "").trim();

  if (!email || !password || !username) {
    return { error: "Username, email, and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return { error: "Username must be 3-20 characters (letters, numbers, underscore)." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    return { error: error.message };
  }

  // Projects with "Confirm email" enabled (the default) don't return a
  // session until the user clicks the link in their inbox.
  if (!data.session) {
    return { error: null, pendingConfirmation: true, email };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function resendConfirmation(email: string): Promise<AuthState> {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) {
    return { error: error.message };
  }
  return { error: null, pendingConfirmation: true, email };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
