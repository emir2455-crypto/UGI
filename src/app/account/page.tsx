import { getSession } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AccountPage() {
  const user = await getSession();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Mon compte</h1>
      {user && (
        <p className="text-sm text-zinc-400">
          {user.name} · {user.email} · {user.role === "ADMIN" ? "Administrateur" : "Renfort"}
        </p>
      )}
      <ChangePasswordForm />
    </div>
  );
}
