"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Check if email is already registered
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", data.email)
    .single();

  if (existing) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("An account with this email already exists. Please sign in instead.")}`
    );
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/auth/setup-profile");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function setupScreenName(formData: FormData) {
  const supabase = await createClient();
  const screenName = formData.get("screen_name") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if screen_name is already taken
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("screen_name", screenName)
    .single();

  if (existing) {
    redirect(
      `/auth/setup-profile?error=${encodeURIComponent("This screen name is already taken. Please choose another.")}`
    );
  }

  // Update the profile with the screen_name
  const { error } = await supabase
    .from("profiles")
    .update({ screen_name: screenName })
    .eq("id", user.id);

  if (error) {
    redirect(
      `/auth/setup-profile?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}
