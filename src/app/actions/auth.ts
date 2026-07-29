"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession, findUserByEmail } from "@/lib/auth";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  const user = await findUserByEmail(email);
  if (!user) return { error: "Identifiants invalides." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Identifiants invalides." };

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "HELPER",
  });

  redirect(next && next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
