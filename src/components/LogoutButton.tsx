"use client";

import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={compact ? "text-sm text-zinc-400 px-2 py-1" : "btn btn-secondary w-full"}
      >
        {compact ? "Déconnexion" : "🚪 Déconnexion"}
      </button>
    </form>
  );
}
